"use client";
interface DecodedToken {
  name: string;
  email: string;
  picture: string;
  // Add other properties if needed
}

import { Suspense, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Cookies from "js-cookie";
// import { FcGoogle } from "react-icons/fc";
import { X } from "lucide-react";

import { useUser } from "@/store/userContext";
import { CredentialResponse, GoogleLogin } from "@react-oauth/google";
import { jwtDecode } from "jwt-decode";
import axios from "axios";
import { useRouter } from "next/navigation";
// import { useRouter } from "next/router";
export default function SignInPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <SignInForm />
    </Suspense>
  );
}
function SignInForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [signUpEmail, setSignUpEmail] = useState("");
  const [signUpPassword, setSignUpPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const { setUser } = useUser();
  // const { callback } = router.query;
  // const searchParams = useSearchParams();
  // const callback = new URLSearchParams(window.location.search).get("callback");
  // const callback = searchParams?.get("callback") || "No location provided";
  // console.log("callback  ", callback);

  // console.log("ccc", callback);

  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Handle email sign in
    console.log("Sign in with email:", email, "password:", password);
    try {
      // Post user data to backend
      const { data } = await axios.post("/api/auth/signin", {
        email: email,
        password: password,
      });

      // Assuming data contains the user object and token
      const { user, token } = data;
      // console.log("dd", data);

      // Set the user in context

      // Set the token in a cookie with an expiration time
      Cookies.set("authToken", token, { expires: 30 }); // 30 days

      // console.log("User successfully logged in:", user);

      // Wait for 2 seconds before navigation
      setTimeout(() => {
        setUser(user);

        router.push("/"); // Default redirect after sign-in

        setLoading(false);
      }, 2000);
    } catch (error) {
      console.error("Error decoding token:", error);
      setError("Failed to sign in with email");
      setLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (signUpPassword !== confirmPassword) {
      setError("Passwords do not match");
      setLoading(false);
      return;
    }

    try {
      const { data } = await axios.post("/api/auth/signup", {
        email: signUpEmail,
        password: signUpPassword,
      });

      const { user, token } = data;

      Cookies.set("authToken", token, { expires: 30 });

      setTimeout(() => {
        setUser(user);

        router.push("/");

        setLoading(false);
      }, 2000);
    } catch (error) {
      console.error("Error signing up:", error);
      setError("Failed to sign up");
      setLoading(false);
    }
  };

  const handleClose = () => {
    router.push("/");
  };

  const handleGoogleLogin = async (response: CredentialResponse) => {
    setGoogleLoading(true);
    setError(null);

    try {
      if (response.credential) {
        // Handle the response if credential is available
        const credential = response.credential;
        console.log("Google Login Success", credential);

        const decoded: DecodedToken = jwtDecode<DecodedToken>(
          response.credential
        );

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

        // Set the token in a cookie with an expiration time
        Cookies.set("authToken", token, { expires: 30 }); // 30 days

        // console.log("User successfully logged in:", user);

        // Wait for 2 seconds before navigation
        setTimeout(() => {
          setUser(user);

          router.push("/"); // Default redirect after sign-in

          setGoogleLoading(false);
        }, 2000);
        // Proceed with your logic here, e.g., sending the credential to your backend
      } else {
        // Handle the case when credential is undefined
        console.error("Google Login Failed: No credential found");
        setError("Google Sign-In Failed");
      }
    } catch (error) {
      console.error("Error decoding token:", error);
      setError("Failed to sign in with Google");
      setGoogleLoading(false);
    }
  };

  return (
    <div className="container flex items-center justify-center min-h-screen">
      <Card className="w-[400px] relative">
        <Button
          variant="ghost"
          size="icon"
          className="absolute right-2 top-2"
          onClick={handleClose}
        >
          <X className="h-4 w-4" />
        </Button>
        <CardHeader>
          <CardTitle>Sign In or Sign Up</CardTitle>
          <CardDescription>
            Create an account or sign in to continue
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="email">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="email">Sign In</TabsTrigger>
              <TabsTrigger value="mobile">Sign Up</TabsTrigger>
            </TabsList>
            <TabsContent value="email">
              <form onSubmit={handleEmailSignIn}>
                <div className="grid w-full items-center gap-4">
                  <div className="flex flex-col space-y-1.5">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="Enter your email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                  <div className="flex flex-col space-y-1.5">
                    <Label htmlFor="email-password">Password</Label>
                    <Input
                      id="email-password"
                      type="password"
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                  </div>
                </div>
                {loading ? (
                  <Button disabled className="w-full mt-6" type="submit">
                    Signing in with with email
                  </Button>
                ) : (
                  <Button className="w-full mt-6" type="submit">
                    Sign in with email
                  </Button>
                )}
              </form>
            </TabsContent>
            <TabsContent value="mobile">
              <form onSubmit={handleSignUp}>
                <div className="grid w-full items-center gap-4">
                  <div className="flex flex-col space-y-1.5">
                    <Label htmlFor="mobile">Email</Label>
                    <Input
                      id="signup-email"
                      type="email"
                      placeholder="Enter your email"
                      value={signUpEmail}
                      onChange={(e) => setSignUpEmail(e.target.value)}
                    />
                  </div>
                  <div className="flex flex-col space-y-1.5">
                    <Label htmlFor="signup-password">Password</Label>
                    <Input
                      id="signup-password"
                      type="password"
                      placeholder="Enter your password"
                      value={signUpPassword}
                      onChange={(e) => setSignUpPassword(e.target.value)}
                    />
                  </div>
                  <div className="flex flex-col space-y-1.5">
                    <Label htmlFor="confirm-password">Confirm Password</Label>
                    <Input
                      id="confirm-password"
                      type="password"
                      placeholder="Confirm your password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                    />
                  </div>
                </div>

                <Button className="w-full mt-6" type="submit">
                  Sign Up
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
        <CardFooter className="flex flex-col">
          <div className="relative w-full">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">
                Or continue with
              </span>
            </div>
          </div>
          {/* <Button
            variant="outline"
            className="w-full mt-6"
            onClick={() => login()}
          >
            <FcGoogle className="mr-2 h-4 w-4" />
            Google
          </Button> */}
          <div className="mt-6">
            {googleLoading ? (
              <Button disabled variant="outline" className="w-full">
                {/* <Loader2 className="w-full animate-spin" /> */}
                Signing in with Google...
              </Button>
            ) : (
              <GoogleLogin
                onSuccess={handleGoogleLogin}
                onError={() => setError("Google Sign-In Failed")}
                size="large"
                width="350"
              />
            )}
            {error && <p className="mt-4 text-sm text-red-500">{error}</p>}
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}