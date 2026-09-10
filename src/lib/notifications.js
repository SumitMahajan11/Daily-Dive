/**
 * Local Daily Learning Reminder Scheduler
 * 
 * NOTE: True background push notifications without an external Web Push server / VAPID keys
 * are unreliable on iOS Safari and when browser processes are killed.
 * This implementation provides best-effort local in-app / Web Notification scheduling
 * when the application or tab is active.
 */

let reminderTimerId = null;

export function scheduleDailyReminder(timeStr = '09:00 AM', onTrigger = null) {
  if (typeof window === 'undefined') return;

  if (reminderTimerId) {
    clearTimeout(reminderTimerId);
    reminderTimerId = null;
  }

  if (!('Notification' in window) || Notification.permission !== 'granted') {
    return;
  }

  // Parse time string e.g. "09:00 AM" or "08:00 PM"
  const [timePart, meridiem] = timeStr.split(' ');
  let [hours, minutes] = (timePart || '09:00').split(':').map(Number);
  if (meridiem === 'PM' && hours < 12) hours += 12;
  if (meridiem === 'AM' && hours === 12) hours = 0;

  const now = new Date();
  const target = new Date();
  target.setHours(hours, minutes || 0, 0, 0);

  if (target.getTime() <= now.getTime()) {
    target.setDate(target.getDate() + 1);
  }

  const delayMs = target.getTime() - now.getTime();
  console.log(`[PWA] Reminder scheduled in ${Math.round(delayMs / 60000)} minutes for ${timeStr}`);

  reminderTimerId = setTimeout(() => {
    if (Notification.permission === 'granted') {
      try {
        const notif = new Notification('Life Learning Roulette', {
          body: "Time for your daily learning spin! Discover a new micro-concept and maintain your streak.",
          icon: '/icons/icon-192.png',
          badge: '/icons/icon-192.png'
        });
        notif.onclick = () => {
          window.focus();
          if (onTrigger) onTrigger();
        };
      } catch (e) {
        console.warn('Failed to display notification:', e);
      }
    }
    // Re-arm for next day
    scheduleDailyReminder(timeStr, onTrigger);
  }, delayMs);
}

export function cancelDailyReminder() {
  if (reminderTimerId) {
    clearTimeout(reminderTimerId);
    reminderTimerId = null;
  }
}
