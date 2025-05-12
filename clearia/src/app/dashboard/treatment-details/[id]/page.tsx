"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";
import {
  ChevronLeft, Calendar, User, Building, Clipboard,
  Pill, AlertCircle, Phone, Bed, Clock
} from "lucide-react";
import { api } from "~/trpc/react";

// Types based on updated Prisma schema
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
  sideEffects?: string;
};

type IcuStatus = {
  bedNumber: string;
  admissionDate: Date;
  reason: string;
};

type TreatmentHistoryEntry = {
  id: string;
  treatmentId: string;
  session: number;
  date: Date;
  notes: string;
  progress: string;
  adjustments: string;
  sideEffects: string;
  prescribedMedications?: string | null;
  nextReview?: Date | null;
  doctorId: string;
  doctor: {
    name: string;
  };
  createdAt: Date;
  updatedAt: Date;
};

// Type for the treatment history response from the API
type TreatmentHistoryResponse = {
  history: TreatmentHistoryEntry[] | null;
  message: string;
  error: string | null;
};

export default function TreatmentDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const { data: session, status: sessionStatus } = useSession();
  const id = params?.id as string;

  // Use tRPC hooks to fetch data
  const { data: treatment, isLoading: treatmentLoading } = api.treatment.getById.useQuery(
    id,
    {
      enabled: sessionStatus === "authenticated" && !!id,
    }
  );

  const treatmentHistoryQuery = api.treatmentHistory.getByTreatmentId.useQuery(
    { treatmentId: id },
    {
      enabled: sessionStatus === "authenticated" && !!id,
    }
  );

  const historyLoading = treatmentHistoryQuery.isLoading;
  // Extract history from the structured response and ensure it's typed properly
  const historyData: TreatmentHistoryResponse = treatmentHistoryQuery.data || { history: null, message: "", error: null };
  const historyEntries: TreatmentHistoryEntry[] = historyData.history || [];
  const historyError = historyData.error;

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

  const isLoading = treatmentLoading || historyLoading || icuStatusLoading || sessionStatus === "loading";

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

  if (!treatment) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Treatment not found</h1>
          <Link 
            href="/dashboard" 
            className="text-blue-600 hover:text-blue-800 font-medium"
          >
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  // Handle errors from treatment history query
  if (historyError && historyError !== "NOT_AUTHENTICATED") {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Error loading treatment history</h1>
          <p className="text-gray-600 mb-4">{treatmentHistoryQuery.data?.message || "Something went wrong"}</p>
          <Link 
            href="/dashboard" 
            className="text-blue-600 hover:text-blue-800 font-medium"
          >
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  const icuStatus = icuStatusData?.latestStatus as IcuStatus | null;
  const history = historyEntries;

  // Get latest treatment history for medications and next review if available
  const latestHistory = history.length > 0 
    ? [...history].sort((a: TreatmentHistoryEntry, b: TreatmentHistoryEntry) => b.session - a.session)[0] 
    : null;

  const formatDate = (date: Date) => {
    if (!date) return "Not scheduled";
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

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-5xl mx-auto">
        {/* Header with Back Button */}
        <div className="mb-6">
          <Link 
            href="/dashboard" 
            className="inline-flex items-center text-blue-600 hover:text-blue-800 font-medium transition-colors"
          >
            <ChevronLeft className="mr-1" size={20} />
            Back to Dashboard
          </Link>
        </div>

        {/* Main Card */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          {/* Treatment Header */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-6 text-white">
            <h1 className="text-2xl md:text-3xl font-bold mb-2">{treatment.name}</h1>
            <div className="flex flex-wrap items-center gap-4 text-blue-100">
              <span className="inline-flex items-center">
                <User className="mr-2" size={16} />
                Dr. {treatment.doctor.name}
              </span>
              <span className="inline-flex items-center">
                <Building className="mr-2" size={16} />
                {treatment.hospital}
              </span>
              <span className="inline-flex items-center">
                <Calendar className="mr-2" size={16} />
                {formatDate(treatment.date)}
              </span>
              <span className={`px-3 py-1 text-xs font-medium rounded-full ${
                getStatusBadgeClasses(treatment.status)
              }`}>
                {getDisplayStatus(treatment.status)}
              </span>
              {treatment.status === 'ONGOING' && icuStatus && (
                <span className="inline-flex items-center bg-red-100 text-red-800 px-3 py-1 rounded-full text-xs font-medium">
                  <Bed className="mr-1" size={14} />
                  ICU Bed #{icuStatus.bedNumber}
                </span>
              )}
            </div>
          </div>

          {/* Treatment Content */}
          <div className="p-6 md:p-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Overview */}
            <div className="lg:col-span-2 space-y-8">
              {/* Treatment Description */}
              <div>
                <h2 className="text-xl font-semibold text-gray-800 mb-4">About this Treatment</h2>
                <p className="text-gray-700">{treatment.description || "No description provided."}</p>
              </div>
              
              {/* Treatment History */}
              <div>
                <div className="flex items-center mb-4">
                  <Clipboard className="text-blue-600 mr-2" size={20} />
                  <h2 className="text-xl font-semibold text-gray-800">Treatment History</h2>
                </div>
                {history.length > 0 ? (
                  <div className="space-y-4">
                    {[...history]
                      .sort((a: TreatmentHistoryEntry, b: TreatmentHistoryEntry) => b.session - a.session) // Show newest sessions first
                      .map((session: TreatmentHistoryEntry) => (
                      <div key={session.id} className="border-l-4 border-blue-200 pl-4 py-2">
                        <div className="bg-white p-4 rounded-lg shadow-xs">
                          <div className="flex justify-between items-start mb-2">
                            <h3 className="font-medium text-gray-800">Session {session.session}</h3>
                            <span className="text-sm text-gray-500">{formatDate(session.date)}</span>
                          </div>
                          <div className="space-y-2 text-sm">
                            <div className="flex items-center text-xs text-gray-500 mb-2">
                              <User className="mr-1" size={14} />
                              Attending Doctor: Dr. {session.doctor?.name ?? treatment.doctor.name}
                            </div>
                            <p><span className="font-medium text-gray-700">Notes:</span> {session.notes}</p>
                            <p><span className="font-medium text-gray-700">Progress:</span> {session.progress}</p>
                            <p><span className="font-medium text-gray-700">Adjustments:</span> {session.adjustments}</p>
                            <p><span className="font-medium text-gray-700">Side Effects:</span> {session.sideEffects}</p>
                            
                            {/* Show prescribed medications if available */}
                            {session.prescribedMedications && (
                              <p>
                                <span className="font-medium text-gray-700">Prescribed Medications:</span> {session.prescribedMedications}
                              </p>
                            )}
                            
                            {/* Show next review date if available */}
                            {session.nextReview && (
                              <p>
                                <span className="font-medium text-gray-700">Next Review:</span> {formatDate(session.nextReview)}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500">No treatment history available.</p>
                )}
              </div>
            </div>

            {/* Right Column - Details */}
            <div className="space-y-8">
              {/* ICU Status (only for ongoing treatments) */}
              {treatment.status === 'ONGOING' && icuStatus && (
                <div className="bg-red-50 rounded-lg p-5 border border-red-100">
                  <div className="flex items-center mb-3">
                    <Bed className="text-red-600 mr-2" size={20} />
                    <h2 className="text-xl font-semibold text-gray-800">ICU Admission</h2>
                  </div>
                  <div className="space-y-2 text-sm">
                    <p><span className="font-medium text-gray-700">Bed Number:</span> {icuStatus.bedNumber}</p>
                    <p>
                      <span className="font-medium text-gray-700">Admitted On:</span>{" "}
                      {formatDate(icuStatus.admissionDate)}
                    </p>
                    <p>
                      <span className="font-medium text-gray-700">Condition:</span>{" "}
                      {icuStatus.reason ?? 'Critical care required'}
                    </p>
                  </div>
                </div>
              )}

              {/* Side Effects */}
              <div className="bg-red-50 rounded-lg p-5 border border-red-100">
                <div className="flex items-center mb-3">
                  <AlertCircle className="text-red-600 mr-2" size={20} />
                  <h2 className="text-xl font-semibold text-gray-800">Side Effects</h2>
                </div>
                {treatment.sideEffects || (latestHistory && latestHistory.sideEffects) ? (
                  <ul className="list-disc list-inside text-gray-700 space-y-1">
                    {(treatment.sideEffects ?? latestHistory?.sideEffects ?? '')
                      .split(',')
                      .map((effect: string, i: number) => (
                        <li key={i}>{effect.trim()}</li>
                      ))}
                  </ul>
                ) : (
                  <p className="text-gray-500 text-sm">No side effects reported.</p>
                )}
              </div>

              {/* Medications */}
              <div className="bg-purple-50 rounded-lg p-5 border border-purple-100">
                <div className="flex items-center mb-3">
                  <Pill className="text-purple-600 mr-2" size={20} />
                  <h2 className="text-xl font-semibold text-gray-800">Prescribed Medications</h2>
                </div>
                {latestHistory?.prescribedMedications ? (
                  <ul className="list-disc list-inside text-gray-700 space-y-2">
                    {latestHistory.prescribedMedications
                      .split(',')
                      .map((med: string, i: number) => (
                        <li key={i}>{med.trim()}</li>
                      ))}
                  </ul>
                ) : (
                  <p className="text-gray-500 text-sm">No medications prescribed.</p>
                )}
              </div>

              {/* Next Review */}
              {treatment.status === 'ONGOING' && latestHistory?.nextReview && (
                <div className="bg-green-50 rounded-lg p-5 border border-green-100">
                  <div className="flex items-center mb-3">
                    <Calendar className="text-green-600 mr-2" size={20} />
                    <h2 className="text-xl font-semibold text-gray-800">Next Review</h2>
                  </div>
                  <p className="text-gray-700">{formatDate(latestHistory.nextReview)}</p>
                </div>
              )}

              {/* Contact */}
              <div className="bg-blue-50 rounded-lg p-5 border border-blue-100">
                <div className="flex items-center mb-3">
                  <Phone className="text-blue-600 mr-2" size={20} />
                  <h2 className="text-xl font-semibold text-gray-800">Contact Doctor</h2>
                </div>
                <p className="text-gray-700">Dr. {treatment.doctor.name} - Available during hospital hours</p>
                <p className="text-gray-500 text-sm">93114-51097</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
