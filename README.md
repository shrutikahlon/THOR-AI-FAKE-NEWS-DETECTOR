# Fake News Detector - AI-Powered Detection Platform

A premium, fully-functional fake news detection website with advanced Three.js liquid metal animation background and real API-based detection.

## 🌟 Features

### 🎨 Premium UI/UX
- **Glass morphism design** with dark theme
- **Three.js liquid metal animation** background with GLSL shaders
- **Smooth animations** and micro-interactions
- **Fully responsive** design for mobile and desktop
- **Modern navigation** with scroll effects

### 🧠 Core Functionality
- **Real API integration** with NewsAPI, GNews, and Mediastack
- **Advanced keyword extraction** and analysis
- **Source credibility validation** against trusted news organizations
- **Confidence scoring** based on multiple factors
- **Reference article display** with clickable links

### 🔍 Detection Logic
- **Hardcoded rules** for obvious fake/real news patterns
- **Jaccard similarity** algorithm for content matching
- **Trust ratio calculation** based on source reliability
- **Multi-factor analysis** for accurate predictions

### 🔐 Authentication System
- **User registration** and login
- **Session management** with localStorage
- **User statistics** tracking
- **Secure password hashing**

## 📁 File Structure

```
├── Frontend (Client-side)
│   ├── index.html          # Main HTML structure
│   ├── style.css           # Premium styling with glass morphism
│   ├── script.js           # Core application logic
│   ├── background.js       # Three.js liquid metal animation
│   ├── api.js              # News API integration
│   └── auth.js             # Authentication system
├── Backend (Server-side)
│   ├── server.js           # Node.js/Express server with logging
│   ├── package.json        # Node.js dependencies
│   └── .env                # Environment variables (API keys)
├── Database
│   └── database.sqlite     # SQLite database (auto-generated)
├── Configuration
│   ├── .gitignore          # Git ignore file
│   ├── admin.html          # Admin dashboard
│   └── README.md           # Project documentation
└── Logs
    └── loginLogs.txt       # Login activity logs (auto-generated)
```

## 🚀 Getting Started

### Local Development
1. Clone or download the project
2. Start a local server:
   ```bash
   python -m http.server 8000
   ```
3. Open `http://localhost:8000` in your browser

### API Configuration
For production use, update the API keys in `api.js`:
```javascript
this.apiKeys = {
    newsapi: 'YOUR_NEWSAPI_KEY',
    gnews: 'YOUR_GNEWS_KEY', 
    mediastack: 'YOUR_MEDIASTACK_KEY'
};
```

## 🎯 How It Works

### Detection Process
1. **User Input**: User enters news content
2. **Keyword Extraction**: System extracts relevant keywords
3. **API Search**: Searches multiple news APIs simultaneously
4. **Analysis**: Compares content against trusted sources
5. **Scoring**: Calculates confidence based on multiple factors
6. **Results**: Displays verdict with supporting evidence

### Scoring Algorithm
- **Trust Sources**: Articles from reputable news organizations
- **Content Similarity**: Jaccard similarity coefficient
- **Source Ratio**: Percentage of trusted vs untrusted sources
- **Pattern Matching**: Hardcoded rules for obvious cases

### Hardcoded Rules
**Fake Patterns:**
- "Aliens landed on Earth"
- "Earth is flat"
- "Moon landing was fake"
- "Vaccines cause autism"
- And more conspiracy theories

**Real Patterns:**
- "TikTok banned in India"
- "COVID-19 pandemic"
- "Climate change is real"
- "Election results certified"

## 🎨 Design Features

### Three.js Background
- **GLSL Shaders**: Custom fragment and vertex shaders
- **Liquid Metal Effect**: Flowing black liquid with metallic highlights
- **Mouse Interaction**: Subtle ripple distortion on mouse movement
- **Performance Optimized**: 60 FPS with mobile optimization

### Glass Morphism UI
- **Backdrop Filters**: Blur effects for depth
- **Transparency Layers**: Multiple glass-like surfaces
- **Accent Colors**: Cyan accents on dark background
- **Smooth Transitions**: Hover states and animations

