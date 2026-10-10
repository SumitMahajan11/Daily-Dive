/**
 * Converts 12-hour format ("09:00 AM") to 24-hour format ("09:00")
 */
export function formatTo24Hour(time12) {
  if (!time12 || typeof time12 !== 'string') return '09:00';
  const match = time12.trim().match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
  if (!match) return '09:00';
  let hours = parseInt(match[1], 10);
  const minutes = match[2];
  const period = match[3].toUpperCase();

  if (period === 'PM' && hours < 12) hours += 12;
  if (period === 'AM' && hours === 12) hours = 0;

  return `${String(hours).padStart(2, '0')}:${minutes}`;
}

/**
 * Generates an RFC 5545 compliant .ics iCalendar file string for daily learning reminder.
 * 
 * @param {string} time12 - 12-hour formatted time (e.g. "09:00 AM")
 * @param {string} appUrl - Target URL for the learning session
 * @returns {string} Standard .ics file content
 */
export function generateDailyReminderICS(time12 = '09:00 AM', appUrl = 'https://daily-dive.vercel.app') {
  const time24 = formatTo24Hour(time12);
  const [hoursStr, minsStr] = time24.split(':');
  const hours = parseInt(hoursStr, 10) || 9;
  const mins = parseInt(minsStr, 10) || 0;

  // Use current date for DTSTART (floating local time without trailing Z)
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');

  const dtStart = `${year}${month}${day}T${String(hours).padStart(2, '0')}${String(mins).padStart(2, '0')}00`;
  
  // 15-minute event duration
  const endTotalMins = (hours * 60 + mins + 15) % (24 * 60);
  const endHours = Math.floor(endTotalMins / 60);
  const endMins = endTotalMins % 60;
  const dtEnd = `${year}${month}${day}T${String(endHours).padStart(2, '0')}${String(endMins).padStart(2, '0')}00`;

  const dtStamp = `${year}${month}${day}T000000Z`;
  const uid = `daily-dive-daily-reminder-${year}${month}${day}-${hours}${mins}@daily-dive`;

  const icsLines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Daily Dive//Daily Micro-Learning Reminder//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:${uid}`,
    `DTSTAMP:${dtStamp}`,
    `DTSTART:${dtStart}`,
    `DTEND:${dtEnd}`,
    'RRULE:FREQ=DAILY',
    'SUMMARY:Daily Dive — 5-min Learning',
    "DESCRIPTION:Time for your Daily Dive! Explore today's concept and maintain your learning streak.\\n\\n" + appUrl,
    `URL:${appUrl}`,
    'STATUS:CONFIRMED',
    'BEGIN:VALARM',
    'TRIGGER:-PT0M',
    'ACTION:DISPLAY',
    'DESCRIPTION:Time for your Daily Dive!',
    'END:VALARM',
    'END:VEVENT',
    'END:VCALENDAR'
  ];

  return icsLines.join('\r\n');
}

/**
 * Triggers browser download of the daily reminder .ics file
 */
export function downloadCalendarReminder(time12 = '09:00 AM') {
  const origin = typeof window !== 'undefined' ? window.location.origin : 'https://daily-dive.vercel.app';
  const icsData = generateDailyReminderICS(time12, origin);
  const blob = new Blob([icsData], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', 'daily-dive-reminder.ics');
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
