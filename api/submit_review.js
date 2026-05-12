import db from './db.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ success: false, message: 'Invalid method' });

  const { order_id, rating, comment } = req.body;
  if (!order_id || !rating || rating < 1 || rating > 5) return res.status(400).json({ success: false, message: 'Invalid data' });

  try {
    const [orders] = await db.query("SELECT * FROM orders WHERE order_id = ? AND status = 'Completed'", [order_id.toUpperCase()]);
    if (!orders.length) return res.status(400).json({ success: false, message: 'Only completed orders can be reviewed.' });

    const [existing] = await db.query("SELECT id FROM reviews WHERE order_id = ?", [order_id.toUpperCase()]);
    if (existing.length > 0) return res.status(400).json({ success: false, message: 'You have already reviewed this order.' });

    await db.query("INSERT INTO reviews (order_id, customer_name, rating, comment) VALUES (?,?,?,?)", [order_id.toUpperCase(), orders[0].customer_name, rating, comment || '']);
    res.status(200).json({ success: true, message: 'Thank you for your review!' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}