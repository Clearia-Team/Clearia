"use client";

import React, { useState } from "react";
import {
  ArrowLeft,
  User,
  Phone,
  MapPin,
  Calendar,
  Heart,
  Activity,
  Thermometer,
  Droplet,
  Clock,
  AlertTriangle,
  Pill,
  FileText,
  Edit,
  Save,
  X,
  Plus,
  Trash2,
  Download,
  Printer,
  Share2,
  Stethoscope,
  Bed,
  AlertCircle,
  CheckCircle,
  TrendingUp,
  TrendingDown,
  Minus
} from "lucide-react";

// Types
type PatientCategory = "INPATIENT" | "OUTPATIENT" | "CRITICAL";
type PatientStatus = "STABLE" | "CRITICAL" | "RECOVERING" | "EMERGENCY";

type VitalReading = {
  timestamp: Date;
  temperature: number;
  bloodPressure: string;
  heartRate: number;
  oxygenSaturation: number;
  respiratoryRate: number;
};

type MedicalNote = {
  id: string;
  date: Date;
  doctor: string;
  type: "CONSULTATION" | "PROCEDURE" | "OBSERVATION" | "TREATMENT";
  title: string;
  content: string;
};

type Patient = {
  id: string;
  name: string;
  age: number;
  gender: "MALE" | "FEMONE" | "OTHER";
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
  vitalHistory: VitalReading[];
  medicalNotes: MedicalNote[];
  labResults: any[];
};

// Mock patient data with extended information
const mockPatient: Patient = {
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
  address: "123 Main St, Shimla, HP 171001",
  emergencyContact: "+91 98765 43211",
  bloodGroup: "O+",
  allergies: ["Penicillin", "Sulfa drugs", "Latex"],
  currentMedications: ["Aspirin 75mg", "Metoprolol 50mg", "Atorvastatin 20mg", "Clopidogrel 75mg"],
  lastVisit: new Date("2024-06-12"),
  assignedDoctor: "Dr. Sharma",
  symptoms: ["Chest pain", "Shortness of breath", "Sweating", "Nausea"],
  vitals: {
    temperature: 98.6,
    bloodPressure: "140/90",
    heartRate: 85,
    oxygenSaturation: 95
  },
  vitalHistory: [
    {
      timestamp: new Date("2024-06-12T14:00:00"),
      temperature: 98.6,
      bloodPressure: "140/90",
      heartRate: 85,
      oxygenSaturation: 95,
      respiratoryRate: 18
    },
    {
      timestamp: new Date("2024-06-12T10:00:00"),
      temperature: 99.1,
      bloodPressure: "145/95",
      heartRate: 92,
      oxygenSaturation: 93,
      respiratoryRate: 20
    },
    {
      timestamp: new Date("2024-06-12T06:00:00"),
      temperature: 99.4,
      bloodPressure: "150/100",
      heartRate: 98,
      oxygenSaturation: 91,
      respiratoryRate: 22
    },
    {
      timestamp: new Date("2024-06-11T22:00:00"),
      temperature: 100.2,
      bloodPressure: "160/105",
      heartRate: 105,
      oxygenSaturation: 89,
      respiratoryRate: 24
    }
  ],
  medicalNotes: [
    {
      id: "N001",
      date: new Date("2024-06-12T14:30:00"),
      doctor: "Dr. Sharma",
      type: "CONSULTATION",
      title: "Daily Round - Stable Progress",
      content: "Patient showing signs of improvement. Chest pain reduced significantly. Vitals stabilizing. Continue current medication regimen. Monitor closely for next 24 hours."
    },
    {
      id: "N002",
      date: new Date("2024-06-11T08:00:00"),
      doctor: "Dr. Sharma",
      type: "PROCEDURE",
      title: "Cardiac Catheterization",
      content: "Successful PCI performed. Stent placed in LAD. Procedure completed without complications. Patient stable post-procedure."
    },
    {
      id: "N003",
      date: new Date("2024-06-10T23:45:00"),
      doctor: "Dr. Emergency",
      type: "OBSERVATION",
      title: "Emergency Admission",
      content: "Patient presented with severe chest pain, diaphoresis, and shortness of breath. ECG shows ST elevation in leads V2-V6. Troponin elevated. Diagnosed with STEMI."
    }
  ],
  labResults: []
};

