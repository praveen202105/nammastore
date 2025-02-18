"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CalendarIcon, PackageIcon, MapPinIcon, ClockIcon } from "lucide-react";
import { format, parseISO } from "date-fns";
import Cookies from "js-cookie";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";

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
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    const fetchOrders = async () => {
      const token = Cookies.get("authToken");
      if (!token) {
        return;
      }
      setLoading(true);
      try {
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
            <Card key={index} className="overflow-hidden">
              <CardContent className="p-6">
                <div className="flex flex-col space-y-4">
                  <div className="flex justify-between items-center">
                    <Skeleton className="h-6 w-1/3" />
                    <Skeleton className="h-6 w-20" />
                  </div>
                  <Skeleton className="h-4 w-full" />
                  <div className="flex justify-between items-center">
                    <Skeleton className="h-4 w-1/4" />
                    <Skeleton className="h-4 w-1/4" />
                  </div>
                  <div className="flex justify-between items-center">
                    <Skeleton className="h-4 w-1/3" />
                    <Skeleton className="h-10 w-28" />
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
          className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg"
          role="alert"
        >
          <strong className="font-bold">Error: </strong>
          <span className="block sm:inline">{error}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col justify-center  px-4 py-8">
      {orders.length > 0 ? (
        <>
          <h1 className="text-2xl font-bold mb-6">My Orders</h1>
          <div className="grid gap-6">
            {orders.map((order) => (
              <Card
                key={order._id}
                className="overflow-hidden hover:shadow-lg transition-shadow duration-300"
              >
                <CardHeader className="bg-gray-50 dark:bg-gray-800">
                  <CardTitle className="flex justify-between items-center">
                    <span className="text-lg font-semibold">
                      {order.storeId.name}
                    </span>
                    <Badge
                      className={
                        order?.status === "Confirmed"
                          ? "bg-green-600"
                          : order?.status === "Cancelled"
                          ? "bg-red-600"
                          : "bg-gray-600"
                      }
                    >
                      {order.status}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0">
                    <div className="space-y-3 flex-grow">
                      <div className="flex items-center text-sm text-muted-foreground">
                        <MapPinIcon className="mr-2 h-4 w-4 flex-shrink-0" />
                        <span className="truncate">
                          {order.storeId.address}
                        </span>
                      </div>
                      <div className="flex items-center text-sm text-muted-foreground">
                        <CalendarIcon className="mr-2 h-4 w-4 flex-shrink-0" />
                        <span>
                          {format(parseISO(order.pickup.date), "MMM d, yyyy")} -{" "}
                          {format(parseISO(order.return.date), "MMM d, yyyy")}
                        </span>
                      </div>
                      <div className="flex items-center text-sm text-muted-foreground">
                        <ClockIcon className="mr-2 h-4 w-4 flex-shrink-0" />
                        <span>
                          {order.pickup.time} - {order.return.time}
                        </span>
                      </div>
                      <div className="flex items-center text-sm text-muted-foreground">
                        <PackageIcon className="mr-2 h-4 w-4 flex-shrink-0" />
                        <span>
                          {order.luggage.length}{" "}
                          {order.luggage.length === 1 ? "bag" : "bags"}
                        </span>
                      </div>
                    </div>
                    <div className="flex flex-col items-end space-y-3 md:ml-4">
                      <div className="text-xl font-bold">
                        {order.totalAmount} {order.currency}
                      </div>
                      <Button
                        onClick={() => router.push(`/bookings/${order._id}`)}
                        className="w-full md:w-auto"
                      >
                        View Details
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </>
      ) : (
        <div className="mx-auto py-10">
          <h2 className="text-2xl font-semibold text-gray-700 dark:text-gray-300 mb-4">
            No Orders Yet
          </h2>
          <p className="text-gray-500 dark:text-gray-400 mb-8">
            You haven't booked anything yet. Start your journey by making your
            first booking!
          </p>
            <Button
              onClick={() => router.push("/")}
            >
              Explore Stores
            </Button>
        </div>
      )}
    </div>
  );
}
