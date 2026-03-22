const express = require('express');
const router = express.Router();
const Analysis = require('../models/Analysis');

// In-memory vote store as fallback when MongoDB is unavailable
const memVotes = {};

/**
 * POST /api/votes
 * Body: { analysisId: "...", side: "for" | "against" }
 * For new topics without a saved analysis, use topic as key
 */
router.post('/', async (req, res) => {
  try {
    const { analysisId, side, topic } = req.body;

    if (!side || !['for', 'against'].includes(side)) {
      return res.status(400).json({ error: 'Side must be "for" or "against".' });
    }

    // Try MongoDB first
    if (analysisId && analysisId !== 'temp') {
      try {
        const update = side === 'for'
          ? { $inc: { 'votes.for': 1 } }
          : { $inc: { 'votes.against': 1 } };

        const analysis = await Analysis.findByIdAndUpdate(analysisId, update, { new: true });
        if (analysis) {
          return res.json({
            votes: analysis.votes,
            total: analysis.votes.for + analysis.votes.against,
          });
        }
      } catch { /* fall through to in-memory */ }
    }

    // In-memory fallback
    const key = analysisId || topic || 'default';
    if (!memVotes[key]) memVotes[key] = { for: 0, against: 0 };
    memVotes[key][side]++;

    const votes = memVotes[key];
    res.json({ votes, total: votes.for + votes.against });

  } catch (err) {
    console.error('Vote error:', err.message);
    res.status(500).json({ error: 'Vote failed.' });
  }
});

/**
 * GET /api/votes/:id
 */
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    if (id && id !== 'temp') {
      try {
        const analysis = await Analysis.findById(id).select('votes');
        if (analysis) {
          return res.json({ votes: analysis.votes, total: analysis.votes.for + analysis.votes.against });
        }
      } catch { /* fall through */ }
    }

    const votes = memVotes[id] || { for: 0, against: 0 };
    res.json({ votes, total: votes.for + votes.against });

  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch votes.' });
  }
});

module.exports = router;
