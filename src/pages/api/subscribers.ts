
import { NextApiRequest, NextApiResponse } from 'next';
import { insertSubscriber, getSubscribers } from '../../lib/db';
import { parse } from 'cookie';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const { email } = req.body;
    if (!email || !email.includes('@')) {
      return res.status(400).json({ error: 'Invalid email' });
    }
    try {
      await insertSubscriber(email);
      res.status(200).json({ message: 'Subscribed successfully' });
    } catch (error) {
      res.status(500).json({ error: 'Failed to subscribe' });
    }
  } else if (req.method === 'GET') {
    // Secure with httpOnly cookie
    const cookies = req.headers.cookie ? parse(req.headers.cookie) : {};
    if (cookies.admin_auth !== 'true') {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    try {
      const subscribers = await getSubscribers();
      res.status(200).json(subscribers);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch subscribers' });
    }
  } else {
    res.setHeader('Allow', ['POST', 'GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}