const { auth } = require('../config/firebase.config');
const User = require('../users/user.model');

// --Middleware to verify Firebase ID token--
const verifyFirebaseToken = async (req, res, next) => {
  try {
    // Get token from Authorization header
    const authHeader = req.headers.authorization;
    
    // Check if using mock token for testing
    if (process.env.NODE_ENV === 'development' && 
        (!authHeader || authHeader === 'Bearer mock-token-admin')) {
      console.log('🔐 Development: Using mock admin token');
      
      // Find or create mock admin user
      let user = await User.findOne({ email: 'admin@ebookstore.com' });
      
      if (!user) {
        user = new User({
          firebaseUID: 'mock-admin-uid',
          email: 'admin@ebookstore.com',
          displayName: 'Admin User',
          role: 'admin',
          emailVerified: true,
          lastLoginAt: new Date()
        });
        await user.save();
      } else {
        user.lastLoginAt = new Date();
        await user.save();
      }
      
      req.user = user;
      req.firebaseUser = {
        uid: 'mock-admin-uid',
        email: 'admin@ebookstore.com'
      };
      return next();
    }
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. No token provided.',
        code: 'NO_TOKEN'
      });
    }

    const token = authHeader.split('Bearer ')[1];
    
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. Invalid token format.',
        code: 'INVALID_TOKEN_FORMAT'
      });
    }

    // Verify Firebase token (works with both real and mock auth)
    const decodedToken = await auth.verifyIdToken(token);
    
    if (!decodedToken) {
      return res.status(401).json({
        success: false,
        message: 'Invalid authentication token.',
        code: 'INVALID_TOKEN'
      });
    }

    // Extract user info from Firebase token
    const firebaseUser = {
      uid: decodedToken.uid,
      email: decodedToken.email,
      displayName: decodedToken.name || decodedToken.email?.split('@')[0] || 'User',
      photoURL: decodedToken.picture || '',
      emailVerified: decodedToken.email_verified || false,
      phoneNumber: decodedToken.phone_number || ''
    };

    // Find or create user in our database
    let user = await User.findOne({ firebaseUID: firebaseUser.uid });
    
    if (!user) {
      // Create new user
      user = new User({
        firebaseUID: firebaseUser.uid,
        email: firebaseUser.email,
        displayName: firebaseUser.displayName,
        photoURL: firebaseUser.photoURL,
        phoneNumber: firebaseUser.phoneNumber,
        emailVerified: firebaseUser.emailVerified,
        role: firebaseUser.email === 'admin@ebookstore.com' ? 'admin' : 'user',
        lastLoginAt: new Date()
      });
      
      await user.save();
      console.log(`👤 New user created: ${user.email}`);
    } else {
      // Update existing user's last login and sync info
      user.lastLoginAt = new Date();
      
      // Update user info if changed in Firebase
      const needsUpdate = 
        user.email !== firebaseUser.email ||
        user.displayName !== firebaseUser.displayName ||
        user.photoURL !== firebaseUser.photoURL ||
        user.emailVerified !== firebaseUser.emailVerified ||
        user.phoneNumber !== firebaseUser.phoneNumber;
      
      if (needsUpdate) {
        user.email = firebaseUser.email;
        user.displayName = firebaseUser.displayName;
        user.photoURL = firebaseUser.photoURL;
        user.emailVerified = firebaseUser.emailVerified;
        user.phoneNumber = firebaseUser.phoneNumber;
      }
      
      await user.save();
    }

    // Attach user to request
    req.user = user;
    req.firebaseUser = firebaseUser;
    req.token = decodedToken;

    next();
  } catch (error) {
    console.error('🔒 Firebase token verification error:', error.message);
    
    // Handle specific Firebase errors
    if (error.code === 'auth/id-token-expired') {
      return res.status(401).json({
        success: false,
        message: 'Token has expired. Please login again.',
        code: 'TOKEN_EXPIRED'
      });
    }
    
    if (error.code === 'auth/argument-error') {
      return res.status(401).json({
        success: false,
        message: 'Invalid authentication token.',
        code: 'INVALID_TOKEN'
      });
    }

    // Handle missing Firebase configuration
    if (!auth) {
      return res.status(503).json({
        success: false,
        message: 'Authentication service is temporarily unavailable.',
        code: 'SERVICE_UNAVAILABLE'
      });
    }

    return res.status(401).json({
      success: false,
      message: 'Authentication failed.',
      code: 'AUTH_FAILED',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// --Middleware to check if user has required role--
const requireRole = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Insufficient permissions',
        requiredRoles: roles,
        userRole: req.user.role
      });
    }

    next();
  };
};

// --Middleware to check if user is admin--
const requireAdmin = requireRole('admin');

// --Middleware to check if user is admin or moderator--
const requireAdminOrModerator = requireRole('admin', 'moderator');

// --Optional authentication middleware (doesn't fail if no token)--
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split('Bearer ')[1];
      
      if (token && auth) {
        const decodedToken = await auth.verifyIdToken(token);
        const user = await User.findOne({ firebaseUID: decodedToken.uid });
        
        if (user) {
          req.user = user;
          req.firebaseUser = decodedToken;
        }
      }
    }
    
    next();
  } catch (error) {
    // Silently fail for optional auth
    next();
  }
};

module.exports = {
  verifyFirebaseToken,
  requireRole,
  requireAdmin,
  requireAdminOrModerator,
  optionalAuth
};