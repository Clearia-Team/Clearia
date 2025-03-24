"use client";
import { useState } from "react";
import { api } from "~/trpc/react";
import type { inferRouterOutputs } from "@trpc/server";
import type { AppRouter } from "~/server/api/root";
import type { PatientStatus } from "@prisma/client";

// Types based on your Zod schema
type RouterOutputs = inferRouterOutputs<AppRouter>;

type StatusUpdate = RouterOutputs["statusUpdate"]["getById"];
type IcuAdmission = RouterOutputs["icuAdmission"]["getById"];
type User = RouterOutputs["user"]["getLatest"];

type StatusUpdateFormData = {
  icuAdmissionId: string;
  status: PatientStatus;
  notes?: string | null;
  timestamp: Date;
  staffId: string;
};

type StatusUpdateUpdateData = {
  id: string;
  icuAdmissionId?: string;
  status?: PatientStatus;
  notes?: string | null;
  timestamp?: Date;
  staffId?: string;
};

export function LatestStatusUpdates() {
  const [latestUpdates] = api.statusUpdate.getAll.useSuspenseQuery();
  const recentUpdates = latestUpdates && latestUpdates.length > 0
    ? latestUpdates.slice(0, 5)
    : [];

  return (
    <div className="w-full max-w-md">
      <h2 className="mb-4 text-xl font-bold">Recent Status Updates</h2>
      {recentUpdates.length > 0 ? (
        <div className="space-y-4">
          {recentUpdates.map((update) => (
            <div key={update.id} className="rounded-lg border p-4">
              <h3 className="mb-2 text-lg font-semibold">
                {update.icuAdmission.patient.firstName} {update.icuAdmission.patient.lastName}
              </h3>
              <p>
                <strong>Status:</strong>{" "}
                <span className={getStatusColor(update.status)}>
                  {update.status}
                </span>
              </p>
              <p>
                <strong>Time:</strong> {new Date(update.timestamp).toLocaleString()}
              </p>
              <p>
                <strong>Updated by:</strong> {update.staff.name}
              </p>
              {update.notes && (
                <p>
                  <strong>Notes:</strong> {update.notes}
                </p>
              )}
            </div>
          ))}
        </div>
      ) : (
        <p>No recent status updates found.</p>
      )}
    </div>
  );
}

export function StatusUpdatesForAdmission({ admissionId }: { admissionId: string }) {
  const [statusUpdates] = api.statusUpdate.getByAdmissionId.useSuspenseQuery({ 
    icuAdmissionId: admissionId 
  });
  
  const [admission] = api.icuAdmission.getById.useSuspenseQuery({ 
    id: admissionId 
  });

  return (
    <div className="w-full max-w-lg">
      <h2 className="mb-4 text-xl font-bold">
        Status History for {admission?.patient.firstName} {admission?.patient.lastName}
      </h2>
      {statusUpdates && statusUpdates.length > 0 ? (
        <div className="space-y-4">
          {statusUpdates.map((update) => (
            <div key={update.id} className="rounded-lg border p-4">
              <p>
                <strong>Status:</strong>{" "}
                <span className={getStatusColor(update.status)}>
                  {update.status}
                </span>
              </p>
              <p>
                <strong>Time:</strong> {new Date(update.timestamp).toLocaleString()}
              </p>
              <p>
                <strong>Updated by:</strong> {update.staff.name}
              </p>
              {update.notes && (
                <p>
                  <strong>Notes:</strong> {update.notes}
                </p>
              )}
            </div>
          ))}
        </div>
      ) : (
        <p>No status updates found for this patient.</p>
      )}
    </div>
  );
}

function getStatusColor(status: PatientStatus) {
  switch (status) {
    case "CRITICAL":
      return "text-red-900 font-bold";
    case "STABLE":
      return "text-blue-900";
    case "IMPROVING":
      return "text-green-900";
    case "RECOVERED":
      return "text-green-900 font-bold";
    case "DECEASED":
      return "text-gray-900 font-bold";
    default:
      return "";
  }
}

