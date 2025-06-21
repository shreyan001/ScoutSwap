// Jupiter Social Trader - Enhanced Content Script with Google Lens-style UI
console.log('🚀 Jupiter Social Trader v2.0 - Enhanced Content Script Loaded');

// State management
let overlay = null;
let lensMode = false;
let isAnalyzing = false;
let selectedElement = null;
let ocrInstance = null; // Chrome Lens OCR instance

// Configuration
const CONFIG = {
  OVERLAY_ANIMATION_DURATION: 300,
  LENS_SCAN_ANIMATION_DURATION: 2000,
  AUTO_HIDE_DELAY: 10000,
  OCR_CONFIDENCE_THRESHOLD: 0.7
};

// Initialize content script
function initializeContentScript() {
  console.log('🔧 Initializing Jupiter Social Trader on:', window.location.href);
  
  // Initialize OCR
  initializeOCR();
  
  // Check wallet availability
  checkWalletAvailability();
  
  // Add event listeners
  document.addEventListener('mouseup', handleTextSelection);
  document.addEventListener('keydown', handleKeyPress);
  document.addEventListener('click', handleClick);
  
  // Inject lens cursor CSS
  injectLensCursor();
  
  console.log('✅ Content script initialized');
}

// Check wallet availability
function checkWalletAvailability() {
  const walletStatus = {
    phantom: false,
    solflare: false,
    sollet: false
  };
  
  // Check for Phantom wallet
  if (window.phantom && window.phantom.solana) {
    walletStatus.phantom = true;
  }
  
  // Check for Solflare wallet
  if (window.solflare && window.solflare.isSolflare) {
    walletStatus.solflare = true;
  }
  
  // Check for Sollet wallet
  if (window.sollet || window.solana) {
    walletStatus.sollet = true;
  }
  
  // Store wallet availability
  window.jupiterWalletStatus = walletStatus;
  
  return walletStatus;
}

// Connect to wallet
async function connectToWallet(walletType) {
  try {
    let wallet = null;
    
    switch (walletType) {
      case 'phantom':
        if (window.phantom && window.phantom.solana) {
          wallet = window.phantom.solana;
        }
        break;
      case 'solflare':
        if (window.solflare) {
          wallet = window.solflare;
        }
        break;
      case 'sollet':
        if (window.sollet) {
          wallet = window.sollet;
        } else if (window.solana) {
          wallet = window.solana;
        }
        break;
    }
    
    if (!wallet) {
      throw new Error(`${walletType} wallet not found`);
    }
    
    // Connect to wallet
    const response = await wallet.connect();
    
    if (response.publicKey) {
      const address = response.publicKey.toString();
      console.log(`✅ Connected to ${walletType}:`, address);
      
      return {
        success: true,
        address: address,
        publicKey: response.publicKey,
        provider: walletType
      };
    } else {
      throw new Error('Failed to get public key');
    }
    
  } catch (error) {
    console.error(`❌ Failed to connect to ${walletType}:`, error);
    return {
      success: false,
      error: error.message
    };
  }
}

// Connect to any available wallet
async function connectToAvailableWallet() {
  console.log('🔗 Attempting to connect to available wallet...');
  
  const walletStatus = checkWalletAvailability();
  
  // Try wallets in order of preference
  const walletPriority = ['phantom', 'solflare', 'sollet'];
  
  for (const walletType of walletPriority) {
    if (walletStatus[walletType]) {
      console.log(`Trying to connect to ${walletType}...`);
      const result = await connectToWallet(walletType);
      
      if (result.success) {
        return result;
      }
    }
  }
  
  // No wallet available or connection failed
  return {
    success: false,
    error: 'No Solana wallet found. Please install Phantom, Solflare, or Sollet wallet extension.'
  };
}

// Initialize Chrome Lens OCR
async function initializeOCR() {
  try {
    // Load Chrome Lens OCR script
    const script = document.createElement('script');
    script.src = chrome.runtime.getURL('lens-ocr.js');
    document.head.appendChild(script);
    
    // Wait for script to load
    await new Promise((resolve) => {
      script.onload = resolve;
    });
    
    // Initialize OCR instance
    ocrInstance = new window.ChromeLensOCR();
    console.log('✅ Chrome Lens OCR initialized');
  } catch (error) {
    console.error('❌ Failed to initialize Chrome Lens OCR:', error);
  }
}

