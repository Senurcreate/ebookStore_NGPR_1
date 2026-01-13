const express = require('express');
const router = express.Router();
const userController = require('./user.controller');
const { verifyFirebaseToken, requireAdmin, requireAdminOrModerator } = require('../middleware/firebase.middleware');

//  Put this at the very top of routes file
// router.get('/fix-zombie', async (req, res) => {
//   try {
//     // FIX: Use './user.model' because it is in the same folder
//     const User = require('./user.model'); 
    
//     // Delete the specific conflicting email
//     const result = await User.deleteOne({ email: "s23002072@ousl.lk" });
    
//     if (result.deletedCount > 0) {
//         res.send("SUCCESS: Zombie user deleted. Go back and Login/Register.");
//     } else {
//         res.send("Not Found: No user found with that email. You might be safe to login.");
//     }
//   } catch (error) {
//     res.status(500).send("Error: " + error.message);
//   }
// });
// Apply Firebase authentication to all routes
router.use(verifyFirebaseToken);


// USER PROFILE ROUTES
router.get('/me', userController.getCurrentUser);
router.put('/me', userController.updateProfile);
router.patch('/me/preferences', userController.updatePreferences);
router.patch('/me/password', userController.changePassword);
router.delete('/me', userController.deleteMyAccount);

// USER ACTIVITY ROUTES
router.get('/me/stats', userController.getUserStats);
router.get('/me/reading-history', userController.getReadingHistory);
router.post('/me/reading-history', userController.addToReadingHistory);
router.get('/me/purchases', userController.getUserPurchases);
router.get('/me/download-history', userController.getUserDownloadHistory);


// ADMIN ROUTES
router.get('/', requireAdmin, userController.getAllUsers);
router.get('/:id', requireAdmin, userController.getUserById);
router.delete('/:id', requireAdmin, userController.deleteUser);

// MODERATOR ROUTES
router.get('/mod/users', requireAdminOrModerator, userController.getAllUsers);
router.get('/mod/users/:id', requireAdminOrModerator, userController.getUserById);

module.exports = router;