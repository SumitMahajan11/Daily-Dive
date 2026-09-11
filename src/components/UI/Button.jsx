import React from 'react';
import { motion } from 'framer-motion';

const VARIANTS = {
  primary: 'bg-primary-container hover:bg-primary-container/90 text-on-primary-container font-medium shadow-sm disabled:opacity-75 disabled:cursor-not-allowed',
  secondary: 'bg-secondary-container hover:bg-secondary-container/90 text-on-secondary-container font-medium shadow-sm disabled:opacity-50 disabled:cursor-not-allowed',
  tertiary: 'bg-tertiary-container hover:bg-tertiary-container/90 text-on-tertiary-container font-medium shadow-sm disabled:opacity-50 disabled:cursor-not-allowed',
  outline: 'bg-surface-container-high hover:bg-surface-container-highest text-on-surface border border-outline-variant/40 font-medium disabled:opacity-50 disabled:cursor-not-allowed',
  danger: 'bg-error text-on-error hover:opacity-90 font-medium shadow-sm disabled:opacity-50 disabled:cursor-not-allowed',
  destructive: 'bg-error text-on-error hover:opacity-90 font-medium shadow-sm disabled:opacity-50 disabled:cursor-not-allowed',
  ghost: 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container font-medium disabled:opacity-50 disabled:cursor-not-allowed',
};

export const Button = React.forwardRef(({
  children,
  variant = 'primary',
  as = 'button',
  className = '',
  type = 'button',
  disabled = false,
  whileTap,
  ...props
}, ref) => {
  const baseClasses = 'inline-flex items-center justify-center gap-2 rounded-lg transition-all cursor-pointer select-none';
  const variantClasses = VARIANTS[variant] || VARIANTS.primary;
  const MotionComponent = as === 'label' ? motion.label : motion.button;

  return (
    <MotionComponent
      ref={ref}
      {...(as === 'button' ? { type, disabled } : {})}
      whileTap={disabled ? undefined : (whileTap ?? { scale: 0.97 })}
      transition={{ duration: 0.12 }}
      className={`${baseClasses} ${variantClasses} ${disabled ? 'opacity-50 cursor-not-allowed pointer-events-none' : ''} ${className}`}
      {...props}
    >
      {children}
    </MotionComponent>
  );
});

Button.displayName = 'Button';

