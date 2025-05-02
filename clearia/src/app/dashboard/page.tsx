"use client";
import React, { useState } from "react";
import Link from "next/link";
import {
  Dashboard,
  Person,
  ExitToApp,
  MedicalServices,
  Event,
  History,
} from "@mui/icons-material";

const DashboardPage = () => {
  // Sample treatment data
  const [treatments] = useState([
    {
      id: 1,
      name: "Knee Surgery",
      status: "Ongoing",
      doctor: "Dr. Sharma",
      lastUpdate: "March 30, 2025",
    },
    {
      id: 2,
      name: "Diabetes Treatment",
      status: "Completed",
      doctor: "Dr. Mehta",
      lastUpdate: "Jan 10, 2025",
    },
  ]);

  // Sample appointments
  const [appointments] = useState([
    { id: 1, doctor: "Dr. Verma", date: "April 5, 2025", time: "10:00 AM" },
    { id: 2, doctor: "Dr. Khanna", date: "April 12, 2025", time: "2:30 PM" },
  ]);

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className="w-64 bg-blue-600 text-white p-6 min-h-screen">
        <h1 className="text-2xl font-bold mb-6">Dashboard</h1>
        <nav className="space-y-4">
          <Link
            href="/dashboard"
            className="flex items-center space-x-2 hover:bg-blue-500 p-2 rounded"
          >
            <Dashboard /> <span>Overview</span>
          </Link>
          <Link
            href="/"
            className="flex items-center space-x-2 hover:bg-blue-500 p-2 rounded"
          >
            <Person /> <span>Profile</span>
          </Link>
          <Link
            href="/admin/login"
            className="flex items-center space-x-2 hover:bg-red-500 p-2 rounded"
          >
            <ExitToApp /> <span>Logout</span>
          </Link>
        </nav>
      </aside>

      {/* Main Content */}
      <div className="flex-1 p-6">
        <h1 className="text-3xl font-bold text-blue-600 mb-6">Welcome Back!</h1>

        {/* Dashboard Grid Layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Treatments Box */}
          <div className="bg-white p-4 rounded-lg shadow-md border-l-4 border-blue-500">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <MedicalServices className="text-blue-500" /> Current Treatments
            </h2>
            <div className="mt-4 space-y-3">
              {treatments.map((treatment) => (
                <div
                  key={treatment.id}
                  className="p-3 bg-gray-50 rounded-md shadow-sm"
                >
                  <h3 className="font-semibold">{treatment.name}</h3>
                  <p className="text-gray-600">
                    <strong>Status:</strong> {treatment.status}
                  </p>
                  <p className="text-gray-600">
                    <strong>Doctor:</strong> {treatment.doctor}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Appointments Box */}
          <div className="bg-white p-4 rounded-lg shadow-md border-l-4 border-green-500">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <Event className="text-green-500" /> Upcoming Appointments
            </h2>
            <div className="mt-4 space-y-3">
              {appointments.map((appointment) => (
                <div
                  key={appointment.id}
                  className="p-3 bg-gray-50 rounded-md shadow-sm"
                >
                  <h3 className="font-semibold">{appointment.doctor}</h3>
                  <p className="text-gray-600">
                    {appointment.date} - {appointment.time}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Action Buttons Box */}
          <div className="bg-white p-4 rounded-lg shadow-md border-l-4 border-purple-500">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <History className="text-purple-500" /> Actions
            </h2>
            <div className="mt-4 flex flex-col space-y-3">
              <button className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600">
                Extract Medical History
              </button>
              <button className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600">
                Share Treatment Details
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;

