import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import PP from "../assets/ProfilePic.jfif"
import { auth} from "../firebase/firebase.config";
import { useAuth } from '../context/AuthContext';
import { 
  fetchUserProfile, 
  updateUserProfile, 
  changeUserPassword, 
  deleteUserProfile 
} from '../services/user.service';
import axios from 'axios';
import DeletePopup from '../components/DeletePopup'; 
import { 
  EmailAuthProvider, 
  reauthenticateWithCredential, 
  GoogleAuthProvider, 
  reauthenticateWithPopup 
} from "firebase/auth";

// A reliable default avatar image
const DEFAULT_PROFILE_PIC = PP;

const UserProfilePage = () => {
  const navigate = useNavigate();
  const { currentUser, setCurrentUser, logout } = useAuth(); 
  const fileInputRef = useRef(null);

  // --- States ---
  const [loading, setLoading] = useState(false);
  const [uploadingImg, setUploadingImg] = useState(false);
  const [memberSince, setMemberSince] = useState("");
  const [showDeletePopup, setShowDeletePopup] = useState(false);

  // 1. Profile Section States
  const [username, setUsername] = useState("");
  const [profilePic, setProfilePic] = useState(DEFAULT_PROFILE_PIC);
  
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [tempUsername, setTempUsername] = useState(""); 

  // 2. Email Section States
  const [email, setEmail] = useState("");
  const [isEditingEmail, setIsEditingEmail] = useState(false);
  const [tempEmail, setTempEmail] = useState("");

  // 3. Password Section States
  const [isEditingPassword, setIsEditingPassword] = useState(false);
  const [passwordInput, setPasswordInput] = useState("");
  const [confirmPasswordInput, setConfirmPasswordInput] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // --- LOAD DATA ---
  useEffect(() => {
    const loadData = async () => {
      try {
        const response = await fetchUserProfile();
        const user = response.data || response; 
        
        if(user) {
          setUsername(user.displayName);
          setEmail(user.email);
          setProfilePic(user.photoURL || currentUser?.photoURL || DEFAULT_PROFILE_PIC);
          
          const dateStr = user.accountCreatedAt || user.createdAt || new Date();
          const date = new Date(dateStr);
          setMemberSince(date.toLocaleDateString('en-US', { year: 'numeric', month: 'long' }));
        }
      } catch (error) {
        console.error("Error loading profile:", error);
        setProfilePic(currentUser?.photoURL || DEFAULT_PROFILE_PIC);
      }
    };
    loadData();
  }, []); 

  // --- IMAGE UPLOAD HELPER ---
  const uploadToCloudinary = async (file) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", "User profiles"); 
    formData.append("cloud_name", "dw36r53yn"); 

    try {
        const res = await axios.post(
            "https://api.cloudinary.com/v1_1/dw36r53yn/image/upload", 
            formData
        );
        return res.data.secure_url;
    } catch (error) {
        console.error("Cloudinary Error:", error);
        throw new Error("Image upload failed");
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // 1. Immediate Preview
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onloadend = async () => {
        const base64String = reader.result;
        setProfilePic(base64String); 
        setUploadingImg(true);

        try {
            // 2. Upload to Cloudinary
            const cloudImageUrl = await uploadToCloudinary(file);
            
            // 3. Save to Backend
            await updateUserProfile({ photoURL: cloudImageUrl });
            
            // 4. Update Context
            if (setCurrentUser) {
                setCurrentUser(prev => ({ ...prev, photoURL: cloudImageUrl }));
            }
        } catch (error) {
            console.error("Save error:", error);
            // Revert on failure to the previous image or default
            setProfilePic(currentUser?.photoURL || DEFAULT_PROFILE_PIC);
            alert("Failed to upload image.");
        } finally {
            setUploadingImg(false);
        }
    };
  };

  // --- PROFILE HANDLERS ---
  const startEditingProfile = () => { 
    setTempUsername(username); 
    setIsEditingProfile(true); 
  };
  
  const cancelProfile = () => { 
    setUsername(tempUsername); 
    setIsEditingProfile(false); 
  };

  const saveProfile = async (e) => {
    if (e) e.preventDefault(); 
    if (!username.trim()) return alert("Username cannot be empty");

    try {
      setLoading(true);
      await updateUserProfile({ displayName: username });
      alert("Username updated successfully! Please log in again to see the changes.");
      
      await logout();
      navigate('/login');
    } catch (error) {
      console.error("Username update failed:", error);
      alert("Failed to update username: " + (error.message || "Unknown error"));
      setUsername(tempUsername); 
    } finally {
      setLoading(false);
    }
  };

  // --- EMAIL HANDLERS (These were missing) ---
  const startEditingEmail = () => { 
    setTempEmail(email); 
    setIsEditingEmail(true); 
  };
  
  const cancelEmail = () => { 
    setEmail(tempEmail); 
    setIsEditingEmail(false); 
  };

  const saveEmail = async () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) return alert("Invalid email format");

    try {
      setLoading(true);
      await updateUserProfile({ email: email });
      alert("Email updated successfully! Please log in again.");
      
      await logout();
      navigate('/login'); 
    } catch (error) {
      console.error("Email update error:", error);
      if (error.code === 'auth/requires-recent-login' || error.message?.includes('recent-login')) {
          alert("Security Alert: To change your email, you must have logged in recently. Please log out, log back in, and try again.");
      } else {
          alert("Failed to update email: " + (error.message || "Email might be already in use."));
      }
      setEmail(tempEmail);
    } finally {
      setLoading(false);
    }
  };

  // --- PASSWORD HANDLERS ---
  const cancelPassword = () => { 
    setPasswordInput(""); 
    setConfirmPasswordInput(""); 
    setIsEditingPassword(false); 
  };

  const handleSavePassword = async () => {
    if (passwordInput !== confirmPasswordInput) return alert("Passwords mismatch");
    if (passwordInput.length < 6) return alert("Too short");

    try {
        setLoading(true);
        await changeUserPassword(passwordInput);
        alert("Password changed successfully! Please log in again.");
        
        await logout(); 
        navigate('/login'); 
    } catch (error) {
        console.error("Password change failed:", error);
        const msg = error.code === 'auth/requires-recent-login' 
            ? "For security, please log out and log in again before changing your password."
            : error.message || "Failed to update password";
        alert(msg);
    } finally {
        setLoading(false);
    }
  };

  // --- DELETE ACCOUNT HANDLER ---
 const handleDeleteAccount = async () => {
    // 1. Confirmation
    if (!window.confirm("Are you sure you want to delete your account? This cannot be undone.")) {
      return;
    }

    try {
      setLoading(true);

      const user = auth.currentUser;

      // STEP 1: Backend Deletion (MongoDB)
      try {
        await deleteUserProfile(); 
      } catch (backendError) {
        console.warn("Backend deletion had issues, proceeding to Auth deletion:", backendError);
      }

      // STEP 2: Firebase Deletion (Auth)
      if (user) {
        try {
           await user.delete();
        } catch (error) {
           if (error.code === 'auth/requires-recent-login') {
              const password = prompt("Security Check: Please enter your password to confirm deletion:");
              if (!password) {
                 alert("Deletion cancelled. Password required.");
                 setLoading(false);
                 return;
              }

              const credential = EmailAuthProvider.credential(user.email, password);
              await reauthenticateWithCredential(user, credential);
              await user.delete();
           } else {
              throw error; 
           }
        }
      }

      alert("Your account has been successfully deleted.");
      setShowDeletePopup(false);
      
      // STEP 3: Logout & Force Redirect
      await logout();
      
      // FIX: Use window.location.href instead of navigate
      // This forces the browser to leave the page immediately
      window.location.href = '/signup'; 

    } catch (error) {
      console.error("Deletion error:", error);
      alert("Failed to delete account: " + (error.message || "Unknown error"));
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="min-vh-100 bg-light font-sans py-4">
        <div className="container py-5" style={{ maxWidth: '1000px' }}>
        <div className="row g-4 mb-4">
          <div className="col-md-6">
            <div className="card border-0 shadow-sm h-100 overflow-hidden" style={{ borderRadius: '15px' }}>
              <div className="card-body p-0 position-relative d-flex align-items-center">
                <div className="position-absolute bottom-0 w-100" style={{ height: '35%', background: 'linear-gradient(90deg, #a2d2ff 0%, #c8b6ff 100%)', opacity: 0.6 }}></div>
                <div className="d-flex align-items-center p-4 position-relative z-10 w-100">
                  <div className="position-relative me-4">
                    <img src={profilePic} alt="Profile" className="rounded-circle border border-3 border-white shadow-sm" style={{ width: '100px', height: '100px', objectFit: 'cover', backgroundColor: '#fff' }} />
                    <input type="file" ref={fileInputRef} style={{ display: 'none' }} accept="image/*" onChange={handleImageUpload} />
                    <button className="btn btn-primary btn-sm position-absolute bottom-0 end-0 rounded-circle d-flex align-items-center justify-content-center p-0" style={{ width: '30px', height: '30px' }} onClick={() => fileInputRef.current.click()} disabled={uploadingImg}>
                      {uploadingImg ? <span className="spinner-border spinner-border-sm text-white" /> : <i className="bi bi-camera text-white"></i>}
                    </button>
                  </div>
                  <div className="flex-grow-1">
                    {isEditingProfile ? (
                        <div className="d-flex align-items-center gap-2">
                             <input type="text" className="form-control form-control-lg" value={username} onChange={(e) => setUsername(e.target.value)} style={{ maxWidth: '300px' }} />
                             <button type="button" className="btn btn-success" onClick={saveProfile} disabled={loading}>Save</button>
                             <button type="button" className="btn btn-outline-secondary" onClick={cancelProfile}>Cancel</button>
                        </div>
                    ) : (
                        <div className="d-flex align-items-center gap-2">
                            <h2 className="fw-normal mb-0 text-dark">{username}</h2>
                            <i className="bi bi-pencil-square text-muted cursor-pointer fs-5" onClick={startEditingProfile} style={{ cursor: 'pointer' }}></i>
                        </div>
                    )}
                    <p className="text-muted mb-0 mt-1">Member since {memberSince || '...'}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          {/* Quick Actions */}
           <div className="col-md-2" onClick={() => navigate('/wishlist')} style={{cursor: 'pointer'}}>
            <div className="card border-0 shadow-sm d-flex flex-column align-items-center justify-content-center py-4">
              <div className="bg-primary bg-opacity-10 p-3 rounded-circle mb-2 text-primary"><i className="bi bi-heart me-1 ms-1 fs-5"></i></div>
              <span className="fw-medium text-dark">Wishlist</span>
            </div>
          </div>
          <div className="col-md-2" onClick={() => navigate('/orders')} style={{cursor: 'pointer'}}>
            <div className="card border-0 shadow-sm d-flex flex-column align-items-center justify-content-center py-4">
              <div className="bg-primary bg-opacity-10 p-3 rounded-circle mb-2 text-primary"><i className="bi bi-bag-check me-1 ms-1 fs-5"></i></div>
              <span className="fw-medium text-dark">Orders</span>
            </div>
          </div>
          <div className="col-md-2" onClick={() => navigate('/downloads')} style={{cursor: 'pointer'}}>
            <div className="card border-0 shadow-sm d-flex flex-column align-items-center justify-content-center py-4">
              <div className="bg-primary bg-opacity-10 p-3 rounded-circle mb-2 text-primary"><i className="bi bi-download me-1 ms-1 fs-5"></i></div>
              <span className="fw-medium text-dark">History</span>
            </div>
          </div>
        </div>
        
        {/* Account Settings */}
        <div className="card border-0 shadow-sm mb-4" style={{ borderRadius: '15px' }}>
          <div className="card-body p-4">
            <h5 className="card-title mb-4 fw-normal fw-bold">Account Settings</h5>
            <div className="mb-4 pb-3 border-bottom">
              <label className="form-label fw-medium">Email Address</label>
              <div className="d-flex justify-content-between align-items-center">
                {isEditingEmail ? <input type="email" className="form-control" value={email} onChange={(e) => setEmail(e.target.value)} /> : <span className="text-muted">{email}</span>}
                <div className="ms-3">
                    {isEditingEmail ? (
                        <div className="d-flex gap-2">
                            <button className="btn btn-outline-secondary px-3" onClick={cancelEmail}>Cancel</button>
                            <button className="btn btn-primary px-3" onClick={saveEmail} disabled={loading}>Save</button>
                        </div>
                    ) : <button className="btn btn-outline-secondary px-4" onClick={startEditingEmail}>Edit</button>}
                </div>
              </div>
            </div>
            {/* Password Section */}
            <div>
              <label className="form-label fw-medium">Change Password</label>
              {isEditingPassword ? (
                  <div className="bg-light p-3 rounded-3 mt-2">
                      <div className="mb-3">
                          <label className="form-label small text-muted">New Password</label>
                          <div className="input-group">
                              <input 
                                type={showPassword ? "text" : "password"} 
                                className="form-control" 
                                placeholder="Enter new password"
                                value={passwordInput}
                                onChange={(e) => setPasswordInput(e.target.value)}
                              />
                              <button className="btn btn-outline-secondary" onClick={() => setShowPassword(!showPassword)}>
                                  <i className={`bi ${showPassword ? 'bi-eye-slash' : 'bi-eye'}`}></i>
                              </button>
                          </div>
                      </div>
                      <div className="mb-3">
                          <label className="form-label small text-muted">Confirm Password</label>
                          <div className="input-group">
                              <input 
                                type={showPassword ? "text" : "password"} 
                                className="form-control" 
                                placeholder="Confirm new password"
                                value={confirmPasswordInput}
                                onChange={(e) => setConfirmPasswordInput(e.target.value)}
                              />
                          </div>
                      </div>
                      <div className="d-flex gap-2 justify-content-end">
                          <button className="btn btn-outline-secondary rounded-3" onClick={cancelPassword}>Cancel</button>
                          <button className="btn btn-primary rounded-3" onClick={handleSavePassword} disabled={loading}>
                            {loading ? 'Saving...' : 'Save Changes'}
                          </button>
                      </div>
                  </div>
              ) : (
                <div className="d-flex justify-content-between align-items-center">
                    <span className="text-muted fs-4" style={{lineHeight: '0.5'}}>••••••••••</span>
                    <button className="btn btn-outline-secondary px-4 rounded-3" onClick={() => setIsEditingPassword(true)}>Edit</button>
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* Privacy Section */}
        <div className="card border-0 shadow-sm" style={{ borderRadius: '15px' }}>
          <div className="card-body p-4">
            <h5 className="card-title mb-4 fw-normal fw-bold">Privacy & Security</h5>
            <div className="d-flex justify-content-between align-items-center">
              <div>
                <div className="fw-medium">Delete Account</div>
                <div className="text-muted small">Permanently delete your account</div>
              </div>
              <button 
                className="btn btn-danger px-4 rounded-3 bg-light text-danger"
                onClick={() => setShowDeletePopup(true)}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Delete Popup */}
      <DeletePopup 
        isOpen={showDeletePopup} 
        onClose={() => setShowDeletePopup(false)} 
        onDelete={handleDeleteAccount} 
      />
    </div>
  );
};

export default UserProfilePage;