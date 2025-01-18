import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Download, FileX } from "lucide-react";
import jsPDF from 'jspdf';
import CreateOrder from "./CreateOrder";

interface Order {
  id: string;
  customer_id: string;
  status: 'pending' | 'ready' | 'paid';
  total_amount: number;
  created_at: string;
  customer: {
    name: string;
    table_number: string;
    phone: string;
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
          customer:customers(name, table_number, phone),
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
    meta: {
      onError: (error: Error) => {
        toast({
          title: "Error",
          description: "Failed to load orders: " + error.message,
          variant: "destructive",
        });
      },
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

  const downloadBill = (order: Order) => {
    const doc = new jsPDF();
    
    // Set background color
    doc.setFillColor(250, 250, 250);
    doc.rect(0, 0, doc.internal.pageSize.width, doc.internal.pageSize.height, 'F');

    // Add waffle pattern
    for (let i = 0; i < doc.internal.pageSize.width; i += 10) {
      for (let j = 0; j < doc.internal.pageSize.height; j += 10) {
        doc.setFillColor(245, 245, 245);
        doc.rect(i, j, 5, 5, 'F');
      }
    }

    // Add header
    doc.setFontSize(24);
    doc.setTextColor(40, 40, 40);
    doc.text("THE WALLS OF WAFFLE", 105, 20, { align: "center" });

    // Add order details
    doc.setFontSize(12);
    doc.text(`Order #${order.id.slice(0, 8)}`, 20, 40);
    doc.text(`Date: ${new Date(order.created_at).toLocaleString()}`, 20, 50);

    // Add customer details
    doc.text("Customer Details:", 20, 70);
    doc.text(`Name: ${order.customer?.name || `Table ${order.customer?.table_number}`}`, 20, 80);
    if (order.customer?.phone) {
      doc.text(`Phone: ${order.customer.phone}`, 20, 90);
    }

    // Add items table
    doc.text("Order Items:", 20, 110);
    let yPos = 120;
    
    // Table header
    doc.setFillColor(230, 230, 230);
    doc.rect(20, yPos - 5, 170, 10, 'F');
    doc.text("Item", 25, yPos);
    doc.text("Qty", 100, yPos);
    doc.text("Price", 120, yPos);
    doc.text("Subtotal", 160, yPos);
    yPos += 10;

    // Table content
    order.order_items?.forEach((item) => {
      doc.text(item.menu_item?.name || "", 25, yPos);
      doc.text(item.quantity.toString(), 100, yPos);
      doc.text(`₹${item.unit_price.toFixed(2)}`, 120, yPos);
      doc.text(`₹${item.subtotal.toFixed(2)}`, 160, yPos);
      yPos += 10;
    });

    // Add total
    doc.setDrawColor(200, 200, 200);
    doc.line(20, yPos, 190, yPos);
    yPos += 10;
    doc.setFontSize(14);
    doc.text("Total Amount:", 120, yPos);
    doc.text(`₹${order.total_amount.toFixed(2)}`, 160, yPos);

    // Add footer
    doc.setFontSize(12);
    doc.text("Thank you for your business!", 105, yPos + 20, { align: "center" });

    // Save the PDF
    doc.save(`bill-${order.id.slice(0, 8)}.pdf`);
  };

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

  return (
    <div className="space-y-6">
      <CreateOrder />

      {!orders?.length ? (
        <div className="flex items-center justify-center min-h-[200px]">
          <p className="text-gray-500">No orders found.</p>
        </div>
      ) : (
        <div className="space-y-4">
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
      )}
    </div>
  );
};

export default OrderManagement;
