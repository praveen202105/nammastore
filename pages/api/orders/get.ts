import { NextApiRequest, NextApiResponse } from "next";
import Order from "@/models/Order"; // Import the Order model
import { verifyToken } from "@/lib/auth"; // Import token verification function
import connectToDatabase from '@/lib/db';
import "@/models/Store"; // Import the Store model to register the schema


const getOrders = async (req: NextApiRequest, res: NextApiResponse) => {
  // Only allow GET requests
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    // Ensure database is connected
    await connectToDatabase();

    // Authenticate user
    const user = await verifyToken(req);
    if (!user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    // Extract userId from the authenticated user
    const userId = user.id;
   console.log("user Id  ",userId);
   
    // Fetch orders for the authenticated user
    const orders = await Order.find({ userId })
      .sort({ createdAt: -1 }) // Sort orders by creation date in descending order
      .populate("storeId", "name address"); // Populate store details (name, address)

    // Respond with the fetched orders
    return res.status(200).json({
      message: "Orders fetched successfully",
      orders,
    });
  } catch (error) {
    console.error("Error fetching orders:", error);
    return res.status(500).json({
      message: "Error fetching orders",
      // error: error.message,
    });
  }
};

export default getOrders;
