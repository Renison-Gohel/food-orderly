import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";

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
  const [searchQuery, setSearchQuery] = useState("");

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

  const filteredCustomers = customers.filter(customer => {
    const searchTerm = searchQuery.toLowerCase();
    const customerName = customer.name?.toLowerCase() || '';
    const tableNumber = customer.table_number?.toLowerCase() || '';
    const phone = customer.phone?.toLowerCase() || '';
    
    return customerName.includes(searchTerm) || 
           tableNumber.includes(searchTerm) || 
           phone.includes(searchTerm);
  });

  const selectedCustomerData = customers.find(c => c.id === selectedCustomer);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between text-left truncate min-h-[40px]"
          disabled={isLoading}
        >
          {selectedCustomer && selectedCustomerData
            ? getCustomerLabel(selectedCustomerData)
            : "Select customer..."}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[calc(100vw-2rem)] sm:w-[400px] p-4">
        <div className="space-y-2">
          <Input
            placeholder="Search customers..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="mb-2"
          />
          <ScrollArea className="h-[200px]">
            <div className="space-y-1">
              {filteredCustomers.map((customer) => (
                <Button
                  key={customer.id}
                  variant="ghost"
                  className="w-full justify-start font-normal text-left truncate"
                  onClick={() => {
                    onSelectCustomer(customer.id);
                    setOpen(false);
                    setSearchQuery("");
                  }}
                >
                  {getCustomerLabel(customer)}
                </Button>
              ))}
              {filteredCustomers.length === 0 && (
                <p className="text-sm text-muted-foreground p-2">
                  No customers found.
                </p>
              )}
            </div>
          </ScrollArea>
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default CustomerSelector;