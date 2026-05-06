// Main Application Logic for Fake News Detector
class FakeNewsDetector {
    constructor() {
        this.newsAPI = new NewsAPIService();
        this.isAnalyzing = false;
        
        // Hardcoded rules for specific content
        this.hardcodedRules = {
            fake: [
                {
                    pattern: /aliens.*landed.*earth/i,
                    reason: 'Claims about aliens landing on Earth'
                },
                {
                    pattern: /earth.*flat/i,
                    reason: 'Flat Earth conspiracy theory'
                },
                {
                    pattern: /moon.*landing.*fake/i,
                    reason: 'Moon landing conspiracy theory'
                },
                {
                    pattern: /vaccines.*cause.*autism/i,
                    reason: 'Disproven vaccine-autism link'
                },
                {
                    pattern: /chemtrails/i,
                    reason: 'Chemtrail conspiracy theory'
                },
                {
                    pattern: /illuminati.*control/i,
                    reason: 'Illuminati conspiracy theory'
                },
                {
                    pattern: /area.*51.*aliens/i,
                    reason: 'Area 51 alien conspiracy'
                },
                {
                    pattern: /bigfoot.*found/i,
                    reason: 'Bigfoot discovery claims'
                },
                {
                    pattern: /loch.*ness.*monster.*found/i,
                    reason: 'Loch Ness monster discovery claims'
                },
                {
                    pattern: /time.*travel.*invented/i,
                    reason: 'Time travel invention claims'
                }
            ],
            real: [
                {
                    pattern: /tiktok.*banned.*india/i,
                    reason: 'Verified news about TikTok ban in India'
                },
                {
                    pattern: /covid.*19.*pandemic/i,
                    reason: 'COVID-19 pandemic is verified fact'
                },
                {
                    pattern: /climate.*change.*real/i,
                    reason: 'Climate change is scientifically established'
                },
                {
                    pattern: /election.*results.*certified/i,
                    reason: 'Election certification is official process'
                },
                {
                    pattern: /vaccines.*effective/i,
                    reason: 'Vaccine effectiveness is scientifically proven'
                }
            ]
        };
        
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.setupAnimations();
    }

