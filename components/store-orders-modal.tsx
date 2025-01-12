import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface Store {
  _id: string;
  name: string;
  orders: {
    Pending: number;
    Confirmed: number;
    Cancelled: number;
    Completed: number;
    confirmed?: number;
  };
}

interface StoreOrdersModalProps {
  store: Store;
  onClose: () => void;
}

export function StoreOrdersModal({ store, onClose }: StoreOrdersModalProps) {
  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{store.name} - Orders</DialogTitle>
        </DialogHeader>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Status</TableHead>
              <TableHead>Count</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {Object.entries(store.orders).map(([status, count]) => (
              <TableRow key={status}>
                <TableCell className="font-medium">{status}</TableCell>
                <TableCell>{count}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </DialogContent>
    </Dialog>
  );
}