// Handle text selection for instant analysis
function handleTextSelection(event) {
  const selection = window.getSelection();
  const selectedText = selection.toString().trim();
  
  if (selectedText.length > 10 && containsCryptoKeywords(selectedText)) {
    // Show quick analysis hint
    showQuickAnalysisHint(event);
  }
}

// Handle keyboard shortcuts
function handleKeyPress(event) {
  // Ctrl+Shift+L to toggle lens mode
  if (event.ctrlKey && event.shiftKey && event.key === 'L') {
    event.preventDefault();
    toggleLensMode();
  }
  
  // Escape to close overlay
  if (event.key === 'Escape' && overlay) {
    closeOverlay();
  }
}

// Handle clicks in lens mode
function handleClick(event) {
  if (lensMode) {
    event.preventDefault();
    event.stopPropagation();
    
    const element = event.target;
    performLensAnalysis(element, event);
  }
}

// Check if text contains crypto-related keywords
function containsCryptoKeywords(text) {
  const cryptoKeywords = [
    '$', 'SOL', 'Bitcoin', 'BTC', 'Ethereum', 'ETH', 'crypto', 'token', 
    'DeFi', 'Jupiter', 'JUP', 'swap', 'trade', 'pump', 'moon', 'hodl'
  ];
  
  return cryptoKeywords.some(keyword => 
    text.toLowerCase().includes(keyword.toLowerCase())
  );
}

// Show quick analysis hint
function showQuickAnalysisHint(event) {
  const selection = window.getSelection();
  if (selection.rangeCount === 0) return;
  
  const range = selection.getRangeAt(0);
  const rect = range.getBoundingClientRect();
  
  // Create hint element
  const hint = document.createElement('div');
  hint.className = 'jupiter-quick-hint';
  hint.innerHTML = `
    <div class="jupiter-hint-content">
      <span class="jupiter-hint-icon">🚀</span>
      <span class="jupiter-hint-text">Click to analyze with Jupiter AI</span>
    </div>
  `;
  
  // Position hint
  hint.style.position = 'fixed';
  hint.style.left = `${Math.min(rect.left, window.innerWidth - 250)}px`;
  hint.style.top = `${Math.max(rect.bottom + 10, 50)}px`;
  hint.style.zIndex = '999998';
  
  // Add click handler
  hint.addEventListener('click', () => {
    const selectedText = selection.toString().trim();
    showAnalysisOverlay(selectedText, event);
    hint.remove();
  });
  
  document.body.appendChild(hint);
  
  // Auto-remove hint after 3 seconds
  setTimeout(() => {
    if (hint.parentNode) hint.remove();
  }, 3000);
}

// Toggle lens mode
function toggleLensMode() {
  lensMode = !lensMode;
  
  if (lensMode) {
    activateLensMode();
  } else {
    deactivateLensMode();
  }
}

// Activate Google Lens-style scanning mode
function activateLensMode() {
  console.log('🔍 Activating Jupiter Lens mode');
  
  // Add lens overlay
  const lensOverlay = document.createElement('div');
  lensOverlay.className = 'jupiter-lens-overlay';
  lensOverlay.innerHTML = `
    <div class="jupiter-lens-header">
      <div class="jupiter-lens-title">
        <span class="jupiter-lens-icon">🔍</span>
        Jupiter Lens - Scan for DeFi Signals
      </div>
      <div class="jupiter-lens-controls">
        <button class="jupiter-lens-btn" data-action="toggle-ocr">
          ${lensMode ? '👁️ OCR ON' : '👁️ OCR OFF'}
        </button>
        <button class="jupiter-lens-btn" data-action="close">✕</button>
      </div>
    </div>
    <div class="jupiter-lens-instructions">
      Click on any text, image, or element to analyze for crypto signals
    </div>
  `;
  
  lensOverlay.id = 'jupiter-lens-overlay';
  document.body.appendChild(lensOverlay);
  
  // Add lens cursor to body
  document.body.style.cursor = 'url(data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMTEiIGN5PSIxMSIgcj0iOCIgc3Ryb2tlPSIjMDBkNGZmIiBzdHJva2Utd2lkdGg9IjIiLz4KPHN0cm9rZSBjeD0iMjEiIGN5PSIxMSIgcj0iOCIgc3Ryb2tlPSIjMDBkNGZmIiBzdHJva2Utd2lkdGg9IjIiLz4KPC9zdmc+), auto';
  
  // Add event listeners for lens controls
  lensOverlay.addEventListener('click', (e) => {
    e.stopPropagation();
    const action = e.target.dataset.action;
    
    if (action === 'close') {
      deactivateLensMode();
    } else if (action === 'toggle-ocr') {
      // Toggle OCR mode - will implement later
      console.log('🔄 Toggle OCR mode');
    }
  });
  
  // Add scanning animation
  addScanningAnimation();
}

