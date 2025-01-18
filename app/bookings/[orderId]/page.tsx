"use client";

interface OrderDetails {
  _id: string;
  status: string;
  storeId: {
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
  luggage: {
    size: string;
    weight: number;
    image: string;
  }[];
  duration: number;
  paymentStatus: string;
  totalAmount: number;
  currency: string;
}

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Calendar, MapPin, Package, CreditCard } from "lucide-react";
import { format } from "date-fns";
import Cookies from "js-cookie";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import Image from "next/image";
// import { StaticImport } from "next/dist/shared/lib/get-img-props";
// Mock data for a single booking

interface OrderDetailsProps {
  params: Promise<{ orderId: string }>;
}

export default function OrderDetailsPage({ params }: OrderDetailsProps) {
  const [orderId, setOrderId] = useState<string | null>(null);

  const router = useRouter();

  // Use React.use to unwrap the Promise
  useEffect(() => {
    const fetchOrderId = async () => {
      const resolvedParams = await params; // Unwrap the params Promise
      setOrderId(resolvedParams.orderId); // Set the orderId
    };

    fetchOrderId();
  }, [params]);

  useEffect(() => {
    if (orderId) {
      console.log(`Fetching details for order ${orderId}`);
      // fetch your booking data based on orderId
      // setBooking(fetchedBooking);
    }
  }, [orderId]);

  const token = Cookies.get("authToken");
  const [orderDetails, setOrderDetails] = useState<OrderDetails | null>(null);

  const [loading, setLoading] = useState(true); // Added loading state

  useEffect(() => {
    const fetchBookingsdetails = async () => {
      try {
        if (!token) {
          throw new Error("Token not found in cookies");
        }
        // console.log("tokenn ", token);

        const response = await fetch(
          `/api/orders/getdetails?orderId=${orderId}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!response.ok) {
          throw new Error("Failed to fetch orders");
        }

        const data = await response.json();
        console.log("ddd ", data.order);

        setOrderDetails(data.order);
        // console.log("ddddd ", data);
        // setOrders(data.orders);
      } catch (err) {
        console.error(err);
        // setError(err.message); // Set error message
      } finally {
        setLoading(false); // Set loading to false after the fetch is done
      }
    };
    if (orderId) fetchBookingsdetails();
  }, [token, orderId]);

  const handleCancelBooking = async () => {
    if (!orderDetails) return;

    try {
      const response = await fetch(
        `/api/orders/edit?orderId=${orderDetails._id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`, // Include the token if necessary
          },
          body: JSON.stringify({ status: "Cancelled" }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to cancel booking");
      }

      const data = await response.json();
      console.log("Booking cancelled successfully:", data);

      // Update the UI to reflect the cancellation
      setOrderDetails((prev) => prev && { ...prev, status: "Cancelled" });
    } catch (error) {
      console.error("Error cancelling booking:", error);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <span>Loading...</span>{" "}
        {/* You can replace this with a spinner or other loading indicator */}
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Button variant="ghost" className="mb-6" onClick={() => router.back()}>
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to My Orders
      </Button>
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="text-2xl">Order Details</CardTitle>
              <CardDescription>Order ID: {orderDetails?._id}</CardDescription>
            </div>

            <Badge
              className={
                orderDetails?.status === "Confirmed"
                  ? "bg-green-600"
                  : orderDetails?.status === "Cancelled"
                  ? "bg-red-600"
                  : "bg-gray-600"
              }
            >
              {orderDetails?.status}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <h3 className="font-semibold flex items-center">
                <MapPin className="mr-2 h-4 w-4" /> Store Information
              </h3>
              <p>{orderDetails?.storeId.name}</p>
              <p className="text-muted-foreground">
                {orderDetails?.storeId.address}
              </p>
            </div>
            <div className="space-y-2">
              <h3 className="font-semibold flex items-center">
                <Calendar className="mr-2 h-4 w-4" /> Booking Dates
              </h3>
              <p>
                Drop-off:{" "}
                {orderDetails?.pickup?.date
                  ? format(new Date(orderDetails.pickup.date), "PPP")
                  : "N/A"}{" "}
                at {orderDetails?.pickup?.time || "N/A"}
              </p>
              <p>
                Pick-up:{" "}
                {orderDetails?.return?.date
                  ? format(new Date(orderDetails?.return?.date), "PPP")
                  : "N/A"}{" "}
                at {orderDetails?.return?.time || "N/A"}
              </p>
              <p>Duration: {orderDetails?.duration ?? "N/A"} days</p>
            </div>
          </div>

          <Separator />

          <div>
            <h3 className="font-semibold mb-2 flex items-center">
              <Package className="mr-2 h-4 w-4" /> Luggage Details
            </h3>
            <p>Total Bags: {orderDetails?.luggage.length}</p>
            <div className="mt-2 space-y-4">
              {orderDetails?.luggage.map((bag, index) => (
                <div
                  key={index}
                  className="flex items-center space-x-4 bg-muted p-2 rounded"
                >
                  <Image
                    src={bag.image}
                    alt={`Bag ${index + 1}`}
                    width={60}
                    height={60}
                    className="rounded-md object-cover"
                  />
                  <div>
                    <p className="font-medium">{bag.size} bag</p>
                    <p className="text-sm text-muted-foreground">
                      {bag.weight} kg
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <Separator />

          <div>
            <h3 className="font-semibold mb-2 flex items-center">
              <CreditCard className="mr-2 h-4 w-4" /> Payment Information
            </h3>
            <div className="grid gap-2 md:grid-cols-2">
              <p>Status: {orderDetails?.paymentStatus}</p>
              <p className="font-medium">
                Total: {orderDetails?.totalAmount} {orderDetails?.currency}
              </p>
            </div>
          </div>

          <Separator />

          <div className="flex justify-end mt-6">
            <Button
              variant="destructive"
              disabled={orderDetails?.status !== "Pending"}
              onClick={handleCancelBooking}
            >
              Cancel Booking
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
