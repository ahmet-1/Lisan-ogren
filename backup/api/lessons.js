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

async function getLessons(req, res) {
  const token = req.headers.authorization?.replace('Bearer ', '');
  const payload = verifyToken(token);

  if (!payload) {
    return withCors(res).status(401).json({ error: 'Unauthorized' });
  }

  try {
    const url = new URL(req.url, `http://${req.headers.host}`);
    const language = url.searchParams.get('language');
    const limit = parseInt(url.searchParams.get('limit')) || 20;

    let query = 'SELECT * FROM lessons WHERE user_id = $1';
    const params = [payload.userId];

    if (language) {
      query += ' AND language = $2';
      params.push(language);
    }

    query += ' ORDER BY created_at DESC LIMIT $' + (params.length + 1);
    params.push(limit);

    const result = await sql.query(query, params);
    return withCors(res).status(200).json({ lessons: result.rows });
  } catch (err) {
    console.error('Get lessons error:', err);
    return withCors(res).status(500).json({ error: 'Failed to fetch lessons' });
  }
}

async function createLesson(req, res) {
  const token = req.headers.authorization?.replace('Bearer ', '');
  const payload = verifyToken(token);

  if (!payload) {
    return withCors(res).status(401).json({ error: 'Unauthorized' });
  }

  try {
    const { language, teacher_id, duration, level, category, notes } = req.body;

    const result = await sql`
      INSERT INTO lessons (user_id, language, teacher_id, duration, level, category, notes)
      VALUES (${payload.userId}, ${language}, ${teacher_id}, ${duration || 0},
              ${level || 'A1'}, ${category || 'General'}, ${notes || null})
      RETURNING *
    `;

    return withCors(res).status(201).json({ lesson: result.rows[0] });
  } catch (err) {
    console.error('Create lesson error:', err);
    return withCors(res).status(500).json({ error: 'Failed to create lesson' });
  }
}

async function getProgress(req, res) {
  const token = req.headers.authorization?.replace('Bearer ', '');
  const payload = verifyToken(token);

  if (!payload) {
    return withCors(res).status(401).json({ error: 'Unauthorized' });
  }

  try {
    const url = new URL(req.url, `http://${req.headers.host}`);
    const language = url.pathname.split('/').pop();

    const result = await sql`
      SELECT
        language,
        COUNT(*) as total_lessons,
        MAX(level) as current_level,
        MAX(created_at) as last_lesson_date
      FROM lessons
      WHERE user_id = ${payload.userId} AND language = ${language}
      GROUP BY language
    `;

    return withCors(res).status(200).json({
      progress: result.rows[0] || { language, total_lessons: 0, current_level: 'A1', last_lesson_date: null }
    });
  } catch (err) {
    console.error('Get progress error:', err);
    return withCors(res).status(500).json({ error: 'Failed to fetch progress' });
  }
}

export default async function handler(req, res) {
  if (req.method === 'OPTIONS') {
    return withCors(res).status(200).end();
  }

  const url = new URL(req.url, `http://${req.headers.host}`);

  if (url.pathname === '/api/lessons' || url.pathname === '/api/lessons/') {
    if (req.method === 'GET') {
      return getLessons(req, res);
    } else if (req.method === 'POST') {
      return createLesson(req, res);
    }
  } else if (url.pathname.match(/^\/api\/progress\/.+$/)) {
    if (req.method === 'GET') {
      return getProgress(req, res);
    }
  }

  return withCors(res).status(404).json({ error: 'Not found' });
}
