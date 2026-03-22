const axios = require('axios');

const NEWS_API_KEY = process.env.NEWS_API_KEY;
const NEWS_API_URL = 'https://newsapi.org/v2';

/**
 * Fetch articles from NewsAPI
 */
async function fetchArticles(query, pageSize = 10) {
  if (!NEWS_API_KEY) throw new Error('NEWS_API_KEY not set');

  const response = await axios.get(`${NEWS_API_URL}/everything`, {
    params: {
      q: query,
      pageSize,
      sortBy: 'relevancy',
      language: 'en',
      apiKey: NEWS_API_KEY,
    },
    timeout: 15000,
  });

  return response.data.articles || [];
}

/**
 * Fetch trending news headlines
 */
async function fetchTrending(category = 'general', pageSize = 10) {
  if (!NEWS_API_KEY) throw new Error('NEWS_API_KEY not set');

  const response = await axios.get(`${NEWS_API_URL}/top-headlines`, {
    params: {
      category,
      pageSize,
      language: 'en',
      apiKey: NEWS_API_KEY,
    },
    timeout: 15000,
  });

  return response.data.articles || [];
}

/**
 * Normalize articles from NewsAPI format
 */
function normalizeArticle(article) {
  return {
    title: article.title || 'Untitled',
    url: article.url || '',
    source: article.source?.name || 'Unknown',
    summary: article.description || article.content?.slice(0, 300) || '',
    publishedAt: article.publishedAt || new Date().toISOString(),
    urlToImage: article.urlToImage || null,
  };
}

/**
 * Remove duplicate articles by URL and title similarity
 */
function deduplicateArticles(articles) {
  const seenUrls = new Set();
  const seenTitles = new Set();
  const unique = [];

  for (const article of articles) {
    const titleKey = article.title?.toLowerCase().slice(0, 50) || '';
    if (
      article.url &&
      !seenUrls.has(article.url) &&
      !seenTitles.has(titleKey) &&
      article.title !== '[Removed]' &&
      article.url !== 'https://removed.com'
    ) {
      seenUrls.add(article.url);
      seenTitles.add(titleKey);
      unique.push(article);
    }
  }

  return unique;
}

/**
 * Score article relevance based on keyword presence
 */
function scoreArticle(article, topic) {
  const keywords = topic.toLowerCase().split(/\s+/).filter(w => w.length > 3);
  const text = `${article.title} ${article.summary}`.toLowerCase();
  
  let score = 0;
  for (const kw of keywords) {
    if (text.includes(kw)) score += 1;
  }
  
  // Boost for recency
  if (article.publishedAt) {
    const daysSince = (Date.now() - new Date(article.publishedAt)) / (1000 * 60 * 60 * 24);
    if (daysSince < 7) score += 2;
    else if (daysSince < 30) score += 1;
  }

  // Boost for having both title and summary
  if (article.title && article.summary) score += 1;

  return score;
}

module.exports = {
  fetchArticles,
  fetchTrending,
  normalizeArticle,
  deduplicateArticles,
  scoreArticle,
};
