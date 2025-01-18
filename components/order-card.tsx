import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge, badgeVariants } from "@/components/ui/badge";
import { CalendarIcon, PackageIcon, MapPinIcon } from "lucide-react";
import { format } from "date-fns";

interface OrderCardProps {
  order: {
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
      name: string;
      address: string;
    };
    luggage: Array<{ size: string; weight: number }>;
    status: string;
    paymentStatus: string;
    totalAmount: number;
    currency: string;
  };
  onEdit: () => void;
}

export function OrderCard({ order, onEdit }: OrderCardProps) {
  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader className="bg-gradient-to-r from-blue-100 to-indigo-100 rounded-t-lg">
        <CardTitle className="flex justify-between items-center">
          <span className="text-lg font-semibold">
            Order #{order._id.slice(-6)}
          </span>
          <Badge
            // className={badgeVariants({ variant: "outline" })}
            className={
              order.status.toLowerCase() === "Pending"
                ? badgeVariants({ variant: "secondary" })
                : "success"
            }
          >
            {order.status}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4">
        <div className="space-y-2">
          <div className="flex items-center text-sm text-gray-600">
            <MapPinIcon className="mr-2 h-4 w-4" />
            <span>{order.storeId.name}</span>
          </div>
          <div className="flex items-center text-sm text-gray-600">
            <CalendarIcon className="mr-2 h-4 w-4" />
            <span>
              {format(new Date(order.pickup.date), "MMM d, yyyy")} -{" "}
              {order.pickup.time}
            </span>
          </div>
          <div className="flex items-center text-sm text-gray-600">
            <PackageIcon className="mr-2 h-4 w-4" />
            <span>{order.luggage.length} item(s)</span>
          </div>
          <div className="flex justify-between items-center mt-4">
            <span className="font-semibold">
              {order.totalAmount} {order.currency}
            </span>
            <Badge
              variant={
                order.paymentStatus.toLowerCase() === "pending"
                  ? "outline"
                  : "secondary"
              }
            >
              {order.paymentStatus}
            </Badge>
          </div>
        </div>
        <Button onClick={onEdit} className="w-full mt-4">
          Edit Order
        </Button>
      </CardContent>
    </Card>
  );
}
