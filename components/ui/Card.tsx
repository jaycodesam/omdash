import { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
  title?: string;
  headerAction?: ReactNode;
}

export function Card({ children, className = '', title, headerAction }: CardProps) {
  return (
    <div className={`bg-card border border-border rounded shadow-sm ${className}`}>
      {title && (
        <div className="px-6 py-4 border-b border-border-light flex items-center justify-between">
          <h3 className="text-base font-semibold text-gray-700">{title}</h3>
          {headerAction && <div>{headerAction}</div>}
        </div>
      )}
      <div className="px-6 py-4">{children}</div>
    </div>
  );
}
