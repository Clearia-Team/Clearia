'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import logo from '../../../public/assets/logo.png';
import { AccountCircle } from '@mui/icons-material';

const Header = () => {
  return (
    <div className="flex items-center justify-between w-full px-4 py-4 bg-transparent fixed top-0 left-0 right-0 z-50">
      
      {/* Logo on the Left */}
      <Link href="/" passHref>
        <div className="cursor-pointer">
          <Image src={logo} alt="Logo" height={56} className="h-14 w-auto" priority />
        </div>
      </Link>

      {/* Navigation Buttons in the Center */}
      <div className="flex-grow text-center">
        <nav className="inline-block">
          <Link href="/" passHref>
            <button className="text-gray-600 font-bold mx-10 text-xl hover:text-blue-500 transition cursor-pointer">HOME</button>
          </Link>
          <Link href="/about" passHref>
            <button className="text-gray-600 mx-10 font-bold text-xl hover:text-blue-500 transition cursor-pointer">ABOUT</button>
          </Link>
        </nav>
      </div>

      {/* Account Icon (Linked to Register Page) */}
      <Link href="/auth/register" passHref>
        <AccountCircle
          style={{ fontSize: '35px', color: 'white' }}
          className="cursor-pointer hover:text-gray-300 transition mr-6"
        />
      </Link>
    </div>
  );
};

export default Header;

