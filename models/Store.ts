import mongoose, { Schema, Document } from "mongoose";

export interface IStore extends Document {
  name: string;
  address: string;
  city: string;
  pincode: string;
  ownerName: string;
  timings: string; // Example: "9:00 AM - 9:00 PM"
  isOpen: boolean;
  pricePerDay: number;
  pricePerMonth: {
    [size: string]: number; // Dynamic pricing based on bag size
  };
  capacity: number;
  contactNumber: string; // To reach the store owner
  description?: string; // Optional: Additional details about the store
  email: string; // Email for communication
  images: string[]; // Array of URLs for store images
  latitude: number; // For geolocation
  longitude: number; // For geolocation
  ratings: number; // Average rating of the store
  totalReviews: number; // Total number of reviews
  amenities: string[]; // List of store amenities (e.g., Wi-Fi, AC)
  createdBy: string; // User ID of the admin/owner who created the store
}

const StoreSchema: Schema = new Schema(
  {
    name: { type: String, required: true },
    address: { type: String, required: true },
    city: { type: String, required: true },
    pincode: { type: String, required: true },
    ownerName: { type: String, required: true },
    timings: { type: String, required: true },
    isOpen: { type: Boolean, required: true, default: true },
    pricePerDay: { type: Number, required: true },
    pricePerMonth: {
      type: Map,
      of: Number, // A Map where the key is the size, and the value is the price
      required: true,
    },
    capacity: { type: Number, required: true },
    contactNumber: { type: String, required: true },
    description: { type: String }, // Optional field
    email: { type: String, required: true }, // New required field
    images: { type: [String]}, // New required field
    latitude: { type: Number, required: true }, // New required field
    longitude: { type: Number, required: true }, // New required field
    ratings: { type: Number, default: 0 }, // New required field
    totalReviews: { type: Number, default: 0 }, // New required field
    amenities: { type: [String], required: true }, // New required field
    createdBy: { type: String, required: true }, // New required field
  },
  { timestamps: true }
);

export default mongoose.models.Store || mongoose.model<IStore>("Store", StoreSchema);
