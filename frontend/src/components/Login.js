import React, { useState } from 'react';
import { Box, Typography } from '@mui/material';
import api from '../api';
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/api/auth/login', { email, password });
      localStorage.setItem('token', res.data.token);
      navigate('/dashboard');
    } catch (err) {
      alert('Login failed');
    }
  };

  return (
    <div className="page-container fade-in" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
      <div className="glass-card" style={{ width: '100%', maxWidth: '400px' }}>
        <Typography component="h1" variant="h4" align="center" gutterBottom color="primary" sx={{ fontWeight: 'bold' }}>
          Smart Expense
        </Typography>
        <Typography component="h2" variant="subtitle1" align="center" gutterBottom color="textSecondary" sx={{ mb: 3 }}>
          Login to your account
        </Typography>
        <Box component="form" onSubmit={handleSubmit}>
          <Box mb={2}>
            <input className="glass-input" required placeholder="Email Address" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
          </Box>
          <Box mb={3}>
            <input className="glass-input" required placeholder="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
          </Box>
          <button type="submit" className="glass-button" style={{ width: '100%', marginBottom: '16px' }}>
            Login
          </button>
          <button type="button" className="glass-button glass-button-outline" style={{ width: '100%' }} onClick={() => navigate('/register')}>
            Create an Account
          </button>
        </Box>
      </div>
    </div>
  );
};

export default Login;