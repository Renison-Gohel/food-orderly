import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
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

interface Customer {
  id: string;
  name: string;
  phone: string;
  table_number: string;
}

interface CustomerSelectorProps {
  selectedCustomer: string;
  onSelectCustomer: (customerId: string) => void;
}

const CustomerSelector = ({ selectedCustomer, onSelectCustomer }: CustomerSelectorProps) => {
  const [open, setOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");

  const { data: customers, isLoading } = useQuery({
    queryKey: ["customers"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("customers")
        .select("*");
      if (error) throw error;
      return data as Customer[];
    },
  });

  const getCustomerLabel = (customer: Customer) => {
    return customer.name || `Table ${customer.table_number}` + (customer.phone ? ` (${customer.phone})` : '');
  };

  const selectedCustomerLabel = customers?.find(c => c.id === selectedCustomer);

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 h-10 px-4 border rounded-md">
        <Loader2 className="h-4 w-4 animate-spin" />
        <span>Loading customers...</span>
      </div>
    );
  }

  const filteredCustomers = customers?.filter(customer => {
    const searchTerm = searchValue.toLowerCase();
    const customerName = customer.name?.toLowerCase() || '';
    const tableNumber = customer.table_number?.toLowerCase() || '';
    const phone = customer.phone?.toLowerCase() || '';
    
    return customerName.includes(searchTerm) || 
           tableNumber.includes(searchTerm) || 
           phone.includes(searchTerm);
  });

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between"
        >
          {selectedCustomer
            ? getCustomerLabel(selectedCustomerLabel as Customer)
            : "Select customer..."}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[400px] p-0">
        <Command>
          <CommandInput
            placeholder="Search customers..."
            value={searchValue}
            onValueChange={setSearchValue}
          />
          <CommandEmpty>No customer found.</CommandEmpty>
          <CommandGroup className="max-h-[300px] overflow-auto">
            {filteredCustomers?.map((customer) => (
              <CommandItem
                key={customer.id}
                value={customer.id}
                onSelect={() => {
                  onSelectCustomer(customer.id);
                  setOpen(false);
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
    </Popover>
  );
};

export default CustomerSelector;