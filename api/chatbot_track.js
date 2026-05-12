import sql from './db.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ success: false, message: 'Invalid method' });

  const { order_id } = req.body;
  if (!order_id) return res.status(400).json({ success: false, message: 'No order ID provided' });

  try {
    const orders = await sql`SELECT * FROM orders WHERE order_id = ${order_id.toUpperCase()}`;
    if (!orders.length) return res.status(404).json({ success: false, message: 'Order not found' });

    const items = await sql`SELECT product_name, quantity FROM order_items WHERE order_id = ${order_id.toUpperCase()}`;
    const itemsList = items.map(i => `${i.product_name} x${i.quantity}`).join(', ');
    const order = orders[0];

    res.status(200).json({
      success: true,
      order_id: order.order_id,
      customer_name: order.customer_name,
      status: order.status,
      total_amount: parseFloat(order.total_amount).toFixed(2),
      delivery_type: order.delivery_type,
      items: itemsList,
      created_at: new Date(order.created_at).toLocaleString('en-PH', { timeZone: 'Asia/Manila' })
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}