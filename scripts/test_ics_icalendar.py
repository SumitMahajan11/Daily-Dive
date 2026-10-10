import subprocess
import icalendar

# Generate ICS content using node calling generateDailyReminderICS
cmd = ["node", "-e", "import { generateDailyReminderICS } from './src/lib/calendar.js'; console.log(generateDailyReminderICS('09:00 AM', 'https://daily-dive.vercel.app'));"]
result = subprocess.run(cmd, capture_output=True, text=True, check=True)
ics_text = result.stdout.strip()

print("================================================================")
print("              ICALENDAR RFC 5545 COMPLIANCE TEST                ")
print("================================================================\n")
print("Generated ICS Output:")
print("----------------------------------------------------------------")
print(ics_text)
print("----------------------------------------------------------------\n")

# 1. Assert line length <= 75 octets
lines = ics_text.splitlines()
for i, line in enumerate(lines):
    octets = len(line.encode('utf-8'))
    print(f"Line {i+1:2d} octets: {octets:2d} -> '{line[:45]}'")
    assert octets <= 75, f"Line {i+1} exceeds 75 octets: {octets} bytes"

print("\n[PASS]: All lines strictly conform to RFC 5545 75-octet line length limits.")

# 2. Parse with python icalendar library
cal = icalendar.Calendar.from_ical(ics_text)
assert cal.get('prodid') is not None, "Missing PRODID"
assert str(cal.get('version')) == "2.0", f"Expected version 2.0, got {cal.get('version')}"

events = [c for c in cal.walk() if c.name == "VEVENT"]
assert len(events) == 1, f"Expected 1 VEVENT, got {len(events)}"
event = events[0]

print(f"\nSummary:     {event.get('summary')}")
print(f"Description: {event.get('description')}")
print(f"DTSTART:     {event.get('dtstart').to_ical().decode('utf-8')}")
print(f"DTEND:       {event.get('dtend').to_ical().decode('utf-8')}")
print(f"DTSTAMP:     {event.get('dtstamp').to_ical().decode('utf-8')}")
print(f"RRULE:       {event.get('rrule').to_ical().decode('utf-8')}")

assert "Daily Dive" in str(event.get('summary')) and "5-min Learning" in str(event.get('summary'))
assert "maintain your learning streak" in str(event.get('description'))
assert event.get('dtstamp') is not None

print("\n================================================================")
print("ICALENDAR VALIDATION SUITE PASSED SUCCESSFULLY!")
print("================================================================\n")
