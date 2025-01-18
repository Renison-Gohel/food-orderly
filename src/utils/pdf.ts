import jsPDF from 'jspdf';
import { Order } from '@/types/order';

export const downloadBill = (order: Order) => {
  const doc = new jsPDF();
  
  // Set background color
  doc.setFillColor(250, 250, 250);
  doc.rect(0, 0, doc.internal.pageSize.width, doc.internal.pageSize.height, 'F');

  // Add waffle pattern
  for (let i = 0; i < doc.internal.pageSize.width; i += 10) {
    for (let j = 0; j < doc.internal.pageSize.height; j += 10) {
      doc.setFillColor(245, 245, 245);
      doc.rect(i, j, 5, 5, 'F');
    }
  }

  // Add header
  doc.setFontSize(24);
  doc.setTextColor(40, 40, 40);
  doc.text("THE WALLS OF WAFFLE", 105, 20, { align: "center" });

  // Add order details
  doc.setFontSize(12);
  doc.text(`Order #${order.id.slice(0, 8)}`, 20, 40);
  doc.text(`Date: ${new Date(order.created_at).toLocaleString()}`, 20, 50);

  // Add customer details
  doc.text("Customer Details:", 20, 70);
  doc.text(`Name: ${order.customer?.name || `Table ${order.customer?.table_number}`}`, 20, 80);
  if (order.customer?.phone) {
    doc.text(`Phone: ${order.customer.phone}`, 20, 90);
  }

  // Add items table
  doc.text("Order Items:", 20, 110);
  let yPos = 120;
  
  // Table header
  doc.setFillColor(230, 230, 230);
  doc.rect(20, yPos - 5, 170, 10, 'F');
  doc.text("Item", 25, yPos);
  doc.text("Qty", 100, yPos);
  doc.text("Price", 120, yPos);
  doc.text("Subtotal", 160, yPos);
  yPos += 10;

  // Table content
  order.order_items?.forEach((item) => {
    doc.text(item.menu_item?.name || "", 25, yPos);
    doc.text(item.quantity.toString(), 100, yPos);
    doc.text(`₹${item.unit_price.toFixed(2)}`, 120, yPos);
    doc.text(`₹${item.subtotal.toFixed(2)}`, 160, yPos);
    yPos += 10;
  });

  // Add total
  doc.setDrawColor(200, 200, 200);
  doc.line(20, yPos, 190, yPos);
  yPos += 10;
  doc.setFontSize(14);
  doc.text("Total Amount:", 120, yPos);
  doc.text(`₹${order.total_amount.toFixed(2)}`, 160, yPos);

  // Add footer
  doc.setFontSize(12);
  doc.text("Thank you for your business!", 105, yPos + 20, { align: "center" });

  // Save the PDF
  doc.save(`bill-${order.id.slice(0, 8)}.pdf`);
};