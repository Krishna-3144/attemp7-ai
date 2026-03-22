const express = require('express');
const router = express.Router();
const NodeCache = require('node-cache');
const { fetchTrending, normalizeArticle } = require('../services/newsService');
const Analysis = require('../models/Analysis');

const cache = new NodeCache({ stdTTL: 300 }); // 5 min cache

/**
 * GET /api/trending
 * Query params: category (optional)
 */
router.get('/', async (req, res) => {
  try {
    const { category = 'general' } = req.query;
    const cacheKey = `trending:${category}`;

    const cached = cache.get(cacheKey);
    if (cached) return res.json(cached);

    // Fetch trending from NewsAPI
    const articles = await fetchTrending(category, 12);
    const normalized = articles.map(normalizeArticle).filter(a => a.title && a.url);

    // Also fetch recent analyses from DB
    let recentTopics = [];
    try {
      const recent = await Analysis.find()
        .sort({ createdAt: -1 })
        .limit(5)
        .select('topic createdAt');
      recentTopics = recent.map(r => ({ topic: r.topic, createdAt: r.createdAt }));
    } catch { /* MongoDB might be down */ }

    const result = { articles: normalized, recentTopics, category };
    cache.set(cacheKey, result);

    res.json(result);

  } catch (err) {
    console.error('Trending error:', err.message);
    if (err.message.includes('NEWS_API_KEY')) {
      return res.status(500).json({ error: 'NEWS_API_KEY not configured.' });
    }
    res.status(500).json({ error: 'Failed to fetch trending news.', details: err.message });
  }
});

module.exports = router;
