import db from './db.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const order_id = (req.query.order_id || '').toUpperCase().trim();
  if (!order_id) return res.status(200).json({ exists: false });

  try {
    const [rows] = await db.query("SELECT * FROM reviews WHERE order_id = ?", [order_id]);
    if (rows.length > 0) return res.status(200).json({ exists: true, review: rows[0] });
    res.status(200).json({ exists: false });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}