import { NextApiRequest, NextApiResponse } from 'next';
import { verifyToken } from '@/lib/auth'; // Token verification utility
import Order from '@/models/Order'; // Order model
import Store from '@/models/Store'; // Store model

// Create an API to get all orders for a store (Admin or Store Owner Only)
const getOrdersForStore = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method === 'GET') {
    const { storeId } = req.query; // Store ID passed as a query parameter
    if (!storeId) {
      return res.status(400).json({ message: 'Store ID is required' });
    }

    // Verify the token to ensure the user is either an admin or the store owner
    const decodedToken = await verifyToken(req);
    if (!decodedToken) {
      return res.status(401).json({ message: 'Unauthorized: No token provided' });
    }

    try {
      // Check if the user is authorized to view this store's orders
      const store = await Store.findById(storeId);
      if (!store) {
        return res.status(404).json({ message: 'Store not found' });
      }

      // If the user is not an admin or the store owner, deny access
    //   && decodedToken.id !== store.ownerId.toString()
      if (decodedToken.role !== 'admin') {
        return res.status(403).json({ message: 'Forbidden: You are not authorized to view this store\'s orders' });
      }

      // Query orders for the specific store
    //   const orders = await Order.find({ storeId }).sort({ createdAt: -1 }); // Sort orders by creation date (most recent first)
    const orders = await Order.find({ storeId })
    // .select('_id pickupDate returnDate luggage paymentStatus status') // Get the whole luggage object
    .sort({ createdAt: -1 });
  
  // const ordersWithTotalBags = orders.map(order => ({
  //   _id: order._id,
  //   pickupDate: order.pickupDate,
  //   returnDate: order.returnDate,
  //   totalBags: order.luggage.totalBags, // Directly access the totalBags
  //   PaymentStatus:order.paymentStatus,
  //   OrderStatus:order.status
  // }));
    
      // Return orders
      return res.status(200).json({ orders });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: 'Error retrieving orders', error });
    }
  } else {
    return res.status(405).json({ message: 'Method not allowed' });
  }
};

export default getOrdersForStore;
