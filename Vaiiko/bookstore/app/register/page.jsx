"use client";
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import './register.css';
import Link from "next/link";

const Register = () => {
  const router = useRouter();
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    agreed: false,
  });

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { value, type, checked, name } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { username, email, password, confirmPassword, agreed } = formData;

    if (!username || !email || !password || !confirmPassword) {
      setError('All field are required to be filled.');
      return;
    }

    if (username.length < 3) {
      setError('Username needs to contain atleast 3 characters.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Password must match.');
      return;
    }

    if (password.length < 8) {
      setError('User password need to have atleast 8 characters.');
      return;
    }

    if (!agreed) {
      setError('Please confirm that you agree to the terms and conditions.');
      return;
    }

    setError('');
    setLoading(true);

    try {
      const response = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, username }),
      });

      let data = {};
      try {
        data = await response.json();
      } catch (err) {
        console.error('Failed to parse JSON from server:', err);
        data = { error: `Server returned status ${response.status}` };
      }

      if (!response.ok) {
        throw new Error(data?.error || `Server returned status ${response.status}`);
      }

      console.log('User registered successfully:', data);
      router.push('/login');
    } catch (err) {
      console.error(err);
      setError(err.message || 'Chyba pri registrácii.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register">
      <div className="register-container">
        <h1>Zaregistruj sa</h1>
        <form onSubmit={handleSubmit} className="register-fields">
          <input
            type="text"
            name="username"
            value={formData.username}
            onChange={handleChange}
            placeholder="Username"
            required
          />
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="E-mail"
            required
          />
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="Password"
            required
          />
          <input
            type="password"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            placeholder="Repeat password"
            required
          />
          {error && <p className="error-message">{error}</p>}
          <button type="submit" disabled={loading}>Continue</button>
          <p className="register-login">
            Already have an account? Log in <Link href='/login'><span>here</span></Link>
          </p>
          <div className="register-checkbox">
            <input
              type="checkbox"
              name="agreed"
              id="agreed"
              checked={formData.agreed}
              onChange={handleChange}
            />
            <p>Please confirm that you agree to the terms and conditions.</p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Register;
