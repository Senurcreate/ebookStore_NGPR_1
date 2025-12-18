import React, { useState, useRef } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';

const UserProfilePage = () => {
  // --- States ---
  
  // 1. Profile Section States
  const [username, setUsername] = useState("John Doe");
  const [profilePic, setProfilePic] = useState("https://randomuser.me/api/portraits/men/32.jpg");
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [tempUsername, setTempUsername] = useState(""); 
  const fileInputRef = useRef(null);

  // 2. Email Section States
  const [email, setEmail] = useState("john.doe@gmail.com");
  const [isEditingEmail, setIsEditingEmail] = useState(false);
  const [tempEmail, setTempEmail] = useState("");

  // 3. Password Section States
  const [isEditingPassword, setIsEditingPassword] = useState(false);
  const [passwordInput, setPasswordInput] = useState("");
  const [confirmPasswordInput, setConfirmPasswordInput] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  
  // 4. Preferences
  const [notifications, setNotifications] = useState(true);

  // --- Handlers ---

  // Navigation Handler (For the new buttons)
  const handleNavigation = (destination) => {
    // In a real app, you would use: navigate(`/${destination}`)
    alert(`Navigating to ${destination}...`);
  };

  // Profile Handlers
  const startEditingProfile = () => {
    setTempUsername(username);
    setIsEditingProfile(true);
  };

  const saveProfile = () => {
    setIsEditingProfile(false);
    // Backend save logic here
  };

  const cancelProfile = () => {
    setUsername(tempUsername); 
    setIsEditingProfile(false);
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfilePic(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Email Handlers
  const startEditingEmail = () => {
    setTempEmail(email);
    setIsEditingEmail(true);
  };

  const cancelEmail = () => {
    setEmail(tempEmail);
    setIsEditingEmail(false);
  };

  // Password Handlers
  const cancelPassword = () => {
    setPasswordInput("");
    setConfirmPasswordInput("");
    setIsEditingPassword(false);
  };

  return (
    <div className="min-vh-100 bg-light font-sans py-4">

      {/* --- Main Content --- */}
      <div className="container py-5" style={{ maxWidth: '1000px' }}>
        
        {/* Row 1: Profile Header & Quick Actions */}
        <div className="row g-4 mb-4">
          
          {/* Profile Card */}
          <div className="col-md-8">
            <div className="card border-0 shadow-sm h-100 overflow-hidden" style={{ borderRadius: '15px' }}>
              <div className="card-body p-0 position-relative d-flex align-items-center">
                <div className="position-absolute bottom-0 w-100" style={{ height: '35%', background: 'linear-gradient(90deg, #a2d2ff 0%, #c8b6ff 100%)', opacity: 0.6 }}></div>

                <div className="d-flex align-items-center p-4 position-relative z-10 w-100">
                  <div className="position-relative me-4">
                    <img 
                      src={profilePic} 
                      alt="Profile" 
                      className="rounded-circle border border-3 border-white shadow-sm"
                      style={{ width: '100px', height: '100px', objectFit: 'cover' }} 
                    />
                    <input 
                        type="file" 
                        ref={fileInputRef} 
                        style={{ display: 'none' }} 
                        accept="image/*"
                        onChange={handleImageUpload}
                    />
                    <button 
                        className="btn btn-primary btn-sm position-absolute bottom-0 end-0 rounded-circle d-flex align-items-center justify-content-center p-0" 
                        style={{ width: '30px', height: '30px' }}
                        onClick={() => fileInputRef.current.click()}
                        title="Change Photo"
                    >
                      <i className="bi bi-camera text-white"></i>
                    </button>
                  </div>
                  
                  <div className="flex-grow-1">
                    {isEditingProfile ? (
                        <div className="d-flex align-items-center gap-2">
                             <input 
                                type="text" 
                                className="form-control form-control-lg" 
                                value={username} 
                                onChange={(e) => setUsername(e.target.value)}
                                style={{ maxWidth: '300px' }}
                             />
                             <button className="btn btn-success " onClick={saveProfile}>Save</button>
                             <button className="btn btn-outline-secondary" onClick={cancelProfile}>Cancel</button>
                        </div>
                    ) : (
                        <div className="d-flex align-items-center gap-2">
                            <h2 className="fw-normal mb-0 text-dark">{username}</h2>
                            <i 
                                className="bi bi-pencil-square text-muted cursor-pointer fs-5" 
                                onClick={startEditingProfile}
                                style={{ cursor: 'pointer' }}
                                title="Edit Profile Name"
                            ></i>
                        </div>
                    )}
                    <p className="text-muted mb-0 mt-1">Member since 2014</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Action: Wishlist (CLICKABLE) */}
          <div className="col-md-2" onClick={() => handleNavigation('wishlist')}>
            <div className="card border-0 shadow-sm d-flex flex-column align-items-center justify-content-center py-4 text-decoration-none" 
                 role="button"
                 style={{ borderRadius: '15px', aspectRatio: '1', cursor: 'pointer', transition: 'transform 0.2s' }}
                 onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.02)'}
                 onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
            >
              <div className="bg-primary bg-opacity-10 p-3 rounded-circle mb-2 text-primary" 
              ><i className="bi bi-heart fs-5"></i></div>
              <span className="fw-medium text-dark">Wishlist</span>
            </div>
          </div>

          {/* Quick Action: Downloads (CLICKABLE) */}
          <div className="col-md-2" onClick={() => handleNavigation('downloads')}>
            <div className="card border-0 shadow-sm d-flex flex-column align-items-center justify-content-center py-4 text-decoration-none" 
                 role="button"
                 style={{ borderRadius: '15px', aspectRatio: '1', cursor: 'pointer', transition: 'transform 0.2s' }}
                 onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.02)'}
                 onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
            >
              <div className="bg-primary bg-opacity-10 p-3 rounded-circle mb-2 text-primary"><i className="bi bi-download fs-5"></i></div>
              <span className="fw-medium text-dark">Downloads</span>
            </div>
          </div>
        </div>

        {/* Row 2: Account Settings */}
        <div className="card border-0 shadow-sm mb-4" style={{ borderRadius: '15px' }}>
          <div className="card-body p-4">
            <h5 className="card-title mb-4 fw-normal fw-bold">Account Settings</h5>
            
            <div className="mb-4 pb-3 border-bottom">
              <label className="form-label fw-medium">Change Email</label>
              <div className="d-flex justify-content-between align-items-center">
                {isEditingEmail ? (
                  <div className="d-flex gap-2 w-100 max-w-50">
                      <input 
                        type="email" 
                        className="form-control" 
                        value={email} 
                        onChange={(e) => setEmail(e.target.value)}
                      />
                  </div>
                ) : (
                  <span className="text-muted">{email}</span>
                )}
                
                <div className="ms-3">
                    {isEditingEmail ? (
                        <div className="d-flex gap-2">
                            <button className="btn btn-outline-secondary px-3 rounded-3" onClick={cancelEmail}>Cancel</button>
                            <button className="btn btn-primary px-3 rounded-3" onClick={() => setIsEditingEmail(false)}>Save</button>
                        </div>
                    ) : (
                        <button className="btn btn-outline-secondary px-4 rounded-3" onClick={startEditingEmail}>Edit</button>
                    )}
                </div>
              </div>
            </div>

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
                               <button className="btn btn-outline-secondary" onClick={() => setShowPassword(!showPassword)}>
                                  <i className={`bi ${showPassword ? 'bi-eye-slash' : 'bi-eye'}`}></i>
                              </button>
                          </div>
                      </div>
                      <div className="d-flex gap-2 justify-content-end">
                          <button className="btn btn-outline-secondary rounded-3" onClick={cancelPassword}>Cancel</button>
                          <button className="btn btn-primary rounded-3" onClick={() => setIsEditingPassword(false)}>Save Changes</button>
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

        {/* Row 3: Preferences */}
        <div className="card border-0 shadow-sm mb-4" style={{ borderRadius: '15px' }}>
          <div className="card-body p-4">
            <h5 className="card-title mb-4 fw-normal fw-bold">Preferences</h5>
            <div className="d-flex justify-content-between align-items-center">
              <div>
                <div className="fw-medium">Notifications</div>
                <div className="text-muted small">Receive updates and recommendations</div>
              </div>
              <div className="form-check form-switch">
                <input className="form-check-input" type="checkbox" style={{ width: '3em', height: '1.5em', cursor: 'pointer' }} checked={notifications} onChange={() => setNotifications(!notifications)} />
              </div>
            </div>
          </div>
        </div>

        {/* Row 4: Privacy */}
        <div className="card border-0 shadow-sm" style={{ borderRadius: '15px' }}>
          <div className="card-body p-4">
            <h5 className="card-title mb-4 fw-normal fw-bold">Privacy & Security</h5>
            <div className="d-flex justify-content-between align-items-center">
              <div>
                <div className="fw-medium">Delete Account</div>
                <div className="text-muted small">Permanently delete your account</div>
              </div>
              <button className="btn btn-danger px-4 rounded-3 bg-light text-danger">Delete</button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default UserProfilePage;