'use client';
import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import logoImage from '../../public/logo.png'
import '../styles/auth.css';
import { FaGoogle, FaGithub } from 'react-icons/fa';

export default function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
  
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
  
      const data = await response.json();
  
      if (!response.ok) {
        throw new Error(data.error || 'Login failed');
      }
  
      // Add a slight delay to ensure cookie is set before navigation
      window.location.href = '/upload';
    } catch (err: Error | unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('An unexpected error occurred');
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-left">
          <div className="logo">
            <Image src={logoImage} alt="Logo" width={80} height={80} />
          </div>
          <div className="welcome-text">
            <p>Welcome back!</p>
            <p>Document Compliance Analysis</p>
          </div>
        </div>
        
        <div className="login-right">
          <h1 className="title">Sign In</h1>
          <p className="subtitle">Access your account to analyze documents</p>

          {error && (
            <div className="error-message">
              {error}
            </div>
          )}
          
          <form className="auth-form" onSubmit={handleSubmit}>
            <div className="input-group">
              <label htmlFor="email">Email Address</label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="Enter your email"
              />
            </div>
            
            <div className="input-group">
              <label htmlFor="password">Password</label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="Enter your password"
              />
            </div>
            
            <div className="forgot-password">
              <Link href="/forgot-password">Forgot Password?</Link>
            </div>
            
            <button
              type="submit"
              disabled={loading}
              className="primary-btn"
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
            
            <div className="divider">
              <span>OR CONTINUE WITH</span>
            </div>
            
            <div className="social-buttons">
              <button className="social-btn google-btn">
                <FaGoogle />
                Google
              </button>
              <button className="social-btn github-btn">
                <FaGithub />
                GitHub
              </button>
            </div>
            
            <div className="toggle-link">
              Don&apos;t have an account?
              <Link href="/login">Sign up</Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}