export function CreateStatusUpdateForm() {
  const [formData, setFormData] = useState<StatusUpdateFormData>({
    icuAdmissionId: "",
    status: "STABLE",
    notes: "",
    timestamp: new Date(),
    staffId: "",
  });
  const [error, setError] = useState<string | null>(null);

  // Fetch current admissions to populate dropdown
  const [currentAdmissions] = api.icuAdmission.getCurrentAdmissions.useSuspenseQuery();

  // Fetch staff members to populate the dropdown
  const [staff] = api.user ? api.user.getAll.useSuspenseQuery() : [[]];

  const createStatusUpdate = api.statusUpdate.createStatusUpdate.useMutation({
    onSuccess: () => {
      // Reset form
      setFormData({
        icuAdmissionId: "",
        status: "STABLE",
        notes: "",
        timestamp: new Date(),
        staffId: "",
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
    if (name === "timestamp") {
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
    createStatusUpdate.mutate(formData);
  };

  return (
    <div className="w-full max-w-md">
      <h2 className="mb-4 text-xl font-bold">Update Patient Status</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="icuAdmissionId" className="block text-sm font-medium">
            Patient Admission
          </label>
          <select
            id="icuAdmissionId"
            name="icuAdmissionId"
            value={formData.icuAdmissionId}
            onChange={handleChange}
            required
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 text-black text-base bg-white dark:bg-gray-800 dark:text-white"
          >
            <option value="">Select a patient</option>
            {currentAdmissions?.map((admission) => (
              <option key={admission.id} value={admission.id}>
                {admission.patient.firstName} {admission.patient.lastName} (Bed {admission.bedNumber})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="status" className="block text-sm font-medium">
            Status
          </label>
          <select
            id="status"
            name="status"
            value={formData.status}
            onChange={handleChange}
            required
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 text-black text-base bg-white dark:bg-gray-800 dark:text-white"
          >
            <option value="CRITICAL">Critical</option>
            <option value="STABLE">Stable</option>
            <option value="IMPROVING">Improving</option>
            <option value="RECOVERED">Recovered</option>
            <option value="DECEASED">Deceased</option>
          </select>
        </div>

        <div>
          <label htmlFor="notes" className="block text-sm font-medium">
            Notes
          </label>
          <textarea
            id="notes"
            name="notes"
            value={formData.notes ?? ""}
            onChange={handleChange}
            rows={3}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 text-black text-base"
          />
        </div>

        <div>
          <label htmlFor="timestamp" className="block text-sm font-medium">
            Timestamp
          </label>
          <input
            type="datetime-local"
            id="timestamp"
            name="timestamp"
            value={formData.timestamp.toISOString().slice(0, 16)}
            onChange={handleChange}
            required
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 text-black text-base"
          />
        </div>

        <div>
          <label htmlFor="staffId" className="block text-sm font-medium">
            Staff Member
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
          disabled={createStatusUpdate.isPending}
          className="inline-flex justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none"
        >
          {createStatusUpdate.isPending ? "Updating..." : "Update Status"}
        </button>
      </form>
    </div>
  );
}

export function UpdateStatusUpdateForm({ statusUpdate }: { statusUpdate?: StatusUpdate }) {
  const [formData, setFormData] = useState<StatusUpdateUpdateData>({
    id: statusUpdate?.id ?? "",
    icuAdmissionId: statusUpdate?.icuAdmissionId,
    status: statusUpdate?.status,
    notes: statusUpdate?.notes,
    timestamp: statusUpdate?.timestamp,
    staffId: statusUpdate?.staffId,
  });
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  // Fetch current admissions and staff for dropdowns
  const [currentAdmissions] = api.icuAdmission.getCurrentAdmissions.useSuspenseQuery();
  const [staff] = api.user ? api.user.getAll.useSuspenseQuery() : [[]];

  const updateStatusUpdate = api.statusUpdate.updateStatusUpdate.useMutation({
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
    if (name === "timestamp") {
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
    if (!formData.id) {
      setError("Status Update ID is missing");
      return;
    }
    updateStatusUpdate.mutate(formData);
  };

  if (!isEditing) {
    return (
      <div className="w-full max-w-md rounded-lg border p-4">
        <h3 className="mb-2 text-lg font-semibold">
          Status Update for {statusUpdate?.icuAdmission.patient.firstName} {statusUpdate?.icuAdmission.patient.lastName}
        </h3>
        <p>
          <strong>Status:</strong>{" "}
          <span className={getStatusColor(statusUpdate?.status ?? "STABLE")}>
            {statusUpdate?.status}
          </span>
        </p>
        <p>
          <strong>Time:</strong> {statusUpdate?.timestamp?.toLocaleString()}
        </p>
        <p>
          <strong>Updated by:</strong> {statusUpdate?.staff.name}
        </p>
        {statusUpdate?.notes && (
          <p>
            <strong>Notes:</strong> {statusUpdate.notes}
          </p>
        )}
        <button
          onClick={() => setIsEditing(true)}
          className="mt-4 inline-flex justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          Edit Status Update
        </button>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md rounded-lg border p-4">
      <h3 className="mb-4 text-lg font-semibold">Edit Status Update</h3>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="update-icuAdmissionId" className="block text-sm font-medium">
            Patient Admission
          </label>
          <select
            id="update-icuAdmissionId"
            name="icuAdmissionId"
            value={formData.icuAdmissionId ?? ""}
            onChange={handleChange}
            required
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
          >
            <option value="">Select a patient</option>
            {currentAdmissions?.map((admission) => (
              <option key={admission.id} value={admission.id}>
                {admission.patient.firstName} {admission.patient.lastName} (Bed {admission.bedNumber})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="update-status" className="block text-sm font-medium">
            Status
          </label>
          <select
            id="update-status"
            name="status"
            value={formData.status ?? ""}
            onChange={handleChange}
            required
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
          >
            <option value="CRITICAL">Critical</option>
            <option value="STABLE">Stable</option>
            <option value="IMPROVING">Improving</option>
            <option value="RECOVERED">Recovered</option>
            <option value="DECEASED">Deceased</option>
          </select>
        </div>

        <div>
          <label htmlFor="update-notes" className="block text-sm font-medium">
            Notes
          </label>
          <textarea
            id="update-notes"
            name="notes"
            value={formData.notes ?? ""}
            onChange={handleChange}
            rows={3}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
          />
        </div>

        <div>
          <label htmlFor="update-timestamp" className="block text-sm font-medium">
            Timestamp
          </label>
          <input
            type="datetime-local"
            id="update-timestamp"
            name="timestamp"
            value={formData.timestamp ? new Date(formData.timestamp).toISOString().slice(0, 16) : ''}
            onChange={handleChange}
            required
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
          />
        </div>

        <div>
          <label htmlFor="update-staffId" className="block text-sm font-medium">
            Staff Member
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
            disabled={updateStatusUpdate.isPending}
            className="inline-flex justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none"
          >
            {updateStatusUpdate.isPending ? "Updating..." : "Update Status"}
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

export function DeleteStatusUpdateButton({ statusUpdateId }: { statusUpdateId?: string }) {
  const [isConfirming, setIsConfirming] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const deleteStatusUpdate = api.statusUpdate.deleteStatusUpdate.useMutation({
    onSuccess: () => {
      setIsConfirming(false);
      setError(null);
    },
    onError: (e) => {
      setError(e.message);
    },
  });

  const handleDelete = () => {
    if (!statusUpdateId) {
      setError("Status Update ID is missing.");
      return;
    }
    deleteStatusUpdate.mutate({ id: statusUpdateId });
  };

  if (isConfirming) {
    return (
      <div className="mt-4 space-y-2">
        <p className="text-sm text-red-600">
          Are you sure you want to delete this status update? This action cannot be undone.
        </p>
        <div className="flex space-x-2">
          <button
            onClick={handleDelete}
            disabled={deleteStatusUpdate.isPending}
            className="inline-flex justify-center rounded-md border border-transparent bg-red-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-red-700 focus:outline-none"
          >
            {deleteStatusUpdate.isPending ? "Deleting..." : "Yes, Delete"}
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
      Delete Update
    </button>
  );
}

export function StatusUpdateDashboard() {
  const [statusUpdates] = api.statusUpdate.getAll.useSuspenseQuery();
  const [selectedUpdate, setSelectedUpdate] = useState<StatusUpdate | null>(null);
  
  return (
    <div className="w-full">
      <div className="mb-8">
        <CreateStatusUpdateForm />
      </div>

      <div className="mb-8">
        <h2 className="mb-4 text-xl font-bold">Manage Status Updates</h2>
        {statusUpdates && statusUpdates.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2">
            {statusUpdates.map((update) => (
              <div key={update.id} className="rounded-lg border p-4">
                <h3 className="mb-2 text-lg font-semibold">
                  {update.icuAdmission.patient.firstName} {update.icuAdmission.patient.lastName}
                </h3>
                <p>
                  <strong>Status:</strong>{" "}
                  <span className={getStatusColor(update.status)}>
                    {update.status}
                  </span>
                </p>
                <p>
                  <strong>Time:</strong> {new Date(update.timestamp).toLocaleString()}
                </p>
                <p>
                  <strong>Updated by:</strong> {update.staff.name}
                </p>
                {update.notes && (
                  <p>
                    <strong>Notes:</strong> {update.notes}
                  </p>
                )}
                <div className="mt-4 flex space-x-2">
                  <button
                    onClick={() => setSelectedUpdate(update as StatusUpdate)}
                    className="inline-flex justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                  >
                    Edit
                  </button>
                  <DeleteStatusUpdateButton statusUpdateId={update.id} />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p>No status updates found.</p>
        )}
      </div>

      {selectedUpdate && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 p-4 z-50">
          <div className="w-full max-w-md rounded-lg bg-white p-6">
            <h2 className="mb-4 text-xl font-bold">Edit Status Update</h2>
            <UpdateStatusUpdateForm statusUpdate={selectedUpdate} />
            <button
              onClick={() => setSelectedUpdate(null)}
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


// Patient Timeline component to display a history of status changes
export function PatientStatusTimeline({ patientId }: { patientId: string }) {
  const [patient] = api.patient.getById.useSuspenseQuery({ id: patientId });
  const [admissions] = api.icuAdmission.getByPatientId.useSuspenseQuery({ patientId });
  
  // Get all status updates for all admissions for this patient
  const admissionIds = admissions?.map(admission => admission.id) || [];
  const [allStatusUpdates] = api.statusUpdate.getAll.useSuspenseQuery();
  
  // Filter status updates to only those for this patient's admissions
  const patientStatusUpdates = allStatusUpdates?.filter(update => 
    admissionIds.includes(update.icuAdmissionId)
  ) || [];
  
  // Sort by timestamp
  const sortedUpdates = [...patientStatusUpdates].sort((a, b) => 
    new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );

  return (
    <div className="w-full max-w-3xl">
      <h2 className="mb-4 text-2xl font-bold">
        Status History for {patient?.firstName} {patient?.lastName}
      </h2>
      
      {sortedUpdates.length > 0 ? (
        <div className="relative">
          {/* Timeline line */}
          <div className="absolute top-0 bottom-0 left-6 w-0.5 bg-gray-200"></div>
          
          <div className="space-y-6">
            {sortedUpdates.map((update, index) => (
              <div key={update.id} className="relative pl-14">
                {/* Timeline dot */}
                <div className={`absolute left-4 h-5 w-5 rounded-full border-4 ${getStatusDotColor(update.status)}`}></div>
                
                <div className="rounded-lg border p-4">
                  <div className="flex justify-between">
                    <span className={`font-bold ${getStatusColor(update.status)}`}>
                      {update.status}
                    </span>
                    <span className="text-sm text-gray-500">
                      {new Date(update.timestamp).toLocaleString()}
                    </span>
                  </div>
                  
                  <p className="mt-2">
                    <strong>Updated by:</strong> {update.staff.name}
                  </p>
                  
                  {update.notes && (
                    <p className="mt-2">
                      {update.notes}
                    </p>
                  )}
                  
                  <p className="mt-2 text-sm text-gray-500">
                    <strong>Admission:</strong> Bed #{update.icuAdmission.bedNumber} on {new Date(update.icuAdmission.admissionDate).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <p>No status updates found for this patient.</p>
      )}
    </div>
  );
}

function getStatusDotColor(status: PatientStatus) {
  switch (status) {
    case "CRITICAL":
      return "border-red-600 bg-white";
    case "STABLE":
      return "border-blue-600 bg-white";
    case "IMPROVING":
      return "border-green-600 bg-white";
    case "RECOVERED":
      return "border-green-800 bg-white";
    case "DECEASED":
      return "border-gray-600 bg-white";
    default:
      return "border-gray-400 bg-white";
  }
}
