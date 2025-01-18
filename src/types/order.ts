export interface Order {
  id: string;
  customer_id: string;
  status: 'pending' | 'ready' | 'paid';
  total_amount: number;
  created_at: string;
  customer: {
    name: string;
    table_number: string;
    phone: string;
  };
  order_items: {
    id: string;
    menu_item: {
      name: string;
    };
    quantity: number;
    unit_price: number;
    subtotal: number;
  }[];
}