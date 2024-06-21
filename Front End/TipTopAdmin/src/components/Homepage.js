// Homepage.js

import React from 'react';
import './Homepage.css'; // Import CSS file for styling
import logo from '../assets/tiptop_logo.png';

const Homepage = () => {
  return (
    <div className="homepage">
      
      <div className="content">
        <h1>Welcome to the Tip Top game library!</h1>
        <img src={logo} alt="Logo" className="flex w-128 h-128 justify-center content-center" />
         
      </div>
    </div>
  );
};

export default Homepage;