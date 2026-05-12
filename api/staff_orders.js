import db from './db.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const all_statuses = ['Pending','Received','Preparing','Ready for Pickup','Out for Delivery','Completed','Cancelled'];
  const filter = req.query.filter || 'active';

  try {
    if (req.query.stats !== undefined) {
      const [[active]] = await db.query("SELECT COUNT(*) as c FROM orders WHERE status NOT IN ('Completed','Cancelled')");
      const [[today]] = await db.query("SELECT COUNT(*) as c FROM orders WHERE DATE(created_at) = CURDATE()");
      const [[completed]] = await db.query("SELECT COUNT(*) as c FROM orders WHERE status = 'Completed'");
      const [[pending]] = await db.query("SELECT COUNT(*) as c FROM orders WHERE status = 'Pending'");
      return res.status(200).json({ stats: { active: active.c, today: today.c, completed: completed.c, pending: pending.c } });
    }

    let sql = "SELECT o.*, (SELECT SUM(quantity) FROM order_items WHERE order_id = o.order_id) as item_count FROM orders o";
    const params = [];
    if (filter === 'active') {
      sql += " WHERE o.status NOT IN ('Completed','Cancelled')";
    } else if (all_statuses.includes(filter)) {
      sql += " WHERE o.status = ?";
      params.push(filter);
    }
    sql += " ORDER BY o.created_at DESC";

    const [orders] = await db.query(sql, params);
    res.status(200).json({ orders });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}