import Database from 'better-sqlite3';
import path from 'path';

// Type for Cloudflare D1
interface D1Database {
  prepare(query: string): D1PreparedStatement;
}

interface D1PreparedStatement {
  bind(...values: any[]): D1PreparedStatement;
  all(): Promise<any[]>;
  run(): Promise<any>;
}

declare global {
  var DB: D1Database | undefined;
}

let db: any;

if (typeof globalThis.DB !== 'undefined') {
  // Cloudflare D1
  db = globalThis.DB;
} else {
  // Local SQLite
  const dbPath = path.join(process.cwd(), 'data', 'app.db');
  db = new Database(dbPath);

  // Create tables
  db.exec(`
    CREATE TABLE IF NOT EXISTS subscribers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS analytics (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      path TEXT NOT NULL,
      referrer TEXT,
      user_agent TEXT,
      language TEXT,
      screen_size TEXT,
      ip TEXT,
      timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);
}

// Prepared statements
export const insertSubscriber = (email: string) => {
  if (db instanceof Database) {
    return db.prepare(`
      INSERT OR IGNORE INTO subscribers (email) VALUES (?)
    `).run(email);
  } else {
    return db.prepare(`
      INSERT OR IGNORE INTO subscribers (email) VALUES (?)
    `).bind(email).run();
  }
};

export const getSubscribers = async () => {
  if (db instanceof Database) {
    return db.prepare(`
      SELECT * FROM subscribers ORDER BY created_at DESC
    `).all();
  } else {
    return await db.prepare(`
      SELECT * FROM subscribers ORDER BY created_at DESC
    `).all();
  }
};

export const insertPageView = (data: {
  path: string;
  referrer?: string;
  userAgent: string;
  language: string;
  screenSize: string;
  ip?: string;
}) => {
  if (db instanceof Database) {
    return db.prepare(`
      INSERT INTO analytics (path, referrer, user_agent, language, screen_size, ip) VALUES (?, ?, ?, ?, ?, ?)
    `).run(data.path, data.referrer, data.userAgent, data.language, data.screenSize, data.ip);
  } else {
    return db.prepare(`
      INSERT INTO analytics (path, referrer, user_agent, language, screen_size, ip) VALUES (?, ?, ?, ?, ?, ?)
    `).bind(data.path, data.referrer, data.userAgent, data.language, data.screenSize, data.ip).run();
  }
};

export const getAnalytics = async () => {
  if (db instanceof Database) {
    return db.prepare(`
      SELECT path, COUNT(*) as views, DATE(timestamp) as date
      FROM analytics
      GROUP BY path, DATE(timestamp)
      ORDER BY date DESC, views DESC
    `).all();
  } else {
    return await db.prepare(`
      SELECT path, COUNT(*) as views, DATE(timestamp) as date
      FROM analytics
      GROUP BY path, DATE(timestamp)
      ORDER BY date DESC, views DESC
    `).all();
  }
};

export const getTopReferrers = async () => {
  if (db instanceof Database) {
    return db.prepare(`
      SELECT referrer, COUNT(*) as count
      FROM analytics
      WHERE referrer IS NOT NULL AND referrer != ''
      GROUP BY referrer
      ORDER BY count DESC
      LIMIT 10
    `).all();
  } else {
    return await db.prepare(`
      SELECT referrer, COUNT(*) as count
      FROM analytics
      WHERE referrer IS NOT NULL AND referrer != ''
      GROUP BY referrer
      ORDER BY count DESC
      LIMIT 10
    `).all();
  }
};

export const getTopBrowsers = async () => {
  if (db instanceof Database) {
    return db.prepare(`
      SELECT 
        CASE 
          WHEN user_agent LIKE '%Chrome%' THEN 'Chrome'
          WHEN user_agent LIKE '%Firefox%' THEN 'Firefox'
          WHEN user_agent LIKE '%Safari%' THEN 'Safari'
          WHEN user_agent LIKE '%Edge%' THEN 'Edge'
          ELSE 'Other'
        END as browser,
        COUNT(*) as count
      FROM analytics
      GROUP BY browser
      ORDER BY count DESC
    `).all();
  } else {
    return await db.prepare(`
      SELECT 
        CASE 
          WHEN user_agent LIKE '%Chrome%' THEN 'Chrome'
          WHEN user_agent LIKE '%Firefox%' THEN 'Firefox'
          WHEN user_agent LIKE '%Safari%' THEN 'Safari'
          WHEN user_agent LIKE '%Edge%' THEN 'Edge'
          ELSE 'Other'
        END as browser,
        COUNT(*) as count
      FROM analytics
      GROUP BY browser
      ORDER BY count DESC
    `).all();
  }
};

export const getDeviceTypes = async () => {
  if (db instanceof Database) {
    return db.prepare(`
      SELECT 
        CASE 
          WHEN user_agent LIKE '%Mobile%' THEN 'Mobile'
          WHEN user_agent LIKE '%Tablet%' THEN 'Tablet'
          ELSE 'Desktop'
        END as device,
        COUNT(*) as count
      FROM analytics
      GROUP BY device
      ORDER BY count DESC
    `).all();
  } else {
    return await db.prepare(`
      SELECT 
        CASE 
          WHEN user_agent LIKE '%Mobile%' THEN 'Mobile'
          WHEN user_agent LIKE '%Tablet%' THEN 'Tablet'
          ELSE 'Desktop'
        END as device,
        COUNT(*) as count
      FROM analytics
      GROUP BY device
      ORDER BY count DESC
    `).all();
  }
};