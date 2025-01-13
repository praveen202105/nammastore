// pages/api/send-otp.ts
import { NextApiRequest, NextApiResponse } from "next";
import nodemailer from "nodemailer";
import connectToDatabase from "@/lib/db";
import Otp from "@/models/Otp" // Assuming Otp model is defined

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ message: "Email is required" });
  }

  // Generate a random 6-digit OTP
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const otpExpiry = Date.now() + 5 * 60 * 1000; // OTP expires in 5 minutes

  // Connect to the database
  await connectToDatabase();

  // Save OTP to the database
  try {
    // Remove any existing OTP for this email
    await Otp.deleteOne({ email });

    // Save the new OTP
    const otpEntry = new Otp({
      email,
      otp,
      expiresAt: new Date(otpExpiry),
    });
    await otpEntry.save();
  } catch (error) {
    console.error("Error saving OTP to database:", error);
    return res.status(500).json({ message: "Failed to save OTP" });
  }

  // Configure nodemailer
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  // Send OTP email
  try {
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Your OTP Code",
      text: `Your OTP code is ${otp}. It is valid for 5 minutes.`,
    });

    return res.status(200).json({ message: "OTP sent successfully" });
  } catch (error) {
    console.error("Error sending email:", error);
    return res.status(500).json({ message: "Failed to send OTP" });
  }
}
