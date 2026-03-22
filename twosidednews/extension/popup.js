const API_BASE = 'http://localhost:5000/api';
const WEB_APP_URL = 'http://localhost:5173';

let currentUrl = '';
let lastTopic = '';

const LOADING_STEPS = [
  'Generating AI queries...',
  'Fetching articles from NewsAPI...',
  'Scoring and deduplicating...',
  'Verifying stances with AI...',
  'Generating neutral analysis...',
];

// DOM elements
const inputSection = document.getElementById('inputSection');
const loadingSection = document.getElementById('loadingSection');
const errorSection = document.getElementById('errorSection');
const resultsSection = document.getElementById('resultsSection');
const topicInput = document.getElementById('topicInput');
const currentUrlEl = document.getElementById('currentUrl');
const loadingStep = document.getElementById('loadingStep');
const errorMsg = document.getElementById('errorMsg');
const forArticlesEl = document.getElementById('forArticles');
const againstArticlesEl = document.getElementById('againstArticles');
const analysisTextEl = document.getElementById('analysisText');
const footerStatus = document.getElementById('footerStatus');
const forCount = document.getElementById('forCount');
const againstCount = document.getElementById('againstCount');
const totalCount = document.getElementById('totalCount');

// Get current tab URL
chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
  if (tabs[0]?.url) {
    currentUrl = tabs[0].url;
    currentUrlEl.textContent = currentUrl;
    currentUrlEl.title = currentUrl;
  } else {
    currentUrlEl.textContent = 'No URL detected';
  }
});

// Event listeners
document.getElementById('btnAnalyze').addEventListener('click', () => {
  const topic = topicInput.value.trim();
  if (topic.length >= 3) analyze(topic);
});

topicInput.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') {
    const topic = topicInput.value.trim();
    if (topic.length >= 3) analyze(topic);
  }
});

document.getElementById('btnUseUrl').addEventListener('click', () => {
  if (currentUrl) analyze(currentUrl);
});

document.getElementById('btnRetry').addEventListener('click', () => {
  if (lastTopic) analyze(lastTopic);
});

document.getElementById('btnOpenWeb').addEventListener('click', () => {
  const query = lastTopic || topicInput.value.trim();
  chrome.tabs.create({
    url: query
      ? `${WEB_APP_URL}/results?topic=${encodeURIComponent(query)}`
      : WEB_APP_URL
  });
});

// Main analysis function
async function analyze(input) {
  lastTopic = input;
  showSection('loading');
  footerStatus.textContent = 'Analyzing...';

  // Cycle through loading steps
  let stepIdx = 0;
  const stepInterval = setInterval(() => {
    loadingStep.textContent = LOADING_STEPS[stepIdx % LOADING_STEPS.length];
    stepIdx++;
  }, 4000);

  try {
    const res = await fetch(`${API_BASE}/analyze`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ input }),
    });

    clearInterval(stepInterval);

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || `Server error: ${res.status}`);
    }

    const data = await res.json();
    renderResults(data);

    // Save to extension storage
    chrome.storage.local.set({
      lastResult: data,
      lastInput: input,
      lastTime: Date.now(),
    });

  } catch (err) {
    clearInterval(stepInterval);
    showError(err.message || 'Analysis failed. Make sure the backend is running on port 5000.');
  }
}

function renderResults(data) {
  // Stats
  forCount.textContent = data.for_articles?.length || 0;
  againstCount.textContent = data.against_articles?.length || 0;
  totalCount.textContent = data.total_analyzed || 0;

  // FOR articles
  forArticlesEl.innerHTML = '';
  if (data.for_articles?.length) {
    data.for_articles.forEach(article => {
      forArticlesEl.appendChild(createArticleCard(article, 'for'));
    });
  } else {
    forArticlesEl.innerHTML = '<div style="font-size:11px;color:#9ca3af;padding:8px;font-family:monospace">No FOR articles found</div>';
  }

  // AGAINST articles
  againstArticlesEl.innerHTML = '';
  if (data.against_articles?.length) {
    data.against_articles.forEach(article => {
      againstArticlesEl.appendChild(createArticleCard(article, 'against'));
    });
  } else {
    againstArticlesEl.innerHTML = '<div style="font-size:11px;color:#9ca3af;padding:8px;font-family:monospace">No AGAINST articles found</div>';
  }

  // Analysis
  if (data.center_analysis) {
    analysisTextEl.textContent = data.center_analysis
      .replace(/\*\*(.*?)\*\*/g, '$1')
      .replace(/^#{1,3}\s+/gm, '');
  } else {
    analysisTextEl.textContent = 'No analysis available.';
  }

  footerStatus.textContent = `"${(data.topic || '').slice(0, 30)}..."`;
  showSection('results');
}

function createArticleCard(article, side) {
  const card = document.createElement('div');
  card.className = 'article-card';

  const domain = (() => {
    try { return new URL(article.url).hostname.replace('www.', ''); }
    catch { return article.source || 'Unknown'; }
  })();

  card.innerHTML = `
    <div class="article-title" title="${escapeHtml(article.title)}">${escapeHtml(article.title)}</div>
    <div class="article-meta">
      <span class="article-source">${escapeHtml(domain)}</span>
      ${article.url ? `<a href="${escapeHtml(article.url)}" target="_blank" class="article-link link-${side}">Read ↗</a>` : ''}
    </div>
  `;

  // Open links in new tab
  card.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', (e) => {
      e.preventDefault();
      chrome.tabs.create({ url: a.href });
    });
  });

  return card;
}

function showSection(name) {
  inputSection.style.display = name === 'input' ? 'block' : 'none';
  loadingSection.style.display = name === 'loading' ? 'block' : 'none';
  errorSection.style.display = name === 'error' ? 'block' : 'none';
  resultsSection.style.display = name === 'results' ? 'block' : 'none';
}

function showError(msg) {
  errorMsg.textContent = msg;
  footerStatus.textContent = 'Error';
  showSection('error');
}

function escapeHtml(str) {
  if (!str) return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

// Load last result on open
chrome.storage.local.get(['lastResult', 'lastInput', 'lastTime'], (data) => {
  if (data.lastResult && data.lastTime) {
    const age = Date.now() - data.lastTime;
    if (age < 10 * 60 * 1000) { // 10 min
      lastTopic = data.lastInput || '';
      renderResults(data.lastResult);
    }
  }
});
