import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card } from '@/components/ui';
import Link from 'next/link';

export default function DashboardPage() {
  return (
    <DashboardLayout title="Dashboard">
      <Card>
        <div className="text-center py-12">
          <h2 className="text-2xl font-semibold text-foreground mb-6">Welcome to OrderDash</h2>
          <Link
            href="/dashboard/orders"
            className="text-primary hover:text-primary-dark underline text-lg"
          >
            Go to Orders
          </Link>
        </div>
      </Card>
    </DashboardLayout>
  );
}
