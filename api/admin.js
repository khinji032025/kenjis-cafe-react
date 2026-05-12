import db from './db.js';
import bcrypt from 'bcryptjs';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const endpoint = req.query.endpoint;

  try {
    // STATS
    if (endpoint === 'stats') {
      const [[p]] = await db.query("SELECT COUNT(*) as c FROM products");
      const [[o]] = await db.query("SELECT COUNT(*) as c FROM orders");
      const [[pend]] = await db.query("SELECT COUNT(*) as c FROM orders WHERE status NOT IN ('Completed','Cancelled')");
      const [[s]] = await db.query("SELECT COUNT(*) as c FROM staff WHERE role = 'staff'");
      const [[rev]] = await db.query("SELECT SUM(total_amount) as r FROM orders WHERE status = 'Completed'");
      const [recent_orders] = await db.query("SELECT * FROM orders ORDER BY created_at DESC LIMIT 8");
      return res.status(200).json({ stats: { products: p.c, orders: o.c, pending: pend.c, staff: s.c, revenue: rev.r || 0 }, recent_orders });
    }

    // REPORTS
    if (endpoint === 'reports') {
      const [daily] = await db.query("SELECT DATE(created_at) as date, COUNT(*) as orders, SUM(total_amount) as revenue FROM orders WHERE status != 'Cancelled' AND created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY) GROUP BY DATE(created_at) ORDER BY date ASC");
      const [weekly] = await db.query("SELECT YEARWEEK(created_at) as week, MIN(DATE(created_at)) as week_start, COUNT(*) as orders, SUM(total_amount) as revenue FROM orders WHERE status != 'Cancelled' AND created_at >= DATE_SUB(NOW(), INTERVAL 8 WEEK) GROUP BY YEARWEEK(created_at) ORDER BY week ASC");
      const [monthly] = await db.query("SELECT DATE_FORMAT(created_at, '%Y-%m') as month, DATE_FORMAT(created_at, '%b %Y') as label, COUNT(*) as orders, SUM(total_amount) as revenue FROM orders WHERE status != 'Cancelled' AND created_at >= DATE_SUB(NOW(), INTERVAL 12 MONTH) GROUP BY DATE_FORMAT(created_at, '%Y-%m') ORDER BY month ASC");
      const [top_products] = await db.query("SELECT oi.product_name, SUM(oi.quantity) as total_qty, SUM(oi.subtotal) as total_revenue FROM order_items oi JOIN orders o ON oi.order_id = o.order_id WHERE o.status != 'Cancelled' GROUP BY oi.product_name ORDER BY total_qty DESC LIMIT 5");
      const [[tr]] = await db.query("SELECT SUM(total_amount) as r FROM orders WHERE status = 'Completed'");
      const [[to]] = await db.query("SELECT COUNT(*) as c FROM orders WHERE status != 'Cancelled'");
      const [[tdr]] = await db.query("SELECT SUM(total_amount) as r FROM orders WHERE DATE(created_at) = CURDATE() AND status != 'Cancelled'");
      const [[tdo]] = await db.query("SELECT COUNT(*) as c FROM orders WHERE DATE(created_at) = CURDATE()");
      return res.status(200).json({
        daily: daily.map(r => ({ label: new Date(r.date).toLocaleDateString('en-US', {month:'short',day:'numeric'}), orders: r.orders, revenue: r.revenue })),
        weekly: weekly.map(r => ({ label: 'Wk ' + new Date(r.week_start).toLocaleDateString('en-US', {month:'short',day:'numeric'}), orders: r.orders, revenue: r.revenue })),
        monthly: monthly.map(r => ({ label: r.label, orders: r.orders, revenue: r.revenue })),
        top_products,
        stats: { total_revenue: tr.r || 0, total_orders: to.c, today_revenue: tdr.r || 0, today_orders: tdo.c }
      });
    }

    // ORDERS
    if (endpoint === 'orders') {
      const all_statuses = ['Pending','Received','Preparing','Ready for Pickup','Out for Delivery','Completed','Cancelled'];
      const filter = req.query.status || '';
      let sql = 'SELECT * FROM orders';
      const params = [];
      if (filter && all_statuses.includes(filter)) { sql += ' WHERE status = ?'; params.push(filter); }
      sql += ' ORDER BY created_at DESC';
      const [orders] = await db.query(sql, params);
      return res.status(200).json({ orders });
    }

    // PRODUCTS
    if (endpoint === 'products') {
      const { action, id, name, description, price, category, stock, available, image, add_stock } = req.body || {};
      if (action === 'add') {
        await db.query('INSERT INTO products (name, description, price, category, image, stock, available) VALUES (?,?,?,?,?,?,?)', [name, description, price, category, image || 'default.jpg', stock, available ? 1 : 0]);
        return res.status(200).json({ success: true, message: 'Product added!' });
      }
      if (action === 'edit') {
        if (image) {
          await db.query('UPDATE products SET name=?, description=?, price=?, category=?, image=?, stock=?, available=? WHERE id=?', [name, description, price, category, image, stock, available ? 1 : 0, id]);
        } else {
          await db.query('UPDATE products SET name=?, description=?, price=?, category=?, stock=?, available=? WHERE id=?', [name, description, price, category, stock, available ? 1 : 0, id]);
        }
        return res.status(200).json({ success: true, message: 'Product updated!' });
      }
      if (action === 'delete') {
        await db.query('DELETE FROM products WHERE id = ?', [id]);
        return res.status(200).json({ success: true });
      }
      if (action === 'add_stock') {
        await db.query('UPDATE products SET stock = stock + ?, available = 1 WHERE id = ?', [add_stock, id]);
        return res.status(200).json({ success: true });
      }
      const [products] = await db.query('SELECT * FROM products ORDER BY category, name');
      return res.status(200).json({ products });
    }

    // STAFF
    if (endpoint === 'staff') {
      const { action, id, name, contact, username, password, role } = req.body || {};
      if (action === 'add') {
        const [check] = await db.query('SELECT id FROM staff WHERE username = ?', [username]);
        if (check.length > 0) return res.status(400).json({ success: false, message: 'Username already exists' });
        const hashed = await bcrypt.hash(password, 10);
        await db.query('INSERT INTO staff (name, contact, username, password, role) VALUES (?,?,?,?,?)', [name, contact, username, hashed, role || 'staff']);
        return res.status(200).json({ success: true, message: 'Staff added!' });
      }
      if (action === 'edit') {
        if (password) {
          const hashed = await bcrypt.hash(password, 10);
          await db.query('UPDATE staff SET name=?, contact=?, username=?, password=?, role=? WHERE id=?', [name, contact, username, hashed, role, id]);
        } else {
          await db.query('UPDATE staff SET name=?, contact=?, username=?, role=? WHERE id=?', [name, contact, username, role, id]);
        }
        return res.status(200).json({ success: true, message: 'Staff updated!' });
      }
      if (action === 'delete') {
        await db.query('DELETE FROM staff WHERE id = ?', [id]);
        return res.status(200).json({ success: true, message: 'Staff deleted.' });
      }
      const [staff] = await db.query('SELECT id, name, contact, username, role, created_at FROM staff ORDER BY role, name');
      return res.status(200).json({ staff });
    }

    res.status(400).json({ success: false, message: 'Invalid endpoint' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}