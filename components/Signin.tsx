"use client";

import { useState } from "react";
import axios from "axios";
import Cookies from "js-cookie";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { GoogleLogin } from "@react-oauth/google";
import { jwtDecode } from "jwt-decode";
import { useUser } from "@/store/userContext";
import { Loader2 } from "lucide-react";

export default function SignIn() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { setUser } = useUser();
  const router = useRouter();

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Implement your sign-in logic here
      // For example:
      // const response = await axios.post("/api/auth/signin", { email, password });
      // const { user, token } = response.data;

      // Simulating a successful sign-in for demonstration
      const user = {
        name: "Test User",
        email,
        profilePic: "https://example.com/default-avatar.png",
      };
      const token = "sample-token";

      setUser(user);
      Cookies.set("authToken", token, { expires: 1 / 24 }); // 1 hour
      router.push("/home");
    } catch (error) {
      setError("Invalid email or password");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async (response: any) => {
    setGoogleLoading(true);
    setError(null);

    try {
      const decoded: any = jwtDecode(response.credential);
      console.log("Decoded User Info:", decoded);

      const userProfile = {
        name: decoded.name,
        email: decoded.email,
        picture: decoded.picture,
      };

      // Post user data to backend
      const { data } = await axios.post("/api/auth/google", userProfile);

      // Assuming data contains the user object and token
      const { user, token } = data;

      // Set the user in context
      setUser(user);

      // Set the token in a cookie with an expiration time (e.g., 1 hour)
      Cookies.set("authToken", token, { expires: 1 / 24 }); // 1 hour

      console.log("User successfully logged in:", user);

      // Wait for 2 seconds before navigation
      setTimeout(() => {
        router.push("/profile");
        setGoogleLoading(false);
      }, 2000);
    } catch (error) {
      console.error("Error decoding token:", error);
      setError("Failed to sign in with Google");
      setGoogleLoading(false);
    }
  };

  return (
    <Card className="w-[350px]">
      <CardHeader>
        <CardTitle>Sign In</CardTitle>
        <CardDescription>
          Enter your email and password to sign in
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSignIn}>
          <div className="grid w-full items-center gap-4">
            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="m@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>
        </form>
      </CardContent>
      <CardFooter className="flex flex-col">
        <Button className="w-full" onClick={handleSignIn} disabled={loading}>
          {loading ? "Signing in..." : "Sign In"}
        </Button>
        <div className="relative my-4">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-2 text-muted-foreground">
              Or continue with
            </span>
          </div>
        </div>
        {googleLoading ? (
          <Button disabled className="w-full">
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Signing in with Google...
          </Button>
        ) : (
          <GoogleLogin
            onSuccess={handleGoogleLogin}
            onError={() => setError("Google Sign-In Failed")}
            theme="filled_blue"
            size="large"
            width="350"
          />
        )}
        {error && <p className="mt-4 text-sm text-red-500">{error}</p>}
      </CardFooter>
    </Card>
  );
}
