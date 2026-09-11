import React from 'react';
import { motion } from 'framer-motion';

const SIZES = {
  sm: {
    track: 'w-8 h-4',
    knob: "after:h-3.5 after:w-3.5 after:top-[1px] after:left-[1px] peer-checked:after:translate-x-3.5",
  },
  md: {
    track: 'w-9 h-5',
    knob: "after:h-4 after:w-4 after:top-[2px] after:left-[2px] peer-checked:after:translate-x-4",
  },
  lg: {
    track: 'w-11 h-6',
    knob: "after:h-5 after:w-5 after:top-[2px] after:left-[2px] peer-checked:after:translate-x-5",
  },
};

export const Toggle = ({
  checked = false,
  onChange,
  size = 'md',
  disabled = false,
  className = '',
  id,
  name,
  'aria-label': ariaLabel,
  ...props
}) => {
  const sizeConfig = SIZES[size] || SIZES.md;

  const handleChange = (e) => {
    if (disabled) return;
    if (onChange) {
      onChange(e);
    }
  };

  return (
    <motion.label
      whileTap={disabled ? undefined : { scale: 0.92 }}
      transition={{ duration: 0.15, ease: 'easeOut' }}
      className={`relative inline-flex items-center cursor-pointer shrink-0 select-none ${disabled ? 'opacity-50 cursor-not-allowed' : ''} ${className}`}
      {...props}
    >
      <input
        type="checkbox"
        id={id}
        name={name}
        checked={checked}
        onChange={handleChange}
        disabled={disabled}
        aria-label={ariaLabel}
        className="sr-only peer"
      />
      <span
        className={`rounded-full bg-surface-container-highest transition-all peer-checked:bg-primary-container peer-focus-visible:ring-2 peer-focus-visible:ring-primary peer-focus-visible:ring-offset-2 peer-focus-visible:ring-offset-surface after:content-[''] after:absolute after:bg-white after:rounded-full after:shadow-sm after:transition-all ${sizeConfig.track} ${sizeConfig.knob}`}
      />
    </motion.label>
  );
};
