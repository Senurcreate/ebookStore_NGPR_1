// ProfilePage.jsx
import React, { useState, useRef } from 'react';
import 'bootstrap-icons/font/bootstrap-icons.css';
import '../styles/main.scss';

const ProfilePage = () => {
  // User state
  const [user, setUser] = useState({
    name: 'John Doe',
    email: 'john.doe@gmail.com',
    password: '••••••••',
    joinDate: '2014',
    profilePicture: null
  });
  
  const [theme, setTheme] = useState('light');
  const [notifications, setNotifications] = useState(true);
  const [fontSize, setFontSize] = useState('medium');
  
  // Editing states
  const [editingName, setEditingName] = useState(false);
  const [editingEmail, setEditingEmail] = useState(false);
  const [editingPassword, setEditingPassword] = useState(false);
  const [tempName, setTempName] = useState(user.name);
  const [tempEmail, setTempEmail] = useState(user.email);
  const [tempPassword, setTempPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  const fileInputRef = useRef(null);

  // Handle profile picture upload
  const handleProfilePictureClick = () => {
    fileInputRef.current.click();
  };

  const handleProfilePictureChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setUser(prev => ({ ...prev, profilePicture: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle name edit
  const handleNameEdit = () => {
    if (editingName) {
      setUser(prev => ({ ...prev, name: tempName }));
    } else {
      setTempName(user.name);
    }
    setEditingName(!editingName);
  };

  // Handle email edit
  const handleEmailEdit = () => {
    if (editingEmail) {
      setUser(prev => ({ ...prev, email: tempEmail }));
    } else {
      setTempEmail(user.email);
    }
    setEditingEmail(!editingEmail);
  };

  // Handle password edit
  const handlePasswordEdit = () => {
    if (editingPassword) {
      // Validate passwords match
      if (tempPassword !== confirmPassword) {
        alert("Passwords don't match!");
        return;
      }
      // Only update if new password is not empty
      if (tempPassword.trim() !== '') {
        setUser(prev => ({ 
          ...prev, 
          password: '•'.repeat(tempPassword.length) // Create masked password
        }));
      }
      // Clear temporary fields
      setTempPassword('');
      setConfirmPassword('');
    } else {
      setTempPassword('');
      setConfirmPassword('');
    }
    setEditingPassword(!editingPassword);
    setShowPassword(false);
  };

  // Handle key press for inputs
  const handleKeyPress = (e, type) => {
    if (e.key === 'Enter') {
      switch(type) {
        case 'name':
          handleNameEdit();
          break;
        case 'email':
          handleEmailEdit();
          break;
        case 'password':
          handlePasswordEdit();
          break;
        default:
          break;
      }
    }
  };

  // Toggle password visibility
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  // Font size options
  const fontSizeOptions = [
    { value: 'small', label: 'Small' },
    { value: 'medium', label: 'Medium' },
    { value: 'large', label: 'Large' }
  ];

  // Wishlist data
  const wishlistItems = [
    { title: 'Wishlist', count: 0, icon: 'bi-heart' },
    { title: 'Downloads', count: 0, icon: 'bi-download' }
  ];

  return (
    <div className="profile-page mt-5 pt-5">
      <div className="row justify-content-center">
        <div className="col-lg-8 col-xl-6">
          {/* Profile Header with Wishlist buttons */}
          <div className="profile-header mb-5">
            <div className="row align-items-center">
              {/* Left Column - Profile Picture and Info */}
              <div className="col-md-6 mb-4 mb-md-0">
                <div className={`profile-container d-flex align-items-center ${editingName ? 'editing-mode' : ''}`}>
                  {/* Profile Picture */}
                  <div className="position-relative me-4">
                    <div 
                      className="profile-picture-container-large" 
                      onClick={handleProfilePictureClick}
                    >
                      {user.profilePicture ? (
                        <img 
                          src={user.profilePicture} 
                          alt="Profile" 
                          className="profile-picture-large"
                        />
                      ) : (
                        <div className="profile-picture-placeholder-large">
                          <i className="bi bi-person fs-1"></i>
                        </div>
                      )}
                      <div className="profile-picture-overlay-large">
                        <span><i className="bi bi-camera me-1"></i> Change</span>
                      </div>
                    </div>
                  </div>

                  {/* User Name and Info */}
                  <div className="flex-grow-1 position-relative">
                    <div className="d-flex align-items-center">
                      <div className="flex-grow-1">
                        {editingName ? (
                          <div className="editing-name-container d-flex align-items-center flex-wrap">
                            <input
                              type="text"
                              value={tempName}
                              onChange={(e) => setTempName(e.target.value)}
                              onKeyPress={(e) => handleKeyPress(e, 'name')}
                              className="form-control form-control-lg me-2 flex-grow-1"
                              style={{ minWidth: '200px' }}
                              autoFocus
                            />
                            <div className="editing-buttons mt-2 mt-md-0">
                              <button 
                                className="btn btn-sm btn-success me-2"
                                onClick={handleNameEdit}
                                title="Save"
                              >
                                <i className="bi bi-check-lg"></i>
                              </button>
                              <button 
                                className="btn btn-sm btn-danger"
                                onClick={() => {
                                  setTempName(user.name);
                                  setEditingName(false);
                                }}
                                title="Cancel"
                              >
                                <i className="bi bi-x-lg"></i>
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="d-flex align-items-center">
                            <h4 className="h4 mb-0 me-2">{user.name}</h4>
                            <button 
                              className="btn btn-link p-0 edit-name-icon"
                              onClick={() => setEditingName(true)}
                              title="Edit Name"
                            >
                              <i className="bi bi-pencil"></i>
                            </button>
                          </div>
                        )}
                        <p className="text-muted mb-0 mt-2">Member since {user.joinDate}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column - Wishlist Buttons */}
              <div className="col-md-6">
                <div className="row">
                  {wishlistItems.map((item, index) => (
                    <div className="col-md-6" key={index}>
                      <button className="wishlist-button w-100 h-100">
                        <div className="wishlist-button-content">
                          <i className={`wishlist-button-icon ${item.icon}`}></i>
                          <span className="wishlist-button-title">{item.title}</span>
                        </div>
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

         {/* Account Settings */}
          <div className="section mb-5 content-container p-3">
            <h2 className="h4 mb-3">Account Settings</h2>
            
            <div className="section-content">
              {/* Change Email */}
              <div className="mb-4">
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <h3 className="h6 mb-0">Change Email</h3>
                </div>
                <div className="d-flex align-items-center">
                  {editingEmail ? (
                    <div className="d-flex align-items-center w-100">
                      <input
                        type="email"
                        value={tempEmail}
                        onChange={(e) => setTempEmail(e.target.value)}
                        className="form-control me-2"
                        autoFocus
                      />
                      <button 
                        className="btn btn-outline-secondary me-2"
                        onClick={() => {
                          setTempEmail(user.email);
                          setEditingEmail(false);
                        }}
                      >
                        Cancel
                      </button>
                      <button 
                        className="btn btn-primary"
                        onClick={handleEmailEdit}
                      >
                        Save
                      </button>
                    </div>
                  ) : (
                    <>
                      <span className="text-muted">{user.email}</span>
                      <button 
                        className="btn btn-link ms-auto"
                        onClick={handleEmailEdit}
                      >
                        Edit
                      </button>
                    </>
                  )}
                </div>
              </div>

              {/* Change Password */}
              <div className="mb-4">
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <h3 className="h6 mb-0">Change Password</h3>
                </div>
                <div className="d-flex align-items-center">
                  {editingPassword ? (
                    <div className="w-100">
                      <div className="mb-2">
                        <div className="input-group">
                          <input
                            type={showPassword ? "text" : "password"}
                            value={tempPassword}
                            onChange={(e) => setTempPassword(e.target.value)}
                            className="form-control"
                            placeholder="New password"
                            autoFocus
                          />
                          <button 
                            className="btn btn-outline-secondary"
                            type="button"
                            onClick={togglePasswordVisibility}
                          >
                            <i className={`bi ${showPassword ? 'bi-eye-slash' : 'bi-eye'}`}></i>
                          </button>
                        </div>
                      </div>
                      <div className="mb-3">
                        <div className="input-group">
                          <input
                            type={showPassword ? "text" : "password"}
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className="form-control"
                            placeholder="Confirm new password"
                          />
                          <button 
                            className="btn btn-outline-secondary"
                            type="button"
                            onClick={togglePasswordVisibility}
                          >
                            <i className={`bi ${showPassword ? 'bi-eye-slash' : 'bi-eye'}`}></i>
                          </button>
                        </div>
                      </div>
                      <div className="d-flex align-items-center">
                        <button 
                          className="btn btn-outline-secondary me-2"
                          onClick={() => {
                            setTempPassword('');
                            setConfirmPassword('');
                            setEditingPassword(false);
                          }}
                        >
                          Cancel
                        </button>
                        <button 
                          className="btn btn-primary"
                          onClick={handlePasswordEdit}
                          disabled={!tempPassword || !confirmPassword}
                        >
                          Save
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <span className="text-muted">{user.password}</span>
                      <button 
                        className="btn btn-link ms-auto"
                        onClick={handlePasswordEdit}
                      >
                        Edit
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Notifications */}
          <div className="section mb-5 content-container p-4">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h2 className="h4 mb-0">Notifications</h2>
            </div>
            <div className="section-content">
              <div className="setting-item d-flex justify-content-between align-items-center">
                <div className="setting-info">
                  <h3 className="h6 mb-1">Email Notifications</h3>
                  <p className="text-muted mb-0 small">Receive updates and recommendations</p>
                </div>
                <div className="setting-actions">
                  <div className="form-check form-switch mb-0">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      id="notificationsSwitch"
                      checked={notifications}
                      onChange={(e) => setNotifications(e.target.checked)}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Privacy & Security */}
          <div className="section mb-5 content-container p-4">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h2 className="h4 mb-0">Privacy & Security</h2>
            </div>
            <div className="section-content">
              <div className="setting-item d-flex justify-content-between align-items-center">
                <div className="setting-info">
                  <h3 className="h6 mb-1">Delete Account</h3>
                  <p className="text-muted mb-0 small">Permanently delete your account and all data</p>
                </div>
                <div className="setting-actions">
                  <button className="btn btn-outline-danger btn-sm">
                    Delete
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Hidden file input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleProfilePictureChange}
        accept="image/*"
        style={{ display: 'none' }}
      />
    </div>
  );
};

export default ProfilePage;