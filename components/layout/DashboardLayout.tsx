import { ReactNode } from 'react';
import { Sidebar } from './Sidebar';

interface DashboardLayoutProps {
  children: ReactNode;
  title?: string;
  action?: ReactNode;
}

export function DashboardLayout({ children, title, action }: DashboardLayoutProps) {
  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />

      <main className="flex-1 ml-64">
        {title && (
          <header className="bg-white border-b border-border-light px-8 h-14 flex items-center">
            <div className="flex items-center justify-between w-full">
              <h1 className="text-xl font-semibold text-gray-800">{title}</h1>
              {action && <div>{action}</div>}
            </div>
          </header>
        )}

        <div className="p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
