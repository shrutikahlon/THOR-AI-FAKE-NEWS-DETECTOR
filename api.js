class NewsAPIService {
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
            'guardian.co.uk',
            'economist.com',
            'bloomberg.com',
            'ft.com',
            'cnbc.com',
            'forbes.com',
            'time.com',
            'newyorktimes.com'
        ];
    }

    extractKeywords(text) {
        if (!text) return [];
        
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
        
        const words = text.toLowerCase()
            .replace(/[^\w\s]/g, ' ')
            .split(/\s+/)
            .filter(word => word.length > 2 && !stopWords.has(word));
        
        const wordCount = {};
        words.forEach(word => {
            wordCount[word] = (wordCount[word] || 0) + 1;
        });
        
        return Object.entries(wordCount)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5)
            .map(([word]) => word);
    }

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

    isTrustedSource(source) {
        if (!source) return false;
        const sourceLower = source.toLowerCase();
        return this.trustedSources.some(trusted => sourceLower.includes(trusted));
    }

    async searchAllAPIs(keywords) {
        try {
            const [newsapiResults, guardianResults, nytimesResults] = await Promise.all([
                this.searchNewsAPI(keywords),
                this.searchGuardian(keywords),
                this.searchNYTimes(keywords)
            ]);
            
            const allResults = [...newsapiResults, ...guardianResults, ...nytimesResults];
            const uniqueResults = this.deduplicateResults(allResults);
            
            return uniqueResults;
        } catch (error) {
            console.error('API Search Error:', error);
            return [];
        }
    }

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

    
    classifyTextWithAI(text) {
        const features = this.extractTextFeatures(text);
        const fakeScore = this.calculateFakeProbability(features);
        const realScore = 1 - fakeScore;
        
        return {
            isReal: realScore > 0.6,
            confidence: Math.round(Math.max(realScore, fakeScore) * 100),
            aiAnalysis: {
                fakeScore: Math.round(fakeScore * 100),
                realScore: Math.round(realScore * 100),
                features: features
            }
        };
    }

    extractTextFeatures(text) {
        const words = text.toLowerCase().split(/\s+/);
        const sentences = text.split(/[.!?]+/).filter(s => s.trim());
        
        return {
            wordCount: words.length,
            sentenceCount: sentences.length,
            avgWordLength: words.reduce((a, b) => a + b.length, 0) / words.length,
            exclamationCount: (text.match(/!/g) || []).length,
            questionCount: (text.match(/\?/g) || []).length,
            uppercaseRatio: (text.match(/[A-Z]/g) || []).length / text.length,
            clickbaitWords: this.countClickbaitWords(words),
            sensationalWords: this.countSensationalWords(words),
            sourceCredibility: this.assessSourceCredibility(text)
        };
    }

    calculateFakeProbability(features) {
        let fakeScore = 0.3; // Base probability
        
        fakeScore += features.clickbaitWords * 0.15;
        
        fakeScore += features.sensationalWords * 0.12;
        
        if (features.exclamationCount > features.sentenceCount * 0.3) {
            fakeScore += 0.1;
        }
        
        if (features.uppercaseRatio > 0.15) {
            fakeScore += 0.08;
        }
        
        if (features.avgWordLength < 4 && features.sentenceCount > 3) {
            fakeScore += 0.07;
        }
        
        fakeScore -= features.sourceCredibility * 0.2;
        
        return Math.min(0.9, Math.max(0.1, fakeScore));
    }

    countClickbaitWords(words) {
        const clickbaitWords = ['shocking', 'unbelievable', 'incredible', 'amazing', 'you-wont-believe', 'secret', 'revealed', 'exclusive', 'breaking', 'urgent'];
        return words.filter(word => clickbaitWords.includes(word)).length / words.length;
    }

    countSensationalWords(words) {
        const sensationalWords = ['disaster', 'crisis', 'emergency', 'scandal', 'outrage', 'horrifying', 'devastating', 'catastrophic'];
        return words.filter(word => sensationalWords.includes(word)).length / words.length;
    }

    assessSourceCredibility(text) {
        const credibleSources = ['reuters', 'associated press', 'ap', 'bbc', 'cnn', 'new york times', 'washington post', 'wall street journal'];
        const textLower = text.toLowerCase();
        
        let credibility = 0;
        credibleSources.forEach(source => {
            if (textLower.includes(source)) {
                credibility += 0.3;
            }
        });
        
        return Math.min(1, credibility);
    }

    async search(keywords) {
        const apiResults = await this.searchAllAPIs(keywords);
        
        if (apiResults.length > 0) {
            const sampleText = apiResults[0]?.title + ' ' + apiResults[0]?.description;
            if (sampleText) {
                const aiAnalysis = this.classifyTextWithAI(sampleText);
                return {
                    ...apiResults,
                    aiEnhanced: true,
                    aiAnalysis: aiAnalysis
                };
            }
        }
        
        return apiResults;
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = NewsAPIService;
}
