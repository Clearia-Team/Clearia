"use client";

import React, { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Users,
  Calendar,
  FileText,
  Settings,
  LogOut,
  ChevronRight,
  User,
  Clock,
  AlertCircle,
  Bed,
  Activity,
  Search,
  Filter,
  Phone,
  MapPin,
  Stethoscope,
  Heart,
  Brain,
  Eye,
  Scissors,
  X,
} from "lucide-react";

// Types for the doctor dashboard
type PatientCategory = "INPATIENT" | "OUTPATIENT" | "CRITICAL";
type PatientStatus = "STABLE" | "CRITICAL" | "RECOVERING" | "EMERGENCY";

type Patient = {
  id: string;
  name: string;
  age: number;
  gender: "MALE" | "FEMALE" | "OTHER";
  category: PatientCategory;
  status: PatientStatus;
  disease: string;
  admissionDate: Date;
  wardNo?: string;
  icuNo?: string;
  bedNumber?: string;
  contactNumber: string;
  address: string;
  emergencyContact: string;
  bloodGroup: string;
  allergies?: string[];
  currentMedications?: string[];
  lastVisit: Date;
  nextAppointment?: Date;
  assignedDoctor: string;
  symptoms: string[];
  vitals: {
    temperature: number;
    bloodPressure: string;
    heartRate: number;
    oxygenSaturation: number;
  };
};

