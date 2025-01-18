"use client";
//all store dashboard
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Eye, Store, Box, ShoppingCart } from "lucide-react";
import { StoreOrdersModal } from "@/components/store-orders-modal";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";

interface Store {
  _id: string;
  name: string;
  address: string;
  city: string;
  capacity: number;
  orders: {
    Pending: number;
    Confirmed: number;
    Cancelled: number;
    Completed: number;
    confirmed?: number;
  };
}

export default function AdminDashboard() {
  const router = useRouter();
  const [stores, setStores] = useState<Store[]>([]);
  const [selectedStore, setSelectedStore] = useState<Store | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const token = Cookies.get("authToken");
    if (!token) {
      throw new Error("Token not found in cookies");
    }
    const fetchStores = async () => {
      setLoading(true);
      try {
        const response = await fetch("/api/store/getAllstore", {
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
        console.log("ddd ", data);

        setStores(data.locations);
      } catch (err) {
        setError((err as Error).message);
      } finally {
        setLoading(false);
      }
    };

    fetchStores();
  }, []);

  const totalStores = stores.length;
  const totalCapacity = stores.reduce((sum, store) => sum + store.capacity, 0);
  const totalOrders = stores.reduce((sum, store) => {
    const orderSum = Object.values(store.orders).reduce((a, b) => a + b, 0);
    return sum + orderSum;
  }, 0);

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold mb-8 text-gray-800">
          Admin Dashboard
        </h1>

        {error && (
          <div className="bg-red-100 text-red-800 p-4 rounded mb-6">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-blue-500 text-white">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-lg font-medium">
                Total Stores
              </CardTitle>
              <Store className="h-6 w-6 opacity-75" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{totalStores}</div>
            </CardContent>
          </Card>
          <Card className="bg-green-500 text-white">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-lg font-medium">
                Total Capacity
              </CardTitle>
              <Box className="h-6 w-6 opacity-75" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{totalCapacity}</div>
            </CardContent>
          </Card>
          <Card className="bg-purple-500 text-white">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-lg font-medium">
                Total Orders
              </CardTitle>
              <ShoppingCart className="h-6 w-6 opacity-75" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{totalOrders}</div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Stores</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div>Loading...</div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Address</TableHead>
                    <TableHead>City</TableHead>
                    <TableHead>Capacity</TableHead>
                    <TableHead>Total Orders</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {stores.map((store) => (
                    <TableRow
                      key={store._id}
                      onClick={() => {
                        console.log(`Clicked Store ID: ${store._id}`);
                        router.push(`store/store-orders/${store._id}`);
                      }}
                      className="cursor-pointer hover:bg-gray-100"
                    >
                      <TableCell className="font-medium">
                        {store.name}
                      </TableCell>
                      <TableCell>{store.address}</TableCell>
                      <TableCell>{store.city}</TableCell>
                      <TableCell>{store.capacity}</TableCell>
                      <TableCell>
                        {Object.values(store.orders).reduce((a, b) => a + b, 0)}
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedStore(store);
                          }}
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          View Orders
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {selectedStore && (
          <StoreOrdersModal
            store={selectedStore}
            onClose={() => setSelectedStore(null)}
          />
        )}
      </div>
    </div>
  );
}
