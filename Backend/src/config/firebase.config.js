const admin = require('firebase-admin');

let firebaseApp;
let auth = null;
let db = null;
let isMock = false;

// Mock Auth (Backup)
// If real Firebase fails, this allows the app to run and save data locally
const mockAuth = {
  verifyIdToken: async (token) => {
    // If testing, return a dummy user ID so MongoDB can save it
    return { 
      uid: 'mock-uid-12345', 
      email: 'test@example.com',
      email_verified: true 
    };
  },
  getUser: async (uid) => ({ uid, email: 'test@example.com' })
};

// 2. Initialize
try {
  // Check if we have the private key for real Firebase
  if (process.env.FIREBASE_PRIVATE_KEY) {
    if (!admin.apps.length) {
      const serviceAccount = {
        project_id: process.env.FIREBASE_PROJECT_ID,
        client_email: process.env.FIREBASE_CLIENT_EMAIL,
        // Handle newlines in private key correctly
        private_key: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
      };

      firebaseApp = admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
      });
    } else {
      firebaseApp = admin.app();
    }
    
    auth = admin.auth(); // Real Auth
    console.log("✅ Firebase connection established");
    
  } else {
    throw new Error("Missing FIREBASE_PRIVATE_KEY in .env");
  }

} catch (error) {
  console.error("⚠️ Firebase Error:", error.message);
  console.log("⚠️ Switching to Mock Auth so MongoDB can still store data.");
  
  auth = mockAuth; // Assign Backup Auth
  isMock = true;
}

// 3. Export
module.exports = { admin, auth, db, isMock };