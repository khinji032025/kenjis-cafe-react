import db from './db.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const endpoint = req.query.endpoint;
  const all_statuses = ['Pending','Received','Preparing','Ready for Pickup','Out for Delivery','Completed','Cancelled'];

  try {
    // CHECK NEW ORDERS
    if (endpoint === 'check_new_orders') {
      const [orders] = await db.query("SELECT order_id, customer_name, total_amount, created_at FROM orders WHERE status = 'Pending' ORDER BY created_at DESC");
      return res.status(200).json({ new_orders: orders, pending_count: orders.length });
    }

    // UPDATE STATUS
    if (endpoint === 'update_status') {
      const { order_id, new_status } = req.body || {};
      if (!order_id || !all_statuses.includes(new_status)) return res.status(400).json({ success: false, message: 'Invalid data' });
      await db.query("UPDATE orders SET status = ? WHERE order_id = ?", [new_status, order_id]);
      return res.status(200).json({ success: true });
    }

    // ORDERS
    if (endpoint === 'orders') {
      if (req.query.stats !== undefined) {
        const [[active]] = await db.query("SELECT COUNT(*) as c FROM orders WHERE status NOT IN ('Completed','Cancelled')");
        const [[today]] = await db.query("SELECT COUNT(*) as c FROM orders WHERE DATE(created_at) = CURDATE()");
        const [[completed]] = await db.query("SELECT COUNT(*) as c FROM orders WHERE status = 'Completed'");
        const [[pending]] = await db.query("SELECT COUNT(*) as c FROM orders WHERE status = 'Pending'");
        return res.status(200).json({ stats: { active: active.c, today: today.c, completed: completed.c, pending: pending.c } });
      }
      const filter = req.query.filter || 'active';
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
      return res.status(200).json({ orders });
    }

    res.status(400).json({ success: false, message: 'Invalid endpoint' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}