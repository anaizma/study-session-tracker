import type { NextApiRequest, NextApiResponse } from 'next';
import { ObjectId } from 'mongodb';
import clientPromise from '../../../lib/db';

async function getCollection() {
  const client = await clientPromise;
  return client.db('study_tracker').collection('sessions');
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;

  if (req.method === 'PUT') {
    try {
      const sessions = await getCollection();
      await sessions.updateOne(
        { _id: new ObjectId(id as string) },
        {
          $set: {
            course: req.body.course as string,
            duration: req.body.duration as string,
            note: req.body.note as string,
          },
        }
      );
      res.status(200).end();
    } catch (err) {
      console.error('PUT /api/sessions error:', err);
      res.status(500).json({ error: 'Failed to update session' });
    }
  } else if (req.method === 'DELETE') {
    try {
      const sessions = await getCollection();
      await sessions.deleteOne({ _id: new ObjectId(id as string) });
      res.status(200).end();
    } catch (err) {
      console.error('DELETE /api/sessions error:', err);
      res.status(500).json({ error: 'Failed to delete session' });
    }
  } else {
    res.setHeader('Allow', ['PUT', 'DELETE']);
    res.status(405).end();
  }
}
