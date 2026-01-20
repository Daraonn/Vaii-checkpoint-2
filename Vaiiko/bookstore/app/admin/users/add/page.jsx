"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import "./add.css"

export default function AddUser() {
  const router = useRouter();

  const [user, setUser] = useState({
    email: "",
    password: "",
    passwordConfirm: "",
    name: "",
    isAdmin: false,
  });

  const [msg, setMsg] = useState("");
  const [currentStep, setCurrentStep] = useState(1);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setUser((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const submit = async (e) => {
    e.preventDefault();
    setMsg("");

    // Final validation
    if (user.password !== user.passwordConfirm) {
      setMsg("Passwords do not match!");
      return;
    }

    try {
      const res = await fetch(`/api/admin/users`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(user),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create user");

      setMsg("User added successfully!");

      setUser({
        email: "",
        password: "",
        passwordConfirm: "",
        name: "",
        isAdmin: false,
      });
      setCurrentStep(1);
    } catch (err) {
      console.error(err);
      setMsg(err.message);
    }
  };

  const isStep1Valid = user.name && user.email;
  const isStep2Valid = user.password && user.password.length >= 8 && user.passwordConfirm && user.password === user.passwordConfirm;

  return (
    <div className="add-user-page">
      <div className="add-user-container">
        {/* Header */}
        <div className="page-header">
          <button className="back-button" onClick={() => router.push("/admin/users")}>
            
            Back to Users
          </button>
          <h1>Add New User</h1>
          <p className="page-subtitle">Create a new user account for the system</p>
        </div>

        {/* Success/Error Message */}
        {msg && (
          <div className={msg.includes("successfully") ? "success-message" : "error-message"}>
            <span>{msg}</span>
          </div>
        )}

        {/* Progress Steps */}
        <div className="progress-steps">
          <div className={`step ${currentStep >= 1 ? 'active' : ''} ${currentStep > 1 ? 'completed' : ''}`}>
            <div className="step-number">1</div>
            <span className="step-label">Basic Info</span>
          </div>
          <div className="step-line"></div>
          <div className={`step ${currentStep >= 2 ? 'active' : ''} ${currentStep > 2 ? 'completed' : ''}`}>
            <div className="step-number">2</div>
            <span className="step-label">Security</span>
          </div>
          <div className="step-line"></div>
          <div className={`step ${currentStep >= 3 ? 'active' : ''}`}>
            <div className="step-number">3</div>
            <span className="step-label">Review</span>
          </div>
        </div>

        <div className="add-user-form-wrapper">
          {/* Step 1: Basic Information */}
          {currentStep === 1 && (
            <div className="form-section">
              <h2 className="section-title">👤 Basic Information</h2>
              
              <div className="form-group">
                <label className="form-label">Full Name *</label>
                <input
                  name="name"
                  type="text"
                  placeholder="Enter full name"
                  value={user.name}
                  onChange={handleChange}
                  className="form-input"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Email Address *</label>
                <input
                  name="email"
                  type="email"
                  placeholder="user@example.com"
                  value={user.email}
                  onChange={handleChange}
                  className="form-input"
                  required
                />
              </div>

              <div className="form-actions">
                <button
                  type="button"
                  onClick={() => setCurrentStep(2)}
                  disabled={!isStep1Valid}
                  className="btn-primary"
                >
                  Next: Security →
                </button>
              </div>
            </div>
          )}

          {/* Step 2: Security Settings */}
          {currentStep === 2 && (
            <div className="form-section">
              <h2 className="section-title">🔒 Security Settings</h2>
              
              <div className="form-group">
                <label className="form-label">Password *</label>
                <input
                  name="password"
                  type="password"
                  placeholder="Enter password (min. 8 characters)"
                  value={user.password}
                  onChange={handleChange}
                  className="form-input"
                  required
                />
                {user.password && user.password.length < 8 && (
                  <span className="form-hint error">Password must be at least 8 characters</span>
                )}
              </div>

              <div className="form-group">
                <label className="form-label">Confirm Password *</label>
                <input
                  name="passwordConfirm"
                  type="password"
                  placeholder="Re-enter password"
                  value={user.passwordConfirm}
                  onChange={handleChange}
                  className="form-input"
                  required
                />
                {user.passwordConfirm && user.password !== user.passwordConfirm && (
                  <span className="form-hint error">Passwords do not match</span>
                )}
                {user.passwordConfirm && user.password === user.passwordConfirm && user.password.length >= 8 && (
                  <span className="form-hint success">✓ Passwords match</span>
                )}
              </div>

              <div className="permission-section">
                <h3>Permissions</h3>
                <div className="permission-toggle">
                  <div className="permission-info">
                    <span className="permission-title">Administrator Access</span>
                    <span className="permission-description">
                      Grant this user full access to admin panel and management features
                    </span>
                  </div>
                  <label className="toggle-switch">
                    <input
                      type="checkbox"
                      name="isAdmin"
                      checked={user.isAdmin}
                      onChange={handleChange}
                    />
                    <span className="toggle-slider"></span>
                  </label>
                </div>
              </div>

              <div className="form-actions">
                <button
                  type="button"
                  onClick={() => setCurrentStep(1)}
                  className="btn-secondary"
                >
                  ← Back
                </button>
                <button
                  type="button"
                  onClick={() => setCurrentStep(3)}
                  disabled={!isStep2Valid}
                  className="btn-primary"
                >
                  Review →
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Review & Submit */}
          {currentStep === 3 && (
            <div className="form-section">
              <h2 className="section-title">✓ Review & Submit</h2>
              
              <div className="review-card">
                <div className="review-avatar">
                  {user.name?.charAt(0).toUpperCase() || 'U'}
                </div>
                
                <div className="review-details">
                  <div className="review-item">
                    <span className="review-label">Full Name:</span>
                    <span className="review-value">{user.name}</span>
                  </div>
                  
                  <div className="review-item">
                    <span className="review-label">Email:</span>
                    <span className="review-value">{user.email}</span>
                  </div>
                  
                  <div className="review-item">
                    <span className="review-label">Password:</span>
                    <span className="review-value">{'•'.repeat(Math.min(user.password.length, 20))}</span>
                  </div>
                  
                  <div className="review-item">
                    <span className="review-label">Role:</span>
                    <span className={`role-badge ${user.isAdmin ? 'admin' : 'user'}`}>
                      {user.isAdmin ? 'Administrator' : 'Regular User'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="form-actions">
                <button
                  type="button"
                  onClick={() => setCurrentStep(2)}
                  className="btn-secondary"
                >
                  ← Back to Edit
                </button>
                <button
                  type="button"
                  onClick={submit}
                  className="btn-success"
                >
                  ✓ Create User Account
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}