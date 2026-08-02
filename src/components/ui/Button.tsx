'use client';
import { ButtonHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'inverted' | 'danger' | 'ghost' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
}

const variants = {
  primary:  'bg-[#0EA5E9] hover:bg-[#0284C7] text-white shadow-sm',
  inverted: 'bg-[#0F172A] hover:bg-[#1E293B] text-white shadow-sm',
  danger:   'bg-[#EF4444] hover:bg-red-600 text-white shadow-sm',
  ghost:    'bg-transparent hover:bg-[#F0F9FF] text-[#0369A1]',
  outline:  'border border-[#0EA5E9] text-[#0EA5E9] hover:bg-[#F0F9FF]',
};

const sizes = {
  sm: 'px-3 py-1.5 text-xs',
  md: 'px-4 py-2 text-sm',
  lg: 'px-6 py-2.5 text-sm',
};

export default function Button({ variant = 'primary', size = 'md', loading, className, children, disabled, ...props }: Props) {
  return (
    <button
      {...props}
      disabled={disabled || loading}
      className={cn(
        'rounded-lg font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2',
        variants[variant],
        sizes[size],
        className
      )}
    >
      {loading && <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
      {children}
    </button>
  );
}
