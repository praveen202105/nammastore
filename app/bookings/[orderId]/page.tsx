"use client";
interface Luggage {
  totalBags: number;
  bags: { _id: string; size: string; weight: number }[];
}

interface OrderDetails {
  _id: string;
  status: string;
  storeName: string;
  storeAddress: string;
  pickupDate: string;
  returnDate: string;
  luggage: Luggage;
  slot: { time: string };
  paymentMethod: string;
  paymentStatus: string;
  transactionId: string;
  discount: number;
  totalAmount: number;
  currency: string;
  images: string[];
}

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Calendar,
  MapPin,
  Package,
  CreditCard,
  ImageIcon,
} from "lucide-react";
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

  const handleCancelBooking = () => {
    // Implement cancellation logic here
    if (orderDetails) console.log("Cancelling booking:", orderDetails._id);
    // After cancellation, you might want to update the order status or redirect
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <span>Loading...</span>{" "}
        {/* You can replace this with a spinner or other loading indicator */}
      </div>
    );
  }

  console.log("orderr ", orderDetails);

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
              variant={
                orderDetails?.status === "Active" ? "default" : "secondary"
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
              <p>{orderDetails?.storeName}</p>
              <p className="text-muted-foreground">
                {orderDetails?.storeAddress}
              </p>
            </div>
            <div className="space-y-2">
              <h3 className="font-semibold flex items-center">
                <Calendar className="mr-2 h-4 w-4" /> Booking Dates
              </h3>
              <p>
                Pickup:{" "}
                {orderDetails?.pickupDate
                  ? format(new Date(orderDetails.pickupDate), "PPP")
                  : "N/A"}
              </p>
              <p>
                Return:{" "}
                {orderDetails?.returnDate
                  ? format(new Date(orderDetails.returnDate), "PPP")
                  : "N/A"}
              </p>
            </div>
          </div>

          <Separator />

          <div>
            <h3 className="font-semibold mb-2 flex items-center">
              <Package className="mr-2 h-4 w-4" /> Luggage Details
            </h3>
            <p>Total Bags: {orderDetails?.luggage.totalBags}</p>
            <ul className="mt-2 space-y-1">
              {orderDetails?.luggage.bags.map((bag) => (
                <li
                  key={bag._id}
                  className="flex justify-between items-center bg-muted p-2 rounded"
                >
                  <span>{bag.size}</span>
                  <span>{bag.weight} kg</span>
                </li>
              ))}
            </ul>
          </div>

          <Separator />

          <div>
            <h3 className="font-semibold mb-2 flex items-center">
              <Calendar className="mr-2 h-4 w-4" /> Slot Information
            </h3>
            {/* <p>Date: {format(new Date(orderDetails.slot.date), "PPP")}</p> */}
            <p>Time: {orderDetails?.slot.time}</p>
          </div>

          <Separator />

          <div>
            <h3 className="font-semibold mb-2 flex items-center">
              <CreditCard className="mr-2 h-4 w-4" /> Payment Information
            </h3>
            <div className="grid gap-2 md:grid-cols-2">
              <p>Method: {orderDetails?.paymentMethod}</p>
              <p>Status: {orderDetails?.paymentStatus}</p>
              <p>Transaction ID: {orderDetails?.transactionId}</p>
              {/* <p>Date: {format(new Date(orderDetails.paymentDate), "PPP")}</p> */}
              <p>Discount: {orderDetails?.discount}%</p>
              <p className="font-medium">
                Total: {orderDetails?.totalAmount} {orderDetails?.currency}
              </p>
            </div>
          </div>

          <Separator />

          <div>
            <h3 className="font-semibold mb-2 flex items-center">
              <ImageIcon className="mr-2 h-4 w-4" /> Images
            </h3>
            <div className="flex flex-wrap gap-4">
              {orderDetails?.images.map((img, index) => (
                <div
                  key={index}
                  className="relative w-24 h-24 rounded-md overflow-hidden"
                >
                  <Image
                    src={img}
                    alt={`Bag ${
                      index !== undefined && index !== null ? index + 1 : 0
                    }`} // Fallback to 0 if index is null or undefined
                    className="w-full h-full object-cover"
                    width={500} // Adjust based on the image dimensions
                    height={500} // Adjust based on the image dimensions
                  />
                </div>
              ))}
            </div>
          </div>

          <Separator />
          {/* 
          <div>
            <h3 className="font-semibold mb-2 flex items-center">
              <FileText className="mr-2 h-4 w-4" /> Aadhaar
            </h3>
            <p>{orderDetails.aadhaar}</p>
          </div> */}

          {/* {orderDetails.status === "Active" && ( */}
          <div className="flex justify-end mt-6">
            <Button variant="destructive" onClick={handleCancelBooking}>
              Cancel Booking
            </Button>
          </div>
          {/* )} */}
        </CardContent>
      </Card>
    </div>
  );
}
