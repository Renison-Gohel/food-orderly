import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";

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
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const { data: menuItems = [], isLoading } = useQuery({
    queryKey: ["menuItems"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("menu_items")
        .select("*");
      if (error) throw error;
      return data as MenuItem[];
    },
  });

  const selectedItem = menuItems.find(item => item.id === selectedMenuItem);
  const getMenuItemLabel = (item: MenuItem) => `${item.name} - $${item.price}`;

  const filteredMenuItems = menuItems.filter(item => {
    const searchTerm = searchQuery.toLowerCase();
    return item.name.toLowerCase().includes(searchTerm);
  });

  return (
    <div className="flex gap-2">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between"
            disabled={isLoading}
          >
            {selectedMenuItem && selectedItem
              ? getMenuItemLabel(selectedItem)
              : "Select menu item..."}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[400px] p-4">
          <div className="space-y-2">
            <Input
              placeholder="Search menu items..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="mb-2"
            />
            <ScrollArea className="h-[200px]">
              <div className="space-y-1">
                {filteredMenuItems.map((item) => (
                  <Button
                    key={item.id}
                    variant="ghost"
                    className="w-full justify-start font-normal"
                    onClick={() => {
                      onSelectMenuItem(item.id);
                      setOpen(false);
                      setSearchQuery("");
                    }}
                  >
                    {getMenuItemLabel(item)}
                  </Button>
                ))}
                {filteredMenuItems.length === 0 && (
                  <p className="text-sm text-muted-foreground p-2">
                    No menu items found.
                  </p>
                )}
              </div>
            </ScrollArea>
          </div>
        </PopoverContent>
      </Popover>
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