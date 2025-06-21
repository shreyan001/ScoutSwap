// Jupiter Social Trader - Simple Popup Script v2.0
console.log('🚀 Jupiter Social Trader v2.0 - Popup loaded');

// Global state
let walletConnected = false;
let walletAddress = null;
let walletProvider = null;

document.addEventListener('DOMContentLoaded', function() {
    initializePopup();
    setupEventListeners();
    checkWalletConnection();
});

function initializePopup() {
    console.log('Initializing popup...');
    
    // Load saved wallet state
    chrome.storage.local.get(['connectedWallet', 'walletAddress'], (result) => {
        if (result.connectedWallet && result.walletAddress) {
            console.log('Found saved wallet connection:', result.connectedWallet);
            updateWalletDisplay(true, result.connectedWallet, result.walletAddress);
        }
    });
    
    updateStatus('Ready');
}

function setupEventListeners() {
    // Connect wallet button
    const connectBtn = document.getElementById('connect-wallet-btn');
    if (connectBtn) {
        connectBtn.addEventListener('click', handleConnectWallet);
    }
    
    // Disconnect wallet button
    const disconnectBtn = document.getElementById('disconnect-wallet-btn');
    if (disconnectBtn) {
        disconnectBtn.addEventListener('click', handleDisconnectWallet);
    }
    
    // Refresh balance button
    const refreshBtn = document.getElementById('refresh-balance-btn');
    if (refreshBtn) {
        refreshBtn.addEventListener('click', handleRefreshBalance);
    }
}

async function handleConnectWallet() {
    console.log('Attempting to connect wallet...');
    updateStatus('Connecting wallet...');
    
    try {
        // Send message to content script to connect wallet
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        
        const response = await chrome.tabs.sendMessage(tab.id, {
            action: 'connectWallet'
        });
        
        if (response && response.success) {
            console.log('Wallet connected successfully:', response);
            
            // Save wallet info
            await chrome.storage.local.set({
                connectedWallet: response.provider,
                walletAddress: response.address
            });
            
            // Update UI
            updateWalletDisplay(true, response.provider, response.address);
            updateStatus('Wallet connected');
            
            // Fetch balance
            await fetchWalletBalance(response.address);
            
        } else {
            console.error('Failed to connect wallet:', response?.error);
            updateStatus('Connection failed');
            showError(response?.error || 'Failed to connect wallet');
        }
    } catch (error) {
        console.error('Error connecting wallet:', error);
        updateStatus('Connection error');
        showError('Unable to connect to wallet. Make sure you have a Solana wallet extension installed.');
    }
}

async function handleDisconnectWallet() {
    console.log('Disconnecting wallet...');
    
    try {
        // Clear stored wallet info
        await chrome.storage.local.remove(['connectedWallet', 'walletAddress']);
        
        // Update UI
        updateWalletDisplay(false);
        updateStatus('Wallet disconnected');
        
        console.log('Wallet disconnected successfully');
    } catch (error) {
        console.error('Error disconnecting wallet:', error);
    }
}

async function handleRefreshBalance() {
    if (!walletAddress) {
        console.warn('No wallet address to refresh balance for');
        return;
    }
    
    console.log('Refreshing wallet balance...');
    updateStatus('Refreshing balance...');
    
    await fetchWalletBalance(walletAddress);
}

async function fetchWalletBalance(address) {
    try {
        console.log('Fetching balance for address:', address);
        
        // Use Solana public RPC to get balance
        const response = await fetch('https://api.mainnet-beta.solana.com', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                jsonrpc: '2.0',
                id: 1,
                method: 'getBalance',
                params: [address]
            })
        });
        
        const data = await response.json();
        
        if (data.result) {
            // Convert lamports to SOL (1 SOL = 1,000,000,000 lamports)
            const balanceSOL = data.result.value / 1e9;
            console.log('Balance fetched:', balanceSOL, 'SOL');
            
            updateBalanceDisplay(balanceSOL);
            updateStatus('Balance updated');
        } else {
            console.error('Failed to fetch balance:', data.error);
            updateStatus('Balance fetch failed');
        }
    } catch (error) {
        console.error('Error fetching balance:', error);
        updateStatus('Balance fetch error');
    }
}

function updateWalletDisplay(connected, provider = null, address = null) {
    const disconnectedSection = document.getElementById('wallet-disconnected');
    const connectedSection = document.getElementById('wallet-connected');
    const addressElement = document.getElementById('wallet-address-text');
    
    if (connected && provider && address) {
        // Show connected state
        if (disconnectedSection) disconnectedSection.style.display = 'none';
        if (connectedSection) connectedSection.style.display = 'block';
        
        // Update address display
        if (addressElement) {
            const shortAddress = `${address.substring(0, 8)}...${address.substring(address.length - 8)}`;
            addressElement.textContent = shortAddress;
            addressElement.title = address; // Show full address on hover
        }
        
        // Store state
        walletConnected = true;
        walletAddress = address;
        walletProvider = provider;
        
        console.log('Wallet display updated to connected state');
    } else {
        // Show disconnected state
        if (disconnectedSection) disconnectedSection.style.display = 'block';
        if (connectedSection) connectedSection.style.display = 'none';
        
        // Clear state
        walletConnected = false;
        walletAddress = null;
        walletProvider = null;
        
        console.log('Wallet display updated to disconnected state');
    }
}

function updateBalanceDisplay(balance) {
    const balanceElement = document.getElementById('sol-balance');
    if (balanceElement) {
        balanceElement.textContent = balance.toFixed(4);
    }
}

function updateStatus(status) {
    const statusElement = document.getElementById('extension-status');
    if (statusElement) {
        statusElement.textContent = status;
        
        // Update last activity
        const lastActivityElement = document.getElementById('last-activity');
        if (lastActivityElement) {
            const now = new Date();
            const timeString = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            lastActivityElement.textContent = timeString;
        }
    }
}

function showError(message) {
    console.error('Error:', message);
    // You could implement a toast notification system here
    // For now, we'll just log and update status
    updateStatus(`Error: ${message}`);
}

async function checkWalletConnection() {
    console.log('Checking existing wallet connection...');
    
    try {
        const result = await chrome.storage.local.get(['connectedWallet', 'walletAddress']);
        
        if (result.connectedWallet && result.walletAddress) {
            console.log('Found existing wallet connection');
            updateWalletDisplay(true, result.connectedWallet, result.walletAddress);
            
            // Try to fetch current balance
            await fetchWalletBalance(result.walletAddress);
        } else {
            console.log('No existing wallet connection found');
        }
    } catch (error) {
        console.error('Error checking wallet connection:', error);
    }
}

// Export functions for debugging (optional)
if (typeof window !== 'undefined') {
    window.jupiterPopup = {
        connectWallet: handleConnectWallet,
        disconnectWallet: handleDisconnectWallet,
        refreshBalance: handleRefreshBalance,
        getWalletInfo: () => ({ connected: walletConnected, address: walletAddress, provider: walletProvider })
    };
}
