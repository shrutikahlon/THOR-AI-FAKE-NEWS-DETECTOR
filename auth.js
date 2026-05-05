// Authentication System for Fake News Detector
class AuthSystem {
    constructor() {
        this.currentUser = null;
        this.token = null;
        this.apiBase = 'http://localhost:5000/api';
        this.init();
    }

    init() {
        this.setupAuthTabs();
        this.setupForms();
        this.checkExistingSession();
    }

    setupAuthTabs() {
        const tabs = document.querySelectorAll('.auth-tab');
        const forms = document.querySelectorAll('.auth-form');

        tabs.forEach(tab => {
            tab.addEventListener('click', () => {
                const targetTab = tab.dataset.tab;
                
                // Update active tab
                tabs.forEach(t => t.classList.remove('active'));
                tab.classList.add('active');
                
                // Update active form
                forms.forEach(form => {
                    form.classList.remove('active');
                    if (form.id === `${targetTab}-form`) {
                        form.classList.add('active');
                    }
                });
            });
        });
    }

    setupForms() {
        // Login form
        const loginForm = document.getElementById('login-form');
        if (loginForm) {
            loginForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleLogin(loginForm);
            });
        }

        // Signup form
        const signupForm = document.getElementById('signup-form');
        if (signupForm) {
            signupForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleSignup(signupForm);
            });
        }
    }

    async handleLogin(form) {
        const email = form.querySelector('#login-email').value;
        const password = form.querySelector('#login-password').value;

        // Basic validation
        if (!this.validateEmail(email)) {
            this.showAuthError('Please enter a valid email address');
            return;
        }

        if (password.length < 6) {
            this.showAuthError('Password must be at least 6 characters');
            return;
        }

        // Show loading state
        const submitBtn = form.querySelector('.auth-btn');
        const originalText = submitBtn.textContent;
        submitBtn.textContent = 'Logging in...';
        submitBtn.disabled = true;

        try {
            // Call backend API
            const response = await fetch(`${this.apiBase}/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password })
            });

            const data = await response.json();

            if (response.ok) {
                // Successful login
                this.currentUser = data.user;
                this.token = data.token;
                localStorage.setItem('currentUser', JSON.stringify(data.user));
                localStorage.setItem('authToken', data.token);
                this.showAuthSuccess('Login successful!');
                this.redirectAfterLogin();
            } else {
                this.showAuthError(data.error || 'Login failed');
            }
        } catch (error) {
            console.error('Login error:', error);
            this.showAuthError('Login failed. Please try again.');
        } finally {
            submitBtn.textContent = originalText;
            submitBtn.disabled = false;
        }
    }

    async handleSignup(form) {
        const name = form.querySelector('#signup-name').value;
        const email = form.querySelector('#signup-email').value;
        const password = form.querySelector('#signup-password').value;

        // Validation
        if (name.length < 2) {
            this.showAuthError('Name must be at least 2 characters');
            return;
        }

        if (!this.validateEmail(email)) {
            this.showAuthError('Please enter a valid email address');
            return;
        }

        if (password.length < 6) {
            this.showAuthError('Password must be at least 6 characters');
            return;
        }

        // Show loading state
        const submitBtn = form.querySelector('.auth-btn');
        const originalText = submitBtn.textContent;
        submitBtn.textContent = 'Creating account...';
        submitBtn.disabled = true;

        try {
            // Call backend API
            const response = await fetch(`${this.apiBase}/auth/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ name, email, password })
            });

            const data = await response.json();

            if (response.ok) {
                // Successful registration
                this.currentUser = data.user;
                this.token = data.token;
                localStorage.setItem('currentUser', JSON.stringify(data.user));
                localStorage.setItem('authToken', data.token);
                
                this.showAuthSuccess('Account created successfully!');
                this.redirectAfterLogin();
            } else {
                this.showAuthError(data.error || 'Account creation failed');
            }
        } catch (error) {
            console.error('Signup error:', error);
            this.showAuthError('Account creation failed. Please try again.');
        } finally {
            submitBtn.textContent = originalText;
            submitBtn.disabled = false;
        }
    }

    validateEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    hashPassword(password) {
        // Simple hash for demo (in production, use proper hashing)
        let hash = 0;
        for (let i = 0; i < password.length; i++) {
            const char = password.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Convert to 32-bit integer
        }
        return hash.toString();
    }

    simulateAuthCall() {
        // Simulate network delay
        return new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 1000));
    }

    showAuthError(message) {
        this.showAuthNotification(message, 'error');
    }

    showAuthSuccess(message) {
        this.showAuthNotification(message, 'success');
    }

    showAuthNotification(message, type) {
        // Remove existing notifications
        const existing = document.querySelector('.auth-notification');
        if (existing) {
            existing.remove();
        }

        const notification = document.createElement('div');
        notification.className = `auth-notification ${type}`;
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            top: 100px;
            right: 20px;
            background: ${type === 'error' ? 'rgba(255, 68, 68, 0.9)' : 'rgba(0, 255, 136, 0.9)'};
            color: white;
            padding: 1rem 1.5rem;
            border-radius: 10px;
            z-index: 10000;
            animation: slideIn 0.3s ease;
            max-width: 300px;
        `;

        document.body.appendChild(notification);

        // Remove after 3 seconds
        setTimeout(() => {
            notification.style.animation = 'fadeOut 0.3s ease';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 3000);
    }

    redirectAfterLogin() {
        // Update UI to show logged in state
        this.updateUIForLoggedInUser();
        
        // Scroll to detector section
        setTimeout(() => {
            const detector = document.getElementById('detector');
            if (detector) {
                detector.scrollIntoView({ behavior: 'smooth' });
            }
        }, 1500);
    }

    updateUIForLoggedInUser() {
        // Update navigation
        const navMenu = document.querySelector('.nav-menu');
        if (navMenu && this.currentUser) {
            // Hide login and signup links
            const loginLink = document.querySelector('.auth-login');
            const signupLink = document.querySelector('.auth-signup');
            if (loginLink) loginLink.parentElement.style.display = 'none';
            if (signupLink) signupLink.parentElement.style.display = 'none';

            // Add user menu item
            const userItem = document.createElement('li');
            userItem.innerHTML = `
                <a href="#" class="nav-link user-link">
                    <span class="user-avatar">${this.currentUser.name.charAt(0).toUpperCase()}</span>
                    ${this.currentUser.name}
                </a>
            `;
            navMenu.appendChild(userItem);

            // Add logout button
            const logoutItem = document.createElement('li');
            logoutItem.innerHTML = `
                <a href="#" class="nav-link logout-btn">Logout</a>
            `;
            navMenu.appendChild(logoutItem);

            // Add logout functionality
            logoutItem.addEventListener('click', (e) => {
                e.preventDefault();
                this.logout();
            });

            // Add user profile click functionality
            userItem.addEventListener('click', (e) => {
                e.preventDefault();
                this.showUserProfile();
            });
        }

        // Show welcome message
        const welcomeMsg = document.createElement('div');
        welcomeMsg.className = 'welcome-message';
        welcomeMsg.innerHTML = `
            <div class="welcome-content">
                <h3>Welcome, ${this.currentUser.name}!</h3>
                <p>You can now use the fake news detector.</p>
                <button class="close-welcome">×</button>
            </div>
        `;
        welcomeMsg.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: rgba(0, 0, 0, 0.9);
            backdrop-filter: blur(20px);
            border: 1px solid rgba(255, 255, 255, 0.1);
            border-radius: 20px;
            padding: 2rem;
            z-index: 10001;
            text-align: center;
            animation: fadeIn 0.3s ease;
        `;

        document.body.appendChild(welcomeMsg);

        // Close button
        const closeBtn = welcomeMsg.querySelector('.close-welcome');
        closeBtn.addEventListener('click', () => {
            welcomeMsg.style.animation = 'fadeOut 0.3s ease';
            setTimeout(() => {
                document.body.removeChild(welcomeMsg);
            }, 300);
        });

        // Auto close after 3 seconds
        setTimeout(() => {
            if (welcomeMsg.parentNode) {
                welcomeMsg.style.animation = 'fadeOut 0.3s ease';
                setTimeout(() => {
                    if (welcomeMsg.parentNode) {
                        document.body.removeChild(welcomeMsg);
                    }
                }, 300);
            }
        }, 3000);
    }

    logout() {
        localStorage.removeItem('currentUser');
        localStorage.removeItem('authToken');
        this.currentUser = null;
        this.token = null;
        
        // Show logout message
        this.showAuthNotification('Logged out successfully', 'success');
        
        // Reload page to reset UI
        setTimeout(() => {
            window.location.reload();
        }, 1000);
    }

    showUserProfile() {
        const stats = this.getUserStats();
        if (!stats) return;

        // Create profile modal
        const profileModal = document.createElement('div');
        profileModal.className = 'profile-modal';
        profileModal.innerHTML = `
            <div class="profile-content">
                <div class="profile-header">
                    <h3>User Profile</h3>
                    <button class="close-profile">×</button>
                </div>
                <div class="profile-info">
                    <div class="profile-avatar">${stats.name.charAt(0).toUpperCase()}</div>
                    <div class="profile-details">
                        <h4>${stats.name}</h4>
                        <p>${stats.email}</p>
                        <div class="profile-stats">
                            <div class="stat-item">
                                <span class="stat-value">${stats.analyses}</span>
                                <span class="stat-label">Analyses</span>
                            </div>
                            <div class="stat-item">
                                <span class="stat-value">${stats.memberSince}</span>
                                <span class="stat-label">Member Since</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;

        // Add styles
        profileModal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.8);
            backdrop-filter: blur(10px);
            z-index: 10000;
            display: flex;
            align-items: center;
            justify-content: center;
            animation: fadeIn 0.3s ease;
        `;

        document.body.appendChild(profileModal);

        // Close functionality
        const closeBtn = profileModal.querySelector('.close-profile');
        closeBtn.addEventListener('click', () => {
            profileModal.style.animation = 'fadeOut 0.3s ease';
            setTimeout(() => {
                document.body.removeChild(profileModal);
            }, 300);
        });

        // Close on background click
        profileModal.addEventListener('click', (e) => {
            if (e.target === profileModal) {
                closeBtn.click();
            }
        });
    }

    async checkExistingSession() {
        const savedUser = localStorage.getItem('currentUser');
        const savedToken = localStorage.getItem('authToken');
        
        if (savedUser && savedToken) {
            try {
                this.currentUser = JSON.parse(savedUser);
                this.token = savedToken;
                
                // Verify token with backend
                const response = await fetch(`${this.apiBase}/auth/profile`, {
                    headers: {
                        'Authorization': `Bearer ${this.token}`
                    }
                });
                
                if (response.ok) {
                    this.updateUIForLoggedInUser();
                } else {
                    // Token invalid, clear session
                    this.logout();
                }
            } catch (error) {
                console.error('Session check error:', error);
                this.logout();
            }
        }
    }

    // Method to increment user analysis count
    async incrementAnalysisCount() {
        if (this.currentUser && this.token) {
            try {
                const response = await fetch(`${this.apiBase}/auth/increment-analysis`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${this.token}`,
                        'Content-Type': 'application/json'
                    }
                });

                if (response.ok) {
                    this.currentUser.analyses = (this.currentUser.analyses || 0) + 1;
                    localStorage.setItem('currentUser', JSON.stringify(this.currentUser));
                }
            } catch (error) {
                console.error('Error incrementing analysis count:', error);
            }
        }
    }

    // Get user stats
    getUserStats() {
        if (!this.currentUser) return null;
        
        return {
            name: this.currentUser.name,
            email: this.currentUser.email,
            analyses: this.currentUser.analyses || 0,
            memberSince: new Date(this.currentUser.createdAt).toLocaleDateString()
        };
    }
}

// Initialize authentication when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.authSystem = new AuthSystem();
});

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AuthSystem;
}
