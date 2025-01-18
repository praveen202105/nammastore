"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { usePathname } from "next/navigation";
import { LogOut, User, Luggage, ShoppingBag } from "lucide-react";
import { useUser } from "@/store/userContext";
import { useEffect, useState } from "react";
import Cookies from "js-cookie";
import { useRouter } from "next/navigation";

export function Navigation() {
  const pathname = usePathname();
  const router = useRouter();

  const { user, setUser } = useUser();
  console.log("usee ", user);

  const [isLoggedIn, setIsLoggedIn] = useState(false); // Replace with actual auth state
  if (user && !isLoggedIn) setIsLoggedIn(true);
  useEffect(() => {
    if (user) setIsLoggedIn(true);
    else setIsLoggedIn(false);
  }, [user]);

  const handleLogout = () => {
    // Clear user state
    setUser(null);

    // Remove the auth token from cookies
    Cookies.remove("authToken");

    // Redirect to sign-in page
    router.push("/");
  };

  const getInitials = (name: string) => {
    if (!name) return "";
    return name
      .split(" ")
      .map((word) => word[0]?.toUpperCase())
      .join("");
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
      <div className="container flex h-16 items-center">
        <Link href="/" className="flex items-center space-x-2">
          <Luggage className="h-6 w-6 text-primary" />
          <span className="font-bold text-xl text-primary">NammaStore</span>
        </Link>

        <nav className="flex items-center space-x-6 ml-6">
          {user?.role == "admin" && (
            <>
              <Link
                href="/store/create"
                className={`text-sm font-medium transition-colors hover:text-primary ${
                  pathname === "/store/create"
                    ? "text-primary"
                    : "text-muted-foreground"
                }`}
              >
                Add Store
              </Link>

              <Link
                href="/store"
                className={`text-sm font-medium transition-colors hover:text-primary ${
                  pathname === "/search"
                    ? "text-primary"
                    : "text-muted-foreground"
                }`}
              >
                DashBoard
              </Link>
            </>
          )}
          <Link
            href="/bookings"
            className={`text-sm font-medium transition-colors hover:text-primary ${
              pathname === "/bookings"
                ? "text-primary"
                : "text-muted-foreground"
            }`}
          >
            <ShoppingBag className="h-4 w-4 inline-block mr-1" />
            My Bookings
          </Link>
        </nav>
        <div className="ml-auto flex items-center space-x-4">
          {isLoggedIn ? (
            <>
              {user?.role == "admin" && <span>Admin</span>}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="relative h-8 w-8 rounded-full"
                  >
                    <Avatar className="h-8 w-8">
                      <AvatarFallback>
                        {" "}
                        {getInitials(user?.name || "User")}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem asChild>
                    <Link href="/bookings" className="flex items-center">
                      <User className="mr-2 h-4 w-4" />
                      My bookings
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleLogout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    Log out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <Button asChild variant="ghost">
              <Link href="/signin">Sign in</Link>
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
