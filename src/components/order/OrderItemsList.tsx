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
                onClick={() => onRemoveItem(index)}
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
          <span>${total.toFixed(2)}</span>
        </div>
      </div>
    </div>
  );
};

export default OrderItemsList;