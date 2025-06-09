"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { PlusCircle, ShieldCheck, User, Hospital, Calendar, ChevronLeft } from "lucide-react";
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
  
  const [otp, setOtp] = useState("");
  const [generatedOtp, setGeneratedOtp] = useState<string | null>(null);
  const [isOtpVerified, setIsOtpVerified] = useState(false);
  const router = useRouter();

  // tRPC hooks
  const { data: doctors, isLoading: loadingDoctors } = api.user.getDoctors.useQuery();
  const { data: patients, isLoading: loadingPatients } = api.patient.getAll.useQuery();
  const createTreatment = api.treatment.create.useMutation({
    onSuccess: () => {
      toast.success("Treatment added successfully!");
      router.push("/admin/dashboard?treatmentAdded=true");
    },
    onError: (error) => {
      toast.error(`Error: ${error.message}`);
    },
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleGenerateOtp = () => {
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedOtp(otpCode);
    toast.success(`OTP Generated: ${otpCode}\n\nFor demo purposes, use this code to verify.`);
  };

  const handleOtpChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setOtp(e.target.value);
  };

  const handleVerifyOtp = () => {
    if (otp === generatedOtp) {
      setIsOtpVerified(true);
      toast.success("OTP Verified Successfully!");
    } else {
      toast.error("Invalid OTP. Please try again.");
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!isOtpVerified) {
      toast.error("Please verify OTP before submitting");
      return;
    }

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
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Back Button */}
        <button 
          onClick={() => router.back()}
          className="flex items-center text-blue-600 hover:text-blue-800 mb-4 transition-colors"
        >
          <ChevronLeft className="mr-1" size={18} />
          Back to Dashboard
        </button>
        
        {/* Form Card */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-6 text-white text-center">
            <PlusCircle className="mx-auto mb-3" size={40} />
            <h2 className="text-2xl font-bold">Add New Treatment</h2>
            <p className="text-blue-100">Fill in the treatment details</p>
          </div>

          {/* Form Content */}
          <form onSubmit={handleSubmit} className="p-6 space-y-5">
            <div className="grid grid-cols-1 gap-5">
              {/* Treatment Name */}
              <div className="space-y-2">
                <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                  Treatment Name
                </label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="e.g., Chemotherapy Session"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                  required
                />
              </div>

              {/* Patient Selection */}
              <div className="space-y-2">
                <label htmlFor="patientId" className="block text-sm font-medium text-gray-700">
                  Patient
                </label>
                <select
                  id="patientId"
                  name="patientId"
                  value={formData.patientId}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                  required
                  disabled={loadingPatients}
                >
                  <option value="">Select Patient</option>
                  {patients?.map(patient => (
                    <option key={patient.id} value={patient.id}>
                      {patient.firstName} {patient.lastName} ({patient.medicalId})
                    </option>
                  ))}
                </select>
                {loadingPatients && (
                  <p className="text-sm text-gray-500">Loading patients...</p>
                )}
              </div>

              {/* Doctor Selection */}
              <div className="space-y-2">
                <label htmlFor="doctorId" className="block text-sm font-medium text-gray-700">
                  Doctor
                </label>
                <select
                  id="doctorId"
                  name="doctorId"
                  value={formData.doctorId}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                  required
                  disabled={loadingDoctors}
                >
                  <option value="">Select Doctor</option>
                  {doctors?.map(doctor => (
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
                <label htmlFor="hospital" className="block text-sm font-medium text-gray-700">
                  Hospital/Clinic
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Hospital className="text-gray-400" size={18} />
                  </div>
                  <input
                    id="hospital"
                    name="hospital"
                    type="text"
                    value={formData.hospital}
                    onChange={handleInputChange}
                    placeholder="City Medical Center"
                    className="w-full pl-10 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                    required
                  />
                </div>
              </div>

              {/* Date */}
              <div className="space-y-2">
                <label htmlFor="date" className="block text-sm font-medium text-gray-700">
                  Treatment Date
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Calendar className="text-gray-400" size={18} />
                  </div>
                  <input
                    id="date"
                    name="date"
                    type="date"
                    value={formData.date}
                    onChange={handleInputChange}
                    className="w-full pl-10 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                    required
                  />
                </div>
              </div>
            </div>

            {/* OTP Verification */}
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
              <div className="flex items-center mb-3">
                <ShieldCheck className="text-blue-600 mr-2" size={20} />
                <h3 className="font-medium text-gray-800">Secure Verification</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <button
                  type="button"
                  onClick={handleGenerateOtp}
                  className="bg-white border border-blue-200 text-blue-600 hover:bg-blue-50 py-2 px-4 rounded-lg transition-colors"
                >
                  Generate OTP
                </button>
                <input
                  type="text"
                  value={otp}
                  onChange={handleOtpChange}
                  placeholder="Enter OTP"
                  className="border border-gray-300 px-4 py-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <button
                  type="button"
                  onClick={handleVerifyOtp}
                  className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg transition-colors"
                >
                  Verify OTP
                </button>
              </div>
              
              {generatedOtp && (
                <p className="mt-2 text-xs text-gray-500">
                  Demo OTP: <span className="font-mono bg-white px-2 py-1 rounded border">{generatedOtp}</span>
                </p>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className={`w-full py-3 rounded-lg font-medium transition-colors shadow-md ${
                isOtpVerified 
                  ? "bg-blue-600 hover:bg-blue-700 text-white"
                  : "bg-gray-300 text-gray-500 cursor-not-allowed"
              }`}
              disabled={!isOtpVerified || createTreatment.isLoading}
            >
              {createTreatment.isLoading 
                ? "Processing..." 
                : (isOtpVerified ? "Submit Treatment" : "Verify OTP to Submit")}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default NewTreatment;
