import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileX, Check, ChevronsUpDown, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface MenuItem {
  id: string;
  name: string;
  price: number;
}

interface Customer {
  id: string;
  name: string;
  phone: string;
  table_number: string;
}

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
  const [customerOpen, setCustomerOpen] = useState(false);
  const [menuItemOpen, setMenuItemOpen] = useState(false);

  const { data: customers, isLoading: isLoadingCustomers } = useQuery({
    queryKey: ["customers"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("customers")
        .select("*");
      if (error) throw error;
      return data as Customer[];
    },
  });

  const { data: menuItems, isLoading: isLoadingMenuItems } = useQuery({
    queryKey: ["menuItems"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("menu_items")
        .select("*");
      if (error) throw error;
      return data as MenuItem[];
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

      // Remove subtotal from order items when sending to database
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
      // Reset form
      setSelectedCustomer("");
      setSelectedMenuItem("");
      setQuantity(1);
      setOrderItems([]);
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
    setMenuItemOpen(false);
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
    setCustomerOpen(false);
    setMenuItemOpen(false);
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

  const getCustomerLabel = (customer: Customer) => {
    return customer.name || `Table ${customer.table_number}` + (customer.phone ? ` (${customer.phone})` : '');
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create New Order</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <Popover open={customerOpen} onOpenChange={setCustomerOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                aria-expanded={customerOpen}
                className="w-full justify-between"
                disabled={isLoadingCustomers}
              >
                {isLoadingCustomers ? (
                  <div className="flex items-center">
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Loading customers...
                  </div>
                ) : selectedCustomer ? (
                  customers?.find((customer) => customer.id === selectedCustomer)?.name ||
                  `Table ${customers?.find((customer) => customer.id === selectedCustomer)?.table_number}`
                ) : (
                  "Select Customer"
                )}
                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            {!isLoadingCustomers && customers && customers.length > 0 && (
              <PopoverContent className="w-[400px] p-0">
                <Command>
                  <CommandInput placeholder="Search customer..." />
                  <CommandEmpty>No customer found.</CommandEmpty>
                  <CommandGroup>
                    {customers.map((customer) => (
                      <CommandItem
                        key={customer.id}
                        value={customer.id}
                        onSelect={(currentValue) => {
                          setSelectedCustomer(currentValue === selectedCustomer ? "" : currentValue);
                          setCustomerOpen(false);
                        }}
                      >
                        <Check
                          className={cn(
                            "mr-2 h-4 w-4",
                            selectedCustomer === customer.id ? "opacity-100" : "opacity-0"
                          )}
                        />
                        {getCustomerLabel(customer)}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </Command>
              </PopoverContent>
            )}
          </Popover>

          <div className="flex gap-2">
            <Popover open={menuItemOpen} onOpenChange={setMenuItemOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={menuItemOpen}
                  className="w-full justify-between"
                  disabled={isLoadingMenuItems}
                >
                  {isLoadingMenuItems ? (
                    <div className="flex items-center">
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Loading menu items...
                    </div>
                  ) : selectedMenuItem ? (
                    menuItems?.find((item) => item.id === selectedMenuItem)?.name
                  ) : (
                    "Select Menu Item"
                  )}
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              {!isLoadingMenuItems && menuItems && menuItems.length > 0 && (
                <PopoverContent className="w-[400px] p-0">
                  <Command>
                    <CommandInput placeholder="Search menu item..." />
                    <CommandEmpty>No menu item found.</CommandEmpty>
                    <CommandGroup>
                      {menuItems.map((item) => (
                        <CommandItem
                          key={item.id}
                          value={item.id}
                          onSelect={(currentValue) => {
                            setSelectedMenuItem(currentValue === selectedMenuItem ? "" : currentValue);
                            setMenuItemOpen(false);
                          }}
                        >
                          <Check
                            className={cn(
                              "mr-2 h-4 w-4",
                              selectedMenuItem === item.id ? "opacity-100" : "opacity-0"
                            )}
                          />
                          {item.name} - ${item.price}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </Command>
                </PopoverContent>
              )}
            </Popover>
            <Input
              type="number"
              min="1"
              value={quantity}
              onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
              className="w-24"
            />
            <Button onClick={addItemToOrder}>Add Item</Button>
          </div>

          {orderItems.length > 0 && (
            <div className="space-y-2">
              <h3 className="font-medium">Order Items:</h3>
              {orderItems.map((item, index) => {
                const menuItem = menuItems?.find((m) => m.id === item.menu_item_id);
                return (
                  <div key={index} className="flex justify-between items-center">
                    <span>
                      {item.quantity}x {menuItem?.name}
                    </span>
                    <div className="flex items-center gap-2">
                      <span>${item.subtotal.toFixed(2)}</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeOrderItem(index)}
                      >
                        <FileX className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                );
              })}
              <div className="border-t pt-2 mt-2">
                <div className="flex justify-between font-medium">
                  <span>Total</span>
                  <span>
                    ${orderItems.reduce((sum, item) => sum + item.subtotal, 0).toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          )}

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