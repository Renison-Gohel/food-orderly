import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Check, ChevronsUpDown } from "lucide-react";
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

  const { data: customers = [], isLoading } = useQuery({
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

  const selectedCustomerData = customers.find(c => c.id === selectedCustomer);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between"
          disabled={isLoading}
        >
          {selectedCustomer && selectedCustomerData
            ? getCustomerLabel(selectedCustomerData)
            : "Select customer..."}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[400px] p-0">
        <Command shouldFilter={true}>
          <CommandInput placeholder="Search customers..." />
          <CommandEmpty>No customer found.</CommandEmpty>
          <CommandGroup className="max-h-[300px] overflow-auto">
            {customers.map((customer) => (
              <CommandItem
                key={customer.id}
                value={getCustomerLabel(customer)}
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