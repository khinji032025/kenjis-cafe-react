import db from './db.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const all_statuses = ['Pending','Received','Preparing','Ready for Pickup','Out for Delivery','Completed','Cancelled'];
  const filter = req.query.status || '';

  try {
    let sql = 'SELECT * FROM orders';
    const params = [];
    if (filter && all_statuses.includes(filter)) {
      sql += ' WHERE status = ?';
      params.push(filter);
    }
    sql += ' ORDER BY created_at DESC';

    const [orders] = await db.query(sql, params);
    res.status(200).json({ orders });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}