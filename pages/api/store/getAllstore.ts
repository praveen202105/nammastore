import { NextApiRequest, NextApiResponse } from 'next';
import StorageLocation from '../../../models/Store';
import connectToDatabase  from '../../../lib/db';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  await connectToDatabase();

  const locations = await StorageLocation.find();
  return res.status(200).json({ locations });
}
