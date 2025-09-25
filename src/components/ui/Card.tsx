import React from 'react';
import { cn } from '../../utils/cn';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'elevated' | 'outlined';
  padding?: 'none' | 'sm' | 'md' | 'lg';
  hover?: boolean;
}

const Card: React.FC<CardProps> = ({
  children,
  variant = 'default',
  padding = 'md',
  hover = false,
  className,
  ...props
}) => {
  const baseClasses = 'bg-white rounded-lg transition-all duration-200';
  
  const variants = {
    default: 'shadow-sm border border-gray-200',
    elevated: 'shadow-medium',
    outlined: 'border-2 border-gray-200',
  };
  
  const paddings = {
    none: '',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
  };
  
  const hoverEffect = hover ? 'hover:shadow-lg hover:-translate-y-1 cursor-pointer' : '';

  return (
    <div
      className={cn(
        baseClasses,
        variants[variant],
        paddings[padding],
        hoverEffect,
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};

export default Card;