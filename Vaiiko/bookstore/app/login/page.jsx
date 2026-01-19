"use client";
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import './login.css';
import { useUser } from '../context/user'

const Login = () => {
  const router = useRouter();
  const [formData, setFormData] = useState({
    emailOrName: '',
    password: '',
  });
  const [error, setError] = useState('');
  const { setUser } = useUser();
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { emailOrName, password } = formData;

    if (!emailOrName || !password) {
      setError('Prosím vyplňte všetky polia.');
      return;
    }

    setError('');
    setLoading(true);

    try {
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ emailOrName, password }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data?.error || 'There was an issue with your log in.');
      }
      if (response.ok) { 
        const userData = await fetch('/api/token').then(res => res.json());
        setUser(userData.user);
        router.push('/');
      }
     
    } catch (err) {
      console.error(err);
      setError(err.message || 'There was an issue with your log in.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login">
      <div className="login-container">
        <h1>Log in</h1>
        <form onSubmit={handleSubmit} className="login-fields">
          <input
            type="text"
            name="emailOrName"
            placeholder="username / E-mail"
            value={formData.emailOrName}
            onChange={handleChange}
            required
          />
          <input
            type="password"
            name="password"
            placeholder="password"
            value={formData.password}
            onChange={handleChange}
            required
          />
          {error && <p className="error-message">{error}</p>}
          <button type="submit" disabled={loading}>Continue</button>
        </form>
        <p className="login-register">
          Dont have an accoumt? Register right <Link href="/register"><span>here</span></Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
