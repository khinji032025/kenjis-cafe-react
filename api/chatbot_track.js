import db from './db.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ success: false, message: 'Invalid method' });

  const { order_id } = req.body;
  if (!order_id) return res.status(400).json({ success: false, message: 'No order ID provided' });

  try {
    const [rows] = await db.query("SELECT o.order_id, o.customer_name, o.status, o.total_amount, o.delivery_type, o.created_at, GROUP_CONCAT(oi.product_name, ' x', oi.quantity SEPARATOR ', ') as items FROM orders o LEFT JOIN order_items oi ON o.order_id = oi.order_id WHERE o.order_id = ? GROUP BY o.id", [order_id.toUpperCase()]);
    if (!rows.length) return res.status(404).json({ success: false, message: 'Order not found' });

    const order = rows[0];
    res.status(200).json({
      success: true,
      order_id: order.order_id,
      customer_name: order.customer_name,
      status: order.status,
      total_amount: parseFloat(order.total_amount).toFixed(2),
      delivery_type: order.delivery_type,
      items: order.items,
      created_at: new Date(order.created_at).toLocaleString('en-PH', { timeZone: 'Asia/Manila' })
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}