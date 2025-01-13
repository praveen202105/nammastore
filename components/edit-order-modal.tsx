import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
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
import {
  CalendarIcon,
  PackageIcon,
  CreditCardIcon,
  CheckCircleIcon,
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

interface EditOrderModalProps {
  order: Order;
  onClose: () => void;
  onUpdate: (updatedOrder: Order) => Promise<void>; // Update to return Promise<void>
}

export function EditOrderModal({
  order,
  onClose,
  onUpdate,
}: //   onUpdate,
EditOrderModalProps) {
  const [editedOrder, setEditedOrder] = useState<Order>(order);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setEditedOrder((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setEditedOrder((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdate(editedOrder);
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-gray-800">
            Edit Order #{order._id.slice(-6)}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
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
              <PackageIcon className="mr-2 h-4 w-4 text-indigo-500" />
              <span>Total Bags: {order.luggage.totalBags}</span>
            </div>
            <div className="flex items-center text-sm text-gray-600">
              <CreditCardIcon className="mr-2 h-4 w-4 text-indigo-500" />
              <span>Original Amount: ${order.totalAmount.toFixed(2)}</span>
            </div>
          </div>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="status">Order Status</Label>
              <Select
                name="status"
                value={editedOrder.status}
                onValueChange={(value) => handleSelectChange("status", value)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="confirmed">Confirmed</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="paymentStatus">Payment Status</Label>
              <Select
                name="paymentStatus"
                value={editedOrder.paymentStatus}
                onValueChange={(value) =>
                  handleSelectChange("paymentStatus", value)
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select payment status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="paid">Paid</SelectItem>
                  <SelectItem value="refunded">Refunded</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="totalAmount">Total Amount ($)</Label>
              <Input
                id="totalAmount"
                name="totalAmount"
                type="number"
                value={editedOrder.totalAmount}
                onChange={handleInputChange}
                className="w-full"
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-indigo-600 text-white hover:bg-indigo-700"
            >
              <CheckCircleIcon className="mr-2 h-4 w-4" />
              Save Changes
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
