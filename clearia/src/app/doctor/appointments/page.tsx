"use client";

import React, { useState } from "react";
import { User, Stethoscope, Clock, Calendar, Star, Filter, Search } from "lucide-react";

type AppointmentStatus = "SCHEDULED" | "COMPLETED" | "CANCELLED" | "RESCHEDULED";
type AppointmentType = "CONSULTATION" | "FOLLOW_UP" | "CHECKUP" | "EMERGENCY";

interface Appointment {
  id: string;
  patientName: string;
  date: string;
  time: string;
  duration: number;
  status: AppointmentStatus;
  type: AppointmentType;
  reason: string;
  isNewPatient: boolean;
}

const appointments: Appointment[] = [
  {
    id: "A001",
    patientName: "Rajesh Kumar",
    date: "2024-06-17",
    time: "09:30",
    duration: 30,
    status: "SCHEDULED",
    type: "FOLLOW_UP",
    reason: "Post-operative checkup",
    isNewPatient: false
  },
  {
    id: "A002",
    patientName: "Priya Patel",
    date: "2024-06-17",
    time: "10:15",
    duration: 45,
    status: "SCHEDULED",
    type: "CONSULTATION",
    reason: "Persistent cough and fever",
    isNewPatient: false
  },
  {
    id: "A003",
    patientName: "Amit Singh",
    date: "2024-06-17",
    time: "11:00",
    duration: 20,
    status: "SCHEDULED",
    type: "CHECKUP",
    reason: "Routine blood pressure check",
    isNewPatient: false
  },
  {
    id: "A004",
    patientName: "Sunita Devi",
    date: "2024-06-18",
    time: "14:00",
    duration: 60,
    status: "SCHEDULED",
    type: "EMERGENCY",
    reason: "Stroke follow-up",
    isNewPatient: true
  }
];

const getStatusColor = (status: AppointmentStatus) => {
  switch (status) {
    case "SCHEDULED": return "bg-blue-50 text-blue-700 border-blue-200";
    case "COMPLETED": return "bg-green-50 text-green-700 border-green-200";
    case "CANCELLED": return "bg-red-50 text-red-700 border-red-200";
    case "RESCHEDULED": return "bg-amber-50 text-amber-700 border-amber-200";
    default: return "bg-gray-50 text-gray-700 border-gray-200";
  }
};

const getTypeColor = (type: AppointmentType) => {
  switch (type) {
    case "CONSULTATION": return "bg-purple-50 text-purple-700 border-purple-200";
    case "FOLLOW_UP": return "bg-teal-50 text-teal-700 border-teal-200";
    case "CHECKUP": return "bg-cyan-50 text-cyan-700 border-cyan-200";
    case "EMERGENCY": return "bg-red-50 text-red-700 border-red-200";
    default: return "bg-gray-50 text-gray-700 border-gray-200";
  }
};

const getTypeIcon = (type: AppointmentType) => {
  switch (type) {
    case "EMERGENCY": return "🚨";
    case "CONSULTATION": return "💬";
    case "FOLLOW_UP": return "🔄";
    case "CHECKUP": return "✅";
    default: return "📋";
  }
};

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
};

const formatTime = (timeString: string) => {
  const [hours, minutes] = timeString.split(':');
  const hour = parseInt(hours);
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const hour12 = hour % 12 || 12;
  return `${hour12}:${minutes} ${ampm}`;
};

export default function AppointmentsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("ALL");

  const filteredAppointments = appointments.filter(appointment => {
    const matchesSearch = appointment.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         appointment.reason.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = selectedFilter === "ALL" || appointment.type === selectedFilter;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-slate-900 mb-2">Medical Appointments</h1>
              <p className="text-slate-600">Manage your upcoming patient appointments</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium">
                {filteredAppointments.length} Appointments
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Search and Filter Bar */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={20} />
              <input
                type="text"
                placeholder="Search patients or reasons..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="text-slate-500" size={20} />
              <select
                value={selectedFilter}
                onChange={(e) => setSelectedFilter(e.target.value)}
                className="px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="ALL">All Types</option>
                <option value="CONSULTATION">Consultation</option>
                <option value="FOLLOW_UP">Follow-up</option>
                <option value="CHECKUP">Checkup</option>
                <option value="EMERGENCY">Emergency</option>
              </select>
            </div>
          </div>
        </div>
        
        {/* Appointments Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredAppointments.map((appointment) => (
            <div 
              key={appointment.id} 
              className="bg-white rounded-xl shadow-sm border border-slate-200 hover:shadow-md transition-all duration-200 hover:scale-[1.02] cursor-pointer overflow-hidden"
            >
              {/* Card Header */}
              <div className="p-6 pb-4">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-3 rounded-xl shadow-sm">
                      <User className="text-white" size={20} />
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-900 text-lg">{appointment.patientName}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        <Clock className="text-slate-400" size={14} />
                        <span className="text-sm text-slate-600">
                          {formatTime(appointment.time)} • {appointment.duration} mins
                        </span>
                      </div>
                    </div>
                  </div>
                  {appointment.isNewPatient && (
                    <div className="bg-gradient-to-r from-emerald-400 to-emerald-500 text-white text-xs px-3 py-1 rounded-full font-medium shadow-sm">
                      <Star className="inline mr-1" size={12} />
                      New
                    </div>
                  )}
                </div>
                
                {/* Status and Type Tags */}
                <div className="flex flex-wrap gap-2 mb-4">
                  <span className={`px-3 py-1 text-xs font-medium rounded-full border ${getStatusColor(appointment.status)}`}>
                    {appointment.status}
                  </span>
                  <span className={`px-3 py-1 text-xs font-medium rounded-full border ${getTypeColor(appointment.type)}`}>
                    {getTypeIcon(appointment.type)} {appointment.type.replace("_", " ")}
                  </span>
                </div>
                
                {/* Reason */}
                <div className="bg-slate-50 rounded-lg p-4 mb-4">
                  <div className="flex items-start gap-2">
                    <Stethoscope className="text-slate-500 mt-0.5 flex-shrink-0" size={16} />
                    <p className="text-sm text-slate-700 leading-relaxed">{appointment.reason}</p>
                  </div>
                </div>
              </div>
              
              {/* Card Footer */}
              <div className="bg-slate-50 px-6 py-4 border-t border-slate-100">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-slate-600">
                    <Calendar className="text-slate-400" size={16} />
                    <span className="text-sm font-medium">{formatDate(appointment.date)}</span>
                  </div>
                  <div className="text-xs text-slate-500 font-mono">
                    ID: {appointment.id}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredAppointments.length === 0 && (
          <div className="text-center py-12">
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8">
              <div className="text-slate-400 mb-4">
                <Search size={48} className="mx-auto" />
              </div>
              <h3 className="text-lg font-medium text-slate-900 mb-2">No appointments found</h3>
              <p className="text-slate-600">Try adjusting your search terms or filters</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
