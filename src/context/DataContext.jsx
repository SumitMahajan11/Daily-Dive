import React, { createContext, useContext, useEffect, useState, useMemo, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { DataService } from '../lib/dataService';
import {
  INITIAL_TOPICS,
  selectWeightedTopic,
  isTopicEligible,
  calculateUpdatedStreak,
  getEffectiveStreak,
  appendHistoryEntry,
  STARTER_ENABLED_CATEGORIES
} from '../lib/roulette';
import { AudioController } from '../lib/audio';
import { scheduleDailyReminder, cancelDailyReminder } from '../lib/notifications';

const DataContext = createContext(null);

export const DataProvider = ({ children }) => {
  const { user, loading: authLoading } = useAuth();
  
  const [customTopics, setCustomTopics] = useState(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('daily_dive_custom_topics');
        if (saved) return JSON.parse(saved);
      } catch (e) {}
    }
    return [];
  });
  const [topics, setTopics] = useState(() => {
    let initialCustom = [];
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('daily_dive_custom_topics');
        if (saved) initialCustom = JSON.parse(saved);
      } catch (e) {}
    }
    return [...initialCustom, ...INITIAL_TOPICS];
  });
  const [userProgressMap, setUserProgressMap] = useState({});
  const [userStreaks, setUserStreaks] = useState({ current_streak: 0, longest_streak: 0, last_active_date: null });
  const [history, setHistory] = useState(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('daily_dive_history');
        if (saved) return JSON.parse(saved);
      } catch (e) {}
    }
    return [];
  });

  const effectiveStreak = useMemo(() => {
    return getEffectiveStreak(userStreaks);
  }, [userStreaks]);
  const [userSettings, setUserSettings] = useState(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('daily_dive_guest_settings');
        if (saved) return JSON.parse(saved);
      } catch (e) {}
    }
    return {
      enabled_categories: STARTER_ENABLED_CATEGORIES,
      reminder_time: '09:00 AM',
      notifications_enabled: false,
      sound_enabled: true,
      haptics_enabled: true
    };
  });

  const [loadingData, setLoadingData] = useState(true);
  const [currentTopic, setCurrentTopic] = useState(INITIAL_TOPICS[0]);
  const [isMarkingLearned, setIsMarkingLearned] = useState(false);
  const [toasts, setToasts] = useState([]);
  const [isOnline, setIsOnline] = useState(typeof navigator !== 'undefined' ? navigator.onLine : true);

  // Toast Notification Trigger
  const showToast = useCallback((message, type = 'info', action = null) => {
    const id = Date.now() + Math.random();
    setToasts(prev => [...prev, { id, message, type, action }]);
    const duration = action ? 8000 : 3500;
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, duration);
  }, []);

  // Online / Offline Listeners
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      showToast('Connected to network', 'success');
    };
    const handleOffline = () => {
      setIsOnline(false);
      showToast("You're offline — topics are available offline", 'warning');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [showToast]);

  // Sync sound settings with AudioController
  useEffect(() => {
    AudioController.soundEnabled = userSettings.sound_enabled;
  }, [userSettings.sound_enabled]);

  // Sync notification scheduler
  useEffect(() => {
    if (userSettings.notifications_enabled) {
      scheduleDailyReminder(userSettings.reminder_time);
    } else {
      cancelDailyReminder();
    }
  }, [userSettings.notifications_enabled, userSettings.reminder_time]);

  // Load app data for authenticated user or fallback for guest
  const loadData = useCallback(async (userId) => {
    setLoadingData(true);
    try {
      if (!userId) {
        const dbTopics = await DataService.fetchTopics().catch(() => INITIAL_TOPICS);
        const effectiveTopics = (dbTopics && dbTopics.length >= INITIAL_TOPICS.length) ? dbTopics : INITIAL_TOPICS;
        let storedCustom = [];
        try {
          const sc = localStorage.getItem('daily_dive_custom_topics');
          if (sc) storedCustom = JSON.parse(sc);
        } catch (e) {}
        const mergedTopics = [...storedCustom, ...effectiveTopics];
        setTopics(mergedTopics);
        
        let guestProgress = {};
        let guestStreaks = { current_streak: 0, longest_streak: 0, last_active_date: null };
        let guestCategories = STARTER_ENABLED_CATEGORIES;
        let guestHistory = [];
        try {
          const savedProgress = localStorage.getItem('daily_dive_guest_progress');
          if (savedProgress) guestProgress = JSON.parse(savedProgress);
          const savedStreaks = localStorage.getItem('daily_dive_guest_streaks');
          if (savedStreaks) guestStreaks = JSON.parse(savedStreaks);
          const savedHistory = localStorage.getItem('daily_dive_history');
          if (savedHistory) guestHistory = JSON.parse(savedHistory);
          const savedSettings = localStorage.getItem('daily_dive_guest_settings');
          if (savedSettings) {
            const parsed = JSON.parse(savedSettings);
            guestCategories = parsed?.enabled_categories || {};
          }
        } catch (e) {}

        setUserProgressMap(guestProgress);
        setUserStreaks(guestStreaks);
        setHistory(guestHistory);
        const initialSelected = selectWeightedTopic(mergedTopics, guestProgress, guestCategories);
        setCurrentTopic(initialSelected || mergedTopics[0]);
        return;
      }

      const [dbTopics, progress, streaks, settings] = await Promise.all([
        DataService.fetchTopics().catch(() => INITIAL_TOPICS),
        DataService.fetchUserProgress(userId).catch(() => ({})),
        DataService.fetchUserStreaks(userId).catch(() => ({ current_streak: 0, longest_streak: 0, last_active_date: null })),
        DataService.fetchUserSettings(userId).catch(() => null)
      ]);

      const effectiveTopics = (dbTopics && dbTopics.length >= INITIAL_TOPICS.length) ? dbTopics : INITIAL_TOPICS;
      let storedCustom = [];
      try {
        const sc = localStorage.getItem('daily_dive_custom_topics');
        if (sc) storedCustom = JSON.parse(sc);
      } catch (e) {}
      const mergedTopics = [...storedCustom, ...effectiveTopics];
      setTopics(mergedTopics);
      setUserProgressMap(progress || {});
      if (streaks) setUserStreaks(streaks);
      if (settings) {
        setUserSettings({
          enabled_categories: settings.enabled_categories || {},
          reminder_time: settings.reminder_time || '09:00 AM',
          notifications_enabled: Boolean(settings.notifications_enabled),
          sound_enabled: settings.sound_enabled !== false,
          haptics_enabled: settings.haptics_enabled !== false
        });
      }

      const initialSelected = selectWeightedTopic(effectiveTopics, progress || {}, settings?.enabled_categories || {});
      setCurrentTopic(initialSelected || effectiveTopics[0]);
    } catch (err) {
      console.warn('Local topic data loaded as default fallback:', err);
    } finally {
      setLoadingData(false);
    }
  }, [showToast]);

  useEffect(() => {
    if (authLoading) return;
    loadData(user?.id);
  }, [user?.id, authLoading, loadData]);

  // Filtered / eligible topics
  const eligibleTopics = useMemo(() => {
    return topics.filter(t => isTopicEligible(t, userSettings.enabled_categories));
  }, [topics, userSettings.enabled_categories]);

  // Pure weighted selection call & history/streak tracking
  const spinNextTopic = useCallback(() => {
    const selected = selectWeightedTopic(topics, userProgressMap, userSettings.enabled_categories);
    const result = selected || eligibleTopics[Math.floor(Math.random() * eligibleTopics.length)] || topics[0];
    if (result) {
      setCurrentTopic(result);
      const now = new Date();
      const nowIso = now.toISOString();

      // 1. Update Progress
      setUserProgressMap(prev => {
        const cur = prev[result.id] || { times_seen: 0, last_seen: null };
        const updated = {
          ...prev,
          [result.id]: {
            ...cur,
            times_seen: (cur.times_seen || 0) + 1,
            last_seen: nowIso
          }
        };
        try {
          localStorage.setItem('daily_dive_guest_progress', JSON.stringify(updated));
        } catch (e) {}
        return updated;
      });

      // 2. Update Streak
      setUserStreaks(prev => {
        const updated = calculateUpdatedStreak(prev, now);
        try {
          localStorage.setItem('daily_dive_guest_streaks', JSON.stringify(updated));
        } catch (e) {}
        return updated;
      });

      // 3. Append to History Log
      setHistory(prev => {
        const updated = appendHistoryEntry(prev, result, 'spin', now);
        try {
          localStorage.setItem('daily_dive_history', JSON.stringify(updated));
        } catch (e) {}
        return updated;
      });
    }
    return result;
  }, [topics, userProgressMap, userSettings.enabled_categories, eligibleTopics]);

  // Mark topic as learned with local & streak tracking
  const markCurrentTopicLearned = useCallback(async () => {
    if (!currentTopic) return;
    const now = new Date();
    const nowIso = now.toISOString();

    // 1. Update Progress
    setUserProgressMap(prev => {
      const cur = prev[currentTopic.id] || { times_seen: 0, last_seen: null };
      const updated = {
        ...prev,
        [currentTopic.id]: {
          ...cur,
          times_seen: (cur.times_seen || 0) + 1,
          last_seen: nowIso,
          learned: true
        }
      };
      try {
        localStorage.setItem('daily_dive_guest_progress', JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });

    // 2. Update Streaks
    setUserStreaks(prev => {
      const updated = calculateUpdatedStreak(prev, now);
      try {
        localStorage.setItem('daily_dive_guest_streaks', JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });

    // 3. Append to History
    setHistory(prev => {
      const updated = appendHistoryEntry(prev, currentTopic, 'learned', now);
      try {
        localStorage.setItem('daily_dive_history', JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });

    showToast('Marked as learned! Streak updated.', 'success');
  }, [currentTopic, showToast]);

  // Clear local history
  const clearHistory = useCallback(() => {
    setHistory([]);
    try {
      localStorage.removeItem('daily_dive_history');
    } catch (e) {}
    showToast('Learning history cleared from this device.', 'info');
  }, [showToast]);

  // Update Settings patch
  const updateSettings = useCallback(async (patch) => {
    if (!isOnline) {
      showToast("You're offline — reconnect to save this", 'warning');
      return;
    }

    const newSettings = { ...userSettings, ...patch };
    setUserSettings(newSettings);

    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('daily_dive_guest_settings', JSON.stringify(newSettings));
      } catch (e) {}
    }

    if (user) {
      try {
        await DataService.updateUserSettings(user.id, patch);
      } catch (err) {
        console.warn('Could not sync user settings with server:', err);
      }
    }
  }, [isOnline, userSettings, user]);

  // Reset all data
  const resetAllData = useCallback(async () => {
    if (user) {
      try {
        await DataService.resetUserData(user.id);
      } catch (err) {
        console.warn('Could not reset server data:', err);
      }
    }

    if (typeof window !== 'undefined') {
      try {
        localStorage.removeItem('daily_dive_guest_settings');
        localStorage.removeItem('daily_dive_guest_progress');
        localStorage.removeItem('daily_dive_guest_streaks');
        localStorage.removeItem('daily_dive_history');
      } catch (e) {}
    }

    setUserProgressMap({});
    setUserStreaks({ current_streak: 0, longest_streak: 0, last_active_date: null });
    showToast('All progress and streak records have been reset.', 'success');
  }, [user, showToast]);

  // Import JSON backup
  const importDataBackup = useCallback(async (parsedBackup) => {
    if (parsedBackup.user_progress) setUserProgressMap(parsedBackup.user_progress);
    if (parsedBackup.user_streaks) setUserStreaks(parsedBackup.user_streaks);
    if (parsedBackup.user_settings) setUserSettings(prev => ({ ...prev, ...parsedBackup.user_settings }));

    if (user) {
      try {
        await DataService.importUserData(user.id, parsedBackup);
      } catch (err) {
        console.warn('Could not sync backup to server:', err);
      }
    }
    showToast('Backup imported successfully', 'success');
  }, [user, showToast]);

  // Restore expired topics from undo window
  const restoreExpiredTopics = useCallback((topicsToRestore) => {
    if (!topicsToRestore || topicsToRestore.length === 0) return;

    const now = Date.now();
    const restored = topicsToRestore.map(t => ({
      ...t,
      lifecycle: t.lifecycle || 'temporary',
      // Refresh expiry window for 14 more days
      expires_at: new Date(now + 14 * 86400000).toISOString(),
      expiry_rule: '14_days',
      restored_at: new Date().toISOString()
    }));

    setCustomTopics(prev => {
      const updated = [...restored, ...prev.filter(p => !restored.some(r => r.id === p.id))];
      try {
        localStorage.setItem('daily_dive_custom_topics', JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });

    setTopics(prev => {
      return [...restored, ...prev.filter(t => !restored.some(r => r.id === t.id))];
    });

    // Remove from expired storage
    try {
      const storedExp = localStorage.getItem('daily_dive_expired_custom_topics');
      if (storedExp) {
        const parsedExp = JSON.parse(storedExp);
        const filtered = parsedExp.filter(p => !restored.some(r => r.id === p.id));
        localStorage.setItem('daily_dive_expired_custom_topics', JSON.stringify(filtered));
      }
    } catch (e) {}

    showToast(`Restored ${restored.length} temporary topic${restored.length > 1 ? 's' : ''} to spin pool!`, 'success');
  }, [showToast]);

  // Check for expired temporary topics and perform soft-delete with undo toast
  const checkAndExpireTopics = useCallback(() => {
    if (typeof window === 'undefined') return [];
    try {
      const saved = localStorage.getItem('daily_dive_custom_topics');
      if (!saved) return [];
      const parsed = JSON.parse(saved);
      if (!Array.isArray(parsed) || parsed.length === 0) return [];

      const now = Date.now();
      const expired = [];
      const active = [];

      parsed.forEach(t => {
        const isTemporary = t.lifecycle === 'temporary';
        const hasExpiry = Boolean(t.expires_at);
        const isPastExpiry = hasExpiry && new Date(t.expires_at).getTime() <= now;

        if (isTemporary && isPastExpiry) {
          expired.push({
            ...t,
            expired_at: new Date().toISOString()
          });
        } else {
          // Normalize older custom topics missing lifecycle metadata
          if (!t.lifecycle) {
            t.lifecycle = 'permanent';
          }
          active.push(t);
        }
      });

      if (expired.length > 0) {
        // 1. Save to expired registry for undo
        let prevExpired = [];
        try {
          const storedExp = localStorage.getItem('daily_dive_expired_custom_topics');
          if (storedExp) prevExpired = JSON.parse(storedExp);
        } catch (e) {}
        const mergedExpired = [...expired, ...prevExpired.filter(p => !expired.some(e => e.id === p.id))];
        localStorage.setItem('daily_dive_expired_custom_topics', JSON.stringify(mergedExpired));

        // 2. Soft-delete from active pool
        localStorage.setItem('daily_dive_custom_topics', JSON.stringify(active));
        setCustomTopics(active);
        setTopics(prev => prev.filter(t => !expired.some(e => e.id === t.id)));

        // 3. Trigger undo notification toast with action
        const count = expired.length;
        showToast(
          `${count} temporary topic${count > 1 ? 's' : ''} expired`,
          'info',
          {
            label: 'Undo',
            onClick: () => {
              restoreExpiredTopics(expired);
            }
          }
        );
        return expired;
      }
    } catch (e) {
      console.warn('Error evaluating topic expiry:', e);
    }
    return [];
  }, [showToast, restoreExpiredTopics]);

  // Hook topic expiry check on mount and expose for debug/testing
  useEffect(() => {
    checkAndExpireTopics();
    if (typeof window !== 'undefined') {
      window.__checkTopicExpiry = checkAndExpireTopics;
      window.__restoreExpiredTopics = restoreExpiredTopics;
    }
  }, [checkAndExpireTopics, restoreExpiredTopics]);

  // Convert topic lifecycle (Permanent <-> Temporary)
  const convertTopicLifecycle = useCallback((topicId, newLifecycle) => {
    const isPermanent = newLifecycle === 'permanent';
    const now = Date.now();
    const patch = {
      lifecycle: newLifecycle,
      expires_at: isPermanent ? null : new Date(now + 14 * 86400000).toISOString(),
      expiry_rule: isPermanent ? null : '14_days'
    };

    setCustomTopics(prev => {
      const updated = prev.map(t => t.id === topicId ? { ...t, ...patch } : t);
      try {
        localStorage.setItem('daily_dive_custom_topics', JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });

    setTopics(prev => prev.map(t => t.id === topicId ? { ...t, ...patch } : t));
    setCurrentTopic(prev => prev?.id === topicId ? { ...prev, ...patch } : prev);

    showToast(
      isPermanent ? 'Topic marked as permanent collection' : 'Topic set to temporary (expires in 14 days)',
      'success'
    );
  }, [showToast]);

  // Add newly extracted custom topics
  const addCustomTopics = useCallback((newTopics) => {
    if (!newTopics || newTopics.length === 0) return;

    const now = Date.now();
    const normalized = newTopics.map(t => {
      const isPermanent = t.lifecycle === 'permanent';
      return {
        ...t,
        is_custom: true,
        group_name: 'custom',
        category: t.category || 'custom-notes',
        lifecycle: isPermanent ? 'permanent' : 'temporary',
        created_at: t.created_at || new Date().toISOString(),
        expires_at: isPermanent ? null : (t.expires_at || new Date(now + 14 * 86400000).toISOString()),
        expiry_rule: isPermanent ? null : '14_days'
      };
    });

    setCustomTopics(prev => {
      const updated = [...normalized, ...prev.filter(p => !normalized.some(n => n.id === p.id))];
      try {
        localStorage.setItem('daily_dive_custom_topics', JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });

    setTopics(prev => {
      return [...normalized, ...prev.filter(t => !normalized.some(n => n.id === t.id))];
    });

    // Automatically enable Custom Uploads category so topics are spinnable immediately
    const currentEnabled = userSettings?.enabled_categories || {};
    const patch = { ...currentEnabled };
    patch['custom'] = true;
    patch['custom::custom-notes'] = true;
    updateSettings({ enabled_categories: patch });

    // Set first newly added topic as current preview
    if (normalized[0]) {
      setCurrentTopic(normalized[0]);
    }

    showToast(`Added ${normalized.length} topic${normalized.length > 1 ? 's' : ''} to your spin pool!`, 'success');
  }, [userSettings, updateSettings, showToast]);

  // Update an existing custom topic
  const updateCustomTopic = useCallback((topicId, updatedFields) => {
    setCustomTopics(prev => {
      const updated = prev.map(t => t.id === topicId ? { ...t, ...updatedFields } : t);
      try {
        localStorage.setItem('daily_dive_custom_topics', JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });

    setTopics(prev => prev.map(t => t.id === topicId ? { ...t, ...updatedFields } : t));
    setCurrentTopic(prev => prev?.id === topicId ? { ...prev, ...updatedFields } : prev);
    showToast('Topic updated successfully', 'success');
  }, [showToast]);

  // Remove a custom topic
  const deleteCustomTopic = useCallback((topicId) => {
    setCustomTopics(prev => {
      const updated = prev.filter(t => t.id !== topicId);
      try {
        localStorage.setItem('daily_dive_custom_topics', JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });

    setTopics(prev => prev.filter(t => t.id !== topicId));
    showToast('Topic removed from your pool', 'info');
  }, [showToast]);

  // Clear all custom topics
  const clearCustomTopics = useCallback(() => {
    setCustomTopics([]);
    try {
      localStorage.removeItem('daily_dive_custom_topics');
    } catch (e) {}
    setTopics(prev => prev.filter(t => !t.is_custom));
    showToast('All custom topics removed from your pool', 'info');
  }, [showToast]);

  return (
    <DataContext.Provider value={{
      topics,
      customTopics,
      eligibleTopics,
      userProgressMap,
      userStreaks,
      effectiveStreak,
      history,
      clearHistory,
      userSettings,
      currentTopic,
      setCurrentTopic,
      loadingData,
      isMarkingLearned,
      isOnline,
      toasts,
      showToast,
      spinNextTopic,
      markCurrentTopicLearned,
      updateSettings,
      resetAllData,
      importDataBackup,
      addCustomTopics,
      deleteCustomTopic,
      updateCustomTopic,
      clearCustomTopics,
      checkAndExpireTopics,
      restoreExpiredTopics,
      convertTopicLifecycle
    }}>
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => useContext(DataContext);
