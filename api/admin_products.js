import db from './db.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const { action, id, name, description, price, category, stock, available, image } = req.body || {};

  try {
    if (action === 'add') {
      await db.query(
        'INSERT INTO products (name, description, price, category, image, stock, available) VALUES (?,?,?,?,?,?,?)',
        [name, description, price, category, image || 'default.jpg', stock, available ? 1 : 0]
      );
      return res.status(200).json({ success: true, message: 'Product added!' });
    }

    if (action === 'edit') {
      if (image) {
        await db.query(
          'UPDATE products SET name=?, description=?, price=?, category=?, image=?, stock=?, available=? WHERE id=?',
          [name, description, price, category, image, stock, available ? 1 : 0, id]
        );
      } else {
        await db.query(
          'UPDATE products SET name=?, description=?, price=?, category=?, stock=?, available=? WHERE id=?',
          [name, description, price, category, stock, available ? 1 : 0, id]
        );
      }
      return res.status(200).json({ success: true, message: 'Product updated!' });
    }

    if (action === 'delete') {
      await db.query('DELETE FROM products WHERE id = ?', [id]);
      return res.status(200).json({ success: true });
    }

    if (action === 'add_stock') {
      await db.query('UPDATE products SET stock = stock + ?, available = 1 WHERE id = ?', [req.body.add_stock, id]);
      return res.status(200).json({ success: true });
    }

    const [products] = await db.query('SELECT * FROM products ORDER BY category, name');
    res.status(200).json({ products });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}