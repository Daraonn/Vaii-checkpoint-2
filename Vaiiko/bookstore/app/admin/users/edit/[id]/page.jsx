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
    <div className="edit-user-container">
  <h1>Edit User</h1>

  {msg && (
    <p className={msg.includes("successfully") ? "success-msg" : "error-msg"}>
      {msg}
    </p>
  )}

  <form onSubmit={submit} className="edit-user-form">
    <input
      name="name"
      type="text"
      value={user.name}
      onChange={handleChange}
      placeholder="User Name"
      required
    />
    <input
      name="email"
      type="email"
      value={user.email}
      onChange={handleChange}
      placeholder="Email"
      required
    />
    <input
      name="password1"
      value={password1}
      onChange={(e) => setPassword1(e.target.value)}
      placeholder="New Password (leave blank to keep current)"
      type="password"
    />
    <input
      name="password2"
      value={password2}
      onChange={(e) => setPassword2(e.target.value)}
      placeholder="Confirm New Password"
      type="password"
    />
    <label>
      Admin User
      <input
        type="checkbox"
        name="isAdmin"
        checked={user.isAdmin}
        onChange={handleChange}
      />
    </label>
    <button type="submit">Save Changes</button>
  </form>
</div>
    
  );
}
