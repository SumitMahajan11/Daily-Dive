import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useData } from '../../context/DataContext';
import {
  Shield,
  Clock,
  Cloud,
  Smartphone,
  CheckCircle,
  Globe,
  Download,
  Upload,
  AlertTriangle,
  Disc
} from 'lucide-react';
import { ResetConfirmationModal } from '../Modals/ResetConfirmationModal';
import { Toggle } from '../UI/Toggle';
import { Button } from '../UI/Button';

// Motion variants for staggered settings entrance
const settingsContainerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.04
    }
  }
};

const settingsSectionVariants = {
  hidden: { opacity: 0, y: 14 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.35, ease: 'easeOut' }
  }
};

// Convert 12-hour string (e.g. "09:00 AM", "02:37 PM") to 24-hour "HH:MM"
const formatTo24Hour = (time12) => {
  if (!time12 || typeof time12 !== 'string') return '09:00';
  const match = time12.trim().match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
  if (!match) return '09:00';
  let hours = parseInt(match[1], 10);
  const minutes = match[2];
  const period = match[3].toUpperCase();

  if (period === 'PM' && hours < 12) hours += 12;
  if (period === 'AM' && hours === 12) hours = 0;

  return `${String(hours).padStart(2, '0')}:${minutes}`;
};

// Convert 24-hour "HH:MM" (e.g. "14:37", "09:00") to 12-hour "HH:MM AM/PM"
const formatTo12Hour = (time24) => {
  if (!time24 || typeof time24 !== 'string') return '09:00 AM';
  const parts = time24.split(':');
  if (parts.length < 2) return '09:00 AM';
  let hours = parseInt(parts[0], 10);
  const minutes = parts[1].slice(0, 2);
  if (isNaN(hours)) return '09:00 AM';

  const period = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12;
  if (hours === 0) hours = 12;

  return `${String(hours).padStart(2, '0')}:${minutes} ${period}`;
};

