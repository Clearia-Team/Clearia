"use client";
import React from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import logo from "../../../public/assets/logo.png";

const About = () => {
  return (
    <div className="flex-col">
      <Link href="/" className="fixed">
        <Image
          src={logo}
          alt="Logo"
          width={56} // or whatever size suits your design
          height={56}
          className="h-14 mr-4"
        />
      </Link>

      <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-white to-blue-50 text-center px-10 py-20 space-y-20">
        {/* Title Section */}
        <motion.h1
          className="text-7xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-700 to-cyan-400"
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          About Clearia
        </motion.h1>

        {/* Introduction Section */}
        <motion.p
          className="text-2xl text-gray-700 max-w-5xl leading-relaxed"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1 }}
        >
          Clearia is a revolutionary platform designed to{" "}
          <span className="font-bold text-blue-600">bridge the communication gap</span> between patients,
          families, and hospital staff. It offers real-time, transparent updates on the treatment process,
          turning stressful experiences into journeys of clarity, reassurance, and empowerment.
        </motion.p>

        {/* Why Clearia Section */}
        <motion.div
          className="space-y-6 max-w-5xl"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.2 }}
        >
          <h2 className="text-5xl font-semibold text-blue-600">Why Clearia?</h2>
          <p className="text-xl text-gray-600">
            The lack of clear communication during hospital care leaves families feeling helpless.
            Clearia offers an intuitive platform that delivers{" "}
            <span className="font-bold text-blue-600">real-time updates</span> and organized communication,
            ensuring patients and families are always informed.
          </p>
        </motion.div>

        {/* How It Works Section */}
        <motion.div
          className="space-y-6 max-w-5xl text-left"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.4 }}
        >
          <h2 className="text-5xl font-semibold text-blue-600 text-center">How It Works</h2>
          <div className="text-lg text-gray-600 leading-relaxed space-y-4">
            <p><strong>Step 1:</strong> Effortless login & registration for instant access.</p>
            <p><strong>Step 2:</strong> Home screen with a <span className="font-bold text-blue-600">user-friendly interface</span> focused on clarity and comfort.</p>
            <p><strong>Step 3:</strong> Unique treatment codes provide <span className="font-bold text-blue-600">real-time updates</span> through the dashboard.</p>
            <p><strong>Step 4:</strong> Dashboard shows ongoing and past treatments, aiding doctors in analysis when needed.</p>
            <p><strong>Step 5:</strong> Continuous updates for precise progress tracking, empowering patients and families with knowledge.</p>
          </div>
        </motion.div>

        {/* Key Features Section */}
        <motion.div
          className="space-y-6 max-w-5xl text-left"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.6 }}
        >
          <h2 className="text-5xl font-semibold text-blue-600 text-center">Key Features</h2>
          <ul className="list-disc ml-6 text-lg text-gray-600 leading-relaxed space-y-2">
            <li><span className="font-bold text-blue-600">Real-Time Updates:</span> Treatment progress is instantly accessible.</li>
            <li><span className="font-bold text-blue-600">Seamless Communication:</span> Coordinate with healthcare professionals effortlessly.</li>
            <li><span className="font-bold text-blue-600">Easy Data Sharing:</span> Share medical history for second opinions or emergencies.</li>
            <li><span className="font-bold text-blue-600">System Integration:</span> Works with hospital systems to streamline communication.</li>
          </ul>
        </motion.div>

        {/* Benefits Section */}
        <motion.div
          className="space-y-6 max-w-5xl"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.8 }}
        >
          <h2 className="text-5xl font-semibold text-blue-600">Why Hospitals Love Clearia</h2>
          <p className="text-xl text-gray-600 leading-relaxed">
            Clearia integrates effortlessly with existing hospital systems, automating updates with minimal intervention.
            By enhancing patient satisfaction and improving communication efficiency, Clearia allows healthcare
            professionals to focus on what truly matters—providing care.
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default About;

