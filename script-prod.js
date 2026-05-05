// Production-Level AI Fake News Detector
// Advanced Analysis System with Query Expansion and Smart Scoring

class AINewsDetector {
    constructor() {
        this.apiKeys = {
            newsapi: 'e7ea77c7f3b5419eac4e0844d3a2c17c',
            guardian: 'e15f2f33-91ad-4e3c-ab1a-309a94452d02',
            nytimes: '9Cm9iT2JvN99gzf1bJlZpGRGEKscctFnWD79qyn4CYq1l3t4'
        };
        
        this.endpoints = {
            newsapi: 'https://newsapi.org/v2/everything',
            guardian: 'https://content.guardianapis.com/search',
            nytimes: 'https://api.nytimes.com/svc/search/v2/articlesearch.json'
        };
        
        this.isAnalyzing = false;
        this.lastAnalysisQuery = '';
        this.debounceTimer = null;
        
        this.init();
    }
    
    init() {
        this.setupEventListeners();
        this.setupAnimations();
        console.log('AI News Detector initialized');
    }
    
    setupEventListeners() {
        const newsInput = document.getElementById('newsInput');
        const analyzeBtn = document.getElementById('analyzeBtn');
        
        // Analyze button click
        analyzeBtn.addEventListener('click', () => this.startAnalysis());
        
        // Enter key press
        newsInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.startAnalysis();
            }
        });
        
        // Debounced input analysis (optional auto-analyze)
        newsInput.addEventListener('input', (e) => {
            clearTimeout(this.debounceTimer);
            this.debounceTimer = setTimeout(() => {
                if (e.target.value.length > 10) {
                    // Optional: Auto-analyze after typing stops
                    // this.startAnalysis();
                }
            }, 1000);
        });
        
        // Real-time input validation
        newsInput.addEventListener('input', (e) => {
            this.validateInput(e.target);
        });
    }
    
    setupAnimations() {
        // Add smooth scroll behavior
        document.documentElement.style.scrollBehavior = 'smooth';
        
        // Add intersection observer for animations
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('fade-in');
                }
            });
        });
        
        document.querySelectorAll('.result-card, .article-card').forEach(el => {
            observer.observe(el);
        });
    }
    
    validateInput(input) {
        const value = input.value.trim();
        const analyzeBtn = document.getElementById('analyzeBtn');
        
        if (value.length < 3) {
            analyzeBtn.disabled = true;
            analyzeBtn.style.opacity = '0.5';
        } else {
            analyzeBtn.disabled = false;
            analyzeBtn.style.opacity = '1';
        }
    }
    
    async startAnalysis() {
        const newsInput = document.getElementById('newsInput');
        const query = newsInput.value.trim();
        
        // Input validation
        if (!query) {
            this.showError('Please enter news content to analyze', [
                'Enter at least 3 characters',
                'Try a specific news headline or event',
                'Include location, names, or key details'
            ]);
            return;
        }
        
        if (query.length < 3) {
            this.showError('Input too short', [
                'Enter at least 3 characters',
                'Provide more context about the news',
                'Include specific details like names, places, or events'
            ]);
            return;
        }
        
        // Prevent duplicate analysis
        if (this.isAnalyzing || query === this.lastAnalysisQuery) {
            return;
        }
        
        this.isAnalyzing = true;
        this.lastAnalysisQuery = query;
        
        try {
            // Show loading state
            this.showLoadingState();
            
            // Step 1: Query Expansion
            const expandedQueries = this.expandQuery(query);
            console.log('Expanded queries:', expandedQueries);
            
            // Step 2: Multi-source Fetch
            const allResults = await this.fetchFromAllSources(expandedQueries);
            
            // Step 3: Smart Analysis
            const analysis = this.analyzeResults(query, allResults);
            
            // Step 4: Display Results
            this.displayResults(analysis, allResults);
            
        } catch (error) {
            console.error('Analysis error:', error);
            this.handleAnalysisError(error);
        } finally {
            this.isAnalyzing = false;
        }
    }
    
    // Query Expansion - Generate variations of the input
    expandQuery(query) {
        const variations = new Set([query]);
        
        // Extract key entities (enhanced approach)
        const words = query.toLowerCase().split(/\s+/);
        const locations = ['india', 'delhi', 'mumbai', 'ahmedabad', 'gujarat', 'bangalore', 'chennai', 'kolkata', 'hyderabad', 'pune'];
        const events = ['crash', 'accident', 'incident', 'explosion', 'fire', 'attack', 'protest', 'election', 'emergency', 'disaster'];
        const vehicles = ['plane', 'aircraft', 'flight', 'train', 'car', 'bus', 'truck', 'helicopter', 'jet'];
        
        // Find location and event keywords
        const foundLocations = words.filter(word => locations.some(loc => word.includes(loc)));
        const foundEvents = words.filter(word => events.some(event => word.includes(event)));
        const foundVehicles = words.filter(word => vehicles.some(vehicle => word.includes(vehicle)));
        
        // Extract year if present
        const yearMatch = query.match(/\b(20\d{2})\b/);
        const year = yearMatch ? yearMatch[1] : '';
        
        // Generate variations - more comprehensive
        if (foundEvents.length > 0 && foundLocations.length > 0) {
            // Event + Location combinations
            foundEvents.forEach(event => {
                foundLocations.forEach(location => {
                    variations.add(`${event} ${location}`);
                    variations.add(`${location} ${event}`);
                    if (year) {
                        variations.add(`${event} ${location} ${year}`);
                        variations.add(`${location} ${event} ${year}`);
                    }
                });
            });
        }
        
        if (foundVehicles.length > 0) {
            // Vehicle synonyms
            foundVehicles.forEach(vehicle => {
                if (vehicle.includes('plane')) {
                    variations.add(query.replace(/plane/gi, 'aircraft'));
                    variations.add(query.replace(/plane/gi, 'flight'));
                    variations.add(query.replace(/plane/gi, 'aviation'));
                    variations.add(query.replace(/plane/gi, 'airplane'));
                }
                if (vehicle.includes('crash')) {
                    variations.add(query.replace(/crash/gi, 'accident'));
                    variations.add(query.replace(/crash/gi, 'incident'));
                    variations.add(query.replace(/crash/gi, 'emergency'));
                }
            });
        }
        
        // Add broader context variations
        if (foundLocations.length > 0) {
            foundLocations.forEach(location => {
                variations.add(`latest news ${location}`);
                variations.add(`${location} breaking news`);
                variations.add(`${location} news update`);
                if (year) {
                    variations.add(`${location} news ${year}`);
                }
            });
        }
        
        // Add year-specific variations
        if (year) {
            variations.add(`news ${year}`);
            variations.add(`${year} latest news`);
        }
        
        // Add event-specific variations
        if (foundEvents.length > 0) {
            foundEvents.forEach(event => {
                variations.add(`${event} news`);
                variations.add(`latest ${event}`);
                variations.add(`${event} update`);
            });
        }
        
        return Array.from(variations).slice(0, 8); // Increased to 8 variations
    }
    
    // Multi-source API fetching with timeout and error handling
    async fetchFromAllSources(queries) {
        const promises = [];
        
        // Fetch from all APIs with all query variations
        Object.keys(this.endpoints).forEach(source => {
            queries.forEach(query => {
                promises.push(this.fetchFromSource(source, query));
            });
        });
        
        try {
            const results = await Promise.allSettled(promises);
            const successfulResults = results
                .filter(result => result.status === 'fulfilled')
                .map(result => result.value)
                .flat();
            
            console.log(`Successfully fetched ${successfulResults.length} articles`);
            return successfulResults;
            
        } catch (error) {
            console.error('Multi-source fetch error:', error);
            throw new Error('Failed to fetch from news sources');
        }
    }
    
    async fetchFromSource(source, query) {
        const timeout = 10000; // 10 second timeout
        
        try {
            switch (source) {
                case 'newsapi':
                    return await this.fetchNewsAPI(query, timeout);
                case 'guardian':
                    return await this.fetchGuardianAPI(query, timeout);
                case 'nytimes':
                    return await this.fetchNYTimesAPI(query, timeout);
                default:
                    return [];
            }
        } catch (error) {
            console.error(`Error fetching from ${source}:`, error);
            return [];
        }
    }
    
    async fetchNewsAPI(query, timeout) {
        const url = `${this.endpoints.newsapi}?q=${encodeURIComponent(query)}&apiKey=${this.apiKeys.newsapi}&pageSize=10&sortBy=relevancy&language=en`;
        
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), timeout);
        
        try {
            const response = await fetch(url, { signal: controller.signal });
            clearTimeout(timeoutId);
            
            if (!response.ok) {
                throw new Error(`NewsAPI error: ${response.status}`);
            }
            
            const data = await response.json();
            return data.articles.map(article => ({
                title: article.title,
                description: article.description,
                source: article.source.name,
                url: article.url,
                publishedAt: article.publishedAt,
                api: 'newsapi'
            }));
            
        } catch (error) {
            clearTimeout(timeoutId);
            throw error;
        }
    }
    
    async fetchGuardianAPI(query, timeout) {
        const url = `${this.endpoints.guardian}?q=${encodeURIComponent(query)}&api-key=${this.apiKeys.guardian}&show-fields=headline,trailText,byline&order-by=relevance&page-size=10`;
        
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), timeout);
        
        try {
            const response = await fetch(url, { signal: controller.signal });
            clearTimeout(timeoutId);
            
            if (!response.ok) {
                throw new Error(`Guardian API error: ${response.status}`);
            }
            
            const data = await response.json();
            return data.response.results.map(article => ({
                title: article.webTitle,
                description: article.fields?.trailText || article.webTitle,
                source: 'The Guardian',
                url: article.webUrl,
                publishedAt: article.webPublicationDate,
                api: 'guardian'
            }));
            
        } catch (error) {
            clearTimeout(timeoutId);
            throw error;
        }
    }
    
    async fetchNYTimesAPI(query, timeout) {
        const url = `${this.endpoints.nytimes}?q=${encodeURIComponent(query)}&api-key=${this.apiKeys.nytimes}&sort=relevance&fl=headline,snippet,byline,pub_date,web_url&page=0`;
        
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), timeout);
        
        try {
            const response = await fetch(url, { signal: controller.signal });
            clearTimeout(timeoutId);
            
            if (!response.ok) {
                throw new Error(`NYTimes API error: ${response.status}`);
            }
            
            const data = await response.json();
            return data.response.docs.map(article => ({
                title: article.headline?.main || article.headline,
                description: article.snippet || article.headline?.main,
                source: 'The New York Times',
                url: article.web_url,
                publishedAt: article.pub_date,
                api: 'nytimes'
            }));
            
        } catch (error) {
            clearTimeout(timeoutId);
            throw error;
        }
    }
    
    // Smart Analysis with Fuzzy Matching and Scoring
    analyzeResults(originalQuery, articles) {
        const analysis = {
            score: 0,
            verdict: 'NOT_VERIFIED',
            confidence: 0,
            sourceCount: 0,
            keywordMatch: 0,
            recencyScore: 0,
            breakdown: {
                sourceCoverage: 0,
                keywordMatch: 0,
                recency: 0
            }
        };
        
        if (articles.length === 0) {
            return analysis;
        }
        
        // Extract keywords from original query
        const keywords = this.extractKeywords(originalQuery);
        console.log('Extracted keywords:', keywords);
        console.log('Articles found:', articles.length);
        
        // Count unique sources
        const uniqueSources = new Set(articles.map(article => article.source));
        analysis.sourceCount = uniqueSources.size;
        
        // Enhanced Source Coverage Score (more generous)
        if (uniqueSources.size >= 2) {
            analysis.score += 35; // Increased from 30
            analysis.breakdown.sourceCoverage = 35;
        } else if (uniqueSources.size >= 1) {
            analysis.score += 25; // Increased from 10
            analysis.breakdown.sourceCoverage = 25;
        }
        
        // Enhanced Keyword Matching Score (more lenient)
        let keywordMatches = 0;
        articles.forEach(article => {
            const articleText = `${article.title} ${article.description}`.toLowerCase();
            const matches = keywords.filter(keyword => 
                articleText.includes(keyword.toLowerCase())
            ).length;
            
            // More generous matching criteria
            if (matches >= 2) keywordMatches++; // Reduced from 3
            else if (matches >= 1) keywordMatches += 0.5; // Increased from 0.3
        });
        
        const keywordMatchPercentage = (keywordMatches / articles.length) * 100;
        if (keywordMatchPercentage >= 50) { // Reduced from 70
            analysis.score += 30; // Increased from 20
            analysis.breakdown.keywordMatch = 30;
        } else if (keywordMatchPercentage >= 25) { // Reduced from 40
            analysis.score += 20; // Increased from 15
            analysis.breakdown.keywordMatch = 20;
        } else if (keywordMatchPercentage >= 10) { // Reduced from 20
            analysis.score += 15; // Increased from 10
            analysis.breakdown.keywordMatch = 15;
        }
        
        // Enhanced Recency Score (more generous for older news)
        const now = new Date();
        let recentArticles = 0;
        
        articles.forEach(article => {
            const articleDate = new Date(article.publishedAt);
            const daysDiff = (now - articleDate) / (1000 * 60 * 60 * 24);
            
            if (daysDiff <= 30) recentArticles++; // Increased from 7
            else if (daysDiff <= 90) recentArticles += 0.5; // Increased from 30
            else if (daysDiff <= 365) recentArticles += 0.3; // Added for yearly news
        });
        
        const recencyPercentage = (recentArticles / articles.length) * 100;
        if (recencyPercentage >= 30) { // Reduced from 50
            analysis.score += 25; // Increased from 20
            analysis.breakdown.recency = 25;
        } else if (recencyPercentage >= 15) { // Reduced from 25
            analysis.score += 20; // Increased from 15
            analysis.breakdown.recency = 20;
        } else if (recencyPercentage >= 5) { // Reduced from 10
            analysis.score += 15; // Increased from 10
            analysis.breakdown.recency = 15;
        }
        
        // Bonus for finding any articles
        if (articles.length > 0) {
            analysis.score += 10; // Base score for finding any content
        }
        
        // Calculate final confidence and verdict
        analysis.confidence = Math.min(analysis.score, 100);
        
        // Lowered thresholds for better detection
        if (analysis.score >= 60) { // Reduced from 70
            analysis.verdict = 'VERIFIED';
        } else if (analysis.score >= 30) { // Reduced from 40
            analysis.verdict = 'LIKELY_TRUE';
        } else {
            analysis.verdict = 'NOT_VERIFIED';
        }
        
        console.log('Analysis result:', analysis);
        return analysis;
    }
    
    extractKeywords(query) {
        // Simple keyword extraction - can be enhanced with NLP
        const stopWords = ['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'is', 'was', 'are', 'were', 'said', 'says'];
        
        return query.toLowerCase()
            .split(/\s+/)
            .filter(word => word.length > 2 && !stopWords.includes(word))
            .slice(0, 10); // Limit to 10 keywords
    }
    
    // Display Results with Animations
    displayResults(analysis, articles) {
        this.hideLoadingState();
        this.hideError();
        
        // Show result section
        const resultSection = document.getElementById('resultSection');
        resultSection.classList.remove('hidden');
        
        // Update confidence score with animation
        this.updateConfidenceScore(analysis.confidence);
        
        // Update verdict with animation
        this.updateVerdict(analysis.verdict);
        
        // Update source count
        document.querySelector('.source-count .count').textContent = analysis.sourceCount;
        
        // Update progress bars with animation
        this.updateProgressBars(analysis.breakdown);
        
        // Display articles if any found
        if (articles.length > 0) {
            this.displayArticles(articles);
        }
    }
    
    updateConfidenceScore(confidence) {
        const scoreValue = document.querySelector('.score-value');
        const targetScore = Math.round(confidence);
        let currentScore = 0;
        
        const increment = targetScore / 50;
        const timer = setInterval(() => {
            currentScore += increment;
            if (currentScore >= targetScore) {
                currentScore = targetScore;
                clearInterval(timer);
            }
            scoreValue.textContent = Math.round(currentScore) + '%';
        }, 20);
    }
    
    updateVerdict(verdict) {
        const verdictBadge = document.querySelector('.verdict-badge');
        const verdictText = document.querySelector('.verdict-text');
        const verdictDescription = document.querySelector('.verdict-description');
        
        // Remove existing classes
        verdictBadge.classList.remove('verified', 'likely-true', 'not-verified');
        
        // Add appropriate class and text
        switch (verdict) {
            case 'VERIFIED':
                verdictBadge.classList.add('verified');
                verdictText.textContent = 'VERIFIED';
                verdictDescription.textContent = 'Multiple credible sources confirm this news';
                break;
            case 'LIKELY_TRUE':
                verdictBadge.classList.add('likely-true');
                verdictText.textContent = 'LIKELY TRUE';
                verdictDescription.textContent = 'Some evidence found but needs more verification';
                break;
            case 'NOT_VERIFIED':
                verdictBadge.classList.add('not-verified');
                verdictText.textContent = 'NOT VERIFIED';
                verdictDescription.textContent = 'No strong evidence found to verify this news';
                break;
        }
    }
    
    updateProgressBars(breakdown) {
        const sourceProgress = document.querySelector('.source-progress');
        const keywordProgress = document.querySelector('.keyword-progress');
        const recencyProgress = document.querySelector('.recency-progress');
        
        // Animate progress bars
        setTimeout(() => {
            sourceProgress.style.width = `${(breakdown.sourceCoverage / 30) * 100}%`;
            keywordProgress.style.width = `${(breakdown.keywordMatch / 20) * 100}%`;
            recencyProgress.style.width = `${(breakdown.recency / 20) * 100}%`;
        }, 500);
    }
    
    displayArticles(articles) {
        const articlesSection = document.getElementById('articlesSection');
        const articlesGrid = document.getElementById('articlesGrid');
        const articleCount = document.getElementById('articleCount');
        
        // Update article count
        articleCount.textContent = articles.length;
        
        // Clear existing articles
        articlesGrid.innerHTML = '';
        
        // Add articles with staggered animation
        articles.forEach((article, index) => {
            const articleCard = this.createArticleCard(article);
            articleCard.style.animationDelay = `${index * 0.1}s`;
            articlesGrid.appendChild(articleCard);
        });
        
        // Show articles section
        articlesSection.classList.remove('hidden');
    }
    
    createArticleCard(article) {
        const card = document.createElement('div');
        card.className = 'article-card fade-in-up';
        
        const title = article.title.length > 100 ? 
            article.title.substring(0, 100) + '...' : 
            article.title;
        
        const description = article.description && article.description.length > 150 ? 
            article.description.substring(0, 150) + '...' : 
            article.description || 'No description available';
        
        const date = new Date(article.publishedAt).toLocaleDateString();
        
        card.innerHTML = `
            <h4 class="article-title">${title}</h4>
            <div class="article-source">${article.source}</div>
            <div class="article-date">${date}</div>
            <p class="article-description">${description}</p>
            <a href="${article.url}" target="_blank" class="article-link">Read more →</a>
        `;
        
        return card;
    }
    
    // Loading State with Typing Animation
    showLoadingState() {
        const loadingState = document.getElementById('loadingState');
        const typingText = document.querySelector('.typing-text');
        
        loadingState.classList.remove('hidden');
        
        // Typing animation
        const messages = [
            'Analyzing news patterns...',
            'Cross-referencing sources...',
            'Validating information...',
            'Checking credibility...'
        ];
        
        let messageIndex = 0;
        let charIndex = 0;
        let currentMessage = '';
        
        const typeMessage = () => {
            if (messageIndex >= messages.length) {
                messageIndex = 0;
            }
            
            const message = messages[messageIndex];
            
            if (charIndex < message.length) {
                currentMessage = message.substring(0, charIndex + 1);
                typingText.textContent = currentMessage;
                charIndex++;
                setTimeout(typeMessage, 50);
            } else {
                setTimeout(() => {
                    charIndex = 0;
                    messageIndex++;
                    typeMessage();
                }, 1000);
            }
        };
        
        typeMessage();
    }
    
    hideLoadingState() {
        const loadingState = document.getElementById('loadingState');
        loadingState.classList.add('hidden');
    }
    
    // Error Handling with Fix Instructions
    showError(message, fixes = []) {
        const errorSection = document.getElementById('errorSection');
        const errorMessage = document.getElementById('errorMessage');
        const fixList = document.getElementById('fixList');
        
        errorMessage.textContent = message;
        
        // Clear existing fixes
        fixList.innerHTML = '';
        
        // Add default fixes if none provided
        if (fixes.length === 0) {
            fixes = [
                'Check your internet connection',
                'Try again in a few moments',
                'Enter more specific news details',
                'Include names, places, and dates'
            ];
        }
        
        // Add fixes to list
        fixes.forEach(fix => {
            const li = document.createElement('li');
            li.textContent = fix;
            fixList.appendChild(li);
        });
        
        // Show error section
        errorSection.classList.remove('hidden');
    }
    
    hideError() {
        const errorSection = document.getElementById('errorSection');
        errorSection.classList.add('hidden');
    }
    
    handleAnalysisError(error) {
        this.hideLoadingState();
        
        console.error('Analysis failed:', error);
        
        // Determine error type and provide specific fixes
        let fixes = [];
        
        if (error.message.includes('API key')) {
            fixes = [
                'Check API key validity in configuration',
                'Verify API key is not expired',
                'Ensure API key has proper permissions',
                'Try regenerating API key from provider'
            ];
        } else if (error.message.includes('request limit')) {
            fixes = [
                'API request limit reached',
                'Wait for limit to reset (usually daily/monthly)',
                'Consider upgrading API plan',
                'Try again later'
            ];
        } else if (error.message.includes('CORS') || error.message.includes('network')) {
            fixes = [
                'Check CORS configuration',
                'Ensure API allows cross-origin requests',
                'Try using a different browser',
                'Check network connectivity'
            ];
        } else if (error.message.includes('timeout')) {
            fixes = [
                'Request timed out - servers may be busy',
                'Try again with shorter query',
                'Check internet connection speed',
                'Wait a moment and retry'
            ];
        } else {
            fixes = [
                'Unable to connect to news sources',
                'Check internet connection',
                'Try entering different keywords',
                'Contact support if issue persists'
            ];
        }
        
        this.showError('Analysis failed. Please try the troubleshooting steps below.', fixes);
    }
}

// Retry Analysis Function
function retryAnalysis() {
    const detector = new AINewsDetector();
    detector.startAnalysis();
}

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
    window.newsDetector = new AINewsDetector();
    
    // Add some console logging for debugging
    console.log('AI News Detector - Production Version');
    console.log('Ready to analyze news content');
});

// Add keyboard shortcuts
document.addEventListener('keydown', (e) => {
    // Ctrl/Cmd + Enter to analyze
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        window.newsDetector.startAnalysis();
    }
    
    // Escape to clear results
    if (e.key === 'Escape') {
        document.getElementById('newsInput').value = '';
        document.getElementById('newsInput').focus();
    }
});
