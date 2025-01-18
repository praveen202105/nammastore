import { NextApiRequest, NextApiResponse } from "next";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import connectToDatabase from "@/lib/db";
import User from "@/models/User";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { email, password, role } = req.body;

  if ( !email || !password) {
    return res.status(400).json({ message: 'email, and password are required' });
  }

  await connectToDatabase();

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return res.status(409).json({ message: 'User already exists' });
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const user = new User({ 
    email, 
    password: hashedPassword, 
    role: role || "user" // Default role is "user" if not provided
  });

  await user.save();

  // Generate JWT token
  const token = jwt.sign(
    { id: user._id, email: user.email, role: user.role },
    process.env.JWT_SECRET || "your_jwt_secret", // Use a secure secret from environment variables
    { expiresIn: "7d" } // Token expires in 7 days
  );

  return res.status(201).json({
    message: 'User created successfully',
    token,
    user: {
      id: user._id,
      email: user.email,
      role: user.role,
    },
  });
}
