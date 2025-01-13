import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  CalendarIcon,
  PackageIcon,
  CreditCardIcon,
  EditIcon,
} from "lucide-react";
import { format } from "date-fns";

interface Order {
  _id: string;
  luggage: {
    totalBags: number;
  };
  status: string;
  pickupDate: string;
  returnDate: string;
  paymentStatus: string;
  totalAmount: number;
}

interface OrderCardProps {
  order: Order;
  // onEdit: () => void;
}

export function OrderCard({
  order,
}: // , onEdit
OrderCardProps) {
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "confirmed":
        return "bg-green-100 text-green-800 border-green-200";
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "cancelled":
        return "bg-red-100 text-red-800 border-red-200";
      case "completed":
        return "bg-blue-100 text-blue-800 border-blue-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "paid":
        return "bg-green-100 text-green-800 border-green-200";
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "refunded":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  return (
    <Card className="overflow-hidden transition-all duration-300 hover:shadow-lg">
      <CardContent className="p-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-800">
              Order #{order._id.slice(-6)}
            </h3>
            <Badge
              variant="outline"
              className={`mt-2 ${getStatusColor(order.status)}`}
            >
              {order.status}
            </Badge>
          </div>
          <Badge
            variant="outline"
            className={getPaymentStatusColor(order.paymentStatus)}
          >
            Payment {order.paymentStatus}
          </Badge>
        </div>
        <div className="space-y-3">
          <div className="flex items-center text-sm text-gray-600">
            <PackageIcon className="mr-2 h-4 w-4 text-indigo-500" />
            <span>{order.luggage.totalBags} bag(s)</span>
          </div>
          <div className="flex items-center text-sm text-gray-600">
            <CalendarIcon className="mr-2 h-4 w-4 text-indigo-500" />
            <span>
              Pickup: {format(new Date(order.pickupDate), "MMM d, yyyy")}
            </span>
          </div>
          <div className="flex items-center text-sm text-gray-600">
            <CalendarIcon className="mr-2 h-4 w-4 text-indigo-500" />
            <span>
              Return: {format(new Date(order.returnDate), "MMM d, yyyy")}
            </span>
          </div>
          <div className="flex items-center text-sm text-gray-600">
            <CreditCardIcon className="mr-2 h-4 w-4 text-indigo-500" />
            <span className="font-semibold text-gray-800">
              ${order.totalAmount.toFixed(2)}
            </span>
          </div>
        </div>
      </CardContent>
      <CardFooter className="bg-gray-50 p-4">
        <Button
          variant="outline"
          className="w-full"
          //  onClick={onEdit}
        >
          <EditIcon className="mr-2 h-4 w-4" />
          Edit Order
        </Button>
      </CardFooter>
    </Card>
  );
}
