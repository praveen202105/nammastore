import { NextApiRequest, NextApiResponse } from 'next';
import Order from '@/models/Order';  // Import Order model
import Store from '@/models/Store';  // Import Store model
import { verifyToken } from '@/lib/auth';
import connectToDatabase from '@/lib/db';
import nodemailer from 'nodemailer';

// Create an Order and update the Store capacity
const createOrder = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method === 'POST') {
    const {
      storeId,
      luggage,
      duration,
      pickupDate,
      pickupTime,
      returnDate,
      returnTime,
      paymentMethod,
      paymentStatus,
      transactionId,
      paymentDate,
      discount,
      totalAmount,
      currency,
      // aadhaar,
    } = req.body;

    try {
      await connectToDatabase();

      // Validate data
      const user = await verifyToken(req);
      if (!user) {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      // console.log(storeId,luggage);
      
      if (!storeId  || !pickupDate || !returnDate || !totalAmount || !pickupTime || !returnTime) {
        return res.status(400).json({ message: 'Missing required fields' });
      }

      // Check if the store exists
      const store = await Store.findById(storeId);
      if (!store) {
        return res.status(404).json({ message: 'Store not found' });
      }

      // Calculate the new availability (decrease by total bags)
      const totalBags = luggage.length;
      const newAvailability = store.capacity - totalBags;

      if (newAvailability < 0) {
        return res.status(400).json({ message: 'Not enough storage capacity' });
      }

      // Create a new order
      const newOrder = new Order({
        userId: user.id,
        storeId,
        luggage,
        duration,
        pickup: {
          date: pickupDate,
          time: pickupTime,  // Assuming pickup time is passed in the body
        },
        return: {
          date: returnDate,
          time: returnTime,  // Assuming return time is passed in the body
        },
        paymentMethod,
        paymentStatus: paymentStatus || 'pending',  // Default to 'pending' if not provided
        transactionId,
        paymentDate,
        discount,
        totalAmount,
        currency: currency || 'INR',  // Default to INR if not provided
        // aadhaar,
      });

      // Save the order to the database
      await newOrder.save();

      // Update the store's availability
      store.capacity = newAvailability;
      await store.save();

      // Send confirmation email
      await sendOrderConfirmationEmail(user.email, newOrder);

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

const sendOrderConfirmationEmail = async (userEmail: string, order: any) => {
  try {
    // Configure Nodemailer with SMTP settings
    const transporter = nodemailer.createTransport({
      service: 'gmail', // Use 'gmail', 'sendgrid', etc.
      auth: {
        user: process.env.EMAIL_USER, // Email address from env
        pass: process.env.EMAIL_PASS, // App password or SMTP password
      },
    });

    const mailOptions = {
      from: process.env.SMTP_USER,
      to: userEmail,
      subject: 'Order Confirmation',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px; background-color: #f9f9f9;">
          <h2 style="text-align: center; color: #007bff;">Order Confirmation</h2>
          <p style="font-size: 16px; color: #333;">Dear Customer,</p>
          <p style="font-size: 16px; color: #333;">Your order has been successfully placed. Here are the details:</p>
          
          <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
            <tr>
              <td style="padding: 8px; border: 1px solid #ddd;"><strong>Order ID:</strong></td>
              <td style="padding: 8px; border: 1px solid #ddd;">${order._id}</td>
            </tr>
            <tr>
              <td style="padding: 8px; border: 1px solid #ddd;"><strong>Store:</strong></td>
              <td style="padding: 8px; border: 1px solid #ddd;">${order.storeId}</td>
            </tr>
            <tr>
              <td style="padding: 8px; border: 1px solid #ddd;"><strong>Pickup Date & Time:</strong></td>
              <td style="padding: 8px; border: 1px solid #ddd;">${order.pickup.date} at ${order.pickup.time}</td>
            </tr>
            <tr>
              <td style="padding: 8px; border: 1px solid #ddd;"><strong>Return Date & Time:</strong></td>
              <td style="padding: 8px; border: 1px solid #ddd;">${order.return.date} at ${order.return.time}</td>
            </tr>
            <tr>
              <td style="padding: 8px; border: 1px solid #ddd;"><strong>Total Amount:</strong></td>
              <td style="padding: 8px; border: 1px solid #ddd;">${order.totalAmount} ${order.currency}</td>
            </tr>
          </table>
          
          <p style="font-size: 16px; color: #333;">Thank you for choosing our service!</p>
          <p style="text-align: center; margin-top: 20px;">
            <a  href="${process.env.NEXTAUTH_URL}/bookings/${order._id}" style="background-color: #007bff; color: #fff; padding: 10px 15px; text-decoration: none; border-radius: 5px; display: inline-block;">View Order</a>
          </p>
          
          <p style="text-align: center; color: #777; font-size: 14px;">Need help? <a href="mailto:${process.env.EMAIL_USER }" style="color: #007bff; text-decoration: none;">Contact Support</a></p>
        </div>
      `,
    };
    

    await transporter.sendMail(mailOptions);
    console.log('Order confirmation email sent to:', userEmail);
  } catch (error) {
    console.error('Error sending email:', error);
  }
};

export default createOrder;
