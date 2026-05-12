import db from './db.js';
import bcrypt from 'bcryptjs';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const { action, id, name, contact, username, password, role } = req.body || {};

  try {
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
    res.status(200).json({ staff });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}