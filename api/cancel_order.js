import sql from './db.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ success: false, message: 'Invalid method' });

  const { order_id, reason } = req.body;
  if (!order_id) return res.status(400).json({ success: false, message: 'Order ID required' });

  try {
    const orders = await sql`SELECT * FROM orders WHERE order_id = ${order_id.toUpperCase()}`;
    if (!orders.length) return res.status(404).json({ success: false, message: 'Order not found' });

    const order = orders[0];
    if (['Cancelled', 'Completed'].includes(order.status)) return res.status(400).json({ success: false, message: 'This order cannot be cancelled' });

    const diff_minutes = (Date.now() - new Date(order.created_at).getTime()) / 60000;
    if (diff_minutes > 5) return res.status(400).json({ success: false, message: `Sorry, cancellation is only allowed within 5 minutes. Your order was placed ${Math.round(diff_minutes)} minutes ago.` });

    const items = await sql`SELECT * FROM order_items WHERE order_id = ${order_id.toUpperCase()}`;
    for (const item of items) {
      await sql`UPDATE products SET stock = stock + ${item.quantity}, available = 1 WHERE id = ${item.product_id}`;
    }

    await sql`UPDATE orders SET status = 'Cancelled', special_request = CONCAT(COALESCE(special_request,''), ${` [Cancelled: ${reason || 'Cancelled by customer'}]`}) WHERE order_id = ${order_id.toUpperCase()}`;

    res.status(200).json({ success: true, message: 'Your order has been cancelled successfully.' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}