const Groq = require('groq-sdk');

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
const MODEL = 'llama-3.3-70b-versatile';

async function callGroq(systemPrompt, userMessage, maxTokens = 1000) {
  if (!process.env.GROQ_API_KEY) throw new Error('GROQ_API_KEY not set');

  const response = await groq.chat.completions.create({
    model: MODEL,
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userMessage },
    ],
    temperature: 0.3,
    max_tokens: maxTokens,
  });

  return response.choices[0].message.content.trim().replace(/```json\n?|\n?```/g, '').trim();
}

async function generateQueries(topic) {
  const system = `You are an expert in media framing and search engine optimization.`;
  const user = `Generate TWO search queries for: "${topic}"
1. FOR query — supports/advocates the topic
2. AGAINST query — opposes/critiques the topic

Rules: 4-8 words, include core subject in both, no generic words like "news" or "report"

Return ONLY valid JSON:
{ "for_query": "...", "against_query": "..." }`;

  const raw = await callGroq(system, user, 300);
  try {
    return JSON.parse(raw);
  } catch {
    const forMatch = raw.match(/"for_query"\s*:\s*"([^"]+)"/);
    const againstMatch = raw.match(/"against_query"\s*:\s*"([^"]+)"/);
    if (forMatch && againstMatch) {
      return { for_query: forMatch[1], against_query: againstMatch[1] };
    }
    return {
      for_query: `${topic} benefits success support`,
      against_query: `${topic} problems criticism opposition`,
    };
  }
}

async function classifyStancesBatch(topic, articles) {
  const system = `You are a media bias expert. Return ONLY a JSON array.`;
  const articlesData = articles.map((a, i) => ({
    index: i,
    title: a.title || '',
    description: a.summary || a.description || '',
  }));

  const user = `Topic: "${topic}"
Classify each article as FOR, AGAINST, or NEUTRAL.
FOR = supports the topic. AGAINST = opposes it. NEUTRAL = balanced.

Articles:
${JSON.stringify(articlesData, null, 2)}

Return ONLY a JSON array: [{ "index": 0, "stance": "FOR" }, ...]`;

  try {
    const raw = await callGroq(system, user, 800);
    const results = JSON.parse(raw);
    return results.map(r => ({ index: r.index, stance: r.stance || 'NEUTRAL' }));
  } catch (err) {
    console.error('Stance classification failed:', err.message);
    return articles.map((_, i) => ({ index: i, stance: 'NEUTRAL' }));
  }
}

async function generateNeutralAnalysis(topic, forArticles, againstArticles) {
  const system = `You are a neutral fact-checker. Use ONLY the provided articles. Do NOT hallucinate.`;
  const forSummaries = forArticles.map(a => `- ${a.title}: ${a.summary || a.description || ''}`).join('\n');
  const againstSummaries = againstArticles.map(a => `- ${a.title}: ${a.summary || a.description || ''}`).join('\n');

  const user = `Topic: "${topic}"

FOR articles:
${forSummaries || 'None'}

AGAINST articles:
${againstSummaries || 'None'}

Write a balanced analysis with 4 sections:
**Key Differences** — main disagreements between sides
**Bias Detection** — framing or language bias on each side
**Missing Context** — what neither side addresses
**Balanced Conclusion** — fair 2-sentence synthesis

Base your response ONLY on the articles above.`;

  return await callGroq(system, user, 1200);
}

async function compareArticles(article1, article2) {
  const system = `You are an expert media analyst. Be precise and evidence-based.`;
  const user = `Compare these two articles:

Article 1: "${article1.title}" (${article1.source || 'Unknown'})
${article1.summary || article1.description || 'No content'}

Article 2: "${article2.title}" (${article2.source || 'Unknown'})
${article2.summary || article2.description || 'No content'}

Cover:
**Sentiment** — tone of each article
**Bias Indicators** — loaded words, framing
**Tone** — formal/informal/alarmist/measured
**Key Differences** — factual or perspective gaps
**Summary** — one paragraph comparing both`;

  return await callGroq(system, user, 1500);
}

module.exports = {
  generateQueries,
  classifyStancesBatch,
  generateNeutralAnalysis,
  compareArticles,
};