// Mock data - in real app, this would come from your API
const mockPatients: Patient[] = [
  {
    id: "P001",
    name: "Rajesh Kumar",
    age: 45,
    gender: "MALE",
    category: "CRITICAL",
    status: "CRITICAL",
    disease: "Acute Myocardial Infarction",
    admissionDate: new Date("2024-06-10"),
    icuNo: "ICU-3",
    bedNumber: "B-12",
    contactNumber: "+91 98765 43210",
    address: "123 Main St, Shimla, HP",
    emergencyContact: "+91 98765 43211",
    bloodGroup: "O+",
    allergies: ["Penicillin", "Sulfa drugs"],
    currentMedications: ["Aspirin", "Metoprolol", "Atorvastatin"],
    lastVisit: new Date("2024-06-12"),
    assignedDoctor: "Dr. Sharma",
    symptoms: ["Chest pain", "Shortness of breath", "Sweating"],
    vitals: {
      temperature: 98.6,
      bloodPressure: "140/90",
      heartRate: 85,
      oxygenSaturation: 95,
    },
  },
  {
    id: "P002",
    name: "Priya Patel",
    age: 32,
    gender: "FEMALE",
    category: "INPATIENT",
    status: "STABLE",
    disease: "Pneumonia",
    admissionDate: new Date("2024-06-08"),
    wardNo: "W-2A",
    bedNumber: "B-5",
    contactNumber: "+91 98765 43212",
    address: "456 Oak Ave, Shimla, HP",
    emergencyContact: "+91 98765 43213",
    bloodGroup: "A+",
    allergies: ["Latex"],
    currentMedications: ["Antibiotics", "Bronchodilators"],
    lastVisit: new Date("2024-06-11"),
    nextAppointment: new Date("2024-06-15"),
    assignedDoctor: "Dr. Sharma",
    symptoms: ["Cough", "Fever", "Difficulty breathing"],
    vitals: {
      temperature: 99.2,
      bloodPressure: "120/80",
      heartRate: 72,
      oxygenSaturation: 98,
    },
  },
  {
    id: "P003",
    name: "Amit Singh",
    age: 28,
    gender: "MALE",
    category: "OUTPATIENT",
    status: "RECOVERING",
    disease: "Hypertension",
    admissionDate: new Date("2024-06-01"),
    contactNumber: "+91 98765 43214",
    address: "789 Pine St, Shimla, HP",
    emergencyContact: "+91 98765 43215",
    bloodGroup: "B+",
    currentMedications: ["Lisinopril", "Hydrochlorothiazide"],
    lastVisit: new Date("2024-06-10"),
    nextAppointment: new Date("2024-06-20"),
    assignedDoctor: "Dr. Sharma",
    symptoms: ["Headache", "Dizziness"],
    vitals: {
      temperature: 98.4,
      bloodPressure: "135/85",
      heartRate: 68,
      oxygenSaturation: 99,
    },
  },
  {
    id: "P004",
    name: "Sunita Devi",
    age: 55,
    gender: "FEMALE",
    category: "CRITICAL",
    status: "EMERGENCY",
    disease: "Stroke",
    admissionDate: new Date("2024-06-12"),
    icuNo: "ICU-1",
    bedNumber: "B-3",
    contactNumber: "+91 98765 43216",
    address: "321 Elm St, Shimla, HP",
    emergencyContact: "+91 98765 43217",
    bloodGroup: "AB+",
    allergies: ["Iodine"],
    currentMedications: ["Anticoagulants", "Antihypertensives"],
    lastVisit: new Date("2024-06-12"),
    assignedDoctor: "Dr. Sharma",
    symptoms: ["Weakness", "Speech difficulty", "Confusion"],
    vitals: {
      temperature: 97.8,
      bloodPressure: "160/100",
      heartRate: 90,
      oxygenSaturation: 94,
    },
  },
  {
    id: "P005",
    name: "Vikram Gupta",
    age: 38,
    gender: "MALE",
    category: "INPATIENT",
    status: "STABLE",
    disease: "Appendicitis",
    admissionDate: new Date("2024-06-09"),
    wardNo: "W-3B",
    bedNumber: "B-8",
    contactNumber: "+91 98765 43218",
    address: "654 Maple Dr, Shimla, HP",
    emergencyContact: "+91 98765 43219",
    bloodGroup: "O-",
    currentMedications: ["Antibiotics", "Pain relievers"],
    lastVisit: new Date("2024-06-11"),
    nextAppointment: new Date("2024-06-16"),
    assignedDoctor: "Dr. Sharma",
    symptoms: ["Abdominal pain", "Nausea", "Fever"],
    vitals: {
      temperature: 99.1,
      bloodPressure: "125/82",
      heartRate: 75,
      oxygenSaturation: 98,
    },
  },
  {
    id: "P006",
    name: "Neha Sharma",
    age: 29,
    gender: "FEMALE",
    category: "OUTPATIENT",
    status: "STABLE",
    disease: "Diabetes Type 2",
    admissionDate: new Date("2024-06-05"),
    contactNumber: "+91 98765 43220",
    address: "987 Cedar St, Shimla, HP",
    emergencyContact: "+91 98765 43221",
    bloodGroup: "A-",
    currentMedications: ["Metformin", "Insulin"],
    lastVisit: new Date("2024-06-10"),
    nextAppointment: new Date("2024-06-25"),
    assignedDoctor: "Dr. Sharma",
    symptoms: ["Frequent urination", "Thirst"],
    vitals: {
      temperature: 98.2,
      bloodPressure: "118/75",
      heartRate: 70,
      oxygenSaturation: 99,
    },
  },
  {
    id: "P007",
    name: "Rohit Mehta",
    age: 42,
    gender: "MALE",
    category: "INPATIENT",
    status: "RECOVERING",
    disease: "Kidney Stones",
    admissionDate: new Date("2024-06-11"),
    wardNo: "W-1A",
    bedNumber: "B-15",
    contactNumber: "+91 98765 43222",
    address: "456 Birch Ave, Shimla, HP",
    emergencyContact: "+91 98765 43223",
    bloodGroup: "B-",
    currentMedications: ["Pain relievers", "Alpha blockers"],
    lastVisit: new Date("2024-06-12"),
    nextAppointment: new Date("2024-06-18"),
    assignedDoctor: "Dr. Sharma",
    symptoms: ["Back pain", "Blood in urine"],
    vitals: {
      temperature: 98.8,
      bloodPressure: "128/82",
      heartRate: 72,
      oxygenSaturation: 98,
    },
  },
];

