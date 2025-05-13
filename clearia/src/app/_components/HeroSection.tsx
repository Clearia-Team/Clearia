// src/app/_components/HeroSection.tsx
"use client";

import React from "react";
import { useRouter } from "next/navigation";

const HeroSection = () => {
  const router = useRouter();

  const handleClick = () => {
    router.push("/auth/signin"); // Example navigation
  };


  return (
    <div className="left-1/10 gap-y-3! absolute bottom-1/3 flex-col font-mono">
      {" "}
      {/* Adjust these values to change position */}
      <div className="font-inria text-center">
        <h1 className="mb-1 text-9xl font-medium text-black">CLEARIA</h1>
        <h6 className="mb-2 text-xl text-gray-700">
          Har update clear, Har moment near!
        </h6>
      </div>
      <button
        onClick={handleClick}
        className="w-full rounded-lg bg-blue-600 py-3 text-white hover:cursor-pointer hover:bg-blue-700"
      >
        Login
      </button>
    </div>
  );
};

export default HeroSection;
