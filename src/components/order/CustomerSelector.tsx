import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 h-10 px-4 border rounded-md">
        <Loader2 className="h-4 w-4 animate-spin" />
        <span>Loading customers...</span>
      </div>
    );
  }

  return (
    <Select value={selectedCustomer} onValueChange={onSelectCustomer}>
      <SelectTrigger>
        <SelectValue placeholder="Select Customer" />
      </SelectTrigger>
      <SelectContent>
        {customers?.map((customer) => (
          <SelectItem key={customer.id} value={customer.id}>
            {getCustomerLabel(customer)}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};

export default CustomerSelector;