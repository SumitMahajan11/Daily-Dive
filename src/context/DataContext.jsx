import React, { createContext, useContext, useEffect, useState, useMemo, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { DataService } from '../lib/dataService';
import { INITIAL_TOPICS, selectWeightedTopic } from '../lib/roulette';
import { AudioController } from '../lib/audio';
import { scheduleDailyReminder, cancelDailyReminder } from '../lib/notifications';

const DataContext = createContext(null);

export const DataProvider = ({ children }) => {
  const { user } = useAuth();
  
  const [topics, setTopics] = useState(INITIAL_TOPICS);
  const [userProgressMap, setUserProgressMap] = useState({});
  const [userStreaks, setUserStreaks] = useState({ current_streak: 0, longest_streak: 0, last_active_date: null });
  const [userSettings, setUserSettings] = useState({
    enabled_categories: {},
    reminder_time: '09:00 AM',
    notifications_enabled: false,
    sound_enabled: true,
    haptics_enabled: true
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
        setTopics(INITIAL_TOPICS);
        setUserProgressMap({});
        setUserStreaks({ current_streak: 0, longest_streak: 0, last_active_date: null });
        setCurrentTopic(INITIAL_TOPICS[0]);
        setLoadingData(false);
        return;
      }

      const [dbTopics, progress, streaks, settings] = await Promise.all([
        DataService.fetchTopics().catch(() => INITIAL_TOPICS),
        DataService.fetchUserProgress(userId).catch(() => ({})),
        DataService.fetchUserStreaks(userId).catch(() => ({ current_streak: 0, longest_streak: 0, last_active_date: null })),
        DataService.fetchUserSettings(userId).catch(() => null)
      ]);

      const effectiveTopics = (dbTopics && dbTopics.length > 0) ? dbTopics : INITIAL_TOPICS;
      setTopics(effectiveTopics);
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
      console.error('Error loading data:', err);
      showToast('Could not load data from Supabase', 'error');
    } finally {
      setLoadingData(false);
    }
  }, [showToast]);

  useEffect(() => {
    loadData(user?.id);
  }, [user, loadData]);

  // Filtered / eligible topics
  const eligibleTopics = useMemo(() => {
    const ec = userSettings.enabled_categories;
    const hasExplicitSettings = Object.keys(ec).length > 0;

    // If no settings have been explicitly saved yet → all topics are eligible (default open state)
    if (!hasExplicitSettings) return topics;

    return topics.filter(t => {
      const group = t.group_name || t.group;
      const cat = t.category || t.sub;
      // Group must be explicitly true (not just "not false")
      if (ec[group] !== true) return false;
      // Category must also be explicitly true
      const catKey = `${group}::${cat}`;
      if (ec[catKey] !== true && ec[cat] !== true) return false;
      return true;
    });
  }, [topics, userSettings.enabled_categories]);

  // Pure weighted selection call
  const spinNextTopic = useCallback(() => {
    const selected = selectWeightedTopic(topics, userProgressMap, userSettings.enabled_categories);
    const result = selected || eligibleTopics[Math.floor(Math.random() * eligibleTopics.length)] || topics[0];
    if (result) {
      setCurrentTopic(result);
    }
    return result;
  }, [topics, userProgressMap, userSettings.enabled_categories, eligibleTopics]);

  // Mark topic as learned with offline guard
  const markCurrentTopicLearned = useCallback(async () => {
    if (!currentTopic) return;

    if (!isOnline) {
      showToast("You're offline — reconnect to save this", 'warning');
      return;
    }

    if (!user) {
      // Local preview state for guest
      const currentProgress = userProgressMap[currentTopic.id] || { times_seen: 0, last_seen: null };
      const newTimesSeen = (currentProgress.times_seen || 0) + 1;
      const nowIso = new Date().toISOString();
      setUserProgressMap(prev => ({
        ...prev,
        [currentTopic.id]: { times_seen: newTimesSeen, last_seen: nowIso }
      }));
      setUserStreaks(prev => ({
        ...prev,
        current_streak: (prev.current_streak || 0) + 1,
        longest_streak: Math.max(prev.longest_streak || 0, (prev.current_streak || 0) + 1),
        last_active_date: nowIso.slice(0, 10)
      }));
      showToast('Marked as learned!', 'success');
      return;
    }

    setIsMarkingLearned(true);
    try {
      const result = await DataService.markTopicLearned(
        user.id,
        currentTopic.id,
        userProgressMap,
        userStreaks
      );

      if (result) {
        setUserProgressMap(prev => ({
          ...prev,
          [currentTopic.id]: result.updatedProgress
        }));
        setUserStreaks(result.updatedStreak);
        showToast('Marked as learned! Streak updated.', 'success');
      }
    } catch (err) {
      console.error('Mark as learned error:', err);
      showToast(err.message || 'Failed to save progress', 'error');
    } finally {
      setIsMarkingLearned(false);
    }
  }, [currentTopic, isOnline, user, userProgressMap, userStreaks, showToast]);

  // Update Settings patch
  const updateSettings = useCallback(async (patch) => {
    if (!isOnline) {
      showToast("You're offline — reconnect to save this", 'warning');
      return;
    }

    const newSettings = { ...userSettings, ...patch };
    setUserSettings(newSettings);

    if (user) {
      try {
        await DataService.updateUserSettings(user.id, patch);
      } catch (err) {
        console.error('Failed to sync settings:', err);
        showToast("Failed to sync settings with cloud", 'error');
      }
    }
  }, [isOnline, userSettings, user, showToast]);

  // Reset all data
  const resetAllData = useCallback(async () => {
    if (!isOnline) {
      showToast("You're offline — reconnect to reset cloud data", 'warning');
      return;
    }

    if (user) {
      await DataService.resetUserData(user.id);
    }

    setUserProgressMap({});
    setUserStreaks({ current_streak: 0, longest_streak: 0, last_active_date: null });
    showToast('All progress and streak records have been reset.', 'success');
  }, [isOnline, user, showToast]);

  // Import JSON backup
  const importDataBackup = useCallback(async (parsedBackup) => {
    if (!isOnline) {
      showToast("You're offline — reconnect to restore cloud data", 'warning');
      return;
    }

    if (parsedBackup.user_progress) setUserProgressMap(parsedBackup.user_progress);
    if (parsedBackup.user_streaks) setUserStreaks(parsedBackup.user_streaks);
    if (parsedBackup.user_settings) setUserSettings(prev => ({ ...prev, ...parsedBackup.user_settings }));

    if (user) {
      await DataService.importUserData(user.id, parsedBackup);
    }
    showToast('Backup imported and synced successfully', 'success');
  }, [isOnline, user, showToast]);

  return (
    <DataContext.Provider value={{
      topics,
      eligibleTopics,
      userProgressMap,
      userStreaks,
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
      importDataBackup
    }}>
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => useContext(DataContext);
