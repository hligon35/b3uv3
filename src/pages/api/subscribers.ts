import { NextApiRequest, NextApiResponse } from 'next';
import { insertSubscriber, getSubscribers } from '../../lib/db';

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
    // Simple auth for admin
    const auth = req.headers.authorization;
    if (auth !== `Bearer ${process.env.ADMIN_TOKEN || 'admin123'}`) {
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