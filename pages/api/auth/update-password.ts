// pages/api/update-password.ts
import { NextApiRequest, NextApiResponse } from "next";
import bcrypt from "bcrypt";
import connectToDatabase from "@/lib/db";
import Otp from "@/models/Otp" // Otp model
import User from "@/models/User"; // User model

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const { email, password, otp } = req.body;

  if (!email || !password || !otp) {
    return res.status(400).json({ message: "Email, password, and OTP are required" });
  }

  await connectToDatabase();

  // Validate OTP
  try {
    const otpEntry = await Otp.findOne({ email });

    if (!otpEntry) {
      return res.status(404).json({ message: "OTP not found or expired" });
    }

    // Check if OTP is valid
    if (otpEntry.otp !== otp) {
      return res.status(400).json({ message: "Invalid OTP" });
    }

    if (Date.now() > new Date(otpEntry.expiresAt).getTime()) {
      return res.status(400).json({ message: "OTP has expired" });
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Update user's password
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.password = hashedPassword;
    await user.save();

    // Remove OTP entry after successful password reset
    await Otp.deleteOne({ email });

    return res.status(200).json({ message: "Password updated successfully" });
  } catch (error) {
    console.error("Error updating password:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
}
