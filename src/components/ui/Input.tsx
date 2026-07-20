'use client';
import { InputHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

interface Props extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export default function Input({ label, error, className, ...props }: Props) {
  return (
    <div className="flex flex-col gap-1">
      {label && <label className="text-sm font-medium text-gray-700">{label}</label>}
      <input
        {...props}
        className={cn(
          'border rounded-lg px-3 py-2 text-sm outline-none transition-colors',
          error ? 'border-red-500 focus:border-red-500' : 'border-gray-300 focus:border-[#00AFF1]',
          className
        )}
      />
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}
