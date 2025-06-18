"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { PlusCircle, Hospital, Calendar, ChevronLeft } from "lucide-react";
import type { TreatmentStatus } from "@prisma/client";
import { toast } from "react-hot-toast";
import { api } from "~/trpc/react";

const NewTreatment = () => {
  const [formData, setFormData] = useState({
    name: "",
    hospital: "",
    date: "",
    patientId: "",
    doctorId: "",
    status: "ONGOING" as TreatmentStatus,
  });

  const router = useRouter();

  // tRPC hooks
  const { data: doctors, isLoading: loadingDoctors } =
    api.user.getDoctors.useQuery();
  const { data: patients, isLoading: loadingPatients } =
    api.patient.getAll.useQuery();
  const createTreatment = api.treatment.create.useMutation({
    onSuccess: () => {
      toast.success("Treatment added successfully!");
      router.push("/admin/dashboard?treatmentAdded=true");
    },
    onError: (error) => {
      toast.error(`Error: ${error.message}`);
    },
  });

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.patientId) {
      toast.error("Please select a patient");
      return;
    }

    if (!formData.doctorId) {
      toast.error("Please select a doctor");
      return;
    }

    // Submit using tRPC mutation
    createTreatment.mutate({
      name: formData.name,
      hospital: formData.hospital,
      date: formData.date,
      patientId: formData.patientId,
      doctorId: formData.doctorId,
      status: formData.status,
    });
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md">
        {/* Back Button */}
        <button
          onClick={() => router.back()}
          className="mb-4 flex items-center text-blue-600 transition-colors hover:text-blue-800"
        >
          <ChevronLeft className="mr-1" size={18} />
          Back to Dashboard
        </button>

        {/* Form Card */}
        <div className="overflow-hidden rounded-xl bg-white shadow-md">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-6 text-center text-white">
            <PlusCircle className="mx-auto mb-3" size={40} />
            <h2 className="text-2xl font-bold">Add New Treatment</h2>
            <p className="text-blue-100">Fill in the treatment details</p>
          </div>

          {/* Form Content */}
          <form onSubmit={handleSubmit} className="space-y-5 p-6">
            <div className="grid grid-cols-1 gap-5">
              {/* Treatment Name */}
              <div className="space-y-2">
                <label
                  htmlFor="name"
                  className="block text-sm font-medium text-gray-700"
                >
                  Treatment Name
                </label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="e.g., Chemotherapy Session"
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              {/* Patient Selection */}
              <div className="space-y-2">
                <label
                  htmlFor="patientId"
                  className="block text-sm font-medium text-gray-700"
                >
                  Patient
                </label>
                <select
                  id="patientId"
                  name="patientId"
                  value={formData.patientId}
                  onChange={handleInputChange}
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                  required
                  disabled={loadingPatients}
                >
                  <option value="">Select Patient</option>
                  {patients?.map((patient) => (
                    <option key={patient.id} value={patient.id}>
                      {patient.firstName} {patient.lastName} (
                      {patient.medicalId})
                    </option>
                  ))}
                </select>
                {loadingPatients && (
                  <p className="text-sm text-gray-500">Loading patients...</p>
                )}
              </div>

              {/* Doctor Selection */}
              <div className="space-y-2">
                <label
                  htmlFor="doctorId"
                  className="block text-sm font-medium text-gray-700"
                >
                  Doctor
                </label>
                <select
                  id="doctorId"
                  name="doctorId"
                  value={formData.doctorId}
                  onChange={handleInputChange}
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                  required
                  disabled={loadingDoctors}
                >
                  <option value="">Select Doctor</option>
                  {doctors?.map((doctor) => (
                    <option key={doctor.id} value={doctor.id}>
                      {doctor.name}
                    </option>
                  ))}
                </select>
                {loadingDoctors && (
                  <p className="text-sm text-gray-500">Loading doctors...</p>
                )}
              </div>

              {/* Hospital */}
              <div className="space-y-2">
                <label
                  htmlFor="hospital"
                  className="block text-sm font-medium text-gray-700"
                >
                  Hospital/Clinic
                </label>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                    <Hospital className="text-gray-400" size={18} />
                  </div>
                  <input
                    id="hospital"
                    name="hospital"
                    type="text"
                    value={formData.hospital}
                    onChange={handleInputChange}
                    placeholder="City Medical Center"
                    className="w-full rounded-lg border border-gray-300 px-4 py-2 pl-10 transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
              </div>

              {/* Date */}
              <div className="space-y-2">
                <label
                  htmlFor="date"
                  className="block text-sm font-medium text-gray-700"
                >
                  Treatment Date
                </label>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                    <Calendar className="text-gray-400" size={18} />
                  </div>
                  <input
                    id="date"
                    name="date"
                    type="date"
                    value={formData.date}
                    onChange={handleInputChange}
                    className="w-full rounded-lg border border-gray-300 px-4 py-2 pl-10 transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full rounded-lg bg-blue-600 py-3 font-medium text-white shadow-md transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-gray-400"
              disabled={createTreatment.isLoading}
            >
              {createTreatment.isLoading ? "Processing..." : "Submit Treatment"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default NewTreatment;
