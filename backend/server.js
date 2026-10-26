require('dotenv').config();
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const { initDb, findUserByEmail, createUser } = require('./database');
const authMiddleware = require('./authMiddleware');

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'vistora_super_secret_jwt_key_2026_auth_secure';
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173';

// CORS configuration supporting credentials (cookies)
const allowedOrigins = [
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'http://localhost:3000',
  CLIENT_URL
].filter(Boolean);

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(null, true); // Allow during dev
    }
  },
  credentials: true
}));

app.use(express.json());
app.use(cookieParser());

// Cookie configuration
const getCookieOptions = () => ({
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax',
  maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
});

// Helper: Email validation
const isValidEmail = (email) => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email).trim());
};

// ==========================================
// ROUTES
// ==========================================

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'Vistora Auth API', timestamp: new Date() });
});

// REGISTER
app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, password, confirmPassword } = req.body;

    // Validate name
    if (!name || typeof name !== 'string' || name.trim().length < 2) {
      return res.status(400).json({
        success: false,
        field: 'name',
        message: 'Name must be at least 2 characters.'
      });
    }

    // Validate email
    if (!email || !isValidEmail(email)) {
      return res.status(400).json({
        success: false,
        field: 'email',
        message: 'Please provide a valid email address.'
      });
    }

    // Validate password
    if (!password || typeof password !== 'string' || password.length < 6) {
      return res.status(400).json({
        success: false,
        field: 'password',
        message: 'Password must be at least 6 characters long.'
      });
    }

    // Validate confirm password
    if (confirmPassword !== undefined && password !== confirmPassword) {
      return res.status(400).json({
        success: false,
        field: 'confirmPassword',
        message: 'Passwords do not match.'
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    // Check for duplicate email
    const existingUser = await findUserByEmail(normalizedEmail);
    if (existingUser) {
      return res.status(409).json({
        success: false,
        field: 'email',
        message: 'An account with this email already exists. Please log in.'
      });
    }

    // Hash password securely (never store plain-text passwords!)
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Save user
    const newUser = await createUser({
      name: name.trim(),
      email: normalizedEmail,
      password: hashedPassword
    });

    // Generate JWT
    const token = jwt.sign(
      { id: newUser.id, email: newUser.email },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Set secure HttpOnly cookie
    res.cookie('token', token, getCookieOptions());

    return res.status(201).json({
      success: true,
      message: 'Account created successfully! Welcome to Vistora.',
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        createdAt: newUser.createdAt
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error during registration. Please try again.'
    });
  }
});

// LOGIN
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !isValidEmail(email)) {
      return res.status(400).json({
        success: false,
        field: 'email',
        message: 'Please enter a valid email address.'
      });
    }

    if (!password || typeof password !== 'string') {
      return res.status(400).json({
        success: false,
        field: 'password',
        message: 'Password is required.'
      });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const user = await findUserByEmail(normalizedEmail);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password. Please check your credentials.'
      });
    }

    // Compare bcrypt hash
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password. Please check your credentials.'
      });
    }

    // Generate JWT
    const token = jwt.sign(
      { id: user.id, email: user.email },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Set secure HttpOnly cookie
    res.cookie('token', token, getCookieOptions());

    return res.status(200).json({
      success: true,
      message: 'Login successful! Welcome back.',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error during login. Please try again.'
    });
  }
});

// GET CURRENT SESSION / ME
app.get('/api/auth/me', authMiddleware, (req, res) => {
  return res.status(200).json({
    success: true,
    user: req.user
  });
});

// GET USER PROFILE (Protected)
app.get('/api/auth/profile', authMiddleware, (req, res) => {
  return res.status(200).json({
    success: true,
    profile: {
      id: req.user.id,
      name: req.user.name,
      email: req.user.email,
      memberSince: req.user.createdAt || new Date().toISOString()
    }
  });
});

// LOGOUT
app.post('/api/auth/logout', (req, res) => {
  res.clearCookie('token', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax'
  });

  return res.status(200).json({
    success: true,
    message: 'Logged out successfully.'
  });
});

// Start server
async function startServer() {
  await initDb(process.env.MONGODB_URI);
  app.listen(PORT, () => {
    console.log(` Vistora Auth Server listening on port ${PORT}`);
  });
}

startServer();
