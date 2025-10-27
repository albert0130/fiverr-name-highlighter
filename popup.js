const toggleSwitch = document.getElementById("toggleSwitch");
const toggleText = document.getElementById("toggleText");

// Load saved toggle state
chrome.storage.sync.get(['highlighterEnabled'], (result) => {
  const isEnabled = result.highlighterEnabled !== false; // Default to true
  updateToggleState(isEnabled);
});

// Listen for storage changes (when Alt+O or Alt+Z is pressed)
chrome.storage.onChanged.addListener((changes, namespace) => {
  if (namespace === 'sync' && changes.highlighterEnabled) {
    updateToggleState(changes.highlighterEnabled.newValue);
  }
});

// Toggle switch click handler
toggleSwitch.addEventListener("click", () => {
  const isCurrentlyEnabled = toggleSwitch.classList.contains("active");
  const newState = !isCurrentlyEnabled;
  
  // Save state to storage
  chrome.storage.sync.set({ highlighterEnabled: newState }, () => {
    updateToggleState(newState);
  });
});

function updateToggleState(isEnabled) {
  if (isEnabled) {
    toggleSwitch.classList.add("active");
    toggleText.textContent = "Alt+Z - Disable auto highlighter";
  } else {
    toggleSwitch.classList.remove("active");
    toggleText.textContent = "Alt+Z - Enable auto highlighter";
  }
}
