"use client";
import React, { useState } from 'react';
import Link from "next/link";
import { ExitToApp } from '@mui/icons-material';

const AdminDashboard = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [filterDoctor, setFilterDoctor] = useState("");

  const patientData = [
    { id: 'P001', name: 'John Doe', room: '101', doctor: 'Dr. Smith', nurse: 'Nurse Joy', treatment: 'Physiotherapy', status: 'Stable' },
    { id: 'P002', name: 'Jane Roe', room: '102', doctor: 'Dr. Brown', nurse: 'Nurse Kelly', treatment: 'Post-surgery', status: 'Critical' },
    { id: 'P003', name: 'Robert Miles', room: '103', doctor: 'Dr. Smith', nurse: 'Nurse Lucy', treatment: 'Cardiac care', status: 'Stable' },
    { id: 'P004', name: 'Emily Stone', room: '104', doctor: 'Dr. Patel', nurse: 'Nurse Nina', treatment: 'Chemotherapy', status: 'Under Observation' },
    { id: 'P005', name: 'Michael Scott', room: '105', doctor: 'Dr. Wang', nurse: 'Nurse Kim', treatment: 'Checkup', status: 'Discharged' },
    { id: 'P006', name: 'Sophia Johnson', room: '106', doctor: 'Dr. Lee', nurse: 'Nurse Emma', treatment: 'COVID Recovery', status: 'Stable' },
    { id: 'P007', name: 'Daniel White', room: '107', doctor: 'Dr. Khan', nurse: 'Nurse Rina', treatment: 'Post-op care', status: 'Critical' },
  ];

  const doctors = [...new Set(patientData.map(p => p.doctor))];

  const filteredPatients = patientData.filter((p) => {
    const matchesSearch = Object.values(p).join(" ").toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus ? p.status === filterStatus : true;
    const matchesDoctor = filterDoctor ? p.doctor === filterDoctor : true;
    return matchesSearch && matchesStatus && matchesDoctor;
  });

  const getCount = (status: string) => patientData.filter(p => p.status === status).length;

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside className="w-64 bg-blue-700 text-white p-6 sticky top-0 h-screen">
        <h1 className="text-3xl font-bold mb-10">Admin Panel</h1>
        <nav className="space-y-4">
          <Link href="/login/admin" className="flex items-center space-x-2 hover:bg-red-500 p-2 rounded">
            <ExitToApp /> <span>Logout</span>
          </Link>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 bg-gray-100 p-6">
        {/* Top */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <h2 className="text-2xl font-semibold">Dashboard Overview</h2>
          <input
            type="text"
            placeholder="Search patients..."
            className="w-full sm:w-72 px-4 py-2 border rounded-lg shadow-sm focus:ring-2 focus:ring-blue-400"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <div className="bg-white p-4 rounded-lg shadow hover:shadow-md">
            <p className="text-gray-500">Total Patients</p>
            <h3 className="text-2xl font-bold">{patientData.length}</h3>
          </div>
          <div className="bg-white p-4 rounded-lg shadow hover:shadow-md">
            <p className="text-gray-500">Critical</p>
            <h3 className="text-2xl font-bold text-red-500">{getCount("Critical")}</h3>
          </div>
          <div className="bg-white p-4 rounded-lg shadow hover:shadow-md">
            <p className="text-gray-500">Discharged</p>
            <h3 className="text-2xl font-bold text-green-600">{getCount("Discharged")}</h3>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center mb-4">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="p-2 border rounded w-full sm:w-auto"
          >
            <option value="">Filter by Status</option>
            <option value="Critical">Critical</option>
            <option value="Stable">Stable</option>
            <option value="Discharged">Discharged</option>
            <option value="Under Observation">Under Observation</option>
          </select>
          <select
            value={filterDoctor}
            onChange={(e) => setFilterDoctor(e.target.value)}
            className="p-2 border rounded w-full sm:w-auto"
          >
            <option value="">Filter by Doctor</option>
            {doctors.map((doc, i) => (
              <option key={i} value={doc}>{doc}</option>
            ))}
          </select>
          <button
            className="bg-gray-300 hover:bg-gray-400 text-black px-4 py-2 rounded"
            onClick={() => {
              setFilterStatus("");
              setFilterDoctor("");
              setSearchQuery("");
            }}
          >
            Clear Filters
          </button>
          <button
            className="bg-gray-300 hover:bg-gray-400 text-black px-4 py-2 rounded"
            onClick={() => {
              // Placeholder for Add functionality
              console.log("Add button clicked");
            }}
          >
            Add
          </button>
        </div>

        {/* Table */}
        <div className="bg-white rounded-lg shadow overflow-x-auto">
          <table className="w-full text-left min-w-[900px]">
            <thead className="bg-blue-100 text-gray-700 uppercase text-sm">
              <tr>
                <th className="p-3">ID</th>
                <th className="p-3">Name</th>
                <th className="p-3">Room</th>
                <th className="p-3">Doctor</th>
                <th className="p-3">Nurse</th>
                <th className="p-3">Treatment</th>
                <th className="p-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredPatients.length > 0 ? (
                filteredPatients.map((p, i) => (
                  <tr key={i} className="border-b hover:bg-gray-50 transition duration-200">
                    <td className="p-3">{p.id}</td>
                    <td className="p-3">{p.name}</td>
                    <td className="p-3">{p.room}</td>
                    <td className="p-3">{p.doctor}</td>
                    <td className="p-3">{p.nurse}</td>
                    <td className="p-3">{p.treatment}</td>
                    <td className="p-3">
                      <span className={`px-2 py-1 rounded-full text-sm font-medium ${
                        p.status === 'Critical'
                          ? 'bg-red-100 text-red-600'
                          : p.status === 'Stable'
                          ? 'bg-green-100 text-green-600'
                          : p.status === 'Discharged'
                          ? 'bg-gray-200 text-gray-700'
                          : 'bg-yellow-100 text-yellow-700'
                      }`}>
                        {p.status}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td className="p-4 text-center text-gray-500" colSpan={7}>No patients found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;

