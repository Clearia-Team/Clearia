"use client";
import { useState } from "react";
import { api } from "~/trpc/react";
import type { inferRouterOutputs } from "@trpc/server";
import type { AppRouter } from "~/server/api/root";
import type { PatientStatus } from "@prisma/client";

// Types based on your Zod schema
type RouterOutputs = inferRouterOutputs<AppRouter>;

type IcuAdmission = RouterOutputs["icuAdmission"]["getById"];
type Patient = RouterOutputs["patient"]["getById"];
type User = RouterOutputs["user"]["getLatest"];

type IcuAdmissionFormData = {
  patientId: string;
  bedNumber: number;
  admissionDate: Date;
  dischargeDate?: Date | null;
  staffId: string;
};

type IcuAdmissionUpdateData = {
  id: string;
  patientId?: string;
  bedNumber?: number;
  admissionDate?: Date;
  dischargeDate?: Date | null;
  staffId?: string;
};

export function LatestAdmissions() {
  const [latestAdmissions] = api.icuAdmission.getAll.useSuspenseQuery();
  const recentAdmissions = latestAdmissions && latestAdmissions.length > 0
    ? latestAdmissions.slice(0, 3)
    : [];

  return (
    <div className="w-full max-w-md">
      <h2 className="mb-4 text-xl font-bold">Recent Admissions</h2>
      {recentAdmissions.length > 0 ? (
        <div className="space-y-4">
          {recentAdmissions.map((admission) => (
            <div key={admission.id} className="rounded-lg border p-4">
              <h3 className="mb-2 text-lg font-semibold">
                {admission.patient.firstName} {admission.patient.lastName}
              </h3>
              <p>
                <strong>Bed Number:</strong> {admission.bedNumber}
              </p>
              <p>
                <strong>Admitted:</strong> {new Date(admission.admissionDate).toLocaleDateString()}
              </p>
              <p>
                <strong>Admitting Staff:</strong> {admission.staff.name}
              </p>
              {admission.dischargeDate && (
                <p>
                  <strong>Discharged:</strong> {new Date(admission.dischargeDate).toLocaleDateString()}
                </p>
              )}
            </div>
          ))}
        </div>
      ) : (
        <p>No recent admissions found.</p>
      )}
    </div>
  );
}

export function CurrentAdmissions() {
  const [currentAdmissions] = api.icuAdmission.getCurrentAdmissions.useSuspenseQuery();

  return (
    <div className="w-full max-w-lg">
      <h2 className="mb-4 text-xl font-bold">Current ICU Patients</h2>
      {currentAdmissions && currentAdmissions.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2">
          {currentAdmissions.map((admission) => (
            <div key={admission.id} className="rounded-lg border p-4">
              <h3 className="mb-2 text-lg font-semibold">
                {admission.patient.firstName} {admission.patient.lastName}
              </h3>
              <p>
                <strong>Bed Number:</strong> {admission.bedNumber}
              </p>
              <p>
                <strong>Admitted:</strong> {new Date(admission.admissionDate).toLocaleDateString()}
              </p>
              <p>
                <strong>Medical ID:</strong> {admission.patient.medicalId}
              </p>
              {admission.statusUpdates && admission.statusUpdates.length > 0 && (
                <p>
                  <strong>Current Status:</strong>{" "}
                  <span className={getStatusColor(admission.statusUpdates?.[0]?.status ?? "STABLE")}>
                    {admission.statusUpdates?.[0]?.status ?? "Unknown"}
                  </span>

                </p>
              )}
            </div>
          ))}
        </div>
      ) : (
        <p>No current admissions found.</p>
      )}
    </div>
  );
}

function getStatusColor(status: PatientStatus) {
  switch (status) {
    case "CRITICAL":
      return "text-red-600 font-bold";
    case "STABLE":
      return "text-blue-600";
    case "IMPROVING":
      return "text-green-600";
    case "RECOVERED":
      return "text-green-800 font-bold";
    case "DECEASED":
      return "text-gray-600 font-bold";
    default:
      return "";
  }
}

