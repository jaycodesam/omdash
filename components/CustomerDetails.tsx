import { Card } from './ui';

interface Customer {
  name: string;
  email: string;
  phone?: string;
  address?: string;
}

interface CustomerDetailsProps {
  customer: Customer;
  orderDate: string;
}

export function CustomerDetails({ customer, orderDate }: CustomerDetailsProps) {
  // Dummy data for demonstration
  const phone = customer.phone || '+1 (555) 123-4567';
  const address = customer.address || '123 Main Street, Apt 4B, New York, NY 10001';

  return (
    <Card>
      <h3 className="text-lg font-semibold text-foreground mb-4">Customer Details</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left Column */}
        <div className="space-y-4">
          <div>
            <label className="text-xs text-gray-500 uppercase tracking-wide">Customer Name</label>
            <p className="text-sm font-medium text-foreground mt-1">{customer.name}</p>
          </div>
          <div>
            <label className="text-xs text-gray-500 uppercase tracking-wide">Email Address</label>
            <p className="text-sm text-foreground mt-1">{customer.email}</p>
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-4">
          <div>
            <label className="text-xs text-gray-500 uppercase tracking-wide">Order Date</label>
            <p className="text-sm text-foreground mt-1">{orderDate}</p>
          </div>
          <div>
            <label className="text-xs text-gray-500 uppercase tracking-wide">Phone Number</label>
            <p className="text-sm text-foreground mt-1">{phone}</p>
          </div>
        </div>

        {/* Full Width - Shipping Address */}
        <div className="md:col-span-2 pt-2 border-t border-border-light">
          <label className="text-xs text-gray-500 uppercase tracking-wide">Shipping Address</label>
          <p className="text-sm text-foreground mt-1">{address}</p>
        </div>
      </div>
    </Card>
  );
}
