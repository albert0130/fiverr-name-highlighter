# Fiverr Name Highlighter

A Chrome extension that highlights Fiverr seller names that are not listed in a shared Google Sheet database.

## Features

- **Auto Highlight**: Automatically highlights sellers not in your database on Fiverr category pages
- **Manual Highlight**: Run highlighting on-demand with a keyboard shortcut
- **Page Navigation**: Quick navigation between paginated Fiverr category pages
- **Toggle Control**: Enable/disable the highlighter with visual toggle in popup

## Installation

1. Clone or download this repository
2. Open Chrome and navigate to `chrome://extensions/`
3. Enable "Developer mode" (toggle in the top right)
4. Click "Load unpacked"
5. Select the extension folder

## Keyboard Shortcuts

| Shortcut | Function |
|----------|----------|
| **Alt+Z** | Toggle highlighter on/off |
| **Alt+X** | Manually highlight names on current page |
| **Alt+Q** | Navigate to previous page |
| **Alt+W** | Navigate to next page |

## Usage

### Auto Highlighter

1. Click the toggle switch in the extension popup to enable auto-highlighting
2. Visit any Fiverr categories page (e.g., `fiverr.com/categories/programming-tech/software-development`)
3. The extension will automatically highlight sellers not in the Google Sheet database
4. Highlighted sellers appear with a yellow background and red border

### Manual Highlighting

1. While on any Fiverr page, press **Alt+X** to manually highlight sellers
2. Useful when auto-highlighting is disabled or hasn't run yet

### Page Navigation

When on a paginated Fiverr categories page:
- Press **Alt+W** to go to the next page
- Press **Alt+Q** to go to the previous page

The extension automatically updates the URL with correct pagination parameters.

## How It Works

- The extension connects to a Google Sheet with seller data organized by letters A-Z
- When you visit Fiverr pages, it extracts seller IDs and checks them against the sheet
- Sellers not found in the database are highlighted visually
- The extension caches sheet data for efficient performance

## Files Structure

```
Fiverr_Name_Highlighter/
├── manifest.json      # Extension configuration
├── background.js      # Background service worker (handles shortcuts, sheet data)
├── content.js         # Content script (highlights sellers on page)
├── popup.html         # Extension popup UI
├── popup.js           # Popup functionality
├── styles.css         # Highlighting styles
└── icons/             # Extension icons
```

## Requirements

- Chrome browser (or Chromium-based)
- Active internet connection (to fetch Google Sheet data)

## Version

**2.1.0**

## License

This project is private and proprietary.

