"use client";
import { useState } from "react";
import { api } from "~/trpc/react";
import type { inferRouterOutputs } from "@trpc/server";
import type { AppRouter } from "~/server/api/root";

// Types based on your Zod schema
type RouterOutputs = inferRouterOutputs<AppRouter>;

type Patient = RouterOutputs["patient"]["getById"];
type BloodType = "A+" | "A-" | "B+" | "B-" | "AB+" | "AB-" | "O+" | "O-" | "Unknown";

type PatientFormData = {
  firstName: string;
  lastName: string;
  dateOfBirth: Date;
  medicalId: string;
  allergies?: string;
  bloodType?: string;
};

type PatientUpdateData = {
  id?: string;
  firstName?: string;
  lastName?: string;
  dateOfBirth?: Date;
  medicalId?: string;
  allergies?: string;
  bloodType?: string;
};

export function LatestPatient() {
  const [latestPatient] = api.patient.getAll.useSuspenseQuery();
  const mostRecentPatient = latestPatient && latestPatient.length > 0 ? latestPatient[0] : null;

  return (
    <div className="w-full max-w-xs">
      {mostRecentPatient ? (
        <p className="truncate">Your most recent patient: {mostRecentPatient.firstName} {mostRecentPatient.lastName}</p>
      ) : (
        <p>You have no patients yet.</p>
      )}
    </div>
  );
}

