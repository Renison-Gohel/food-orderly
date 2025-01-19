import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import type { Order } from "@/types/order";

interface OutletOrdersProps {
  outletId: string;
}

const OutletOrders = ({ outletId }: OutletOrdersProps) => {
  const { data: orders = [], isLoading } = useQuery({
    queryKey: ["outlet-orders", outletId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("orders")
        .select(
          `
          *,
          customer:customers(name, table_number, phone),
          order_items(
            id,
            quantity,
            unit_price,
            subtotal,
            menu_item:menu_items(name)
          )
        `
        )
        .eq("outlet_id", outletId)
        .order("created_at", { ascending: false })
        .limit(5);

      if (error) throw error;
      return data as Order[];
    },
  });

  if (isLoading) {
    return <div>Loading orders...</div>;
  }

  return (
    <div className="space-y-4">
      {orders.map((order) => (
        <div
          key={order.id}
          className="border rounded-lg p-4 space-y-2 bg-background/50"
        >
          <div className="flex justify-between items-start">
            <div>
              <p className="font-medium">
                {order.customer?.name || `Table ${order.customer?.table_number}`}
              </p>
              <p className="text-sm text-gray-500">
                {new Date(order.created_at).toLocaleString()}
              </p>
            </div>
            <Badge
              variant={
                order.status === "paid"
                  ? "default"
                  : order.status === "ready"
                  ? "secondary"
                  : "destructive"
              }
            >
              {order.status.toUpperCase()}
            </Badge>
          </div>
          <div className="text-sm space-y-1">
            {order.order_items?.map((item, index) => (
              <div key={item.id} className="flex justify-between">
                <span>
                  {item.quantity}x {item.menu_item?.name}
                </span>
                <span>₹{item.subtotal.toFixed(2)}</span>
              </div>
            ))}
          </div>
          <div className="border-t pt-2 mt-2">
            <div className="flex justify-between font-medium">
              <span>Total</span>
              <span>₹{order.total_amount.toFixed(2)}</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default OutletOrders;