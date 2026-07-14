import React from 'react';
import { cn } from '../../lib/utils';

export function Card({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        'bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow',
        className
      )}
      {...props}
    />
  );
}

export function CardHeader({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn('flex flex-col space-y-1.5 p-6', className)}
      {...props}
    />
  );
}

export function CardTitle({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3
      className={cn('text-lg font-heading font-semibold leading-none tracking-tight', className)}
      {...props}
    />
  );
}

export function CardContent({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn('p-6 pt-0', className)} {...props} />
  );
}
