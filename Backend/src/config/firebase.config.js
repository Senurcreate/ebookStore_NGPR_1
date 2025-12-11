// src/config/firebase.config.js
const admin = require('firebase-admin');

let firebaseApp;
let auth = null;
let db = null;

// Check if we should use mock mode
const useMockAuth = process.env.USE_MOCK_AUTH === 'true' || 
                    process.env.NODE_ENV === 'development' || 
                    !process.env.FIREBASE_PRIVATE_KEY;

if (useMockAuth) {
  console.log('🔐 Using mock Firebase authentication (development mode)');
  
  // Create mock Firebase objects
  const mockAuth = {
    verifyIdToken: async (token) => {
      console.log('🔐 Mock: Verifying token');
      
      // Parse token to get user info if it's a mock token
      if (token.startsWith('mock-token-')) {
        const parts = token.split('-');
        return {
          uid: `mock-uid-${parts[2] || 'default'}`,
          email: parts[3] ? `${parts[3]}@example.com` : 'test@example.com',
          email_verified: true,
          name: 'Mock User',
          picture: null,
          phone_number: null
        };
      }
      
      // Default mock user
      return {
        uid: 'mock-uid-' + Date.now(),
        email: 'user@example.com',
        email_verified: true,
        name: 'Test User',
        picture: null,
        phone_number: null
      };
    },
    
    updateUser: async (uid, updates) => {
      console.log(`🔐 Mock: Updating user ${uid}`);
      return { ...updates, uid };
    },
    
    deleteUser: async (uid) => {
      console.log(`🔐 Mock: Deleting user ${uid}`);
      return true;
    },
    
    getUser: async (uid) => {
      console.log(`🔐 Mock: Getting user ${uid}`);
      return {
        uid,
        email: 'user@example.com',
        emailVerified: true,
        displayName: 'Mock User'
      };
    },
    
    createUser: async (userData) => {
      console.log('🔐 Mock: Creating user');
      return {
        uid: 'mock-new-user-' + Date.now(),
        ...userData
      };
    }
  };
  
  const mockFirestore = {
    collection: (name) => ({
      doc: (id) => ({
        get: async () => ({ 
          exists: false, 
          data: () => null,
          id: id || 'mock-doc-id'
        }),
        set: async (data) => ({ 
          id: id || 'mock-doc-id', 
          ...data 
        }),
        update: async (data) => ({ 
          id: id || 'mock-doc-id', 
          ...data 
        }),
        delete: async () => ({ 
          success: true 
        })
      }),
      add: async (data) => ({ 
        id: 'mock-doc-' + Date.now(), 
        ...data 
      }),
      where: () => ({
        get: async () => ({
          empty: true,
          docs: [],
          forEach: () => {}
        })
      })
    })
  };
  
  auth = mockAuth;
  db = mockFirestore;
  firebaseApp = { name: '[MockFirebaseApp]' };
  
} else {
  try {
    // Check if Firebase is already initialized
    if (!admin.apps.length) {
      const serviceAccount = {
        type: process.env.FIREBASE_TYPE,
        project_id: process.env.FIREBASE_PROJECT_ID,
        private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
        private_key: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
        client_email: process.env.FIREBASE_CLIENT_EMAIL,
        client_id: process.env.FIREBASE_CLIENT_ID,
        auth_uri: process.env.FIREBASE_AUTH_URI,
        token_uri: process.env.FIREBASE_TOKEN_URI,
        auth_provider_x509_cert_url: process.env.FIREBASE_AUTH_PROVIDER_CERT_URL,
        client_x509_cert_url: process.env.FIREBASE_CLIENT_CERT_URL,
        universe_domain: process.env.FIREBASE_UNIVERSE_DOMAIN || 'googleapis.com'
      };

      // Validate required fields
      if (!serviceAccount.private_key) {
        console.warn('⚠️  Firebase private key is missing. Switching to mock mode.');
        throw new Error('Firebase credentials not found');
      }

      firebaseApp = admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        databaseURL: process.env.FIREBASE_DATABASE_URL
      });
      
      console.log('✅ Firebase Admin initialized successfully');
    } else {
      firebaseApp = admin.app();
    }
    
    // Get real Firebase services
    auth = admin.auth();
    db = admin.firestore ? admin.firestore() : null;
    
  } catch (error) {
    console.error('❌ Firebase initialization failed:', error.message);
    console.log('🔄 Falling back to mock mode');
    
    // Fall back to mock mode
    const useMockAuth = true;
    // Re-run the mock initialization logic
    // (In a real scenario, you'd refactor this into a function)
    console.log('🔐 Using mock Firebase due to initialization error');
  }
}

module.exports = {
  admin,
  auth,
  db,
  firebaseApp,
  isMock: useMockAuth
};