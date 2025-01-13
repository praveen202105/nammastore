import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error("Please define the MONGODB_URI environment variable.");
}

// interface Cached {
//   conn: typeof mongoose | null;
//   promise: Promise<typeof mongoose> | null;
// }

// // Extend the global object to include mongooseCache
// declare global {
//   namespace NodeJS {
//     interface Global {
//       mongooseCache: Cached | undefined;
//     }
//   }
// }

// Use `let` for reassignment
const cached = global.mongooseCache || { conn: null, promise: null };

async function connectToDatabase() {
  if (cached.conn) return cached.conn;

  if (!cached.promise) {
    cached.promise = mongoose.connect(MONGODB_URI).then((mongoose) => mongoose);
  }

  cached.conn = await cached.promise;

  // Assign the cached object back to the global variable
  global.mongooseCache = cached;

  return cached.conn;
}

export default connectToDatabase;
