'use client';
import { InputHTMLAttributes, ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface Props extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  suffix?: ReactNode;
}

export default function Input({ label, error, className, suffix, ...props }: Props) {
  return (
    <div className="flex flex-col gap-1">
      {label && <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">{label}</label>}
      <div className="relative">
        <input
          {...props}
          className={cn(
            'border rounded-lg px-3 py-2 text-sm outline-none transition-all bg-white w-full',
            suffix ? 'pr-10' : '',
            error ? 'border-red-400 focus:border-red-500 focus:ring-2 focus:ring-red-100' : 'border-slate-200 focus:border-[#0EA5E9] focus:ring-2 focus:ring-[#0EA5E9]/10',
            className
          )}
        />
        {suffix && (
          <div className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
            {suffix}
          </div>
        )}
      </div>
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}
