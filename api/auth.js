import bcrypt from 'bcryptjs';
import { sql } from '@vercel/postgres';
import { signToken, authMiddleware } from './middleware.js';

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

async function register(req, res) {
  if (req.method === 'OPTIONS') {
    return withCors(res).status(200).end();
  }

  try {
    const { email, password, name, phone, country } = req.body;

    if (!email || !password || !name) {
      return withCors(res).status(400).json({ error: 'Missing required fields' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const result = await sql`
      INSERT INTO users (email, password_hash, name, phone, country, trial_end)
      VALUES (${email}, ${hashedPassword}, ${name}, ${phone || null}, ${country || null},
              NOW() + INTERVAL '5 days')
      RETURNING id, email, name, plan, status
    `;

    const user = result.rows[0];
    const token = signToken(user.id, user.email);

    return withCors(res).status(201).json({
      user,
      token,
    });
  } catch (err) {
    console.error('Register error:', err);
    return withCors(res).status(500).json({
      error: err.code === '23505' ? 'Email already exists' : 'Registration failed'
    });
  }
}

async function login(req, res) {
  if (req.method === 'OPTIONS') {
    return withCors(res).status(200).end();
  }

  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return withCors(res).status(400).json({ error: 'Missing email or password' });
    }

    const result = await sql`
      SELECT id, email, password_hash, name, plan, status FROM users WHERE email = ${email}
    `;

    if (result.rows.length === 0) {
      return withCors(res).status(401).json({ error: 'Invalid credentials' });
    }

    const user = result.rows[0];
    const passwordMatch = await bcrypt.compare(password, user.password_hash);

    if (!passwordMatch) {
      return withCors(res).status(401).json({ error: 'Invalid credentials' });
    }

    const token = signToken(user.id, user.email);

    return withCors(res).status(200).json({
      user: { id: user.id, email: user.email, name: user.name, plan: user.plan },
      token,
    });
  } catch (err) {
    console.error('Login error:', err);
    return withCors(res).status(500).json({ error: 'Login failed' });
  }
}

export default async function handler(req, res) {
  const url = new URL(req.url, `http://${req.headers.host}`);

  if (url.pathname === '/api/auth/register') {
    return register(req, res);
  } else if (url.pathname === '/api/auth/login') {
    return login(req, res);
  }

  return withCors(res).status(404).json({ error: 'Not found' });
}