const PatientDetail = () => {
  const [patient] = useState<Patient>(mockPatient);
  const [activeTab, setActiveTab] = useState("overview");
  const [isEditing, setIsEditing] = useState(false);
  const [newNote, setNewNote] = useState("");
  const [newNoteTitle, setNewNoteTitle] = useState("");
  const [showAddNote, setShowAddNote] = useState(false);

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const formatDateTime = (date: Date) => {
    return new Date(date).toLocaleString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getCategoryBadgeClasses = (category: PatientCategory) => {
    switch (category) {
      case "CRITICAL":
        return "bg-red-100 text-red-800 border-red-200";
      case "INPATIENT":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "OUTPATIENT":
        return "bg-green-100 text-green-800 border-green-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getStatusBadgeClasses = (status: PatientStatus) => {
    switch (status) {
      case "CRITICAL":
        return "bg-red-100 text-red-800 border-red-200";
      case "EMERGENCY":
        return "bg-red-100 text-red-800 border-red-200";
      case "STABLE":
        return "bg-green-100 text-green-800 border-green-200";
      case "RECOVERING":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getVitalTrend = (current: number, previous: number) => {
    if (current > previous) return { icon: TrendingUp, color: "text-red-500" };
    if (current < previous) return { icon: TrendingDown, color: "text-green-500" };
    return { icon: Minus, color: "text-gray-500" };
  };

  const addNote = () => {
    if (newNote.trim() && newNoteTitle.trim()) {
      // In real app, this would make API call
      console.log("Adding note:", { title: newNoteTitle, content: newNote });
      setNewNote("");
      setNewNoteTitle("");
      setShowAddNote(false);
    }
  };

  const handleBack = () => {
    // In real app, this would navigate back to dashboard
    console.log("Navigating back to dashboard");
  };

  const handlePrint = () => {
    window.print();
  };

  const renderOverview = () => (
    <div className="space-y-6">
      {/* Patient Info Card */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">{patient.name}</h2>
            <div className="flex items-center gap-4 text-gray-600">
              <span>ID: {patient.id}</span>
              <span>•</span>
              <span>{patient.age} years old</span>
              <span>•</span>
              <span>{patient.gender}</span>
              <span>•</span>
              <span>Blood Group: {patient.bloodGroup}</span>
            </div>
          </div>
          <div className="flex gap-2">
            <span className={`px-3 py-1 text-sm font-medium rounded-full border ${getCategoryBadgeClasses(patient.category)}`}>
              {patient.category}
            </span>
            <span className={`px-3 py-1 text-sm font-medium rounded-full border ${getStatusBadgeClasses(patient.status)}`}>
              {patient.status}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <h3 className="font-medium text-gray-800 mb-2">Contact Information</h3>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <Phone size={16} className="text-green-500" />
                  <span>{patient.contactNumber}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin size={16} className="text-blue-500" />
                  <span>{patient.address}</span>
                </div>
                <div className="flex items-center gap-2">
                  <AlertTriangle size={16} className="text-orange-500" />
                  <span>Emergency: {patient.emergencyContact}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <h3 className="font-medium text-gray-800 mb-2">Medical Information</h3>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <Calendar size={16} className="text-purple-500" />
                  <span>Admitted: {formatDate(patient.admissionDate)}</span>
                </div>
                {patient.icuNo && (
                  <div className="flex items-center gap-2">
                    <AlertCircle size={16} className="text-red-500" />
                    <span>ICU: {patient.icuNo} • Bed: {patient.bedNumber}</span>
                  </div>
                )}
                {patient.wardNo && !patient.icuNo && (
                  <div className="flex items-center gap-2">
                    <Bed size={16} className="text-blue-500" />
                    <span>Ward: {patient.wardNo} • Bed: {patient.bedNumber}</span>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <Stethoscope size={16} className="text-indigo-500" />
                  <span>Dr. {patient.assignedDoctor}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Current Diagnosis */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Current Diagnosis</h3>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <h4 className="font-medium text-red-800 mb-2">{patient.disease}</h4>
          <div className="space-y-2">
            <div>
              <span className="text-sm font-medium text-red-700">Symptoms:</span>
              <div className="flex flex-wrap gap-2 mt-1">
                {patient.symptoms.map((symptom, index) => (
                  <span key={index} className="bg-red-100 text-red-700 px-2 py-1 rounded text-sm">
                    {symptom}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Current Vitals */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Current Vitals</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-gradient-to-br from-red-50 to-red-100 border border-red-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <Thermometer className="text-red-500" size={20} />
              <span className="text-sm font-medium text-red-700">Temperature</span>
            </div>
            <div className="flex items-end gap-2">
              <span className="text-2xl font-bold text-red-800">{patient.vitals.temperature}</span>
              <span className="text-sm text-red-600 mb-1">°F</span>
            </div>
          </div>

          <div className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <Heart className="text-blue-500" size={20} />
              <span className="text-sm font-medium text-blue-700">Blood Pressure</span>
            </div>
            <div className="flex items-end gap-2">
              <span className="text-2xl font-bold text-blue-800">{patient.vitals.bloodPressure}</span>
              <span className="text-sm text-blue-600 mb-1">mmHg</span>
            </div>
          </div>

          <div className="bg-gradient-to-br from-green-50 to-green-100 border border-green-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <Activity className="text-green-500" size={20} />
              <span className="text-sm font-medium text-green-700">Heart Rate</span>
            </div>
            <div className="flex items-end gap-2">
              <span className="text-2xl font-bold text-green-800">{patient.vitals.heartRate}</span>
              <span className="text-sm text-green-600 mb-1">bpm</span>
            </div>
          </div>

          <div className="bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <Droplet className="text-purple-500" size={20} />
              <span className="text-sm font-medium text-purple-700">Oxygen Sat</span>
            </div>
            <div className="flex items-end gap-2">
              <span className="text-2xl font-bold text-purple-800">{patient.vitals.oxygenSaturation}</span>
              <span className="text-sm text-purple-600 mb-1">%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Allergies and Medications */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Allergies</h3>
          {patient.allergies && patient.allergies.length > 0 ? (
            <div className="space-y-2">
              {patient.allergies.map((allergy, index) => (
                <div key={index} className="flex items-center gap-2 bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                  <AlertTriangle className="text-yellow-600" size={16} />
                  <span className="text-yellow-800 font-medium">{allergy}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">No known allergies</p>
          )}
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Current Medications</h3>
          {patient.currentMedications && patient.currentMedications.length > 0 ? (
            <div className="space-y-2">
              {patient.currentMedications.map((medication, index) => (
                <div key={index} className="flex items-center gap-2 bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <Pill className="text-blue-600" size={16} />
                  <span className="text-blue-800">{medication}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">No current medications</p>
          )}
        </div>
      </div>
    </div>
  );

  const renderVitals = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Vital Signs History</h3>
        <div className="space-y-4">
          {patient.vitalHistory.map((reading, index) => {
            const prevReading = patient.vitalHistory[index + 1];
            return (
              <div key={index} className="border border-gray-200 rounded-lg p-4">
                <div className="flex justify-between items-center mb-3">
                  <span className="text-sm font-medium text-gray-600">
                    {formatDateTime(reading.timestamp)}
                  </span>
                  <span className="text-xs text-gray-500">
                    {index === 0 ? "Latest" : `${index + 1} readings ago`}
                  </span>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-1 mb-1">
                      <Thermometer size={16} className="text-red-500" />
                      {prevReading && (
                        (() => {
                          const trend = getVitalTrend(reading.temperature, prevReading.temperature);
                          return <trend.icon size={12} className={trend.color} />;
                        })()
                      )}
                    </div>
                    <div className="text-lg font-semibold text-gray-800">{reading.temperature}°F</div>
                    <div className="text-xs text-gray-500">Temperature</div>
                  </div>
                  
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-1 mb-1">
                      <Heart size={16} className="text-blue-500" />
                    </div>
                    <div className="text-lg font-semibold text-gray-800">{reading.bloodPressure}</div>
                    <div className="text-xs text-gray-500">Blood Pressure</div>
                  </div>
                  
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-1 mb-1">
                      <Activity size={16} className="text-green-500" />
                      {prevReading && (
                        (() => {
                          const trend = getVitalTrend(reading.heartRate, prevReading.heartRate);
                          return <trend.icon size={12} className={trend.color} />;
                        })()
                      )}
                    </div>
                    <div className="text-lg font-semibold text-gray-800">{reading.heartRate}</div>
                    <div className="text-xs text-gray-500">Heart Rate</div>
                  </div>
                  
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-1 mb-1">
                      <Droplet size={16} className="text-purple-500" />
                      {prevReading && (
                        (() => {
                          const trend = getVitalTrend(reading.oxygenSaturation, prevReading.oxygenSaturation);
                          return <trend.icon size={12} className={trend.color} />;
                        })()
                      )}
                    </div>
                    <div className="text-lg font-semibold text-gray-800">{reading.oxygenSaturation}%</div>
                    <div className="text-xs text-gray-500">O2 Saturation</div>
                  </div>
                  
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-1 mb-1">
                      <Activity size={16} className="text-indigo-500" />
                      {prevReading && (
                        (() => {
                          const trend = getVitalTrend(reading.respiratoryRate, prevReading.respiratoryRate);
                          return <trend.icon size={12} className={trend.color} />;
                        })()
                      )}
                    </div>
                    <div className="text-lg font-semibold text-gray-800">{reading.respiratoryRate}</div>
                    <div className="text-xs text-gray-500">Respiratory Rate</div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );

  const renderNotes = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-800">Medical Notes</h3>
        <button
          onClick={() => setShowAddNote(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
        >
          <Plus size={16} />
          Add Note
        </button>
      </div>

      {showAddNote && (
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <h4 className="font-medium text-gray-800 mb-4">Add New Note</h4>
          <div className="space-y-4">
            <input
              type="text"
              placeholder="Note title..."
              value={newNoteTitle}
              onChange={(e) => setNewNoteTitle(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <textarea
              placeholder="Write your note here..."
              value={newNote}
              onChange={(e) => setNewNote(e.target.value)}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <div className="flex gap-2">
              <button
                onClick={addNote}
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
              >
                <Save size={16} />
                Save Note
              </button>
              <button
                onClick={() => {
                  setShowAddNote(false);
                  setNewNote("");
                  setNewNoteTitle("");
                }}
                className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors flex items-center gap-2"
              >
                <X size={16} />
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-4">
        {patient.medicalNotes.map((note) => (
          <div key={note.id} className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h4 className="font-medium text-gray-800">{note.title}</h4>
                <div className="flex items-center gap-4 text-sm text-gray-500 mt-1">
                  <span>{formatDateTime(note.date)}</span>
                  <span>•</span>
                  <span>{note.doctor}</span>
                  <span>•</span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    note.type === "CONSULTATION" ? "bg-blue-100 text-blue-800" :
                    note.type === "PROCEDURE" ? "bg-purple-100 text-purple-800" :
                    note.type === "OBSERVATION" ? "bg-yellow-100 text-yellow-800" :
                    "bg-green-100 text-green-800"
                  }`}>
                    {note.type}
                  </span>
                </div>
              </div>
            </div>
            <p className="text-gray-700 leading-relaxed">{note.content}</p>
          </div>
        ))}
      </div>
    </div>
  );

  const tabs = [
    { id: "overview", label: "Overview", icon: User },
    { id: "vitals", label: "Vitals", icon: Activity },
    { id: "notes", label: "Medical Notes", icon: FileText }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={handleBack}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors flex items-center gap-2 text-gray-600 hover:text-gray-800"
            >
              <ArrowLeft size={20} />
              <span>Back to Dashboard</span>
            </button>
          </div>
          
          <div className="flex items-center gap-2">
            <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-600">
              <Download size={20} />
            </button>
            <button 
              onClick={handlePrint}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-600"
            >
              <Printer size={20} />
            </button>
            <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-600">
              <Share2 size={20} />
            </button>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white border-b border-gray-200 px-6">
        <nav className="flex space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === tab.id
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              <tab.icon size={18} />
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Content */}
      <div className="p-6">
        <div className="max-w-7xl mx-auto">
          {activeTab === "overview" && renderOverview()}
          {activeTab === "vitals" && renderVitals()}
          {activeTab === "notes" && renderNotes()}
        </div>
      </div>
    </div>
  );
};

export default PatientDetail;

