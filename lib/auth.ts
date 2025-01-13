import jwt from 'jsonwebtoken';
import { NextApiRequest } from 'next';

export interface DecodedToken {
  id: string;
  email: string;
  role: string;
}

export const verifyToken = async (req: NextApiRequest): Promise<DecodedToken | null> => {
  const token = req.headers.authorization?.split(' ')[1]; // Assuming Bearer token
  // console.log("tookkkn ",token);
  
  if (!token) return null;

  try {
    // First cast to 'unknown' and then to 'DecodedToken'
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "secret") as unknown;
  //  console.log("ddd ",decoded);
   
    // Ensure decoded has the correct structure
    if (decoded && typeof decoded === 'object' && 'id' in decoded && 'email' in decoded && 'role' in decoded) {
      return decoded as DecodedToken;
    } else {
      // console.log("nullll");
      
      return null;
    }
  } catch (error) {
    console.log("eeeee ",error);
    
    return null;
  }
};
