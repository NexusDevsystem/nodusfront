import React from 'react';
import { cn } from './utils';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'accent' | 'pink' | 'yellow';
  size?: 'sm' | 'md' | 'lg';
}

export function Button({ className, variant = 'primary', size = 'md', children, ...props }: ButtonProps) {
  const baseStyles = "inline-flex items-center justify-center font-display font-black border-2 border-dark transition-all duration-200 rounded-xl";
  
  const variants = {
    primary: "bg-[#a5e6ab] text-dark shadow-brutal hover:translate-x-[4px] hover:translate-y-[4px] hover:shadow-none",
    secondary: "bg-bg text-dark shadow-brutal hover:translate-x-[4px] hover:translate-y-[4px] hover:shadow-none",
    pink: "bg-pink text-dark shadow-brutal hover:translate-x-[4px] hover:translate-y-[4px] hover:shadow-none",
    yellow: "bg-yellow text-dark shadow-brutal hover:translate-x-[4px] hover:translate-y-[4px] hover:shadow-none",
    accent: "bg-dark text-bg shadow-brutal hover:translate-x-[4px] hover:translate-y-[4px] hover:shadow-none",
  };

  const sizes = {
    sm: "px-4 py-1.5 text-sm",
    md: "px-6 py-2.5 text-base",
    lg: "px-10 py-4 text-lg md:text-xl",
  };

  return (
    <button 
      className={cn(baseStyles, variants[variant], sizes[size], className)}
      {...props}
    >
      {children}
    </button>
  );
}
