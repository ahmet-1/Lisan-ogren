import { sql } from '@vercel/postgres';

export async function initDb() {
  try {
    // Create tables if they don't exist
    await sql`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        name VARCHAR(255) NOT NULL,
        phone VARCHAR(20),
        country VARCHAR(100),
        birth_date DATE,
        plan VARCHAR(50) DEFAULT 'Deneme',
        status VARCHAR(50) DEFAULT 'Aktif',
        created_at TIMESTAMP DEFAULT NOW(),
        trial_end TIMESTAMP,
        gift_received BOOLEAN DEFAULT FALSE
      )
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS lessons (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        language VARCHAR(50) NOT NULL,
        teacher_id VARCHAR(50) NOT NULL,
        duration INTEGER DEFAULT 0,
        level VARCHAR(10),
        category VARCHAR(100),
        notes TEXT,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS messages (
        id SERIAL PRIMARY KEY,
        lesson_id INTEGER REFERENCES lessons(id) ON DELETE CASCADE,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        sender_type VARCHAR(20),
        content TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS user_progress (
        id SERIAL PRIMARY KEY,
        user_id INTEGER UNIQUE REFERENCES users(id) ON DELETE CASCADE,
        progress_data JSONB DEFAULT '{}',
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS pronunciation_analysis (
        id SERIAL PRIMARY KEY,
        lesson_id INTEGER REFERENCES lessons(id) ON DELETE CASCADE,
        word VARCHAR(255),
        user_audio_url TEXT,
        teacher_audio_url TEXT,
        issues JSONB DEFAULT '[]',
        score INTEGER,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `;

    console.log('Database tables initialized');
  } catch (err) {
    console.error('Database init error:', err);
  }
}

export async function query(text, params) {
  try {
    return await sql.query(text, params);
  } catch (err) {
    console.error('Database query error:', err);
    throw err;
  }
}
