import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
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
  const [searchValue, setSearchValue] = useState("");

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

  const filteredMenuItems = menuItems.filter(item => {
    if (!searchValue) return true;
    const searchTerm = searchValue.toLowerCase();
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
              ? `${selectedItem.name} - $${selectedItem.price}`
              : isLoading
                ? "Loading menu items..."
                : "Select menu item..."}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[400px] p-0">
          <Command shouldFilter={false}>
            <CommandInput
              placeholder="Search menu items..."
              value={searchValue}
              onValueChange={setSearchValue}
            />
            <CommandEmpty>No menu item found.</CommandEmpty>
            <CommandGroup className="max-h-[300px] overflow-auto">
              {filteredMenuItems.map((item) => (
                <CommandItem
                  key={item.id}
                  value={item.id}
                  onSelect={() => {
                    onSelectMenuItem(item.id);
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
      </Popover>
      <Input
        type="number"
        min="1"
        value={quantity}
        onChange={(e) => onQuantityChange(parseInt(e.target.value) || 1)}
        className="w-24"
        disabled={isLoading}
      />
      <Button onClick={onAddItem} disabled={!selectedMenuItem || isLoading}>
        Add Item
      </Button>
    </div>
  );
};

export default MenuItemSelector;