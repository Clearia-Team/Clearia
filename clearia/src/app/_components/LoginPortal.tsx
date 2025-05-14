'use client';

import { useRouter } from 'next/navigation';
import { User, ShieldCheck, Briefcase, Stethoscope } from 'lucide-react';
import React from 'react';

interface Role {
  name: string;
  icon: JSX.Element;
  path: string;
}

const LoginPortal: React.FC = () => {
  const router = useRouter();

  const roles: Role[] = [
    { name: 'User', icon: <User size={20} />, path: '/auth/signin/user' },
    { name: 'Admin', icon: <ShieldCheck size={20} />, path: '/admin/signin' },
    { name: 'Staff', icon: <Briefcase size={20} />, path: '/auth/signin/staff' },
    { name: 'Doctor', icon: <Stethoscope size={20} />, path: '/auth/signin/doctor' },
  ];

  return (
      <div className="backdrop-blur-md bg-white/70 p-10 rounded-3xl shadow-2xl w-full max-w-md transition-all duration-500">
        <h2 className="text-4xl font-extrabold text-blue-700 mb-8 text-center drop-shadow-sm">Login</h2>

        <ul className="space-y-4">
          {roles.map((role, index) => (
            <li key={index}>
              <button
                onClick={() => router.push(role.path)}
                className="w-full flex items-center justify-center gap-3 text-lg font-semibold text-white bg-gradient-to-r from-green-400 to-blue-500 hover:from-green-500 hover:to-blue-600 rounded-xl px-5 py-3 transition-all duration-300 transform hover:scale-105 shadow-md"
              >
                {role.icon}
                {role.name}
              </button>
            </li>
          ))}
        </ul>

        <p className="mt-6 text-sm text-gray-700 text-center">
          Don&apos;t have an account?{' '}
          <span
            onClick={() => router.push('/register')}
            className="text-blue-600 font-medium underline underline-offset-2 cursor-pointer hover:text-blue-800 transition"
          >
            Register
          </span>
        </p>
      </div>
  );
};

export default LoginPortal;

