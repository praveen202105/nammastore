"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CalendarIcon, MapPinIcon, PackageIcon } from "lucide-react";
import { format } from "date-fns";
import axios from "axios";
import Cookies from "js-cookie";

// Mock data for bookings
const mockBookings = [
  {
    id: "1",
    locationName: "LuggageHero Fulton St",
    dropOffDate: new Date("2023-06-01"),
    pickUpDate: new Date("2023-06-05"),
    bags: 2,
    status: "Active",
  },
  {
    id: "2",
    locationName: "LuggageHero Times Square",
    dropOffDate: new Date("2023-05-15"),
    pickUpDate: new Date("2023-05-20"),
    bags: 1,
    status: "Completed",
  },
  // Add more mock bookings as needed
];

export default function MyOrdersPage() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true); // Loading state
  const [error, setError] = useState(null); // Error state
  const router = useRouter();
  const token = Cookies.get("authToken");
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        if (!token) {
          throw new Error("Token not found in cookies");
        }
        console.log("tokenn ", token);

        const response = await fetch("http://localhost:3000/api/orders/get", {
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
        console.log("ddddd ", data.message);
        setOrders(data.orders);
      } catch (err) {
        console.error(err);
        setError(err.message); // Set error message
      } finally {
        setLoading(false); // Set loading to false after the fetch is done
      }
    };

    fetchBookings();
  }, []);

  useEffect(() => {
    if (orders.length > 0) {
      const simplifiedBookings = orders.map((booking) => ({
        id: booking._id,
        locationName: booking.storeId?.address,
        dropOffDate: booking.pickupDate,
        pickUpDate: booking.returnDate,
        status: booking.status,
        bags: booking.luggage.totalBags,
      }));
      console.log("oo", simplifiedBookings);
      setBookings(simplifiedBookings);
    }
  }, [orders]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-full">
        <span>Loading...</span>{" "}
        {/* You can replace this with a spinner or loading animation */}
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-full text-red-600">
        <span>{error}</span> {/* Display error message */}
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">My Orders</h1>
      <div className="grid gap-6">
        {bookings.map((booking) => (
          <Card key={booking.id} className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
                <div className="space-y-2">
                  <h2 className="text-xl font-semibold">
                    {booking.locationName}
                  </h2>
                  <div className="flex items-center text-muted-foreground">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    <span>
                      {format(booking.dropOffDate, "MMM d, yyyy")} -{" "}
                      {format(booking.pickUpDate, "MMM d, yyyy")}
                    </span>
                  </div>
                  <div className="flex items-center text-muted-foreground">
                    <PackageIcon className="mr-2 h-4 w-4" />
                    <span>
                      {booking.bags} {booking.bags === 1 ? "bag" : "bags"}
                    </span>
                  </div>
                </div>
                <div className="mt-4 md:mt-0 space-y-2 md:text-right">
                  <div
                    className={`inline-block px-2 py-1 rounded-full text-sm font-medium ${
                      booking.status === "confirmed"
                        ? "bg-green-100 text-green-800"
                        : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {booking.status}
                  </div>
                  <div>
                    <Button
                      variant="outline"
                      onClick={() => router.push(`/bookings/${booking.id}`)}
                    >
                      View Details
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
