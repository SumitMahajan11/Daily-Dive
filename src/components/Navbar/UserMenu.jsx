import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { User, Settings, LogOut, ShieldCheck, Key } from 'lucide-react';

export const UserMenu = ({ onNavigateSettings, onNavigateAuth }) => {
  const { user, signOut } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleAvatarClick = () => {
    if (!user) {
      if (onNavigateAuth) onNavigateAuth();
    } else {
      setIsOpen(!isOpen);
    }
  };

  const handleLogout = async () => {
    setIsOpen(false);
    try {
      await signOut();
      if (onNavigateAuth) onNavigateAuth();
    } catch (err) {
      console.error('Logout failed:', err);
    }
  };

  const email = user?.email || 'guest@roulette.app';
  const initial = user?.email ? user.email.charAt(0).toUpperCase() : 'U';
  const provider = user?.app_metadata?.provider || 'Email';

  return (
    <div className="relative" ref={menuRef}>
      <motion.button
        type="button"
        whileTap={{ scale: 0.94 }}
        transition={{ duration: 0.12 }}
        onClick={handleAvatarClick}
        aria-label={user ? `User profile menu (${email})` : 'Sign in to your account'}
        aria-haspopup={user ? 'true' : undefined}
        aria-expanded={user ? isOpen : undefined}
        className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-on-primary hover:opacity-90 transition-opacity ring-2 ring-primary/20 cursor-pointer shadow-sm"
        title={user ? 'Profile & Account' : 'Sign In'}
      >
        {user ? (
          <span className="font-mono text-xs font-bold">{initial}</span>
        ) : (
          <User size={18} />
        )}
      </motion.button>

      <AnimatePresence>
        {isOpen && user && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -6 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -6 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="absolute right-0 mt-2 w-64 rounded-xl bg-surface-container-low border border-outline-variant/40 shadow-2xl p-2 z-50"
          >
            <div className="px-3 py-2.5 border-b border-outline-variant/30 mb-1">
              <p className="text-[10px] font-mono text-outline uppercase tracking-wider">Signed in as</p>
              <p className="text-xs font-medium text-on-surface truncate mt-0.5">{email}</p>
              <div className="mt-2 flex items-center gap-1.5">
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-primary-container/20 text-primary font-mono text-[10px] border border-primary-container/30">
                  <ShieldCheck size={12} />
                  <span>{provider.charAt(0).toUpperCase() + provider.slice(1)} Auth</span>
                </span>
              </div>
            </div>

            <motion.button
              type="button"
              whileTap={{ scale: 0.98 }}
              onClick={() => {
                setIsOpen(false);
                if (onNavigateSettings) onNavigateSettings();
              }}
              className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-on-surface-variant hover:text-on-surface hover:bg-surface-container rounded-lg transition-colors text-left cursor-pointer"
            >
              <Settings size={16} />
              <span>Preferences & Settings</span>
            </motion.button>

            <div className="my-1 border-t border-outline-variant/20"></div>

            <motion.button
              type="button"
              whileTap={{ scale: 0.98 }}
              onClick={handleLogout}
              className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-error hover:bg-error-container/20 rounded-lg transition-colors text-left cursor-pointer font-medium"
            >
              <LogOut size={16} />
              <span>Log out</span>
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
