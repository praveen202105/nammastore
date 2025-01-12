"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

import {
  ArrowLeft,
  Calendar,
  MapPin,
  Package,
  CreditCard,
  ImageIcon,
  FileText,
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
// Mock data for a single booking

const mockBookingDetails = {
  id: "1",
  locationName: "LuggageHero Fulton St",
  address: "123 Fulton St, New York, NY 10038",
  dropOffDate: new Date("2023-06-01T10:00:00"),
  pickUpDate: new Date("2023-06-05T14:00:00"),
  bags: [
    { size: "small", price: 50, image: "/placeholder.svg" },
    { size: "medium", price: 75, image: "/placeholder.svg" },
  ],
  status: "Active",
  totalPrice: 125,
};

export default function OrderDetailsPage({
  params,
}: {
  params: { orderId: string };
}) {
  const [booking, setBooking] = useState(mockBookingDetails);
  const router = useRouter();
  const orderId = React.use(params).orderId;

  useEffect(() => {
    if (orderId) {
      console.log(`Fetching details for order ${orderId}`);
      // fetch your booking data based on orderId
      // setBooking(fetchedBooking);
    }
  }, [orderId]);

  const token = Cookies.get("authToken");
  // const [orderId, setOrderId] = useState("");
  const [orderDetails, setOrderDetails] = useState<any>(null);
  const [loading, setLoading] = useState(true); // Added loading state
  // In a real application, you would fetch the booking details here
  // useEffect(() => {
  //   // Simulating an API call
  //   // console.log("tookkk", token);

  //   // console.log(`Fetching details for order ${params.orderId}`);
  //   const oid = params.orderId;
  //   if (oid) setOrderId(oid);
  //   // setBooking(fetchedBooking)
  // }, []);

  useEffect(() => {
    const fetchBookingsdetails = async () => {
      try {
        if (!token) {
          throw new Error("Token not found in cookies");
        }
        // console.log("tokenn ", token);

        const response = await fetch(
          `http://localhost:3000/api/orders/getdetails?orderId=${orderId}`,
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
    console.log("Cancelling booking:", orderDetails._id);
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
              <CardDescription>Order ID: {orderDetails._id}</CardDescription>
            </div>
            <Badge
              variant={
                orderDetails.status === "Active" ? "default" : "secondary"
              }
            >
              {orderDetails.status}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <h3 className="font-semibold flex items-center">
                <MapPin className="mr-2 h-4 w-4" /> Store Information
              </h3>
              <p>{orderDetails.storeName}</p>
              <p className="text-muted-foreground">
                {orderDetails.storeAddress}
              </p>
            </div>
            <div className="space-y-2">
              <h3 className="font-semibold flex items-center">
                <Calendar className="mr-2 h-4 w-4" /> Booking Dates
              </h3>
              <p>Pickup: {format(new Date(orderDetails.pickupDate), "PPP")}</p>
              <p>Return: {format(new Date(orderDetails.returnDate), "PPP")}</p>
            </div>
          </div>

          <Separator />

          <div>
            <h3 className="font-semibold mb-2 flex items-center">
              <Package className="mr-2 h-4 w-4" /> Luggage Details
            </h3>
            <p>Total Bags: {orderDetails.luggage.totalBags}</p>
            <ul className="mt-2 space-y-1">
              {orderDetails.luggage.bags.map((bag) => (
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
            <p>Time: {orderDetails.slot.time}</p>
          </div>

          <Separator />

          <div>
            <h3 className="font-semibold mb-2 flex items-center">
              <CreditCard className="mr-2 h-4 w-4" /> Payment Information
            </h3>
            <div className="grid gap-2 md:grid-cols-2">
              <p>Method: {orderDetails.paymentMethod}</p>
              <p>Status: {orderDetails.paymentStatus}</p>
              <p>Transaction ID: {orderDetails.transactionId}</p>
              {/* <p>Date: {format(new Date(orderDetails.paymentDate), "PPP")}</p> */}
              <p>Discount: {orderDetails.discount}%</p>
              <p className="font-medium">
                Total: {orderDetails.totalAmount} {orderDetails.currency}
              </p>
            </div>
          </div>

          <Separator />

          <div>
            <h3 className="font-semibold mb-2 flex items-center">
              <ImageIcon className="mr-2 h-4 w-4" /> Images
            </h3>
            <div className="flex flex-wrap gap-4">
              {orderDetails.images.map((img, index) => (
                <div
                  key={index}
                  className="relative w-24 h-24 rounded-md overflow-hidden"
                >
                  <img
                    src={img}
                    alt={`Order image ${index + 1}`}
                    layout="fill"
                    objectFit="cover"
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