// Deactivate lens mode
function deactivateLensMode() {
  console.log('🔍 Deactivating Jupiter Lens mode');
  
  lensMode = false;
  document.body.style.cursor = '';
  
  const lensOverlay = document.getElementById('jupiter-lens-overlay');
  if (lensOverlay) {
    lensOverlay.remove();
  }
  
  // Remove scanning elements
  document.querySelectorAll('.jupiter-scan-element').forEach(el => {
    el.classList.remove('jupiter-scan-element');
  });
}

// Add scanning animation effect
function addScanningAnimation() {
  // Create scanning line effect
  const scanLine = document.createElement('div');
  scanLine.className = 'jupiter-scan-line';
  document.body.appendChild(scanLine);
  
  // Animate scan line across screen
  let position = -100;
  const scanAnimation = setInterval(() => {
    position += 5;
    scanLine.style.transform = `translateY(${position}px)`;
    
    if (position > window.innerHeight + 100) {
      position = -100;
    }
  }, 50);
  
  // Stop animation when lens mode is deactivated
  const checkLensMode = setInterval(() => {
    if (!lensMode) {
      clearInterval(scanAnimation);
      clearInterval(checkLensMode);
      if (scanLine.parentNode) scanLine.remove();
    }
  }, 100);
}

// Perform lens analysis on clicked element
async function performLensAnalysis(element, event) {
  console.log('🔍 Performing lens analysis on element:', element.tagName);
  
  // Highlight selected element
  highlightElement(element);
  
  // Extract text content
  let textContent = '';
  let imageContent = null;
  
  if (element.tagName === 'IMG') {
    // Handle image OCR
    imageContent = element.src;
    textContent = await performOCR(element);
  } else {
    // Extract text content
    textContent = extractTextContent(element);
  }
  
  if (textContent.trim().length === 0) {
    showQuickNotification('No text content found in selected element', 'warning');
    return;
  }
  
  // Show analysis overlay
  showAnalysisOverlay(textContent, event, element);
}

// Highlight selected element
function highlightElement(element) {
  // Remove previous highlights
  document.querySelectorAll('.jupiter-highlighted').forEach(el => {
    el.classList.remove('jupiter-highlighted');
  });
  
  // Add highlight to selected element
  element.classList.add('jupiter-highlighted');
  
  // Remove highlight after animation
  setTimeout(() => {
    element.classList.remove('jupiter-highlighted');
  }, 2000);
}

// Extract text content from element and its children
function extractTextContent(element) {
  // Get text content, handling different element types
  let text = '';
  
  if (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA') {
    text = element.value;
  } else {
    text = element.textContent || element.innerText || '';
  }
  
  // Also check for title, alt, and aria-label attributes
  const attributes = ['title', 'alt', 'aria-label', 'placeholder'];
  attributes.forEach(attr => {
    const value = element.getAttribute(attr);
    if (value) text += ' ' + value;
  });
  
  return text.trim();
}

