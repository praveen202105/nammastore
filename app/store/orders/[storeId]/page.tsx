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
// import { EditOrderModal } from "@/components/edit-order-modal";
import { OrderCard } from "@/components/order-card";

interface Bag {
  size: string;
  weight: number;
  _id: string;
}

interface Order {
  _id: string;
  luggage: {
    totalBags: number;
    bags: Bag[];
  };
  slot: {
    date: string;
    time: string;
  };
  storeId: {
    _id: string;
    name: string;
    address: string;
  };
  status: string;
  pickupDate: string;
  returnDate: string;
  images: string[];
  paymentStatus: string;
  totalAmount: number;
}

export default function StoreOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  // const [editingOrder, setEditingOrder] = useState<Order | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortBy, setSortBy] = useState("date");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // const handleEditOrder = (order: Order) => {
  //   setEditingOrder(order);
  // };

  useEffect(() => {
    const token = Cookies.get("authToken");
    if (!token) {
      throw new Error("Token not found in cookies");
    }
    const fetchOrderDetails = async () => {
      setLoading(true);
      try {
        const response = await fetch("/api//orders/get", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error("Failed to fetch stores");
        }
        const data = await response.json();
        console.log("ddd ", data.orders);
        setOrders(data.orders);

        // setStores(data.locations);
      } catch (err) {
        setError((err as Error).message);
      } finally {
        setLoading(false);
      }
    };

    fetchOrderDetails();
  }, []);

  // const handleUpdateOrder = async (updatedOrder: Order) => {
  //   console.log("Updating order: ", updatedOrder);

  //   try {
  //     // Make API call to update the order
  //     const response = await fetch(
  //       `/api/orders/edit?orderId=${updatedOrder._id}`,
  //       {
  //         method: "PUT", // Use PUT or PATCH depending on your API design
  //         headers: {
  //           "Content-Type": "application/json",
  //           Authorization: `Bearer ${token}`,
  //         },
  //         body: JSON.stringify(updatedOrder),
  //       }
  //     );

  //     if (!response.ok) {
  //       throw new Error("Failed to update the order");
  //     }

  //     const updatedOrderFromServer = await response.json();
  //     // console.log("ordeee ", updatedOrderFromServer.order);

  //     // Update local state with the updated order
  //     console.log("uuu", updatedOrderFromServer.order);

  //     setOrders(
  //       orders.map((order) =>
  //         order._id === updatedOrder._id ? updatedOrder : order
  //       )
  //     );

  //     console.log("Order updated successfully:", updatedOrderFromServer);
  //   } catch (error) {
  //     console.error("Error updating order:", error);
  //   } finally {
  //     // Close the editing modal or reset the editing state
  //     setEditingOrder(null);
  //   }
  // };

  useEffect(() => {
    console.log("ooo ", orders);
  }, [orders]);

  // const filteredOrders = orders
  //   .filter(
  //     (order) =>
  //       (statusFilter === "all" || order.status === statusFilter) &&
  //       (order._id.toLowerCase().includes(searchTerm.toLowerCase()) ||
  //         order.status.toLowerCase().includes(searchTerm.toLowerCase()) ||
  //         order.paymentStatus.toLowerCase().includes(searchTerm.toLowerCase()))
  //   )
  //   .sort((a, b) => {
  //     if (sortBy === "date") {
  //       return (
  //         new Date(b.pickupDate).getTime() - new Date(a.pickupDate).getTime()
  //       );
  //     } else if (sortBy === "amount") {
  //       return b.totalAmount - a.totalAmount;
  //     }
  //     return 0;
  //   });

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
      <div className="max-w-7xl mx-auto">
        <Card className="mb-8 shadow-lg">
          <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-4 sm:space-y-0 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-t-lg">
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
                    <SelectItem value="confirmed">Confirmed</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
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
                <div className="text-center">
                  <span>Loading...</span>
                </div>
              )}

              {error && (
                <div className="text-center text-red-500">
                  <span>{error}</span>
                </div>
              )}
              {!loading &&
                !error &&
                orders.map((order) => (
                  <OrderCard
                    key={order._id}
                    order={order}
                    // onEdit={() => handleEditOrder(order)}
                  />
                ))}
            </div>
          </CardContent>
        </Card>

        {/* {editingOrder && (
          <EditOrderModal
            order={editingOrder}
            onClose={() => setEditingOrder(null)}
            // onUpdate={handleUpdateOrder}
          />
        )} */}
      </div>
    </div>
  );
}
