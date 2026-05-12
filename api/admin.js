import sql from './db.js';
import bcrypt from 'bcryptjs';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const endpoint = req.query.endpoint;

  try {
    if (endpoint === 'stats') {
      const [p] = await sql`SELECT COUNT(*) as c FROM products`;
      const [o] = await sql`SELECT COUNT(*) as c FROM orders`;
      const [pend] = await sql`SELECT COUNT(*) as c FROM orders WHERE status NOT IN ('Completed','Cancelled')`;
      const [s] = await sql`SELECT COUNT(*) as c FROM staff WHERE role = 'staff'`;
      const [rev] = await sql`SELECT SUM(total_amount) as r FROM orders WHERE status = 'Completed'`;
      const recent_orders = await sql`SELECT * FROM orders ORDER BY created_at DESC LIMIT 8`;
      return res.status(200).json({ stats: { products: p.c, orders: o.c, pending: pend.c, staff: s.c, revenue: rev.r || 0 }, recent_orders });
    }

    if (endpoint === 'reports') {
      const daily = await sql`SELECT DATE(created_at) as date, COUNT(*) as orders, SUM(total_amount) as revenue FROM orders WHERE status != 'Cancelled' AND created_at >= NOW() - INTERVAL '7 days' GROUP BY DATE(created_at) ORDER BY date ASC`;
      const weekly = await sql`SELECT DATE_TRUNC('week', created_at) as week_start, COUNT(*) as orders, SUM(total_amount) as revenue FROM orders WHERE status != 'Cancelled' AND created_at >= NOW() - INTERVAL '8 weeks' GROUP BY DATE_TRUNC('week', created_at) ORDER BY week_start ASC`;
      const monthly = await sql`SELECT TO_CHAR(created_at, 'YYYY-MM') as month, TO_CHAR(created_at, 'Mon YYYY') as label, COUNT(*) as orders, SUM(total_amount) as revenue FROM orders WHERE status != 'Cancelled' AND created_at >= NOW() - INTERVAL '12 months' GROUP BY TO_CHAR(created_at, 'YYYY-MM'), TO_CHAR(created_at, 'Mon YYYY') ORDER BY month ASC`;
      const top_products = await sql`SELECT oi.product_name, SUM(oi.quantity) as total_qty, SUM(oi.subtotal) as total_revenue FROM order_items oi JOIN orders o ON oi.order_id = o.order_id WHERE o.status != 'Cancelled' GROUP BY oi.product_name ORDER BY total_qty DESC LIMIT 5`;
      const [tr] = await sql`SELECT SUM(total_amount) as r FROM orders WHERE status = 'Completed'`;
      const [to] = await sql`SELECT COUNT(*) as c FROM orders WHERE status != 'Cancelled'`;
      const [tdr] = await sql`SELECT SUM(total_amount) as r FROM orders WHERE DATE(created_at) = CURRENT_DATE AND status != 'Cancelled'`;
      const [tdo] = await sql`SELECT COUNT(*) as c FROM orders WHERE DATE(created_at) = CURRENT_DATE`;
      return res.status(200).json({
        daily: daily.map(r => ({ label: new Date(r.date).toLocaleDateString('en-US', {month:'short',day:'numeric'}), orders: r.orders, revenue: r.revenue })),
        weekly: weekly.map(r => ({ label: 'Wk ' + new Date(r.week_start).toLocaleDateString('en-US', {month:'short',day:'numeric'}), orders: r.orders, revenue: r.revenue })),
        monthly: monthly.map(r => ({ label: r.label, orders: r.orders, revenue: r.revenue })),
        top_products,
        stats: { total_revenue: tr.r || 0, total_orders: to.c, today_revenue: tdr.r || 0, today_orders: tdo.c }
      });
    }

    if (endpoint === 'orders') {
      const all_statuses = ['Pending','Received','Preparing','Ready for Pickup','Out for Delivery','Completed','Cancelled'];
      const filter = req.query.status || '';
      let orders;
      if (filter && all_statuses.includes(filter)) {
        orders = await sql`SELECT * FROM orders WHERE status = ${filter} ORDER BY created_at DESC`;
      } else {
        orders = await sql`SELECT * FROM orders ORDER BY created_at DESC`;
      }
      return res.status(200).json({ orders });
    }

    if (endpoint === 'products') {
      const { action, id, name, description, price, category, stock, available, image, add_stock } = req.body || {};
      if (action === 'add') {
        await sql`INSERT INTO products (name, description, price, category, image, stock, available) VALUES (${name}, ${description}, ${price}, ${category}, ${image || 'default.jpg'}, ${stock}, ${available ? 1 : 0})`;
        return res.status(200).json({ success: true, message: 'Product added!' });
      }
      if (action === 'edit') {
        if (image) {
          await sql`UPDATE products SET name=${name}, description=${description}, price=${price}, category=${category}, image=${image}, stock=${stock}, available=${available ? 1 : 0} WHERE id=${id}`;
        } else {
          await sql`UPDATE products SET name=${name}, description=${description}, price=${price}, category=${category}, stock=${stock}, available=${available ? 1 : 0} WHERE id=${id}`;
        }
        return res.status(200).json({ success: true, message: 'Product updated!' });
      }
      if (action === 'delete') {
        await sql`DELETE FROM products WHERE id = ${id}`;
        return res.status(200).json({ success: true });
      }
      if (action === 'add_stock') {
        await sql`UPDATE products SET stock = stock + ${add_stock}, available = 1 WHERE id = ${id}`;
        return res.status(200).json({ success: true });
      }
      const products = await sql`SELECT * FROM products ORDER BY category, name`;
      return res.status(200).json({ products });
    }

    if (endpoint === 'staff') {
      const { action, id, name, contact, username, password, role } = req.body || {};
      if (action === 'add') {
        const check = await sql`SELECT id FROM staff WHERE username = ${username}`;
        if (check.length > 0) return res.status(400).json({ success: false, message: 'Username already exists' });
        const hashed = await bcrypt.hash(password, 10);
        await sql`INSERT INTO staff (name, contact, username, password, role) VALUES (${name}, ${contact}, ${username}, ${hashed}, ${role || 'staff'})`;
        return res.status(200).json({ success: true, message: 'Staff added!' });
      }
      if (action === 'edit') {
        if (password) {
          const hashed = await bcrypt.hash(password, 10);
          await sql`UPDATE staff SET name=${name}, contact=${contact}, username=${username}, password=${hashed}, role=${role} WHERE id=${id}`;
        } else {
          await sql`UPDATE staff SET name=${name}, contact=${contact}, username=${username}, role=${role} WHERE id=${id}`;
        }
        return res.status(200).json({ success: true, message: 'Staff updated!' });
      }
      if (action === 'delete') {
        await sql`DELETE FROM staff WHERE id = ${id}`;
        return res.status(200).json({ success: true, message: 'Staff deleted.' });
      }
      const staff = await sql`SELECT id, name, contact, username, role, created_at FROM staff ORDER BY role, name`;
      return res.status(200).json({ staff });
    }

    res.status(400).json({ success: false, message: 'Invalid endpoint' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}