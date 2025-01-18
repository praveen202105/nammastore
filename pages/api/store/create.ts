import { NextApiRequest, NextApiResponse } from 'next';
import Store from '../../../models/Store';
import connectToDatabase from '@/lib/db';
import jwt from 'jsonwebtoken';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const {
    name,
    address,
    city,
    pincode,
    ownerName,
    timings,
    isOpen,
    pricePerDay,
    pricePerMonth,
    contactNumber,
    description,
    capacity,
    email,
    images,
    latitude,
    longitude,
    amenities,
  } = req.body;

  if (
    !name ||
    !address ||
    !city ||
    !pincode ||
    !ownerName ||
    !timings ||
    !pricePerDay ||
    !pricePerMonth ||
    !capacity ||
    !contactNumber ||
    !email ||
    !latitude ||
    !longitude ||
    !amenities
  ) {
    return res.status(400).json({ message: 'All fields are required except description' });
  }

  try {
    // Verify token and check if the user is an admin
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) throw new Error('Missing token');

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_secret_key') as {
      email: string; role: string 
};
    if (decoded.role !== 'admin') throw new Error('Unauthorized');
     console.log("dd ",decoded);
     
    await connectToDatabase();

    const store = new Store({
      name,
      address,
      city,
      pincode,
      ownerName,
      timings,
      isOpen: isOpen ?? false, // Defaults to false if not provided
      pricePerDay,
      pricePerMonth,
      contactNumber,
      description,
      capacity,
      email,
      images,
      latitude,
      longitude,
      amenities,
      createdBy:decoded.email
    });

    await store.save();

    return res.status(201).json({ message: 'Store created successfully', store });
  } catch (error) {
    if (error instanceof Error) {
      console.error(error.message);
      return res.status(401).json({ message: error.message });
    }
    console.error('Unknown error occurred:', error);
    return res.status(500).json({ message: 'An unexpected error occurred' });
  }
}
