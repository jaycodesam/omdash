import { ReactNode } from 'react';

interface BadgeProps {
  children: ReactNode;
  variant?: 'info' | 'success' | 'warning' | 'danger' | 'default';
  className?: string;
}

export function Badge({ children, variant = 'default', className = '' }: BadgeProps) {
  const variants = {
    info: 'bg-info/10 text-info border-info',
    success: 'bg-success/10 text-success border-success',
    warning: 'bg-warning/10 text-warning border-warning',
    danger: 'bg-danger/10 text-danger border-danger',
    default: 'bg-gray-100 text-gray-600 border-gray-300',
  };

  return (
    <span className={`inline-flex items-center justify-center px-2.5 py-0.5 rounded text-xs font-medium border min-w-[80px] ${variants[variant]} ${className}`}>
      {children}
    </span>
  );
}
