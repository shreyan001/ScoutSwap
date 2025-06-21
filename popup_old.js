// Jupiter Social Trader - Enhanced Popup Script v2.0
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 Jupiter Social Trader v2.0 - Popup loaded');
    
    // Initialize popup
    initializePopup();
    
    // Set up navigation
    setupNavigation();
    
    // Set up event listeners
    setupEventListeners();
    
    // Check wallet connection
    checkWalletConnection();
    
    // Load user data
    loadUserData();
    
    // Update dashboard
    updateDashboard();
    
    // Check for updates
    checkForUpdates();
});

function initializePopup() {
    // Load saved settings
    chrome.storage.local.get([
        'auto-analysis', 
        'risk-level', 
        'default-slippage',
        'notifications-enabled',
        'confidence-threshold',
        'connectedWallet',
        'walletAddress'
    ], (result) => {
        // Update settings UI
        if (result['auto-analysis'] !== undefined) {
            const autoAnalysisEl = document.getElementById('auto-analysis');
            if (autoAnalysisEl) autoAnalysisEl.checked = result['auto-analysis'];
        }
        if (result['risk-level']) {
            const riskLevelEl = document.getElementById('risk-level');
            if (riskLevelEl) riskLevelEl.value = result['risk-level'];
        }
        if (result['default-slippage']) {
            const slippageEl = document.getElementById('default-slippage');
            if (slippageEl) slippageEl.value = result['default-slippage'];
        }
        if (result['notifications-enabled'] !== undefined) {
            const notificationsEl = document.getElementById('notifications-enabled');
            if (notificationsEl) notificationsEl.checked = result['notifications-enabled'];
        }
        if (result['confidence-threshold']) {
            const confidenceEl = document.getElementById('confidence-threshold');
            const confidenceValueEl = document.getElementById('confidence-value');
            if (confidenceEl) {
                confidenceEl.value = result['confidence-threshold'];
                if (confidenceValueEl) confidenceValueEl.textContent = Math.round(result['confidence-threshold'] * 100) + '%';
            }
        }
        
        // Update wallet connection status
        if (result.connectedWallet && result.walletAddress) {
            updateWalletConnectionStatus(true, result.connectedWallet, result.walletAddress);
        }
    });
    
    // Check extension status
    checkExtensionStatus();
}

// Navigation Setup
function setupNavigation() {
    const navTabs = document.querySelectorAll('.nav-tab');
    const pages = document.querySelectorAll('.page');
    
    navTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const targetPage = tab.getAttribute('data-page');
            
            // Remove active class from all tabs and pages
            navTabs.forEach(t => t.classList.remove('active'));
            pages.forEach(p => p.classList.remove('active'));
            
            // Add active class to clicked tab and corresponding page
            tab.classList.add('active');
            const targetPageElement = document.getElementById(targetPage + '-page');
            if (targetPageElement) {
                targetPageElement.classList.add('active');
            }
            
            // Load page-specific data
            switch(targetPage) {
                case 'dashboard':
                    updateDashboard();
                    break;
                case 'trading':
                    updateTradingInterface();
                    break;
                case 'ocr':
                    updateOCRInterface();
                    break;
            }
        });
    });
}

// Wallet Connection Functions
function checkWalletConnection() {
    chrome.storage.local.get(['connectedWallet', 'walletAddress'], (result) => {
        if (result.connectedWallet && result.walletAddress) {
            updateWalletConnectionStatus(true, result.connectedWallet, result.walletAddress);
        } else {
            updateWalletConnectionStatus(false);
        }
    });
    
    // Check wallet availability
    checkWalletAvailability();
}

function checkWalletAvailability() {
    chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
        chrome.tabs.sendMessage(tabs[0].id, {
            action: 'checkWalletAvailability'
        }, (response) => {
            if (response) {
                updateWalletStatus('phantom', response.phantom);
                updateWalletStatus('solflare', response.solflare);
                updateWalletStatus('sollet', response.sollet);
            }
        });
    });
}

function updateWalletStatus(walletType, isAvailable) {
    const statusElement = document.getElementById(`${walletType}-status`);
    if (statusElement) {
        statusElement.textContent = isAvailable ? 'Available' : 'Not Installed';
        statusElement.className = `status-badge ${isAvailable ? 'available' : 'unavailable'}`;
    }
}

