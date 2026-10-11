import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Escapes characters for safe inclusion in HTML attributes and content.
 */
export function escapeHtml(str) {
  if (str === null || str === undefined) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/**
 * Truncates text to approx max chars (default ~150) preserving words if possible.
 */
export function truncateDescription(str, max = 150) {
  if (!str) return '';
  const trimmed = str.trim();
  if (trimmed.length <= max) return trimmed;
  // Slice to max length
  return trimmed.slice(0, max).trim();
}

let cachedTopicsMap = null;
let cachedLessonsMap = null;

export function loadData() {
  if (cachedTopicsMap && cachedLessonsMap) {
    return { topicsMap: cachedTopicsMap, lessonsMap: cachedLessonsMap };
  }

  const searchDirs = [
    path.resolve(process.cwd(), 'data'),
    path.resolve(__dirname, '../data'),
    path.resolve(__dirname, 'data')
  ];

  let rawTopics = null;
  let rawLessons = null;

  for (const dir of searchDirs) {
    try {
      const tPath = path.join(dir, 'topics.curated.json');
      const lPath = path.join(dir, 'lessons.json');
      if (!rawTopics && fs.existsSync(tPath)) {
        rawTopics = JSON.parse(fs.readFileSync(tPath, 'utf8'));
      }
      if (!rawLessons && fs.existsSync(lPath)) {
        rawLessons = JSON.parse(fs.readFileSync(lPath, 'utf8'));
      }
      if (rawTopics && rawLessons) break;
    } catch (e) {
      // Continue to next directory
    }
  }

  cachedTopicsMap = new Map();
  if (Array.isArray(rawTopics)) {
    for (const t of rawTopics) {
      if (t && t.id) {
        cachedTopicsMap.set(t.id.toLowerCase(), t);
      }
    }
  }

  cachedLessonsMap = new Map();
  if (rawLessons && typeof rawLessons === 'object') {
    for (const [id, l] of Object.entries(rawLessons)) {
      if (l) {
        cachedLessonsMap.set(id.toLowerCase(), l);
      }
    }
  }

  return { topicsMap: cachedTopicsMap, lessonsMap: cachedLessonsMap };
}

export function lookupTopicAndLesson(topicId) {
  if (!topicId) return { topic: null, lesson: null };
  const cleanId = String(topicId).trim().toLowerCase();
  const { topicsMap, lessonsMap } = loadData();
  const topic = topicsMap.get(cleanId) || null;
  const lesson = lessonsMap.get(cleanId) || null;
  return { topic, lesson };
}

/**
 * Generates minimal HTML with OG tags and browser redirection.
 */
export function generateShareHtml({ topic, lesson, origin = 'https://daily-dive.vercel.app' }) {
  const isKnown = Boolean(topic && topic.id);

  const title = isKnown ? topic.title : 'Daily Dive';
  let description = '';
  if (isKnown) {
    if (lesson && lesson.idea) {
      description = truncateDescription(lesson.idea, 150);
    } else {
      description = topic.description || 'Master 690+ mental models, engineering concepts, and frameworks in daily 2-minute dives.';
    }
  } else {
    description = 'Master 690+ mental models, engineering concepts, and frameworks in daily 2-minute dives.';
  }

  const canonicalUrl = isKnown
    ? `${origin}/t/${encodeURIComponent(topic.id)}`
    : `${origin}/`;

  const redirectUrl = isKnown
    ? `/?topic=${encodeURIComponent(topic.id)}`
    : `/`;

  const imageUrl = `${origin}/og-default.png`;

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>${escapeHtml(title)}</title>
  <meta name="description" content="${escapeHtml(description)}">
  <link rel="canonical" href="${escapeHtml(canonicalUrl)}">

  <!-- Open Graph / WhatsApp / Facebook -->
  <meta property="og:type" content="website">
  <meta property="og:title" content="${escapeHtml(title)}">
  <meta property="og:description" content="${escapeHtml(description)}">
  <meta property="og:url" content="${escapeHtml(canonicalUrl)}">
  <meta property="og:image" content="${escapeHtml(imageUrl)}">
  <meta property="og:image:width" content="1200">
  <meta property="og:image:height" content="630">
  <meta property="og:site_name" content="Daily Dive">

  <!-- Twitter -->
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${escapeHtml(title)}">
  <meta name="twitter:description" content="${escapeHtml(description)}">
  <meta name="twitter:image" content="${escapeHtml(imageUrl)}">

  <!-- Instant Browser Redirect -->
  <meta http-equiv="refresh" content="0;url=${escapeHtml(redirectUrl)}">
  <script>window.location.replace(${JSON.stringify(redirectUrl)});</script>
</head>
<body>
  <p>Redirecting to <a href="${escapeHtml(redirectUrl)}">${escapeHtml(title)}</a>...</p>
</body>
</html>`;
}

export default async function handleShareRequest(req, res) {
  try {
    const host = (req.headers && (req.headers['x-forwarded-host'] || req.headers.host)) || 'daily-dive.vercel.app';
    const proto = (req.headers && (req.headers['x-forwarded-proto'])) || (host.includes('localhost') || host.includes('127.0.0.1') ? 'http' : 'https');
    const origin = `${proto}://${host}`;

    // Break-it: ignore topicId
    const topicId = null;

    const { topic, lesson } = lookupTopicAndLesson(topicId);
    const html = generateShareHtml({ topic, lesson, origin });

    if (res.setHeader) {
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      res.setHeader('Cache-Control', 'public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800');
    }
    if (res.status) {
      res.status(200);
    } else {
      res.statusCode = 200;
    }
    if (res.send) {
      res.send(html);
    } else {
      res.end(html);
    }
  } catch (err) {
    if (res.status) {
      res.status(500);
    } else {
      res.statusCode = 500;
    }
    res.end('Internal Server Error');
  }
}
