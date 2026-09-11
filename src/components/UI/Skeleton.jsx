import React from 'react';

/**
 * Shared Skeleton placeholder component.
 * Driven strictly by theme CSS tokens (no hardcoded colors), supporting light & dark modes.
 */
export const Skeleton = ({
  width,
  height,
  className = '',
  rounded = 'rounded-lg',
  style = {},
  ...props
}) => {
  const inlineStyles = {
    ...(width ? { width } : {}),
    ...(height ? { height } : {}),
    ...style,
  };

  return (
    <div
      role="status"
      aria-label="Loading..."
      style={inlineStyles}
      className={`animate-pulse bg-surface-container-high/80 dark:bg-surface-container-highest/40 ${rounded} ${className}`}
      {...props}
    >
      <span className="sr-only">Loading...</span>
    </div>
  );
};
