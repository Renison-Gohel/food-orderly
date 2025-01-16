import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";

interface Order {
  id: string;
  customer_id: string;
  status: 'pending' | 'ready' | 'paid';
  total_amount: number;
  created_at: string;
  customer: {
    name: string;
    table_number: string;
  };
  order_items: {
    id: string;
    menu_item: {
      name: string;
    };
    quantity: number;
    unit_price: number;
    subtotal: number;
  }[];
}

const OrderManagement = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: orders, isLoading, error } = useQuery({
    queryKey: ["orders"],
    queryFn: async () => {
      console.log("Fetching orders...");
      const { data, error } = await supabase
        .from("orders")
        .select(`
          *,
          customer:customers(name, table_number),
          order_items(
            id,
            quantity,
            unit_price,
            subtotal,
            menu_item:menu_items(name)
          )
        `)
        .order("created_at", { ascending: false });
      
      if (error) {
        console.error("Error fetching orders:", error);
        throw error;
      }
      console.log("Orders data:", data);
      return data as Order[];
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to load orders: " + error.message,
        variant: "destructive",
      });
    },
  });

  const updateOrderStatus = useMutation({
    mutationFn: async ({ orderId, status }: { orderId: string; status: Order["status"] }) => {
      const { data, error } = await supabase
        .from("orders")
        .update({ status })
        .eq("id", orderId)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      toast({
        title: "Success",
        description: "Order status updated successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <p className="text-gray-500">Loading orders...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <p className="text-red-500">Error loading orders. Please try again.</p>
      </div>
    );
  }

  if (!orders?.length) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <p className="text-gray-500">No orders found.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {orders.map((order) => (
        <Card key={order.id}>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle className="text-lg">
                Order #{order.id.slice(0, 8)}
              </CardTitle>
              <Badge className={getStatusColor(order.status)}>
                {order.status.toUpperCase()}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-500">Customer Details</p>
                <p className="font-medium">
                  {order.customer?.name || `Table ${order.customer?.table_number}`}
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
                      <span>${item.subtotal.toFixed(2)}</span>
                    </div>
                  ))}
                  <div className="border-t pt-2 mt-2">
                    <div className="flex justify-between font-medium">
                      <span>Total</span>
                      <span>${order.total_amount.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex gap-2">
                {order.status === "pending" && (
                  <Button
                    onClick={() => updateOrderStatus.mutate({ orderId: order.id, status: "ready" })}
                  >
                    Mark as Ready
                  </Button>
                )}
                {order.status === "ready" && (
                  <Button
                    onClick={() => updateOrderStatus.mutate({ orderId: order.id, status: "paid" })}
                  >
                    Mark as Paid
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

export default OrderManagement;