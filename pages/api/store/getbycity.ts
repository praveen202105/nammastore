import { NextApiRequest, NextApiResponse } from 'next';
import StorageLocation from '../../../models/Store';
import connectToDatabase from '../../../lib/db';
import Order from '../../../models/Order';
import { verifyToken } from '@/lib/auth';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  await connectToDatabase();

  try {
    const { city } = req.query;
   console.log("ccccc ",city);
   
    if (!city || typeof city !== 'string') {
      return res.status(400).json({ message: 'City is required and should be a string' });
    }

    const user = await verifyToken(req);

    // Fetch stores filtered by city
    const locations = await StorageLocation.find({ city });

    if (!user || user.role !== 'admin') {
      // If the user is not an admin, return store details without order counts
      return res.status(200).json({ 
        locations: locations.map((location) => location.toObject()) 
      });
    }

    // Fetch order data grouped by store and status
    const orderData = await Order.aggregate([
      { $match: { storeId: { $in: locations.map((location) => location._id) } } },
      { $group: { _id: { storeId: '$storeId', status: '$status' }, count: { $sum: 1 } } },
    ]);

    // Map orders data into a structure keyed by storeId
    const orderStats = orderData.reduce((acc, item) => {
      const { storeId, status } = item._id;
      if (!acc[storeId]) {
        acc[storeId] = { Pending: 0, Confirmed: 0, Cancelled: 0, Completed: 0 };
      }
      acc[storeId][status] = item.count;
      return acc;
    }, {});

    // Add order stats to each store
    const locationsWithStats = locations.map((location) => ({
      ...location.toObject(),
      orders: orderStats[location._id] || { Pending: 0, Confirmed: 0, Cancelled: 0, Completed: 0 },
    }));

    return res.status(200).json({ locations: locationsWithStats });
  } catch (error) {
    console.error('Error fetching data:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}
