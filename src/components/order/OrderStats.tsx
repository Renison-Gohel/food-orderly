import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { Order } from "@/types/order";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface OrderStatsProps {
  orders: Order[];
  selectedDate: Date;
  onDateChange: (date: Date | undefined) => void;
}

const OrderStats = ({ orders, selectedDate, onDateChange }: OrderStatsProps) => {
  const totalProfit = orders.reduce((sum, order) => {
    return sum + (order.status === "paid" ? order.total_amount : 0);
  }, 0);

  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - i);
    return date;
  }).reverse();

  const chartData = last7Days.map(date => {
    const dayOrders = orders.filter(order => {
      const orderDate = new Date(order.created_at);
      return orderDate.toDateString() === date.toDateString();
    });
    
    const dayTotal = dayOrders.reduce((sum, order) => 
      sum + (order.status === "paid" ? order.total_amount : 0), 0
    );

    return {
      date: date.toLocaleDateString('en-US', { weekday: 'short', day: 'numeric' }),
      total: dayTotal
    };
  });

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Daily Statistics</CardTitle>
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
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip 
                    formatter={(value) => [`₹${value}`, 'Revenue']}
                  />
                  <Bar dataKey="total" fill="#8884d8" />
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