import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import CustomerSelector from "./order/CustomerSelector";
import MenuItemSelector from "./order/MenuItemSelector";
import OrderItemsList from "./order/OrderItemsList";

interface OrderItem {
  menu_item_id: string;
  quantity: number;
  unit_price: number;
  subtotal: number;
}

const CreateOrder = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedCustomer, setSelectedCustomer] = useState<string>("");
  const [selectedMenuItem, setSelectedMenuItem] = useState<string>("");
  const [quantity, setQuantity] = useState<number>(1);
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);

  const { data: menuItems } = useQuery({
    queryKey: ["menuItems"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("menu_items")
        .select("*");
      if (error) throw error;
      return data;
    },
  });

  const createOrderMutation = useMutation({
    mutationFn: async () => {
      if (!selectedCustomer || orderItems.length === 0) {
        throw new Error("Please select a customer and add items to the order");
      }

      const { data: order, error: orderError } = await supabase
        .from("orders")
        .insert([
          {
            customer_id: selectedCustomer,
            status: "pending",
            total_amount: orderItems.reduce((sum, item) => sum + item.subtotal, 0),
          },
        ])
        .select()
        .single();

      if (orderError) throw orderError;

      const orderItemsWithOrderId = orderItems.map(({ subtotal, ...item }) => ({
        ...item,
        order_id: order.id,
      }));

      const { error: itemsError } = await supabase
        .from("order_items")
        .insert(orderItemsWithOrderId);

      if (itemsError) throw itemsError;

      return order;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      toast({
        title: "Success",
        description: "Order created successfully",
      });
      // Only reset the order after successful creation
      resetOrder();
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const addItemToOrder = () => {
    const menuItem = menuItems?.find((item) => item.id === selectedMenuItem);
    if (!menuItem) return;

    const subtotal = menuItem.price * quantity;
    const newItem: OrderItem = {
      menu_item_id: menuItem.id,
      quantity,
      unit_price: menuItem.price,
      subtotal,
    };

    setOrderItems([...orderItems, newItem]);
    setSelectedMenuItem("");
    setQuantity(1);
    toast({
      title: "Item Added",
      description: "The item has been added to the order",
    });
  };

  const resetOrder = () => {
    setSelectedCustomer("");
    setSelectedMenuItem("");
    setQuantity(1);
    setOrderItems([]);
    toast({
      title: "Order Reset",
      description: "The order has been reset successfully",
    });
  };

  const removeOrderItem = (index: number) => {
    const newItems = [...orderItems];
    newItems.splice(index, 1);
    setOrderItems(newItems);
    toast({
      title: "Item Removed",
      description: "The item has been removed from the order",
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create New Order</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <CustomerSelector
            selectedCustomer={selectedCustomer}
            onSelectCustomer={setSelectedCustomer}
          />

          <MenuItemSelector
            selectedMenuItem={selectedMenuItem}
            quantity={quantity}
            onSelectMenuItem={setSelectedMenuItem}
            onQuantityChange={setQuantity}
            onAddItem={addItemToOrder}
          />

          <OrderItemsList
            orderItems={orderItems}
            menuItems={menuItems}
            onRemoveItem={removeOrderItem}
          />

          <div className="flex gap-2">
            <Button 
              onClick={() => createOrderMutation.mutate()}
              disabled={!selectedCustomer || orderItems.length === 0}
              className="flex-1"
            >
              Create Order
            </Button>
            {orderItems.length > 0 && (
              <Button 
                variant="destructive"
                onClick={resetOrder}
              >
                Reset Order
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default CreateOrder;