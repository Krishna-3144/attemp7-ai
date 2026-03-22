// Content script: Extracts article metadata from the current page
// This runs on every page and communicates with the background/popup

(function () {
  // Extract structured article data from the page
  function extractPageData() {
    const data = {
      url: window.location.href,
      title: '',
      description: '',
      content: '',
    };

    // Title: OG > Twitter > document title
    data.title =
      document.querySelector('meta[property="og:title"]')?.content ||
      document.querySelector('meta[name="twitter:title"]')?.content ||
      document.title ||
      '';

    // Description: OG > Twitter > meta description
    data.description =
      document.querySelector('meta[property="og:description"]')?.content ||
      document.querySelector('meta[name="twitter:description"]')?.content ||
      document.querySelector('meta[name="description"]')?.content ||
      '';

    // Main article content
    const articleEl =
      document.querySelector('article') ||
      document.querySelector('[role="main"]') ||
      document.querySelector('main') ||
      document.querySelector('.article-body') ||
      document.querySelector('.post-content') ||
      document.querySelector('.entry-content');

    if (articleEl) {
      data.content = articleEl.innerText?.slice(0, 3000) || '';
    }

    return data;
  }

  // Listen for messages from popup
  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'extractContent') {
      sendResponse(extractPageData());
    }
    return true;
  });
})();