function updateWalletConnectionStatus(connected, walletType = null, address = null) {
    const connectionStatus = document.getElementById('connectionStatus');
    const walletAddressEl = document.getElementById('wallet-address');
    const disconnectBtn = document.getElementById('disconnect-wallet');
    
    if (connected && walletType && address) {
        // Update connection status
        if (connectionStatus) {
            connectionStatus.className = 'status-indicator connected';
            connectionStatus.innerHTML = `
                <span class="status-dot"></span>
                <span class="status-text">Connected</span>
            `;
        }
        
        // Update wallet address display
        if (walletAddressEl) {
            walletAddressEl.textContent = `${address.slice(0, 4)}...${address.slice(-4)}`;
        }
        
        // Show disconnect button
        if (disconnectBtn) {
            disconnectBtn.style.display = 'block';
        }
        
        // Enable trading interface
        enableTradingInterface();
        
    } else {
        // Update connection status
        if (connectionStatus) {
            connectionStatus.className = 'status-indicator disconnected';
            connectionStatus.innerHTML = `
                <span class="status-dot"></span>
                <span class="status-text">Disconnected</span>
            `;
        }
        
        // Update wallet address display
        if (walletAddressEl) {
            walletAddressEl.textContent = 'Not Connected';
        }
        
        // Hide disconnect button
        if (disconnectBtn) {
            disconnectBtn.style.display = 'none';
        }
        
        // Disable trading interface
        disableTradingInterface();
    }
}

function connectWallet(walletType) {
    chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
        chrome.tabs.sendMessage(tabs[0].id, {
            action: 'connectWallet',
            walletType: walletType
        }, (response) => {
            if (response && response.success) {
                // Save wallet connection
                chrome.storage.local.set({
                    connectedWallet: walletType,
                    walletAddress: response.address
                });
                
                updateWalletConnectionStatus(true, walletType, response.address);
                showNotification(`Connected to ${walletType}!`, 'success');
                
                // Switch to dashboard
                document.querySelector('[data-page="dashboard"]').click();
                
            } else {
                showNotification(`Failed to connect to ${walletType}`, 'error');
            }
        });
    });
}

function disconnectWallet() {
    chrome.storage.local.remove(['connectedWallet', 'walletAddress'], () => {
        updateWalletConnectionStatus(false);
        showNotification('Wallet disconnected', 'info');
        
        // Switch back to connect page
        document.querySelector('[data-page="connect"]').click();
    });
}

function setupEventListeners() {
    // Wallet connection events
    document.querySelectorAll('.wallet-card').forEach(card => {
        card.addEventListener('click', () => {
            const walletType = card.getAttribute('data-wallet');
            connectWallet(walletType);
        });
    });
    
    // Disconnect wallet
    document.getElementById('disconnect-wallet')?.addEventListener('click', disconnectWallet);
    
    // Settings events
    document.getElementById('auto-analysis')?.addEventListener('change', (e) => {
        chrome.storage.local.set({ 'auto-analysis': e.target.checked });
        showNotification('Auto-analysis ' + (e.target.checked ? 'enabled' : 'disabled'));
    });
    
    document.getElementById('risk-level')?.addEventListener('change', (e) => {
        chrome.storage.local.set({ 'risk-level': e.target.value });
        showNotification(`Risk level set to ${e.target.value}`);
    });
    
    document.getElementById('default-slippage')?.addEventListener('change', (e) => {
        chrome.storage.local.set({ 'default-slippage': e.target.value });
        showNotification(`Default slippage set to ${e.target.value / 100}%`);
    });
    
    document.getElementById('notifications-enabled')?.addEventListener('change', (e) => {
        chrome.storage.local.set({ 'notifications-enabled': e.target.checked });
        showNotification('Notifications ' + (e.target.checked ? 'enabled' : 'disabled'));
    });
    
    document.getElementById('confidence-threshold')?.addEventListener('input', (e) => {
        const value = parseFloat(e.target.value);
        chrome.storage.local.set({ 'confidence-threshold': value });
        document.getElementById('confidence-value').textContent = Math.round(value * 100) + '%';
    });
    
    // Dashboard quick actions
    document.getElementById('activate-lens')?.addEventListener('click', () => {
        activateLensMode();
    });
    
    document.getElementById('scan-page')?.addEventListener('click', () => {
        scanCurrentPage();
    });
    
    document.getElementById('open-jupiter')?.addEventListener('click', () => {
        chrome.tabs.create({ url: 'https://jup.ag/' });
    });
    
    // Trading interface events
    document.getElementById('flip-tokens')?.addEventListener('click', flipTokens);
    document.getElementById('from-amount')?.addEventListener('input', calculateSwapAmount);
    document.getElementById('execute-swap')?.addEventListener('click', executeSwap);
    
    // OCR events
    document.getElementById('activate-lens-ocr')?.addEventListener('click', () => {
        activateLensMode();
    });
    
    document.getElementById('scan-current-page')?.addEventListener('click', () => {
        scanCurrentPage();
    });
    
    document.getElementById('test-ocr')?.addEventListener('click', () => {
        testOCRFunctionality();
    });
    
    // Settings links
    document.getElementById('view-changelog')?.addEventListener('click', () => {
        chrome.tabs.create({ url: 'https://github.com/your-repo/jupiter-social-trader/releases' });
    });
    
    document.getElementById('report-issue')?.addEventListener('click', () => {
        chrome.tabs.create({ url: 'https://github.com/your-repo/jupiter-social-trader/issues' });
    });
    
    document.getElementById('visit-docs')?.addEventListener('click', () => {
        chrome.tabs.create({ url: 'https://docs.jup.ag/' });
    });
}