// Perform OCR on image element using Chrome Lens OCR
async function performOCR(imageElement) {
  try {
    console.log('👁️ Performing Chrome Lens OCR on image:', imageElement.src);
    
    if (!ocrInstance) {
      console.warn('⚠️ Chrome Lens OCR not initialized, falling back to mock');
      return 'Mock OCR: Unable to process image - OCR not initialized';
    }
    
    // Create canvas to capture image data
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    // Set canvas dimensions
    canvas.width = imageElement.naturalWidth || imageElement.width || 300;
    canvas.height = imageElement.naturalHeight || imageElement.height || 200;
    
    // Draw image to canvas
    ctx.drawImage(imageElement, 0, 0, canvas.width, canvas.height);
    
    // Convert to data URL
    const imageDataURL = canvas.toDataURL('image/png');
    
    // Use Chrome Lens OCR to scan the image
    const ocrResult = await ocrInstance.scanImage(imageDataURL);
    
    if (ocrResult.success) {
      console.log('✅ OCR successful:', ocrResult);
      
      // Process results for Jupiter Social Trader
      const jupiterResults = ocrInstance.processResultsForJupiter(ocrResult);
      
      // Show OCR results in a notification
      showOCRResults(jupiterResults, imageElement);
      
      return ocrResult.fullText;
    } else {
      console.error('❌ OCR failed:', ocrResult.error);
      return `OCR Error: ${ocrResult.error}`;
    }
    
  } catch (error) {
    console.error('❌ OCR processing failed:', error);
    return `OCR Error: ${error.message}`;
  }
}

// Show OCR results with Jupiter-specific analysis
function showOCRResults(jupiterResults, sourceImage) {
  if (!jupiterResults.success) {
    showQuickNotification(`OCR failed: ${jupiterResults.error}`, 'error');
    return;
  }
  
  // Create OCR results overlay
  const ocrOverlay = document.createElement('div');
  ocrOverlay.className = 'jupiter-ocr-results';
  ocrOverlay.innerHTML = `
    <div class="jupiter-ocr-header">
      <h3>🔍 Chrome Lens OCR Analysis</h3>
      <button class="jupiter-close-btn" onclick="this.parentElement.parentElement.remove()">×</button>
    </div>
    <div class="jupiter-ocr-content">
      <div class="jupiter-ocr-section">
        <h4>📝 Detected Text:</h4>
        <p class="jupiter-detected-text">${jupiterResults.fullText || 'No text detected'}</p>
      </div>
      
      ${jupiterResults.tradingSignals.length > 0 ? `
        <div class="jupiter-ocr-section">
          <h4>🎯 Trading Signals:</h4>
          <div class="jupiter-trading-signals">
            ${jupiterResults.tradingSignals.map(signal => `
              <div class="jupiter-signal">
                <span class="jupiter-signal-type">${signal.type.toUpperCase()}</span>
                <span class="jupiter-signal-value">${signal.symbol || signal.value}</span>
                <span class="jupiter-confidence">Confidence: ${Math.round(signal.confidence * 100)}%</span>
              </div>
            `).join('')}
          </div>
        </div>
      ` : ''}
      
      <div class="jupiter-ocr-section">
        <h4>📊 Sentiment Analysis:</h4>
        <div class="jupiter-sentiment ${jupiterResults.sentiment}">
          <span class="jupiter-sentiment-icon">
            ${jupiterResults.sentiment === 'bullish' ? '📈' : 
              jupiterResults.sentiment === 'bearish' ? '📉' : '➡️'}
          </span>
          <span class="jupiter-sentiment-text">${jupiterResults.sentiment.toUpperCase()}</span>
          <span class="jupiter-confidence">Confidence: ${Math.round(jupiterResults.confidence * 100)}%</span>
        </div>
      </div>
      
      ${jupiterResults.recommendation ? `
        <div class="jupiter-ocr-section">
          <h4>💡 AI Recommendation:</h4>
          <div class="jupiter-recommendation ${jupiterResults.recommendation.risk}">
            <strong>Action:</strong> ${jupiterResults.recommendation.action.replace('_', ' ').toUpperCase()}<br>
            <strong>Message:</strong> ${jupiterResults.recommendation.message}<br>
            <strong>Risk Level:</strong> ${jupiterResults.recommendation.risk.toUpperCase()}
          </div>
        </div>
      ` : ''}
    </div>
    <div class="jupiter-ocr-footer">
      <button class="jupiter-btn jupiter-btn-primary" onclick="this.parentElement.parentElement.remove()">
        Got it!
      </button>
    </div>
  `;
  
  // Position near the source image
  const rect = sourceImage.getBoundingClientRect();
  ocrOverlay.style.position = 'fixed';
  ocrOverlay.style.top = Math.min(rect.bottom + 10, window.innerHeight - 400) + 'px';
  ocrOverlay.style.left = Math.max(10, Math.min(rect.left, window.innerWidth - 350)) + 'px';
  ocrOverlay.style.zIndex = '10001';
  
  document.body.appendChild(ocrOverlay);
  
  // Auto remove after 15 seconds
  setTimeout(() => {
    if (ocrOverlay.parentNode) {
      ocrOverlay.remove();
    }
  }, 15000);
  
  console.log('✅ OCR results displayed:', jupiterResults);
}

