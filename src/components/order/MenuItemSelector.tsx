import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2 } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface MenuItem {
  id: string;
  name: string;
  price: number;
}

interface MenuItemSelectorProps {
  selectedMenuItem: string;
  quantity: number;
  onSelectMenuItem: (menuItemId: string) => void;
  onQuantityChange: (quantity: number) => void;
  onAddItem: () => void;
}

const MenuItemSelector = ({
  selectedMenuItem,
  quantity,
  onSelectMenuItem,
  onQuantityChange,
  onAddItem,
}: MenuItemSelectorProps) => {
  const { data: menuItems, isLoading } = useQuery({
    queryKey: ["menuItems"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("menu_items")
        .select("*");
      if (error) throw error;
      return data as MenuItem[];
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 h-10 px-4 border rounded-md">
        <Loader2 className="h-4 w-4 animate-spin" />
        <span>Loading menu items...</span>
      </div>
    );
  }

  return (
    <div className="flex gap-2">
      <Select value={selectedMenuItem} onValueChange={onSelectMenuItem}>
        <SelectTrigger className="flex-1">
          <SelectValue placeholder="Select Menu Item" />
        </SelectTrigger>
        <SelectContent>
          {menuItems?.map((item) => (
            <SelectItem key={item.id} value={item.id}>
              {item.name} - ${item.price}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Input
        type="number"
        min="1"
        value={quantity}
        onChange={(e) => onQuantityChange(parseInt(e.target.value) || 1)}
        className="w-24"
      />
      <Button onClick={onAddItem} disabled={!selectedMenuItem}>
        Add Item
      </Button>
    </div>
  );
};

export default MenuItemSelector;