import sql from './db.js';

function generateOrderId() {
  return 'KJC-' + Math.random().toString(36).substring(2, 10).toUpperCase();
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ success: false, message: 'Invalid method' });

  const { customer_name, contact_number, delivery_type, address, special_request, payment_method, total_amount, discount, items } = req.body;

  if (!customer_name || !contact_number || !items?.length) return res.status(400).json({ success: false, message: 'Required fields missing' });
  if (delivery_type === 'delivery' && !address) return res.status(400).json({ success: false, message: 'Delivery address required' });

  try {
    let order_id;
    do {
      order_id = generateOrderId();
      const check = await sql`SELECT id FROM orders WHERE order_id = ${order_id}`;
      if (check.length === 0) break;
    } while (true);

    await sql`INSERT INTO orders (order_id, customer_name, contact_number, delivery_type, address, special_request, payment_method, total_amount, discount, status) VALUES (${order_id}, ${customer_name}, ${contact_number}, ${delivery_type || 'pickup'}, ${address || ''}, ${special_request || ''}, ${payment_method || 'cash'}, ${total_amount}, ${discount || 0}, 'Pending')`;

    for (const item of items) {
      const stock = await sql`SELECT stock FROM products WHERE id = ${item.product_id}`;
      if (!stock.length || stock[0].stock < item.quantity) throw new Error(`Insufficient stock for: ${item.product_name}`);

      await sql`INSERT INTO order_items (order_id, product_id, product_name, price, quantity, subtotal) VALUES (${order_id}, ${item.product_id}, ${item.product_name}, ${item.price}, ${item.quantity}, ${item.subtotal})`;
      await sql`UPDATE products SET stock = stock - ${item.quantity} WHERE id = ${item.product_id}`;
      await sql`UPDATE products SET available = 0 WHERE id = ${item.product_id} AND stock = 0`;
    }

    res.status(200).json({ success: true, order_id, message: 'Order placed successfully!' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}