// New functions for enhanced features

function activateLensMode() {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        chrome.tabs.sendMessage(tabs[0].id, {
            action: 'toggleLensMode'
        }, (response) => {
            if (response && response.success) {
                showNotification('Lens mode activated! Click on any element to analyze.', 'success');
                document.getElementById('ocr-status-text').textContent = 'Lens Mode Active';
            } else {
                showNotification('Please refresh the page and try again.', 'error');
            }
        });
    });
}

function scanCurrentPage() {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        showNotification('Scanning page for crypto content...', 'info');
        document.getElementById('ocr-status-text').textContent = 'Scanning...';
        
        chrome.tabs.sendMessage(tabs[0].id, {
            action: 'scanPageForCrypto'
        }, (response) => {
            if (response && response.success) {
                const count = response.imagesFound || 0;
                showNotification(`Found ${count} crypto-related elements!`, 'success');
                document.getElementById('ocr-status-text').textContent = 'Scan Complete';
                updateOCRResults(response.results);
            } else {
                showNotification('No crypto content found on this page.', 'warning');
                document.getElementById('ocr-status-text').textContent = 'Ready';
            }
        });
    });
}

function updateDashboard() {
    // Update portfolio
    chrome.storage.local.get(['connectedWallet', 'portfolioData'], (result) => {
        if (result.connectedWallet) {
            fetchPortfolioData();
        }
    });
    
    // Update recent analysis
    updateRecentAnalysis();
    
    // Update market sentiment
    updateMarketSentiment();
}

function fetchPortfolioData() {
    // In a real implementation, this would fetch from Solana RPC
    chrome.runtime.sendMessage({
        action: 'getPortfolio'
    }, (response) => {
        if (response && response.success) {
            updatePortfolioDisplay(response.portfolio);
        }
    });
}

function updatePortfolioDisplay(portfolio) {
    const portfolioValue = document.querySelector('.portfolio-value');
    const portfolioTokens = document.querySelector('.portfolio-tokens');
    
    if (portfolioValue && portfolio.totalValue) {
        portfolioValue.textContent = `$${portfolio.totalValue.toFixed(2)}`;
    }
    
    if (portfolioTokens && portfolio.tokens) {
        portfolioTokens.innerHTML = portfolio.tokens.map(token => `
            <div class="token-item">
                <span class="token-symbol">${token.symbol}</span>
                <span class="token-amount">${token.amount.toFixed(4)}</span>
                <span class="token-value">$${token.value.toFixed(2)}</span>
            </div>
        `).join('');
    }
}

