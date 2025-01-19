import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Search } from "lucide-react";
import CreateOrder from "./CreateOrder";
import OrderList from "./order/OrderList";
import OrderStats from "./order/OrderStats";
import type { Order } from "@/types/order";

const OrderManagement = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [searchQuery, setSearchQuery] = useState("");

  const { data: orders = [], isLoading, error } = useQuery({
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

  const deleteOrder = useMutation({
    mutationFn: async (orderId: string) => {
      const { error } = await supabase
        .from("orders")
        .delete()
        .eq("id", orderId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      toast({
        title: "Success",
        description: "Order deleted successfully",
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

  const filteredOrders = orders.filter(order => {
    // Filter by date
    const orderDate = new Date(order.created_at);
    const isMatchingDate = 
      orderDate.getDate() === selectedDate.getDate() &&
      orderDate.getMonth() === selectedDate.getMonth() &&
      orderDate.getFullYear() === selectedDate.getFullYear();

    // Filter by search query
    const searchLower = searchQuery.toLowerCase();
    const matchesSearch = 
      !searchQuery ||
      order.id.toLowerCase().includes(searchLower) ||
      order.customer?.name?.toLowerCase().includes(searchLower) ||
      order.customer?.phone?.toLowerCase().includes(searchLower) ||
      order.customer?.table_number?.toLowerCase().includes(searchLower);

    return isMatchingDate && matchesSearch;
  });

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

      <div className="flex flex-col space-y-6">
        <Tabs defaultValue="orders" className="w-full">
          <TabsList>
            <TabsTrigger value="orders">Orders</TabsTrigger>
            <TabsTrigger value="stats">Statistics</TabsTrigger>
          </TabsList>
          
          <TabsContent value="orders" className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search by order ID, customer name, phone, or table..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <OrderList
              orders={filteredOrders}
              onUpdateStatus={(orderId, status) => 
                updateOrderStatus.mutate({ orderId, status })
              }
              onDeleteOrder={(orderId) => deleteOrder.mutate(orderId)}
            />
          </TabsContent>
          
          <TabsContent value="stats">
            <OrderStats
              orders={filteredOrders}
              selectedDate={selectedDate}
              onDateChange={(date) => date && setSelectedDate(date)}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default OrderManagement;