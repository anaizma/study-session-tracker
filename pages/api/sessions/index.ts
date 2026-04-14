import type { NextApiRequest, NextApiResponse } from 'next';
import clientPromise from '../../../lib/db';

async function getCollection() {
  const client = await clientPromise;
  return client.db('study_tracker').collection('sessions');
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    try {
      const sessions = await getCollection();
      const all = await sessions.find({}).toArray();
      res.status(200).json(all);
    } catch (err) {
      console.error('GET /api/sessions error:', err);
      res.status(500).json({ error: 'Failed to fetch sessions' });
    }
  } else if (req.method === 'POST') {
    try {
      const sessions = await getCollection();
      await sessions.insertOne({
        course: req.body.course as string,
        duration: req.body.duration as string,
        note: req.body.note as string,
        createdAt: new Date(),
      });
      res.status(201).end();
    } catch (err) {
      console.error('POST /api/sessions error:', err);
      res.status(500).json({ error: 'Failed to add session' });
    }
  } else {
    res.setHeader('Allow', ['GET', 'POST']);
    res.status(405).end();
  }
}
