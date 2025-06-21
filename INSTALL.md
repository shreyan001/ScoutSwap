# Jupiter Social Trader - Development Setup

## Prerequisites

Before installing the Jupiter Social Trader Chrome extension, ensure you have:

1. **Google Chrome Browser** (latest version recommended)
2. **Developer Mode enabled** in Chrome Extensions
3. **Basic understanding** of Chrome extensions (optional)

## Installation Steps

### 1. Download the Extension Files
- Clone or download this repository to your local machine
- Extract all files if downloaded as a ZIP

### 2. Enable Chrome Developer Mode
1. Open Google Chrome
2. Navigate to `chrome://extensions/`
3. Toggle **"Developer mode"** in the top-right corner
4. You should now see additional buttons appear

### 3. Load the Extension
1. Click **"Load unpacked"** button
2. Navigate to the folder containing the extension files
3. Select the folder and click "Select Folder"
4. The extension should now appear in your extensions list

### 4. Verify Installation
- Look for the Jupiter Social Trader icon (🚀) in your Chrome toolbar
- Click the icon to open the popup interface
- The extension should display version 1.0.0

## Testing the Extension

### Basic Functionality Test
1. **Go to Twitter/X**: Navigate to https://twitter.com or https://x.com
2. **Find a crypto post**: Look for tweets mentioning tokens like "$SOL", "$JUP", "$BONK"
3. **Highlight text**: Select the text containing the token mention
4. **Right-click**: Choose "🚀 Analyze with Jupiter AI" from the context menu
5. **View results**: An overlay should appear with analysis results

### Expected Behavior
- **Token Detection**: Should identify cryptocurrency tokens in selected text
- **Price Data**: Should display current price from Jupiter API
- **Sentiment Analysis**: Should show positive/negative/neutral sentiment
- **Trading Suggestions**: Should provide AI-powered trading recommendations

## Troubleshooting

### Common Issues

#### Extension Not Loading
- **Check file structure**: Ensure all files are in the correct locations
- **Verify manifest.json**: Make sure the manifest file is valid JSON
- **Check permissions**: Ensure Chrome has permission to load unpacked extensions

#### Context Menu Not Appearing
- **Refresh the page**: Try refreshing Twitter/X after installing the extension
- **Check permissions**: Verify the extension has permissions for the website
- **Try different text**: Make sure you're selecting text that contains token mentions

#### API Errors
- **Internet connection**: Ensure you have a stable internet connection
- **API availability**: Jupiter API might be temporarily unavailable
- **Rate limiting**: Too many requests might cause temporary blocks

#### Overlay Not Displaying
- **Browser zoom**: Try resetting browser zoom to 100%
- **Ad blockers**: Some ad blockers might interfere with the overlay
- **Other extensions**: Disable other extensions to check for conflicts

### Debug Mode

To enable debug logging:
1. Open Chrome DevTools (F12)
2. Go to the Console tab
3. Look for messages starting with "Jupiter Social Trader"
4. This will help identify specific issues

### Performance Tips

- **Close unused tabs** to free up memory
- **Update Chrome** to the latest version
- **Clear extension storage** if you encounter persistent issues:
  - Go to `chrome://extensions/`
  - Click on "Details" for Jupiter Social Trader
  - Click "Extension options" or inspect views
  - Clear storage data

## Development Mode

### File Structure Overview
```
jupiter-social-trader/
├── manifest.json          # Extension configuration
├── background.js           # Service worker
├── content.js             # Content script for Twitter
├── content.css            # Overlay styling
├── popup.html             # Extension popup
├── popup.js               # Popup functionality
├── popup.css              # Popup styling
├── icons/                 # Extension icons
└── README.md              # Documentation
```

### Making Changes
1. **Edit files** as needed using your preferred code editor
2. **Save changes** to the files
3. **Reload extension** in Chrome:
   - Go to `chrome://extensions/`
   - Click the refresh icon on the Jupiter Social Trader card
   - Or use the keyboard shortcut Ctrl+R while on the extensions page

### Testing Changes
- Always test changes on a live Twitter/X page
- Check the Chrome DevTools console for any errors
- Test with different types of crypto-related posts

## Supported Websites

Currently supported:
- **Twitter.com** - Full functionality
- **X.com** - Full functionality

Planned support:
- **Discord** (future update)
- **Telegram Web** (future update)
- **Reddit** (future update)

## API Configuration

The extension uses these APIs:
- **Jupiter Token List**: `https://token.jup.ag/all`
- **Jupiter Price API**: `https://price.jup.ag/v4/price`
- **Jupiter Quote API**: `https://quote-api.jup.ag/v6/quote`

No API keys are required for basic functionality.

## Privacy & Data

### What Data is Stored
- **Settings**: User preferences (risk level, slippage, etc.)
- **Analysis History**: Recent token analyses for activity display
- **Trading Cart**: Saved tokens for future trading (coming soon)

### What Data is Sent
- **Token symbols** to Jupiter API for price lookup
- **Selected text** for local analysis (not sent to external servers)
- **No personal information** or wallet data is transmitted

### Storage Location
- All data is stored locally using Chrome's storage API
- No external databases or cloud storage is used
- Data is not shared with third parties

## Support

If you encounter issues:
1. **Check this setup guide** for common solutions
2. **Enable debug mode** to identify specific errors
3. **Create an issue** on our GitHub repository with:
   - Chrome version
   - Extension version
   - Steps to reproduce the issue
   - Any error messages from the console

## Next Steps

Once the extension is successfully installed:
1. **Explore the popup interface** to understand available features
2. **Test with various crypto posts** on Twitter/X
3. **Adjust settings** to match your trading preferences
4. **Provide feedback** to help us improve the extension

Happy trading! 🚀
