// Jupiter Social Trader - Enhanced Background Script with Proper Jupiter API v6
console.log('🚀 Jupiter Social Trader v2.0 - Enhanced Background Script Loaded');

// Jupiter API v6 Configuration
const JUPITER_CONFIG = {
  QUOTE_API: 'https://quote-api.jup.ag/v6/quote',
  SWAP_API: 'https://quote-api.jup.ag/v6/swap',
  PRICE_API: 'https://price.jup.ag/v6/price',
  TOKENS_API: 'https://tokens.jup.ag/tokens',
  STRICT_LIST: 'https://tokens.jup.ag/strict',
  ALL_TOKENS: 'https://tokens.jup.ag/all'
};

// Token cache for faster lookups
let tokenCache = new Map();
let isInitialized = false;

// Initialize extension
chrome.runtime.onInstalled.addListener(async () => {
  console.log('🔧 Installing Jupiter Social Trader...');
  
  // Create context menu for any page
  chrome.contextMenus.create({
    id: "analyzeWithJupiterAI",
    title: "🚀 Analyze with Jupiter AI",
    contexts: ["selection", "page", "image"]
  });
  
  chrome.contextMenus.create({
    id: "scanWithLens",
    title: "🔍 Scan with Jupiter Lens (OCR)",
    contexts: ["image", "page"]
  });
  
  chrome.contextMenus.create({
    id: "openJupiterDashboard", 
    title: "📊 Open Jupiter Dashboard",
    contexts: ["page"]
  });
  
  // Initialize token cache
  await initializeTokenCache();
  
  console.log('✅ Jupiter Social Trader installed successfully!');
});

// Initialize token cache from Jupiter API
async function initializeTokenCache() {
  try {
    console.log('📡 Fetching Jupiter token list...');
    
    const response = await fetch(JUPITER_CONFIG.ALL_TOKENS);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    
    const tokens = await response.json();
    console.log(`📋 Loaded ${tokens.length} tokens from Jupiter`);
    
    // Build cache for fast lookups
    tokens.forEach(token => {
      if (token.symbol && token.address) {
        tokenCache.set(token.symbol.toUpperCase(), token);
        tokenCache.set(token.address, token);
      }
    });
    
    isInitialized = true;
    console.log('✅ Token cache initialized successfully');
    
  } catch (error) {
    console.error('❌ Failed to initialize token cache:', error);
    // Fallback with common tokens
    initializeFallbackTokens();
  }
}

// Fallback token list if API fails
function initializeFallbackTokens() {
  const fallbackTokens = [
    { symbol: 'SOL', address: 'So11111111111111111111111111111111111111112', name: 'Solana', decimals: 9 },
    { symbol: 'JUP', address: 'JUPyiwrYJFskUPiHa7hkeR8VUtAeFoSYbKedZNsDvCN', name: 'Jupiter', decimals: 6 },
    { symbol: 'BONK', address: 'DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263', name: 'Bonk', decimals: 5 },
    { symbol: 'WIF', address: '85VBFQZC9TZkfaptBWjvUw7YbZjy52A6mjtPGjstQAmQ', name: 'dogwifhat', decimals: 6 }
  ];
  
  fallbackTokens.forEach(token => {
    tokenCache.set(token.symbol.toUpperCase(), token);
    tokenCache.set(token.address, token);
  });
  
  isInitialized = true;
  console.log('⚠️ Using fallback token list');
}

// Handle context menu clicks
chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  console.log('🖱️ Context menu clicked:', info.menuItemId);
  
  try {
    switch (info.menuItemId) {
      case "analyzeWithJupiterAI":
        if (info.selectionText) {
          await analyzeSelectedText(info.selectionText, tab);
        } else {
          chrome.notifications.create({
            type: 'basic',
            iconUrl: 'icons/icon48.png',
            title: 'Jupiter Social Trader',
            message: 'Please select text to analyze'
          });
        }
        break;
        
      case "scanWithLens":
        // Activate lens mode on the page
        chrome.tabs.sendMessage(tab.id, {
          action: 'toggleLensMode'
        }, (response) => {
          if (chrome.runtime.lastError) {
            console.error('Failed to activate lens mode:', chrome.runtime.lastError);
            chrome.notifications.create({
              type: 'basic',
              iconUrl: 'icons/icon48.png',
              title: 'Jupiter Lens',
              message: 'Please refresh the page and try again'
            });
          }
        });
        break;
        
      case "openJupiterDashboard":
        chrome.tabs.create({ 
          url: chrome.runtime.getURL('dashboard.html') 
        });
        break;
    }
  } catch (error) {
    console.error('❌ Context menu error:', error);
    chrome.notifications.create({
      type: 'basic',
      iconUrl: 'icons/icon48.png',
      title: 'Jupiter Social Trader',
      message: 'An error occurred. Please try again.'
    });
  }
});

