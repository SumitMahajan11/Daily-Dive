import React from 'react';
import { motion } from 'framer-motion';
import { User } from 'lucide-react';

export const UserMenu = ({ onNavigateSettings }) => {
  return (
    <motion.button
      type="button"
      whileTap={{ scale: 0.94 }}
      transition={{ duration: 0.12 }}
      onClick={onNavigateSettings}
      aria-label="Settings & Preferences"
      className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-surface-container-high border border-outline-variant/30 flex items-center justify-center text-on-surface-variant hover:text-on-surface hover:bg-surface-container-highest transition-all active:scale-95 cursor-pointer shadow-inner"
      title="Settings & Preferences"
    >
      <User size={15} />
    </motion.button>
  );
};

