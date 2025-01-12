import { NextApiRequest, NextApiResponse } from 'next';
import Order from '@/models/Order'; // Order model
import Store from '@/models/Store'; // Store model
import { verifyToken } from '@/lib/auth'; // Token verification utility
import connectToDatabase from '@/lib/db';

// Create an API to edit an order (Admin only)
const editOrder = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method === 'PUT') {
    const { orderId } = req.query; // Get orderId from query params
    const {
      luggage,
      duration,
      price,
      status,
      pickupDate,
      returnDate,
      slot,
      paymentMethod,
      paymentStatus,
      transactionId,
      paymentDate,
      discount,
      totalAmount,
      aadhaar,
    } = req.body;

    // Verify the token to ensure the user is an admin
    const decodedToken = await verifyToken(req);
    if (!decodedToken || decodedToken.role !== 'admin') {
      return res.status(403).json({ message: 'Unauthorized: Only admin can edit orders' });
    }

    try {
      await connectToDatabase();

      // Find the order by ID
      const order = await Order.findById(orderId);
      if (!order) {
        return res.status(404).json({ message: 'Order not found' });
      }

      // Calculate the previous total number of bags in the order
      const previousTotalBags = order.luggage.totalBags;

      // Update the order with new luggage if provided
      if (luggage) {
        order.luggage = luggage;

        // Update total bags
        const newTotalBags = luggage.totalBags;

        // Check if store's capacity needs adjustment
        if (newTotalBags !== previousTotalBags) {
          const store = await Store.findById(order.storeId);
          if (!store) {
            return res.status(404).json({ message: 'Store not found' });
          }

          const newAvailability = store.availability + previousTotalBags - newTotalBags;

          if (newAvailability < 0) {
            return res.status(400).json({ message: 'Not enough storage capacity' });
          }

          store.availability = newAvailability;
          await store.save();
        }
      }

      // Update other fields of the order
      order.duration = duration || order.duration;
      order.price = price || order.price;
      order.status = status || order.status;
      order.pickupDate = pickupDate || order.pickupDate;
      order.returnDate = returnDate || order.returnDate;
      order.slot = slot || order.slot;
      order.paymentMethod = paymentMethod || order.paymentMethod;
      order.paymentStatus = paymentStatus || order.paymentStatus;
      order.transactionId = transactionId || order.transactionId;
      order.paymentDate = paymentDate || order.paymentDate;
      order.discount = discount || order.discount;
      order.totalAmount = totalAmount || order.totalAmount;
      order.aadhaar = aadhaar || order.aadhaar;

      // Save the updated order
      await order.save();

      return res.status(200).json({ message: 'Order updated successfully', order });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: 'Error updating order', error });
    }
  } else {
    return res.status(405).json({ message: 'Method not allowed' });
  }
};

export default editOrder;
