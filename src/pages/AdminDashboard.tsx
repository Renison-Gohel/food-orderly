import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { Outlet } from "@/types/admin";
import OutletStatistics from "@/components/admin/OutletStatistics";
import OutletOrders from "@/components/admin/OutletOrders";

const AdminDashboard = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [newOutlet, setNewOutlet] = useState({
    name: "",
    address: "",
    phone: "",
  });

  const { data: outlets = [], isLoading } = useQuery({
    queryKey: ["outlets"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("cms_outlets")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as Outlet[];
    },
  });

  const createOutlet = useMutation({
    mutationFn: async (outletData: typeof newOutlet) => {
      const { data, error } = await supabase
        .from("cms_outlets")
        .insert([outletData])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["outlets"] });
      setNewOutlet({ name: "", address: "", phone: "" });
      toast({
        title: "Success",
        description: "Outlet created successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createOutlet.mutate(newOutlet);
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Admin Dashboard</CardTitle>
          <CardDescription>Manage your food outlets</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Input
                placeholder="Outlet Name"
                value={newOutlet.name}
                onChange={(e) =>
                  setNewOutlet({ ...newOutlet, name: e.target.value })
                }
                required
              />
              <Input
                placeholder="Address"
                value={newOutlet.address}
                onChange={(e) =>
                  setNewOutlet({ ...newOutlet, address: e.target.value })
                }
              />
              <Input
                placeholder="Phone"
                value={newOutlet.phone}
                onChange={(e) =>
                  setNewOutlet({ ...newOutlet, phone: e.target.value })
                }
              />
            </div>
            <Button type="submit" disabled={createOutlet.isPending}>
              {createOutlet.isPending ? "Creating..." : "Add New Outlet"}
            </Button>
          </form>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {outlets.map((outlet) => (
          <Card key={outlet.id}>
            <CardHeader>
              <CardTitle>{outlet.name}</CardTitle>
              <CardDescription>
                {outlet.address}
                {outlet.phone && ` • ${outlet.phone}`}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="statistics">
                <TabsList className="w-full">
                  <TabsTrigger value="statistics" className="flex-1">
                    Statistics
                  </TabsTrigger>
                  <TabsTrigger value="orders" className="flex-1">
                    Orders
                  </TabsTrigger>
                </TabsList>
                <TabsContent value="statistics">
                  <OutletStatistics outletId={outlet.id} />
                </TabsContent>
                <TabsContent value="orders">
                  <OutletOrders outletId={outlet.id} />
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default AdminDashboard;