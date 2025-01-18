import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Download, Trash2 } from "lucide-react";
import { Order } from "@/types/order";
import { downloadBill } from "@/utils/pdf";

interface OrderListProps {
  orders: Order[];
  onUpdateStatus: (orderId: string, status: Order["status"]) => void;
  onDeleteOrder: (orderId: string) => void;
}

const OrderList = ({ orders, onUpdateStatus, onDeleteOrder }: OrderListProps) => {
  const getStatusColor = (status: Order["status"]) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "ready":
        return "bg-green-100 text-green-800";
      case "paid":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (!orders?.length) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <p className="text-gray-500">No orders found.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {orders.map((order) => (
        <Card key={order.id}>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle className="text-lg">
                Order #{order.id.slice(0, 8)}
              </CardTitle>
              <div className="flex items-center gap-2">
                <Badge className={getStatusColor(order.status)}>
                  {order.status.toUpperCase()}
                </Badge>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onDeleteOrder(order.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-500">Customer Details</p>
                <p className="font-medium">
                  {order.customer?.name || `Table ${order.customer?.table_number}`}
                  {order.customer?.phone && ` (${order.customer.phone})`}
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-500 mb-2">Order Items</p>
                <div className="space-y-2">
                  {order.order_items?.map((item) => (
                    <div key={item.id} className="flex justify-between">
                      <span>
                        {item.quantity}x {item.menu_item?.name}
                      </span>
                      <span>₹{item.subtotal.toFixed(2)}</span>
                    </div>
                  ))}
                  <div className="border-t pt-2 mt-2">
                    <div className="flex justify-between font-medium">
                      <span>Total</span>
                      <span>₹{order.total_amount.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex gap-2">
                {order.status === "pending" && (
                  <Button
                    onClick={() => onUpdateStatus(order.id, "ready")}
                  >
                    Mark as Ready
                  </Button>
                )}
                {order.status === "ready" && (
                  <Button
                    onClick={() => onUpdateStatus(order.id, "paid")}
                  >
                    Mark as Paid
                  </Button>
                )}
                {order.status === "paid" && (
                  <Button
                    variant="outline"
                    onClick={() => downloadBill(order)}
                  >
                    <Download className="mr-2 h-4 w-4" />
                    Download Bill
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default OrderList;