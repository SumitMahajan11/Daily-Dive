import React, { useState, useEffect } from 'react';
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
    <div className="flex flex-col w-full max-w-2xl mx-auto pb-8 space-y-6">
      
      {/* 1. NOTIFICATIONS & REMINDERS */}
      <section className="flex flex-col space-y-2">
        <div className="flex items-center justify-between px-1">
          <h2 className="font-mono text-xs text-on-surface-variant uppercase tracking-wider font-semibold">
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
                  <button
                    key={time}
                    type="button"
                    onClick={() => handleTimePreset(time)}
                    className={`px-3 py-1 rounded-lg font-mono text-xs transition-colors cursor-pointer border ${
                      isSelected
                        ? 'bg-primary-container/20 border-primary-container/50 text-primary'
                        : 'bg-surface-container-high border-outline-variant/40 text-on-surface-variant hover:text-on-surface'
                    }`}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* 2. OFFLINE & STORAGE */}
      <section className="flex flex-col space-y-2">
        <h2 className="font-mono text-xs text-on-surface-variant uppercase tracking-wider font-semibold px-1">
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
                <button
                  type="button"
                  onClick={handleInstallPwa}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary-container hover:bg-primary-container/90 active:scale-95 text-white font-medium text-xs transition-all cursor-pointer shadow-sm"
                >
                  <Download size={15} />
                  <span>Install App</span>
                </button>
              ) : (
                <span className="inline-flex items-center gap-1 text-on-surface-variant font-mono text-[11px] bg-surface-container-high px-2 py-1 rounded border border-outline-variant/30">
                  <Globe size={14} />
                  <span>Browser</span>
                </span>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* 3. SOUND & HAPTICS */}
      <section className="flex flex-col space-y-2">
        <h2 className="font-mono text-xs text-on-surface-variant uppercase tracking-wider font-semibold px-1">
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
      </section>

      {/* 4. DATA & BACKUP */}
      <section className="flex flex-col space-y-2">
        <h2 className="font-mono text-xs text-on-surface-variant uppercase tracking-wider font-semibold px-1">
          Data &amp; Backup
        </h2>
        <div className="rounded-xl bg-surface-container border border-outline-variant/30 p-4 sm:p-5 space-y-4 shadow-sm">
          
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="font-medium text-sm sm:text-base text-on-surface">Export backup</div>
              <p className="text-xs text-on-surface-variant">Download all streaks, history, and custom weights as a single JSON file.</p>
            </div>
            <button
              type="button"
              onClick={handleExportBackup}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-primary-container hover:bg-primary-container/90 active:scale-[0.98] text-white text-xs font-semibold transition-all shrink-0 cursor-pointer shadow-sm"
            >
              <Download size={15} />
              <span>Export JSON</span>
            </button>
          </div>

          <div className="h-[1px] w-full bg-surface-container-highest"></div>

          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="font-medium text-sm sm:text-base text-on-surface">Import backup</div>
              <p className="text-xs text-on-surface-variant">Restore previous progress from a JSON file.</p>
            </div>
            <label className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-surface-container-high hover:bg-surface-container-highest text-on-surface text-xs font-semibold border border-outline-variant/40 transition-colors shrink-0 cursor-pointer">
              <Upload size={15} />
              <span>Import JSON</span>
              <input type="file" accept=".json" onChange={handleImportBackup} className="hidden" />
            </label>
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
            <button
              type="button"
              onClick={() => setIsResetModalOpen(true)}
              className="px-3 py-1.5 rounded-lg bg-surface-container-high hover:bg-error/20 border border-error/40 text-error text-xs font-semibold transition-colors shrink-0 cursor-pointer"
            >
              Reset Data...
            </button>
          </div>

        </div>
      </section>

      {/* 5. ABOUT & VERSION */}
      <section className="flex flex-col space-y-2">
        <h2 className="font-mono text-xs text-on-surface-variant uppercase tracking-wider font-semibold px-1">
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
      </section>

      {/* Reset Modal */}
      <ResetConfirmationModal
        isOpen={isResetModalOpen}
        onClose={() => setIsResetModalOpen(false)}
        onConfirm={resetAllData}
      />

    </div>
  );
};
