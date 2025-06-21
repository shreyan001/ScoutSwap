// Test Suite for Jupiter Social Trader Chrome Extension

// Test the token extraction function
function testTokenExtraction() {
    console.log('Testing token extraction...');
    
    const testTexts = [
        "$SOL is going to the moon! 🚀",
        "Bullish on $JUP and $BONK today",
        "Time to DCA into $RAY before the pump",
        "No tokens mentioned here",
        "$BTC $ETH $SOL all looking strong",
    ];
    
    testTexts.forEach((text, index) => {
        console.log(`Test ${index + 1}: "${text}"`);
        
        // Simulate the token extraction logic from background.js
        const tokenRegex = /\$([A-Z]{2,10})\b/g;
        const matches = [];
        let match;
        
        while ((match = tokenRegex.exec(text)) !== null) {
            matches.push({
                symbol: match[1],
                position: match.index,
                fullMatch: match[0]
            });
        }
        
        console.log('Found tokens:', matches);
        console.log('---');
    });
}

// Test the sentiment analysis function
function testSentimentAnalysis() {
    console.log('Testing sentiment analysis...');
    
    const testTexts = [
        "SOL is bullish and ready to moon!",
        "This coin is going to dump hard",
        "JUP is trading sideways today",
        "Time to buy the dip and accumulate",
        "Major crash incoming, sell everything",
    ];
    
    testTexts.forEach((text, index) => {
        console.log(`Test ${index + 1}: "${text}"`);
        
        // Simulate sentiment analysis from background.js
        const positiveWords = ['bullish', 'moon', 'pump', 'buy', 'long', 'dca', 'accumulate', 'breakout', 'rally'];
        const negativeWords = ['bearish', 'dump', 'sell', 'short', 'crash', 'drop', 'exit', 'warning'];
        
        const lowercaseText = text.toLowerCase();
        let sentiment = 'neutral';
        let confidence = 0;
        
        const positiveCount = positiveWords.filter(word => lowercaseText.includes(word)).length;
        const negativeCount = negativeWords.filter(word => lowercaseText.includes(word)).length;
        
        if (positiveCount > negativeCount) {
            sentiment = 'positive';
            confidence = Math.min(positiveCount / (positiveCount + negativeCount), 1);
        } else if (negativeCount > positiveCount) {
            sentiment = 'negative';
            confidence = Math.min(negativeCount / (positiveCount + negativeCount), 1);
        }
        
        console.log(`Sentiment: ${sentiment}, Confidence: ${confidence.toFixed(2)}`);
        console.log('---');
    });
}

// Test Jupiter API integration (mock)
function testJupiterAPI() {
    console.log('Testing Jupiter API integration...');
    
    // This would normally make actual API calls
    // For testing, we'll simulate the expected responses
    
    const mockTokenData = {
        success: true,
        data: {
            token: {
                address: 'So11111111111111111111111111111111111111112',
                name: 'Wrapped SOL',
                symbol: 'SOL',
                decimals: 9
            },
            price: 95.42,
            priceData: {
                price: 95.42,
                confidence: 0.99
            }
        }
    };
    
    console.log('Mock Jupiter API response for SOL:');
    console.log(JSON.stringify(mockTokenData, null, 2));
}

// Test Chrome storage simulation
function testChromeStorage() {
    console.log('Testing Chrome storage simulation...');
    
    // Simulate storing and retrieving data
    const mockStorage = {};
    
    // Simulate storing user settings
    const userSettings = {
        autoAnalysis: true,
        riskLevel: 'moderate',
        defaultSlippage: 50
    };
    
    mockStorage.userSettings = userSettings;
    console.log('Stored settings:', userSettings);
    
    // Simulate storing analysis history
    const analysisHistory = [
        {
            symbol: 'SOL',
            sentiment: 'POSITIVE',
            timestamp: Date.now() - 3600000, // 1 hour ago
            suggestion: 'Strong buy signal'
        },
        {
            symbol: 'JUP',
            sentiment: 'NEUTRAL',
            timestamp: Date.now() - 1800000, // 30 minutes ago
            suggestion: 'Wait for clearer signals'
        }
    ];
    
    mockStorage.analysisHistory = analysisHistory;
    console.log('Stored analysis history:', analysisHistory);
}

