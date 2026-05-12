import db from './db.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    const [orders] = await db.query("SELECT order_id, customer_name, total_amount, created_at FROM orders WHERE status = 'Pending' ORDER BY created_at DESC");
    res.status(200).json({ new_orders: orders, pending_count: orders.length });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}