import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useData } from '../../context/DataContext';
import {
  Clock,
  Smartphone,
  Download,
  Upload,
  AlertTriangle,
  Volume2,
  Vibrate,
  ShieldCheck,
  Info
} from 'lucide-react';
import { ResetConfirmationModal } from '../Modals/ResetConfirmationModal';
import { Toggle } from '../UI/Toggle';
import { Button } from '../UI/Button';

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
    showToast
  } = useData();

  const [osPermission, setOsPermission] = useState('default');
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isStandalone, setIsStandalone] = useState(false);
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);

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
      if (showToast) showToast('Daily Dive installed!', 'success');
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
            if (showToast) showToast('Notification permission was not granted.', 'info');
            return;
          }
        } else if (Notification.permission === 'denied') {
          if (showToast) showToast('Notifications are blocked in your browser settings.', 'error');
          return;
        }
      } else {
        if (showToast) showToast('Notifications are not supported in this browser.', 'info');
      }
    }

    await updateSettings({ notifications_enabled: nextState });
    if (nextState && showToast) {
      showToast(`Daily reminder scheduled for ${userSettings.reminder_time}`, 'success');
    }
  };

  const handleTimePreset = async (time) => {
    await updateSettings({ reminder_time: time });
    if (userSettings.notifications_enabled && showToast) {
      showToast(`Reminder time updated to ${time}`, 'success');
    }
  };

  const handleCustomTimeChange = async (e) => {
    const val24 = e.target.value;
    if (!val24) return;
    const time12 = formatTo12Hour(val24);
    await updateSettings({ reminder_time: time12 });
    if (userSettings.notifications_enabled && showToast) {
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
    a.download = `daily-dive-backup-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    if (showToast) showToast('Backup exported successfully', 'success');
  };

  const handleImportBackup = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      const data = JSON.parse(text);
      if (typeof data !== 'object' || data === null) {
        throw new Error('Invalid JSON structure');
      }
      importDataBackup(data);
    } catch (err) {
      if (showToast) showToast('Could not import backup file: ' + err.message, 'error');
    }
    e.target.value = '';
  };

  return (
    <div className="flex flex-col w-full max-w-3xl mx-auto pb-8 space-y-6">
      
      {/* ── SCREEN H1 HEADER ── */}
      <div>
        <h1 className="font-display text-2xl sm:text-3xl font-bold text-on-surface tracking-tight">
          Settings
        </h1>
      </div>

      {/* ── OPTIONAL INSTALL PWA BANNER ── */}
      {deferredPrompt && !isStandalone && (
        <div className="journal-card p-4 rounded-2xl border border-primary/30 bg-primary-container/10 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <Smartphone size={18} className="text-primary shrink-0" />
            <div>
              <p className="text-sm font-semibold text-on-surface">Install Daily Dive</p>
              <p className="text-xs text-on-surface-variant">Add to your home screen for quick offline access.</p>
            </div>
          </div>
          <Button variant="primary" onClick={handleInstallPwa} className="h-9 px-4 text-xs font-semibold shrink-0 cursor-pointer">
            Install
          </Button>
        </div>
      )}

      {/* ── SECTION 1: REMINDERS ── */}
      <section className="journal-card rounded-2xl p-5 sm:p-6 border border-outline-variant/30 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Clock size={18} className="text-primary" />
            <div>
              <h2 className="font-display text-base font-bold text-on-surface">Daily Reminders</h2>
              <p className="text-xs text-on-surface-variant">Get notified once a day for your learning spin.</p>
            </div>
          </div>
          <Toggle
            checked={Boolean(userSettings.notifications_enabled)}
            onChange={handleToggleReminder}
            ariaLabel="Toggle daily reminders"
          />
        </div>

        {userSettings.notifications_enabled && (
          <div className="pt-3 border-t border-outline-variant/20 space-y-3">
            <label className="block text-xs font-semibold text-on-surface">Reminder Time</label>
            <div className="flex items-center gap-2 flex-wrap">
              {['08:00 AM', '09:00 AM', '12:00 PM', '08:00 PM'].map(preset => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => handleTimePreset(preset)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold border cursor-pointer transition-colors ${
                    userSettings.reminder_time === preset
                      ? 'bg-primary text-white border-primary'
                      : 'bg-surface-container border-outline-variant/30 text-on-surface-variant hover:text-on-surface'
                  }`}
                >
                  {preset}
                </button>
              ))}

              <input
                type="time"
                value={formatTo24Hour(userSettings.reminder_time)}
                onChange={handleCustomTimeChange}
                className="px-2.5 py-1.5 rounded-lg bg-surface border border-outline-variant/40 text-xs font-mono text-on-surface"
              />
            </div>
          </div>
        )}
      </section>

      {/* ── SECTION 2: SOUND AND HAPTICS ── */}
      <section className="journal-card rounded-2xl p-5 sm:p-6 border border-outline-variant/30 space-y-4">
        <h2 className="font-display text-base font-bold text-on-surface">Sound and Haptics</h2>
        
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <Volume2 size={18} className="text-on-surface-variant" />
              <div>
                <span className="text-sm font-semibold text-on-surface block">Sound Effects</span>
                <span className="text-xs text-on-surface-variant">Audio feedback during roulette spin and landing.</span>
              </div>
            </div>
            <Toggle
              checked={Boolean(userSettings.sound_enabled)}
              onChange={(chk) => updateSettings({ sound_enabled: chk })}
              ariaLabel="Toggle sound effects"
            />
          </div>

          <div className="pt-2 border-t border-outline-variant/15 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <Vibrate size={18} className="text-on-surface-variant" />
              <div>
                <span className="text-sm font-semibold text-on-surface block">Haptic Feedback</span>
                <span className="text-xs text-on-surface-variant">Tactile vibration on mobile devices during spin.</span>
              </div>
            </div>
            <Toggle
              checked={Boolean(userSettings.haptics_enabled)}
              onChange={(chk) => updateSettings({ haptics_enabled: chk })}
              ariaLabel="Toggle haptic feedback"
            />
          </div>
        </div>
      </section>

      {/* ── SECTION 3: DATA ── */}
      <section className="journal-card rounded-2xl p-5 sm:p-6 border border-outline-variant/30 space-y-4">
        <div>
          <h2 className="font-display text-base font-bold text-on-surface">Data Management</h2>
          <p className="text-xs text-on-surface-variant mt-0.5">Export, import, or reset your local learning profile.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          <button
            type="button"
            onClick={handleExportBackup}
            className="p-3 rounded-xl border border-outline-variant/30 bg-surface-container flex items-center gap-2.5 text-left hover:bg-surface-container-high transition-colors cursor-pointer"
          >
            <Download size={16} className="text-primary shrink-0" />
            <div>
              <span className="text-xs font-semibold text-on-surface block">Export Backup</span>
              <span className="text-[11px] text-on-surface-variant">Download JSON data file</span>
            </div>
          </button>

          <label className="p-3 rounded-xl border border-outline-variant/30 bg-surface-container flex items-center gap-2.5 text-left hover:bg-surface-container-high transition-colors cursor-pointer">
            <Upload size={16} className="text-primary shrink-0" />
            <div>
              <span className="text-xs font-semibold text-on-surface block">Import Backup</span>
              <span className="text-[11px] text-on-surface-variant">Restore profile from JSON</span>
            </div>
            <input
              type="file"
              accept=".json"
              onChange={handleImportBackup}
              className="hidden"
            />
          </label>
        </div>

        <div className="pt-2">
          <button
            type="button"
            onClick={() => setIsResetModalOpen(true)}
            className="w-full p-3 rounded-xl border border-error/30 bg-error/5 hover:bg-error/10 text-error flex items-center justify-center gap-2 text-xs font-semibold transition-colors cursor-pointer"
          >
            <AlertTriangle size={15} />
            <span>Reset All Data &amp; History</span>
          </button>
        </div>

        {/* Moved Retention Policy Footnote */}
        <p className="text-[11px] font-mono text-on-surface-variant pt-2 border-t border-outline-variant/20">
          History is capped at 150 entries and pruned after 90 days.
        </p>
      </section>

      {/* ── SECTION 4: ABOUT ── */}
      <section className="journal-card rounded-2xl p-5 sm:p-6 border border-outline-variant/30 space-y-3">
        <h2 className="font-display text-base font-bold text-on-surface">About Daily Dive</h2>
        <div className="text-xs text-on-surface-variant space-y-1.5 leading-relaxed">
          <p>
            Version 2.1.0 · MIT License
          </p>
          <p className="text-on-surface font-medium">
            Your data stays on this device. Daily Dive does not use cookies, trackers, or remote accounts.
          </p>
        </div>
      </section>

      {/* Reset Confirmation Modal */}
      <ResetConfirmationModal
        isOpen={isResetModalOpen}
        onClose={() => setIsResetModalOpen(false)}
        onConfirm={() => {
          resetAllData();
          setIsResetModalOpen(false);
        }}
      />

    </div>
  );
};
