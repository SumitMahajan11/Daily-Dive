import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import {
  escapeHtml,
  truncateDescription,
  generateShareHtml,
  lookupTopicAndLesson,
  default as handleShareRequest
} from '../api/share.js';

describe('Round 16: Share Pages Handler & Open Graph Unit Tests', () => {

  test('escapeHtml correctly escapes ampersands, angle brackets, double quotes, and single quotes', () => {
    const raw = '<div class="alert" data-title=\'it\'s "cool" & bold\'>Hello & Welcome</div>';
    const escaped = escapeHtml(raw);

    assert.ok(!escaped.includes('<div'), 'Raw <div must not exist');
    assert.ok(!escaped.includes('"alert"'), 'Raw double quotes must not exist');
    assert.ok(escaped.includes('&lt;div'), '< must be replaced with &lt;');
    assert.ok(escaped.includes('&gt;'), '> must be replaced with &gt;');
    assert.ok(escaped.includes('&quot;alert&quot;'), '" must be replaced with &quot;');
    assert.ok(escaped.includes('&#39;'), "' must be replaced with &#39;");
    assert.ok(escaped.includes('&amp;'), '& must be replaced with &amp;');
  });

  test('generateShareHtml escapes dangerous titles and descriptions containing quotes and angle brackets', () => {
    const dangerousTopic = {
      id: 'xss-topic',
      title: '<script>alert("XSS & \'quotes\'")</script>',
      description: '<img src="x" onerror="evil()" /> & \'desc\''
    };

    const html = generateShareHtml({
      topic: dangerousTopic,
      origin: 'https://daily-dive.vercel.app'
    });

    // Verify unescaped tags are NOT present
    assert.ok(!html.includes('<script>alert'), 'Unescaped script must not exist in html');
    assert.ok(!html.includes('<img src='), 'Unescaped img tag must not exist in html');

    // Verify escaped entities ARE present
    assert.ok(html.includes('&lt;script&gt;alert(&quot;XSS &amp; &#39;quotes&#39;&quot;)&lt;/script&gt;'), 'Title must be HTML-escaped');
    assert.ok(html.includes('&lt;img src=&quot;x&quot; onerror=&quot;evil()&quot; /&gt; &amp; &#39;desc&#39;'), 'Description must be HTML-escaped');
  });

  test('Known topic with lesson returns og tags, truncated lesson idea, and redirects to /?topic=<id>', () => {
    const { topic, lesson } = lookupTopicAndLesson('multi-head-self-attention');

    assert.ok(topic, 'Topic multi-head-self-attention must exist');
    assert.ok(lesson, 'Lesson for multi-head-self-attention must exist');

    const html = generateShareHtml({
      topic,
      lesson,
      origin: 'https://daily-dive.vercel.app'
    });

    // Check Open Graph tags
    assert.ok(html.includes('<meta property="og:type" content="website">'), 'og:type must be website');
    assert.ok(html.includes(`<meta property="og:title" content="${escapeHtml(topic.title)}">`), 'og:title must match topic title');
    assert.ok(html.includes('content="Scaled dot-product attention allows a model to connect every word in a sentence to every other word at the same time.'), 'og:description must contain lesson idea');
    assert.ok(html.includes('<meta property="og:url" content="https://daily-dive.vercel.app/t/multi-head-self-attention">'), 'og:url must match /t/<id>');
    assert.ok(html.includes('<meta property="og:image" content="https://daily-dive.vercel.app/og-default.png">'), 'og:image must match static og-default.png');
    assert.ok(html.includes('<meta name="twitter:card" content="summary_large_image">'), 'twitter:card must be summary_large_image');

    // Check browser redirect
    assert.ok(html.includes('content="0;url=/?topic=multi-head-self-attention"'), 'Meta refresh must redirect to /?topic=multi-head-self-attention');
    assert.ok(html.includes('window.location.replace("/?topic=multi-head-self-attention")'), 'Script redirect must target /?topic=multi-head-self-attention');
  });

  test('Known topic without lesson returns og tags with topic.description and redirects to /?topic=<id>', () => {
    const topic = {
      id: 'custom-topic-no-lesson',
      title: 'Custom Concept',
      description: 'A detailed explanation of a custom concept without a 3-part lesson.'
    };

    const html = generateShareHtml({
      topic,
      lesson: null,
      origin: 'https://daily-dive.vercel.app'
    });

    assert.ok(html.includes('<meta property="og:title" content="Custom Concept">'));
    assert.ok(html.includes('<meta property="og:description" content="A detailed explanation of a custom concept without a 3-part lesson.">'));
    assert.ok(html.includes('content="0;url=/?topic=custom-topic-no-lesson"'));
  });

  test('Unknown topic returns generic site card and redirects to /', () => {
    const { topic, lesson } = lookupTopicAndLesson('non-existent-topic-id-12345');

    assert.strictEqual(topic, null, 'Unknown topic must resolve to null');
    assert.strictEqual(lesson, null, 'Unknown lesson must resolve to null');

    const html = generateShareHtml({
      topic: null,
      lesson: null,
      origin: 'https://daily-dive.vercel.app'
    });

    assert.ok(html.includes('<meta property="og:title" content="Daily Dive">'), 'og:title must be Daily Dive');
    assert.ok(html.includes('<meta property="og:url" content="https://daily-dive.vercel.app/">'), 'og:url must be root /');
    assert.ok(html.includes('content="0;url=/"'), 'Meta refresh must redirect to /');
    assert.ok(html.includes('window.location.replace("/")'), 'Script redirect must target /');
  });

  test('handleShareRequest end-to-end mock execution returns 200 with HTML headers', async () => {
    const req = {
      headers: { host: 'localhost:3000' },
      url: '/t/multi-head-self-attention'
    };

    let responseCode = null;
    const responseHeaders = {};
    let responseBody = '';

    const res = {
      setHeader(name, val) {
        responseHeaders[name] = val;
      },
      status(code) {
        responseCode = code;
      },
      end(body) {
        responseBody = body;
      }
    };

    await handleShareRequest(req, res);

    assert.strictEqual(responseHeaders['Content-Type'], 'text/html; charset=utf-8');
    assert.ok(responseBody.includes('<meta property="og:title" content="Scaled Dot-Product">'));
    assert.ok(responseBody.includes('content="0;url=/?topic=multi-head-self-attention"'));
  });

});
