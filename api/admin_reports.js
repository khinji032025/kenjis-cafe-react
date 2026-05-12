import db from './db.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    const [daily] = await db.query("SELECT DATE(created_at) as date, COUNT(*) as orders, SUM(total_amount) as revenue FROM orders WHERE status != 'Cancelled' AND created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY) GROUP BY DATE(created_at) ORDER BY date ASC");
    const [weekly] = await db.query("SELECT YEARWEEK(created_at) as week, MIN(DATE(created_at)) as week_start, COUNT(*) as orders, SUM(total_amount) as revenue FROM orders WHERE status != 'Cancelled' AND created_at >= DATE_SUB(NOW(), INTERVAL 8 WEEK) GROUP BY YEARWEEK(created_at) ORDER BY week ASC");
    const [monthly] = await db.query("SELECT DATE_FORMAT(created_at, '%Y-%m') as month, DATE_FORMAT(created_at, '%b %Y') as label, COUNT(*) as orders, SUM(total_amount) as revenue FROM orders WHERE status != 'Cancelled' AND created_at >= DATE_SUB(NOW(), INTERVAL 12 MONTH) GROUP BY DATE_FORMAT(created_at, '%Y-%m') ORDER BY month ASC");
    const [top_products] = await db.query("SELECT oi.product_name, SUM(oi.quantity) as total_qty, SUM(oi.subtotal) as total_revenue FROM order_items oi JOIN orders o ON oi.order_id = o.order_id WHERE o.status != 'Cancelled' GROUP BY oi.product_name ORDER BY total_qty DESC LIMIT 5");
    const [[tr]] = await db.query("SELECT SUM(total_amount) as r FROM orders WHERE status = 'Completed'");
    const [[to]] = await db.query("SELECT COUNT(*) as c FROM orders WHERE status != 'Cancelled'");
    const [[tdr]] = await db.query("SELECT SUM(total_amount) as r FROM orders WHERE DATE(created_at) = CURDATE() AND status != 'Cancelled'");
    const [[tdo]] = await db.query("SELECT COUNT(*) as c FROM orders WHERE DATE(created_at) = CURDATE()");

    res.status(200).json({
      daily: daily.map(r => ({ label: new Date(r.date).toLocaleDateString('en-US', {month:'short',day:'numeric'}), orders: r.orders, revenue: r.revenue })),
      weekly: weekly.map(r => ({ label: 'Wk ' + new Date(r.week_start).toLocaleDateString('en-US', {month:'short',day:'numeric'}), orders: r.orders, revenue: r.revenue })),
      monthly: monthly.map(r => ({ label: r.label, orders: r.orders, revenue: r.revenue })),
      top_products,
      stats: { total_revenue: tr.r || 0, total_orders: to.c, today_revenue: tdr.r || 0, today_orders: tdo.c }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}