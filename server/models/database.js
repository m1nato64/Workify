// server/models/database.js
import pg from 'pg';

const { Pool } = pg;

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'workify',
  password: '17021977k',
  port: 5432,
});

pool.connect()
  .then(() => console.log("🟢 PostgreSQL подключен!"))
  .catch(err => console.error("🔴 Ошибка подключения:", err));

export { pool };
