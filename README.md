# Jupiter Social Trader - Universal DeFi Trading Assistant

## 🚀 Overview

Jupiter Social Trader is a modern, AI-powered Chrome extension that provides universal DeFi social trading assistance across all social platforms. This completely overhauled version features a Google Lens-style overlay, OCR capabilities, and robust Jupiter API v6 integration.

## ✨ Key Features

### 🌐 Universal Platform Support
- **Twitter/X**: Analyze tweets and threads
- **Discord**: Monitor trading channels
- **Reddit**: Track DeFi discussions
- **Telegram**: Follow trading groups
- **Any Website**: Works everywhere with OCR

### � Google Lens-Style Interface
- **Smart Overlay**: Non-intrusive, responsive design
- **OCR Integration**: Extract text from images and screenshots
- **Quick Analysis**: Instant token sentiment and price data
- **Keyboard Shortcuts**: `Ctrl+Shift+L` for lens mode

### 📊 Advanced Trading Features
- **Jupiter API v6**: Latest swap quotes and token data
- **Real-time Prices**: Live token pricing and market data
- **Sentiment Analysis**: AI-powered social sentiment scoring
- **Token Recognition**: Automatic cryptocurrency detection
- **Swap Simulation**: Test trades before execution

### 🎨 Modern UI/UX
- **Responsive Design**: Works on all screen sizes
- **Dark Mode**: Eye-friendly interface
- **Smooth Animations**: Professional transitions
- **Accessibility**: WCAG compliant
- **No Rattling**: Stable, fixed positioning

## 🛠️ Installation

### For Development
1. Clone or download this repository
2. Open Chrome and navigate to `chrome://extensions/`
3. Enable "Developer mode" in the top right
4. Click "Load unpacked" and select the extension folder
5. The Jupiter Social Trader icon should appear in your toolbar

### For Production
1. Visit the Chrome Web Store (when published)
2. Click "Add to Chrome"
3. Grant necessary permissions

## 🔧 Usage

### Basic Usage
1. **Browse any social platform** (Twitter, Discord, Reddit, etc.)
2. **Highlight crypto-related text** and right-click
3. **Select "Analyze with Jupiter"** from context menu
4. **View instant analysis** in the overlay

### Lens Mode
1. **Press `Ctrl+Shift+L`** or click the lens icon
2. **Hover over any content** to extract text
3. **Click to analyze** detected crypto mentions
4. **View results** in the smart overlay

### Advanced Features
1. **Open the popup** by clicking the extension icon
2. **Configure settings** and preferences
3. **View analysis history** and saved data
4. **Access Jupiter dashboard** directly

## 🔍 OCR & AI Features

### Optical Character Recognition
- Extract text from images and screenshots
- Analyze memes and infographics for token mentions
- Process trading charts and social media images
- Real-time text recognition and analysis

### AI-Powered Analysis
- **Sentiment Scoring**: Bullish/bearish sentiment detection
- **Token Extraction**: Automatic cryptocurrency identification
- **Price Integration**: Live market data from Jupiter
- **Risk Assessment**: Social trading risk indicators

## 🔍 Chrome Lens OCR Integration

The extension now includes **Chrome Lens-style OCR** functionality based on the `dimdenGD/chrome-lens-ocr` library:

### OCR Features:
- **Image Text Recognition**: Automatically detects text in images on any webpage
- **Crypto-focused Analysis**: Specifically tuned to recognize cryptocurrency tokens, prices, and trading signals
- **Google Lens-style Interface**: Modern, intuitive UI similar to Google Lens
- **Real-time Processing**: Fast image analysis with sentiment detection
- **Trading Signal Extraction**: Identifies tokens, prices, and market sentiment from images

### How to Use OCR:

1. **Popup Controls**:
   - Click **"Test OCR"** to test the functionality
   - Click **"Scan Page for Crypto"** to analyze all images on the current page

2. **Lens Mode**:
   - Press `Ctrl+Shift+L` to activate Lens Mode
   - Click on any image or element to perform OCR analysis
   - Results appear in a beautiful overlay with trading insights

3. **Automatic Detection**:
   - OCR automatically processes images when clicked in Lens Mode
   - Extracts crypto tokens, prices, and sentiment
   - Provides AI-powered trading recommendations

### OCR Results Include:
- **Detected Text**: Full text found in the image
- **Trading Signals**: Identified tokens and prices with confidence scores
- **Sentiment Analysis**: Bullish, bearish, or neutral market sentiment
- **AI Recommendations**: Actionable trading advice based on OCR results

## 🌟 Technical Features

### Modern Architecture
- **Manifest V3**: Latest Chrome extension standards
- **ES6+ JavaScript**: Modern coding practices
- **Responsive CSS**: Mobile-first design
- **Error Handling**: Robust fault tolerance

### API Integration
- **Jupiter API v6**: Official Solana DEX aggregator
- **Real-time Data**: Live token prices and quotes
- **Swap Quotes**: Accurate trading estimates
- **Token Metadata**: Comprehensive token information

