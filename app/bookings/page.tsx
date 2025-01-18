"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CalendarIcon, PackageIcon, MapPinIcon, ClockIcon } from "lucide-react";
import { format, parseISO } from "date-fns";
import Cookies from "js-cookie";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

interface Order {
  _id: string;
  storeId: {
    _id: string;
    name: string;
    address: string;
  };
  pickup: {
    date: string;
    time: string;
  };
  return: {
    date: string;
    time: string;
  };
  luggage: Array<{
    size: string;
    weight: number;
    image: string;
    _id: string;
  }>;
  status: string;
  totalAmount: number;
  currency: string;
}

export default function MyOrdersPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const token = Cookies.get("authToken");
        if (!token) {
          router.push("/signin");
          throw new Error("Token not found in cookies");
        }

        const response = await fetch("/api/orders/get", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error("Failed to fetch orders");
        }

        const data = await response.json();
        setOrders(data.orders);
      } catch (err) {
        console.error(err);
        setError(
          err instanceof Error ? err.message : "An unknown error occurred"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [router]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">My Orders</h1>
        <div className="grid gap-6">
          {[...Array(3)].map((_, index) => (
            <Card key={index}>
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0">
                  <div className="space-y-2 w-full md:w-2/3">
                    <Skeleton className="h-6 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                    <Skeleton className="h-4 w-1/3" />
                  </div>
                  <div className="space-y-2 w-full md:w-1/3 md:text-right">
                    <Skeleton className="h-8 w-24 md:ml-auto" />
                    <Skeleton className="h-10 w-32 md:ml-auto" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div
          className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative"
          role="alert"
        >
          <strong className="font-bold">Error: </strong>
          <span className="block sm:inline">{error}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">My Orders</h1>
      <div className="grid gap-6">
        {orders.map((order) => (
          <Card key={order._id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex justify-between items-center">
                <span>{order.storeId.name}</span>
                <Badge
                  className={
                    order.status === "Confirmed"
                      ? "bg-green-600"
                      : order.status === "Cancelled"
                      ? "bg-red-600"
                      : "bg-gray-600"
                  }
                >
                  {order.status}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="pr-6 pl-6">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0">
                <div className="space-y-2">
                  <div className="flex items-center text-muted-foreground">
                    <MapPinIcon className="mr-2 h-4 w-4" />
                    <span>{order.storeId.address}</span>
                  </div>
                  <div className="flex items-center text-muted-foreground">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    <span>
                      {format(parseISO(order.pickup.date), "MMM d, yyyy")} -{" "}
                      {format(parseISO(order.return.date), "MMM d, yyyy")}
                    </span>
                  </div>
                  <div className="flex items-center text-muted-foreground">
                    <ClockIcon className="mr-2 h-4 w-4" />
                    <span>
                      {order.pickup.time} - {order.return.time}
                    </span>
                  </div>
                  <div className="flex items-center text-muted-foreground">
                    <PackageIcon className="mr-2 h-4 w-4" />
                    <span>
                      {order.luggage.length}{" "}
                      {order.luggage.length === 1 ? "bag" : "bags"}
                    </span>
                  </div>
                </div>
                <div className="space-y-2 md:text-right">
                  <div className="text-lg font-semibold">
                    {order.totalAmount} {order.currency}
                  </div>
                  <Button
                    variant="outline"
                    onClick={() => router.push(`/bookings/${order._id}`)}
                  >
                    View Details
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
