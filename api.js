// API Integration Module for Fake News Detection
class NewsAPIService {
    constructor() {
        // API Keys (provided credentials)
        this.apiKeys = {
            newsapi: 'e7ea77c7f3b5419eac4e0844d3a2c17c',
            gnews: 'YOUR_GNEWS_KEY',
            mediastack: 'YOUR_MEDIASTACK_KEY',
            guardian: 'e15f2f33-91ad-4e3c-ab1a-309a94452d02',
            nytimes: '9Cm9iT2JvN99gzf1bJlZpGRGEKscctFnWD79qyn4CYq1l3t4'
        };
        
        // API endpoints
        this.endpoints = {
            newsapi: 'https://newsapi.org/v2/everything',
            gnews: 'https://gnews.io/api/v4/search',
            mediastack: 'http://api.mediastack.com/v1/news',
            guardian: 'https://content.guardianapis.com/search',
            nytimes: 'https://api.nytimes.com/svc/search/v2/articlesearch.json'
        };
        
        // Trusted sources
        this.trustedSources = [
            'bbc.com',
            'cnn.com',
            'reuters.com',
            'apnews.com',
            'npr.org',
            'wsj.com',
            'nytimes.com',
            'washingtonpost.com',
            'theguardian.com',
            'economist.com',
            'bloomberg.com',
            'ft.com',
            'cnbc.com',
            'forbes.com',
            'time.com',
            'theguardian.com',
            'guardian.co.uk',
            'nytimes.com',
            'newyorktimes.com'
        ];
    }

