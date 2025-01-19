import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface OutletStatisticsProps {
  outletId: string;
}

const OutletStatistics = ({ outletId }: OutletStatisticsProps) => {
  const { data: stats = [], isLoading } = useQuery({
    queryKey: ["outlet-stats", outletId],
    queryFn: async () => {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const { data, error } = await supabase
        .from("orders")
        .select("created_at, total_amount, status")
        .eq("outlet_id", outletId)
        .gte("created_at", thirtyDaysAgo.toISOString())
        .eq("status", "paid");

      if (error) throw error;

      // Group by date and calculate daily totals
      const dailyStats = data.reduce((acc: any[], order) => {
        const date = new Date(order.created_at).toLocaleDateString();
        const existingDay = acc.find((day) => day.date === date);

        if (existingDay) {
          existingDay.total += order.total_amount;
          existingDay.orders += 1;
        } else {
          acc.push({
            date,
            total: order.total_amount,
            orders: 1,
          });
        }

        return acc;
      }, []);

      return dailyStats;
    },
  });

  if (isLoading) {
    return <div>Loading statistics...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="h-[200px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={stats}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="total" fill="#8884d8" name="Revenue" />
          </BarChart>
        </ResponsiveContainer>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <p className="text-sm text-gray-500">Total Orders</p>
          <p className="text-2xl font-bold">
            {stats.reduce((sum, day) => sum + day.orders, 0)}
          </p>
        </div>
        <div>
          <p className="text-sm text-gray-500">Total Revenue</p>
          <p className="text-2xl font-bold">
            ₹{stats.reduce((sum, day) => sum + day.total, 0).toFixed(2)}
          </p>
        </div>
      </div>
    </div>
  );
};

export default OutletStatistics;