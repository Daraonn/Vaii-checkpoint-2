"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import "./add.css"

export default function AddUser() {
  const router = useRouter();

  const [user, setUser] = useState({
    email: "",
    password: "",
    name: "",
    isAdmin: false,
  });

  const [msg, setMsg] = useState("");

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
        name: "",
        isAdmin: false,
      });
    } catch (err) {
      console.error(err);
      setMsg(err.message);
    }
  };

  return (
    <div className="add-form-container">
      <h1>Add User</h1>

      {msg && (
        <p className={msg.includes("successfully") ? "success-msg" : "error-msg"}>
          {msg}
        </p>
      )}

      <form onSubmit={submit} className="add-form">
        <input
          name="email"
          placeholder="Email"
          value={user.email}
          onChange={handleChange}
          required
        />

        <input
          name="password"
          type="password"
          placeholder="Password"
          value={user.password}
          onChange={handleChange}
          required
        />

        <input
          name="name"
          placeholder="Name"
          value={user.name}
          onChange={handleChange}
          required
        />

        <label>
          Admin?
          <input
            name="isAdmin"
            type="checkbox"
            checked={user.isAdmin}
            onChange={handleChange}
          />
          
        </label>

        <button type="submit">Add User</button>
      </form>
    </div>
  );
}
