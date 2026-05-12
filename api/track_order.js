import sql from './db.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const order_id = (req.query.id || '').toUpperCase().trim();
  if (!order_id) return res.status(400).json({ success: false, message: 'No order ID' });

  try {
    const orders = await sql`SELECT * FROM orders WHERE order_id = ${order_id}`;
    if (orders.length === 0) return res.status(404).json({ success: false, message: 'Order not found' });

    const items = await sql`SELECT * FROM order_items WHERE order_id = ${order_id}`;
    res.status(200).json({ success: true, order: orders[0], items });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}