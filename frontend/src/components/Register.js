import React, { useState } from 'react';
import api from '../api';
import { useNavigate } from 'react-router-dom';

const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const getPasswordStrength = () => {
    if (password.length === 0) return { width: '0%', color: 'transparent', label: '' };
    if (password.length < 4) return { width: '25%', color: 'var(--danger)', label: 'Weak' };
    if (password.length < 8) return { width: '50%', color: 'var(--warning)', label: 'Fair' };
    if (password.length < 12) return { width: '75%', color: 'var(--neon-cyan)', label: 'Good' };
    return { width: '100%', color: 'var(--success)', label: 'Strong' };
  };

  const strength = getPasswordStrength();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/api/auth/register', { name, email, password });
      navigate('/login');
    } catch (err) {
      alert(err.response?.data?.error || err.message || 'Registration failed');
    }
    setLoading(false);
  };

  return (
    <div style={{ position: 'relative', zIndex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', padding: '20px' }}>
      <div className="glass-card-neon fade-in" style={{ width: '100%', maxWidth: '440px', padding: '48px 40px' }}>
        
        {/* Brand */}
        <div style={{ textAlign: 'center', marginBottom: '36px' }}>
          <div style={{ fontSize: '40px', marginBottom: '12px', filter: 'drop-shadow(0 0 12px rgba(139,92,246,0.5))' }}>🚀</div>
          <h1 style={{ fontSize: '28px', fontWeight: '800', margin: '0 0 8px 0', letterSpacing: '-1px' }}>
            Join the Future
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '15px', margin: 0 }}>
            Create your account. Start splitting effortlessly.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', color: 'var(--text-secondary)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Full Name
            </label>
            <input
              className="glass-input"
              required
              placeholder="John Doe"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', color: 'var(--text-secondary)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Email Address
            </label>
            <input
              className="glass-input"
              required
              placeholder="name@example.com"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div style={{ marginBottom: '8px' }}>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', color: 'var(--text-secondary)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Password
            </label>
            <input
              className="glass-input"
              required
              placeholder="••••••••"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          {/* Password strength bar */}
          <div style={{ marginBottom: '28px' }}>
            <div style={{ height: '3px', background: 'var(--glass-border)', borderRadius: '3px', overflow: 'hidden', marginBottom: '4px' }}>
              <div style={{ height: '100%', width: strength.width, background: strength.color, borderRadius: '3px', transition: 'all 0.3s ease' }}></div>
            </div>
            {strength.label && (
              <span style={{ fontSize: '11px', color: strength.color, fontWeight: '500' }}>{strength.label}</span>
            )}
          </div>

          <button type="submit" className="neon-button" style={{ width: '100%', marginBottom: '14px' }} disabled={loading}>
            {loading ? <span className="spinner" style={{ width: 18, height: 18, borderWidth: 2 }}></span> : 'Create Account'}
          </button>

          <button type="button" className="neon-button-outline" style={{ width: '100%' }} onClick={() => navigate('/login')}>
            Back to Sign In
          </button>
        </form>
      </div>
    </div>
  );
};

export default Register;