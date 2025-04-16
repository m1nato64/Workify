import { pool } from './database.js'; // Подключаем пул соединений

// Создание отклика
export const createBid = async (freelance_id, project_id) => {
  const client = await pool.connect(); // Получаем клиент из пула
  try {
    await client.query('BEGIN'); // начинаем транзакцию

    // 1. Добавляем отклик
    const insertQuery = `
      INSERT INTO bids (freelance_id, project_id, status, created_at) 
      VALUES ($1, $2, $3, NOW()) 
      RETURNING *`;
    const values = [freelance_id, project_id, 'pending']; // Статус 'pending'
    const result = await client.query(insertQuery, values);

    // 2. Обновляем статус проекта
    const updateProjectStatusQuery = `
      UPDATE projects SET status = 'in_progress' WHERE id = $1`;
    await client.query(updateProjectStatusQuery, [project_id]);

    await client.query('COMMIT'); // Коммитим транзакцию
    return result.rows[0];
  } catch (error) {
    await client.query('ROLLBACK'); // Откатываем транзакцию в случае ошибки
    throw error;
  } finally {
    client.release(); // Освобождаем клиент обратно в пул
  }
};

// Получение откликов для проекта
export const getBidsForProject = async (project_id) => {
  const query = 'SELECT * FROM bids WHERE project_id = $1';
  const result = await pool.query(query, [project_id]); // Используем пул для запроса
  return result.rows;
};

// Получение откликов для фрилансера
export const getBidsForFreelancer = async (freelance_id) => {
  const query = 'SELECT * FROM bids WHERE freelance_id = $1';
  const result = await pool.query(query, [freelance_id]); // Используем пул для запроса
  return result.rows;
};

// Обновление статуса отклика
export const updateBidStatus = async (bid_id, status) => {
  // Проверяем, что статус — это одно из допустимых значений
  const validStatuses = ['pending', 'accepted', 'rejected'];
  if (!validStatuses.includes(status)) {
    throw new Error('Invalid bid status');
  }

  const query = 'UPDATE bids SET status = $1 WHERE id = $2 RETURNING *';
  const values = [status, bid_id];
  const result = await pool.query(query, values); // Используем пул для запроса
  return result.rows[0];  // Возвращаем обновлённый отклик
};
