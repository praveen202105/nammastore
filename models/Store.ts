import mongoose, { Schema, Document } from 'mongoose';

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
  },
  { timestamps: true }
);

export default mongoose.models.Store || mongoose.model<IStore>('Store', StoreSchema);
