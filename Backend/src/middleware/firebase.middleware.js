const { auth } = require('../config/firebase.config');
const User = require('../users/user.model');

// --Middleware to verify Firebase ID token--
const verifyFirebaseToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    // --- MOCK LOGIC (Keep existing logic for Dev) ---
    if (process.env.NODE_ENV === 'development' && 
        (!authHeader || authHeader === 'Bearer mock-token-admin')) {
      // ... (Keep your existing mock logic exactly as is) ...
      console.log('🔐 Development: Using mock admin token');
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
      req.firebaseUser = { uid: 'mock-admin-uid', email: 'admin@ebookstore.com' };
      return next();
    }
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, message: 'Access denied. No token provided.', code: 'NO_TOKEN' });
    }

    const token = authHeader.split('Bearer ')[1];
    
    // Verify Firebase token
    const decodedToken = await auth.verifyIdToken(token);
    
    // Extract user info
    const firebaseUser = {
      uid: decodedToken.uid,
      email: decodedToken.email,
      displayName: decodedToken.name || decodedToken.email?.split('@')[0] || 'User',
      photoURL: decodedToken.picture || '',
      emailVerified: decodedToken.email_verified || false,
      phoneNumber: decodedToken.phone_number || ''
    };

    // ---------------------------------------------------------
    //  AUTO-HEAL LOGIC STARTS HERE
    // ---------------------------------------------------------

    // 1. Try to find user by Firebase UID (The standard check)
    let user = await User.findOne({ firebaseUID: firebaseUser.uid });
    
    if (user) {
      // SCENARIO A: Normal Login
      // User exists and UIDs match. Just update metadata.
      user.lastLoginAt = new Date();
      if (user.displayName !== firebaseUser.displayName || user.photoURL !== firebaseUser.photoURL) {
          user.displayName = firebaseUser.displayName;
          user.photoURL = firebaseUser.photoURL;
      }
      await user.save();

    } else {
      // User NOT found by UID. This is either a New User OR a Zombie.

      // 2. Check if a user exists with this EMAIL
      const existingUserByEmail = await User.findOne({ email: firebaseUser.email });

      if (existingUserByEmail) {
        // SCENARIO B: The "Zombie" Account (Auto-Heal)
        console.log(`🩹 Auto-healing account for ${firebaseUser.email}. Updating UID.`);
        
        // We adopt the old MongoDB record but update it with the NEW Firebase UID
        existingUserByEmail.firebaseUID = firebaseUser.uid;
        existingUserByEmail.lastLoginAt = new Date();
        existingUserByEmail.photoURL = firebaseUser.photoURL || existingUserByEmail.photoURL;
        
        user = await existingUserByEmail.save();

      } else {
        // SCENARIO C: Brand New User
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
      }
    }

    // ---------------------------------------------------------
    //  LOGIC ENDS
    // ---------------------------------------------------------

    req.user = user;
    req.firebaseUser = firebaseUser;
    req.token = decodedToken;

    next();
  } catch (error) {
    console.error('🔒 Firebase token verification error:', error.message);
    return res.status(401).json({ success: false, message: 'Authentication failed.', code: 'AUTH_FAILED' });
  }
};

const requireRole = (...roles) => {
  return (req, res, next) => {
    if (!req.user) return res.status(401).json({ success: false, message: 'Authentication required' });
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ success: false, message: 'Insufficient permissions' });
    }
    next();
  };
};

module.exports = {
  verifyFirebaseToken,
  requireRole,
  requireAdmin: requireRole('admin'),
  requireAdminOrModerator: requireRole('admin', 'moderator')
};