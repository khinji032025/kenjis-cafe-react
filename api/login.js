import sql from './db.js';
import bcrypt from 'bcryptjs';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ success: false, message: 'Invalid method' });

  const { username, password } = req.body;
  if (!username || !password) return res.status(400).json({ success: false, message: 'Please enter username and password' });

  try {
    const rows = await sql`SELECT * FROM staff WHERE username = ${username}`;
    if (rows.length === 0) return res.status(401).json({ success: false, message: 'Username not found' });

    const staff = rows[0];
    const match = await bcrypt.compare(password, staff.password);
    if (!match) return res.status(401).json({ success: false, message: 'Incorrect password' });

    res.status(200).json({ success: true, user: { id: staff.id, name: staff.name, username: staff.username, role: staff.role } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}