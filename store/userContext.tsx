"use client";
import React, {
  createContext,
  useState,
  useContext,
  ReactNode,
  useEffect,
} from "react";
import Cookies from "js-cookie";
import { jwtDecode } from "jwt-decode";

interface User {
  name?: string;
  email: string;
  profilePic?: string;
  role: string;
  id: string;
}

interface UserContextType {
  user: User | null;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);

  // Check the cookie and set the user if it exists
  useEffect(() => {
    const token = Cookies.get("authToken");
    if (token) {
      try {
        const decoded: any = jwtDecode(token); // Decode the JWT token
        console.log("ddfdfd ", decoded);

        setUser({
          name: decoded.name,
          email: decoded.email,
          profilePic: decoded.profilePic,
          role: decoded.role,
          id: decoded.id,
        });
      } catch (error) {
        console.error("Error decoding token:", error);
        setUser(null); // Reset user if token is invalid
      }
    }
  }, []);

  return (
    <UserContext.Provider value={{ user, setUser }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) throw new Error("useUser must be used within a UserProvider");
  return context;
};
