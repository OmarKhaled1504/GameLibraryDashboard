// src/App.js

import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Homepage from './components/Homepage';
import Navbar from './components/Navbar';
import Sessions from './components/Sessions';
import Summary from './components/Summary';
import Members from './components/Members';
import Games from './components/Games';
import Login from './components/Login';
import PrivateRoute from './components/PrivateRoute';
import { AuthProvider } from './components/AuthContext';
import './components/Navbar.css';
import './components/Login.css'; // Import the CSS file for the login page

function App() {
  return (
    <Router>
      <AuthProvider>
        <div>
          <Navbar />
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/" element={<Homepage />} />
            <Route
              path="/sessions"
              element={
                <PrivateRoute>
                  <Sessions />
                </PrivateRoute>
              }
            />
            <Route
              path="/summary"
              element={
                <PrivateRoute>
                  <Summary />
                </PrivateRoute>
              }
            />
            <Route
              path="/members"
              element={
                <PrivateRoute>
                  <Members />
                </PrivateRoute>
              }
            />
            <Route
              path="/games"
              element={
                <PrivateRoute>
                  <Games />
                </PrivateRoute>
              }
            />
          </Routes>
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;