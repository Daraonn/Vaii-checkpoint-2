"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import "./edit.css"

export default function EditUserPage() {
  const { id } = useParams();
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(true);
  const [password1, setPassword1] = useState("");
  const [password2, setPassword2] = useState("");

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch(`/api/admin/users/${id}`);
        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(errorData?.error || "Failed to fetch user");
        }
        const data = await res.json();
        setUser(data.user);
      } catch (err) {
        console.error(err);
        setMsg(err.message);
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchUser();
  }, [id]);

  if (loading) return <p>Loading...</p>;
  if (!user) return <p style={{ color: "red" }}>{msg || "User not found"}</p>;

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setUser((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value
    }));
  };

  const submit = async (e) => {
    e.preventDefault();
    setMsg("");

    if (password1 || password2) {
      if (password1 !== password2) {
        setMsg("Passwords do not match!");
        return;
      }
      if (password1.length < 8) {
        setMsg("Password must be at least 8 characters long.");
        return;
      }
    }

    try {
      const payload = {
        name: user.name,
        email: user.email,
        isAdmin: user.isAdmin,
        password: password1 || undefined, 
      };

      const res = await fetch(`/api/admin/users/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Failed to update user");

      setMsg("User updated successfully!");
      router.push("/admin/users");
    } catch (err) {
      console.error(err);
      setMsg(err.message);
    }
  };

  return (
    <div className="edit-user-page">
      <div className="edit-user-container">
        {/* Header */}
        <button className="back-button" onClick={() => router.push("/admin/users")}>
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Users
        </button>

        <h1>Edit User</h1>
        <p className="subtitle">Update user information and permissions</p>

        {/* Success/Error Message */}
        {msg && (
          <div className={msg.includes("successfully") ? "success-message" : "error-message"}>
            <span>{msg}</span>
          </div>
        )}

        <div className="edit-user-grid">
          {/* Left Column - User Avatar */}
          <div className="card user-avatar-card">
            <h2>User Avatar</h2>
            <div className="avatar-preview">
              {user.avatar ? (
                <img src={user.avatar} alt={user.name} className="avatar-image" />
              ) : (
                <div className="avatar-placeholder">
                  {user.name?.charAt(0).toUpperCase() || 'U'}
                </div>
              )}
            </div>
            <div className="user-quick-info">
              <div className="info-item">
                <span className="info-label">User ID</span>
                <span className="info-value">#{user.user_id}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Role</span>
                <span className={`role-badge ${user.isAdmin ? 'admin' : 'user'}`}>
                  {user.isAdmin ? 'Administrator' : 'Regular User'}
                </span>
              </div>
            </div>
          </div>

          {/* Right Column - Form Fields */}
          <div>
            {/* Basic Information */}
            <div className="card form-section">
              <h2>Basic Information</h2>

              <div className="form-group">
                <label className="form-label">Full Name *</label>
                <input
                  name="name"
                  type="text"
                  value={user.name}
                  onChange={handleChange}
                  className="form-input"
                  placeholder="Enter full name"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Email Address *</label>
                <input
                  name="email"
                  type="email"
                  value={user.email}
                  onChange={handleChange}
                  className="form-input"
                  placeholder="user@example.com"
                  required
                />
              </div>
            </div>

            {/* Security Settings */}
            <div className="card form-section">
              <h2>Security Settings</h2>
              <p className="section-description">Leave password fields empty to keep the current password</p>

              <div className="form-group">
                <label className="form-label">New Password</label>
                <input
                  name="password1"
                  type="password"
                  value={password1}
                  onChange={(e) => setPassword1(e.target.value)}
                  className="form-input"
                  placeholder="Enter new password (min. 8 characters)"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Confirm New Password</label>
                <input
                  name="password2"
                  type="password"
                  value={password2}
                  onChange={(e) => setPassword2(e.target.value)}
                  className="form-input"
                  placeholder="Confirm new password"
                />
              </div>
            </div>

            {/* Permissions */}
            <div className="card form-section">
              <h2>Permissions</h2>
              
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

            {/* Action Buttons */}
            <div className="action-buttons">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => router.push("/admin/users")}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={submit}
                className="btn btn-primary"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}