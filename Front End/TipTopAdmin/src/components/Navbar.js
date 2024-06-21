// src/components/Navbar.js

import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from './AuthContext';
import './Navbar.css'; // Importing existing CSS file for Navbar styles

const Navbar = () => {
  const { isAuthenticated, logout } = useContext(AuthContext);

  if (isAuthenticated === null) {
    // Show a loading state while checking authentication
    return <div>Loading...</div>;
  }

  return (
    <nav className="bg-white p-4">
      <ul className="flex space-x-2 border-2 rounded-md border-[#ff5500]">
        <li className="inline-block">
          <Link
            to="/"
            className="block py-2 text-xl px-4 text-[#ff5500] hover:text-[#11163f] border-b-2 border-transparent hover:border-[#11163f] transition duration-300"
          >
            Home
          </Link>
        </li>
        {!isAuthenticated && (
          <li className="inline-block">
            <Link
              to="/login"
              className="block py-2 text-xl px-4 text-[#ff5500] hover:text-[#11163f] border-b-2 border-transparent hover:border-[#11163f] transition duration-300"
            >
              Login
            </Link>
          </li>
        )}
        {isAuthenticated && (
          <>
            <li className="inline-block">
              <Link
                to="/members"
                className="block py-2 text-xl px-4 text-[#ff5500] hover:text-[#11163f] border-b-2 border-transparent hover:border-[#11163f] transition duration-300"
              >
                Members
              </Link>
            </li>
            <li className="inline-block">
              <Link
                to="/sessions"
                className="block py-2 text-xl px-4 text-[#ff5500] hover:text-[#11163f] border-b-2 border-transparent hover:border-[#11163f] transition duration-300"
              >
                Sessions
              </Link>
            </li>
            <li className="inline-block">
              <Link
                to="/summary"
                className="block py-2 text-xl px-4 text-[#ff5500] hover:text-[#11163f] border-b-2 border-transparent hover:border-[#11163f] transition duration-300"
              >
                Summary
              </Link>
            </li>
            <li className="inline-block">
              <button
                onClick={logout}
                className="block py-2 text-xl px-4 text-[#ff5500] hover:text-[#11163f] border-b-2 border-transparent hover:border-[#11163f] transition duration-300"
              >
                Logout
              </button>
            </li>
          </>
        )}
      </ul>
    </nav>
  );
};

export default Navbar;
