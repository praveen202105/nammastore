import { NextApiRequest, NextApiResponse } from 'next';
import StorageLocation from '../../../models/Store';
import connectToDatabase  from '../../../lib/db';
import Order from '../../../models/Order';
import { verifyToken } from '@/lib/auth';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  await connectToDatabase();


  try {
    // Fetch all stores
    const locations = await StorageLocation.find();
    const user = await verifyToken(req);
    if (!user || user.role !== 'admin') {
      // If user is not an admin, return only store details without order counts
      const locations = await StorageLocation.find();
      return res.status(200).json({ locations: locations.map((location) => location.toObject()) });
    }
    
    // Fetch order data grouped by store and status
    const orderData = await Order.aggregate([
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