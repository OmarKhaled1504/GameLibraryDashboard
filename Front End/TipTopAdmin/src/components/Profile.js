// src/components/Profile.js

import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from './AuthContext';
import axios from 'axios';
import './Profile.css'; // Import the CSS file for the profile page

const Profile = () => {
  const { user } = useContext(AuthContext);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [passwordConfirmation, setPasswordConfirmation] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setError('');
    if (newPassword !== passwordConfirmation) {
      setError('New password and confirmation do not match');
      return;
    }
    try {
      const response = await axios.post('REDACTED/api/auth/change-password', {
        currentPassword,
        password: newPassword,
        passwordConfirmation,
      }, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user.jwt}`, // Use the JWT token from the logged-in user
        },
      });


      if (response.status === 200 || response.data.message) {
        alert('Password changed successfully');
        navigate('/');
      } else {
        setError('Error changing password');
      }
    } catch (error) {
      console.error('Error changing password:', error.response ? error.response.data : error.message);
      setError(error.response?.data?.error?.message || 'An error occurred while changing the password. Please try again.');
    }
  };

  return (
    <div className="profile-container">
      <h2>Profile</h2>
      <form onSubmit={handleChangePassword} className="profile-form">
        {error && <p className="error-message">{error}</p>}
        <label>
          Current Password:
          <input
            type="password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            required
          />
        </label>
        <label>
          New Password:
          <input
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
          />
        </label>
        <label>
          Confirm New Password:
          <input
            type="password"
            value={passwordConfirmation}
            onChange={(e) => setPasswordConfirmation(e.target.value)}
            required
          />
        </label>
        <button type="submit">Change Password</button>
      </form>
    </div>
  );
};

export default Profile;