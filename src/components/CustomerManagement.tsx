import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface Customer {
  id: string;
  name: string;
  phone: string;
  email: string;
  table_number: string;
  created_at: string;
}

const CustomerManagement = () => {
  const { data: customers, isLoading } = useQuery({
    queryKey: ["customers"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("customers")
        .select("*")
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      return data as Customer[];
    },
  });

  if (isLoading) return <div>Loading...</div>;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {customers?.map((customer) => (
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