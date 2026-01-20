'use client'
import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '../context/user';
import './SettingsPage.css';

const SettingsPage = () => {
  const router = useRouter();
  const userContext = useUser();
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState('profile');
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState('');
  const [msgType, setMsgType] = useState('');

  // Image upload state
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef(null);

  // Profile form state
  const [profileData, setProfileData] = useState({
    username: '',
    bio: '',
    dateOfBirth: '',
    title: '',
    gender: '',
    avatar: '',
  });

  // Account form state
  const [accountData, setAccountData] = useState({
    email: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [deleteConfirm, setDeleteConfirm] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch('/api/token');
        const data = await res.json();
        
        if (data.user) {
          setUser(data.user);
          setProfileData({
            username: data.user.username || '',
            bio: data.user.bio || '',
            dateOfBirth: data.user.dateOfBirth || '',
            title: data.user.title || '',
            gender: data.user.gender || '',
            avatar: data.user.avatar || '',
          });
          // Set avatar preview if exists
          if (data.user.avatar) {
            setAvatarPreview(data.user.avatar);
          }
          setAccountData(prev => ({
            ...prev,
            email: data.user.email || '',
          }));
        } else {
          router.push('/login');
        }
      } catch (err) {
        console.error('Error fetching user:', err);
        router.push('/login');
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [router]);

  const showMessage = (message, type = 'success') => {
    setMsg(message);
    setMsgType(type);
    setTimeout(() => {
      setMsg('');
      setMsgType('');
    }, 3000);
  };

  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfileData(prev => ({ ...prev, [name]: value }));
  };

  const uploadImage = async (file) => {
    if (!file) return null;

    console.log('Uploading file:', file.name, file.type, file.size);

    // Validate file type
    if (!file.type.startsWith("image/")) {
      showMessage("Please upload a valid image file", "error");
      return null;
    }

    // Validate file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      showMessage("Image size should be less than 5MB", "error");
      return null;
    }

    setIsUploading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/upload?type=avatar", {
        method: "POST",
        body: formData,
      });

      console.log('Upload response status:', res.status);
      const data = await res.json();
      console.log('Upload response data:', data);
      
      if (!res.ok) throw new Error(data.error || "Upload failed");

      setIsUploading(false);
      return data.url;
    } catch (err) {
      console.error('Upload error:', err);
      showMessage("Failed to upload image: " + err.message, "error");
      setIsUploading(false);
      return null;
    }
  };

  const handleImageDrop = async (e) => {
    e.preventDefault();
    setIsDragging(false);

    const file = e.dataTransfer.files[0];
    if (file) {
      const imageUrl = await uploadImage(file);
      if (imageUrl) {
        setProfileData(prev => ({ ...prev, avatar: imageUrl }));
        setAvatarPreview(imageUrl);
      }
    }
  };

  const handleImageSelect = async (e) => {
    const file = e.target.files[0];
    if (file) {
      const imageUrl = await uploadImage(file);
      if (imageUrl) {
        setProfileData(prev => ({ ...prev, avatar: imageUrl }));
        setAvatarPreview(imageUrl);
      }
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const removeAvatar = () => {
    setProfileData(prev => ({ ...prev, avatar: "" }));
    setAvatarPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleAccountChange = (e) => {
    const { name, value } = e.target;
    setAccountData(prev => ({ ...prev, [name]: value }));
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setMsg('');

    try {
      const res = await fetch(`/api/user/${user.user_id}/profile`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profileData),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update profile');

      showMessage('Profile updated successfully!', 'success');
      
      // Update local user state
      setUser(prev => ({ ...prev, ...data.user }));
      
      // Update global user context so navbar updates
      if (userContext?.setUser) {
        userContext.setUser(data.user);
      }
    } catch (err) {
      console.error(err);
      showMessage(err.message, 'error');
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setMsg('');

    if (accountData.newPassword !== accountData.confirmPassword) {
      showMessage('New passwords do not match', 'error');
      return;
    }

    if (accountData.newPassword.length < 6) {
      showMessage('Password must be at least 6 characters', 'error');
      return;
    }

    try {
      const res = await fetch(`/api/user/${user.user_id}/password`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentPassword: accountData.currentPassword,
          newPassword: accountData.newPassword,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to change password');

      showMessage('Password changed successfully!', 'success');
      setAccountData(prev => ({
        ...prev,
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      }));
    } catch (err) {
      console.error(err);
      showMessage(err.message, 'error');
    }
  };

  const handleEmailChange = async (e) => {
    e.preventDefault();
    setMsg('');

    try {
      const res = await fetch(`/api/user/${user.user_id}/email`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: accountData.email }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to change email');

      showMessage('Email updated successfully!', 'success');
      setUser(prev => ({ ...prev, email: accountData.email }));
    } catch (err) {
      console.error(err);
      showMessage(err.message, 'error');
    }
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirm !== 'DELETE') {
      showMessage('Please type DELETE to confirm', 'error');
      return;
    }

    setIsDeleting(true);

    try {
      const res = await fetch(`/api/user/${user.user_id}`, {
        method: 'DELETE',
      });

      if (!res.ok) throw new Error('Failed to delete account');

      showMessage('Account deleted successfully', 'success');
      
      // Logout and redirect
      await fetch('/api/logout', { method: 'POST' });
      setTimeout(() => {
        router.push('/');
      }, 1000);
    } catch (err) {
      console.error(err);
      showMessage(err.message, 'error');
      setIsDeleting(false);
    }
  };

  const renderContent = () => {
    switch(activeTab) {
      case 'profile':
        return (
          <section className="settings-section">
            <h2 className="settings-section-title">
              <span className="settings-section-icon">👤</span> Profile Information
            </h2>
            
            <form onSubmit={handleProfileSubmit} className="settings-form">
              <div className="form-group">
                <label htmlFor="username">Username</label>
                <input
                  id="username"
                  name="username"
                  type="text"
                  value={profileData.username}
                  onChange={handleProfileChange}
                  placeholder="Your username"
                  required
                />
              </div>

              {/* Avatar Upload Area */}
              <div className="form-group">
                <label>Profile Picture</label>
                
                {!avatarPreview ? (
                  <div
                    className={`avatar-drop-zone ${isDragging ? "dragging" : ""}`}
                    onDrop={handleImageDrop}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onClick={() => fileInputRef.current?.click()}
                  >
                    {isUploading ? (
                      <p>Uploading...</p>
                    ) : (
                      <>
                        
                        <p>Drag & drop your profile picture</p>
                        <p style={{ fontSize: "0.9rem", color: "#666" }}>
                          or click to browse
                        </p>
                      </>
                    )}
                  </div>
                ) : (
                  <div className="avatar-preview-container">
                    <img src={avatarPreview} alt="Profile preview" className="avatar-preview" />
                    <button
                      type="button"
                      onClick={removeAvatar}
                      className="remove-avatar-btn"
                    >
                      Remove Picture
                    </button>
                  </div>
                )}

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageSelect}
                  style={{ display: "none" }}
                />
              </div>

              <div className="form-group">
                <label htmlFor="title">Title</label>
                <input
                  id="title"
                  name="title"
                  type="text"
                  value={profileData.title}
                  onChange={handleProfileChange}
                  placeholder="e.g., Book Enthusiast, Author, etc."
                />
              </div>

              <div className="form-group">
                <label htmlFor="bio">Bio</label>
                <textarea
                  id="bio"
                  name="bio"
                  value={profileData.bio}
                  onChange={handleProfileChange}
                  placeholder="Tell us about yourself..."
                  rows="4"
                />
              </div>

              <div className="form-group">
                <label htmlFor="dateOfBirth">Date of Birth</label>
                <input
                  id="dateOfBirth"
                  name="dateOfBirth"
                  type="date"
                  value={profileData.dateOfBirth}
                  onChange={handleProfileChange}
                />
              </div>

              <div className="form-group">
                <label htmlFor="gender">Gender</label>
                <select
                  id="gender"
                  name="gender"
                  value={profileData.gender}
                  onChange={handleProfileChange}
                >
                  <option value="">Prefer not to say</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="non-binary">Non-binary</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <button type="submit" className="btn-primary" disabled={isUploading}>
                {isUploading ? "Uploading..." : "Save Profile Changes"}
              </button>
            </form>
          </section>
        );

      case 'account':
        return (
          <>
            {/* Change Email */}
            <section className="settings-section">
              <h2 className="settings-section-title">
                <span className="settings-section-icon">✉️</span> Email Address
              </h2>
              
              <form onSubmit={handleEmailChange} className="settings-form">
                <div className="form-group">
                  <label htmlFor="email">Email</label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    value={accountData.email}
                    onChange={handleAccountChange}
                    placeholder="your@email.com"
                    required
                  />
                </div>

                <button type="submit" className="btn-primary">
                  Update Email
                </button>
              </form>
            </section>

            {/* Change Password */}
            <section className="settings-section">
              <h2 className="settings-section-title">
                <span className="settings-section-icon">🔒</span> Change Password
              </h2>
              
              <form onSubmit={handlePasswordChange} className="settings-form">
                <div className="form-group">
                  <label htmlFor="currentPassword">Current Password</label>
                  <input
                    id="currentPassword"
                    name="currentPassword"
                    type="password"
                    value={accountData.currentPassword}
                    onChange={handleAccountChange}
                    placeholder="Enter current password"
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="newPassword">New Password</label>
                  <input
                    id="newPassword"
                    name="newPassword"
                    type="password"
                    value={accountData.newPassword}
                    onChange={handleAccountChange}
                    placeholder="Enter new password"
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="confirmPassword">Confirm New Password</label>
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    value={accountData.confirmPassword}
                    onChange={handleAccountChange}
                    placeholder="Confirm new password"
                    required
                  />
                </div>

                <button type="submit" className="btn-primary">
                  Change Password
                </button>
              </form>
            </section>

            {/* Delete Account */}
            <section className="settings-section settings-danger">
              <h2 className="settings-section-title">
                <span className="settings-section-icon">⚠️</span> Danger Zone
              </h2>
              
              <div className="settings-form">
                <p className="danger-warning">
                  Once you delete your account, there is no going back. This action cannot be undone.
                </p>

                <div className="form-group">
                  <label htmlFor="deleteConfirm">
                    Type <strong>DELETE</strong> to confirm
                  </label>
                  <input
                    id="deleteConfirm"
                    type="text"
                    value={deleteConfirm}
                    onChange={(e) => setDeleteConfirm(e.target.value)}
                    placeholder="Type DELETE"
                  />
                </div>

                <button
                  type="button"
                  onClick={handleDeleteAccount}
                  disabled={isDeleting || deleteConfirm !== 'DELETE'}
                  className="btn-danger"
                >
                  {isDeleting ? 'Deleting...' : 'Delete Account'}
                </button>
              </div>
            </section>
          </>
        );

      default:
        return null;
    }
  };

  if (loading) return (
    <div className="loading-container">
      <p className="loading-text">Loading settings...</p>
    </div>
  );

  if (!user) return null;

  return (
    <div className="settings-container">
      {/* Header */}
      <div className="settings-header">
        <h1 className="settings-title">Settings</h1>
        <p className="settings-subtitle">Manage your account settings and preferences</p>
      </div>

      {/* Message Display */}
      {msg && (
        <div className={`settings-message ${msgType === 'error' ? 'message-error' : 'message-success'}`}>
          {msg}
        </div>
      )}

      {/* Main Content */}
      <div className="settings-main">
        {/* Sidebar */}
        <aside className="settings-sidebar">
          <nav className="settings-nav">
            <button
              onClick={() => setActiveTab('profile')}
              className={`settings-nav-button ${activeTab === 'profile' ? 'active' : ''}`}
            >
              👤 Profile
            </button>
            <button
              onClick={() => setActiveTab('account')}
              className={`settings-nav-button ${activeTab === 'account' ? 'active' : ''}`}
            >
              ⚙️ Account
            </button>
          </nav>
        </aside>

        {/* Content Area */}
        <main className="settings-content">
          {renderContent()}
        </main>
      </div>
    </div>
  );
};

export default SettingsPage;