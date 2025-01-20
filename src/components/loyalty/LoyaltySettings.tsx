import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

interface LoyaltySettings {
  points_per_amount: number;
  amount_threshold: number;
}

const LoyaltySettings = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [settings, setSettings] = useState<LoyaltySettings>({
    points_per_amount: 10,
    amount_threshold: 100,
  });

  const { data, isLoading } = useQuery({
    queryKey: ["loyalty-settings"],
    queryFn: async () => {
      console.log("Fetching loyalty settings...");
      const { data, error } = await supabase
        .from("loyalty_settings")
        .select("*")
        .single();
      
      if (error) throw error;
      console.log("Loyalty settings:", data);
      setSettings(data);
      return data;
    },
  });

  const updateSettings = useMutation({
    mutationFn: async (newSettings: LoyaltySettings) => {
      const { error } = await supabase
        .from("loyalty_settings")
        .update(newSettings)
        .eq("id", data?.id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["loyalty-settings"] });
      toast({
        title: "Success",
        description: "Loyalty settings updated successfully",
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

  if (isLoading) {
    return <div>Loading settings...</div>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Loyalty Program Settings</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Points per Amount</label>
          <Input
            type="number"
            value={settings.points_per_amount}
            onChange={(e) =>
              setSettings((prev) => ({
                ...prev,
                points_per_amount: parseInt(e.target.value),
              }))
            }
          />
          <p className="text-sm text-muted-foreground">
            Number of points awarded per amount threshold
          </p>
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">Amount Threshold</label>
          <Input
            type="number"
            value={settings.amount_threshold}
            onChange={(e) =>
              setSettings((prev) => ({
                ...prev,
                amount_threshold: parseInt(e.target.value),
              }))
            }
          />
          <p className="text-sm text-muted-foreground">
            Amount spent required to earn points
          </p>
        </div>
        <Button
          onClick={() => updateSettings.mutate(settings)}
          disabled={updateSettings.isPending}
        >
          Save Settings
        </Button>
      </CardContent>
    </Card>
  );
};

export default LoyaltySettings;