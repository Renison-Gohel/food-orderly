import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { Check, ChevronsUpDown, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

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
            {isLoading ? (
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
        {!isLoading && menuItems && menuItems.length > 0 && (
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
                      onSelectMenuItem(currentValue === selectedMenuItem ? "" : currentValue);
                      setOpen(false);
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
        onChange={(e) => onQuantityChange(parseInt(e.target.value) || 1)}
        className="w-24"
      />
      <Button onClick={onAddItem}>Add Item</Button>
    </div>
  );
};

export default MenuItemSelector;