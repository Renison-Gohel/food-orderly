import { Button } from "@/components/ui/button";
import { FileX } from "lucide-react";

interface OrderItem {
  menu_item_id: string;
  quantity: number;
  unit_price: number;
  subtotal: number;
}

interface MenuItem {
  id: string;
  name: string;
  price: number;
}

interface OrderItemsListProps {
  orderItems: OrderItem[];
  menuItems: MenuItem[] | undefined;
  onRemoveItem: (index: number) => void;
}

const OrderItemsList = ({ orderItems, menuItems, onRemoveItem }: OrderItemsListProps) => {
  if (!orderItems.length) return null;

  const total = orderItems.reduce((sum, item) => sum + item.subtotal, 0);

  return (
    <div className="space-y-2">
      <h3 className="font-medium">Order Items:</h3>
      <div className="space-y-2 max-h-[300px] overflow-y-auto">
        {orderItems.map((item, index) => {
          const menuItem = menuItems?.find((m) => m.id === item.menu_item_id);
          return (
            <div key={index} className="flex justify-between items-center p-2 bg-accent/50 rounded-lg">
              <div className="flex-1 min-w-0">
                <span className="block truncate">
                  {item.quantity}x {menuItem?.name}
                </span>
              </div>
              <div className="flex items-center gap-2 ml-2">
                <span className="whitespace-nowrap">${item.subtotal.toFixed(2)}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onRemoveItem(index)}
                  className="h-8 w-8 p-0"
                >
                  <FileX className="h-4 w-4" />
                </Button>
              </div>
            </div>
          );
        })}
      </div>
      <div className="border-t pt-2 mt-2">
        <div className="flex justify-between font-medium">
          <span>Total</span>
          <span>${total.toFixed(2)}</span>
        </div>
      </div>
    </div>
  );
};

export default OrderItemsList;