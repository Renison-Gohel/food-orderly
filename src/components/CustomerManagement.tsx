import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Search, Edit, Trash2, Gift } from "lucide-react";
import CustomerForm from "./CustomerForm";
import LoyaltySettings from "./loyalty/LoyaltySettings";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";

interface Customer {
  id: string;
  name: string;
  phone: string;
  email: string;
  table_number: string;
  created_at: string;
  loyalty_points?: number; // Made optional with '?'
}

// ... keep existing code (CustomerManagement component definition and hooks)

const CustomerManagement = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);

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
      return (data || []).map(customer => ({
        ...customer,
        loyalty_points: customer.loyalty_points || 0
      })) as Customer[];
    },
    meta: {
      onError: (error: Error) => {
        toast({
          title: "Error",
          description: "Failed to load customers: " + error.message,
          variant: "destructive",
        });
      },
    },
  });

  const deleteCustomerMutation = useMutation({
    mutationFn: async (customerId: string) => {
      const { error } = await supabase
        .from("customers")
        .delete()
        .eq("id", customerId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["customers"] });
      toast({
        title: "Success",
        description: "Customer deleted successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const updateCustomerMutation = useMutation({
    mutationFn: async (customer: Partial<Customer> & { id: string }) => {
      const { error } = await supabase
        .from("customers")
        .update(customer)
        .eq("id", customer.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["customers"] });
      setEditingCustomer(null);
      toast({
        title: "Success",
        description: "Customer updated successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const filteredCustomers = customers?.filter((customer) => {
    const searchTerm = searchQuery.toLowerCase();
    return (
      customer.name?.toLowerCase().includes(searchTerm) ||
      customer.phone?.toLowerCase().includes(searchTerm) ||
      customer.email?.toLowerCase().includes(searchTerm) ||
      customer.table_number?.toLowerCase().includes(searchTerm)
    );
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

  return (
    <div className="space-y-6">
      <Tabs defaultValue="customers">
        <TabsList>
          <TabsTrigger value="customers">Customers</TabsTrigger>
          <TabsTrigger value="loyalty">Loyalty Settings</TabsTrigger>
        </TabsList>
        
        <TabsContent value="customers" className="space-y-6">
          <CustomerForm />
          
          <div className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search customers..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredCustomers?.map((customer) => (
                <Card key={customer.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-lg font-medium">
                      {customer.name || `Table ${customer.table_number}`}
                    </CardTitle>
                    <div className="flex space-x-2">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setEditingCustomer(customer)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Edit Customer</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4 py-4">
                            <div className="space-y-2">
                              <Input
                                placeholder="Name"
                                value={editingCustomer?.name || ""}
                                onChange={(e) =>
                                  setEditingCustomer(prev => ({
                                    ...prev!,
                                    name: e.target.value,
                                  }))
                                }
                              />
                            </div>
                            <div className="space-y-2">
                              <Input
                                placeholder="Phone"
                                value={editingCustomer?.phone || ""}
                                onChange={(e) =>
                                  setEditingCustomer(prev => ({
                                    ...prev!,
                                    phone: e.target.value,
                                  }))
                                }
                              />
                            </div>
                            <div className="space-y-2">
                              <Input
                                placeholder="Email"
                                value={editingCustomer?.email || ""}
                                onChange={(e) =>
                                  setEditingCustomer(prev => ({
                                    ...prev!,
                                    email: e.target.value,
                                  }))
                                }
                              />
                            </div>
                            <div className="space-y-2">
                              <Input
                                placeholder="Table Number"
                                value={editingCustomer?.table_number || ""}
                                onChange={(e) =>
                                  setEditingCustomer(prev => ({
                                    ...prev!,
                                    table_number: e.target.value,
                                  }))
                                }
                              />
                            </div>
                            <Button
                              className="w-full"
                              onClick={() => {
                                if (editingCustomer) {
                                  updateCustomerMutation.mutate(editingCustomer);
                                }
                              }}
                            >
                              Save Changes
                            </Button>
                          </div>
                        </DialogContent>
                      </Dialog>

                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Customer</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete this customer? This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => deleteCustomerMutation.mutate(customer.id)}
                              className="bg-red-500 hover:bg-red-600"
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
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
                      <p className="text-sm flex items-center">
                        <Gift className="h-4 w-4 mr-1 text-purple-500" />
                        <span className="text-gray-500">Loyalty Points:</span>{" "}
                        <span className="ml-1 font-medium text-purple-600">
                          {customer.loyalty_points || 0}
                        </span>
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="loyalty">
          <LoyaltySettings />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CustomerManagement;
