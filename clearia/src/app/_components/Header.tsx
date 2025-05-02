import React from 'react';
import { Link } from 'react-router-dom';
import logo from '/assets/logo.png';
import { AccountCircle } from '@mui/icons-material';

const Header = () => {
  return (
    <div className="flex items-center justify-between w-full px-4 py-4 bg-transparent fixed top-0 left-0 right-0 z-50">
      
      {/* Logo on the Left */}
      <Link to="/">
        <img src={logo} alt="Logo" className="h-14 mr-4" />
      </Link>

      {/* Navigation Buttons in the Center */}
      <div className="flex-grow text-center justify-between">
        <nav className="inline-block">
          <Link to="/">
            <button className="text-gray-600 font-bold mx-10 text-xl hover:text-blue-500 transition cursor-pointer">HOME</button>
          </Link>
          <Link to="/about">
            <button className="text-gray-600 mx-10 font-bold text-xl hover:text-blue-500 transition cursor-pointer">ABOUT</button>
          </Link>
          {/* <Link to="/services/recommendations">
          <button className="text-gray-600 mx-10 font-bold text-xl hover:text-blue-500 transition cursor-pointer">Get Recommendation</button>
          </Link> */}
         
        </nav>
      </div>

      {/* Account Icon (Linked to Register Page) */}
      <Link to="/register" className="mr-6">
        <AccountCircle style={{ fontSize: '35px', color: 'white' }} className="cursor-pointer hover:text-gray-300 transition" />
      </Link>

    </div>
  );
}

export default Header;

