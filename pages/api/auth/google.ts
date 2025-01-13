import type { NextApiRequest, NextApiResponse } from 'next';
import connectToDatabase from "@/lib/db";
import jwt from 'jsonwebtoken'; // You need to install jsonwebtoken package
import User from '@/models/User'; // Import your user model

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Connect to the database
  await connectToDatabase();
  if (req.method === 'POST') {
    const { name, email, picture } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    try {
      // Check if user already exists
      let user = await User.findOne({ email });

      if (!user) {
        // Create a new user if not found
        user = await User.create({
          name, 
          email,
          imageUrl: picture,
          password:Math.random() // Store the Google profile picture
        });
      }

      // const token = jwt.sign(
      //   { email: user.email, name: user.name, profilePic: user.imageUrl },
      //   SECRET_KEY||"", 
      //   { expiresIn: '1h' } // Set expiration time for the token
      // );

      console.log("userrr", user);
      
      const token = jwt.sign({ id: user._id, email: user.email, role: user.role ,name,profilePic: picture}, process.env.JWT_SECRET || 'secret', {
        expiresIn: '7d',
      });
      res.status(200).json({
        user: {
          name,
          email,
          profilePic: picture,
        },
        token, // Send the token back to the client
      });
    } catch (error) {
      console.error('Error creating or retrieving user:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