// Show analysis overlay with modern design
function showAnalysisOverlay(text, event, sourceElement = null) {
  if (overlay) {
    closeOverlay();
  }
  
  console.log('📊 Showing analysis overlay for text:', text.substring(0, 100) + '...');
  
  // Create overlay
  overlay = document.createElement('div');
  overlay.className = 'jupiter-overlay';
  overlay.innerHTML = `
    <div class="jupiter-overlay-backdrop"></div>
    <div class="jupiter-overlay-content">
      <div class="jupiter-header">
        <div class="jupiter-logo">
          <span class="jupiter-logo-icon">🚀</span>
          <span class="jupiter-logo-text">Jupiter AI</span>
        </div>
        <div class="jupiter-header-actions">
          <button class="jupiter-btn jupiter-btn-icon" data-action="minimize" title="Minimize">
            <span>−</span>
          </button>
          <button class="jupiter-btn jupiter-btn-icon" data-action="close" title="Close">
            <span>×</span>
          </button>
        </div>
      </div>
      
      <div class="jupiter-analysis-container">
        <div class="jupiter-loading-state">
          <div class="jupiter-loading-spinner"></div>
          <div class="jupiter-loading-text">
            <span class="jupiter-loading-primary">Analyzing content with AI...</span>
            <span class="jupiter-loading-secondary">Extracting DeFi signals and token mentions</span>
          </div>
        </div>
        
        <div class="jupiter-results-container" style="display: none;">
          <div class="jupiter-results-content"></div>
        </div>
      </div>
      
      <div class="jupiter-footer">
        <div class="jupiter-source-info">
          ${sourceElement ? `Source: ${sourceElement.tagName.toLowerCase()}` : 'Selected text'}
        </div>
        <div class="jupiter-powered-by">Powered by Jupiter API</div>
      </div>
    </div>
  `;
  
  // Add event listeners
  overlay.addEventListener('click', handleOverlayClick);
  
  document.body.appendChild(overlay);
  
  // Position overlay intelligently
  positionOverlay(event);
  
  // Start analysis
  performAnalysis(text);
}

// Handle overlay clicks
function handleOverlayClick(event) {
  event.stopPropagation();
  
  const action = event.target.dataset.action;
  if (action === 'close') {
    closeOverlay();
  } else if (action === 'minimize') {
    minimizeOverlay();
  }
}

// Position overlay intelligently based on viewport and cursor
function positionOverlay(event) {
  const overlayContent = overlay.querySelector('.jupiter-overlay-content');
  const viewportWidth = window.innerWidth;
  const viewportHeight = window.innerHeight;
  
  let left, top;
  
  if (event && event.clientX && event.clientY) {
    // Position near cursor
    left = Math.min(event.clientX + 20, viewportWidth - 400);
    top = Math.min(event.clientY + 20, viewportHeight - 500);
  } else {
    // Center on screen
    left = (viewportWidth - 400) / 2;
    top = (viewportHeight - 500) / 2;
  }
  
  // Ensure overlay stays within viewport
  left = Math.max(20, left);
  top = Math.max(20, top);
  
  overlayContent.style.left = `${left}px`;
  overlayContent.style.top = `${top}px`;
}

// Perform AI analysis of the text
async function performAnalysis(text) {
  try {
    const response = await new Promise((resolve) => {
      chrome.runtime.sendMessage({
        action: 'analyzeText',
        text: text
      }, resolve);
    });
    
    if (response.success) {
      displayAnalysisResults(response.data);
    } else {
      showAnalysisError(response.error);
    }
  } catch (error) {
    console.error('❌ Analysis failed:', error);
    showAnalysisError(error.message);
  }
}

