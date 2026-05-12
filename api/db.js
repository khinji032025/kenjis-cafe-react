import mysql from 'mysql2/promise';

const db = mysql.createPool({
  host: 'sql308.infinityfree.com',
  user: 'if0_41889752',
  password: 'kenjikenji2005',
  database: 'if0_41889752_kenji_cafe',
  waitForConnections: true,
  connectionLimit: 10,
});

export default db;