export function CreateIcuAdmissionForm() {
  const [formData, setFormData] = useState<IcuAdmissionFormData>({
    patientId: "",
    bedNumber: 1,
    admissionDate: new Date(),
    staffId: "",
  });
  const [error, setError] = useState<string | null>(null);

  // Fetch patients to populate the dropdown
  const [patients] = api.patient.getAll.useSuspenseQuery();

  // Fetch staff members to populate the dropdown
  // Note: You'll need to create a user router if you don't already have one
  const [staff] = api.user ? api.user.getAll.useSuspenseQuery() : [[]];

  const createAdmission = api.icuAdmission.createAdmission.useMutation({
    onSuccess: () => {
      // Reset form
      setFormData({
        patientId: "",
        bedNumber: 1,
        admissionDate: new Date(),
        staffId: "",
      });
      setError(null);
    },
    onError: (e) => {
      setError(e.message);
    },
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    if (name === "admissionDate") {
      setFormData((prev) => ({
        ...prev,
        [name]: new Date(value),
      }));
    } else if (name === "bedNumber") {
      setFormData((prev) => ({
        ...prev,
        [name]: parseInt(value, 10),
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
    createAdmission.mutate(formData);
  };

  return (
    <div className="w-full max-w-md">
      <h2 className="mb-4 text-xl font-bold">Admit Patient to ICU</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="patientId" className="block text-sm font-medium">
            Patient
          </label>
          <select
            id="patientId"
            name="patientId"
            value={formData.patientId}
            onChange={handleChange}
            required
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 text-black text-base bg-white dark:bg-gray-800 dark:text-white"
          >
            <option value="">Select a patient</option>
            {patients?.map((patient) => (
              <option key={patient.id} value={patient.id}>
                {patient.firstName} {patient.lastName} ({patient.medicalId})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="bedNumber" className="block text-sm font-medium">
            Bed Number
          </label>
          <input
            type="number"
            id="bedNumber"
            name="bedNumber"
            value={formData.bedNumber}
            onChange={handleChange}
            required
            min={1}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 text-black text-base"
          />
        </div>

        <div>
          <label htmlFor="admissionDate" className="block text-sm font-medium">
            Admission Date
          </label>
          <input
            type="date"
            id="admissionDate"
            name="admissionDate"
            value={formData.admissionDate.toISOString().split('T')[0]}
            onChange={handleChange}
            required
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 text-black text-base"
          />
        </div>

        <div>
          <label htmlFor="staffId" className="block text-sm font-medium">
            Admitting Staff
          </label>
          <select
            id="staffId"
            name="staffId"
            value={formData.staffId}
            onChange={handleChange}
            required
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 text-black text-base bg-white dark:bg-gray-800 dark:text-white"
          >
            <option value="">Select staff member</option>
            {staff?.map((user) => (
              <option key={user.id} value={user.id}>
                {user.name} ({user.role})
              </option>
            ))}
          </select>
        </div>

        {error && (
          <div className="rounded-md bg-red-50 p-4">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        <button
          disabled={createAdmission.isPending}
          className="inline-flex justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none"
        >
          {createAdmission.isPending ? "Admitting..." : "Admit Patient"}
        </button>
      </form>
    </div>
  );
}

export function UpdateIcuAdmissionForm({ admission }: { admission?: IcuAdmission }) {
  const [formData, setFormData] = useState<IcuAdmissionUpdateData>({
    id: admission?.id ?? "",
    patientId: admission?.patientId,
    bedNumber: admission?.bedNumber,
    admissionDate: admission?.admissionDate,
    dischargeDate: admission?.dischargeDate,
    staffId: admission?.staffId,
  });
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  // Fetch patients and staff for dropdowns
  const [patients] = api.patient.getAll.useSuspenseQuery();
  const [staff] = api.user ? api.user.getAll.useSuspenseQuery() : [[]];

  const updateAdmission = api.icuAdmission.updateAdmission.useMutation({
    onSuccess: () => {
      setIsEditing(false);
      setError(null);
    },
    onError: (e) => {
      setError(e.message);
    },
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    if (name === "admissionDate" || name === "dischargeDate") {
      setFormData((prev) => ({
        ...prev,
        [name]: value ? new Date(value) : null,
      }));
    } else if (name === "bedNumber") {
      setFormData((prev) => ({
        ...prev,
        [name]: parseInt(value, 10),
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
    if (!formData.id) {
      setError("Admission ID is missing");
      return;
    }
    updateAdmission.mutate(formData);
  };

  if (!isEditing) {
    return (
      <div className="w-full max-w-md rounded-lg border p-4">
        <h3 className="mb-2 text-lg font-semibold">
          {admission?.patient.firstName} {admission?.patient.lastName}
        </h3>
        <p>
          <strong>Bed Number:</strong> {admission?.bedNumber}
        </p>
        <p>
          <strong>Admitted:</strong> {admission?.admissionDate?.toLocaleDateString()}
        </p>
        <p>
          <strong>Admitting Staff:</strong> {admission?.staff.name}
        </p>
        {admission?.dischargeDate && (
          <p>
            <strong>Discharged:</strong> {admission.dischargeDate.toLocaleDateString()}
          </p>
        )}
        <button
          onClick={() => setIsEditing(true)}
          className="mt-4 inline-flex justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          Edit Admission
        </button>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md rounded-lg border p-4">
      <h3 className="mb-4 text-lg font-semibold">Update ICU Admission</h3>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="update-patientId" className="block text-sm font-medium">
            Patient
          </label>
          <select
            id="update-patientId"
            name="patientId"
            value={formData.patientId ?? ""}
            onChange={handleChange}
            required
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
          >
            <option value="">Select a patient</option>
            {patients?.map((patient) => (
              <option key={patient.id} value={patient.id}>
                {patient.firstName} {patient.lastName} ({patient.medicalId})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="update-bedNumber" className="block text-sm font-medium">
            Bed Number
          </label>
          <input
            type="number"
            id="update-bedNumber"
            name="bedNumber"
            value={formData.bedNumber ?? ""}
            onChange={handleChange}
            required
            min={1}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
          />
        </div>

        <div>
          <label htmlFor="update-admissionDate" className="block text-sm font-medium">
            Admission Date
          </label>
          <input
            type="date"
            id="update-admissionDate"
            name="admissionDate"
            value={formData.admissionDate ? new Date(formData.admissionDate).toISOString().split('T')[0] : ''}
            onChange={handleChange}
            required
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
          />
        </div>

        <div>
          <label htmlFor="update-dischargeDate" className="block text-sm font-medium">
            Discharge Date
          </label>
          <input
            type="date"
            id="update-dischargeDate"
            name="dischargeDate"
            value={formData.dischargeDate ? new Date(formData.dischargeDate).toISOString().split('T')[0] : ''}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
          />
        </div>

        <div>
          <label htmlFor="update-staffId" className="block text-sm font-medium">
            Admitting Staff
          </label>
          <select
            id="update-staffId"
            name="staffId"
            value={formData.staffId ?? ""}
            onChange={handleChange}
            required
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
          >
            <option value="">Select staff member</option>
            {staff?.map((user) => (
              <option key={user.id} value={user.id}>
                {user.name} ({user.role})
              </option>
            ))}
          </select>
        </div>

        {error && (
          <div className="rounded-md bg-red-50 p-4">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        <div className="flex space-x-2">
          <button
            type="submit"
            disabled={updateAdmission.isPending}
            className="inline-flex justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none"
          >
            {updateAdmission.isPending ? "Updating..." : "Update Admission"}
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

export function DischargePatientButton({ admission }: { admission?: IcuAdmission }) {
  const [isConfirming, setIsConfirming] = useState(false);
  const [dischargeDate, setDischargeDate] = useState<Date>(new Date());
  const [error, setError] = useState<string | null>(null);

  const dischargePatient = api.icuAdmission.dischargePatient.useMutation({
    onSuccess: () => {
      setIsConfirming(false);
      setError(null);
    },
    onError: (e) => {
      setError(e.message);
    },
  });

  const handleDischarge = () => {
    if (!admission?.id) {
      setError("Admission ID is missing.");
      return;
    }
    dischargePatient.mutate({
      id: admission.id,
      dischargeDate
    });
  };

  if (admission?.dischargeDate) {
    return (
      <div className="mt-4">
        <p className="text-sm text-gray-600">
          Patient was discharged on {new Date(admission.dischargeDate).toLocaleDateString()}
        </p>
      </div>
    );
  }

  if (isConfirming) {
    return (
      <div className="mt-4 space-y-2">
        <p className="text-sm text-yellow-600">
          Please confirm discharge of this patient.
        </p>
        <div>
          <label htmlFor="dischargeDate" className="block text-sm font-medium">
            Discharge Date
          </label>
          <input
            type="date"
            id="dischargeDate"
            value={dischargeDate.toISOString().split('T')[0]}
            onChange={(e) => setDischargeDate(new Date(e.target.value))}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
          />
        </div>
        <div className="flex space-x-2">
          <button
            onClick={handleDischarge}
            disabled={dischargePatient.isPending}
            className="inline-flex justify-center rounded-md border border-transparent bg-yellow-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-yellow-700 focus:outline-none"
          >
            {dischargePatient.isPending ? "Processing..." : "Confirm Discharge"}
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
      className="inline-flex justify-center rounded-md border border-transparent bg-yellow-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2"
    >
      Discharge Patient
    </button>
  );
}

export function DeleteAdmissionButton({ admissionId }: { admissionId?: string }) {
  const [isConfirming, setIsConfirming] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const deleteAdmission = api.icuAdmission.deleteAdmission.useMutation({
    onSuccess: () => {
      setIsConfirming(false);
      setError(null);
    },
    onError: (e) => {
      setError(e.message);
    },
  });

  const handleDelete = () => {
    if (!admissionId) {
      setError("Admission ID is missing.");
      return;
    }
    deleteAdmission.mutate({ id: admissionId });
  };

  if (isConfirming) {
    return (
      <div className="mt-4 space-y-2">
        <p className="text-sm text-red-600">
          Are you sure you want to delete this admission record? This action cannot be undone.
        </p>
        <div className="flex space-x-2">
          <button
            onClick={handleDelete}
            disabled={deleteAdmission.isPending}
            className="inline-flex justify-center rounded-md border border-transparent bg-red-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-red-700 focus:outline-none"
          >
            {deleteAdmission.isPending ? "Deleting..." : "Yes, Delete"}
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
      Delete Record
    </button>
  );
}

export function IcuAdmissionsManager() {
  const [admissions] = api.icuAdmission.getAll.useSuspenseQuery();
  const [selectedAdmission, setSelectedAdmission] = useState<IcuAdmission | null>(null);

  return (
    <div className="w-full">
      <div className="mb-8">
        <CreateIcuAdmissionForm />
      </div>

      <div className="mb-8">
        <h2 className="mb-4 text-xl font-bold">Manage ICU Admissions</h2>
        {admissions && admissions.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2">
            {admissions.map((admission) => (
              <div key={admission.id} className="rounded-lg border p-4">
                <h3 className="mb-2 text-lg font-semibold">
                  {admission.patient.firstName} {admission.patient.lastName}
                </h3>
                <p>
                  <strong>Bed Number:</strong> {admission.bedNumber}
                </p>
                <p>
                  <strong>Admitted:</strong> {new Date(admission.admissionDate).toLocaleDateString()}
                </p>
                <p>
                  <strong>Staff:</strong> {admission.staff.name}
                </p>
                {admission.dischargeDate ? (
                  <p>
                    <strong>Discharged:</strong> {new Date(admission.dischargeDate).toLocaleDateString()}
                  </p>
                ) : (
                  <p className="text-green-600">Currently Admitted</p>
                )}
                <div className="mt-4 flex space-x-2">
                  <button
                    onClick={() => setSelectedAdmission(admission as IcuAdmission)}
                    className="inline-flex justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                  >
                    Manage
                  </button>
                  {!admission.dischargeDate && (
                    <DischargePatientButton admission={admission as IcuAdmission} />
                  )}
                  <DeleteAdmissionButton admissionId={admission.id} />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p>No admissions found.</p>
        )}
      </div>

      {selectedAdmission && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 p-4 z-50">
          <div className="w-full max-w-md rounded-lg bg-white p-6">
            <h2 className="mb-4 text-xl font-bold">Manage Admission</h2>
            <UpdateIcuAdmissionForm admission={selectedAdmission} />
            <button
              onClick={() => setSelectedAdmission(null)}
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
