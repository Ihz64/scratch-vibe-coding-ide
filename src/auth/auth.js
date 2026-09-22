/**
 * Scratch Vibe Coding IDE - Authentication Module
 * Handles user authentication, sessions, and user management
 */

// ============================================
// Authentication State
// ============================================

const AuthState = {
    currentUser: null,
    isAuthenticated: false,
    token: null,
    sessionId: null,
    users: [], // In-memory user storage (for demo purposes)
    sessions: {} // In-memory session storage
};

// ============================================
// User Model
// ============================================

class User {
    constructor(data) {
        this.id = data.id || generateUUID();
        this.name = data.name || '';
        this.email = data.email || '';
        this.password = data.password || ''; // In real app, this would be hashed
        this.createdAt = data.createdAt || new Date().toISOString();
        this.updatedAt = data.updatedAt || new Date().toISOString();
        this.lastLogin = data.lastLogin || null;
        this.settings = data.settings || {};
        this.projects = data.projects || [];
    }
    
    toJSON() {
        return {
            id: this.id,
            name: this.name,
            email: this.email,
            createdAt: this.createdAt,
            updatedAt: this.updatedAt,
            lastLogin: this.lastLogin,
            settings: this.settings,
            projects: this.projects
        };
    }
}

// ============================================
// Session Model
// ============================================

class Session {
    constructor(userId, token) {
        this.id = generateUUID();
        this.userId = userId;
        this.token = token;
        this.createdAt = new Date().toISOString();
        this.expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(); // 24 hours
    }
    
    isValid() {
        return new Date(this.expiresAt) > new Date();
    }
}

// ============================================
// Authentication Module
// ============================================

const Auth = {
    // ============================================
    // Initialization
    // ============================================
    
    init() {
        // Load users from localStorage (for demo)
        this.loadUsers();
        
        // Check for existing session
        this.checkSession();
    },
    
    loadUsers() {
        try {
            const savedUsers = localStorage.getItem('vibeUsers');
            if (savedUsers) {
                AuthState.users = JSON.parse(savedUsers);
            } else {
                // Create demo users
                AuthState.users = [
                    {
                        id: 'demo-user',
                        name: 'Demo Benutzer',
                        email: 'demo@scratchvibe.com',
                        password: 'demo123', // In real app, this would be hashed
                        createdAt: new Date().toISOString(),
                        updatedAt: new Date().toISOString(),
                        lastLogin: null,
                        settings: {},
                        projects: []
                    }
                ];
                localStorage.setItem('vibeUsers', JSON.stringify(AuthState.users));
            }
        } catch (error) {
            console.error('Error loading users:', error);
        }
    },
    
    saveUsers() {
        try {
            localStorage.setItem('vibeUsers', JSON.stringify(AuthState.users));
        } catch (error) {
            console.error('Error saving users:', error);
        }
    },
    
    // ============================================
    // Session Management
    // ============================================
    
    checkSession() {
        try {
            const sessionData = localStorage.getItem('vibeSession');
            if (sessionData) {
                const session = JSON.parse(sessionData);
                const user = this.getUserById(session.userId);
                
                if (user && session.token && new Date(session.expiresAt) > new Date()) {
                    AuthState.currentUser = user;
                    AuthState.isAuthenticated = true;
                    AuthState.token = session.token;
                    AuthState.sessionId = session.id;
                    
                    // Update last login
                    user.lastLogin = new Date().toISOString();
                    this.saveUsers();
                } else {
                    this.clearSession();
                }
            }
        } catch (error) {
            console.error('Error checking session:', error);
            this.clearSession();
        }
    },
    
    createSession(userId) {
        const token = generateUUID();
        const session = new Session(userId, token);
        
        AuthState.sessionId = session.id;
        AuthState.token = token;
        
        // Save session to localStorage
        localStorage.setItem('vibeSession', JSON.stringify({
            id: session.id,
            userId: userId,
            token: token,
            expiresAt: session.expiresAt
        }));
        
        return session;
    },
    
    clearSession() {
        AuthState.currentUser = null;
        AuthState.isAuthenticated = false;
        AuthState.token = null;
        AuthState.sessionId = null;
        
        localStorage.removeItem('vibeSession');
    },
    
    // ============================================
    // User Management
    // ============================================
    
    getUserById(userId) {
        return AuthState.users.find(user => user.id === userId);
    }
    
    getUserByEmail(email) {
        return AuthState.users.find(user => user.email === email);
    }
    
    async register(name, email, password) {
        // Validate input
        if (!name || !email || !password) {
            throw new Error('Bitte alle Felder ausfüllen');
        }
        
        // Check if email already exists
        if (this.getUserByEmail(email)) {
            throw new Error('E-Mail existiert bereits');
        }
        
        // Create new user
        const user = new User({
            name: name,
            email: email,
            password: password // In real app, hash the password
        });
        
        AuthState.users.push(user);
        this.saveUsers();
        
        return user;
    }
    
    async login(email, password) {
        // Validate input
        if (!email || !password) {
            throw new Error('Bitte E-Mail und Passwort angeben');
        }
        
        // Find user
        const user = this.getUserByEmail(email);
        if (!user) {
            throw new Error('Benutzer nicht gefunden');
        }
        
        // Check password (in real app, verify hash)
        if (user.password !== password) {
            throw new Error('Falsches Passwort');
        }
        
        // Create session
        this.createSession(user.id);
        
        // Set current user
        AuthState.currentUser = user;
        AuthState.isAuthenticated = true;
        
        // Update last login
        user.lastLogin = new Date().toISOString();
        this.saveUsers();
        
        return user;
    }
    
    async logout() {
        this.clearSession();
        AuthState.currentUser = null;
        AuthState.isAuthenticated = false;
        
        return true;
    }
    
    // ============================================
    // Current User
    // ============================================
    
    getCurrentUser() {
        return AuthState.currentUser;
    }
    
    isAuthenticated() {
        return AuthState.isAuthenticated;
    }
    
    getToken() {
        return AuthState.token;
    }
    
    // ============================================
    // Password Hashing (for real implementation)
    // ============================================
    
    async hashPassword(password) {
        // In a real implementation, use bcrypt or similar
        // For demo purposes, we'll just return the password
        return password;
    }
    
    async verifyPassword(password, hash) {
        // In a real implementation, verify the hash
        // For demo purposes, just compare
        return password === hash;
    }
}

// ============================================
// Helper Functions
// ============================================

function generateUUID() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        const r = Math.random() * 16 | 0;
        const v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

// ============================================
// Initialize Module
// ============================================

// Initialize authentication module
Auth.init();

// Export for use in other modules
window.Auth = Auth;
window.AuthState = AuthState;
window.User = User;
window.Session = Session;
