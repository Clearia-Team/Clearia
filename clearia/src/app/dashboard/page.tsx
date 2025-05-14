"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useSession, signIn, signOut } from "next-auth/react";
import {
  Dashboard,
  Person,
  ExitToApp,
  MedicalServices,
  Event,
  History,
} from "@mui/icons-material";

const DashboardPage = () => {
  const { data: session, status } = useSession();

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

  const [appointments] = useState([
    { id: 1, doctor: "Dr. Verma", date: "April 5, 2025", time: "10:00 AM" },
    { id: 2, doctor: "Dr. Khanna", date: "April 12, 2025", time: "2:30 PM" },
  ]);

  if (status === "loading") return <div>Loading...</div>;

  if (status === "unauthenticated") {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Link
          href="/auth/signin"
          className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
        >
          Login to continue
        </Link>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className="min-h-screen w-64 bg-blue-600 p-6 text-white">
        <h1 className="mb-6 text-2xl font-bold">Dashboard</h1>
        <nav className="space-y-4">
          <Link
            href="/dashboard"
            className="flex items-center space-x-2 rounded p-2 hover:bg-blue-500"
          >
            <Dashboard /> <span>Overview</span>
          </Link>
          <Link
            href="/"
            className="flex items-center space-x-2 rounded p-2 hover:bg-blue-500"
          >
            <Person /> <span>Profile</span>
          </Link>
          <button
            onClick={() => signOut()}
            className="flex w-full items-center space-x-2 rounded p-2 text-left hover:bg-red-500"
          >
            <ExitToApp /> <span>Logout</span>
          </button>
        </nav>
      </aside>

      {/* Main Content */}
      <div className="flex-1 p-6">
        <h1 className="mb-6 text-3xl font-bold text-blue-600">
          Welcome Back, {session?.user?.name ?? "User"}!
        </h1>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {/* Treatments */}
          <div className="rounded-lg border-l-4 border-blue-500 bg-white p-4 shadow-md">
            <h2 className="flex items-center gap-2 text-xl font-semibold">
              <MedicalServices className="text-blue-500" /> Current Treatments
            </h2>
            <div className="mt-4 space-y-3">
              {treatments.map((treatment) => (
                <div
                  key={treatment.id}
                  className="rounded-md bg-gray-50 p-3 shadow-sm"
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

          {/* Appointments */}
          <div className="rounded-lg border-l-4 border-green-500 bg-white p-4 shadow-md">
            <h2 className="flex items-center gap-2 text-xl font-semibold">
              <Event className="text-green-500" /> Upcoming Appointments
            </h2>
            <div className="mt-4 space-y-3">
              {appointments.map((appointment) => (
                <div
                  key={appointment.id}
                  className="rounded-md bg-gray-50 p-3 shadow-sm"
                >
                  <h3 className="font-semibold">{appointment.doctor}</h3>
                  <p className="text-gray-600">
                    {appointment.date} - {appointment.time}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="rounded-lg border-l-4 border-purple-500 bg-white p-4 shadow-md">
            <h2 className="flex items-center gap-2 text-xl font-semibold">
              <History className="text-purple-500" /> Actions
            </h2>
            <div className="mt-4 flex flex-col space-y-3">
              <button className="rounded-md bg-green-500 px-4 py-2 text-white hover:bg-green-600">
                Extract Medical History
              </button>
              <button className="rounded-md bg-blue-500 px-4 py-2 text-white hover:bg-blue-600">
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