    // Extract keywords from text
    extractKeywords(text) {
        if (!text) return [];
        
        // Common stop words to filter out
        const stopWords = new Set([
            'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for',
            'of', 'with', 'by', 'from', 'up', 'about', 'into', 'through', 'during',
            'before', 'after', 'above', 'below', 'between', 'under', 'along', 'following',
            'across', 'behind', 'beyond', 'plus', 'except', 'but', 'yet', 'so',
            'is', 'am', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has',
            'had', 'do', 'does', 'did', 'will', 'would', 'shall', 'should', 'can',
            'could', 'may', 'might', 'must', 'i', 'you', 'he', 'she', 'it', 'we',
            'they', 'me', 'him', 'her', 'us', 'them', 'my', 'your', 'his', 'its',
            'our', 'their', 'this', 'that', 'these', 'those', 'what', 'which',
            'who', 'whom', 'whose', 'where', 'when', 'why', 'how', 'said', 'says'
        ]);
        
        // Extract words and clean them
        const words = text.toLowerCase()
            .replace(/[^\w\s]/g, ' ')
            .split(/\s+/)
            .filter(word => word.length > 2 && !stopWords.has(word));
        
        // Count word frequency
        const wordCount = {};
        words.forEach(word => {
            wordCount[word] = (wordCount[word] || 0) + 1;
        });
        
        // Sort by frequency and return top keywords
        return Object.entries(wordCount)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5)
            .map(([word]) => word);
    }

    // Search NewsAPI
    async searchNewsAPI(keywords) {
        try {
            const query = keywords.join(' OR ');
            const url = `${this.endpoints.newsapi}?q=${encodeURIComponent(query)}&sortBy=relevancy&language=en&pageSize=10&apiKey=${this.apiKeys.newsapi}`;
            
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`NewsAPI error: ${response.status}`);
            }
            
            const data = await response.json();
            return this.formatNewsAPIResults(data.articles);
        } catch (error) {
            console.error('NewsAPI Error:', error);
            return [];
        }
    }

    // Search GNews
    async searchGNews(keywords) {
        try {
            const query = keywords.join(' OR ');
            const url = `${this.endpoints.gnews}?q=${encodeURIComponent(query)}&lang=en&country=us&max=10&apikey=${this.apiKeys.gnews}`;
            
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`GNews error: ${response.status}`);
            }
            
            const data = await response.json();
            return this.formatGNewsResults(data.articles);
        } catch (error) {
            console.error('GNews Error:', error);
            return [];
        }
    }

    // Search Mediastack
    async searchMediastack(keywords) {
        try {
            const query = keywords.join(' OR ');
            const url = `${this.endpoints.mediastack}?keywords=${encodeURIComponent(query)}&countries=us&languages=en&limit=10&access_key=${this.apiKeys.mediastack}`;
            
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`Mediastack error: ${response.status}`);
            }
            
            const data = await response.json();
            return this.formatMediastackResults(data.data);
        } catch (error) {
            console.error('Mediastack Error:', error);
            return [];
        }
    }

    // Search Guardian API
    async searchGuardian(keywords) {
        try {
            const query = keywords.join(' AND ');
            const url = `${this.endpoints.guardian}?q=${encodeURIComponent(query)}&api-key=${this.apiKeys.guardian}&show-fields=headline,trailText,byline&order-by=relevance&page-size=10`;
            
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`Guardian API error: ${response.status}`);
            }
            
            const data = await response.json();
            return this.formatGuardianResults(data.response.results);
        } catch (error) {
            console.error('Guardian API Error:', error);
            return [];
        }
    }

    // Search New York Times API
    async searchNYTimes(keywords) {
        try {
            const query = keywords.join(' AND ');
            const url = `${this.endpoints.nytimes}?q=${encodeURIComponent(query)}&api-key=${this.apiKeys.nytimes}&sort=relevance&fl=headline,snippet,byline,pub_date,web_url&page=0`;
            
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`NYTimes API error: ${response.status}`);
            }
            
            const data = await response.json();
            return this.formatNYTimesResults(data.response.docs);
        } catch (error) {
            console.error('NYTimes API Error:', error);
            return [];
        }
    }

    // Format NewsAPI results
    formatNewsAPIResults(articles) {
        return articles.map(article => ({
            title: article.title,
            description: article.description,
            source: article.source.name,
            url: article.url,
            publishedAt: article.publishedAt,
            isTrusted: this.isTrustedSource(article.source.name)
        }));
    }

    // Format GNews results
    formatGNewsResults(articles) {
        return articles.map(article => ({
            title: article.title,
            description: article.description,
            source: article.source.name,
            url: article.url,
            publishedAt: article.publishedAt,
            isTrusted: this.isTrustedSource(article.source.name)
        }));
    }

    // Format Mediastack results
    formatMediastackResults(articles) {
        return articles.map(article => ({
            title: article.title,
            description: article.description,
            source: article.source,
            url: article.url,
            publishedAt: article.published_at,
            isTrusted: this.isTrustedSource(article.source)
        }));
    }

    // Format Guardian API results
    formatGuardianResults(articles) {
        return articles.map(article => ({
            title: article.webTitle,
            description: article.fields?.trailText || article.webTitle,
            source: 'The Guardian',
            url: article.webUrl,
            publishedAt: article.webPublicationDate,
            isTrusted: this.isTrustedSource('The Guardian')
        }));
    }

    // Format New York Times API results
    formatNYTimesResults(articles) {
        return articles.map(article => ({
            title: article.headline?.main || article.headline,
            description: article.snippet || article.headline?.main,
            source: 'The New York Times',
            url: article.web_url,
            publishedAt: article.pub_date,
            isTrusted: this.isTrustedSource('The New York Times')
        }));
    }

    // Check if source is trusted
    isTrustedSource(source) {
        if (!source) return false;
        const sourceLower = source.toLowerCase();
        return this.trustedSources.some(trusted => sourceLower.includes(trusted));
    }

    // Search all APIs simultaneously
    async searchAllAPIs(keywords) {
        try {
            const [newsapiResults, gnewsResults, mediastackResults, guardianResults, nytimesResults] = await Promise.all([
                this.searchNewsAPI(keywords),
                this.searchGNews(keywords),
                this.searchMediastack(keywords),
                this.searchGuardian(keywords),
                this.searchNYTimes(keywords)
            ]);
            
            // Combine and deduplicate results
            const allResults = [...newsapiResults, ...gnewsResults, ...mediastackResults, ...guardianResults, ...nytimesResults];
            const uniqueResults = this.deduplicateResults(allResults);
            
            return uniqueResults;
        } catch (error) {
            console.error('API Search Error:', error);
            return [];
        }
    }

    // Remove duplicate articles
    deduplicateResults(articles) {
        const seen = new Set();
        return articles.filter(article => {
            const key = `${article.title}-${article.source}`;
            if (seen.has(key)) {
                return false;
            }
            seen.add(key);
            return true;
        });
    }

    // Simulate API responses for demo purposes (when API keys are not provided)
    async simulateAPIResponse(keywords) {
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 1000));
        
        // Generate mock articles based on keywords
        const mockArticles = this.generateMockArticles(keywords);
        return mockArticles;
    }

    // Generate mock articles for demonstration
    generateMockArticles(keywords) {
        const mockData = {
            'trump': [
                {
                    title: 'Trump Announces New Policy Initiative',
                    description: 'Former President Donald Trump revealed his latest policy proposal during a rally in Florida.',
                    source: 'CNN',
                    url: 'https://example.com/trump-policy',
                    publishedAt: new Date().toISOString(),
                    isTrusted: true
                }
            ],
            'biden': [
                {
                    title: 'Biden Addresses Climate Change Summit',
                    description: 'President Joe Biden delivered a keynote speech at the United Nations Climate Change Conference.',
                    source: 'Reuters',
                    url: 'https://example.com/biden-climate',
                    publishedAt: new Date().toISOString(),
                    isTrusted: true
                }
            ],
            'covid': [
                {
                    title: 'New COVID-19 Variant Detected',
                    description: 'Health officials monitor new coronavirus strain discovered in multiple countries.',
                    source: 'BBC News',
                    url: 'https://example.com/covid-variant',
                    publishedAt: new Date().toISOString(),
                    isTrusted: true
                }
            ],
            'election': [
                {
                    title: 'Election Results Certified by Officials',
                    description: 'State election officials have certified the results following comprehensive audits.',
                    source: 'Associated Press',
                    url: 'https://example.com/election-results',
                    publishedAt: new Date().toISOString(),
                    isTrusted: true
                }
            ]
        };

        const results = [];
        keywords.forEach(keyword => {
            if (mockData[keyword.toLowerCase()]) {
                results.push(...mockData[keyword.toLowerCase()]);
            }
        });

        // Add some random articles if no specific matches
        if (results.length === 0) {
            results.push({
                title: 'Breaking News: Major Development Reported',
                description: 'Significant events unfolding as authorities respond to the situation.',
                source: 'Reuters',
                url: 'https://example.com/breaking-news',
                publishedAt: new Date().toISOString(),
                isTrusted: true
            });
        }

        return results;
    }

    // Main search method with fallback to simulation
    async search(keywords) {
        // Check if we have real API keys
        const hasRealKeys = Object.values(this.apiKeys).some(key => 
            key && !key.startsWith('YOUR_')
        );

        if (hasRealKeys) {
            return await this.searchAllAPIs(keywords);
        } else {
            // Use simulated data for demo
            return await this.simulateAPIResponse(keywords);
        }
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = NewsAPIService;
}
