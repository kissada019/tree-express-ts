import { Pool } from 'pg';

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT || 5432),
  user: process.env.DB_USER || 'myuser',
  password: process.env.DB_PASSWORD || '1234',
  database: process.env.DB_NAME || 'treedb',
});

// const pool = new Pool({
//   host: process.env.DB_HOST || 'nozomi.proxy.rlwy.net',
//   port: Number(process.env.DB_PORT || 21804),
//   user: process.env.DB_USER || 'postgres',  // Railway ใช้ postgres เป็น default user
//   password: process.env.DB_PASSWORD || 'kXgDtMesNZTNrcotDAJGTnIeqwIjVnzG',
//   database: process.env.DB_NAME || 'treedb',
// });

export default pool;
