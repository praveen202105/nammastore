import { NextApiRequest, NextApiResponse } from 'next';
import Order from '@/models/Order'; // Order model
import Store from '@/models/Store'; // Store model
import { verifyToken } from '@/lib/auth'; // Token verification utility
import connectToDatabase from '@/lib/db';

type LuggageItem = {
  size: string;
  weight: number;
  image: string;
};

type UpdateFields = {
  luggage?: LuggageItem[];
  [key: string]: string | number | boolean | LuggageItem[] | undefined; // Define possible field types

};

const editOrder = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method === 'PUT') {
    const { orderId } = req.query; // Get orderId from query params
    const updateFields: UpdateFields = req.body; // Get fields to update from the request body

    // Verify the token to ensure the user is an admin
    const decodedToken = await verifyToken(req);
    if (!decodedToken) {
      return res.status(403).json({ message: 'Unauthorized to edit orders' });
    }

    try {
      await connectToDatabase();

      // Find the order by ID
      const order = await Order.findById(orderId);
      if (!order) {
        return res.status(404).json({ message: 'Order not found' });
      }

      // Calculate the previous total number of bags in the order
      const previousTotalBags = order.luggage.reduce(
        (total: number, item: LuggageItem) => total + (item.weight || 0),
        0
      );

      // Handle luggage updates and adjust store availability
      if (updateFields.luggage) {
        order.luggage = updateFields.luggage;

        const newTotalBags = updateFields.luggage.reduce(
          (total: number, item: LuggageItem) => total + (item.weight || 0),
          0
        );

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

      // Dynamically update fields in the order
      Object.entries(updateFields).forEach(([key, value]) => {
        if (key !== 'luggage') {
          if (key in order) {
            (order as Record<string, unknown>)[key] = value;
          }
        }
      });

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