function updateRecentAnalysis() {
    chrome.storage.local.get(['analysisHistory'], (result) => {
        const history = result.analysisHistory || [];
        const recentAnalysisEl = document.getElementById('recent-analysis');
        
        if (history.length === 0) {
            recentAnalysisEl.innerHTML = `
                <div class="analysis-item">
                    <span class="analysis-text">No recent analysis</span>
                    <span class="analysis-time">Start scanning content!</span>
                </div>
            `;
            return;
        }
        
        const recent = history.slice(-3).reverse();
        recentAnalysisEl.innerHTML = recent.map(item => `
            <div class="analysis-item">
                <span class="analysis-text">${item.token || 'Unknown Token'}</span>
                <span class="analysis-sentiment ${item.sentiment?.toLowerCase()}">${item.sentiment || 'Neutral'}</span>
                <span class="analysis-time">${formatTime(item.timestamp)}</span>
            </div>
        `).join('');
    });
}

function updateMarketSentiment() {
    chrome.runtime.sendMessage({
        action: 'getMarketSentiment'
    }, (response) => {
        if (response && response.sentiment) {
            const sentimentBar = document.getElementById('sentiment-bar');
            const sentiment = response.sentiment;
            
            // Update sentiment bar (0-100 scale)
            const percentage = sentiment.score * 100;
            sentimentBar.style.width = `${percentage}%`;
            
            if (percentage < 33) {
                sentimentBar.className = 'sentiment-bar bearish';
            } else if (percentage > 66) {
                sentimentBar.className = 'sentiment-bar bullish';
            } else {
                sentimentBar.className = 'sentiment-bar neutral';
            }
        }
    });
}

function updateTradingInterface() {
    chrome.storage.local.get(['connectedWallet'], (result) => {
        const executeBtn = document.getElementById('execute-swap');
        
        if (result.connectedWallet) {
            executeBtn.disabled = false;
            executeBtn.textContent = 'Swap Tokens';
            fetchTokenBalances();
            fetchMarketData();
        } else {
            executeBtn.disabled = true;
            executeBtn.textContent = 'Connect Wallet to Swap';
        }
    });
}

function enableTradingInterface() {
    const executeBtn = document.getElementById('execute-swap');
    if (executeBtn) {
        executeBtn.disabled = false;
        executeBtn.textContent = 'Swap Tokens';
    }
}

function disableTradingInterface() {
    const executeBtn = document.getElementById('execute-swap');
    if (executeBtn) {
        executeBtn.disabled = true;
        executeBtn.textContent = 'Connect Wallet to Swap';
    }
}

function fetchTokenBalances() {
    chrome.runtime.sendMessage({
        action: 'getTokenBalances'
    }, (response) => {
        if (response && response.balances) {
            // Update balance displays
            const fromBalance = document.querySelector('.swap-section:first-child .token-balance');
            const toBalance = document.querySelector('.swap-section:last-child .token-balance');
            
            if (fromBalance) fromBalance.textContent = `Balance: ${response.balances.SOL || 0} SOL`;
            if (toBalance) toBalance.textContent = `Balance: ${response.balances.USDC || 0} USDC`;
        }
    });
}

function fetchMarketData() {
    chrome.runtime.sendMessage({
        action: 'getMarketData'
    }, (response) => {
        if (response && response.prices) {
            const marketDataEl = document.getElementById('market-data');
            if (marketDataEl) {
                marketDataEl.innerHTML = Object.entries(response.prices).map(([pair, price]) => `
                    <div class="market-item">
                        <span>${pair}</span>
                        <span class="price">$${price.toFixed(4)}</span>
                    </div>
                `).join('');
            }
        }
    });
}

function flipTokens() {
    const fromAmount = document.getElementById('from-amount');
    const toAmount = document.getElementById('to-amount');
    const fromToken = document.getElementById('from-token');
    const toToken = document.getElementById('to-token');
    
    // Swap amounts
    const tempAmount = fromAmount.value;
    fromAmount.value = toAmount.value;
    toAmount.value = tempAmount;
    
    // Swap token labels
    const tempToken = fromToken.querySelector('.token-symbol').textContent;
    fromToken.querySelector('.token-symbol').textContent = toToken.querySelector('.token-symbol').textContent;
    toToken.querySelector('.token-symbol').textContent = tempToken;
    
    // Recalculate
    calculateSwapAmount();
}