// Display analysis results with enhanced UI
function displayAnalysisResults(data) {
  const loadingState = overlay.querySelector('.jupiter-loading-state');
  const resultsContainer = overlay.querySelector('.jupiter-results-container');
  const resultsContent = overlay.querySelector('.jupiter-results-content');
  
  loadingState.style.display = 'none';
  resultsContainer.style.display = 'block';
  
  if (data.tokens.length === 0) {
    resultsContent.innerHTML = `
      <div class="jupiter-no-results">
        <div class="jupiter-no-results-icon">🔍</div>
        <h3>No Crypto Tokens Found</h3>
        <p>The analyzed content doesn't contain recognizable cryptocurrency tokens.</p>
        <div class="jupiter-suggestion">
          <p>Try analyzing content that mentions tokens like:</p>
          <div class="jupiter-token-examples">
            <span class="jupiter-token-tag">$SOL</span>
            <span class="jupiter-token-tag">$JUP</span>
            <span class="jupiter-token-tag">$BTC</span>
            <span class="jupiter-token-tag">$ETH</span>
          </div>
        </div>
      </div>
    `;
    return;
  }
  
  // Display sentiment analysis
  const sentimentHtml = `
    <div class="jupiter-sentiment-analysis">
      <div class="jupiter-sentiment-header">
        <h3>📊 Sentiment Analysis</h3>
        <div class="jupiter-sentiment-badge jupiter-sentiment-${data.sentiment.sentiment}">
          ${getSentimentIcon(data.sentiment.sentiment)} ${data.sentiment.sentiment.toUpperCase()}
        </div>
      </div>
      <div class="jupiter-sentiment-details">
        <div class="jupiter-confidence-bar">
          <span>Confidence: ${Math.round(data.sentiment.confidence * 100)}%</span>
          <div class="jupiter-progress-bar">
            <div class="jupiter-progress-fill" style="width: ${data.sentiment.confidence * 100}%"></div>
          </div>
        </div>
        <p class="jupiter-sentiment-reasoning">${data.sentiment.reasoning}</p>
      </div>
    </div>
  `;
  
  // Display token analyses
  const tokensHtml = data.tokens.map(token => `
    <div class="jupiter-token-card" data-token="${token.symbol}">
      <div class="jupiter-token-header">
        <h4>$${token.symbol}</h4>
        <div class="jupiter-token-actions">
          <button class="jupiter-btn jupiter-btn-sm" data-action="get-price" data-token="${token.symbol}">
            💰 Get Price
          </button>
        </div>
      </div>
      <div class="jupiter-token-loading" style="display: none;">
        <div class="jupiter-mini-spinner"></div>
        <span>Loading token data...</span>
      </div>
      <div class="jupiter-token-data"></div>
    </div>
  `).join('');
  
  resultsContent.innerHTML = sentimentHtml + '<div class="jupiter-tokens-section">' + tokensHtml + '</div>';
  
  // Add event listeners for token actions
  resultsContent.addEventListener('click', handleTokenAction);
  
  // Auto-load price data for first token
  if (data.tokens.length > 0) {
    loadTokenData(data.tokens[0].symbol);
  }
}

// Handle token-related actions
async function handleTokenAction(event) {
  const action = event.target.dataset.action;
  const tokenSymbol = event.target.dataset.token;
  
  if (action === 'get-price') {
    await loadTokenData(tokenSymbol);
  }
}

// Load token data from Jupiter API
async function loadTokenData(tokenSymbol) {
  const tokenCard = overlay.querySelector(`[data-token="${tokenSymbol}"]`);
  const loadingEl = tokenCard.querySelector('.jupiter-token-loading');
  const dataEl = tokenCard.querySelector('.jupiter-token-data');
  
  loadingEl.style.display = 'flex';
  
  try {
    const response = await new Promise((resolve) => {
      chrome.runtime.sendMessage({
        action: 'getTokenData',
        symbol: tokenSymbol
      }, resolve);
    });
    
    loadingEl.style.display = 'none';
    
    if (response.success) {
      displayTokenData(response.data, dataEl);
    } else {
      dataEl.innerHTML = `<div class="jupiter-error-message">❌ ${response.error}</div>`;
    }
  } catch (error) {
    loadingEl.style.display = 'none';
    dataEl.innerHTML = `<div class="jupiter-error-message">❌ Error: ${error.message}</div>`;
  }
}