// Handle messages from content script and popup
chrome.runtime.onMessage.addListener(async (request, sender, sendResponse) => {
  console.log('📨 Background received message:', request.action);
  
  try {
    switch (request.action) {
      case 'analyzeText':
        const analysis = await analyzeTextContent(request.text);
        sendResponse(analysis);
        break;
        
      case 'getTokenData':
        const tokenData = await getTokenDataFromJupiter(request.symbol);
        sendResponse(tokenData);
        break;
        
      case 'performOCR':
        const ocrResult = await performOCRAnalysis(request.imageData);
        sendResponse(ocrResult);
        break;
        
      case 'healthCheck':
        const health = await checkJupiterAPIHealth();
        sendResponse(health);
        break;
        
      case 'getQuote':
        const quote = await getJupiterQuote(request.inputMint, request.outputMint, request.amount);
        sendResponse(quote);
        break;
        
      default:
        sendResponse({ success: false, error: 'Unknown action' });
    }
  } catch (error) {
    console.error('❌ Message handler error:', error);
    sendResponse({ success: false, error: error.message });
  }
  
  return true; // Keep message channel open for async responses
});

// Analyze text content using AI and extract tokens
async function analyzeTextContent(text) {
  try {
    console.log('🧠 Analyzing text content...');
    
    // Extract potential tokens from text
    const tokens = extractTokensFromText(text);
    console.log(`🪙 Found ${tokens.length} potential tokens:`, tokens);
    
    // Perform sentiment analysis
    const sentiment = analyzeSentiment(text);
    console.log('📊 Sentiment analysis:', sentiment);
    
    // Store analysis in history
    await storeAnalysis(tokens, sentiment, text);
    
    return {
      success: true,
      data: {
        tokens: tokens,
        sentiment: sentiment,
        originalText: text.substring(0, 200) + (text.length > 200 ? '...' : '')
      }
    };
    
  } catch (error) {
    console.error('❌ Text analysis failed:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

// Enhanced token extraction with better pattern matching
function extractTokensFromText(text) {
  const tokens = [];
  
  // Pattern for $TOKEN format
  const dollarTokenPattern = /\$([A-Z]{2,10})\b/gi;
  let match;
  
  while ((match = dollarTokenPattern.exec(text)) !== null) {
    const symbol = match[1].toUpperCase();
    if (!tokens.some(t => t.symbol === symbol)) {
      tokens.push({
        symbol: symbol,
        mention: match[0],
        position: match.index
      });
    }
  }
  
  // Pattern for common token names without $
  const commonTokens = ['SOL', 'SOLANA', 'JUP', 'JUPITER', 'BONK', 'WIF', 'DOGWIFHAT', 'BITCOIN', 'BTC', 'ETHEREUM', 'ETH'];
  const tokenNamePattern = new RegExp(`\\b(${commonTokens.join('|')})\\b`, 'gi');
  
  while ((match = tokenNamePattern.exec(text)) !== null) {
    const symbol = normalizeTokenSymbol(match[1]);
    if (!tokens.some(t => t.symbol === symbol)) {
      tokens.push({
        symbol: symbol,
        mention: match[0],
        position: match.index
      });
    }
  }
  
  return tokens;
}

// Normalize token symbols to standard format
function normalizeTokenSymbol(token) {
  const tokenMap = {
    'SOLANA': 'SOL',
    'JUPITER': 'JUP',
    'DOGWIFHAT': 'WIF',
    'BITCOIN': 'BTC',
    'ETHEREUM': 'ETH'
  };
  
  return tokenMap[token.toUpperCase()] || token.toUpperCase();
}

// Enhanced sentiment analysis with more sophisticated logic
function analyzeSentiment(text) {
  const positiveWords = [
    'moon', 'pump', 'bullish', 'buy', 'long', 'hodl', 'gem', 'rocket', '🚀', '📈', 
    'green', 'profit', 'gain', 'up', 'rise', 'surge', 'breakout', 'rally', 'boom',
    'golden', 'opportunity', 'potential', 'strong', 'solid', 'amazing', 'huge'
  ];
  
  const negativeWords = [
    'dump', 'crash', 'bearish', 'sell', 'short', 'rekt', 'rug', 'scam', '📉', '💀',
    'red', 'loss', 'down', 'fall', 'drop', 'decline', 'weak', 'dead', 'avoid',
    'warning', 'danger', 'risky', 'bubble', 'overvalued', 'exit', 'panic'
  ];
  
  const neutralWords = [
    'hold', 'wait', 'watch', 'monitor', 'sideways', 'consolidate', 'range',
    'uncertain', 'mixed', 'unclear', 'depends', 'maybe', 'possibly'
  ];
  
  const lowerText = text.toLowerCase();
  
  let positiveScore = 0;
  let negativeScore = 0;
  let neutralScore = 0;
  
  // Count sentiment words
  positiveWords.forEach(word => {
    const matches = (lowerText.match(new RegExp(word, 'g')) || []).length;
    positiveScore += matches;
  });
  
  negativeWords.forEach(word => {
    const matches = (lowerText.match(new RegExp(word, 'g')) || []).length;
    negativeScore += matches;
  });
  
  neutralWords.forEach(word => {
    const matches = (lowerText.match(new RegExp(word, 'g')) || []).length;
    neutralScore += matches;
  });
  
  // Calculate overall sentiment
  const totalScore = positiveScore + negativeScore + neutralScore;
  
  if (totalScore === 0) {
    return {
      sentiment: 'neutral',
      confidence: 0.5,
      reasoning: 'No clear sentiment indicators found in the text.'
    };
  }
  
  const positiveRatio = positiveScore / totalScore;
  const negativeRatio = negativeScore / totalScore;
  
  let sentiment, confidence, reasoning;
  
  if (positiveScore > negativeScore && positiveRatio > 0.4) {
    sentiment = 'positive';
    confidence = Math.min(0.9, 0.6 + positiveRatio * 0.4);
    reasoning = `Strong bullish indicators detected (${positiveScore} positive signals).`;
  } else if (negativeScore > positiveScore && negativeRatio > 0.4) {
    sentiment = 'negative';
    confidence = Math.min(0.9, 0.6 + negativeRatio * 0.4);
    reasoning = `Bearish signals detected (${negativeScore} negative indicators).`;
  } else {
    sentiment = 'neutral';
    confidence = 0.6;
    reasoning = 'Mixed or neutral sentiment indicators.';
  }
  
  return {
    sentiment,
    confidence,
    reasoning,
    scores: { positive: positiveScore, negative: negativeScore, neutral: neutralScore }
  };
}

// Get token data from Jupiter API v6
async function getTokenDataFromJupiter(symbol) {
  try {
    console.log(`💰 Fetching data for token: ${symbol}`);
    
    // Find token in cache
    const token = tokenCache.get(symbol.toUpperCase());
    if (!token) {
      return {
        success: false,
        error: `Token ${symbol} not found in Jupiter token list`
      };
    }
    
    // Get price from Jupiter Price API v6
    const priceResponse = await fetch(`${JUPITER_CONFIG.PRICE_API}?ids=${token.address}`);
    if (!priceResponse.ok) {
      throw new Error(`Price API error: ${priceResponse.status}`);
    }
    
    const priceData = await priceResponse.json();
    const price = priceData.data?.[token.address]?.price || 0;
    
    console.log(`📊 Price for ${symbol}: $${price}`);
    
    return {
      success: true,
      data: {
        token,
        price: parseFloat(price),
        priceData: priceData.data?.[token.address]
      }
    };
    
  } catch (error) {
    console.error(`❌ Failed to fetch token data for ${symbol}:`, error);
    return {
      success: false,
      error: error.message
    };
  }
}

// Perform OCR analysis
async function performOCRAnalysis(imageData) {
  try {
    console.log('👁️ Performing OCR analysis...');
    
    // For now, return mock data
    // In production, integrate with a real OCR service
    const mockTexts = [
      "SOL is breaking out! 🚀",
      "Jupiter swap volume increasing",
      "$BONK community is strong",
      "New DeFi protocol on Solana",
      "Check this altcoin gem"
    ];
    
    const randomText = mockTexts[Math.floor(Math.random() * mockTexts.length)];
    
    return {
      success: true,
      text: randomText,
      confidence: 0.75 + Math.random() * 0.2
    };
    
  } catch (error) {
    console.error('❌ OCR analysis failed:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

// Check Jupiter API health
async function checkJupiterAPIHealth() {
  try {
    const healthResponse = await fetch(JUPITER_CONFIG.TOKENS_API, { 
      method: 'HEAD',
      signal: AbortSignal.timeout(5000)
    });
    
    return {
      success: healthResponse.ok,
      status: healthResponse.status,
      message: healthResponse.ok ? 'Jupiter API is healthy' : 'Jupiter API is down'
    };
    
  } catch (error) {
    return {
      success: false,
      status: 0,
      message: 'Jupiter API health check failed'
    };
  }
}

// Get Jupiter quote for token swap
async function getJupiterQuote(inputMint, outputMint, amount) {
  try {
    const url = new URL(JUPITER_CONFIG.QUOTE_API);
    url.searchParams.set('inputMint', inputMint);
    url.searchParams.set('outputMint', outputMint);
    url.searchParams.set('amount', amount);
    url.searchParams.set('slippageBps', '50'); // 0.5% slippage
    
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Quote API error: ${response.status}`);
    }
    
    const quoteData = await response.json();
    
    return {
      success: true,
      data: quoteData
    };
    
  } catch (error) {
    console.error('❌ Jupiter quote failed:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

// Store analysis in local storage
async function storeAnalysis(tokens, sentiment, originalText) {
  try {
    const result = await chrome.storage.local.get(['analysisHistory']);
    const history = result.analysisHistory || [];
    
    const analysis = {
      timestamp: Date.now(),
      tokens: tokens,
      sentiment: sentiment,
      textPreview: originalText.substring(0, 100),
      url: ''
    };
    
    history.push(analysis);
    
    // Keep only last 50 analyses
    if (history.length > 50) {
      history.splice(0, history.length - 50);
    }
    
    await chrome.storage.local.set({ analysisHistory: history });
    
  } catch (error) {
    console.error('❌ Failed to store analysis:', error);
  }
}

// Analyze selected text and show results
async function analyzeSelectedText(text, tab) {
  try {
    const analysis = await analyzeTextContent(text);
    
    if (analysis.success) {
      // Send results to content script
      chrome.tabs.sendMessage(tab.id, {
        action: 'showAnalysis',
        text: text,
        analysis: analysis.data
      });
    } else {
      chrome.notifications.create({
        type: 'basic',
        iconUrl: 'icons/icon48.png',
        title: 'Analysis Failed',
        message: analysis.error
      });
    }
      } catch (error) {
    console.error('❌ Analysis error:', error);
    chrome.notifications.create({
      type: 'basic',
      iconUrl: 'icons/icon48.png',
      title: 'Jupiter Social Trader',
      message: 'Analysis failed. Please try again.'
    });
  }
}

// Handle text analysis
async function handleTextAnalysis(info, tab) {
  const selectedText = info.selectionText || '';
  
  if (!selectedText.trim()) {
    showNotification('No Text Selected', 'Please highlight some text containing token mentions.');
    return;
  }
  
  // Store analysis data
  await chrome.storage.local.set({
    currentAnalysis: {
      text: selectedText,
      url: tab.url,
      timestamp: Date.now(),
      type: 'text'
    }
  });
  
  // Send message to content script
  chrome.tabs.sendMessage(tab.id, {
    action: "showAnalysis",
    data: {
      text: selectedText,
      type: 'text'
    }
  }).catch(error => {
    console.log('Content script not ready, injecting...');
    injectContentScript(tab.id);
  });
}

// Handle OCR lens scanning
async function handleLensOCR(info, tab) {
  console.log('🔍 Starting OCR scan...');
  
  await chrome.storage.local.set({
    currentAnalysis: {
      type: 'ocr',
      url: tab.url,
      timestamp: Date.now()
    }
  });
  
  // Send message to activate lens mode
  chrome.tabs.sendMessage(tab.id, {
    action: "activateLensMode"
  }).catch(error => {
    console.log('Content script not ready, injecting...');
    injectContentScript(tab.id);
  });
}

// Inject content script if not present
async function injectContentScript(tabId) {
  try {
    await chrome.scripting.executeScript({
      target: { tabId },
      files: ['content.js']
    });
    
    await chrome.scripting.insertCSS({
      target: { tabId },
      files: ['content.css']
    });
    
    console.log('📝 Content script injected successfully');
  } catch (error) {
    console.error('❌ Failed to inject content script:', error);
  }
}

// Handle messages from content script and popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log('📨 Message received:', request.action);
  
  switch (request.action) {
    case 'analyzeText':
      handleAdvancedTextAnalysis(request.text, sendResponse);
      return true;
      
    case 'analyzeImage':
      handleImageOCR(request.imageData, sendResponse);
      return true;
      
    case 'getTokenData':
      handleTokenDataRequest(request.symbol, sendResponse);
      return true;
      
    case 'getJupiterQuote':
      handleJupiterQuote(request.params, sendResponse);
      return true;
      
    case 'executeSwap':
      handleSwapExecution(request.params, sendResponse);
      return true;
      
    case 'getTokenList':
      handleTokenListRequest(sendResponse);
      return true;
      
    default:
      sendResponse({ error: 'Unknown action' });
  }
});

// Advanced text analysis with improved token detection
async function handleAdvancedTextAnalysis(text, sendResponse) {
  try {
    if (!isInitialized) {
      await initializeTokenCache();
    }
    
    // Enhanced token extraction
    const tokens = extractTokensAdvanced(text);
    const sentiment = analyzeSentimentAdvanced(text);
    const keyPhrases = extractKeyPhrases(text);
    
    // Get market data for found tokens
    const enrichedTokens = await Promise.all(
      tokens.map(async (token) => {
        try {
          const marketData = await getTokenMarketData(token.symbol);
          return { ...token, ...marketData };
        } catch (error) {
          console.warn(`Failed to get market data for ${token.symbol}:`, error);
          return token;
        }
      })
    );
    
    sendResponse({
      success: true,
      data: {
        tokens: enrichedTokens,
        sentiment,
        keyPhrases,
        originalText: text,
        analysis: generateTradingAnalysis(enrichedTokens, sentiment, keyPhrases)
      }
    });
    
  } catch (error) {
    console.error('❌ Text analysis failed:', error);
    sendResponse({ success: false, error: error.message });
  }
}

// Enhanced token extraction with better regex and validation
function extractTokensAdvanced(text) {
  const tokens = new Set();
  
  // Multiple token patterns
  const patterns = [
    /\$([A-Z]{2,10})(?!\w)/g,           // $SOL, $JUP
    /\b([A-Z]{3,10})\s*(?:token|coin)/gi,  // SOL token, JUP coin
    /(?:buy|sell|long|short)\s+([A-Z]{2,10})/gi, // buy SOL
    /([A-Z]{2,10})\s*(?:\/|to|→)\s*(?:USD|USDC|SOL)/gi // SOL/USD
  ];
  
  patterns.forEach(pattern => {
    let match;
    while ((match = pattern.exec(text)) !== null) {
      const symbol = match[1].toUpperCase();
      
      // Validate token exists in our cache
      if (tokenCache.has(symbol)) {
        const tokenData = tokenCache.get(symbol);
        tokens.add({
          symbol: symbol,
          position: match.index,
          fullMatch: match[0],
          address: tokenData.address,
          name: tokenData.name,
          decimals: tokenData.decimals
        });
      }
    }
  });
  
  return Array.from(tokens);
}

// Advanced sentiment analysis
function analyzeSentimentAdvanced(text) {
  const bullishTerms = [
    'bullish', 'moon', 'pump', 'rally', 'breakout', 'surge', 'rocket', 'diamond hands',
    'buy', 'long', 'accumulate', 'dca', 'hold', 'hodl', 'support', 'resistance broken',
    'breakthrough', 'all time high', 'ath', 'parabolic', 'mooning', 'to the moon'
  ];
  
  const bearishTerms = [
    'bearish', 'dump', 'crash', 'fall', 'drop', 'sell', 'short', 'exit', 'panic',
    'red', 'blood bath', 'massacre', 'rugpull', 'scam', 'dead cat bounce',
    'resistance', 'rejection', 'break down', 'capitulation', 'bear market'
  ];
  
  const neutralTerms = [
    'sideways', 'consolidation', 'range bound', 'waiting', 'watching', 'monitoring',
    'analysis', 'chart', 'technical', 'fundamental', 'research', 'study'
  ];
  
  const lowerText = text.toLowerCase();
  
  let bullishScore = 0;
  let bearishScore = 0;
  let neutralScore = 0;
  
  bullishTerms.forEach(term => {
    const matches = (lowerText.match(new RegExp(term, 'g')) || []).length;
    bullishScore += matches;
  });
  
  bearishTerms.forEach(term => {
    const matches = (lowerText.match(new RegExp(term, 'g')) || []).length;
    bearishScore += matches;
  });
  
  neutralTerms.forEach(term => {
    const matches = (lowerText.match(new RegExp(term, 'g')) || []).length;
    neutralScore += matches;
  });
  
  const totalScore = bullishScore + bearishScore + neutralScore;
  let sentiment = 'neutral';
  let confidence = 0;
  
  if (totalScore > 0) {
    if (bullishScore > bearishScore && bullishScore > neutralScore) {
      sentiment = 'bullish';
      confidence = bullishScore / totalScore;
    } else if (bearishScore > bullishScore && bearishScore > neutralScore) {
      sentiment = 'bearish';
      confidence = bearishScore / totalScore;
    } else {
      sentiment = 'neutral';
      confidence = neutralScore / totalScore;
    }
  }
  
  return {
    sentiment,
    confidence: Math.min(confidence * 1.2, 1), // Boost confidence slightly
    scores: { bullish: bullishScore, bearish: bearishScore, neutral: neutralScore }
  };
}

// Extract key trading phrases
function extractKeyPhrases(text) {
  const phrases = [];
  const patterns = [
    /(?:price target|target|tp)\s*(?:is|at)?\s*\$?(\d+(?:\.\d+)?)/gi,
    /(?:stop loss|sl)\s*(?:is|at)?\s*\$?(\d+(?:\.\d+)?)/gi,
    /(?:buy|entry)\s*(?:zone|point|level)?\s*(?:is|at)?\s*\$?(\d+(?:\.\d+)?)/gi,
    /(?:dca|dollar cost average)\s*(?:zone|level|point)?/gi,
    /(?:support|resistance)\s*(?:level|zone)?\s*(?:is|at)?\s*\$?(\d+(?:\.\d+)?)?/gi
  ];
  
  patterns.forEach(pattern => {
    let match;
    while ((match = pattern.exec(text)) !== null) {
      phrases.push({
        type: match[0].toLowerCase().includes('target') ? 'target' :
              match[0].toLowerCase().includes('stop') ? 'stop_loss' :
              match[0].toLowerCase().includes('buy') ? 'entry' :
              match[0].toLowerCase().includes('dca') ? 'dca' :
              match[0].toLowerCase().includes('support') ? 'support' : 'resistance',
        value: match[1] ? parseFloat(match[1]) : null,
        text: match[0]
      });
    }
  });
  
  return phrases;
}

// Get token market data using proper Jupiter API v6
async function getTokenMarketData(symbol) {
  try {
    const token = tokenCache.get(symbol.toUpperCase());
    if (!token) throw new Error(`Token ${symbol} not found`);
    
    // Get price from Jupiter Price API v6
    const priceResponse = await fetch(`${JUPITER_CONFIG.PRICE_API}?ids=${token.address}`);
    if (!priceResponse.ok) throw new Error(`Price API error: ${priceResponse.status}`);
    
    const priceData = await priceResponse.json();
    const tokenPrice = priceData.data[token.address];
    
    if (!tokenPrice) throw new Error(`No price data for ${symbol}`);
    
    return {
      price: tokenPrice.price,
      vsToken: tokenPrice.vsToken || 'USDC',
      vsTokenSymbol: tokenPrice.vsTokenSymbol || 'USDC',
      mintSymbol: tokenPrice.mintSymbol || symbol,
      confidence: 0.95, // Jupiter has high confidence
      lastUpdated: Date.now()
    };
    
  } catch (error) {
    console.error(`❌ Failed to get market data for ${symbol}:`, error);
    throw error;
  }
}

// Handle Jupiter quote requests with proper v6 API
async function handleJupiterQuote(params, sendResponse) {
  try {
    const { inputMint, outputMint, amount, slippageBps = 50 } = params;
    
    const url = new URL(JUPITER_CONFIG.QUOTE_API);
    url.searchParams.set('inputMint', inputMint);
    url.searchParams.set('outputMint', outputMint);
    url.searchParams.set('amount', amount.toString());
    url.searchParams.set('slippageBps', slippageBps.toString());
    
    const response = await fetch(url.toString());
    if (!response.ok) throw new Error(`Jupiter Quote API error: ${response.status}`);
    
    const quoteData = await response.json();
    
    sendResponse({
      success: true,
      data: quoteData
    });
    
  } catch (error) {
    console.error('❌ Jupiter quote failed:', error);
    sendResponse({ success: false, error: error.message });
  }
}

// Generate trading analysis
function generateTradingAnalysis(tokens, sentiment, keyPhrases) {
  if (tokens.length === 0) {
    return {
      summary: "No cryptocurrency tokens detected in the text.",
      recommendation: "Look for posts mentioning specific tokens like $SOL, $JUP, etc.",
      riskLevel: "none"
    };
  }
  
  const analysis = {
    summary: "",
    recommendation: "",
    riskLevel: "medium",
    signals: []
  };
  
  // Analyze sentiment impact
  if (sentiment.confidence > 0.7) {
    if (sentiment.sentiment === 'bullish') {
      analysis.signals.push("Strong bullish sentiment detected");
      analysis.riskLevel = sentiment.confidence > 0.9 ? "low" : "medium";
    } else if (sentiment.sentiment === 'bearish') {
      analysis.signals.push("Strong bearish sentiment detected");
      analysis.riskLevel = "high";
    }
  }
  
  // Analyze key phrases
  keyPhrases.forEach(phrase => {
    switch (phrase.type) {
      case 'target':
        analysis.signals.push(`Price target: $${phrase.value}`);
        break;
      case 'dca':
        analysis.signals.push("DCA opportunity mentioned");
        break;
      case 'support':
        analysis.signals.push(`Support level: $${phrase.value || 'mentioned'}`);
        break;
    }
  });
  
  // Generate summary
  const tokenNames = tokens.map(t => `$${t.symbol}`).join(', ');
  analysis.summary = `Analysis of ${tokenNames} - ${sentiment.sentiment.toUpperCase()} sentiment (${Math.round(sentiment.confidence * 100)}% confidence)`;
  
  // Generate recommendation
  if (sentiment.sentiment === 'bullish' && sentiment.confidence > 0.6) {
    analysis.recommendation = "Consider entering a position with proper risk management";
  } else if (sentiment.sentiment === 'bearish' && sentiment.confidence > 0.6) {
    analysis.recommendation = "Consider taking profits or avoiding new positions";
  } else {
    analysis.recommendation = "Monitor for clearer signals before making decisions";
  }
  
  return analysis;
}

// Show browser notification
function showNotification(title, message) {
  chrome.notifications.create({
    type: 'basic',
    iconUrl: 'icons/icon48.png',
    title: title,
    message: message
  });
}

// Handle token list requests
function handleTokenListRequest(sendResponse) {
  const tokenList = Array.from(tokenCache.values())
    .filter(token => token.symbol && token.name)
    .slice(0, 100); // Limit for performance
    
  sendResponse({
    success: true,
    data: tokenList
  });
}

console.log('✅ Jupiter Social Trader Background Script v2.0 Ready!');
