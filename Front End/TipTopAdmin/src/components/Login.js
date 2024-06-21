// src/components/Login.js

import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from './AuthContext';
import './Login.css'; // Import the CSS file for the login page
import axios from 'axios';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const response = await axios.post('https://tiptop-backend-b8ae4724f5a4.herokuapp.com/api/auth/local', {
        identifier: username, // Strapi uses "identifier" for username or email
        password: password,
      }, {
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (response.data.jwt) {
        login(response.data.jwt);
        navigate('/');
      } else {
        setError('Invalid username or password');
      }
    } catch (error) {
      console.error('Login error:', error.response ? error.response.data : error.message);
      setError('Invalid username or password');
    }
  };

  return (
    <div className="login-container">
      <form onSubmit={handleLogin} className="login-form">
        <h2>Login</h2>
        {error && <p className="error-message">{error}</p>}
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button type="submit">Login</button>
      </form>
    </div>
  );
};

export default Login;