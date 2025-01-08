import { NextApiRequest, NextApiResponse } from "next";
import jwt from "jsonwebtoken";
import connectToDatabase from "@/lib/db";
import User from "@/models/User";
import Otp from "@/models/Otp"; // Assuming you have an Otp schema for storing OTPs

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const { email, otp } = req.body;

  if (!email || !otp) {
    return res.status(400).json({ message: "Email and OTP are required." });
  }

  await connectToDatabase();

  // Verify OTP
  const existingOtp = await Otp.findOne({ email });
  if (!existingOtp || existingOtp.otp !== otp) {
    return res.status(401).json({ message: "Invalid OTP or OTP expired." });
  }

  // Check if user already exists
  let user = await User.findOne({ email });

  if (!user) {
    // If user doesn't exist, create a new user
    const defaultName = email.split("@")[0]; // Use part of email as default name
    user = new User({
      name: defaultName,
      email,
      password: "1", // Since OTP is used for auth, leave password null
      role: "user", // Default role
    });

    await user.save();
  }

  // Generate JWT token
  const token = jwt.sign(
    { id: user._id, email: user.email, role: user.role },
    process.env.JWT_SECRET || "your_jwt_secret",
    { expiresIn: "7d" }
  );

  // Clean up OTP after verification
  await Otp.deleteOne({ email });

  return res.status(200).json({
    message: "User verified successfully",
    token,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
  });
}
