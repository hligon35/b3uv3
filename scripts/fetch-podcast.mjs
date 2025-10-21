// Fetch Buzzsprout RSS feed and write a compact JSON for the site
// Usage: node scripts/fetch-podcast.mjs [maxItems]
// Defaults to 20 items

import fs from 'node:fs/promises';
import path from 'node:path';
import Parser from 'rss-parser';

const FEED_URL = process.env.PODCAST_RSS_URL || 'https://feeds.buzzsprout.com/2467135.rss';
const MAX_ITEMS = Number(process.argv[2]) || 20;

function toPlainText(html = '') {
  try {
    return html
      .replace(/<[^>]+>/g, ' ') // strip tags
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/\s+/g, ' ')
      .trim();
  } catch {
    return '';
  }
}

function formatDate(d) {
  try {
    const date = new Date(d);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  } catch {
    return d || '';
  }
}

async function main() {
  const parser = new Parser({
    customFields: {
      item: [
        ['itunes:duration', 'itunes_duration'],
        ['itunes:image', 'itunes_image'],
      ],
    },
  });

  const feed = await parser.parseURL(FEED_URL);
  const episodes = (feed.items || []).slice(0, MAX_ITEMS).map((item) => {
    const id = item.guid || item.id || item.link || String(Math.random());
    const duration = item.itunes_duration || item['itunes:duration'] || '';
    const enclosure = item.enclosure || {};
    const categories = Array.isArray(item.categories) ? item.categories : (item.category ? [item.category] : []);
    const category = categories[0] || 'General';
    const audioUrl = enclosure.url || '';
    const imageUrl = (item.itunes_image && (item.itunes_image.href || item.itunes_image.url)) || feed.image?.url || '';

    return {
      id: String(id),
      title: item.title || 'Untitled',
      category,
      duration,
      date: formatDate(item.pubDate || item.isoDate),
      description: toPlainText(item.content || item.contentSnippet || item.summary || ''),
      link: item.link || '',
      audioUrl,
      imageUrl,
    };
  });

  const outDir = path.join(process.cwd(), 'public', 'data');
  const outFile = path.join(outDir, 'podcast.json');
  await fs.mkdir(outDir, { recursive: true });
  await fs.writeFile(outFile, JSON.stringify({
    source: FEED_URL,
    fetchedAt: new Date().toISOString(),
    count: episodes.length,
    episodes,
  }, null, 2));
  console.log(`Wrote ${episodes.length} episodes to ${path.relative(process.cwd(), outFile)}`);
}

main().catch((err) => {
  console.error('Failed to fetch podcast feed:', err);
  process.exit(1);
});