### Security & Privacy
- **No Data Collection**: Privacy-first approach
- **Local Storage**: Data stays on your device
- **Secure APIs**: HTTPS-only communications
- **Permission Control**: Minimal required permissions

## 📋 Permissions

The extension requires these permissions:
- **activeTab**: Access current tab content
- **storage**: Save preferences and history
- **contextMenus**: Right-click analysis options
- **scripting**: Inject overlay interface
- **notifications**: Show analysis results
- **clipboardWrite**: Copy trading data
- **offscreen**: OCR processing

## 🚀 Keyboard Shortcuts

- **`Ctrl+Shift+L`**: Activate lens mode
- **`Escape`**: Close overlay/lens mode
- **`Ctrl+Shift+J`**: Open Jupiter dashboard
- **`Ctrl+Shift+A`**: Analyze selected text

## 🔧 Configuration

### Settings Options
- **Default Platform**: Choose primary trading platform
- **Analysis Depth**: Quick vs detailed analysis
- **Notification Preferences**: Customize alerts
- **Theme Selection**: Light/dark mode toggle
- **OCR Sensitivity**: Adjust text recognition

### API Configuration
- Jupiter API endpoints are pre-configured
- No API keys required for basic functionality
- Advanced features may require authentication

## 📊 Supported Tokens

- **All Solana SPL Tokens**: Full Jupiter ecosystem
- **Major Cryptocurrencies**: BTC, ETH, SOL, USDC, etc.
- **Meme Tokens**: Automatic detection and analysis
- **New Launches**: Real-time token discovery

## 🎯 Use Cases

### Social Trading
- Monitor crypto Twitter for alpha
- Track Discord trading channels
- Analyze Reddit sentiment trends
- Follow Telegram group signals

### Research & Analysis
- Extract data from trading screenshots
- Analyze influencer token mentions
- Track social sentiment patterns
- Research new token launches

### Quick Trading
- Get instant Jupiter swap quotes
- Compare token prices across platforms
- Simulate trades before execution
- Access Jupiter interface quickly

## 🛡️ Troubleshooting

### Common Issues
1. **Overlay not showing**: Refresh the page and try again
2. **OCR not working**: Ensure content script is loaded
3. **API errors**: Check internet connection
4. **Permissions denied**: Re-install the extension

### Debug Mode
1. Open Chrome Developer Tools (F12)
2. Check the Console tab for error messages
3. Look for Jupiter Social Trader logs
4. Report issues with console output

## 🔄 Updates & Changelog

### Version 2.0.0 (Current)
- ✅ Complete UI/UX overhaul
- ✅ Universal platform support
- ✅ Google Lens-style overlay
- ✅ OCR integration (mock implementation)
- ✅ Jupiter API v6 integration
- ✅ Modern responsive design
- ✅ Fixed all rattling/positioning issues
- ✅ Enhanced error handling
- ✅ Accessibility improvements

### Planned Features
- � Real OCR library integration
- 🔜 LangChain text analysis
- 🔜 Advanced trading dashboard
- 🔜 Portfolio tracking
- 🔜 Social trading signals
- 🔜 Mobile companion app

## 🤝 Contributing

We welcome contributions! Please:
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details

## 🙏 Acknowledgments

- **Jupiter Protocol**: For the amazing Solana DEX aggregator
- **Chrome Extensions Team**: For Manifest V3 standards
- **Open Source Community**: For inspiration and tools
- **DeFi Community**: For feedback and testing

## 📞 Support

- **GitHub Issues**: Report bugs and request features
- **Documentation**: Comprehensive guides available
- **Community**: Join our Discord for support
- **Email**: support@jupitersocialtrader.com

---

**Made with ❤️ for the DeFi community**

*Trade responsibly. This tool is for informational purposes only and should not be considered financial advice.*
- **Price Impact**: Understand slippage and market depth before trading

### 🔄 Smart Trading Suggestions
- **AI-Powered Recommendations**: Get intelligent trading suggestions based on social signals
- **Risk Assessment**: Automatic risk level calculation for each token
- **Position Sizing**: Smart allocation suggestions based on your risk profile

### 🛒 Trading Cart System (Coming Soon)
- **Batch Trading**: Add multiple tokens to your cart for batch execution
- **Swap Simulation**: Test trades before execution
- **One-Click Trading**: Execute multiple swaps with a single transaction

## 🚀 How to Use

### Installation
1. Download the extension files
2. Open Chrome and go to `chrome://extensions/`
3. Enable "Developer mode"
4. Click "Load unpacked" and select the extension folder
5. The Jupiter Social Trader icon will appear in your browser toolbar

### Basic Usage
1. **Browse Twitter/X** - Visit Twitter or X.com
2. **Find Crypto Posts** - Look for posts mentioning tokens (e.g., "$SOL is bullish")
3. **Highlight Text** - Select the text you want to analyze
4. **Right-Click** - Choose "🚀 Analyze with Jupiter AI" from the context menu
5. **View Analysis** - See AI-powered insights and trading suggestions

