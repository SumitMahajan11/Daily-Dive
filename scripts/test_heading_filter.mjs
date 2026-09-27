import fs from 'fs';

const STOP_WORDS = new Set([
  'a', 'about', 'above', 'after', 'again', 'against', 'all', 'am', 'an', 'and', 'any', 'are', 'aren',
  'as', 'at', 'be', 'because', 'been', 'before', 'being', 'below', 'between', 'both', 'but', 'by',
  'can', 'could', 'did', 'do', 'does', 'doing', 'down', 'during', 'each', 'few', 'for', 'from',
  'further', 'had', 'has', 'have', 'having', 'he', 'her', 'here', 'hers', 'herself', 'him', 'himself',
  'his', 'how', 'i', 'if', 'in', 'into', 'is', 'it', 'its', 'itself', 'just', 'me', 'more', 'most',
  'my', 'myself', 'no', 'nor', 'not', 'now', 'of', 'off', 'on', 'once', 'only', 'or', 'other', 'our',
  'ours', 'ourselves', 'out', 'over', 'own', 'same', 'she', 'should', 'so', 'some', 'such', 'than',
  'that', 'the', 'their', 'theirs', 'them', 'themselves', 'then', 'there', 'these', 'they', 'this',
  'those', 'through', 'to', 'too', 'under', 'until', 'up', 'very', 'was', 'we', 'were', 'what',
  'when', 'where', 'which', 'while', 'who', 'whom', 'why', 'with', 'would', 'you', 'your', 'yours',
  'yourself', 'yourselves', 'will', 'shall', 'also', 'slide', 'page', 'chapter', 'presentation',
  'using', 'used', 'use', 'per', 'based', 'practical',
  // Procedural UI & instruction stop words:
  'select', 'selected', 'selects', 'selecting', 'click', 'clicked', 'clicking', 'choose', 'chosen',
  'choosing', 'open', 'opened', 'opening', 'close', 'closed', 'closing', 'save', 'saved', 'saving',
  'enter', 'entered', 'entering', 'press', 'pressed', 'pressing', 'show', 'shows', 'shown', 'showing',
  'see', 'seen', 'seeing', 'look', 'looks', 'looking', 'let', 'lets', 'follow', 'following', 'followed',
  'display', 'displays', 'displayed', 'bar', 'pane', 'panes', 'toolbar', 'window', 'button', 'buttons',
  'step', 'steps', 'task', 'tasks', 'activity', 'activities', 'exercise', 'exercises', 'part', 'parts',
  'diagram', 'figure', 'table', 'screenshot', 'image', 'photo', 'output', 'results', 'result',
  'option', 'options', 'tab', 'tabs', 'menu', 'menus', 'screen', 'screens', 'view', 'views',
  'here', 'below', 'above', 'next', 'first', 'second', 'third', 'finally', 'now'
]);

export function isNonTopicHeading(line) {
  if (!line || typeof line !== 'string') return true;
  const l = line.trim();
  const lower = l.toLowerCase();

  if (l.length < 4) return true;

  // 1. UI components, bars, panes, toolbars, dialogs
  const uiWidgetRegex = /^(?:the\s+)?(?:display\s+filter\s+bar|main\s+toolbar|menu\s+bar|packet\s+(?:list|details|bytes)\s+pane|status\s+bar|scroll\s+bar|title\s+bar|navigation\s+pane|side\s+panel|dialog\s+box|window|button|tab)\b/i;
  if (uiWidgetRegex.test(lower)) return true;
  if (/\b(?:filter\s+bar|main\s+toolbar|menu\s+bar|packet\s+list\s+pane|packet\s+details\s+pane|packet\s+bytes\s+pane|dialog\s+box|status\s+bar)\b/i.test(lower)) return true;

  // 2. Figures, diagrams, tables, screenshots, outputs
  const figureRegex = /^(?:\[?(?:figure|fig\.?|diagram|screenshot|photo|image|table|graph|chart|output|observation)[\s:\]\d]|\b(?:screenshot of|diagram showing|network diagram)\b)/i;
  if (figureRegex.test(lower) || lower.startsWith('[network diagram') || lower === 'output:' || lower === 'output') return true;

  // 3. Procedural steps, numbered lab actions
  const stepRegex = /^(?:step|task|activity|exercise|part|phase|stage|question|q\s*\.?)\s*\d+[\s:.\-]/i;
  if (stepRegex.test(lower)) return true;

  // 4. Imperative instructions
  const imperativeRegex = /^(?:click\s+on|select\s+the|choose\s+a|double[\s-]click|right[\s-]click|press\s+enter|navigate\s+to|open\s+the|close\s+the|wait\s+for|measure\s+and|enter\s+the|type\s+the|drag\s+the|scroll\s+down|check\s+the|switch\s+to|run\s+the)\b/i;
  if (imperativeRegex.test(lower)) return true;

  // 5. Academic / lab manual headers & single generic words
  const academicRegex = /^(?:lab\s+assignment|lab\s+manual|experiment\s*(?:no\.?|\d+)|practical\s*(?:no\.?|\d+)|aim\b|apparatus\b|prerequisites?\b|solution\b|techniques?\b|observations?\b|procedure\b|conclusion\b)/i;
  if (academicRegex.test(lower)) return true;

  // 6. Single words that are generic or verbs
  const words = l.split(/\s+/).filter(Boolean);
  if (words.length <= 1) return true;

  return false;
}

console.log('Tested isNonTopicHeading:');
console.log('The display filter bar:', isNonTopicHeading('The display filter bar')); // should be true
console.log('The main toolbar:', isNonTopicHeading('The main toolbar')); // should be true
console.log('The packet list pane:', isNonTopicHeading('The packet list pane')); // should be true
console.log('Step 3: Stopping the packet capture:', isNonTopicHeading('Step 3: Stopping the packet capture')); // should be true
console.log('Lab Assignment:', isNonTopicHeading('Lab Assignment')); // should be true
console.log('[Network Diagram: Router connected...]:', isNonTopicHeading('[Network Diagram: Router connected to Switch, Switch connected to PC]')); // should be true
console.log('Solution:', isNonTopicHeading('Solution')); // should be true
console.log('Analyzing Captured Traffic:', isNonTopicHeading('Analyzing Captured Traffic')); // should be false
console.log('Horizontal Scaling (Scaling Out/In):', isNonTopicHeading('Horizontal Scaling (Scaling Out/In)')); // should be false
console.log('Dijkstra Shortest Path Algorithm:', isNonTopicHeading('Dijkstra Shortest Path Algorithm')); // should be false
