// models/projectModel.js
import { pool } from "./database.js";

// Создание проекта
export const createProject = async (
  title,
  description,
  status,
  media,
  client_id
) => {
  try {
    const result = await pool.query(
      "INSERT INTO projects (title, description, status, media, client_id) VALUES ($1, $2, $3, $4, $5) RETURNING *",
      [title, description, status, media, client_id]
    );
    return result.rows[0];
  } catch (err) {
    console.error("Ошибка при создании проекта:", err.message);
    throw err;
  }
};

// Получение всех проектов
export const getAllProjects = async () => {
  try {
    const result = await pool.query(`SELECT * FROM projects`);
    return result.rows;
  } catch (err) {
    console.error("Ошибка при получении списка проектов:", err);
    throw err;
  }
};

// Получение проектов, созданных пользователем по client_id
export const getProjectsByUserId = async (client_id) => {
  try {
    const result = await pool.query(
      `SELECT * FROM projects WHERE client_id = $1`,
      [client_id]
    );
    return result.rows;
  } catch (err) {
    console.error("Ошибка при получении проектов пользователя:", err);
    throw err;
  }
};

// Получение проекта по ID
export const getProjectById = async (id) => {
  try {
    const result = await pool.query(`SELECT * FROM projects WHERE id = $1`, [
      id,
    ]);
    return result.rows[0];
  } catch (err) {
    console.error("Ошибка при получении проекта:", err);
    throw err;
  }
};

// Обновление статуса проекта
export const updateProjectStatus = async (projectId, status) => {
  try {
    const query = "UPDATE projects SET status = $1 WHERE id = $2 RETURNING *";
    const values = [status, projectId];
    const result = await pool.query(query, values);
    return result.rows[0];
  } catch (err) {
    console.error("Ошибка при обновлении статуса проекта:", err.message);
    throw err;
  }
};

// Тогл на принятие откликов
export const toggleBids = async (projectId, accepting) => {
  const query =
    "UPDATE projects SET accepting_bids = $1 WHERE id = $2 RETURNING *";
  const values = [accepting, projectId];
  const result = await pool.query(query, values);
  return result.rows[0];
};

// Удаление проекта
export const deleteProject = async (projectId) => {
  const query = "DELETE FROM projects WHERE id = $1 RETURNING *";
  const result = await pool.query(query, [projectId]);
  return result.rows[0];
};

// Обновление данных проекта
export const updateProject = async (
  projectId,
  title,
  description,
  status,
  media
) => {
  try {
    const query = `
      UPDATE projects 
      SET title = $1, description = $2, status = $3, media = $4 
      WHERE id = $5 
      RETURNING *`;
    const values = [title, description, status, media, projectId];
    const result = await pool.query(query, values);
    return result.rows[0];
  } catch (err) {
    console.error("Ошибка при обновлении проекта:", err.message);
    throw err;
  }
};

export const getFilteredProjects = async ({
  title,
  status,
  sortByBids,
  page = 1,
  limit = 10,
}) => {
  let query = `
    SELECT *
    FROM projects
    WHERE 1=1
  `;

  const params = [];
  let paramIndex = 1;

  if (title) {
    query += ` AND title ILIKE $${paramIndex++}`;
    params.push(`%${title}%`);
  }

  if (status) {
    query += ` AND status = $${paramIndex++}`;
    params.push(status);
  }

  if (sortByBids === "asc") {
    query += ` ORDER BY bids_count ASC`;
  } else if (sortByBids === "desc") {
    query += ` ORDER BY bids_count DESC`;
  } else {
    query += ` ORDER BY created_at DESC`;
  }

  query += ` LIMIT $${paramIndex++} OFFSET $${paramIndex++}`;
  params.push(limit);
  params.push((page - 1) * limit);

  try {
    const result = await pool.query(query, params);
    return result.rows;
  } catch (err) {
    console.error("Ошибка при получении отфильтрованных проектов:", err);
    throw err;
  }
};

export const addProjectView = async (projectId, userId) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Проверяем, был ли просмотр в последние 24 часа
    const { rows } = await client.query(
      `SELECT id FROM project_views
       WHERE project_id = $1 AND user_id = $2 AND viewed_at > NOW() - INTERVAL '24 hours'`,
      [projectId, userId]
    );

    if (rows.length > 0) {
      // Если просмотр был, откатываем и ничего не добавляем
      await client.query('ROLLBACK');
      return false;  // просмотр не добавлен
    }

    // Добавляем просмотр
    await client.query(
      "INSERT INTO project_views (project_id, user_id) VALUES ($1, $2)",
      [projectId, userId]
    );

    // Увеличиваем счётчик просмотров в projects
    await client.query(
      "UPDATE projects SET views_total = views_total + 1 WHERE id = $1",
      [projectId]
    );

    await client.query('COMMIT');
    return true;  // просмотр успешно добавлен
  } catch (err) {
    await client.query('ROLLBACK');
    console.error("Ошибка при добавлении просмотра проекта:", err.message);
    throw err;
  } finally {
    client.release();
  }
};


// Получение количества просмотров проекта
export const getProjectViewsCount = async (projectId) => {
  try {
    const result = await pool.query(
      "SELECT views_total FROM projects WHERE id = $1",
      [projectId]
    );
    return result.rows.length ? result.rows[0].views_total : 0;
  } catch (err) {
    console.error("Ошибка при получении количества просмотров:", err.message);
    throw err;
  }
};