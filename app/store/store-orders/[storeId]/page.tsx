"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Cookies from "js-cookie";
import { PlusCircle, Search, Filter, SortDesc } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { OrderCard } from "@/components/order-card";
import { useParams, useRouter } from "next/navigation";

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
  paymentStatus: string;
  totalAmount: number;
  currency: string;
}

export default function StoreOrdersPage() {
  const router = useRouter();
  const params = useParams();
  const storeId = params?.storeId; // Safely access orderId

  const [orders, setOrders] = useState<Order[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortBy, setSortBy] = useState("date");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOrders = async () => {
      setLoading(true);
      try {
        const token = Cookies.get("authToken");
        if (!token) {
          throw new Error("Authentication token not found");
        }
        // /store/getOrders?storeId=${storeId}
        const response = await fetch(
          `/api/store/getOrders?storeId=${storeId}`,
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
        setOrders(data.orders);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "An error occurred while fetching orders"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [storeId]);

  const handleEditOrder = (orderId: string) => {
    router.push(`edit/${orderId}`);
  };

  const filteredOrders = orders
    .filter(
      (order) =>
        (statusFilter === "all" ||
          order.status.toLowerCase() === statusFilter) &&
        (order._id.toLowerCase().includes(searchTerm.toLowerCase()) ||
          order.status.toLowerCase().includes(searchTerm.toLowerCase()) ||
          order.paymentStatus
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          order.storeId.name.toLowerCase().includes(searchTerm.toLowerCase()))
    )
    .sort((a, b) => {
      if (sortBy === "date") {
        return (
          new Date(b.pickup.date).getTime() - new Date(a.pickup.date).getTime()
        );
      } else if (sortBy === "amount") {
        return b.totalAmount - a.totalAmount;
      }
      return 0;
    });

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
      <div className="max-w-7xl mx-auto">
        <Card className="mb-8 shadow-lg">
          <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-4 sm:space-y-0 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-t-lg p-6">
            <CardTitle className="text-3xl font-bold">Store Orders</CardTitle>
            <Button className="bg-white text-blue-600 hover:bg-blue-50">
              <PlusCircle className="mr-2 h-4 w-4" /> Add New Order
            </Button>
          </CardHeader>
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-4 mb-6">
              <div className="relative flex-1 w-full">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search orders..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-full"
                />
              </div>
              <div className="flex items-center space-x-4 w-full sm:w-auto">
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-full sm:w-[180px]">
                    <Filter className="mr-2 h-4 w-4" />
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="confirmed">Confirmed</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-full sm:w-[180px]">
                    <SortDesc className="mr-2 h-4 w-4" />
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="date">Date</SelectItem>
                    <SelectItem value="amount">Amount</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {loading && (
                <div className="col-span-full text-center py-10">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                  <p className="mt-2 text-gray-500">Loading orders...</p>
                </div>
              )}
              {error && (
                <div className="col-span-full text-center py-10">
                  <p className="text-red-500">{error}</p>
                </div>
              )}
              {!loading && !error && filteredOrders.length === 0 && (
                <div className="col-span-full text-center py-10">
                  <p className="text-gray-500">No orders found.</p>
                </div>
              )}
              {!loading &&
                !error &&
                filteredOrders.map((order) => (
                  <OrderCard
                    key={order._id}
                    order={order}
                    onEdit={() => handleEditOrder(order._id)}
                  />
                ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
