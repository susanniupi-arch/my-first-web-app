import React from 'react';
import { cn } from '../../utils/cn';

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'danger' | 'info';
  size?: 'sm' | 'md' | 'lg';
  dot?: boolean;
}

const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'default',
  size = 'md',
  dot = false,
  className,
  ...props
}) => {
  const baseClasses = 'inline-flex items-center font-medium rounded-full transition-colors';
  
  const variants = {
    default: 'bg-gray-100 text-gray-800',
    primary: 'bg-primary-100 text-primary-800',
    success: 'bg-green-100 text-green-800',
    warning: 'bg-yellow-100 text-yellow-800',
    danger: 'bg-red-100 text-red-800',
    info: 'bg-blue-100 text-blue-800',
  };
  
  const sizes = {
    sm: dot ? 'w-2 h-2' : 'px-2 py-0.5 text-xs',
    md: dot ? 'w-2.5 h-2.5' : 'px-2.5 py-0.5 text-sm',
    lg: dot ? 'w-3 h-3' : 'px-3 py-1 text-sm',
  };

  if (dot) {
    return (
      <span
        className={cn(
          'rounded-full',
          variants[variant],
          sizes[size],
          className
        )}
        {...props}
      />
    );
  }

  return (
    <span
      className={cn(
        baseClasses,
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
};

export default Badge;