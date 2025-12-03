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
        throw new Error(data?.error || 'Chyba pri prihlásení.');
      }
      if (response.ok) { 
        const userData = await fetch('/api/token').then(res => res.json());
        setUser(userData.user);
        router.push('/');
      }
     
    } catch (err) {
      console.error(err);
      setError(err.message || 'Chyba pri prihlásení.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login">
      <div className="login-container">
        <h1>Prihlásiť sa</h1>
        <form onSubmit={handleSubmit} className="login-fields">
          <input
            type="text"
            name="emailOrName"
            placeholder="Meno / E-mail"
            value={formData.emailOrName}
            onChange={handleChange}
            required
          />
          <input
            type="password"
            name="password"
            placeholder="Heslo"
            value={formData.password}
            onChange={handleChange}
            required
          />
          {error && <p className="error-message">{error}</p>}
          <button type="submit" disabled={loading}>Pokračuj</button>
        </form>
        <p className="login-register">
          Nemáte účet? Registrovať sa <Link href="/register"><span>tu</span></Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