function calculateSwapAmount() {
    const fromAmount = parseFloat(document.getElementById('from-amount').value);
    const fromToken = document.getElementById('from-token').querySelector('.token-symbol').textContent;
    const toToken = document.getElementById('to-token').querySelector('.token-symbol').textContent;
    
    if (fromAmount && fromToken && toToken) {
        chrome.runtime.sendMessage({
            action: 'getSwapQuote',
            fromToken,
            toToken,
            amount: fromAmount
        }, (response) => {
            if (response && response.quote) {
                document.getElementById('to-amount').value = response.quote.outAmount;
                document.getElementById('swap-rate').textContent = `1 ${fromToken} = ${response.quote.rate} ${toToken}`;
                document.getElementById('swap-route').textContent = response.quote.route || 'Jupiter Best Route';
            }
        });
    }
}

function executeSwap() {
    const fromAmount = document.getElementById('from-amount').value;
    const fromToken = document.getElementById('from-token').querySelector('.token-symbol').textContent;
    const toToken = document.getElementById('to-token').querySelector('.token-symbol').textContent;
    
    if (!fromAmount || parseFloat(fromAmount) <= 0) {
        showNotification('Please enter a valid amount', 'error');
        return;
    }
    
    showNotification('Preparing swap transaction...', 'info');
    
    chrome.runtime.sendMessage({
        action: 'executeSwap',
        fromToken,
        toToken,
        amount: parseFloat(fromAmount)
    }, (response) => {
        if (response && response.success) {
            showNotification('Swap executed successfully!', 'success');
            // Reset form
            document.getElementById('from-amount').value = '';
            document.getElementById('to-amount').value = '';
            // Refresh balances
            fetchTokenBalances();
        } else {
            showNotification(response?.error || 'Swap failed', 'error');
        }
    });
}

function updateOCRInterface() {
    // Update OCR results
    chrome.storage.local.get(['ocrHistory'], (result) => {
        const ocrResults = result.ocrHistory || [];
        updateOCRResults(ocrResults);
    });
}

function updateOCRResults(results) {
    const resultsListEl = document.getElementById('ocr-results-list');
    
    if (!results || results.length === 0) {
        resultsListEl.innerHTML = `
            <div class="empty-state">
                <p>No OCR scans yet. Start by activating Lens Mode!</p>
            </div>
        `;
        return;
    }
    
    resultsListEl.innerHTML = results.slice(-5).reverse().map(result => `
        <div class="ocr-result-item">
            <div class="result-header">
                <span class="result-type">${result.type || 'Text'}</span>
                <span class="result-time">${formatTime(result.timestamp)}</span>
            </div>
            <div class="result-content">${result.text}</div>            ${result.sentiment ? `<div class="result-sentiment ${result.sentiment.toLowerCase()}">${result.sentiment}</div>` : ''}
        </div>
    `).join('');
}

function checkExtensionStatus() {
    // Check if Jupiter API is accessible
    chrome.runtime.sendMessage({
        action: 'healthCheck'
    }, (response) => {
        if (response && response.success) {
            updateStatusIndicator('online');
        } else {
            updateStatusIndicator('offline');
        }
    });
}

function updateStatusIndicator(status) {
    // Add status indicator to header if it doesn't exist
    let statusEl = document.getElementById('extensionStatus');
    if (!statusEl) {
        statusEl = document.createElement('div');
        statusEl.id = 'extensionStatus';
        statusEl.className = 'status-indicator';
        document.querySelector('.popup-header').appendChild(statusEl);
    }
    
    statusEl.className = `status-indicator ${status}`;
    statusEl.textContent = status === 'online' ? '🟢 Online' : '🔴 Offline';
    statusEl.title = status === 'online' ? 'Jupiter API connected' : 'Jupiter API disconnected';
}

function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `popup-notification ${type}`;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    // Show notification
    setTimeout(() => {
        notification.classList.add('show');
    }, 10);
    
    // Hide notification after 3 seconds
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
            }
        }, 300);
    }, 3000);
}

function checkForUpdates() {
    // Check for extension updates
    const currentVersion = chrome.runtime.getManifest().version;
    chrome.storage.local.get(['lastUpdateCheck'], (result) => {
        const lastCheck = result.lastUpdateCheck || 0;
        const now = Date.now();
        
        // Check for updates once per day
        if (now - lastCheck > 24 * 60 * 60 * 1000) {
            chrome.storage.local.set({ lastUpdateCheck: now });
            
            // In a real app, this would check a remote server
            console.log('Checking for updates...');
        }
    });
}

