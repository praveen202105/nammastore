import mongoose, { Schema, Document } from 'mongoose';

export interface IOrder extends Document {
  userId: mongoose.Types.ObjectId;  // Reference to the user placing the order
  storeId: mongoose.Types.ObjectId;  // Reference to the store where luggage will be stored
  luggage: {
    totalBags: number;               // Total number of bags
    bags: {                          // Array of objects containing size and weight of each bag
      size: string;                   // Size of the luggage (small, medium, large)
      weight: number;                 // Weight of the luggage in kg or lbs
    }[];
  };
  duration: number;                  // Duration of storage in days or months
  price: number;                     // Price calculated based on luggage size and duration
  status: string;                    // Status of the order (pending, confirmed, completed, etc.)
  pickupDate: Date;                  // Date when the luggage will be picked up
  returnDate: Date;                  // Date when the luggage will be returned
  images: string[];                  // Array of image URLs for the luggage
  slot: {                            // Object containing drop off date and time
    date: Date;                      // Date of the luggage drop-off
    time: string;                    // Time for the luggage drop-off (e.g., '10:00 AM')
  };

  // Payment Details
  paymentMethod: string;             // Payment method (e.g., 'credit card', 'paypal')
  paymentStatus: string;             // Payment status (e.g., 'completed', 'pending', 'failed')
  transactionId: string;             // Payment transaction ID
  paymentDate: Date;                 // Date when payment was made
  discount: number;                  // Discount applied to the order
  totalAmount: number;               // Total amount to be paid (after discount)
  currency: string;                  // Currency of the payment (e.g., USD, EUR)

  // Aadhaar Number
  aadhaar: string;                   // Aadhaar number (12 digits)
}

const OrderSchema: Schema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    storeId: { type: Schema.Types.ObjectId, ref: 'Store', required: true },
    luggage: {
      totalBags: { type: Number, required: true },  // Total number of bags
      bags: [{
        size: { type: String, required: true },  // Size of the luggage
        weight: { type: Number, required: true }, // Weight of the luggage
      }],
    },
    duration: { type: Number, required: true },  // Can be in days or months
    price: { type: Number, required: true },
    status: { type: String, default: 'pending' },
    pickupDate: { type: Date, required: true },
    returnDate: { type: Date, required: true },
    images: { type: [String], required: false }, // Array of image URLs
    slot: {                                    // Object for drop-off date and time
      date: { type: Date, required: true },     // Drop-off date
      time: { type: String, required: true },   // Drop-off time (e.g., '10:00 AM')
    },

    // Payment Details
    paymentMethod: { type: String, required: true }, // E.g., 'credit card', 'paypal'
    paymentStatus: { type: String, required: true, default: 'pending' }, // Payment status
    transactionId: { type: String, required: true }, // Payment transaction ID
    paymentDate: { type: Date, required: true },    // Date when payment was made
    discount: { type: Number, default: 0 },         // Discount applied to the order
    totalAmount: { type: Number, required: true },  // Final amount to be paid
    currency: { type: String, required: true },     // Currency of the payment (e.g., 'USD')

    // Aadhaar Number
    aadhaar: { type: String, required: true, match: /^[0-9]{12}$/ },  // Ensure it's a 12-digit number
  },
  { timestamps: true }
);

export default mongoose.models.Order || mongoose.model<IOrder>('Order', OrderSchema);
