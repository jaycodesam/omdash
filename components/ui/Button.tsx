import { ButtonHTMLAttributes, ReactNode } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'success' | 'warning' | 'danger' | 'outline' | 'flat';
  size?: 'sm' | 'md' | 'lg';
  children: ReactNode;
}

export function Button({
  variant = 'primary',
  size = 'md',
  className = '',
  children,
  ...props
}: ButtonProps) {
  const baseStyles = 'inline-flex items-center justify-center font-medium rounded transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';

  const variants = {
    primary: 'bg-primary text-white hover:bg-primary-dark focus:ring-primary',
    success: 'bg-success text-white hover:bg-success-light focus:ring-success',
    warning: 'bg-warning text-gray-900 hover:bg-warning-light focus:ring-warning',
    danger: 'bg-danger text-white hover:bg-danger-light focus:ring-danger',
    outline: 'border-2 border-primary text-primary hover:bg-primary-light hover:bg-opacity-10 focus:ring-primary',
    flat: 'text-primary hover:bg-hover focus:ring-primary',
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base',
  };

  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
