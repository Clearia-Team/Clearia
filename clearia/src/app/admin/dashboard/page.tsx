"use client";
import React, { useState } from "react";
import Link from "next/link";
import { ExitToApp } from "@mui/icons-material";
import { useRouter } from "next/navigation";
import { api } from "~/trpc/react";
import { icuAdmissionRouter } from "~/server/api/routers/icuAdmission";

const AdminDashboard = () => {
  const router = useRouter();

  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [filterDoctor, setFilterDoctor] = useState("");

  // Fetch data from your tRPC endpoints
  const {
    data: treatments,
    isLoading: treatmentsLoading,
    refetch: refetchTreatments,
  } = api.treatment.getAll.useQuery();
  const { data: patients, isLoading: patientsLoading } =
    api.patient.getAll.useQuery();

  // Add delete mutation
  const deleteTreatment = api.treatment.delete.useMutation({
    onSuccess: () => {
      refetchTreatments();
    },
  });

  // Transform treatment data to match the dashboard format
  const patientData = React.useMemo(() => {
    if (!treatments || !patients) return [];

    return treatments.map((treatment) => {
      const patient = patients.find((p) => p.id === treatment.patientId);
      // Get ICU admission bed number if available

      return {
        id: treatment.id,
        medicalId: patient?.medicalId ?? "N/A",
        name: patient
          ? `${patient.firstName} ${patient.lastName}`
          : "Unknown Patient",
        doctor: treatment.doctor?.name || "Unknown Doctor",
        treatment: treatment.name,
        status: treatment.status,
        patientId: treatment.patientId,
        doctorId: treatment.doctorId,
        hospital: treatment.hospital,
        date: treatment.date,
      };
    });
  }, [treatments, patients]);

  // Get unique doctors from treatments
  const doctors = React.useMemo(() => {
    if (!treatments) return [];
    return [...new Set(treatments.map((t) => t.doctor?.name).filter(Boolean))];
  }, [treatments]);

  // Filter patients based on search and filters
  const filteredPatients = patientData.filter((p) => {
    // Search specifically by medical ID
    const matchesSearch = searchQuery
      ? p.medicalId.toLowerCase() === searchQuery.toLowerCase()
      : true;
    const matchesStatus = filterStatus ? p.status === filterStatus : true;
    const matchesDoctor = filterDoctor ? p.doctor === filterDoctor : true;
    return matchesSearch && matchesStatus && matchesDoctor;
  });

  const getCount = (status: string) =>
    patientData.filter((p) => p.status === status).length;

  const getStatusColor = (status: string) => {
    switch (status) {
      case "CRITICAL":
        return "bg-red-100 text-red-600";
      case "STABLE":
        return "bg-green-100 text-green-600";
      case "ONGOING":
        return "bg-blue-100 text-blue-600";
      case "COMPLETED":
        return "bg-gray-200 text-gray-700";
      case "SCHEDULED":
        return "bg-yellow-100 text-yellow-700";
      case "CANCELLED":
        return "bg-red-100 text-red-600";
      default:
        return "bg-gray-100 text-gray-600";
    }
  };

  const formatStatus = (status: string) => {
    return status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();
  };

  const handleDelete = async (treatmentId: string, patientName: string) => {
    if (
      window.confirm(
        `Are you sure you want to delete the treatment for ${patientName}? This action cannot be undone.`,
      )
    ) {
      try {
        await deleteTreatment.mutateAsync({ id: treatmentId });
      } catch (error) {
        console.error("Failed to delete treatment:", error);
        alert("Failed to delete treatment. Please try again.");
      }
    }
  };

  if (treatmentsLoading || patientsLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-xl">Loading dashboard...</div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside className="sticky top-0 h-screen w-64 bg-blue-700 p-6 text-white">
        <h1 className="mb-10 text-3xl font-bold">Admin Panel</h1>
        <nav className="space-y-4">
          <Link
            href="/admin/patients"
            className="flex items-center space-x-2 rounded p-2 hover:bg-blue-600"
          >
            <span>Manage Patients</span>
          </Link>
          <Link
            href="/admin/treatments"
            className="flex items-center space-x-2 rounded p-2 hover:bg-blue-600"
          >
            <span>Manage Treatments</span>
          </Link>
          <Link
            href="/admin/auth/signin"
            className="flex items-center space-x-2 rounded p-2 hover:bg-red-500"
          >
            <ExitToApp /> <span>Logout</span>
          </Link>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 bg-gray-100 p-6">
        {/* Top */}
        <div className="mb-6 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
          <h2 className="text-2xl font-semibold">Treatment Dashboard</h2>
          <input
            type="text"
            placeholder="Search treatments by medical ID..."
            className="w-full rounded-lg border px-4 py-2 shadow-sm focus:ring-2 focus:ring-blue-400 sm:w-72"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Stats */}
        <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-4">
          <div className="rounded-lg bg-white p-4 shadow hover:shadow-md">
            <p className="text-gray-500">Total Treatments</p>
            <h3 className="text-2xl font-bold">{patientData.length}</h3>
          </div>
          <div className="rounded-lg bg-white p-4 shadow hover:shadow-md">
            <p className="text-gray-500">Ongoing</p>
            <h3 className="text-2xl font-bold text-blue-500">
              {getCount("ONGOING")}
            </h3>
          </div>
          <div className="rounded-lg bg-white p-4 shadow hover:shadow-md">
            <p className="text-gray-500">Completed</p>
            <h3 className="text-2xl font-bold text-green-600">
              {getCount("COMPLETED")}
            </h3>
          </div>
          <div className="rounded-lg bg-white p-4 shadow hover:shadow-md">
            <p className="text-gray-500">Scheduled</p>
            <h3 className="text-2xl font-bold text-yellow-600">
              {getCount("SCHEDULED")}
            </h3>
          </div>
        </div>

        {/* Filters */}
        <div className="mb-4 flex flex-col items-start gap-4 sm:flex-row sm:items-center">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="w-full rounded border p-2 sm:w-auto"
          >
            <option value="">Filter by Status</option>
            <option value="ONGOING">Ongoing</option>
            <option value="COMPLETED">Completed</option>
            <option value="SCHEDULED">Scheduled</option>
            <option value="CANCELLED">Cancelled</option>
          </select>
          <select
            value={filterDoctor}
            onChange={(e) => setFilterDoctor(e.target.value)}
            className="w-full rounded border p-2 sm:w-auto"
          >
            <option value="">Filter by Doctor</option>
            {doctors.map((doc, i) => (
              <option key={i} value={doc}>
                {doc}
              </option>
            ))}
          </select>
          <button
            className="rounded bg-gray-300 px-4 py-2 text-black hover:bg-gray-400"
            onClick={() => {
              setFilterStatus("");
              setFilterDoctor("");
              setSearchQuery("");
            }}
          >
            Clear Filters
          </button>
          <button
            className="rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
            onClick={() => router.push("/admin/dashboard/new-treatment")}
          >
            Add Treatment
          </button>
          <button
            className="rounded bg-gray-500 px-4 py-2 text-white hover:bg-gray-600"
            onClick={() => {
              refetchTreatments();
            }}
          >
            Refresh
          </button>
        </div>

        {/* Table */}
        <div className="overflow-x-auto rounded-lg bg-white shadow">
          <table className="w-full min-w-[1100px] text-left">
            <thead className="bg-blue-100 text-sm uppercase text-gray-700">
              <tr>
                <th className="p-3">Medical ID</th>
                <th className="p-3">Patient Name</th>
                <th className="p-3">Bed Number</th>
                <th className="p-3">Treatment</th>
                <th className="p-3">Hospital</th>
                <th className="p-3">Doctor</th>
                <th className="p-3">Date</th>
                <th className="p-3">Status</th>
                <th className="p-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredPatients.length > 0 ? (
                filteredPatients.map((p, i) => (
                  <tr
                    key={i}
                    className="border-b transition duration-200 hover:bg-gray-50"
                  >
                    <td className="p-3 font-mono text-sm font-medium">
                      {p.medicalId}
                    </td>
                    <td className="p-3 font-medium">{p.name}</td>
                    <td className="p-3 text-center">{p.bedNumber}</td>
                    <td className="p-3">{p.treatment}</td>
                    <td className="p-3">{p.hospital}</td>
                    <td className="p-3">{p.doctor}</td>
                    <td className="p-3">
                      {new Date(p.date).toLocaleDateString()}
                    </td>
                    <td className="p-3">
                      <span
                        className={`rounded-full px-2 py-1 text-sm font-medium ${getStatusColor(p.status)}`}
                      >
                        {formatStatus(p.status)}
                      </span>
                    </td>
                    <td className="p-3">
                      <div className="flex gap-2">
                        <button
                          className="rounded bg-green-500 px-2 py-1 text-xs text-white hover:bg-green-600"
                          onClick={() =>
                            router.push(`/admin/treatments/${p.id}`)
                          }
                        >
                          Edit
                        </button>
                        <button
                          className="rounded bg-red-500 px-2 py-1 text-xs text-white hover:bg-red-600"
                          onClick={() => handleDelete(p.id, p.name)}
                          disabled={deleteTreatment.isLoading}
                        >
                          {deleteTreatment.isLoading ? "Deleting..." : "Delete"}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td className="p-4 text-center text-gray-500" colSpan={9}>
                    No treatments found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;