function showHelpModal() {
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h2>🚀 Jupiter Social Trader Help</h2>
                <button class="modal-close">&times;</button>
            </div>
            <div class="modal-body">
                <div class="help-section">
                    <h3>📖 How to Use</h3>
                    <ol>
                        <li>Visit any website with crypto content (Twitter, Discord, Reddit, etc.)</li>
                        <li>Highlight text mentioning tokens or press <kbd>Ctrl+Shift+L</kbd> for Lens mode</li>
                        <li>Right-click and select "🚀 Analyze with Jupiter AI"</li>
                        <li>View AI analysis, sentiment, and trading suggestions</li>
                    </ol>
                </div>
                
                <div class="help-section">
                    <h3>🔍 Lens Mode</h3>
                    <p>Activate Google Lens-style scanning to analyze any element on the page:</p>
                    <ul>
                        <li>Press <kbd>Ctrl+Shift+L</kbd> to activate</li>
                        <li>Click on text, images, or any element</li>
                        <li>OCR scanning for images coming soon</li>
                    </ul>
                </div>
                
                <div class="help-section">
                    <h3>🎯 Supported Tokens</h3>
                    <p>Any token available on Jupiter (Solana ecosystem)</p>
                    <div class="token-examples">
                        <span class="token-tag">$SOL</span>
                        <span class="token-tag">$JUP</span>
                        <span class="token-tag">$BONK</span>
                        <span class="token-tag">$WIF</span>
                    </div>
                </div>
                
                <div class="help-section">
                    <h3>⚠️ Important Notes</h3>
                    <ul>
                        <li>Always do your own research before trading</li>
                        <li>AI suggestions are not financial advice</li>
                        <li>Consider risk levels and your investment strategy</li>
                        <li>Test with small amounts first</li>
                    </ul>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Close modal handlers
    modal.addEventListener('click', (e) => {
        if (e.target === modal || e.target.classList.contains('modal-close')) {
            modal.remove();
        }
    });
}

function showAboutModal() {
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h2>🚀 About Jupiter Social Trader</h2>
                <button class="modal-close">&times;</button>
            </div>
            <div class="modal-body">
                <div class="about-info">
                    <div class="version-info">
                        <h3>Version 2.0.0</h3>
                        <p>AI-Powered DeFi Social Trading Assistant</p>
                    </div>
                    
                    <div class="features-list">
                        <h3>🛠️ Built With</h3>
                        <ul>
                            <li>Jupiter API v6 for real-time data</li>
                            <li>Advanced AI sentiment analysis</li>
                            <li>Google Lens-style OCR scanning</li>
                            <li>LangChain integration (coming soon)</li>
                            <li>Modern React-like UI components</li>
                        </ul>
                    </div>
                    
                    <div class="credits">
                        <h3>🙏 Credits</h3>
                        <p>Built for the Solana and DeFi community</p>
                        <p>Powered by Jupiter Exchange</p>
                    </div>
                    
                    <div class="disclaimer">
                        <h3>⚠️ Disclaimer</h3>
                        <p>This tool is for educational and research purposes only. 
                        Not financial advice. Always do your own research before making investment decisions.</p>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Close modal handlers
    modal.addEventListener('click', (e) => {
        if (e.target === modal || e.target.classList.contains('modal-close')) {
            modal.remove();
        }
    });
}

function loadUserData() {
    chrome.storage.local.get(['userStats', 'tradingCart', 'analysisHistory'], (result) => {
        if (result.userStats) {
            updateStatsDisplay(result.userStats);
        }
        
        if (result.tradingCart) {
            updateCartCount(result.tradingCart.length);
        }
        
        if (result.analysisHistory) {
            updateRecentActivity(result.analysisHistory);
        }
    });
}

function updateStats() {
    chrome.storage.local.get(['analysisHistory'], (result) => {
        const history = result.analysisHistory || [];
        const tokensAnalyzed = history.length;
        
        document.getElementById('tokensAnalyzed').textContent = tokensAnalyzed;
        
        // Calculate success rate based on positive vs negative sentiments
        if (tokensAnalyzed > 0) {
            const positiveAnalyses = history.filter(item => 
                item.sentiment && item.sentiment.toLowerCase() === 'positive'
            ).length;
            const successRate = Math.round((positiveAnalyses / tokensAnalyzed) * 100);
            document.getElementById('successRate').textContent = successRate + '%';
        }
    });
}