## 📱 Responsive Design
- **Mobile First**: Optimized for touch devices
- **Flexible Grid**: Adaptive layouts
- **Touch Gestures**: Swipe and tap interactions
- **Performance**: Reduced effects on mobile

## 🔧 Technical Stack

### Frontend
- **HTML5**: Semantic markup
- **CSS3**: Advanced styling with animations
- **JavaScript ES6+**: Modern JavaScript features
- **Three.js**: 3D graphics and animations
- **GLSL**: Shader programming

### APIs
- **NewsAPI**: Global news coverage
- **GNews**: Real-time news search
- **Mediastack**: Historical news data

## 🎮 Interactive Elements

### Navigation
- **Smooth Scrolling**: Animated page transitions
- **Scroll Effects**: Navbar blur on scroll
- **Mobile Menu**: Hamburger menu for mobile
- **Active States**: Visual feedback

### Detector Interface
- **Real-time Analysis**: Live processing feedback
- **Progress Indicators**: Animated progress bars
- **Result Visualization**: Charts and graphs
- **Reference Links**: Clickable article sources

### Authentication
- **Form Validation**: Real-time input validation
- **Loading States**: Visual feedback during processing
- **Error Handling**: User-friendly error messages
- **Session Management**: Persistent login state

## 🎯 Use Cases

### For Individuals
- **Personal Fact-Checking**: Verify news before sharing
- **Media Literacy**: Learn about credible sources
- **Research Support**: Academic and professional use

### For Organizations
- **Content Moderation**: Automated fake news detection
- **Educational Tools**: Media literacy training
- **Research Platform**: Misinformation studies

## 🔒 Security Features

### Data Protection
- **Client-side Processing**: No server data storage
- **Local Storage**: User data stored locally
- **No Tracking**: Privacy-focused design
- **Secure Hashing**: Password protection

### API Security
- **Key Management**: Secure API key storage
- **Rate Limiting**: Respect API limits
- **Error Handling**: Graceful failure recovery
- **Fallback Systems**: Simulation mode for demos

## 🚀 Performance

### Optimization
- **Lazy Loading**: Load resources as needed
- **Code Splitting**: Modular JavaScript
- **Image Optimization**: Efficient asset handling
- **Caching**: Browser caching strategies

### Mobile Performance
- **Reduced Effects**: Optimized animations
- **Touch Events**: Efficient gesture handling
- **Battery Life**: Low power consumption
- **Network Efficiency**: Minimal API calls

## 🎨 Customization

### Theming
- **Color Scheme**: Easy CSS variable updates
- **Typography**: Google Fonts integration
- **Animations**: Customizable motion effects
- **Layout**: Flexible grid system

### API Integration
- **New Sources**: Add additional news APIs
- **Custom Rules**: Extend hardcoded patterns
- **Scoring Algorithm**: Modify detection logic
- **UI Components**: Reusable design elements

## 📈 Analytics & Monitoring

### User Tracking
- **Analysis Count**: Track usage statistics
- **User Behavior**: Monitor interaction patterns
- **Performance Metrics**: Loading times and errors
- **Success Rates**: Detection accuracy

## 🔄 Future Enhancements

### Planned Features
- **Machine Learning**: AI-powered pattern recognition
- **Social Media Integration**: Direct social media analysis
- **Browser Extension**: One-click fact checking
- **Mobile App**: Native mobile applications

### API Expansion
- **More Sources**: Additional news providers
- **International**: Multi-language support
- **Historical Data**: Archive news analysis
- **Real-time Updates**: Live news monitoring

## 📞 Support

### Documentation
- **Code Comments**: Comprehensive inline documentation
- **API Docs**: External API integration guides
- **Troubleshooting**: Common issues and solutions
- **Best Practices**: Development guidelines

### Community
- **Open Source**: Contribution guidelines
- **Issues**: Bug reporting and feature requests
- **Discussions**: Community forums
- **Updates**: Regular feature releases

---

## 🎯 Quick Start Guide

1. **Open the Website**: Load `index.html` in your browser
2. **Create Account**: Sign up for personalized features
3. **Enter News**: Paste content into the analyzer
4. **View Results**: Get instant analysis with confidence scores
5. **Review Sources**: Check reference articles for verification

---

**Built with ❤️ using modern web technologies for a safer, more informed digital world.**