export const SettingsScreen = () => {
  const {
    userSettings,
    userProgressMap,
    userStreaks,
    updateSettings,
    resetAllData,
    importDataBackup,
    isOnline,
    showToast
  } = useData();

  const [osPermission, setOsPermission] = useState('default');
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isStandalone, setIsStandalone] = useState(false);
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);

  // Check OS notification permissions & standalone mode
  useEffect(() => {
    if (typeof window !== 'undefined') {
      if ('Notification' in window) {
        setOsPermission(Notification.permission);
      }
      const standalone =
        window.matchMedia('(display-mode: standalone)').matches ||
        window.navigator.standalone === true;
      setIsStandalone(standalone);
    }

    const handleBeforeInstall = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    const handleAppInstalled = () => {
      setDeferredPrompt(null);
      setIsStandalone(true);
      showToast('Daily Dive installed!', 'success');
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, [showToast]);

  const handleToggleReminder = async () => {
    const nextState = !userSettings.notifications_enabled;

    if (nextState) {
      if ('Notification' in window) {
        if (Notification.permission === 'default') {
          const res = await Notification.requestPermission();
          setOsPermission(res);
          if (res !== 'granted') {
            showToast('Notification permission was not granted.', 'info');
            return;
          }
        } else if (Notification.permission === 'denied') {
          showToast('Notifications are blocked in your browser settings.', 'error');
          return;
        }
      } else {
        showToast('Notifications are not supported in this browser.', 'info');
      }
    }

    await updateSettings({ notifications_enabled: nextState });
    if (nextState) {
      showToast(`Daily reminder scheduled for ${userSettings.reminder_time}`, 'success');
    }
  };

  const handleTimePreset = async (time) => {
    await updateSettings({ reminder_time: time });
    if (userSettings.notifications_enabled) {
      showToast(`Reminder time updated to ${time}`, 'success');
    }
  };

  const handleCustomTimeChange = async (e) => {
    const val24 = e.target.value;
    if (!val24) return;
    const time12 = formatTo12Hour(val24);
    await updateSettings({ reminder_time: time12 });
    if (userSettings.notifications_enabled) {
      showToast(`Reminder time updated to ${time12}`, 'success');
    }
  };

  const handleInstallPwa = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setDeferredPrompt(null);
      }
    }
  };

  // Export JSON backup
  const handleExportBackup = () => {
    const backupData = {
      version: '2.1.0',
      exported_at: new Date().toISOString(),
      user_progress: userProgressMap,
      user_streaks: userStreaks,
      user_settings: userSettings
    };

    const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `life-learning-backup-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast('Backup exported successfully', 'success');
  };

  // Import JSON backup
  const handleImportBackup = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      const parsed = JSON.parse(text);
      await importDataBackup(parsed);
    } catch (err) {
      console.error('Import error:', err);
      showToast('Failed to import backup file: invalid JSON format.', 'error');
    } finally {
      e.target.value = '';
    }
  };

  return (
    <motion.div
      variants={settingsContainerVariants}
      initial="hidden"
      animate="visible"
      className="flex flex-col w-full max-w-2xl mx-auto pb-8 space-y-6"
    >
      
      {/* 1. NOTIFICATIONS & REMINDERS */}
      <motion.section variants={settingsSectionVariants} className="flex flex-col space-y-2">
        <div className="flex items-center justify-between px-1">
          <h2 className="font-display text-xs text-on-surface-variant uppercase tracking-wider font-bold">
            Notifications &amp; Reminders
          </h2>
          <span className={`inline-flex items-center gap-1 text-[11px] font-mono px-2 py-0.5 rounded border ${
            userSettings.notifications_enabled
              ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20'
              : 'text-on-surface-variant bg-surface-container-high border-outline-variant/30'
          }`}>
            <span className={`w-1.5 h-1.5 rounded-full ${userSettings.notifications_enabled ? 'bg-emerald-400' : 'bg-slate-400'}`}></span>
            <span>{userSettings.notifications_enabled ? 'App: Active' : 'App: Disabled'}</span>
          </span>
        </div>

        <div className="rounded-xl bg-surface-container border border-outline-variant/30 p-4 sm:p-5 space-y-4 shadow-sm">
          
          {/* OS Level Permission Status Row */}
          <div className="flex items-center justify-between bg-surface-container-low border border-outline-variant/20 px-3.5 py-2.5 rounded-lg">
            <div className="flex items-center gap-2.5">
              <Shield size={18} className="text-primary" />
              <div>
                <div className="text-xs font-semibold text-on-surface">Browser &amp; OS Permission</div>
                <div className="text-[11px] text-on-surface-variant">
                  {osPermission === 'granted'
                    ? 'System permission active · Notifications will appear'
                    : osPermission === 'denied'
                    ? 'Blocked by browser permissions'
                    : 'Will request on reminder activation'}
                </div>
              </div>
            </div>
            <span className={`inline-flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded border ${
              osPermission === 'granted'
                ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                : osPermission === 'denied'
                ? 'bg-error-container/20 border-error/30 text-error'
                : 'bg-surface-container-high border-outline-variant/30 text-on-surface-variant'
            }`}>
              <span className={`w-1.5 h-1.5 rounded-full ${
                osPermission === 'granted' ? 'bg-emerald-400' : osPermission === 'denied' ? 'bg-error' : 'bg-slate-400'
              }`}></span>
              <span>{osPermission === 'granted' ? 'Granted' : osPermission === 'denied' ? 'Blocked' : 'Default'}</span>
            </span>
          </div>

          {/* App-Level Daily Learning Reminder Switch */}
          <div className="flex items-start justify-between gap-4 pt-1">
            <div className="space-y-1">
              <div className="font-medium text-sm sm:text-base text-on-surface">Daily learning reminder (App schedule)</div>
              <p className="text-xs text-on-surface-variant">
                In-app prompt when active around your preferred time to spin a new topic and maintain your streak.
              </p>
            </div>
            <Toggle
              checked={userSettings.notifications_enabled}
              onChange={handleToggleReminder}
              size="lg"
              aria-label="Daily learning reminder"
            />
          </div>

          <div className="h-[1px] w-full bg-surface-container-highest"></div>

          {/* Scheduled Time Selector */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-on-surface text-sm">
                <Clock size={16} className="text-on-surface-variant" />
                <span>Scheduled time</span>
              </div>
              <span className="font-mono text-xs text-primary font-semibold">{userSettings.reminder_time}</span>
            </div>

            <div className="flex items-center gap-2 pt-1 flex-wrap">
              {['09:00 AM', '01:00 PM', '08:00 PM'].map(time => {
                const label = time === '09:00 AM' ? 'Morning 09:00 AM' : time === '01:00 PM' ? 'Noon 01:00 PM' : 'Evening 08:00 PM';
                const isSelected = userSettings.reminder_time === time;
                return (
                  <motion.button
                    key={time}
                    type="button"
                    whileTap={{ scale: 0.95 }}
                    transition={{ duration: 0.12 }}
                    onClick={() => handleTimePreset(time)}
                    className={`px-3 py-1 rounded-lg font-mono text-xs transition-colors cursor-pointer border ${
                      isSelected
                        ? 'bg-primary-container/20 border-primary-container/50 text-primary'
                        : 'bg-surface-container-high border-outline-variant/40 text-on-surface-variant hover:text-on-surface'
                    }`}
                  >
                    {label}
                  </motion.button>
                );
              })}
            </div>

            {/* Custom Time Picker */}
            <div className="pt-2 flex items-center gap-2.5">
              <span className="text-xs text-on-surface-variant font-medium">Custom time:</span>
              <input
                type="time"
                value={formatTo24Hour(userSettings.reminder_time)}
                onChange={handleCustomTimeChange}
                aria-label="Custom reminder time"
                className="px-2.5 py-1 rounded-lg font-mono text-xs bg-surface-container-high border border-outline-variant/40 text-on-surface focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-colors cursor-pointer"
              />
            </div>
          </div>
        </div>
      </motion.section>

      {/* 2. OFFLINE & STORAGE */}
      <motion.section variants={settingsSectionVariants} className="flex flex-col space-y-2">
        <h2 className="font-display text-xs text-on-surface-variant uppercase tracking-wider font-bold px-1">
          Offline &amp; Storage
        </h2>
        <div className="rounded-xl bg-surface-container border border-outline-variant/30 p-4 sm:p-5 space-y-3.5 shadow-sm">
          <div className="flex items-start gap-3.5">
            <div className="w-9 h-9 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0 mt-0.5">
              <Cloud size={20} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-medium text-sm sm:text-base text-on-surface">Ready for offline use</span>
                <span className={`inline-flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded border ${
                  isOnline
                    ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20'
                    : 'text-tertiary bg-tertiary-container/10 border-tertiary/30'
                }`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${isOnline ? 'bg-emerald-400 animate-pulse' : 'bg-tertiary'}`}></span>
                  <span>{isOnline ? 'Online' : 'Offline'}</span>
                </span>
              </div>
              <p className="text-xs text-on-surface-variant mt-1">
                Topic catalogue and summaries are cached locally via Service Worker. Reads work completely offline.
              </p>
            </div>
          </div>

          <div className="h-[1px] w-full bg-surface-container-highest"></div>

          {/* Dynamic PWA Installation Tile */}
          <div className="flex items-center justify-between bg-surface-container-low border border-outline-variant/30 px-3.5 py-2.5 rounded-lg">
            <div className="flex items-center gap-2.5">
              <Smartphone size={18} className="text-primary" />
              <div>
                <div className="text-xs font-semibold text-on-surface">Web App Status</div>
                <div className="font-mono text-[10px] text-on-surface-variant">
                  {isStandalone
                    ? 'Running in standalone window'
                    : deferredPrompt
                    ? 'Add to Home Screen for fast offline access'
                    : 'Use browser menu to Add to Home Screen'}
                </div>
              </div>
            </div>
            <div>
              {isStandalone ? (
                <span className="inline-flex items-center gap-1 text-emerald-400 font-mono text-[11px] bg-emerald-500/10 px-2.5 py-1 rounded border border-emerald-500/20">
                  <CheckCircle size={14} />
                  <span>Installed</span>
                </span>
              ) : deferredPrompt ? (
                <Button
                  variant="primary"
                  onClick={handleInstallPwa}
                  className="px-3 py-1.5 text-xs font-medium"
                >
                  <Download size={15} />
                  <span>Install App</span>
                </Button>
              ) : (
                <span className="inline-flex items-center gap-1 text-on-surface-variant font-mono text-[11px] bg-surface-container-high px-2 py-1 rounded border border-outline-variant/30">
                  <Globe size={14} />
                  <span>Browser</span>
                </span>
              )}
            </div>
          </div>
        </div>
      </motion.section>

      {/* 3. SOUND & HAPTICS */}
      <motion.section variants={settingsSectionVariants} className="flex flex-col space-y-2">
        <h2 className="font-display text-xs text-on-surface-variant uppercase tracking-wider font-bold px-1">
          Sound &amp; Haptics
        </h2>
        <div className="rounded-xl bg-surface-container border border-outline-variant/30 p-4 sm:p-5 space-y-4 shadow-sm">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="font-medium text-sm sm:text-base text-on-surface">Sound effects</div>
              <p className="text-xs text-on-surface-variant">Interactive wheel clicks and tactile ticking audio synthesis</p>
            </div>
            <Toggle
              checked={userSettings.sound_enabled}
              onChange={() => updateSettings({ sound_enabled: !userSettings.sound_enabled })}
              size="lg"
              aria-label="Sound effects"
            />
          </div>

          <div className="h-[1px] w-full bg-surface-container-highest"></div>

          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="font-medium text-sm sm:text-base text-on-surface">Haptic feedback</div>
              <p className="text-xs text-on-surface-variant">Gentle device vibration when wheel settles on a selected topic</p>
            </div>
            <Toggle
              checked={userSettings.haptics_enabled}
              onChange={() => updateSettings({ haptics_enabled: !userSettings.haptics_enabled })}
              size="lg"
              aria-label="Haptic feedback"
            />
          </div>
        </div>
      </motion.section>

      {/* 4. DATA & BACKUP */}
      <motion.section variants={settingsSectionVariants} className="flex flex-col space-y-2">
        <h2 className="font-display text-xs text-on-surface-variant uppercase tracking-wider font-bold px-1">
          Data &amp; Backup
        </h2>
        <div className="rounded-xl bg-surface-container border border-outline-variant/30 p-4 sm:p-5 space-y-4 shadow-sm">
          
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="font-medium text-sm sm:text-base text-on-surface">Export backup</div>
              <p className="text-xs text-on-surface-variant">Download all streaks, history, and custom weights as a single JSON file.</p>
            </div>
            <Button
              variant="secondary"
              onClick={handleExportBackup}
              className="px-3.5 py-2 text-xs font-semibold shrink-0"
            >
              <Download size={15} />
              <span>Export JSON</span>
            </Button>
          </div>

          <div className="h-[1px] w-full bg-surface-container-highest"></div>

          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="font-medium text-sm sm:text-base text-on-surface">Import backup</div>
              <p className="text-xs text-on-surface-variant">Restore previous progress from a JSON file.</p>
            </div>
            <Button
              as="label"
              variant="outline"
              className="px-3.5 py-2 text-xs font-semibold shrink-0"
            >
              <Upload size={15} />
              <span>Import JSON</span>
              <input type="file" accept=".json" onChange={handleImportBackup} className="hidden" />
            </Button>
          </div>

          <div className="h-[1px] w-full bg-surface-container-highest"></div>

          {/* Reset Data Alert Box */}
          <div className="rounded-lg border border-error/30 bg-error-container/10 p-3.5 flex items-start justify-between gap-3">
            <div>
              <div className="font-semibold text-sm text-error flex items-center gap-1.5">
                <AlertTriangle size={16} />
                <span>Reset All Data</span>
              </div>
              <p className="text-xs text-on-surface-variant mt-0.5">Clear all streaks, learning history, and progress records.</p>
            </div>
            <Button
              variant="danger"
              onClick={() => setIsResetModalOpen(true)}
              className="px-3 py-1.5 text-xs font-semibold shrink-0"
            >
              Reset Data...
            </Button>
          </div>

        </div>
      </motion.section>

      {/* 5. ABOUT & VERSION */}
      <motion.section variants={settingsSectionVariants} className="flex flex-col space-y-2">
        <h2 className="font-display text-xs text-on-surface-variant uppercase tracking-wider font-bold px-1">
          About
        </h2>
        <div className="rounded-xl bg-surface-container border border-outline-variant/30 p-4 sm:p-5 space-y-3.5 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-primary-container/20 border border-primary-container/30 flex items-center justify-center text-primary shrink-0">
                <Disc size={20} />
              </div>
              <div>
                <div className="font-semibold text-sm sm:text-base text-on-surface">Daily Dive</div>
                <div className="text-xs text-on-surface-variant">Distraction-free lifelong learning for modern polymaths</div>
              </div>
            </div>
            <span className="font-mono text-xs text-on-surface-variant bg-surface-container-high border border-outline-variant/30 px-2.5 py-1 rounded-lg">
              v2.1.0
            </span>
          </div>
          <div className="h-[1px] w-full bg-surface-container-highest"></div>
          <div className="flex items-center justify-between text-xs font-mono text-on-surface-variant">
            <span>Privacy: Zero tracking · 100% on-device</span>
            <span className="text-primary hover:underline cursor-pointer">MIT License</span>
          </div>
        </div>
      </motion.section>

      {/* Reset Modal */}
      <AnimatePresence>
        {isResetModalOpen && (
          <ResetConfirmationModal
            isOpen={isResetModalOpen}
            onClose={() => setIsResetModalOpen(false)}
            onConfirm={resetAllData}
          />
        )}
      </AnimatePresence>

    </motion.div>
  );
};
