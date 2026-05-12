import db from './db.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    const [[p]] = await db.query("SELECT COUNT(*) as c FROM products");
    const [[o]] = await db.query("SELECT COUNT(*) as c FROM orders");
    const [[pend]] = await db.query("SELECT COUNT(*) as c FROM orders WHERE status NOT IN ('Completed','Cancelled')");
    const [[s]] = await db.query("SELECT COUNT(*) as c FROM staff WHERE role = 'staff'");
    const [[rev]] = await db.query("SELECT SUM(total_amount) as r FROM orders WHERE status = 'Completed'");
    const [recent_orders] = await db.query("SELECT * FROM orders ORDER BY created_at DESC LIMIT 8");

    res.status(200).json({
      stats: { products: p.c, orders: o.c, pending: pend.c, staff: s.c, revenue: rev.r || 0 },
      recent_orders
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}