// Display individual token data
function displayTokenData(tokenData, container) {
  const { token, price } = tokenData;
  
  container.innerHTML = `
    <div class="jupiter-token-info">
      <div class="jupiter-price-display">
        <span class="jupiter-price-value">$${parseFloat(price || 0).toFixed(6)}</span>
        <span class="jupiter-price-label">Current Price</span>
      </div>
      <div class="jupiter-token-details">
        <div class="jupiter-detail-item">
          <span class="jupiter-label">Name:</span>
          <span class="jupiter-value">${token.name}</span>
        </div>
        <div class="jupiter-detail-item">
          <span class="jupiter-label">Address:</span>
          <span class="jupiter-value jupiter-address">${token.address.slice(0, 6)}...${token.address.slice(-6)}</span>
        </div>
      </div>
      <div class="jupiter-token-actions">
        <button class="jupiter-btn jupiter-btn-primary" data-action="simulate-swap" data-address="${token.address}">
          🔄 Simulate Swap
        </button>
        <button class="jupiter-btn jupiter-btn-secondary" data-action="copy-address" data-address="${token.address}">
          📋 Copy Address
        </button>
      </div>
    </div>
  `;
  
  // Add event listeners for new actions
  container.addEventListener('click', (event) => {
    const action = event.target.dataset.action;
    const address = event.target.dataset.address;
    
    if (action === 'copy-address') {
      navigator.clipboard.writeText(address);
      showQuickNotification('Address copied to clipboard!', 'success');
    } else if (action === 'simulate-swap') {
      // TODO: Implement swap simulation
      showQuickNotification('Swap simulation coming soon!', 'info');
    }
  });
}

// Show analysis error
function showAnalysisError(errorMessage) {
  const loadingState = overlay.querySelector('.jupiter-loading-state');
  const resultsContainer = overlay.querySelector('.jupiter-results-container');
  const resultsContent = overlay.querySelector('.jupiter-results-content');
  
  loadingState.style.display = 'none';
  resultsContainer.style.display = 'block';
  
  resultsContent.innerHTML = `
    <div class="jupiter-error-state">
      <div class="jupiter-error-icon">⚠️</div>
      <h3>Analysis Failed</h3>
      <p>${errorMessage}</p>
      <button class="jupiter-btn jupiter-btn-primary" onclick="closeOverlay()">Close</button>
    </div>
  `;
}

// Close overlay with animation
function closeOverlay() {
  if (!overlay) return;
  
  overlay.classList.add('jupiter-overlay-closing');
  
  setTimeout(() => {
    if (overlay && overlay.parentNode) {
      overlay.remove();
    }
    overlay = null;
  }, CONFIG.OVERLAY_ANIMATION_DURATION);
}

// Minimize overlay
function minimizeOverlay() {
  if (!overlay) return;
  
  overlay.classList.toggle('jupiter-overlay-minimized');
}

// Show quick notification
function showQuickNotification(message, type = 'info') {
  const notification = document.createElement('div');
  notification.className = `jupiter-notification jupiter-notification-${type}`;
  notification.textContent = message;
  
  document.body.appendChild(notification);
  
  setTimeout(() => {
    notification.classList.add('jupiter-notification-show');
  }, 10);
  
  setTimeout(() => {
    notification.classList.remove('jupiter-notification-show');
    setTimeout(() => {
      if (notification.parentNode) {
        notification.remove();
      }
    }, 300);
  }, 3000);
}

// Get sentiment icon
function getSentimentIcon(sentiment) {
  const icons = {
    positive: '📈',
    negative: '📉',
    neutral: '⚖️'
  };
  return icons[sentiment] || '❓';
}

// Inject lens cursor styles
function injectLensCursor() {
  if (document.getElementById('jupiter-lens-cursor-styles')) return;
  
  const style = document.createElement('style');
  style.id = 'jupiter-lens-cursor-styles';
  style.textContent = `
    .jupiter-lens-cursor {
      cursor: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none"><circle cx="11" cy="11" r="8" stroke="%2300d4ff" stroke-width="2"/><path d="m21 21-4.35-4.35" stroke="%2300d4ff" stroke-width="2"/></svg>') 12 12, auto !important;
    }
  `;
  
  document.head.appendChild(style);
}

