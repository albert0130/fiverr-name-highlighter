chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.type === "processNames") {
    highlightNames().then((result) => sendResponse(result));
    return true;
  }
});

// Auto-run on Fiverr categories pages when toggle is enabled
if (window.location.href.includes('fiverr.com/categories')) {
  // Check if highlighter is enabled and run automatically
  chrome.storage.sync.get(['highlighterEnabled'], (result) => {
    const isEnabled = result.highlighterEnabled !== false; // Default to true
    
    if (isEnabled) {
      // Wait for page to fully load
      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
          setTimeout(() => highlightNames(), 1000); // Small delay to ensure content is loaded
        });
      } else {
        setTimeout(() => highlightNames(), 1000);
      }
    }
  });
}

async function highlightNames() {

  const spans = document.querySelectorAll(
    'a[href^="/"]:not([href^="/categories/"]) span[class^="_1up9el5"]'
  );

  const seenIds = new Set();
  const entries = [];

  for (const span of spans) {
    const text = span.textContent.trim();
    const parent = span.closest("a");
    if (!parent) continue;

    const href = parent.getAttribute("href") || "";
    if (!/^\/[A-Za-z0-9._-]+/.test(href)) continue;

    const id = href.split("?")[0].replace("/", "").trim();
    if (!id || seenIds.has(id)) continue;

    seenIds.add(id);
    entries.push({ span, text, id });
  }


  const results = await Promise.all(
    entries.map(async ({ span, text, id }) => {
      const firstLetter = id[0].toLowerCase();
      const sheet =
        /^[a-t]$/.test(firstLetter) ? firstLetter.toUpperCase() : "U, V, W, X, Y, Z";

      const res = await isConsist(id);
      const inSheet = res.exists;
      const sheetCounts = res.sheetCounts || {};
      const sheetSize = sheetCounts[sheet] || 0;
      if (!inSheet) {
        span.classList.add("highlight-name");
        return { id, text, sheet };
      }
      return null;
    })
  );

  const kept = results.filter(Boolean);
  const ids = kept.map((v) => v.id);
  const names = kept.map((v) => v.text);

  chrome.runtime.sendMessage({ type: "collectedResults", ids, names });
}

function isConsist(id) {
  return new Promise((resolve) => {
    chrome.runtime.sendMessage({ action: "checkSingleId", id }, (res) => {
      resolve(res || { exists: false, sheetCounts: {} });
    });
  });
}
