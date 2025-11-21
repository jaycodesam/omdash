'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ReactNode } from 'react';

interface NavItem {
  label: string;
  href: string;
  icon?: ReactNode;
}

const navItems: NavItem[] = [
  {
    label: 'Dashboard',
    href: '/dashboard',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
      </svg>
    ),
  },
  {
    label: 'Orders',
    href: '/dashboard/orders',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
      </svg>
    ),
  },
];

export function Sidebar() {
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === '/dashboard') {
      return pathname === '/dashboard';
    }
    return pathname?.startsWith(href);
  };

  return (
    <aside className="w-64 bg-sidebar text-white h-screen fixed left-0 top-0 flex flex-col shadow-lg">
      <div className="px-6 h-14 flex items-center border-b border-gray-700/50">
        <Link href="/dashboard" className="flex items-center space-x-3 group">
          <div className="w-9 h-9 bg-primary rounded-lg flex items-center justify-center shadow-md group-hover:shadow-lg transition-shadow">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
          </div>
          <span className="text-lg font-semibold tracking-tight">OrderDash</span>
        </Link>
      </div>

      <nav className="flex-1 px-4 py-6 space-y-1">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`flex items-center space-x-3 px-3 py-2.5 rounded transition-all duration-200 group ${
              isActive(item.href)
                ? 'bg-primary text-white shadow-md'
                : 'text-gray-300 hover:bg-gray-700/50 hover:text-white'
            }`}
          >
            <div className={`${isActive(item.href) ? 'text-white' : 'text-gray-400 group-hover:text-white'} transition-colors`}>
              {item.icon}
            </div>
            <span className="text-sm font-medium">{item.label}</span>
          </Link>
        ))}
      </nav>

      <div className="px-4 py-4 border-t border-gray-700/50">
        <Link
          href="/logout"
          className="flex items-center space-x-3 px-3 py-2.5 rounded text-gray-300 hover:bg-gray-700/50 hover:text-white transition-all duration-200 group"
        >
          <div className="text-gray-400 group-hover:text-white transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
          </div>
          <span className="text-sm font-medium">Logout</span>
        </Link>
      </div>
    </aside>
  );
}
