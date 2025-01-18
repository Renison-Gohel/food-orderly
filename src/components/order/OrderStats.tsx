import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { Order } from "@/types/order";

interface OrderStatsProps {
  orders: Order[];
  selectedDate: Date;
  onDateChange: (date: Date | undefined) => void;
}

const OrderStats = ({ orders, selectedDate, onDateChange }: OrderStatsProps) => {
  const totalProfit = orders.reduce((sum, order) => {
    return sum + (order.status === "paid" ? order.total_amount : 0);
  }, 0);

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
            className="rounded-md border"
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default OrderStats;