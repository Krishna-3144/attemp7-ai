const express = require('express');
const router = express.Router();
const NodeCache = require('node-cache');

const { generateQueries, classifyStancesBatch, generateNeutralAnalysis } = require('../services/grokService');
const { fetchArticles, normalizeArticle, deduplicateArticles, scoreArticle } = require('../services/newsService');
const { extractFromUrl, isValidUrl } = require('../services/urlExtractor');
const Analysis = require('../models/Analysis');

const cache = new NodeCache({ stdTTL: 600 });

router.post('/', async (req, res) => {
  try {
    const body = req.body || {};
    const rawInput = (body.input || body.topic || '').toString().trim();

    if (!rawInput || rawInput.length < 3) {
      return res.status(400).json({
        error: 'Please provide a news topic or article URL (minimum 3 characters).',
      });
    }

    const cacheKey = `analyze:${rawInput.toLowerCase().slice(0, 100)}`;
    const cached = cache.get(cacheKey);
    if (cached) return res.json({ ...cached, fromCache: true });

    let topic = rawInput;

    if (isValidUrl(rawInput)) {
      console.log('Extracting content from URL:', rawInput);
      const extracted = await extractFromUrl(rawInput);
      topic = extracted.title || rawInput;
    }

    console.log(`\n🔍 Analyzing: "${topic}"`);

    console.log('Step 1: Generating search queries...');
    const queries = await generateQueries(topic);
    console.log('FOR query:', queries.for_query);
    console.log('AGAINST query:', queries.against_query);

    console.log('Step 2: Fetching articles...');
    const [forRaw, againstRaw] = await Promise.allSettled([
      fetchArticles(queries.for_query, 12),
      fetchArticles(queries.against_query, 12),
    ]);

    const forArticlesRaw = forRaw.status === 'fulfilled' ? forRaw.value : [];
    const againstArticlesRaw = againstRaw.status === 'fulfilled' ? againstRaw.value : [];

    console.log(`Fetched: ${forArticlesRaw.length} FOR, ${againstArticlesRaw.length} AGAINST`);

    const allNormalized = deduplicateArticles([
      ...forArticlesRaw.map(normalizeArticle),
      ...againstArticlesRaw.map(normalizeArticle),
    ]);

    const scoredArticles = allNormalized
      .map(a => ({ ...a, score: scoreArticle(a, topic) }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 16);

    if (scoredArticles.length === 0) {
      return res.status(404).json({ error: 'No articles found for this topic. Try a different query.' });
    }

    console.log(`Step 3: Classifying stances for ${scoredArticles.length} articles...`);
    const stanceResults = await classifyStancesBatch(topic, scoredArticles);

    const classifiedArticles = scoredArticles.map((article, i) => {
      const stance = stanceResults.find(r => r.index === i);
      return { ...article, stance: stance?.stance || 'NEUTRAL' };
    });

    const forArticles = classifiedArticles.filter(a => a.stance === 'FOR').slice(0, 3);
    const againstArticles = classifiedArticles.filter(a => a.stance === 'AGAINST').slice(0, 3);

    console.log(`Verified: ${forArticles.length} FOR, ${againstArticles.length} AGAINST`);

    const finalFor = forArticles.length > 0 ? forArticles :
      classifiedArticles.filter(a => a.stance === 'NEUTRAL').slice(0, 2);
    const finalAgainst = againstArticles.length > 0 ? againstArticles :
      classifiedArticles.filter(a => a.stance === 'NEUTRAL').slice(2, 4);

    console.log('Step 4: Generating neutral analysis...');
    const centerAnalysis = await generateNeutralAnalysis(topic, finalFor, finalAgainst);

    const result = {
      topic,
      for_articles: finalFor,
      against_articles: finalAgainst,
      center_analysis: centerAnalysis,
      queries,
      total_analyzed: scoredArticles.length,
    };

    saveAnalysis(result).catch(err => console.warn('DB save failed:', err.message));
    cache.set(cacheKey, result);

    console.log('✅ Analysis complete!\n');
    res.json(result);

  } catch (err) {
    console.error('Analysis error:', err.message);

    if (err.message.includes('GROQ_API_KEY') || err.message.includes('GROK_API_KEY')) {
      return res.status(500).json({ error: 'LLM API key not configured. Set GROQ_API_KEY in .env' });
    }
    if (err.message.includes('NEWS_API_KEY')) {
      return res.status(500).json({ error: 'NewsAPI key not configured. Set NEWS_API_KEY in .env' });
    }
    if (err.response?.status === 429) {
      return res.status(429).json({ error: 'API rate limit reached. Please try again.' });
    }

    res.status(500).json({ error: 'Analysis failed. Please try again.', details: err.message });
  }
});

async function saveAnalysis(result) {
  try {
    const analysis = new Analysis({
      topic: result.topic,
      for_articles: result.for_articles,
      against_articles: result.against_articles,
      center_analysis: result.center_analysis,
    });
    await analysis.save();
  } catch { /* MongoDB might be down */ }
}

module.exports = router;