// src/components/PrivateRoute.js

import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from './AuthContext';

const PrivateRoute = ({ children }) => {
  const { isAuthenticated } = useContext(AuthContext);

  if (isAuthenticated === null) {
    // Show a loading state while checking authentication
    return <div>Loading...</div>;
  }

  return isAuthenticated ? children : <Navigate to="/login" />;
};

export default PrivateRoute;