export function AllPatients() {
  const [patients] = api.patient.getAll.useSuspenseQuery();
  if (!patients || patients.length === 0) {
    return <p>No patients found.</p>;
  }
  return (
    <div className="w-full max-w-lg">
      <h2 className="mb-4 text-xl font-bold">All Patients</h2>
      <div className="space-y-4">
        {patients.map((patient) => (
          <div key={patient.id} className="max-w-md rounded-lg border p-4">
            <h3 className="mb-2 text-lg font-semibold">{patient.firstName} {patient.lastName}</h3>
            <p>
              <strong>Medical ID:</strong> {patient.medicalId}
            </p>
            <p>
              <strong>Date of Birth:</strong> {patient.dateOfBirth.toLocaleDateString()}
            </p>
            {patient.bloodType && (
              <p>
                <strong>Blood Type:</strong> {patient.bloodType}
              </p>
            )}
            {patient.allergies && (
              <p>
                <strong>Allergies:</strong> {patient.allergies}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export function CreatePatientForm() {
  const [formData, setFormData] = useState<PatientFormData>({
    firstName: "",
    lastName: "",
    dateOfBirth: new Date(),
    medicalId: "",
    allergies: "",
    bloodType: "Unknown",
  });
  const [error, setError] = useState<string | null>(null);

  const createPatient = api.patient.createPatient.useMutation({
    onSuccess: () => {
      // Reset form
      setFormData({
        firstName: "",
        lastName: "",
        dateOfBirth: new Date(),
        medicalId: "",
        allergies: "",
        bloodType: "Unknown",
      });
      setError(null);
    },
    onError: (e) => {
      setError(e.message);
    },
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    if (name === "dateOfBirth") {
      setFormData((prev) => ({
        ...prev,
        [name]: new Date(value),
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createPatient.mutate(formData);
  };

  return (
    <div className="w-full max-w-md">
      <h2 className="mb-4 text-xl font-bold">Create New Patient</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="firstName" className="block text-sm font-medium">
            First Name
          </label>
          <input
            type="text"
            id="firstName"
            name="firstName"
            value={formData.firstName}
            onChange={handleChange}
            required
            minLength={2}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 text-black text-base"
          />
        </div>

        <div>
          <label htmlFor="lastName" className="block text-sm font-medium">
            Last Name
          </label>
          <input
            type="text"
            id="lastName"
            name="lastName"
            value={formData.lastName}
            onChange={handleChange}
            required
            minLength={2}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 text-black text-base"
          />
        </div>

        <div>
          <label htmlFor="dateOfBirth" className="block text-sm font-medium">
            Date of Birth
          </label>
          <input
            type="date"
            id="dateOfBirth"
            name="dateOfBirth"
            value={formData.dateOfBirth.toISOString().split('T')[0]}
            onChange={handleChange}
            required
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 text-black text-base"
          />
        </div>

        <div>
          <label htmlFor="medicalId" className="block text-sm font-medium">
            Medical ID
          </label>
          <input
            type="text"
            id="medicalId"
            name="medicalId"
            value={formData.medicalId}
            onChange={handleChange}
            required
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 text-black text-base"
          />
        </div>

        <div>
          <label htmlFor="bloodType" className="block text-sm font-medium">
            Blood Type
          </label>
          <select
            id="bloodType"
            name="bloodType"
            value={formData.bloodType}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 text-black text-base bg-white dark:bg-gray-800 dark:text-white"
          >
            <option value="Unknown">Unknown</option>
            <option value="A+">A+</option>
            <option value="A-">A-</option>
            <option value="B+">B+</option>
            <option value="B-">B-</option>
            <option value="AB+">AB+</option>
            <option value="AB-">AB-</option>
            <option value="O+">O+</option>
            <option value="O-">O-</option>
          </select>
        </div>

        <div>
          <label htmlFor="allergies" className="block text-sm font-medium">
            Allergies
          </label>
          <textarea
            id="allergies"
            name="allergies"
            value={formData.allergies}
            onChange={handleChange}
            rows={3}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 text-black text-base"
            placeholder="List allergies, if any"
          />
        </div>

        {error && (
          <div className="rounded-md bg-red-50 p-4">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        <button
          disabled={createPatient.isPending}
          className="inline-flex justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none"
        >
          {createPatient.isPending ? "Creating..." : "Create Patient"}
        </button>
      </form>
    </div>
  );
}

export function UpdatePatientForm({ patient }: { patient?: Patient }) {
  const [formData, setFormData] = useState<PatientUpdateData>({
    id: patient?.id,
    firstName: patient?.firstName,
    lastName: patient?.lastName,
    dateOfBirth: patient?.dateOfBirth,
    medicalId: patient?.medicalId,
    allergies: patient?.allergies ?? undefined,
    bloodType: patient?.bloodType ?? undefined,

  });
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  const updatePatient = api.patient.updatePatient.useMutation({
    onSuccess: () => {
      setIsEditing(false);
      setError(null);
    },
    onError: (e) => {
      setError(e.message);
    },
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    if (name === "dateOfBirth") {
      setFormData((prev) => ({
        ...prev,
        [name]: new Date(value),
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData?.id) {
      console.error("Form data is null or missing ID.");
      return;
    }

    // Make sure the id is included
    const updateData: PatientUpdateData = {
      ...formData,
      id: formData.id
    };

    updatePatient.mutate(updateData);
  };

  if (!isEditing) {
    return (
      <div className="w-full max-w-md rounded-lg border p-4">
        <h3 className="mb-2 text-lg font-semibold">{patient?.firstName} {patient?.lastName}</h3>
        <p>
          <strong>Medical ID:</strong> {patient?.medicalId}
        </p>
        <p>
          <strong>Date of Birth:</strong> {patient?.dateOfBirth?.toLocaleDateString()}
        </p>
        {patient?.bloodType && (
          <p>
            <strong>Blood Type:</strong> {patient.bloodType}
          </p>
        )}
        {patient?.allergies && (
          <p>
            <strong>Allergies:</strong> {patient.allergies}
          </p>
        )}
        <button
          onClick={() => setIsEditing(true)}
          className="mt-4 inline-flex justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          Edit Patient
        </button>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md rounded-lg border p-4">
      <h3 className="mb-4 text-lg font-semibold">Update Patient</h3>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="update-firstName" className="block text-sm font-medium">
            First Name
          </label>
          <input
            type="text"
            id="update-firstName"
            name="firstName"
            value={formData?.firstName ?? ""}
            onChange={handleChange}
            required
            minLength={2}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
          />
        </div>

        <div>
          <label htmlFor="update-lastName" className="block text-sm font-medium">
            Last Name
          </label>
          <input
            type="text"
            id="update-lastName"
            name="lastName"
            value={formData?.lastName ?? ""}
            onChange={handleChange}
            required
            minLength={2}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
          />
        </div>

        <div>
          <label htmlFor="update-dateOfBirth" className="block text-sm font-medium">
            Date of Birth
          </label>
          <input
            type="date"
            id="update-dateOfBirth"
            name="dateOfBirth"
            value={formData?.dateOfBirth ? new Date(formData.dateOfBirth).toISOString().split('T')[0] : ''}
            onChange={handleChange}
            required
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
          />
        </div>

        <div>
          <label htmlFor="update-medicalId" className="block text-sm font-medium">
            Medical ID
          </label>
          <input
            type="text"
            id="update-medicalId"
            name="medicalId"
            value={formData?.medicalId ?? ""}
            onChange={handleChange}
            required
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
          />
        </div>

        <div>
          <label htmlFor="update-bloodType" className="block text-sm font-medium">
            Blood Type
          </label>
          <select
            id="update-bloodType"
            name="bloodType"
            value={formData?.bloodType ?? "Unknown"}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
          >
            <option value="Unknown">Unknown</option>
            <option value="A+">A+</option>
            <option value="A-">A-</option>
            <option value="B+">B+</option>
            <option value="B-">B-</option>
            <option value="AB+">AB+</option>
            <option value="AB-">AB-</option>
            <option value="O+">O+</option>
            <option value="O-">O-</option>
          </select>
        </div>

        <div>
          <label htmlFor="update-allergies" className="block text-sm font-medium">
            Allergies
          </label>
          <textarea
            id="update-allergies"
            name="allergies"
            value={formData?.allergies ?? ""}
            onChange={handleChange}
            rows={3}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
            placeholder="List allergies, if any"
          />
        </div>

        {error && (
          <div className="rounded-md bg-red-50 p-4">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        <div className="flex space-x-2">
          <button
            type="submit"
            disabled={updatePatient.isPending}
            className="inline-flex justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none"
          >
            {updatePatient.isPending ? "Updating..." : "Update Patient"}
          </button>
          <button
            type="button"
            onClick={() => setIsEditing(false)}
            className="inline-flex justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}

export function DeletePatientButton({ patientId }: { patientId?: string }) {
  const [isConfirming, setIsConfirming] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const deletePatient = api.patient.deletePatient.useMutation({
    onSuccess: () => {
      setIsConfirming(false);
      setError(null);
    },
    onError: (e) => {
      setError(e.message);
    },
  });

  const handleDelete = () => {
    if (!patientId) {
      setError("Patient ID is missing.");
      return;
    }
    deletePatient.mutate({ id: patientId });
  };

  if (isConfirming) {
    return (
      <div className="mt-4 space-y-2">
        <p className="text-sm text-red-600">
          Are you sure you want to delete this patient? This action cannot be undone.
        </p>
        <div className="flex space-x-2">
          <button
            onClick={handleDelete}
            disabled={deletePatient.isPending}
            className="inline-flex justify-center rounded-md border border-transparent bg-red-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-red-700 focus:outline-none"
          >
            {deletePatient.isPending ? "Deleting..." : "Yes, Delete"}
          </button>
          <button
            onClick={() => setIsConfirming(false)}
            className="inline-flex justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none"
          >
            Cancel
          </button>
        </div>
        {error && (
          <div className="rounded-md bg-red-50 p-4">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}
      </div>
    );
  }

  return (
    <button
      onClick={() => setIsConfirming(true)}
      className="inline-flex justify-center rounded-md border border-transparent bg-red-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
    >
      Delete Patient
    </button>
  );
}

export function PatientsManager() {
  const [patients] = api.patient.getAll.useSuspenseQuery();
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);

  return (
    <div className="w-full">
      <div className="mb-8">
        <CreatePatientForm />
      </div>

      <div className="mb-8">
        <h2 className="mb-4 text-xl font-bold">Manage Patients</h2>
        {patients && patients.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2">
            {patients.map((patient) => (
              <div key={patient.id} className="rounded-lg border p-4">
                <h3 className="mb-2 text-lg font-semibold">{patient.firstName} {patient.lastName}</h3>
                <p>
                  <strong>Medical ID:</strong> {patient.medicalId}
                </p>
                <p>
                  <strong>Date of Birth:</strong> {patient.dateOfBirth.toLocaleDateString()}
                </p>
                {patient.bloodType && (
                  <p>
                    <strong>Blood Type:</strong> {patient.bloodType}
                  </p>
                )}
                {patient.allergies && (
                  <p>
                    <strong>Allergies:</strong> {patient.allergies}
                  </p>
                )}
                <div className="mt-4 flex space-x-2">
                  <button
                    onClick={() => setSelectedPatient(patient)}
                    className="inline-flex justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                  >
                    Edit
                  </button>
                  <DeletePatientButton patientId={patient.id} />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p>No patients found.</p>
        )}
      </div>

      {selectedPatient && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 p-4">
          <div className="w-full max-w-md rounded-lg bg-white p-6">
            <h2 className="mb-4 text-xl font-bold">Edit Patient</h2>
            <UpdatePatientForm patient={selectedPatient} />
            <button
              onClick={() => setSelectedPatient(null)}
              className="mt-4 inline-flex justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
