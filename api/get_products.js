import db from './db.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  try {
    const [rows] = await db.query('SELECT * FROM products ORDER BY category, name');
    res.status(200).json(rows);
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}