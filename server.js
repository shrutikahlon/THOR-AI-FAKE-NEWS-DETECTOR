const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'your-jwt-secret-key-here-change-in-production';

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('.')); // Serve static files

// Initialize SQLite database
const db = new sqlite3.Database('./database.sqlite', (err) => {
    if (err) {
        console.error('Error opening database:', err.message);
    } else {
        console.log('Connected to SQLite database');
        initializeTables();
    }
});

// Initialize database tables
function initializeTables() {
    // Users table
    db.run(`CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        analyses INTEGER DEFAULT 0
    )`, (err) => {
        if (err) {
            console.error('Error creating users table:', err.message);
        } else {
            console.log('Users table initialized');
        }
    });

    // Analysis history table
    db.run(`CREATE TABLE IF NOT EXISTS analysis_history (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER,
        content TEXT NOT NULL,
        result TEXT NOT NULL,
        confidence INTEGER NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (id)
    )`, (err) => {
        if (err) {
            console.error('Error creating analysis_history table:', err.message);
        } else {
            console.log('Analysis history table initialized');
        }
    });
}

// Login logging function
function logLoginAttempt(email, status, req) {
    const timestamp = new Date().toLocaleString('en-US', { 
        year: 'numeric', 
        month: '2-digit', 
        day: '2-digit', 
        hour: '2-digit', 
        minute: '2-digit' 
    });
    
    const ip = req.ip || req.connection.remoteAddress || req.socket.remoteAddress || 'unknown';
    const userAgent = req.get('User-Agent') || 'unknown';
    
    // Console logging
    if (status === 'SUCCESS') {
        console.log(`[LOGIN SUCCESS] ${email} | ${timestamp} | IP: ${ip} | ${userAgent}`);
    } else {
        console.log(`[LOGIN FAILED] ${email} | ${timestamp} | IP: ${ip} | ${userAgent}`);
    }
    
    // File logging
    const logEntry = `[${status}] ${email} | ${timestamp} | IP: ${ip} | ${userAgent}\n`;
    
    try {
        fs.appendFileSync('loginLogs.txt', logEntry);
    } catch (error) {
        console.error('Failed to write to login log file:', error);
    }
}

// Middleware to verify JWT token
function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ error: 'Access token required' });
    }

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({ error: 'Invalid token' });
        }
        req.user = user;
        next();
    });
}

// Routes

// Register new user
app.post('/api/auth/register', async (req, res) => {
    try {
        const { name, email, password } = req.body;

        // Validation
        if (!name || !email || !password) {
            return res.status(400).json({ error: 'All fields are required' });
        }

        if (name.length < 2) {
            return res.status(400).json({ error: 'Name must be at least 2 characters' });
        }

        if (password.length < 6) {
            return res.status(400).json({ error: 'Password must be at least 6 characters' });
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({ error: 'Invalid email format' });
        }

        // Check if user already exists
        db.get('SELECT id FROM users WHERE email = ?', [email], async (err, row) => {
            if (err) {
                return res.status(500).json({ error: 'Database error' });
            }

            if (row) {
                return res.status(400).json({ error: 'User already exists' });
            }

            // Hash password
            const hashedPassword = await bcrypt.hash(password, 10);

            // Create new user
            db.run('INSERT INTO users (name, email, password) VALUES (?, ?, ?)', 
                [name, email, hashedPassword], 
                function(err) {
                    if (err) {
                        return res.status(500).json({ error: 'Failed to create user' });
                    }

                    // Generate JWT token
                    const token = jwt.sign(
                        { id: this.lastID, name, email },
                        JWT_SECRET,
                        { expiresIn: '24h' }
                    );

                    res.status(201).json({
                        message: 'User created successfully',
                        token,
                        user: {
                            id: this.lastID,
                            name,
                            email,
                            analyses: 0
                        }
                    });
                }
            );
        });
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});

// Login user
app.post('/api/auth/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // Validation
        if (!email || !password) {
            // Log failed login attempt - missing credentials
            logLoginAttempt(email || 'unknown', 'FAILED', req);
            return res.status(400).json({ error: 'Email and password are required' });
        }

        // Find user
        db.get('SELECT * FROM users WHERE email = ?', [email], async (err, user) => {
            if (err) {
                // Log failed login attempt - database error
                logLoginAttempt(email, 'FAILED', req);
                return res.status(500).json({ error: 'Database error' });
            }

            if (!user) {
                // Log failed login attempt - user not found
                logLoginAttempt(email, 'FAILED', req);
                return res.status(401).json({ error: 'Invalid credentials' });
            }

            // Compare passwords
            const isValidPassword = await bcrypt.compare(password, user.password);
            if (!isValidPassword) {
                // Log failed login attempt - wrong password
                logLoginAttempt(email, 'FAILED', req);
                return res.status(401).json({ error: 'Invalid credentials' });
            }

            // Log successful login attempt
            logLoginAttempt(email, 'SUCCESS', req);

            // Generate JWT token
            const token = jwt.sign(
                { id: user.id, name: user.name, email: user.email },
                JWT_SECRET,
                { expiresIn: '24h' }
            );

            res.json({
                message: 'Login successful',
                token,
                user: {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    analyses: user.analyses
                }
            });
        });
    } catch (error) {
        // Log failed login attempt - server error
        logLoginAttempt(req.body?.email || 'unknown', 'FAILED', req);
        res.status(500).json({ error: 'Server error' });
    }
});

