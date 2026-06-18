import bcrypt from 'bcryptjs';
import { sql } from '@vercel/postgres';
import { verifyToken } from './middleware.js';

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

function withCors(res) {
  Object.entries(CORS_HEADERS).forEach(([key, value]) => {
    res.setHeader(key, value);
  });
  return res;
}

async function getProfile(req, res) {
  const token = req.headers.authorization?.replace('Bearer ', '');
  const payload = verifyToken(token);

  if (!payload) {
    return withCors(res).status(401).json({ error: 'Unauthorized' });
  }

  try {
    const result = await sql`
      SELECT id, email, name, phone, country, birth_date, plan, status, created_at, trial_end
      FROM users WHERE id = ${payload.userId}
    `;

    if (result.rows.length === 0) {
      return withCors(res).status(404).json({ error: 'User not found' });
    }

    return withCors(res).status(200).json({ user: result.rows[0] });
  } catch (err) {
    console.error('Get profile error:', err);
    return withCors(res).status(500).json({ error: 'Failed to get profile' });
  }
}

async function updateProfile(req, res) {
  const token = req.headers.authorization?.replace('Bearer ', '');
  const payload = verifyToken(token);

  if (!payload) {
    return withCors(res).status(401).json({ error: 'Unauthorized' });
  }

  try {
    const { name, phone, country, birth_date } = req.body;

    const result = await sql`
      UPDATE users
      SET
        name = COALESCE(${name || null}, name),
        phone = COALESCE(${phone || null}, phone),
        country = COALESCE(${country || null}, country),
        birth_date = COALESCE(${birth_date || null}, birth_date)
      WHERE id = ${payload.userId}
      RETURNING id, email, name, phone, country, birth_date, plan, status
    `;

    if (result.rows.length === 0) {
      return withCors(res).status(404).json({ error: 'User not found' });
    }

    return withCors(res).status(200).json({ user: result.rows[0] });
  } catch (err) {
    console.error('Update profile error:', err);
    return withCors(res).status(500).json({ error: 'Failed to update profile' });
  }
}

async function changePassword(req, res) {
  const token = req.headers.authorization?.replace('Bearer ', '');
  const payload = verifyToken(token);

  if (!payload) {
    return withCors(res).status(401).json({ error: 'Unauthorized' });
  }

  try {
    const { oldPassword, newPassword } = req.body;

    if (!oldPassword || !newPassword) {
      return withCors(res).status(400).json({ error: 'Missing password fields' });
    }

    const result = await sql`
      SELECT password_hash FROM users WHERE id = ${payload.userId}
    `;

    if (result.rows.length === 0) {
      return withCors(res).status(404).json({ error: 'User not found' });
    }

    const passwordMatch = await bcrypt.compare(oldPassword, result.rows[0].password_hash);
    if (!passwordMatch) {
      return withCors(res).status(401).json({ error: 'Incorrect password' });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await sql`
      UPDATE users
      SET password_hash = ${hashedPassword}
      WHERE id = ${payload.userId}
    `;

    return withCors(res).status(200).json({ message: 'Password changed successfully' });
  } catch (err) {
    console.error('Change password error:', err);
    return withCors(res).status(500).json({ error: 'Failed to change password' });
  }
}

export default async function handler(req, res) {
  if (req.method === 'OPTIONS') {
    return withCors(res).status(200).end();
  }

  const url = new URL(req.url, `http://${req.headers.host}`);

  if (url.pathname === '/api/user/profile') {
    if (req.method === 'GET') {
      return getProfile(req, res);
    } else if (req.method === 'PATCH') {
      return updateProfile(req, res);
    }
  } else if (url.pathname === '/api/user/password') {
    if (req.method === 'PATCH') {
      return changePassword(req, res);
    }
  }

  return withCors(res).status(404).json({ error: 'Not found' });
}
