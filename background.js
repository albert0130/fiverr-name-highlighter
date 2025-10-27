const SHEET_ID = "1pmPh9dr2xNK04xaS_PJ2zs2uVHw056W_MXamrzhzHjs";
const BASE_CSV_URL = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:csv&gid=`;

const gids = {
  a: 4335195,
  b: 1434993457,
  c: 2076730720,
  d: 1679530038,
  e: 207247626,
  f: 377743363,
  g: 1355601501,
  h: 439115418,
  i: 61375109,
  j: 2115672764,
  k: 1602700182,
  l: 1502128853,
  m: 2121711158,
  n: 331638586,
  o: 243746961,
  p: 729575509,
  q: 1783132648,
  r: 477202473,
  s: 1474786666,
  t: 226778470,
  // Sheets u–z share same sheet
  u: 572563752, v: 572563752, w: 572563752,
  x: 572563752, y: 572563752, z: 572563752
};

let cachedSheets = {};          // { "A": Set([...ids]) }
let sheetIdCounts = {};         // { "A": 812, "B": 715, ... }
let lastFetch = 0;

// === MESSAGE HANDLER ===
chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.type === "processNames") {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      chrome.tabs.sendMessage(tabs[0].id, msg, sendResponse);
    });
    return true;
  }

  if (msg.action === "checkSingleId") {
    checkSingleId(msg.id).then((exists) => sendResponse({ exists, sheetCounts: sheetIdCounts }));
    return true;
  }
});

// === KEYBOARD SHORTCUTS ===
chrome.commands.onCommand.addListener(async (command) => {
  // Navigate backward (Alt+Q)
  if (command === "navigate-backward") {
    handlePageNavigation(-1);
  }
  
  // Navigate forward (Alt+W)
  if (command === "navigate-forward") {
    handlePageNavigation(1);
  }
  
  // Toggle highlighter (Alt+Z)
  if (command === "toggle-highlighter") {
    chrome.storage.sync.get(['highlighterEnabled'], (result) => {
      const isEnabled = result.highlighterEnabled !== false; // Default to true
      const newState = !isEnabled; // Toggle the state
      chrome.storage.sync.set({ highlighterEnabled: newState });
    });
  }
  
  // Manual highlight (Alt+X)
  if (command === "manual-highlight") {
    runHighlighter();
  }
});

// === PAGE NAVIGATION FUNCTION ===
async function handlePageNavigation(direction) {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  const url = new URL(tab.url);
  
  // Check if URL contains page, offset, and limit parameters
  const pageParam = url.searchParams.get('page');
  const offsetParam = url.searchParams.get('offset');
  const limitParam = url.searchParams.get('limit');
  
  if (!pageParam || !offsetParam || !limitParam) {
    console.log("URL doesn't contain required pagination parameters");
    return;
  }
  
  // Parse and update page number
  let currentPage = parseInt(pageParam);
  currentPage += direction;
  
  // Ensure page is not negative
  if (currentPage < 1) {
    currentPage = 1;
  }
  
  // Update URL parameters
  url.searchParams.set('page', currentPage.toString());
  url.searchParams.set('offset', '0');
  url.searchParams.set('limit', limitParam); // Keep original limit value
  
  // Update the tab URL without opening a new tab
  chrome.tabs.update(tab.id, { url: url.toString() });
}

// === RUN HIGHLIGHTER FUNCTION ===
async function runHighlighter() {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

  chrome.scripting.executeScript(
    {
      target: { tabId: tab.id },
      function: () => {
        const spans = document.querySelectorAll(
          'a[href^="/"]:not([href^="/categories/"]) span[class^="_1up9el5"]'
        );
        return Array.from(spans).map((s) => s.textContent.trim());
      }
    },
    (results) => {
      const names = results?.[0]?.result || [];
      chrome.tabs.sendMessage(tab.id, { type: "processNames", data: names });
    }
  );
}

// === FETCH & CACHE ONE SHEET ===
async function loadSheet(letter) {
  letter = letter.toLowerCase();
  const gid = gids[letter] || gids.u;
  const url = `${BASE_CSV_URL}${gid}`;
  const sheetKey = /^[a-t]$/.test(letter) ? letter.toUpperCase() : "U, V, W, X, Y, Z";

  try {
    const res = await fetch(url);
    const csv = await res.text();
    const ids = new Set();

    csv.split(/\r?\n/).forEach((line) => {
      line.split(",").forEach((cell) => {
        const id = cell.replace(/"/g, "").trim().toLowerCase();
        if (id) ids.add(id);
      });
    });

    cachedSheets[sheetKey] = ids;
    sheetIdCounts[sheetKey] = ids.size;
  } catch (err) {
    console.error(`⛔ Failed to load "${sheetKey}"`, err);
    cachedSheets[sheetKey] = new Set();
    sheetIdCounts[sheetKey] = 0;
  }
}

// === CHECK SINGLE ID ===
async function checkSingleId(id) {
  if (!id) return false;
  const letter = id[0].toLowerCase();
  const sheetKey = /^[a-t]$/.test(letter) ? letter.toUpperCase() : "U, V, W, X, Y, Z";

  if (!cachedSheets[sheetKey]) {
    await loadSheet(letter);
  }

  return cachedSheets[sheetKey].has(id.toLowerCase());
}
