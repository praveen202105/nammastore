import { NextApiRequest, NextApiResponse } from 'next';
import Order from  "@/models/Order";;  // Import Order model
import Store from '@/models/Store';  // Import Store model
import { verifyToken } from '@/lib/auth';
import connectToDatabase from '@/lib/db';

// Create an Order and update the Store capacity
const createOrder = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method === 'POST') {
    const {
      storeId,
      luggage,
      duration,
      price,
      status,
      pickupDate,
      returnDate,
      images,
      slot,
      paymentMethod,
      paymentStatus,
      transactionId,
      paymentDate,
      discount,
      totalAmount,
      currency,
      aadhaar,
    } = req.body;

    try {
      await connectToDatabase();

      // Validate data
      const user = await verifyToken(req);
      if (!user) {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      if (!storeId || !luggage || !pickupDate || !returnDate) {
        return res.status(400).json({ message: 'Missing required fields' });
      }

      // Check if the store exists
      const store = await Store.findById(storeId);
      if (!store) {
        return res.status(404).json({ message: 'Store not found' });
      }

      // Calculate the new availability (decrease by total bags)
      const totalBags = luggage.totalBags;
      const newAvailability = store.capacity - totalBags;

      if (newAvailability < 0) {
        return res.status(400).json({ message: 'Not enough storage capacity' });
      }

      // Create a new order
      const newOrder = new Order({
        userId:user.id,
        storeId,
        luggage,
        duration,
        price,
        status,
        pickupDate,
        returnDate,
        images,
        slot,
        paymentMethod,
        paymentStatus,
        transactionId,
        paymentDate,
        discount,
        totalAmount,
        currency,
        aadhaar,
      });

      // Save the order to the database
      await newOrder.save();

      // Update the store's availability
      store.capacity = newAvailability;
      await store.save();

      return res.status(201).json({
        message: 'Order created successfully, store capacity updated',
        order: newOrder,
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: 'Error creating order', error });
    }
  } else {
    return res.status(405).json({ message: 'Method not allowed' });
  }
};

export default createOrder;
