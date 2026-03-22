const mongoose = require('mongoose');

const ArticleSchema = new mongoose.Schema({
  title: String,
  url: String,
  source: String,
  summary: String,
  publishedAt: String,
  stance: { type: String, enum: ['FOR', 'AGAINST', 'NEUTRAL'] },
  score: Number,
});

const AnalysisSchema = new mongoose.Schema({
  topic: { type: String, required: true },
  for_articles: [ArticleSchema],
  against_articles: [ArticleSchema],
  center_analysis: String,
  votes: {
    for: { type: Number, default: 0 },
    against: { type: Number, default: 0 },
  },
  createdAt: { type: Date, default: Date.now },
});

// Index for trending queries
AnalysisSchema.index({ createdAt: -1 });
AnalysisSchema.index({ topic: 'text' });

const Analysis = mongoose.model('Analysis', AnalysisSchema);
module.exports = Analysis;
