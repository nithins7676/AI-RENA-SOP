'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import logoImage from '../../public/logo.png'
import '../styles/auth.css';
import { FaGoogle, FaGithub } from 'react-icons/fa';

export default function SignupForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    
    if (password !== confirmPassword) {
      setError("Passwords don't match");
      return;
    }
    
    setLoading(true);

    try {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, name }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Signup failed');
      }

      router.push('/login');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
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
            <p>Join Us Today!</p>
            <p>Document Compliance Analysis</p>
          </div>
        </div>
        
        <div className="login-right">
          <h1 className="title">Create Account</h1>
          <p className="subtitle">Complete the form below to get started</p>
          
          {error && (
            <div className="error-message">
              {error}
            </div>
          )}
          
          <form className="auth-form" onSubmit={handleSubmit}>
            <div className="input-group">
              <label htmlFor="name">Full Name (Optional)</label>
              <input
                type="text"
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your name"
              />
            </div>
            
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
                placeholder="Create a password"
                minLength={6}
              />
            </div>
            
            <div className="input-group">
              <label htmlFor="confirmPassword">Confirm Password</label>
              <input
                type="password"
                id="confirmPassword"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                placeholder="Confirm your password"
              />
            </div>
            
            <button
              type="submit"
              disabled={loading}
              className="primary-btn"
            >
              {loading ? 'Creating account...' : 'Sign Up'}
            </button>
          </form>
          
          <div className="divider">
            <span>OR SIGN UP WITH</span>
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
            Already have an account?
            <Link href="/login">Sign in</Link>
          </div>
        </div>
      </div>
    </div>
  );
}