// Get user profile
app.get('/api/auth/profile', authenticateToken, (req, res) => {
    db.get('SELECT id, name, email, analyses, created_at FROM users WHERE id = ?', 
        [req.user.id], 
        (err, user) => {
            if (err) {
                return res.status(500).json({ error: 'Database error' });
            }
            if (!user) {
                return res.status(404).json({ error: 'User not found' });
            }
            res.json(user);
        }
    );
});

// Update user analysis count
app.post('/api/auth/increment-analysis', authenticateToken, (req, res) => {
    db.run('UPDATE users SET analyses = analyses + 1 WHERE id = ?', 
        [req.user.id], 
        function(err) {
            if (err) {
                return res.status(500).json({ error: 'Database error' });
            }
            res.json({ message: 'Analysis count updated' });
        }
    );
});

// Save analysis history
app.post('/api/analysis/save', authenticateToken, (req, res) => {
    const { content, result, confidence } = req.body;
    
    db.run('INSERT INTO analysis_history (user_id, content, result, confidence) VALUES (?, ?, ?, ?)', 
        [req.user.id, content, result, confidence], 
        function(err) {
            if (err) {
                return res.status(500).json({ error: 'Database error' });
            }
            res.json({ message: 'Analysis saved', id: this.lastID });
        }
    );
});

// Get analysis history
app.get('/api/analysis/history', authenticateToken, (req, res) => {
    db.all('SELECT * FROM analysis_history WHERE user_id = ? ORDER BY created_at DESC LIMIT 50', 
        [req.user.id], 
        (err, rows) => {
            if (err) {
                return res.status(500).json({ error: 'Database error' });
            }
            res.json(rows);
        }
    );
});

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({ 
        status: 'OK', 
        timestamp: new Date().toISOString(),
        version: '1.0.0'
    });
});

// Admin endpoints to view data (for development/testing)
app.get('/api/admin/users', (req, res) => {
    db.all('SELECT id, name, email, created_at, analyses FROM users ORDER BY created_at DESC', 
        (err, rows) => {
            if (err) {
                return res.status(500).json({ error: 'Database error' });
            }
            res.json({
                total: rows.length,
                users: rows
            });
        }
    );
});

app.get('/api/admin/analysis-history', (req, res) => {
    db.all(`
        SELECT ah.*, u.name, u.email 
        FROM analysis_history ah 
        JOIN users u ON ah.user_id = u.id 
        ORDER BY ah.created_at DESC 
        LIMIT 50
    `, (err, rows) => {
        if (err) {
            return res.status(500).json({ error: 'Database error' });
        }
        res.json({
            total: rows.length,
            analyses: rows
        });
    });
});

// Database stats endpoint
app.get('/api/admin/stats', (req, res) => {
    db.get('SELECT COUNT(*) as totalUsers FROM users', (err, userCount) => {
        if (err) {
            return res.status(500).json({ error: 'Database error' });
        }
        
        db.get('SELECT COUNT(*) as totalAnalyses FROM analysis_history', (err, analysisCount) => {
            if (err) {
                return res.status(500).json({ error: 'Database error' });
            }
            
            res.json({
                totalUsers: userCount.totalUsers,
                totalAnalyses: analysisCount.totalAnalyses,
                timestamp: new Date().toISOString()
            });
        });
    });
});

// Backend logs endpoint - returns login logs
app.get('/backend-logs', (req, res) => {
    try {
        if (fs.existsSync('loginLogs.txt')) {
            const logs = fs.readFileSync('loginLogs.txt', 'utf8');
            res.set('Content-Type', 'text/plain');
            res.send(logs);
        } else {
            res.set('Content-Type', 'text/plain');
            res.send('No login logs found.');
        }
    } catch (error) {
        res.status(500).json({ error: 'Failed to read login logs' });
    }
});

// Serve the main HTML file for all other routes
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Something went wrong!' });
});

// Start server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Backend API available at http://localhost:${PORT}/api`);
    console.log(`Frontend available at http://localhost:${PORT}`);
});

// Graceful shutdown
process.on('SIGINT', () => {
    console.log('Shutting down server...');
    db.close((err) => {
        if (err) {
            console.error('Error closing database:', err.message);
        } else {
            console.log('Database connection closed.');
        }
        process.exit(0);
    });
});