function updateStatsDisplay(stats) {
    if (stats.tokensAnalyzed) {
        document.getElementById('tokensAnalyzed').textContent = stats.tokensAnalyzed;
    }
    if (stats.successRate) {
        document.getElementById('successRate').textContent = stats.successRate + '%';
    }
}

function updateCartCount(count) {
    document.getElementById('cartCount').textContent = count || 0;
}

function updateRecentActivity(history = null) {
    if (!history) {
        chrome.storage.local.get(['analysisHistory'], (result) => {
            updateRecentActivity(result.analysisHistory || []);
        });
        return;
    }
    
    const activityContainer = document.getElementById('recentActivity');
    
    if (history.length === 0) {
        activityContainer.innerHTML = `
            <div class="activity-empty">
                <p>No recent activity. Start analyzing content to see your trading history!</p>
            </div>
        `;
        return;
    }
    
    // Show last 5 activities
    const recentActivities = history.slice(-5).reverse();
    
    activityContainer.innerHTML = recentActivities.map(activity => `
        <div class="activity-item">
            <div class="activity-main">
                <div class="activity-token">$${activity.symbol || 'UNKNOWN'}</div>
                <div class="activity-time">${formatTime(activity.timestamp)}</div>
            </div>
            <div class="activity-sentiment ${(activity.sentiment || 'neutral').toLowerCase()}">
                ${getSentimentIcon(activity.sentiment)} ${activity.sentiment || 'NEUTRAL'}
            </div>
        </div>
    `).join('');
}

function formatTime(timestamp) {
    const now = Date.now();
    const diff = now - timestamp;
    
    if (diff < 60000) { // Less than 1 minute
        return 'Just now';
    } else if (diff < 3600000) { // Less than 1 hour
        const minutes = Math.floor(diff / 60000);
        return `${minutes}m ago`;
    } else if (diff < 86400000) { // Less than 1 day
        const hours = Math.floor(diff / 3600000);
        return `${hours}h ago`;
    } else {
        const days = Math.floor(diff / 86400000);
        return `${days}d ago`;
    }
}

function getSentimentIcon(sentiment) {
    const icons = {
        'positive': '📈',
        'negative': '📉',
        'neutral': '⚖️',
        'POSITIVE': '📈',
        'NEGATIVE': '📉',
        'NEUTRAL': '⚖️'    };
    return icons[sentiment] || '❓';
}

// Test OCR functionality
function testOCRFunctionality() {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        chrome.tabs.sendMessage(tabs[0].id, {
            action: 'testOCR'
        }, (response) => {
            if (response && response.success) {
                showNotification('OCR test completed! Check console for details.');
            } else {
                showNotification('OCR test failed. Please refresh the page and try again.', 'error');
            }
        });
    });
}

// Scan current page for crypto content
function scanCurrentPageForCrypto() {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        showNotification('Scanning page for crypto content...', 'info');
        
        chrome.tabs.sendMessage(tabs[0].id, {
            action: 'scanPageForCrypto'
        }, (response) => {
            if (response && response.success) {
                const count = response.imagesFound || 0;
                showNotification(`Found ${count} images to analyze. Check the page for results!`);
                
                // Update stats
                updateStats();
            } else {
                showNotification('No crypto content found on this page.', 'warning');
            }
        });
    });
}

// Listen for storage changes to update UI
chrome.storage.onChanged.addListener((changes, namespace) => {
    if (namespace === 'local') {
        if (changes.tradingCart) {
            updateCartCount(changes.tradingCart.newValue?.length || 0);
        }
        
        if (changes.analysisHistory) {
            updateRecentActivity();
            updateStats();
        }
    }
});

