import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { Order } from "@/types/order";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { format } from "date-fns";

interface OrderStatsProps {
  orders: Order[];
  selectedDate: Date;
  onDateChange: (date: Date | undefined) => void;
}

const OrderStats = ({ orders, selectedDate, onDateChange }: OrderStatsProps) => {
  const totalProfit = orders.reduce((sum, order) => {
    return sum + (order.status === "paid" ? order.total_amount : 0);
  }, 0);

  // Group orders by month and calculate total revenue
  const monthlyData = orders.reduce((acc: { [key: string]: number }, order) => {
    if (order.status === "paid") {
      const monthKey = format(new Date(order.created_at), 'MMM yyyy');
      acc[monthKey] = (acc[monthKey] || 0) + order.total_amount;
    }
    return acc;
  }, {});

  // Convert to chart data format and sort by date
  const chartData = Object.entries(monthlyData)
    .map(([month, total]) => ({
      month,
      total
    }))
    .sort((a, b) => {
      const dateA = new Date(a.month);
      const dateB = new Date(b.month);
      return dateA.getTime() - dateB.getTime();
    });

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Monthly Statistics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <p className="text-sm text-gray-500">Total Orders</p>
              <p className="text-2xl font-bold">{orders.length}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Revenue</p>
              <p className="text-2xl font-bold">₹{totalProfit.toFixed(2)}</p>
            </div>
            <div className="h-[200px] mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="month"
                    label={{ 
                      value: 'Month',
                      position: 'insideBottom',
                      offset: -5
                    }}
                  />
                  <YAxis
                    label={{
                      value: 'Revenue (₹)',
                      angle: -90,
                      position: 'insideLeft'
                    }}
                  />
                  <Tooltip 
                    formatter={(value) => [`₹${value}`, 'Revenue']}
                  />
                  <Bar 
                    dataKey="total" 
                    fill="#8884d8"
                    name="Monthly Revenue"
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Select Date</CardTitle>
        </CardHeader>
        <CardContent>
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={onDateChange}
            disabled={(date) => date > new Date()}
            className="rounded-md border w-full max-w-[350px] mx-auto"
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default OrderStats;