import { pool } from './database.js';

// --- USERS ---

export const getUsers = async (limit = 20, offset = 0) => {
  const query = 'SELECT * FROM users ORDER BY id LIMIT $1 OFFSET $2';
  const result = await pool.query(query, [limit, offset]);
  return result.rows;
};

export const getUserById = async (id) => {
  const query = 'SELECT * FROM users WHERE id = $1';
  const result = await pool.query(query, [id]);
  return result.rows[0];
};

export const getUsersCount = async () => {
  const query = `SELECT COUNT(*) FROM users`;
  const result = await pool.query(query);
  return parseInt(result.rows[0].count, 10);
};

export const getUsersCreatedPerDay = async () => {
  const query = `
    SELECT
      DATE(created_at) AS date,
      COUNT(*) AS count
    FROM users
    WHERE created_at >= CURRENT_DATE - INTERVAL '30 days'
    GROUP BY DATE(created_at)
    ORDER BY date
  `;
  const result = await pool.query(query);
  return result.rows; // [{date: '2025-05-01', count: '5'}, ...]
};

export const createUser = async ({ name, password, role, skills, avatar }) => {
  const query = `
    INSERT INTO users (name, password, role, skills, avatar, created_at)
    VALUES ($1, $2, $3, $4, $5, NOW())
    RETURNING *`;
  const values = [name, password, role, skills, avatar];
  const result = await pool.query(query, values);
  return result.rows[0];
};

export const updateUser = async (id, fields) => {
  if (Object.keys(fields).length === 0) return null;

  const setString = Object.keys(fields)
    .map((key, idx) => `${key} = $${idx + 2}`)
    .join(', ');
  const values = [id, ...Object.values(fields)];
  const query = `UPDATE users SET ${setString} WHERE id = $1 RETURNING *`;
  const result = await pool.query(query, values);
  return result.rows[0];
};

export const deleteUser = async (id) => {
  const query = 'DELETE FROM users WHERE id = $1';
  await pool.query(query, [id]);
};

// --- PROJECTS ---

export const getProjects = async (filter = {}, limit = 20, offset = 0) => {
  // filter может содержать status и client_id для фильтрации
  let baseQuery = 'SELECT * FROM projects';
  const conditions = [];
  const values = [];
  let idx = 1;

  if (filter.status) {
    conditions.push(`status = $${idx++}`);
    values.push(filter.status);
  }
  if (filter.client_id) {
    conditions.push(`client_id = $${idx++}`);
    values.push(filter.client_id);
  }

  if (conditions.length) {
    baseQuery += ' WHERE ' + conditions.join(' AND ');
  }

  baseQuery += ` ORDER BY id LIMIT $${idx++} OFFSET $${idx++}`;
  values.push(limit, offset);

  const result = await pool.query(baseQuery, values);
  return result.rows;
};

export const getProjectsCount = async () => {
  const query = `SELECT COUNT(*) FROM projects`;
  const result = await pool.query(query);
  return parseInt(result.rows[0].count, 10);
};

export const getProjectsCreatedPerDay = async () => {
  const query = `
    SELECT
      DATE(created_at) AS date,
      COUNT(*) AS count
    FROM projects
    WHERE created_at >= CURRENT_DATE - INTERVAL '30 days'
    GROUP BY DATE(created_at)
    ORDER BY date
  `;
  const result = await pool.query(query);
  return result.rows;
};

export const getProjectById = async (id) => {
  const query = 'SELECT * FROM projects WHERE id = $1';
  const result = await pool.query(query, [id]);
  return result.rows[0];
};

export const createProject = async ({ title, description, status, media, client_id, accepting_bids }) => {
  const query = `
    INSERT INTO projects 
      (title, description, status, media, client_id, accepting_bids, created_at)
    VALUES ($1, $2, $3, $4, $5, $6, NOW())
    RETURNING *`;
  const values = [title, description, status, media, client_id, accepting_bids];
  const result = await pool.query(query, values);
  return result.rows[0];
};

export const updateProject = async (id, fields) => {
  if (Object.keys(fields).length === 0) return null;

  const setString = Object.keys(fields)
    .map((key, idx) => `${key} = $${idx + 2}`)
    .join(', ');
  const values = [id, ...Object.values(fields)];
  const query = `UPDATE projects SET ${setString} WHERE id = $1 RETURNING *`;
  const result = await pool.query(query, values);
  return result.rows[0];
};

export const deleteProject = async (id) => {
  const query = 'DELETE FROM projects WHERE id = $1';
  await pool.query(query, [id]);
};

// --- ADMIN LOGS ---

// Получить все логи админов с пагинацией
export const getAdminLogs = async (limit = 50, offset = 0) => {
  const query = `
    SELECT al.*, u.name AS admin_name
    FROM admin_logs al
    LEFT JOIN users u ON al.admin_id = u.id
    ORDER BY al.timestamp DESC
    LIMIT $1 OFFSET $2
  `;
  const result = await pool.query(query, [limit, offset]);
  return result.rows;
};

// Создать новый лог действия админа
export const createAdminLog = async ({ admin_id, action, ip_address }) => {
  const query = `
    INSERT INTO admin_logs (admin_id, action, timestamp, ip_address)
    VALUES ($1, $2, NOW(), $3)
    RETURNING *
  `;
  const values = [admin_id, action, ip_address];
  const result = await pool.query(query, values);
  return result.rows[0];
};

// --- MESSAGES ---

export const getMessagesCount = async () => {
  const query = `SELECT COUNT(*) FROM messages`;
  const result = await pool.query(query);
  return parseInt(result.rows[0].count, 10);
};

export const getMessagesPerDay = async () => {
  const query = `
    SELECT
      DATE(created_at) AS date,
      COUNT(*) AS count
    FROM messages
    WHERE created_at >= CURRENT_DATE - INTERVAL '30 days'
    GROUP BY DATE(created_at)
    ORDER BY date
  `;
  const result = await pool.query(query);
  return result.rows;
};

// --- BIDS ---

export const getBidsCount = async () => {
  const query = `SELECT COUNT(*) FROM bids`;
  const result = await pool.query(query);
  return parseInt(result.rows[0].count, 10);
};

export const getBidsPerDay = async () => {
  const query = `
    SELECT
      DATE(created_at) AS date,
      COUNT(*) AS count
    FROM bids
    WHERE created_at >= CURRENT_DATE - INTERVAL '30 days'
    GROUP BY DATE(created_at)
    ORDER BY date
  `;
  const result = await pool.query(query);
  return result.rows;
};