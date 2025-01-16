import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

interface Customer {
  id: string;
  name: string;
  phone: string;
  email: string;
  table_number: string;
  created_at: string;
}

const CustomerManagement = () => {
  const { toast } = useToast();

  const { data: customers, isLoading, error } = useQuery({
    queryKey: ["customers"],
    queryFn: async () => {
      console.log("Fetching customers...");
      const { data, error } = await supabase
        .from("customers")
        .select("*")
        .order("created_at", { ascending: false });
      
      if (error) {
        console.error("Error fetching customers:", error);
        throw error;
      }
      console.log("Customers data:", data);
      return data as Customer[];
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to load customers: " + error.message,
        variant: "destructive",
      });
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <p className="text-gray-500">Loading customers...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <p className="text-red-500">Error loading customers. Please try again.</p>
      </div>
    );
  }

  if (!customers?.length) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <p className="text-gray-500">No customers found.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {customers.map((customer) => (
        <Card key={customer.id}>
          <CardHeader>
            <CardTitle className="text-lg">
              {customer.name || `Table ${customer.table_number}`}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {customer.phone && (
                <p className="text-sm">
                  <span className="text-gray-500">Phone:</span> {customer.phone}
                </p>
              )}
              {customer.email && (
                <p className="text-sm">
                  <span className="text-gray-500">Email:</span> {customer.email}
                </p>
              )}
              {customer.table_number && (
                <p className="text-sm">
                  <span className="text-gray-500">Table:</span> {customer.table_number}
                </p>
              )}
              <p className="text-sm">
                <span className="text-gray-500">Joined:</span>{" "}
                {new Date(customer.created_at).toLocaleDateString()}
              </p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default CustomerManagement;