// Test the complete workflow
function testCompleteWorkflow() {
    console.log('Testing complete workflow...');
    
    const selectedText = "$SOL is looking bullish after breaking resistance!";
    console.log(`Selected text: "${selectedText}"`);
    
    // Step 1: Extract tokens
    const tokenRegex = /\$([A-Z]{2,10})\b/g;
    const tokens = [];
    let match;
    
    while ((match = tokenRegex.exec(selectedText)) !== null) {
        tokens.push({
            symbol: match[1],
            position: match.index,
            fullMatch: match[0]
        });
    }
    
    console.log('Step 1 - Extracted tokens:', tokens);
    
    // Step 2: Analyze sentiment
    const positiveWords = ['bullish', 'moon', 'pump', 'buy', 'long', 'dca', 'accumulate', 'breakout', 'rally'];
    const negativeWords = ['bearish', 'dump', 'sell', 'short', 'crash', 'drop', 'exit', 'warning'];
    
    const lowercaseText = selectedText.toLowerCase();
    const positiveCount = positiveWords.filter(word => lowercaseText.includes(word)).length;
    const negativeCount = negativeWords.filter(word => lowercaseText.includes(word)).length;
    
    let sentiment = 'neutral';
    let confidence = 0;
    
    if (positiveCount > negativeCount) {
        sentiment = 'positive';
        confidence = Math.min(positiveCount / (positiveCount + negativeCount), 1);
    }
    
    console.log('Step 2 - Sentiment analysis:', { sentiment, confidence });
    
    // Step 3: Generate trading suggestion
    const suggestions = {
        positive: {
            text: "Strong bullish signal detected. Consider a moderate position with proper risk management.",
            risk: "MEDIUM"
        },
        negative: {
            text: "Bearish sentiment detected. Consider waiting or taking profits if you hold this token.",
            risk: "HIGH"
        },
        neutral: {
            text: "Neutral sentiment. Monitor for clearer signals before making decisions.",
            risk: "MEDIUM"
        }
    };
    
    const tradingSuggestion = suggestions[sentiment];
    console.log('Step 3 - Trading suggestion:', tradingSuggestion);
    
    // Step 4: Mock price data
    const mockPriceData = {
        price: 95.42,
        confidence: 0.99,
        volume24h: 1250000000
    };
    
    console.log('Step 4 - Mock price data:', mockPriceData);
    
    console.log('Complete workflow test completed successfully!');
}

// Run all tests
function runAllTests() {
    console.log('=== Jupiter Social Trader Test Suite ===\n');
    
    testTokenExtraction();
    console.log('\n');
    
    testSentimentAnalysis();
    console.log('\n');
    
    testJupiterAPI();
    console.log('\n');
    
    testChromeStorage();
    console.log('\n');
    
    testCompleteWorkflow();
    console.log('\n');
    
    console.log('=== All Tests Completed ===');
}

// Export for use in browser console or Node.js
if (typeof window !== 'undefined') {
    // Browser environment
    window.jupiterTests = {
        runAllTests,
        testTokenExtraction,
        testSentimentAnalysis,
        testJupiterAPI,
        testChromeStorage,
        testCompleteWorkflow
    };
    
    console.log('Jupiter Social Trader tests loaded. Run jupiterTests.runAllTests() to execute all tests.');
} else if (typeof module !== 'undefined' && module.exports) {
    // Node.js environment
    module.exports = {
        runAllTests,
        testTokenExtraction,
        testSentimentAnalysis,
        testJupiterAPI,
        testChromeStorage,
        testCompleteWorkflow
    };
}

// Auto-run tests if this file is executed directly
if (typeof window === 'undefined' && require.main === module) {
    runAllTests();
}