    setupEventListeners() {
        // Analyze button
        const analyzeBtn = document.getElementById('analyze-btn');
        if (analyzeBtn) {
            analyzeBtn.addEventListener('click', () => this.analyzeNews());
        }

        // Enter key in textarea
        const newsInput = document.getElementById('news-input');
        if (newsInput) {
            newsInput.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' && e.ctrlKey) {
                    this.analyzeNews();
                }
            });
        }

        // Navigation scroll effects
        this.setupNavigation();
    }

    setupNavigation() {
        const navbar = document.getElementById('navbar');
        if (navbar) {
            window.addEventListener('scroll', () => {
                if (window.scrollY > 50) {
                    navbar.classList.add('scrolled');
                } else {
                    navbar.classList.remove('scrolled');
                }
            });
        }

        // Smooth scrolling for navigation links
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', (e) => {
                e.preventDefault();
                const href = anchor.getAttribute('href');
                const target = document.querySelector(href);
                
                if (target) {
                    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    
                    // Handle auth tab switching
                    if (href === '#auth') {
                        setTimeout(() => {
                            if (anchor.classList.contains('auth-login')) {
                                // Switch to login tab
                                this.switchToLoginTab();
                            } else if (anchor.classList.contains('auth-signup')) {
                                // Switch to signup tab
                                this.switchToSignupTab();
                            }
                        }, 500); // Wait for scroll to complete
                        return;
                    }
                }
            });
        });

        // Mobile menu toggle
        const hamburger = document.querySelector('.hamburger');
        const navMenu = document.querySelector('.nav-menu');
        if (hamburger && navMenu) {
            hamburger.addEventListener('click', () => {
                hamburger.classList.toggle('active');
                navMenu.classList.toggle('active');
            });
        }
    }

    switchToLoginTab() {
        const loginTab = document.querySelector('.auth-tab[data-tab="login"]');
        const signupTab = document.querySelector('.auth-tab[data-tab="signup"]');
        const loginForm = document.getElementById('login-form');
        const signupForm = document.getElementById('signup-form');
        
        if (loginTab && signupTab && loginForm && signupForm) {
            // Update tabs
            loginTab.classList.add('active');
            signupTab.classList.remove('active');
            
            // Update forms
            loginForm.classList.add('active');
            signupForm.classList.remove('active');
        }
    }

    switchToSignupTab() {
        const loginTab = document.querySelector('.auth-tab[data-tab="login"]');
        const signupTab = document.querySelector('.auth-tab[data-tab="signup"]');
        const loginForm = document.getElementById('login-form');
        const signupForm = document.getElementById('signup-form');
        
        if (loginTab && signupTab && loginForm && signupForm) {
            // Update tabs
            loginTab.classList.remove('active');
            signupTab.classList.add('active');
            
            // Update forms
            loginForm.classList.remove('active');
            signupForm.classList.add('active');
        }
    }

    setupAnimations() {
        // Intersection Observer for fade-in animations
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('fade-in');
                }
            });
        }, observerOptions);

        // Observe elements for animation
        document.querySelectorAll('.info-card, .service-card, .glass-card').forEach(el => {
            observer.observe(el);
        });
    }

    async analyzeNews() {
        if (this.isAnalyzing) return;

        const newsInput = document.getElementById('news-input');
        const text = newsInput.value.trim();

        if (!text) {
            this.showError('Please enter news content to analyze');
            return;
        }

        this.isAnalyzing = true;
        this.setLoadingState(true);

        try {
            // Check hardcoded rules first
            const hardcodedResult = this.checkHardcodedRules(text);
            if (hardcodedResult) {
                await this.displayResults(hardcodedResult);
                return;
            }

            // Extract keywords
            const keywords = this.newsAPI.extractKeywords(text);
            
            // Search APIs
            const articles = await this.newsAPI.search(keywords);
            
            // Check if API results have AI analysis
            if (articles.aiEnhanced) {
                // Use AI-enhanced analysis
                const aiAnalysis = articles.aiAnalysis;
                const combinedAnalysis = {
                    ...this.analyzeResults(text, articles, keywords),
                    aiAnalysis: aiAnalysis,
                    verdict: aiAnalysis.isReal ? 'VERIFIED' : 'NEEDS_VERIFICATION',
                    confidence: Math.max(
                        this.analyzeResults(text, articles, keywords).confidence,
                        aiAnalysis.confidence
                    )
                };
                await this.displayResults(combinedAnalysis);
            } else {
                // Use traditional analysis
                const analysis = this.analyzeResults(text, articles, keywords);
                await this.displayResults(analysis);
            }

        } catch (error) {
            console.error('Analysis error:', error);
            this.showError('Analysis failed. Please try again.');
        } finally {
            this.isAnalyzing = false;
            this.setLoadingState(false);
        }
    }

    checkHardcodedRules(text) {
        const lowerText = text.toLowerCase();

        // Check fake patterns
        for (const rule of this.hardcodedRules.fake) {
            if (rule.pattern.test(text)) {
                return {
                    isReal: false,
                    confidence: 95,
                    reason: rule.reason,
                    articles: [],
                    hardcoded: true
                };
            }
        }

        // Check real patterns
        for (const rule of this.hardcodedRules.real) {
            if (rule.pattern.test(text)) {
                return {
                    isReal: true,
                    confidence: 95,
                    reason: rule.reason,
                    articles: [],
                    hardcoded: true
                };
            }
        }

        return null;
    }

    analyzeResults(text, articles, keywords) {
        if (articles.length === 0) {
            // No articles found - likely fake or unverified
            return {
                isReal: false,
                confidence: 70,
                reason: 'No matching articles found in trusted sources',
                articles: [],
                keywords: keywords
            };
        }

        // Calculate trust score based on sources
        const trustedArticles = articles.filter(article => article.isTrusted);
        const trustRatio = trustedArticles.length / articles.length;

        // Calculate content similarity
        const similarityScore = this.calculateSimilarity(text, articles);

        // Determine if news is real based on multiple factors
        let isReal = false;
        let confidence = 0;
        let reason = '';

        if (trustedArticles.length >= 3 && similarityScore > 0.3) {
            isReal = true;
            confidence = Math.min(95, 60 + (trustedArticles.length * 10) + (similarityScore * 20));
            reason = `Verified by ${trustedArticles.length} trusted sources with high content similarity`;
        } else if (trustedArticles.length >= 1 && similarityScore > 0.2) {
            isReal = true;
            confidence = Math.min(85, 50 + (trustedArticles.length * 15) + (similarityScore * 15));
            reason = `Partially verified by ${trustedArticles.length} trusted source(s)`;
        } else if (articles.length >= 5 && trustRatio < 0.3) {
            isReal = false;
            confidence = Math.min(90, 60 + ((1 - trustRatio) * 30));
            reason = 'Multiple sources found but most are untrusted';
        } else {
            isReal = false;
            confidence = Math.min(80, 40 + ((1 - trustRatio) * 40));
            reason = 'Insufficient verification from trusted sources';
        }

        return {
            isReal,
            confidence: Math.round(confidence),
            reason,
            articles: articles.slice(0, 5), // Limit to 5 articles for display
            keywords,
            trustRatio,
            similarityScore
        };
    }

    calculateSimilarity(text, articles) {
        if (articles.length === 0) return 0;

        const textWords = new Set(text.toLowerCase().split(/\s+/));
        let totalSimilarity = 0;

        articles.forEach(article => {
            const articleText = `${article.title} ${article.description || ''}`.toLowerCase();
            const articleWords = new Set(articleText.split(/\s+/));
            
            // Calculate Jaccard similarity
            const intersection = new Set([...textWords].filter(x => articleWords.has(x)));
            const union = new Set([...textWords, ...articleWords]);
            
            const similarity = intersection.size / union.size;
            totalSimilarity += similarity;
        });

        return totalSimilarity / articles.length;
    }

    async displayResults(analysis) {
        const resultsSection = document.getElementById('results');
        const statusText = document.getElementById('status-text');
        const confidenceText = document.getElementById('confidence-text');
        const realBar = document.getElementById('real-bar');
        const fakeBar = document.getElementById('fake-bar');
        const realPercent = document.getElementById('real-percent');
        const fakePercent = document.getElementById('fake-percent');
        const progressFill = document.querySelector('.progress-fill');
        const referencesList = document.getElementById('references-list');

        // Show results section
        resultsSection.classList.remove('hidden');

        // Update status
        const resultStatus = document.getElementById('result-status');
        resultStatus.className = `result-status ${analysis.isReal ? 'real' : 'fake'}`;
        
        statusText.textContent = analysis.isReal ? 'REAL NEWS' : 'FAKE NEWS';
        confidenceText.textContent = `${analysis.confidence}%`;

        // Update progress bar
        progressFill.style.width = '0%';
        setTimeout(() => {
            progressFill.style.width = `${analysis.confidence}%`;
            progressFill.style.background = analysis.isReal 
                ? 'linear-gradient(90deg, #00ff88, #00cc6a)' 
                : 'linear-gradient(90deg, #ff4444, #cc0000)';
        }, 100);

        // Update probability bars
        const realProbability = analysis.isReal ? analysis.confidence : 100 - analysis.confidence;
        const fakeProbability = analysis.isReal ? 100 - analysis.confidence : analysis.confidence;

        realBar.style.width = '0%';
        fakeBar.style.width = '0%';
        
        setTimeout(() => {
            realBar.style.width = `${realProbability}%`;
            fakeBar.style.width = `${fakeProbability}%`;
            realPercent.textContent = `${realProbability}%`;
            fakePercent.textContent = `${fakeProbability}%`;
        }, 200);

        // Update references
        referencesList.innerHTML = '';
        
        if (analysis.articles.length > 0) {
            analysis.articles.forEach(article => {
                const referenceEl = document.createElement('div');
                referenceEl.className = 'reference-item';
                referenceEl.innerHTML = `
                    <div class="reference-title">${article.title}</div>
                    <div class="reference-source">${article.source} ${article.isTrusted ? '✓' : ''}</div>
                    <a href="${article.url}" target="_blank" class="reference-link">Read more →</a>
                `;
                referencesList.appendChild(referenceEl);
            });
        } else {
            referencesList.innerHTML = `
                <div class="reference-item">
                    <div class="reference-title">No reference articles found</div>
                    <div class="reference-source">This content could not be verified with external sources</div>
                </div>
            `;
        }

        // Scroll to results
        setTimeout(() => {
            resultsSection.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }, 300);
    }

    setLoadingState(loading) {
        const analyzeBtn = document.getElementById('analyze-btn');
        if (loading) {
            analyzeBtn.classList.add('loading');
            analyzeBtn.querySelector('span').textContent = 'Analyzing...';
        } else {
            analyzeBtn.classList.remove('loading');
            analyzeBtn.querySelector('span').textContent = 'Analyze';
        }
    }

    showError(message) {
        // Create error notification
        const errorEl = document.createElement('div');
        errorEl.className = 'error-notification';
        errorEl.textContent = message;
        errorEl.style.cssText = `
            position: fixed;
            top: 100px;
            right: 20px;
            background: rgba(255, 68, 68, 0.9);
            color: white;
            padding: 1rem 1.5rem;
            border-radius: 10px;
            z-index: 10000;
            animation: slideIn 0.3s ease;
        `;

        document.body.appendChild(errorEl);

        // Remove after 3 seconds
        setTimeout(() => {
            errorEl.style.animation = 'fadeOut 0.3s ease';
            setTimeout(() => {
                document.body.removeChild(errorEl);
            }, 300);
        }, 3000);
    }
}

// Utility function to scroll to detector
function scrollToDetector() {
    const detector = document.getElementById('detector');
    if (detector) {
        detector.scrollIntoView({ behavior: 'smooth' });
    }
}

// Add CSS animations dynamically
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }

    @keyframes fadeOut {
        from {
            opacity: 1;
        }
        to {
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new FakeNewsDetector();
});