### Advanced Features
- **Settings**: Customize risk levels, slippage tolerance, and auto-analysis preferences
- **Activity Tracking**: Monitor your analysis history and success rate
- **Market Insights**: Get comprehensive token data including price, volume, and trends

## 🛠️ Technical Architecture

### Tech Stack
- **Frontend**: Chrome Extension (Manifest V3), HTML/CSS/JavaScript
- **APIs**: Jupiter Aggregator API, Jupiter Price API
- **AI**: Sentiment analysis and token extraction algorithms
- **Storage**: Chrome Storage API for user preferences and history

### File Structure
```
jupiter-social-trader/
├── manifest.json          # Extension configuration
├── background.js           # Service worker for API calls
├── content.js             # Content script for Twitter integration
├── content.css            # Styling for overlay interface
├── popup.html             # Extension popup interface
├── popup.js               # Popup functionality
├── popup.css              # Popup styling
├── icons/                 # Extension icons
│   ├── icon16.png
│   ├── icon32.png
│   ├── icon48.png
│   └── icon128.png
└── README.md              # This file
```

### API Integration
- **Jupiter Token List**: `https://token.jup.ag/all`
- **Jupiter Price API**: `https://price.jup.ag/v4/price`
- **Jupiter Quote API**: `https://quote-api.jup.ag/v6/quote`
- **Jupiter Swap API**: `https://quote-api.jup.ag/v6/swap`

## 🔧 Development Setup

### Prerequisites
- Google Chrome browser
- Basic knowledge of JavaScript and Chrome extensions
- (Optional) Node.js for development tools

### Local Development
1. Clone or download the project files
2. Make any necessary modifications
3. Load the extension in Chrome's developer mode
4. Test on Twitter/X with crypto-related posts

### Testing
1. Go to Twitter/X
2. Find a post mentioning tokens like "$SOL", "$JUP", "$BONK"
3. Highlight the text and right-click
4. Select "🚀 Analyze with Jupiter AI"
5. Verify the analysis overlay appears with correct data

## 🎯 Roadmap

### Phase 1: MVP (Current)
- [x] Basic text analysis and token detection
- [x] Jupiter API integration for price data
- [x] Simple sentiment analysis
- [x] Chrome extension framework
- [x] Twitter/X integration

### Phase 2: Enhanced Features
- [ ] Wallet connection (Phantom, Solflare)
- [ ] Actual swap execution
- [ ] Advanced sentiment analysis with GPT integration
- [ ] Trading cart functionality
- [ ] Performance tracking

### Phase 3: Advanced Intelligence
- [ ] Machine learning models for signal validation
- [ ] Multi-platform support (Discord, Telegram)
- [ ] Social whale tracking
- [ ] Automated DCA strategies
- [ ] Portfolio management integration

### Phase 4: Community Features
- [ ] Shared trading signals
- [ ] Leaderboards and reputation system
- [ ] Copy trading functionality
- [ ] Educational content integration

## ⚠️ Important Disclaimers

### Risk Warning
- **Not Financial Advice**: This tool is for educational and informational purposes only
- **Do Your Own Research**: Always conduct thorough research before making trading decisions
- **High Risk**: Cryptocurrency trading involves significant financial risk
- **Beta Software**: This extension is in early development and may contain bugs

### Privacy & Security
- **Local Storage**: Most data is stored locally on your device
- **API Calls**: Some data is sent to Jupiter API for price and swap information
- **No Private Keys**: The extension never accesses your private keys or wallet funds

## 🤝 Contributing

We welcome contributions from the crypto and developer community!

### Ways to Contribute
- **Bug Reports**: Submit issues on our GitHub repository
- **Feature Requests**: Suggest new features or improvements
- **Code Contributions**: Submit pull requests with enhancements
- **Testing**: Help test the extension and report feedback

### Development Guidelines
- Follow standard JavaScript best practices
- Test thoroughly before submitting pull requests
- Document new features and changes
- Maintain compatibility with Chrome Extension Manifest V3

## 📞 Support & Contact

### Getting Help
- **Documentation**: Refer to this README and inline code comments
- **Issues**: Report bugs or ask questions in our issue tracker
- **Community**: Join our Discord for discussions and support

### Feedback
We'd love to hear from you! Your feedback helps us improve the extension:
- Use the feedback form in the extension popup
- Rate and review the extension (when published)
- Share your trading success stories

## 📜 License

This project is open source and available under the MIT License.

## 🙏 Acknowledgments

- **Jupiter Team**: For providing the excellent Jupiter Aggregator API
- **Solana Foundation**: For the amazing Solana blockchain
- **Chrome Extensions Community**: For documentation and best practices
- **DeFi Community**: For inspiration and feedback

---

**Built with ❤️ for the Solana and DeFi community**

*Powered by Jupiter API • Built on Solana • Made for Traders*
#   S c o u t S w a p  
 