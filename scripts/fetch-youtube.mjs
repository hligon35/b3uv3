// Fetch latest YouTube videos from channel RSS and write JSON for the site
// Usage: node scripts/fetch-youtube.mjs [maxItems]
// Defaults to 6 items

import fs from 'node:fs/promises';
import path from 'node:path';
import Parser from 'rss-parser';

const CHANNEL_ID = process.env.YT_CHANNEL_ID || 'UCSrtA1gGlgo4cQUzoSlzZ5w';
const FEED_URL = `https://www.youtube.com/feeds/videos.xml?channel_id=${CHANNEL_ID}`;
const MAX_ITEMS = Number(process.argv[2]) || 6;

function getVideoIdFromLink(link) {
  try {
    const url = new URL(link);
    // RSS link format: https://www.youtube.com/watch?v=VIDEO_ID
    return url.searchParams.get('v') || '';
  } catch {
    return '';
  }
}

function formatDate(d) {
  try {
    const date = new Date(d);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  } catch {
    return d || '';
  }
}

async function main() {
  const parser = new Parser({
    customFields: {
      item: [ ['media:group', 'media_group'] ],
    },
  });

  const feed = await parser.parseURL(FEED_URL);
  const items = (feed.items || []).slice(0, MAX_ITEMS).map((item) => {
    const id = getVideoIdFromLink(item.link || '') || item.id || '';
    let thumbnail = '';
    // Try media group thumbnail
    const mg = item.media_group;
    if (mg && mg['media:thumbnail'] && mg['media:thumbnail']['$'] && mg['media:thumbnail']['$'].url) {
      thumbnail = mg['media:thumbnail']['$'].url;
    }
    if (!thumbnail && id) {
      thumbnail = `https://img.youtube.com/vi/${id}/maxresdefault.jpg`;
    }

    return {
      id,
      title: item.title || 'Untitled',
      description: (item.contentSnippet || item.summary || '').trim(),
      thumbnail,
      publishedAt: formatDate(item.pubDate || item.isoDate),
      link: item.link || (id ? `https://www.youtube.com/watch?v=${id}` : ''),
    };
  });

  const outDir = path.join(process.cwd(), 'public', 'data');
  const outFile = path.join(outDir, 'youtube.json');
  await fs.mkdir(outDir, { recursive: true });
  await fs.writeFile(outFile, JSON.stringify({
    source: FEED_URL,
    channelId: CHANNEL_ID,
    fetchedAt: new Date().toISOString(),
    count: items.length,
    videos: items,
  }, null, 2));
  console.log(`Wrote ${items.length} videos to ${path.relative(process.cwd(), outFile)}`);
}

main().catch((err) => {
  console.error('Failed to fetch YouTube feed:', err);
  process.exit(1);
});