// Listen for messages from background script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log('📨 Content script received message:', request.action);
  
  switch (request.action) {
    case 'showAnalysis':
      showAnalysisOverlay(request.text);
      sendResponse({ success: true });
      break;
      
    case 'toggleLensMode':
      toggleLensMode();
      sendResponse({ success: true });
      break;
      
    case 'checkWalletAvailability':
      const walletStatus = checkWalletAvailability();
      sendResponse(walletStatus);
      break;
        case 'connectWallet':
      connectToAvailableWallet().then(result => {
        sendResponse(result);
      });
      return true; // Keep message channel open for async response
      
    case 'performLensAnalysis':
      if (request.imageData) {
        // Handle image analysis
        performOCR(request.imageData).then(text => {
          if (text.trim()) {
            showAnalysisOverlay(text);
          } else {
            showQuickNotification('No text found in image', 'warning');
          }
        });
      }
      sendResponse({ success: true });
      break;
      
    case 'testOCR':
      testOCRCapabilities();
      sendResponse({ success: true });
      break;
      
    case 'scanPageForCrypto':
      scanPageForCryptoImages().then(result => {
        sendResponse(result);
      });
      return true; // Keep message channel open for async response
      
    case 'analyzeText':
      if (request.text) {
        performAnalysis(request.text);
        sendResponse({ success: true });
      }
      break;
      
    default:
      sendResponse({ success: false, error: 'Unknown action' });
  }
});

// Test OCR capabilities
async function testOCRCapabilities() {
  try {
    if (!ocrInstance) {
      console.warn('⚠️ OCR not initialized, initializing now...');
      await initializeOCR();
    }
    
    // Create test image with crypto content
    const testCanvas = document.createElement('canvas');
    const ctx = testCanvas.getContext('2d');
    testCanvas.width = 300;
    testCanvas.height = 100;
    
    // Draw test content
    ctx.fillStyle = '#000';
    ctx.font = '20px Arial';
    ctx.fillText('SOL: $98.45 (+5.2%)', 10, 30);
    ctx.fillText('Jupiter Aggregator', 10, 60);
    
    const testImageData = testCanvas.toDataURL('image/png');
    
    // Test OCR
    const result = await ocrInstance.scanImage(testImageData);
    
    showQuickNotification(
      result.success ? 
        `OCR Test Success! Detected: ${result.fullText}` :
        `OCR Test Failed: ${result.error}`,
      result.success ? 'success' : 'error'
    );
    
    console.log('🧪 OCR Test Result:', result);
    
  } catch (error) {
    console.error('❌ OCR test failed:', error);
    showQuickNotification(`OCR Test Error: ${error.message}`, 'error');
  }
}

// Scan current page for images with crypto content
async function scanPageForCryptoImages() {
  try {
    if (!ocrInstance) {
      await initializeOCR();
    }
    
    const images = document.querySelectorAll('img');
    let analyzedCount = 0;
    let cryptoFound = 0;
    
    console.log(`🔍 Scanning ${images.length} images on page...`);
    
    for (const img of images) {
      // Skip small images (likely icons/decorative)
      if (img.width < 50 || img.height < 50) continue;
      
      try {
        // Add visual indicator
        img.style.border = '2px solid #00d4ff';
        img.style.borderRadius = '4px';
        
        const text = await performOCR(img);
        analyzedCount++;
        
        if (text && containsCryptoKeywords(text)) {
          cryptoFound++;
          img.style.border = '3px solid #00ff88';
        } else {
          img.style.border = 'none';
        }
        
        // Don't overwhelm the API
        await new Promise(resolve => setTimeout(resolve, 500));
        
      } catch (error) {
        console.error('❌ Error analyzing image:', error);
        img.style.border = 'none';
      }
    }
    
    console.log(`✅ Scan complete: ${cryptoFound}/${analyzedCount} images contained crypto content`);
    
    return {
      success: true,
      imagesFound: analyzedCount,
      cryptoImages: cryptoFound
    };
    
  } catch (error) {
    console.error('❌ Page scan failed:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

// Initialize extension when page loads
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeContentScript);
} else {
  initializeContentScript();
}

// Cleanup on page unload
window.addEventListener('beforeunload', () => {
  if (overlay) overlay.remove();
  if (lensMode) deactivateLensMode();
});

// Global functions for backwards compatibility
window.closeOverlay = closeOverlay;
window.simulateSwap = (address, symbol) => {
  showQuickNotification(`Swap simulation for $${symbol} coming soon!`, 'info');
};
window.addToCart = (address, symbol) => {
  showQuickNotification(`$${symbol} added to cart!`, 'success');
};

console.log('✅ Jupiter Social Trader content script loaded successfully');
