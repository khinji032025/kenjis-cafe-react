import db from './db.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const all_statuses = ['Pending','Received','Preparing','Ready for Pickup','Out for Delivery','Completed','Cancelled'];
  const { order_id, new_status } = req.body || {};

  if (!order_id || !all_statuses.includes(new_status)) return res.status(400).json({ success: false, message: 'Invalid data' });

  try {
    await db.query("UPDATE orders SET status = ? WHERE order_id = ?", [new_status, order_id]);
    res.status(200).json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}