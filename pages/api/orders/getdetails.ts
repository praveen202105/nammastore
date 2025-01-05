import { NextApiRequest, NextApiResponse } from 'next';
import Order from '@/models/Order'; // Adjust the path if needed
import { verifyToken } from '@/lib/auth';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { orderId } = req.query;  // Extract orderId from the query parameters

  if (!orderId) {
    return res.status(400).json({ message: 'Order ID is required' });
  }

  try {

    const decodedToken = await verifyToken(req);

    if (!decodedToken) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    // Find the order by ID
    const order = await Order.findById(orderId);
    if (decodedToken.role !== 'admin' && order.userId.toString() !== decodedToken.id) {
        return res.status(403).json({ message: 'Forbidden: You are not authorized to access this order' });
      }
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }


    // Send the order data in the response
    return res.status(200).json(order);
  } catch (error) {
    console.error('Error fetching order:', error);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
}
