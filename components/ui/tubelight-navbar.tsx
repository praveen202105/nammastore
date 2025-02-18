"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { LayoutDashboard, LogOut, LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Home,
  User,
  Briefcase,
  FileText,
  Store,
  Book,
  LogIn,
} from "lucide-react";
import { useUser } from "@/store/userContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "./button";
import Cookies from "js-cookie";
import { usePathname, useRouter } from "next/navigation";
import { Avatar, AvatarFallback } from "./avatar";
interface NavItem {
  name: string;
  url: string;
  icon: LucideIcon;
}

const defaultNavItems = [
  { name: "My Bookings", url: "/bookings", icon: Book },
  { name: "NammaStore", url: "/", icon: Store },
  { name: "Sign In", url: "/signin", icon: LogIn },
];

export function NavBar() {
  const [items, setItems] = useState(defaultNavItems);
  const [activeTab, setActiveTab] = useState("NammaStore");
  const [isMobile, setIsMobile] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const { user, setUser } = useUser();
  console.log("usee ", user);

  const [isLoggedIn, setIsLoggedIn] = useState(false); // Replace with actual auth state
  if (user && !isLoggedIn) setIsLoggedIn(true);
  useEffect(() => {
    if (user) {
      let newItems = defaultNavItems.filter((item) => item.name !== "Sign In");
      setIsLoggedIn(true);
      if (user.role == "admin") {
        setItems([
          ...newItems,
          { name: "Add Store", url: "/admin/store", icon: Store },
          { name: "Dashboard", url: "/admin/dashboard", icon: LayoutDashboard },
        ]);
      } else {
        setItems(newItems);
      }
    }
    {
      setIsLoggedIn(false);
    }
  }, [user]);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);
  const handleLogout = () => {
    setUser(null);

    Cookies.remove("authToken");

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
    <div
      className={cn(
        "fixed bottom-0 sm:top-0 left-1/2 -translate-x-1/2 z-50 mb-6 sm:pt-6"
      )}
    >
      <div className="flex items-center gap-3 bg-background/5 border border-border backdrop-blur-lg py-1 px-1 rounded-full shadow-lg">
        {items.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.url || (pathname === "/" && item.url === "/");
          return (
            <Link
              key={item.name}
              href={item.url}
              onClick={() => setActiveTab(item.name)}
              className={cn(
                "relative cursor-pointer text-sm font-semibold px-6 py-2 rounded-full transition-colors",
                "text-foreground/80 hover:text-primary",
                isActive && "bg-muted text-primary"
              )}
            >
              <span className="hidden md:inline">{item.name}</span>
              <span className="md:hidden">
                <Icon size={18} strokeWidth={2.5} />
              </span>
              {isActive && (
                <motion.div
                  layoutId="lamp"
                  className="absolute inset-0 w-full bg-primary/5 rounded-full -z-10"
                  initial={false}
                  transition={{
                    type: "spring",
                    stiffness: 300,
                    damping: 30,
                  }}
                >
                  <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-8 h-1 bg-primary rounded-t-full">
                    <div className="absolute w-12 h-6 bg-primary/20 rounded-full blur-md -top-2 -left-2" />
                    <div className="absolute w-8 h-6 bg-primary/20 rounded-full blur-md -top-1" />
                    <div className="absolute w-4 h-4 bg-primary/20 rounded-full blur-sm top-0 left-2" />
                  </div>
                </motion.div>
              )}
            </Link>
          );
        })}
        {user && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                <Avatar className="h-8 w-8">
                  <AvatarFallback>
                    {" "}
                    {getInitials(user?.name || "User")}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={handleLogout}>
                <LogOut className="mr-2 h-4 w-4" />
                Log out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    </div>
  );
}
