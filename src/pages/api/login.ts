
import { NextApiRequest, NextApiResponse } from 'next';
import { serialize } from 'cookie';
// CSRF protection
// For production, use a robust CSRF library or Next.js middleware. Here, a simple token check is shown for illustration.



// Use strong credentials from environment variables
const ADMIN_USERNAME = process.env.ADMIN_USERNAME;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }
  // Simple CSRF token check (for demo; use a library for production)
  const csrfToken = req.headers['x-csrf-token'];
  console.log('API: Incoming CSRF token:', csrfToken);
  console.log('API: ENV CSRF token:', process.env.CSRF_TOKEN);
  if (!csrfToken || csrfToken !== process.env.CSRF_TOKEN) {
    return res.status(403).json({ message: 'Invalid CSRF token', debug: { incoming: csrfToken, env: process.env.CSRF_TOKEN } });
  }
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ message: 'Username and password required' });
  }
  console.log('API: Incoming username:', username);
  console.log('API: Incoming password:', password);
  console.log('API: ENV ADMIN_USERNAME:', ADMIN_USERNAME);
  console.log('API: ENV ADMIN_PASSWORD:', ADMIN_PASSWORD);
  if (username !== ADMIN_USERNAME || password !== ADMIN_PASSWORD) {
    return res.status(401).json({ message: 'Invalid credentials', debug: { incomingUsername: username, incomingPassword: password, envUsername: ADMIN_USERNAME, envPassword: ADMIN_PASSWORD } });
  }
  // Set httpOnly cookie for session
  res.setHeader('Set-Cookie', serialize('admin_auth', 'true', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 2 // 2 hours
  }));
  return res.status(200).json({ message: 'Login successful' });
}
