import { supabase } from './supabase';
import { calculateUpdatedStreak } from './roulette';

/**
 * Service providing Supabase database operations with offline guards.
 */
export const DataService = {
  /**
   * Fetch all topics from public topics table
   */
  async fetchTopics() {
    const { data, error } = await supabase
      .from('topics')
      .select('*')
      .order('group_name', { ascending: true });

    if (error) throw error;
    return data || [];
  },

  /**
   * Fetch all progress records for authenticated user
   */
  async fetchUserProgress(userId) {
    if (!userId) return {};
    const { data, error } = await supabase
      .from('user_progress')
      .select('topic_id, times_seen, last_seen')
      .eq('user_id', userId);

    if (error) throw error;

    const progressMap = {};
    (data || []).forEach(row => {
      progressMap[row.topic_id] = {
        times_seen: row.times_seen,
        last_seen: row.last_seen
      };
    });
    return progressMap;
  },

  /**
   * Fetch user streak metrics
   */
  async fetchUserStreaks(userId) {
    if (!userId) return { current_streak: 0, longest_streak: 0, last_active_date: null };
    const { data, error } = await supabase
      .from('user_streaks')
      .select('current_streak, longest_streak, last_active_date')
      .eq('user_id', userId)
      .maybeSingle();

    if (error && error.code !== 'PGRST116') throw error;
    return data || { current_streak: 0, longest_streak: 0, last_active_date: null };
  },

  /**
   * Fetch user settings and preferences
   */
  async fetchUserSettings(userId) {
    if (!userId) return null;
    const { data, error } = await supabase
      .from('user_settings')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    if (error && error.code !== 'PGRST116') throw error;
    return data || {
      enabled_categories: {},
      reminder_time: '09:00 AM',
      notifications_enabled: false,
      sound_enabled: true,
      haptics_enabled: true
    };
  },

  /**
   * Mark a topic as learned with offline write protection
   */
  async markTopicLearned(userId, topicId, currentProgressMap = {}, currentStreakData = {}) {
    if (typeof navigator !== 'undefined' && !navigator.onLine) {
      throw new Error("You're offline — reconnect to save this");
    }

    if (!userId || !topicId) return null;

    const existingProgress = currentProgressMap[topicId] || { times_seen: 0, last_seen: null };
    const newTimesSeen = (existingProgress.times_seen || 0) + 1;
    const nowIso = new Date().toISOString();

    // 1. Upsert progress
    const { error: progressError } = await supabase
      .from('user_progress')
      .upsert({
        user_id: userId,
        topic_id: topicId,
        times_seen: newTimesSeen,
        last_seen: nowIso
      });

    if (progressError) throw progressError;

    // 2. Calculate updated streak
    const updatedStreak = calculateUpdatedStreak(currentStreakData);

    const { error: streakError } = await supabase
      .from('user_streaks')
      .upsert({
        user_id: userId,
        current_streak: updatedStreak.current_streak,
        longest_streak: updatedStreak.longest_streak,
        last_active_date: updatedStreak.last_active_date
      });

    if (streakError) throw streakError;

    return {
      updatedProgress: { times_seen: newTimesSeen, last_seen: nowIso },
      updatedStreak
    };
  },

  /**
   * Update user settings in Supabase
   */
  async updateUserSettings(userId, settingsPatch = {}) {
    if (typeof navigator !== 'undefined' && !navigator.onLine) {
      throw new Error("You're offline — reconnect to save this");
    }

    if (!userId) return;
    const { error } = await supabase
      .from('user_settings')
      .upsert({
        user_id: userId,
        ...settingsPatch
      });

    if (error) throw error;
  },

  /**
   * Reset all user progress and reset streaks to 0
   */
  async resetUserData(userId) {
    if (typeof navigator !== 'undefined' && !navigator.onLine) {
      throw new Error("You're offline — reconnect to reset cloud data");
    }

    if (!userId) return;

    // 1. Delete progress
    const { error: progErr } = await supabase
      .from('user_progress')
      .delete()
      .eq('user_id', userId);

    if (progErr) throw progErr;

    // 2. Reset streaks
    const { error: streakErr } = await supabase
      .from('user_streaks')
      .upsert({
        user_id: userId,
        current_streak: 0,
        longest_streak: 0,
        last_active_date: null
      });

    if (streakErr) throw streakErr;
  },

  /**
   * Import data from JSON backup
   */
  async importUserData(userId, parsedBackup) {
    if (typeof navigator !== 'undefined' && !navigator.onLine) {
      throw new Error("You're offline — reconnect to restore cloud data");
    }

    if (!userId || !parsedBackup) return;

    if (parsedBackup.user_progress && typeof parsedBackup.user_progress === 'object') {
      const rows = Object.entries(parsedBackup.user_progress).map(([topicId, val]) => ({
        user_id: userId,
        topic_id: topicId,
        times_seen: val.times_seen || 1,
        last_seen: val.last_seen || new Date().toISOString()
      }));

      if (rows.length > 0) {
        const { error } = await supabase.from('user_progress').upsert(rows);
        if (error) throw error;
      }
    }

    if (parsedBackup.user_streaks && typeof parsedBackup.user_streaks === 'object') {
      const { error } = await supabase.from('user_streaks').upsert({
        user_id: userId,
        current_streak: parsedBackup.user_streaks.current_streak || 0,
        longest_streak: parsedBackup.user_streaks.longest_streak || 0,
        last_active_date: parsedBackup.user_streaks.last_active_date || null
      });
      if (error) throw error;
    }

    if (parsedBackup.user_settings && typeof parsedBackup.user_settings === 'object') {
      const { error } = await supabase.from('user_settings').upsert({
        user_id: userId,
        ...parsedBackup.user_settings
      });
      if (error) throw error;
    }
  }
};
