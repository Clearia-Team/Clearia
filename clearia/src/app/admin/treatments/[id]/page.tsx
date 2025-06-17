"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useParams } from "next/navigation";
import { api } from "~/trpc/react";
import type { TreatmentStatus } from "@prisma/client";

const EditTreatmentPage = () => {
  const router = useRouter();
  const params = useParams();
  const treatmentId = params.id as string;

  // State for form data
  const [formData, setFormData] = useState({
    name: "",
    hospital: "",
    date: "",
    patientId: "",
    doctorId: "",
    status: "ONGOING" as TreatmentStatus,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Fetch treatment data
  const { data: treatment, isLoading: treatmentLoading, error: treatmentError } = 
    api.treatment.getById.useQuery(treatmentId);

  // Fetch patients and doctors for dropdowns
  const { data: patients } = api.patient.getAll.useQuery();
  const { data: doctors } = api.user.getDoctors.useQuery();

  // Update mutation
  const updateTreatment = api.treatment.update.useMutation({
    onSuccess: () => {
      router.push("/admin/dashboard");
    },
    onError: (error) => {
      setError(error.message);
      setLoading(false);
    },
  });

  // Populate form when treatment data is loaded
  useEffect(() => {
    if (treatment) {
      setFormData({
        name: treatment.name,
        hospital: treatment.hospital,
        date: new Date(treatment.date).toISOString().split('T')[0],
        patientId: treatment.patientId,
        doctorId: treatment.doctorId,
        status: treatment.status,
      });
    }
  }, [treatment]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      await updateTreatment.mutateAsync({
        id: treatmentId,
        ...formData,
      });
    } catch (err) {
      console.error("Failed to update treatment:", err);
    }
  };

  if (treatmentLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-xl">Loading treatment data...</div>
      </div>
    );
  }

  if (treatmentError || !treatment) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="text-xl text-red-600 mb-4">
            {treatmentError?.message || "Treatment not found"}
          </div>
          <button
            onClick={() => router.push("/admin/dashboard")}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900">Edit Treatment</h1>
            <button
              onClick={() => router.push("/admin/dashboard")}
              className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 transition-colors"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-6 py-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          {/* Treatment Info */}
          <div className="mb-6 p-4 bg-blue-50 rounded-lg">
            <h3 className="text-lg font-semibold text-blue-800 mb-2">Current Treatment Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium text-gray-600">Patient:</span>{" "}
                {treatment.patient ? `${treatment.patient.firstName} ${treatment.patient.lastName}` : "N/A"}
              </div>
              <div>
                <span className="font-medium text-gray-600">Medical ID:</span>{" "}
                {treatment.patient?.medicalId || "N/A"}
              </div>
              <div>
                <span className="font-medium text-gray-600">Doctor:</span>{" "}
                {treatment.doctor?.name || "N/A"}
              </div>
              <div>
                <span className="font-medium text-gray-600">Current Status:</span>{" "}
                <span className={`px-2 py-1 rounded text-xs font-medium ${
                  treatment.status === "ONGOING" ? "bg-blue-100 text-blue-800" :
                  treatment.status === "COMPLETED" ? "bg-green-100 text-green-800" :
                  treatment.status === "SCHEDULED" ? "bg-yellow-100 text-yellow-800" :
                  treatment.status === "CANCELLED" ? "bg-red-100 text-red-800" :
                  "bg-gray-100 text-gray-800"
                }`}>
                  {treatment.status}
                </span>
              </div>
            </div>
          </div>

          {/* Edit Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                {error}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Treatment Name */}
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                  Treatment Name *
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter treatment name"
                />
              </div>

              {/* Hospital */}
              <div>
                <label htmlFor="hospital" className="block text-sm font-medium text-gray-700 mb-1">
                  Hospital *
                </label>
                <input
                  type="text"
                  id="hospital"
                  name="hospital"
                  value={formData.hospital}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter hospital name"
                />
              </div>

              {/* Date */}
              <div>
                <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-1">
                  Treatment Date *
                </label>
                <input
                  type="date"
                  id="date"
                  name="date"
                  value={formData.date}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              {/* Status */}
              <div>
                <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
                  Status *
                </label>
                <select
                  id="status"
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="ONGOING">Ongoing</option>
                  <option value="COMPLETED">Completed</option>
                  <option value="SCHEDULED">Scheduled</option>
                  <option value="CANCELLED">Cancelled</option>
                  <option value="CRITICAL">Critical</option>
                  <option value="STABLE">Stable</option>
                </select>
              </div>

              {/* Patient */}
              <div>
                <label htmlFor="patientId" className="block text-sm font-medium text-gray-700 mb-1">
                  Patient *
                </label>
                <select
                  id="patientId"
                  name="patientId"
                  value={formData.patientId}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Select a patient</option>
                  {patients?.map((patient) => (
                    <option key={patient.id} value={patient.id}>
                      {patient.firstName} {patient.lastName} (ID: {patient.medicalId})
                    </option>
                  ))}
                </select>
              </div>

              {/* Doctor */}
              <div>
                <label htmlFor="doctorId" className="block text-sm font-medium text-gray-700 mb-1">
                  Doctor *
                </label>
                <select
                  id="doctorId"
                  name="doctorId"
                  value={formData.doctorId}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Select a doctor</option>
                  {doctors?.map((doctor) => (
                    <option key={doctor.id} value={doctor.id}>
                      {doctor.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Submit Buttons */}
            <div className="flex justify-end space-x-4 pt-6 border-t">
              <button
                type="button"
                onClick={() => router.push("/admin/dashboard")}
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading || updateTreatment.isLoading}
                className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading || updateTreatment.isLoading ? "Updating..." : "Update Treatment"}
              </button>
            </div>
          </form>
        </div>

        {/* Additional Actions */}
        <div className="mt-6 bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Additional Actions</h3>
          <div className="flex flex-wrap gap-4">
            <button
              onClick={() => router.push(`/admin/dashboard/patients/${treatment.patientId}`)}
              className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition-colors"
            >
              View Patient Details
            </button>
            <button
              onClick={() => router.push(`/admin/treatments/${treatmentId}/history`)}
              className="bg-purple-500 text-white px-4 py-2 rounded hover:bg-purple-600 transition-colors"
            >
              View Treatment History
            </button>
            <button
              onClick={() => window.print()}
              className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 transition-colors"
            >
              Print Treatment Details
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditTreatmentPage;
