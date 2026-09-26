import React, { createContext, useContext, useEffect, useState, useMemo, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { DataService } from '../lib/dataService';
import {
  INITIAL_TOPICS,
  selectWeightedTopic,
  isTopicEligible,
  calculateUpdatedStreak,
  getEffectiveStreak,
  appendHistoryEntry
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
      enabled_categories: {},
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
  const showToast = useCallback((message, type = 'info') => {
    const id = Date.now() + Math.random();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 3500);
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
        let guestCategories = {};
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

  // Add newly extracted custom topics
  const addCustomTopics = useCallback((newTopics) => {
    if (!newTopics || newTopics.length === 0) return;

    setCustomTopics(prev => {
      const updated = [...newTopics, ...prev.filter(p => !newTopics.some(n => n.id === p.id))];
      try {
        localStorage.setItem('daily_dive_custom_topics', JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });

    setTopics(prev => {
      return [...newTopics, ...prev.filter(t => !newTopics.some(n => n.id === t.id))];
    });

    // Automatically enable categories for the new topics so they are spinnable immediately
    const currentEnabled = userSettings?.enabled_categories || {};
    const patch = { ...currentEnabled };
    newTopics.forEach(t => {
      const group = t.group_name || 'custom';
      const cat = t.category || 'custom-notes';
      // Ensure these categories are active (not false)
      delete patch[group];
      delete patch[`${group}::${cat}`];
      delete patch[cat];
      patch[group] = true;
      patch[`${group}::${cat}`] = true;
    });
    updateSettings({ enabled_categories: patch });

    // Set first newly added topic as current preview
    if (newTopics[0]) {
      setCurrentTopic(newTopics[0]);
    }

    showToast(`Added ${newTopics.length} topic${newTopics.length > 1 ? 's' : ''} to your spin pool!`, 'success');
  }, [userSettings, updateSettings, showToast]);

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
      deleteCustomTopic
    }}>
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => useContext(DataContext);
