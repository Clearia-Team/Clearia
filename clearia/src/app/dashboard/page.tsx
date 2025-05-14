"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import {
  FileText,
  Upload,
  FileSearch,
  CreditCard,
  LogOut,
  PlusCircle,
  ChevronRight,
  Calendar,
  User,
  Clock,
  AlertCircle,
  BriefcaseMedical
} from "lucide-react";
import Link from "next/link";
import { api } from "~/trpc/react";

// Types based on Prisma schema
type TreatmentStatus = "SCHEDULED" | "ONGOING" | "COMPLETED" | "CANCELLED";

type Treatment = {
  id: string;
  name: string;
  hospital: string;
  status: TreatmentStatus;
  doctor: {
    name: string;
  };
  date: Date;
  description?: string;
  nextReviewDate?: Date;
  sideEffects?: string;
  medications?: string[];
};

type IcuAdmission = {
  id: string;
  bedNumber: number;
  admissionDate: Date;
  dischargeDate: Date | null;
};

const UserDashboard = () => {
  const [activeTab, setActiveTab] = useState("treatments");
  const router = useRouter();
  const { data: session, status: sessionStatus } = useSession();

  // Use tRPC hooks to fetch data
  const { data: treatmentsData, isLoading: treatmentsLoading } = api.treatment.getAll.useQuery(
    undefined, // No input needed as the server will filter by the current user
    {
      enabled: sessionStatus === "authenticated",
    }
  );

 const { data: icuStatusData, isLoading: icuStatusLoading } = api.icuAdmission.getCurrentStatus.useQuery(
  { patientId: session?.user?.id ?? "" },
  {
    enabled: sessionStatus === "authenticated" && !!session?.user?.id,
  }
);

  // Check if user is authenticated
  if (sessionStatus === "unauthenticated") {
    router.push("/auth/signin");
    return null;
  }

  const isLoading = treatmentsLoading || icuStatusLoading || sessionStatus === "loading";

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  const treatments = treatmentsData ?? [];
  const icuStatus = icuStatusData?.latestStatus ?? null;

  const formatDate = (date: Date) => {
    const options: Intl.DateTimeFormatOptions = { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    };
    return new Date(date).toLocaleDateString(undefined, options);
  };

  const getStatusBadgeClasses = (status: TreatmentStatus) => {
    switch(status) {
      case "ONGOING":
        return "bg-yellow-100 text-yellow-800";
      case "COMPLETED":
        return "bg-green-100 text-green-800";
      case "SCHEDULED":
        return "bg-blue-100 text-blue-800";
      case "CANCELLED":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getDisplayStatus = (status: TreatmentStatus) => {
    return status.charAt(0) + status.slice(1).toLowerCase();
  };

  const renderTreatmentCard = (treatment: Treatment) => {
    const displayStatus = getDisplayStatus(treatment.status);
    
    return (
      <div
        key={treatment.id}
        onClick={() => router.push(`/dashboard/treatment-details/${treatment.id}`)}
        className="bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden cursor-pointer group"
      >
        <div className={`h-2 ${
          treatment.status === "ONGOING" ? "bg-yellow-500" : 
          treatment.status === "COMPLETED" ? "bg-green-500" : "bg-blue-500"
        }`}></div>
        <div className="p-5">
          <div className="flex justify-between items-start mb-3">
            <h3 className="text-lg font-semibold text-gray-800 group-hover:text-blue-600 transition-colors">
              {treatment.name}
            </h3>
            <span className={`px-3 py-1 text-xs font-medium rounded-full ${getStatusBadgeClasses(treatment.status)}`}>
              {displayStatus}
            </span>
          </div>
          
          <p className="text-sm text-gray-600 mb-4 line-clamp-2">{treatment.description ?? "No description provided"}</p>
          
          <div className="border-t border-gray-100 pt-3 space-y-2">
            <div className="flex items-center text-sm text-gray-500">
              <User size={16} className="mr-2 text-blue-500" />
              <span>Dr. {treatment.doctor.name.replace(/^Dr\.\s+/, '')}</span>
            </div>
            
            <div className="flex items-center text-sm text-gray-500">
              <Calendar size={16} className="mr-2 text-blue-500" />
              <span>{formatDate(treatment.date)}</span>
            </div>
            
            <div className="flex items-center text-sm text-gray-500">
              <Clock size={16} className="mr-2 text-blue-500" />
              <span>{treatment.nextReviewDate ? `Next review: ${formatDate(treatment.nextReviewDate)}` : 'No review scheduled'}</span>
            </div>
            
            {icuStatus && treatment.status === "ONGOING" && (
              <div className="flex items-center text-sm text-red-600 font-medium mt-2">
                <AlertCircle size={16} className="mr-2" />
                <span>In ICU — Bed #{icuStatus.bedNumber}</span>
              </div>
            )}
          </div>
        </div>
        
        <div className="bg-gray-50 px-5 py-3 flex justify-between items-center border-t border-gray-100">
          <span className="text-sm font-medium text-gray-600">{treatment.hospital}</span>
          <ChevronRight className="text-blue-400 group-hover:text-blue-600 transition-colors" size={18} />
        </div>
      </div>
    );
  };

  const renderTreatmentRow = (treatment: Treatment) => {
    const displayStatus = getDisplayStatus(treatment.status);
    
    return (
      <div
        key={treatment.id}
        onClick={() => router.push(`/dashboard/treatment-details/${treatment.id}`)}
        className="bg-white border border-gray-200 p-4 rounded-lg hover:border-blue-300 hover:shadow-sm transition-all cursor-pointer group"
      >
        <div className="flex justify-between items-center">
          <div className="flex-1">
            <div className="flex items-center">
              <h4 className="font-medium text-gray-800 group-hover:text-blue-600 transition-colors">
                {treatment.name}
              </h4>
              <span className={`ml-3 px-2 py-0.5 text-xs font-medium rounded-full ${getStatusBadgeClasses(treatment.status)}`}>
                {displayStatus}
              </span>
            </div>
            
            <div className="mt-1 flex items-center gap-4 text-sm">
              <span className="text-gray-500 flex items-center">
                <User size={14} className="mr-1 text-gray-400" />
                {treatment.doctor.name}
              </span>
              
              <span className="text-gray-500 flex items-center">
                <Calendar size={14} className="mr-1 text-gray-400" />
                {formatDate(treatment.date)}
              </span>
              
              {treatment.medications && treatment.medications.length > 0 && (
                <span className="text-gray-500">
                  {treatment.medications.length} medication{treatment.medications.length !== 1 ? 's' : ''}
                </span>
              )}
              
              {icuStatus && treatment.status === "ONGOING" && (
                <span className="text-red-600 font-medium flex items-center">
                  <AlertCircle size={14} className="mr-1" />
                  ICU Bed #{icuStatus.bedNumber}
                </span>
              )}
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500">{treatment.hospital}</span>
            <ChevronRight className="text-gray-400 group-hover:text-blue-600 transition-colors" size={16} />
          </div>
        </div>
      </div>
    );
  };

  const renderContent = () => {
    // Filter treatments by status
    const ongoing = treatments.filter((t) => t.status === "ONGOING");
    const scheduled = treatments.filter((t) => t.status === "SCHEDULED");
    
    // Group all treatments by hospital
    const allByHospital: Record<string, Treatment[]> = {};
    treatments.forEach((t) => {
      allByHospital[t.hospital] ??= [];
      allByHospital[t.hospital].push(t);
    });

    // Sort treatments within each hospital (ongoing first, then by date)
    Object.keys(allByHospital).forEach(hospital => {
      allByHospital[hospital].sort((a, b) => {
        if (a.status === "ONGOING" && b.status !== "ONGOING") return -1;
        if (a.status !== "ONGOING" && b.status === "ONGOING") return 1;
        return new Date(b.date).getTime() - new Date(a.date).getTime(); // Newest first for same status
      });
    });

    switch (activeTab) {
      case "treatments":
        return (
          <div className="p-8 space-y-8 w-full">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
              <div>
                <h1 className="text-3xl font-bold text-gray-800">My Treatments</h1>
                <p className="text-gray-500">Manage your medical treatments and history</p>
              </div>
              <button
                onClick={() => router.push("/dashboard/new-treatment")}
                className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-all duration-300 shadow-md hover:shadow-lg"
              >
                <PlusCircle size={18} />
                <span>New Treatment</span>
              </button>
            </div>

            {/* Treatment Summary Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-2">
              <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
                <h3 className="text-gray-500 text-sm font-medium mb-2">Total Treatments</h3>
                <div className="flex items-end gap-2">
                  <span className="text-2xl font-semibold text-gray-800">{treatments.length}</span>
                  <span className="text-sm text-gray-500 mb-1">records</span>
                </div>
              </div>
              <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
                <h3 className="text-yellow-600 text-sm font-medium mb-2">Ongoing</h3>
                <div className="flex items-end gap-2">
                  <span className="text-2xl font-semibold text-gray-800">{ongoing.length}</span>
                  <span className="text-sm text-gray-500 mb-1">treatments</span>
                </div>
              </div>
              <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
                <h3 className="text-blue-600 text-sm font-medium mb-2">Upcoming</h3>
                <div className="flex items-end gap-2">
                  <span className="text-2xl font-semibold text-gray-800">{scheduled.length}</span>
                  <span className="text-sm text-gray-500 mb-1">appointments</span>
                </div>
              </div>
            </div>

            {ongoing.length > 0 && (
              <section className="space-y-6">
                <div className="flex items-center justify-between border-b border-gray-200 pb-2">
                  <h2 className="text-2xl font-semibold text-gray-800">Ongoing Treatments</h2>
                  <span className="bg-yellow-100 text-yellow-800 text-sm font-medium px-3 py-1 rounded-full">
                    {ongoing.length} active
                  </span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {ongoing.map((treatment) => renderTreatmentCard(treatment))}
                </div>
              </section>
            )}

            <section className="space-y-6">
              <div className="border-b border-gray-200 pb-2">
                <h2 className="text-2xl font-semibold text-gray-800">All Treatments</h2>
              </div>
              
              {Object.keys(allByHospital).length === 0 ? (
                <div className="bg-white border border-gray-200 rounded-lg p-6 text-center">
                  <p className="text-gray-500">No treatments found.</p>
                </div>
              ) : (
                <div className="space-y-8">
                  {Object.keys(allByHospital).map((hospital) => (
                    <div key={hospital} className="space-y-3">
                      <div className="flex items-center gap-3">
                        <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                        <h3 className="text-xl font-medium text-gray-800">{hospital}</h3>
                      </div>
                      <div className="space-y-2 pl-6">
                        {allByHospital[hospital].map((treatment) => renderTreatmentRow(treatment))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </div>
        );
      case "plans":
        return (
          <div className="p-8 w-full">
            <h2 className="text-3xl font-bold text-gray-800 mb-2">Health Plans</h2>
            <p className="text-gray-500 mb-6">Manage your subscription and package options</p>
            <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
              <p className="text-gray-600">Premium health plan features coming soon</p>
            </div>
          </div>
        );
      case "upload":
        return (
          <div className="p-8 w-full">
            <h2 className="text-3xl font-bold text-gray-800 mb-2">Upload Medical Records</h2>
            <p className="text-gray-500 mb-6">Securely upload your medical documents</p>
            <div className="bg-white border-2 border-dashed border-gray-300 rounded-xl p-12 text-center hover:border-blue-300 transition-colors cursor-pointer">
              <Upload className="mx-auto text-gray-400 mb-3" size={40} />
              <h3 className="text-lg font-medium text-gray-700">Drag and drop files here</h3>
              <p className="text-gray-500 mt-1">or click to browse your device</p>
              <p className="text-sm text-gray-400 mt-3">Supports PDF, JPG, PNG (Max 25MB)</p>
            </div>
          </div>
        );
      case "extract":
        return (
          <div className="p-8 w-full">
            <h2 className="text-3xl font-bold text-gray-800 mb-2">Medical History Summary</h2>
            <p className="text-gray-500 mb-6">Key information extracted from your records</p>
            <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
              <div className="flex items-center gap-3 text-gray-500">
                <FileSearch className="text-blue-400" />
                <p>Upload medical documents to generate your health summary</p>
              </div>
            </div>
          </div>
        );
       
        case "recommendation":
  return (
    <div className="p-8 w-full">
      <h2 className="text-3xl font-bold text-gray-800 mb-2">Doctor Recommendations</h2>
      <p className="text-gray-500 mb-6">Enter your symptoms to get doctor suggestions from <b>Indra Gandhi Medical College (IGMC), Shimla</b>.</p>

      <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm space-y-6">
        {/* Symptom Input */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Your Symptoms</label>
          <input
            type="text"
            placeholder="e.g., fever, headache"
            className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
        </div>

        {/* Submit Button */}
        <div>
          <button
            className="bg-blue-500 text-white px-5 py-2 rounded-lg hover:bg-blue-600 transition"
            onClick={() => {
              // Trigger symptom processing function here
              // Example: handleSymptomSubmit()
            }}
          >
            Get Recommendations
          </button>
        </div>

        {/* Result Section */}
        <div className="border-t pt-4">
          <h3 className="text-xl font-semibold text-gray-800 mb-2">Recommendations</h3>
          <p className="text-gray-500">You'll see a list of relevant doctors here based on your symptoms. For better results please enter at least 4 symptoms</p>
          {/* Map the result here once available */}
        </div>
      </div>
    </div>
  );


      default:
        return null;
    }
  };

  const menuItems = [
    { id: "treatments", label: "Treatments", icon: FileText },
    { id: "upload", label: "Upload History", icon: Upload },
    { id: "extract", label: "Extract History", icon: FileSearch },
    { id: "plans", label: "Health Plans", icon: CreditCard },
    { id: "recommendation", label : "Search for a Doctor", icon : BriefcaseMedical }
  ];

  return (
    <div className="flex min-h-screen bg-gray-50">
      <aside className="w-64 bg-blue-700 text-white p-6 flex flex-col fixed h-full justify-between">
        <div>
          <div className="mb-8">
            <h1 className="text-xl font-bold text-white">Dashboard</h1>
            <p className="text-sm text-blue-200">Patient Portal</p>
          </div>
          <nav className="space-y-1">
            {menuItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center gap-3 w-full p-3 rounded-lg text-left transition-colors ${
                  activeTab === item.id
                    ? "bg-blue-600/90 text-white font-medium"
                    : "text-blue-100 hover:bg-blue-600/50"
                }`}
              >
                <item.icon size={18} className={activeTab === item.id ? "text-white" : "text-blue-200"} />
                <span>{item.label}</span>
              </button>
            ))}
          </nav>
        </div>

        <div className="mt-auto pt-4 border-t border-blue-600">
          <Link
            href="/api/auth/signout"
            className="flex items-center gap-3 p-3 rounded-lg text-blue-100 hover:bg-red-500/90 hover:text-white transition-colors"
          >
            <LogOut size={18} />
            <span>Logout</span>
          </Link>
        </div>
      </aside>

      <main className="flex-1 ml-64 overflow-y-auto">{renderContent()}</main>
    </div>
  );
};

export default UserDashboard;
