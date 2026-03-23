const axios = require('axios');
const xml2js = require('xml2js');

async function fetchArticles(query, pageSize = 10) {
  const encodedQuery = encodeURIComponent(query);
  const url = `https://news.google.com/rss/search?q=${encodedQuery}&hl=en-US&gl=US&ceid=US:en`;

  const response = await axios.get(url, {
    timeout: 15000,
    headers: {
      'User-Agent': 'Mozilla/5.0 (compatible; TwoSidedNews/1.0)',
    },
  });

  const parsed = await xml2js.parseStringPromise(response.data, { explicitArray: false });
  const items = parsed?.rss?.channel?.item || [];
  const articleArray = Array.isArray(items) ? items : [items];

  return articleArray.slice(0, pageSize).map(item => ({
    title: item.title || '',
    url: item.link || '',
    source: item.source?._ || item.source || extractDomain(item.link),
    summary: cleanDescription(item.description || ''),
    publishedAt: item.pubDate ? new Date(item.pubDate).toISOString() : new Date().toISOString(),
    urlToImage: null,
  }));
}

async function fetchTrending(category = 'general', pageSize = 10) {
  const topicMap = {
    general: 'https://news.google.com/rss?hl=en-US&gl=US&ceid=US:en',
    technology: 'https://news.google.com/rss/topics/CAAqJggKIiBDQkFTRWdvSUwyMHZNRGRqTVhZU0FtVnVHZ0pWVXlBQVAB',
    business: 'https://news.google.com/rss/topics/CAAqJggKIiBDQkFTRWdvSUwyMHZNRGx6TVdZU0FtVnVHZ0pWVXlBQVAB',
    science: 'https://news.google.com/rss/topics/CAAqJggKIiBDQkFTRWdvSUwyMHZNR1p0TlhZU0FtVnVHZ0pWVXlBQVAB',
    health: 'https://news.google.com/rss/topics/CAAqIQgKIhtDQkFTRGdvSUwyMHZNR3QwTlRZU0FtVnVLQUFQAQ',
    politics: 'https://news.google.com/rss/topics/CAAqIQgKIhtDQkFTRGdvSUwyMHZNR1ZqTVRZU0FtVnVLQUFQAQ',
  };

  const url = topicMap[category] || topicMap.general;

  const response = await axios.get(url, {
    timeout: 15000,
    headers: { 'User-Agent': 'Mozilla/5.0 (compatible; TwoSidedNews/1.0)' },
  });

  const parsed = await xml2js.parseStringPromise(response.data, { explicitArray: false });
  const items = parsed?.rss?.channel?.item || [];
  const articleArray = Array.isArray(items) ? items : [items];

  return articleArray.slice(0, pageSize).map(item => ({
    title: item.title || '',
    url: item.link || '',
    source: item.source?._ || extractDomain(item.link),
    summary: cleanDescription(item.description || ''),
    publishedAt: item.pubDate ? new Date(item.pubDate).toISOString() : new Date().toISOString(),
    urlToImage: null,
  }));
}

function normalizeArticle(article) {
  return {
    title: article.title || 'Untitled',
    url: article.url || '',
    source: article.source || 'Unknown',
    summary: article.summary || '',
    publishedAt: article.publishedAt || new Date().toISOString(),
    urlToImage: null,
  };
}

function deduplicateArticles(articles) {
  const seenUrls = new Set();
  const seenTitles = new Set();
  const unique = [];

  for (const article of articles) {
    const titleKey = article.title?.toLowerCase().slice(0, 60) || '';
    if (
      article.url &&
      !seenUrls.has(article.url) &&
      !seenTitles.has(titleKey) &&
      article.title !== '[Removed]' &&
      article.title
    ) {
      seenUrls.add(article.url);
      seenTitles.add(titleKey);
      unique.push(article);
    }
  }

  return unique;
}

function scoreArticle(article, topic) {
  const stopwords = new Set(['this','that','with','from','they','have','what','when','where','will','been','were','their','about','which','would','could','should','also','than','then','more','some','into','over','after','before']);

  const keywords = topic.toLowerCase()
    .split(/\s+/)
    .filter(w => w.length > 3 && !stopwords.has(w));

  let score = 0;

  for (const kw of keywords) {
    if (article.title?.toLowerCase().includes(kw)) score += 3;
    if (article.summary?.toLowerCase().includes(kw)) score += 1;
  }

  if (article.publishedAt) {
    const daysSince = (Date.now() - new Date(article.publishedAt)) / (1000 * 60 * 60 * 24);
    if (daysSince < 1) score += 5;
    else if (daysSince < 3) score += 3;
    else if (daysSince < 7) score += 1;
  }

  if (article.title && article.summary && article.summary.length > 50) score += 2;

  return score;
}

function cleanDescription(html) {
  return html
    .replace(/<[^>]+>/g, '')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 300);
}

function extractDomain(url) {
  try {
    return new URL(url).hostname.replace('www.', '');
  } catch {
    return 'Unknown';
  }
}

module.exports = {
  fetchArticles,
  fetchTrending,
  normalizeArticle,
  deduplicateArticles,
  scoreArticle,
};