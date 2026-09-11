import React from 'react';

const VARIANTS = {
  primary: 'bg-primary-container hover:bg-primary-container/90 active:scale-[0.98] text-on-primary font-medium shadow-sm disabled:opacity-75 disabled:cursor-not-allowed',
  ghost: 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container font-medium disabled:opacity-50 disabled:cursor-not-allowed',
};

export const Button = ({
  children,
  variant = 'primary',
  className = '',
  type = 'button',
  disabled = false,
  ...props
}) => {
  const baseClasses = 'inline-flex items-center justify-center gap-2 rounded-lg transition-all cursor-pointer select-none';
  const variantClasses = VARIANTS[variant] || VARIANTS.primary;

  return (
    <button
      type={type}
      disabled={disabled}
      className={`${baseClasses} ${variantClasses} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};
