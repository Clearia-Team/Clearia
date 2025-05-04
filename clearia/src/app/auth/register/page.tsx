"use client";

import React from 'react'
import { useRouter } from 'next/navigation'

const Login_check = () => {
  const router = useRouter();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 px-6">
      <div className='flex-col justify-center items-center'>
        <h2 className="text-4xl font-bold text-blue-600 mb-4 justify-center items-center">Login</h2>
        <ul>
          <li><button onClick={() => router.push("/auth/signin")} className='text-white font-normal! bg-gradient-to-br w-full text-2xl! hover:cursor-pointer from-green-400 to-blue-600 hover:bg-gradient-to-bl focus:ring-4 focus:outline-none focus:ring-green-200 dark:focus:ring-green-800 font-medium rounded-lg text-sm px-5 py-2.5 text-center me-2 mb-2'>User</button></li>
          <li><button onClick={() => router.push("/admin/login")} className='w-full font-normal! text-2xl! hover:cursor-pointer text-white bg-gradient-to-br from-green-400 to-blue-600 hover:bg-gradient-to-bl focus:ring-4 focus:outline-none focus:ring-green-200 dark:focus:ring-green-800 font-medium rounded-lg text-sm px-5 py-2.5 text-center me-2 mb-2'>Admin</button></li>
          <li><button onClick={() => router.push("/auth/signin/staff")} className='w-full text-2xl! font-normal! hover:cursor-pointer text-white bg-gradient-to-br from-green-400 to-blue-600 hover:bg-gradient-to-bl focus:ring-4 focus:outline-none focus:ring-green-200 dark:focus:ring-green-800 font-medium rounded-lg text-sm px-5 py-2.5 text-center me-2 mb-2'>Staff </button></li>
          <li><button onClick={() => router.push("auth/signin/staff")} className='w-full text-2xl! font-normal! hover:cursor-pointer text-white bg-gradient-to-br from-green-400 to-blue-600 hover:bg-gradient-to-bl focus:ring-4 focus:outline-none focus:ring-green-200 dark:focus:ring-green-800 font-medium rounded-lg text-sm px-5 py-2.5 text-center me-2 mb-2'>Doctor</button></li>
        </ul>
        <p className="mt-4">Don't have an account? <span onClick={() => router.push("/auth/signup")} className='text-blue-500 hover:cursor-pointer'>Sign Up</span> </p>
        <p className="mt-4">Don't have an account?(Staff) <span onClick={() => router.push("/auth/signup/staff")} className='text-blue-500 hover:cursor-pointer'>Sign Up</span> </p>
      </div>
    </div>
  )
}

export default Login_check;

