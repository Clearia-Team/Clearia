"use client";

import { useState } from "react";
import { api } from "~/trpc/react";

export function IcuAdmissionForm() {
  const utils = api.useUtils();

  // State for form inputs
  const [patientId, setPatientId] = useState("");
  const [bedNumber, setBedNumber] = useState("");
  const [error, setError] = useState("");

  // Create ICU Admission Mutation
  const createIcuAdmission = api.icu.createAdmission.useMutation({
    onSuccess: async () => {
      await utils.icu.getActiveAdmissions.invalidate();
      setPatientId("");
      setBedNumber("");
      setError(""); // Clear errors on success
    },
    onError: (error) => {
      console.error("ICU Admission Error:", error);
      setError(error.message || "Failed to create ICU admission.");
    },
  });

  // Form submission handler
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Validate input fields
    if (!patientId.match(/^[0-9a-fA-F-]{36}$/)) {
      setError("Invalid Patient ID (must be a UUID).");
      return;
    }
    if (!bedNumber || isNaN(Number(bedNumber)) || Number(bedNumber) <= 0) {
      setError("Bed Number must be a positive integer.");
      return;
    }

    // Send request
    createIcuAdmission.mutate({
      patientId,
      bedNumber: Number(bedNumber),
    });
  };

  return (
    <div className="w-full max-w-md p-4 border rounded-lg bg-gray-800 text-white">
      <h2 className="text-lg font-bold mb-2">Get recent updates</h2>

      {/* Display Errors */}
      {error && <p className="text-red-500 text-sm mb-2">{error}</p>}

      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        {/* Patient ID Input */}
        <input
          type="text"
          placeholder="Patient ID (UUID)"
          value={patientId}
          onChange={(e) => setPatientId(e.target.value)}
          className="w-full rounded-lg px-4 py-2 text-black"
        />

        {/* Bed Number Input */}
        <input
          type="number"
          placeholder="Bed Number"
          value={bedNumber}
          onChange={(e) => setBedNumber(e.target.value)}
          className="w-full rounded-lg px-4 py-2 text-black"
          min="1"
        />

        {/* Submit Button */}
        <button
          type="submit"
          className="rounded-lg bg-blue-600 px-6 py-2 font-semibold transition hover:bg-blue-700 disabled:bg-gray-600"
          disabled={createIcuAdmission.isPending}
        >
          {createIcuAdmission.isPending ? "Submitting..." : "Check"}
        </button>
      </form>
    </div>
  );
}