const DoctorDashboard = () => {
  const [activeTab, setActiveTab] = useState("patients");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPatient, setSelectedPatient] = useState<string>("");
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const [filterCategory, setFilterCategory] = useState<PatientCategory | "ALL">(
    "ALL",
  );
  const [filterStatus, setFilterStatus] = useState<PatientStatus | "ALL">(
    "ALL",
  );
  const searchRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchRef.current &&
        !searchRef.current.contains(event.target as Node)
      ) {
        setShowSearchDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Get filtered patient names for search dropdown
  const getSearchSuggestions = () => {
    if (!searchTerm.trim()) return [];

    return mockPatients
      .filter((patient) =>
        patient.name.toLowerCase().includes(searchTerm.toLowerCase()),
      )
      .slice(0, 5) // Limit to 5 suggestions
      .map((patient) => ({
        id: patient.id,
        name: patient.name,
        category: patient.category,
        status: patient.status,
      }));
  };

  // Filter patients based on selected patient or other filters
  const filteredPatients = mockPatients.filter((patient) => {
    // If a specific patient is selected, show only that patient
    if (selectedPatient) {
      return patient.name === selectedPatient;
    }

    // Otherwise, apply category and status filters
    const matchesCategory =
      filterCategory === "ALL" || patient.category === filterCategory;
    const matchesStatus =
      filterStatus === "ALL" || patient.status === filterStatus;

    return matchesCategory && matchesStatus;
  });

  const handleSearchSelect = (patientName: string) => {
    setSelectedPatient(patientName);
    setSearchTerm(patientName);
    setShowSearchDropdown(false);
  };

  const clearSearch = () => {
    setSelectedPatient("");
    setSearchTerm("");
    setShowSearchDropdown(false);
  };

  const formatDate = (date: Date) => {
    const options: Intl.DateTimeFormatOptions = {
      year: "numeric",
      month: "short",
      day: "numeric",
    };
    return new Date(date).toLocaleDateString(undefined, options);
  };

  const getCategoryBadgeClasses = (category: PatientCategory) => {
    switch (category) {
      case "CRITICAL":
        return "bg-red-100 text-red-800";
      case "INPATIENT":
        return "bg-blue-100 text-blue-800";
      case "OUTPATIENT":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusBadgeClasses = (status: PatientStatus) => {
    switch (status) {
      case "CRITICAL":
        return "bg-red-100 text-red-800";
      case "EMERGENCY":
        return "bg-red-100 text-red-800";
      case "STABLE":
        return "bg-green-100 text-green-800";
      case "RECOVERING":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getDisplayCategory = (category: PatientCategory) => {
    return category.charAt(0) + category.slice(1).toLowerCase();
  };

  const getDisplayStatus = (status: PatientStatus) => {
    return status.charAt(0) + status.slice(1).toLowerCase();
  };

  const handlePatientClick = (id: string) => {
    router.push(`/doctor/dashboard/${id}`);
  };

  const handleLogout = () => {
    console.log("Logging out...");
  };

  const renderPatientCard = (patient: Patient) => {
    return (
      <div
        key={patient.id}
        onClick={() => handlePatientClick(patient.id)}
        className="group cursor-pointer overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm transition-all duration-200 hover:shadow-md"
      >
        <div
          className={`h-2 ${patient.category === "CRITICAL"
            ? "bg-red-500"
            : patient.category === "INPATIENT"
              ? "bg-blue-500"
              : "bg-green-500"
            }`}
        ></div>
        <div className="p-5">
          <div className="mb-3 flex items-start justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-800 transition-colors group-hover:text-blue-600">
                {patient.name}
              </h3>
              <p className="text-sm text-gray-500">
                ID: {patient.id} • {patient.age} years • {patient.gender}
              </p>
            </div>
            <div className="flex flex-col gap-1">
              <span
                className={`rounded-full px-3 py-1 text-xs font-medium ${getCategoryBadgeClasses(patient.category)}`}
              >
                {getDisplayCategory(patient.category)}
              </span>
              <span
                className={`rounded-full px-3 py-1 text-xs font-medium ${getStatusBadgeClasses(patient.status)}`}
              >
                {getDisplayStatus(patient.status)}
              </span>
            </div>
          </div>

          <p className="mb-4 text-sm font-medium text-gray-600">
            {patient.disease}
          </p>

          <div className="space-y-2 border-t border-gray-100 pt-3">
            <div className="flex items-center text-sm text-gray-500">
              <Calendar size={16} className="mr-2 text-blue-500" />
              <span>Admitted: {formatDate(patient.admissionDate)}</span>
            </div>

            {patient.icuNo && (
              <div className="flex items-center text-sm font-medium text-red-600">
                <AlertCircle size={16} className="mr-2" />
                <span>
                  ICU: {patient.icuNo} • Bed: {patient.bedNumber}
                </span>
              </div>
            )}

            {patient.wardNo && !patient.icuNo && (
              <div className="flex items-center text-sm text-blue-600">
                <Bed size={16} className="mr-2" />
                <span>
                  Ward: {patient.wardNo} • Bed: {patient.bedNumber}
                </span>
              </div>
            )}

            <div className="flex items-center text-sm text-gray-500">
              <Phone size={16} className="mr-2 text-green-500" />
              <span>{patient.contactNumber}</span>
            </div>

            <div className="flex items-center text-sm text-gray-500">
              <Activity size={16} className="mr-2 text-purple-500" />
              <span>
                BP: {patient.vitals.bloodPressure} • HR:{" "}
                {patient.vitals.heartRate} • O2:{" "}
                {patient.vitals.oxygenSaturation}%
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between border-t border-gray-100 bg-gray-50 px-5 py-3">
          <span className="text-sm text-gray-600">
            Last visit: {formatDate(patient.lastVisit)}
          </span>
          <ChevronRight
            className="text-blue-400 transition-colors group-hover:text-blue-600"
            size={18}
          />
        </div>
      </div>
    );
  };

  const renderPatientRow = (patient: Patient) => {
    return (
      <div
        key={patient.id}
        onClick={() => handlePatientClick(patient.id)}
        className="group cursor-pointer rounded-lg border border-gray-200 bg-white p-4 transition-all hover:border-blue-300 hover:shadow-sm"
      >
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <div className="mb-2 flex items-center gap-3">
              <h4 className="font-medium text-gray-800 transition-colors group-hover:text-blue-600">
                {patient.name}
              </h4>
              <span className="text-sm text-gray-500">({patient.id})</span>
              <span
                className={`rounded-full px-2 py-0.5 text-xs font-medium ${getCategoryBadgeClasses(patient.category)}`}
              >
                {getDisplayCategory(patient.category)}
              </span>
              <span
                className={`rounded-full px-2 py-0.5 text-xs font-medium ${getStatusBadgeClasses(patient.status)}`}
              >
                {getDisplayStatus(patient.status)}
              </span>
            </div>

            <div className="flex items-center gap-6 text-sm text-gray-600">
              <span className="font-medium">{patient.disease}</span>
              <span>
                {patient.age} years • {patient.gender}
              </span>
              {patient.icuNo && (
                <span className="flex items-center font-medium text-red-600">
                  <AlertCircle size={14} className="mr-1" />
                  ICU: {patient.icuNo}
                </span>
              )}
              {patient.wardNo && !patient.icuNo && (
                <span className="flex items-center text-blue-600">
                  <Bed size={14} className="mr-1" />
                  Ward: {patient.wardNo}
                </span>
              )}
              <span className="text-gray-500">
                BP: {patient.vitals.bloodPressure}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500">
              {formatDate(patient.lastVisit)}
            </span>
            <ChevronRight
              className="text-gray-400 transition-colors group-hover:text-blue-600"
              size={16}
            />
          </div>
        </div>
      </div>
    );
  };

  const renderContent = () => {
    const totalPatients = mockPatients.length;
    const criticalPatients = mockPatients.filter(
      (p) => p.category === "CRITICAL",
    ).length;
    const inpatients = mockPatients.filter(
      (p) => p.category === "INPATIENT",
    ).length;
    const outpatients = mockPatients.filter(
      (p) => p.category === "OUTPATIENT",
    ).length;

    switch (activeTab) {
      case "patients":
        return (
          <div className="w-full space-y-8 p-8">
            <div className="mb-6 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
              <div>
                <h1 className="text-3xl font-bold text-gray-800">
                  My Patients
                </h1>
                <p className="text-gray-500">
                  Manage your patients and their medical records
                </p>
              </div>
            </div>

            {/* Patient Summary Stats */}
            <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-4">
              <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
                <h3 className="mb-2 text-sm font-medium text-gray-500">
                  Total Patients
                </h3>
                <div className="flex items-end gap-2">
                  <span className="text-2xl font-semibold text-gray-800">
                    {totalPatients}
                  </span>
                  <span className="mb-1 text-sm text-gray-500">patients</span>
                </div>
              </div>
              <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
                <h3 className="mb-2 text-sm font-medium text-red-600">
                  Critical
                </h3>
                <div className="flex items-end gap-2">
                  <span className="text-2xl font-semibold text-gray-800">
                    {criticalPatients}
                  </span>
                  <span className="mb-1 text-sm text-gray-500">patients</span>
                </div>
              </div>
              <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
                <h3 className="mb-2 text-sm font-medium text-blue-600">
                  Inpatients
                </h3>
                <div className="flex items-end gap-2">
                  <span className="text-2xl font-semibold text-gray-800">
                    {inpatients}
                  </span>
                  <span className="mb-1 text-sm text-gray-500">patients</span>
                </div>
              </div>
              <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
                <h3 className="mb-2 text-sm font-medium text-green-600">
                  Outpatients
                </h3>
                <div className="flex items-end gap-2">
                  <span className="text-2xl font-semibold text-gray-800">
                    {outpatients}
                  </span>
                  <span className="mb-1 text-sm text-gray-500">patients</span>
                </div>
              </div>
            </div>

            {/* Enhanced Search and Filters */}
            <div className="mb-6 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
              <div className="flex flex-col gap-4 sm:flex-row">
                <div className="flex-1">
                  <div className="relative" ref={searchRef}>
                    <Search
                      className="absolute left-3 top-3 text-gray-400"
                      size={20}
                    />
                    <input
                      type="text"
                      placeholder="Search patients by name..."
                      value={searchTerm}
                      onChange={(e) => {
                        setSearchTerm(e.target.value);
                        setShowSearchDropdown(true);
                        if (!e.target.value.trim()) {
                          setSelectedPatient("");
                        }
                      }}
                      onFocus={() => setShowSearchDropdown(true)}
                      className="w-full rounded-lg border border-gray-300 py-2 pl-10 pr-10 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    {searchTerm && (
                      <button
                        onClick={clearSearch}
                        className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                      >
                        <X size={16} />
                      </button>
                    )}

                    {/* Search Dropdown */}
                    {showSearchDropdown &&
                      searchTerm &&
                      getSearchSuggestions().length > 0 && (
                        <div className="absolute left-0 right-0 top-full z-10 mt-1 rounded-lg border border-gray-200 bg-white shadow-lg">
                          {getSearchSuggestions().map((suggestion) => (
                            <button
                              key={suggestion.id}
                              onClick={() =>
                                handleSearchSelect(suggestion.name)
                              }
                              className="flex w-full items-center justify-between border-b border-gray-100 px-4 py-3 text-left last:border-b-0 hover:bg-gray-50"
                            >
                              <div>
                                <span className="font-medium text-gray-800">
                                  {suggestion.name}
                                </span>
                              </div>
                              <div className="flex gap-2">
                                <span
                                  className={`rounded-full px-2 py-1 text-xs font-medium ${getCategoryBadgeClasses(suggestion.category)}`}
                                >
                                  {getDisplayCategory(suggestion.category)}
                                </span>
                                <span
                                  className={`rounded-full px-2 py-1 text-xs font-medium ${getStatusBadgeClasses(suggestion.status)}`}
                                >
                                  {getDisplayStatus(suggestion.status)}
                                </span>
                              </div>
                            </button>
                          ))}
                        </div>
                      )}

                    {/* No results message */}
                    {showSearchDropdown &&
                      searchTerm &&
                      getSearchSuggestions().length === 0 && (
                        <div className="absolute left-0 right-0 top-full z-10 mt-1 rounded-lg border border-gray-200 bg-white shadow-lg">
                          <div className="px-4 py-3 text-center text-gray-500">
                            No patients found matching "{searchTerm}"
                          </div>
                        </div>
                      )}
                  </div>
                </div>

                <div className="flex gap-2">
                  <select
                    value={filterCategory}
                    onChange={(e) =>
                      setFilterCategory(
                        e.target.value as PatientCategory | "ALL",
                      )
                    }
                    className="rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    disabled={!!selectedPatient}
                  >
                    <option value="ALL">All Categories</option>
                    <option value="CRITICAL">Critical</option>
                    <option value="INPATIENT">Inpatient</option>
                    <option value="OUTPATIENT">Outpatient</option>
                  </select>
                  <select
                    value={filterStatus}
                    onChange={(e) =>
                      setFilterStatus(e.target.value as PatientStatus | "ALL")
                    }
                    className="rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    disabled={!!selectedPatient}
                  >
                    <option value="ALL">All Status</option>
                    <option value="CRITICAL">Critical</option>
                    <option value="EMERGENCY">Emergency</option>
                    <option value="STABLE">Stable</option>
                    <option value="RECOVERING">Recovering</option>
                  </select>
                </div>
              </div>

              {/* Active search indicator */}
              {selectedPatient && (
                <div className="mt-3 flex items-center gap-2">
                  <span className="text-sm text-gray-600">
                    Showing results for:
                  </span>
                  <span className="flex items-center gap-2 rounded-full bg-blue-100 px-3 py-1 text-sm font-medium text-blue-800">
                    {selectedPatient}
                    <button
                      onClick={clearSearch}
                      className="rounded-full p-0.5 hover:bg-blue-200"
                    >
                      <X size={12} />
                    </button>
                  </span>
                </div>
              )}
            </div>

            {/* Critical Patients Section - only show when not searching specific patient */}
            {!selectedPatient &&
              mockPatients.filter((p) => p.category === "CRITICAL").length >
              0 && (
                <section className="space-y-6">
                  <div className="flex items-center justify-between border-b border-gray-200 pb-2">
                    <h2 className="text-2xl font-semibold text-gray-800">
                      Critical Patients
                    </h2>
                    <span className="rounded-full bg-red-100 px-3 py-1 text-sm font-medium text-red-800">
                      {criticalPatients} critical
                    </span>
                  </div>
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    {mockPatients
                      .filter((p) => p.category === "CRITICAL")
                      .map((patient) => renderPatientCard(patient))}
                  </div>
                </section>
              )}

            {/* All Patients Section */}
            <section className="space-y-6">
              <div className="border-b border-gray-200 pb-2">
                <h2 className="text-2xl font-semibold text-gray-800">
                  {selectedPatient
                    ? `Search Results (${filteredPatients.length})`
                    : `All Patients (${filteredPatients.length})`}
                </h2>
              </div>

              {filteredPatients.length === 0 ? (
                <div className="rounded-lg border border-gray-200 bg-white p-6 text-center">
                  <p className="text-gray-500">
                    No patients found matching your criteria.
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  {filteredPatients.map((patient) => renderPatientRow(patient))}
                </div>
              )}
            </section>
          </div>
        );

      case "appointments":
        window.location.href = "/doctor/appointments";
        return null;

      case "reports":
        return (
          <div className="w-full p-8">
            <h2 className="mb-2 text-3xl font-bold text-gray-800">
              Medical Reports
            </h2>
            <p className="mb-6 text-gray-500">
              View and generate patient reports
            </p>
            <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
              <p className="text-gray-600">
                Report generation system coming soon
              </p>
            </div>
          </div>
        );
      case "settings":
        return (
          <div className="w-full p-8">
            <h2 className="mb-2 text-3xl font-bold text-gray-800">Settings</h2>
            <p className="mb-6 text-gray-500">
              Manage your account and preferences
            </p>
            <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
              <p className="text-gray-600">Settings panel coming soon</p>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  const menuItems = [
    { id: "patients", label: "My Patients", icon: Users },
    { id: "appointments", label: "Appointments", icon: Calendar },
    { id: "reports", label: "Reports", icon: FileText },
    { id: "settings", label: "Settings", icon: Settings },
  ];

  return (
    <div className="flex min-h-screen bg-gray-50">
      <aside className="fixed flex h-full w-64 flex-col justify-between bg-blue-700 p-6 text-white">
        <div>
          <div className="mb-8">
            <h1 className="text-xl font-bold text-white">Doctor Dashboard</h1>
            <p className="text-sm text-blue-200">Medical Portal</p>
          </div>
          <nav className="space-y-1">
            {menuItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex w-full items-center gap-3 rounded-lg p-3 text-left transition-colors ${activeTab === item.id
                  ? "bg-blue-600/90 font-medium text-white"
                  : "text-blue-100 hover:bg-blue-600/50"
                  }`}
              >
                <item.icon
                  size={18}
                  className={
                    activeTab === item.id ? "text-white" : "text-blue-200"
                  }
                />
                <span>{item.label}</span>
              </button>
            ))}
          </nav>
        </div>

        <div className="mt-auto border-t border-blue-600 pt-4">
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-lg p-3 text-left text-blue-100 transition-colors hover:bg-red-500/90 hover:text-white"
          >
            <LogOut size={18} />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      <main className="ml-64 flex-1 overflow-y-auto">{renderContent()}</main>
    </div>
  );
};

export default DoctorDashboard;