// Add required CSS styles for new UI elements
const popupStyles = document.createElement('style');
popupStyles.textContent = `
    .popup-notification {
        position: fixed;
        top: 10px;
        right: 10px;
        background: #4f46e5;
        color: white;
        padding: 12px 16px;
        border-radius: 8px;
        font-size: 14px;
        font-weight: 500;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        transform: translateX(100%);
        opacity: 0;
        transition: all 0.3s ease;
        z-index: 1000;
    }
    
    .popup-notification.show {
        transform: translateX(0);
        opacity: 1;
    }
    
    .popup-notification.error { background: #dc2626; }
    .popup-notification.success { background: #059669; }
    .popup-notification.warning { background: #d97706; }
    
    .modal-overlay {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.7);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 1001;
    }
    
    .modal-content {
        background: white;
        border-radius: 12px;
        max-width: 500px;
        max-height: 80vh;
        overflow-y: auto;
        box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
    }
    
    .modal-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 20px 24px;
        border-bottom: 1px solid #e5e7eb;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        border-radius: 12px 12px 0 0;
    }
    
    .modal-close {
        background: none;
        border: none;
        color: white;
        font-size: 24px;
        cursor: pointer;
        padding: 0;
        width: 32px;
        height: 32px;
        border-radius: 6px;
        transition: background 0.2s ease;
    }
    
    .modal-close:hover { background: rgba(255, 255, 255, 0.2); }
    
    .modal-body { padding: 24px; }
    .help-section { margin-bottom: 24px; }
    .help-section h3 { margin: 0 0 12px 0; font-size: 16px; font-weight: 600; }
    .token-tag { 
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        padding: 4px 10px;
        border-radius: 12px;
        font-size: 12px;
        font-weight: 600;
        margin: 2px;
    }
    
    .status-indicator {
        font-size: 12px;
        font-weight: 500;
        padding: 4px 8px;
        border-radius: 12px;
        margin-left: 12px;
    }
    
    .btn.btn-outline {
        background: transparent;
        border: 1px solid #e5e7eb;
        color: #374151;
    }
`;
document.head.appendChild(popupStyles);

// Test OCR functionality
function testOCRFunctionality() {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        chrome.tabs.sendMessage(tabs[0].id, {
            action: 'testOCR'
        }, (response) => {
            if (response && response.success) {
                showNotification('OCR test completed! Check console for details.', 'success');
                // Update OCR results
                if (response.results) {
                    updateOCRResults(response.results);
                }
            } else {
                showNotification('OCR test failed. Please refresh the page and try again.', 'error');
            }
        });
    });
}

// Utility functions
function formatTime(timestamp) {
    const now = Date.now();
    const diff = now - timestamp;
    
    if (diff < 60000) { // Less than 1 minute
        return 'Just now';
    } else if (diff < 3600000) { // Less than 1 hour
        const minutes = Math.floor(diff / 60000);
        return `${minutes}m ago`;
    } else if (diff < 86400000) { // Less than 1 day
        const hours = Math.floor(diff / 3600000);
        return `${hours}h ago`;
    } else {        const days = Math.floor(diff / 86400000);
        return `${days}d ago`;
    }
}

function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `popup-notification ${type}`;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    // Show notification
    setTimeout(() => {
        notification.classList.add('show');
    }, 10);
    
    // Hide notification after 3 seconds
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
            }
        }, 300);
    }, 3000);
}

function loadUserData() {
    chrome.storage.local.get(['userStats', 'analysisHistory', 'ocrHistory'], (result) => {
        if (result.analysisHistory) {
            updateRecentAnalysis();
        }
        
        if (result.ocrHistory) {
            updateOCRResults(result.ocrHistory);
        }
    });
}

function checkForUpdates() {
    // Check for extension updates
    const currentVersion = chrome.runtime.getManifest().version;
    chrome.storage.local.get(['lastUpdateCheck'], (result) => {
        const lastCheck = result.lastUpdateCheck || 0;
        const now = Date.now();
        
        // Check for updates once per day
        if (now - lastCheck > 24 * 60 * 60 * 1000) {
            chrome.storage.local.set({ lastUpdateCheck: now });
            console.log('Checking for updates...');
        }
    });
}

// Listen for storage changes to update UI
chrome.storage.onChanged.addListener((changes, namespace) => {
    if (namespace === 'local') {
        if (changes.analysisHistory) {
            updateRecentAnalysis();
        }
        
        if (changes.ocrHistory) {
            updateOCRResults(changes.ocrHistory.newValue);
        }
        
        if (changes.connectedWallet || changes.walletAddress) {
            checkWalletConnection();
        }
    }
});

console.log('✅ Jupiter Social Trader v2.0 - Popup script loaded successfully');
