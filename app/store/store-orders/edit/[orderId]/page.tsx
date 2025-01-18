"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import { format } from "date-fns";
import Cookies from "js-cookie";
import {
  Calendar,
  Clock,
  Package,
  Wallet,
  MapPin,
  AlertCircle,
} from "lucide-react";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface Luggage {
  size: string;
  weight: number;
  image: string;
  _id: string;
}

interface Order {
  _id: string;
  pickup: {
    date: string;
    time: string;
  };
  return: {
    date: string;
    time: string;
  };
  storeId: {
    _id: string;
    name: string;
    address: string;
  };
  luggage: Luggage[];
  duration: number;
  status: string;
  verified: boolean;
  paymentStatus: string;
  discount: number;
  totalAmount: number;
  currency: string;
  createdAt: string;
  updatedAt: string;
  storeName: string;
  storeAddress: string;
}

const statusColors = {
  Pending: "bg-yellow-100 text-yellow-800",
  Confirmed: "bg-green-100 text-green-800",
  Cancelled: "bg-red-100 text-red-800",
  Completed: "bg-blue-100 text-blue-800",
};

// export default function EditOrderPage({
//   params,
// }: {
//   params: { orderId: string };
// }) {

export default function EditOrderPage() {
  //   const { orderId } = useParams();
  const params = useParams();
  const orderId = params?.orderId; // Safely access orderId
  const router = useRouter();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const token = Cookies.get("authToken");

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        if (!token) {
          throw new Error("Authentication token not found");
        }
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
          throw new Error("Failed to fetch order");
        }
        const data = await response.json();
        setOrder(data.order);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "An error occurred while fetching the order"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [orderId, token]);

  const handleInputChange = (field: string, value: string | number) => {
    if (order) {
      setOrder({ ...order, [field]: value });
    }
  };

  const handleDateTimeChange = (
    type: "pickup" | "return",
    field: "date" | "time",
    value: string
  ) => {
    if (order) {
      setOrder({
        ...order,
        [type]: { ...order[type], [field]: value },
      });
    }
  };

  const handleLuggageChange = (
    index: number,
    field: "size" | "weight",
    value: string | number
  ) => {
    if (order) {
      const newLuggage = [...order.luggage];
      newLuggage[index] = { ...newLuggage[index], [field]: value };
      setOrder({ ...order, luggage: newLuggage });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!order) return;

    try {
      setIsSaving(true);
      if (!token) {
        throw new Error("Authentication token not found");
      }
      const response = await fetch(`/api/orders/edit?orderId=${order._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(order),
      });

      if (!response.ok) {
        throw new Error("Failed to update order");
      }

      router.push("/store");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "An error occurred while updating the order"
      );
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Alert variant="destructive" className="max-w-md">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Alert className="max-w-md">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Not Found</AlertTitle>
          <AlertDescription>Order not found</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 p-4 md:p-8">
      <Card className="max-w-4xl mx-auto">
        <CardHeader className="space-y-1">
          <div className="flex items-center justify-between">
            <CardTitle className="text-2xl">
              Edit Order #{order._id.slice(-6)}
            </CardTitle>
            <Badge
              className={`${
                statusColors[order.status as keyof typeof statusColors]
              }`}
            >
              {order.status}
            </Badge>
          </div>
          <CardDescription>
            Created on {format(new Date(order.createdAt), "PPP")}
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Status Section */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Order Status</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="status">Status</Label>
                    <Select
                      value={order.status}
                      onValueChange={(value) =>
                        handleInputChange("status", value)
                      }
                    >
                      <SelectTrigger id="status">
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Pending">Pending</SelectItem>
                        <SelectItem value="Confirmed">Confirmed</SelectItem>
                        <SelectItem value="Cancelled">Cancelled</SelectItem>
                        <SelectItem value="Completed">Completed</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="paymentStatus">Payment Status</Label>
                    <Select
                      value={order.paymentStatus}
                      onValueChange={(value) =>
                        handleInputChange("paymentStatus", value)
                      }
                    >
                      <SelectTrigger id="paymentStatus">
                        <SelectValue placeholder="Select payment status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Pending">Pending</SelectItem>
                        <SelectItem value="Paid">Paid</SelectItem>
                        <SelectItem value="Refunded">Refunded</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>

              {/* Payment Section */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Payment Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="totalAmount">Total Amount</Label>
                    <div className="relative">
                      <Wallet className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
                      <Input
                        id="totalAmount"
                        type="number"
                        value={order.totalAmount}
                        onChange={(e) =>
                          handleInputChange(
                            "totalAmount",
                            parseFloat(e.target.value)
                          )
                        }
                        className="pl-9"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="currency">Currency</Label>
                    <Input
                      id="currency"
                      type="text"
                      value={order.currency}
                      onChange={(e) =>
                        handleInputChange("currency", e.target.value)
                      }
                    />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Schedule Section */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Schedule</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h3 className="font-medium">Pickup</h3>
                    <div className="space-y-2">
                      <Label htmlFor="pickupDate">Date</Label>
                      <div className="relative">
                        <Calendar className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
                        <Input
                          id="pickupDate"
                          type="date"
                          value={format(
                            new Date(order.pickup.date),
                            "yyyy-MM-dd"
                          )}
                          onChange={(e) =>
                            handleDateTimeChange(
                              "pickup",
                              "date",
                              e.target.value
                            )
                          }
                          className="pl-9"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="pickupTime">Time</Label>
                      <div className="relative">
                        <Clock className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
                        <Input
                          id="pickupTime"
                          type="time"
                          value={order.pickup.time}
                          onChange={(e) =>
                            handleDateTimeChange(
                              "pickup",
                              "time",
                              e.target.value
                            )
                          }
                          className="pl-9"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="font-medium">Return</h3>
                    <div className="space-y-2">
                      <Label htmlFor="returnDate">Date</Label>
                      <div className="relative">
                        <Calendar className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
                        <Input
                          id="returnDate"
                          type="date"
                          value={format(
                            new Date(order.return.date),
                            "yyyy-MM-dd"
                          )}
                          onChange={(e) =>
                            handleDateTimeChange(
                              "return",
                              "date",
                              e.target.value
                            )
                          }
                          className="pl-9"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="returnTime">Time</Label>
                      <div className="relative">
                        <Clock className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
                        <Input
                          id="returnTime"
                          type="time"
                          value={order.return.time}
                          onChange={(e) =>
                            handleDateTimeChange(
                              "return",
                              "time",
                              e.target.value
                            )
                          }
                          className="pl-9"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Luggage Section */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Luggage Details</CardTitle>
              </CardHeader>
              <CardContent>
                {order.luggage.map((item, index) => (
                  <div key={item._id} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Size</Label>
                        <Select
                          value={item.size}
                          onValueChange={(value) =>
                            handleLuggageChange(index, "size", value)
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select size" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="small">Small</SelectItem>
                            <SelectItem value="medium">Medium</SelectItem>
                            <SelectItem value="large">Large</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>Weight (kg)</Label>
                        <div className="relative">
                          <Package className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
                          <Input
                            type="number"
                            value={item.weight}
                            onChange={(e) =>
                              handleLuggageChange(
                                index,
                                "weight",
                                parseFloat(e.target.value)
                              )
                            }
                            className="pl-9"
                          />
                        </div>
                      </div>
                    </div>
                    {item.image && (
                      <div className="relative w-full h-48 rounded-lg overflow-hidden">
                        <Image
                          src={item.image || "/placeholder.svg"}
                          alt={`Luggage ${index + 1}`}
                          fill
                          className="object-cover"
                        />
                      </div>
                    )}
                    <Separator className="my-4" />
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Store Section */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Store Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Store Name</Label>
                  <Input value={order.storeId.name} disabled />
                </div>
                <div className="space-y-2">
                  <Label>Store Address</Label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
                    <Textarea
                      value={order.storeId.address}
                      className="pl-9 min-h-[80px]"
                      disabled
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-end space-x-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push("/store-orders")}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSaving}>
                {isSaving ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
