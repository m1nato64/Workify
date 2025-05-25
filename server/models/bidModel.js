// model/bidModel.js
import { pool } from './database.js'; // Подключаем пул соединений

// Создание отклика
export const createBid = async (freelance_id, project_id) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Вставка нового отклика
    const insertQuery = `
      INSERT INTO bids (freelance_id, project_id, status, created_at) 
      VALUES ($1, $2, $3, NOW()) 
      RETURNING *`;
    const values = [freelance_id, project_id, 'pending'];
    const result = await client.query(insertQuery, values);

    // Обновление количества откликов для проекта
    const updateBidsCountQuery = `
      UPDATE projects 
      SET bids_count = bids_count + 1 
      WHERE id = $1`;
    await client.query(updateBidsCountQuery, [project_id]);

    await client.query('COMMIT');
    return result.rows[0];
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};


// Получение откликов для проекта с информацией о фрилансере
export const getBidsForProject = async (projectId) => {
  const query = `
    SELECT 
      bids.id, 
      bids.freelance_id, 
      bids.project_id, 
      bids.status, 
      users.name AS freelancer_name 
    FROM bids AS bids  
    JOIN users ON bids.freelance_id = users.id  
    WHERE bids.project_id = $1`;
  const { rows } = await pool.query(query, [projectId]);
  return rows;
};

// Получение откликов для фрилансера
export const getBidsForFreelancer = async (freelance_id) => {
  const query = 'SELECT * FROM bids WHERE freelance_id = $1';
  const result = await pool.query(query, [freelance_id]); // Используем пул для запроса
  return result.rows;
};

// Обновление статуса отклика
export const updateBidStatus = async (bid_id, status) => {
  const validStatuses = ['pending', 'accepted', 'rejected'];
  if (!validStatuses.includes(status)) {
    throw new Error('Invalid bid status');
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Обновляем статус отклика
    const updateBidQuery = 'UPDATE bids SET status = $1 WHERE id = $2 RETURNING *';
    const bidResult = await client.query(updateBidQuery, [status, bid_id]);
    const bid = bidResult.rows[0];

    if (!bid) {
      throw new Error(`Отклик с id ${bid_id} не найден`);
    }

    // Если отклик принят — меняем статус проекта
    if (status === 'accepted') {
      const projectId = bid.project_id;

      // Проверка на существование проекта
      const projectCheckQuery = 'SELECT 1 FROM projects WHERE id = $1';
      const projectCheckResult = await client.query(projectCheckQuery, [projectId]);
      if (projectCheckResult.rowCount === 0) {
        throw new Error('Проект не найден');
      }

      await client.query('UPDATE projects SET status = $1 WHERE id = $2', ['in_progress', projectId]);
    }

    await client.query('COMMIT');
    return bid;
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Ошибка:', error); // логирование ошибки
    throw error;
  } finally {
    client.release();
  }
};

// Проверка на отклик
export const checkBidExists = async (freelance_id, project_id) => {
  const query = 'SELECT 1 FROM bids WHERE freelance_id = $1 AND project_id = $2 LIMIT 1';
  const result = await pool.query(query, [freelance_id, project_id]);
  return result.rowCount > 0;
};
