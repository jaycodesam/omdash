import { Card } from './ui';

interface Customer {
  name: string;
  email: string;
  phone: string;
  address: string;
}

interface CustomerDetailsProps {
  customer: Customer;
  orderDate: string;
}

export function CustomerDetails({ customer, orderDate }: CustomerDetailsProps) {
  return (
    <Card>
      <h3 className="text-lg font-semibold text-foreground mb-4">Customer Details</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-4">
          <div>
            <label className="text-xs text-gray-500 uppercase tracking-wide">Name</label>
            <p className="text-sm font-medium text-foreground mt-1">{customer.name}</p>
          </div>
          <div>
            <label className="text-xs text-gray-500 uppercase tracking-wide">Phone</label>
            <p className="text-sm text-foreground mt-1">{customer.phone}</p>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-xs text-gray-500 uppercase tracking-wide">Email</label>
            <p className="text-sm text-foreground mt-1">{customer.email}</p>
          </div>
          <div>
            <label className="text-xs text-gray-500 uppercase tracking-wide">Order Date</label>
            <p className="text-sm text-foreground mt-1">{orderDate}</p>
          </div>
        </div>

        <div className="md:row-span-2 h-full">
          <label className="text-xs text-gray-500 uppercase tracking-wide">Shipping Address</label>
          <p className="text-sm text-foreground mt-1">{customer.address}</p>
        </div>
      </div>
    </Card>
  );
}
