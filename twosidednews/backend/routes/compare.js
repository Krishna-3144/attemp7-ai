const express = require('express');
const router = express.Router();
const { compareArticles } = require('../services/grokService');

/**
 * POST /api/compare
 * Body: { article1: { title, source, summary, url }, article2: { ... } }
 */
router.post('/', async (req, res) => {
  try {
    const { article1, article2 } = req.body;

    if (!article1 || !article2) {
      return res.status(400).json({ error: 'Both article1 and article2 are required.' });
    }

    if (!article1.title || !article2.title) {
      return res.status(400).json({ error: 'Articles must have a title.' });
    }

    const comparison = await compareArticles(article1, article2);

    res.json({
      article1: { title: article1.title, source: article1.source },
      article2: { title: article2.title, source: article2.source },
      comparison,
    });

  } catch (err) {
    console.error('Compare error:', err.message);
    res.status(500).json({ error: 'Comparison failed.', details: err.message });
  }
});

module.exports = router;
