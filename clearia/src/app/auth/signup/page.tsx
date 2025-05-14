"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "~/trpc/react"; // Adjust this path to match your setup

export default function PatientSignUpPage() {
  const router = useRouter();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [medicalId, setMedicalId] = useState("");
  const [allergies, setAllergies] = useState("");
  const [bloodType, setBloodType] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createPatientMutation = api.patient.createPatient.useMutation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      // Create the patient and account in one go
      await createPatientMutation.mutateAsync({
        firstName,
        lastName,
        dateOfBirth: new Date(dateOfBirth),
        medicalId,
        allergies,
        bloodType,
        email,
        password,
      });
      router.push("/auth/signin"); // Redirect to sign-in after successful registration
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message ?? "An error occurred during sign up");
      } else {
        setError("An unexpected error occurred during sign up");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="mx-auto w-full max-w-md rounded-lg bg-white p-6 shadow-md dark:bg-gray-800">
      <h2 className="mb-6 text-center text-2xl font-bold text-gray-800 dark:text-white">
        Create Patient Account
      </h2>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label
            htmlFor="firstName"
            className="block text-sm font-medium text-gray-700 dark:text-gray-200"
          >
            First Name
          </label>
          <input
            id="firstName"
            type="text"
            required
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            className="mt-1 block w-full rounded-md border px-3 py-2 dark:bg-gray-700 dark:text-white"
          />
        </div>

        <div>
          <label
            htmlFor="lastName"
            className="block text-sm font-medium text-gray-700 dark:text-gray-200"
          >
            Last Name
          </label>
          <input
            id="lastName"
            type="text"
            required
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            className="mt-1 block w-full rounded-md border px-3 py-2 dark:bg-gray-700 dark:text-white"
          />
        </div>

        <div>
          <label
            htmlFor="dateOfBirth"
            className="block text-sm font-medium text-gray-700 dark:text-gray-200"
          >
            Date of Birth
          </label>
          <input
            id="dateOfBirth"
            type="date"
            required
            value={dateOfBirth}
            onChange={(e) => setDateOfBirth(e.target.value)}
            className="mt-1 block w-full rounded-md border px-3 py-2 dark:bg-gray-700 dark:text-white"
          />
        </div>

        <div>
          <label
            htmlFor="medicalId"
            className="block text-sm font-medium text-gray-700 dark:text-gray-200"
          >
            Medical ID
          </label>
          <input
            id="medicalId"
            type="text"
            required
            value={medicalId}
            onChange={(e) => setMedicalId(e.target.value)}
            className="mt-1 block w-full rounded-md border px-3 py-2 dark:bg-gray-700 dark:text-white"
          />
        </div>

        <div>
          <label
            htmlFor="allergies"
            className="block text-sm font-medium text-gray-700 dark:text-gray-200"
          >
            Allergies (optional)
          </label>
          <input
            id="allergies"
            type="text"
            value={allergies}
            onChange={(e) => setAllergies(e.target.value)}
            className="mt-1 block w-full rounded-md border px-3 py-2 dark:bg-gray-700 dark:text-white"
          />
        </div>

        <div>
          <label
            htmlFor="bloodType"
            className="block text-sm font-medium text-gray-700 dark:text-gray-200"
          >
            Blood Type (optional)
          </label>
          <input
            id="bloodType"
            type="text"
            value={bloodType}
            onChange={(e) => setBloodType(e.target.value)}
            className="mt-1 block w-full rounded-md border px-3 py-2 dark:bg-gray-700 dark:text-white"
          />
        </div>

        <div>
          <label
            htmlFor="email"
            className="block text-sm font-medium text-gray-700 dark:text-gray-200"
          >
            Email
          </label>
          <input
            id="email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1 block w-full rounded-md border px-3 py-2 dark:bg-gray-700 dark:text-white"
          />
        </div>

        <div>
          <label
            htmlFor="password"
            className="block text-sm font-medium text-gray-700 dark:text-gray-200"
          >
            Password
          </label>
          <input
            id="password"
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-1 block w-full rounded-md border px-3 py-2 dark:bg-gray-700 dark:text-white"
          />
        </div>

        {error && (
          <div className="rounded-md bg-red-50 p-4 dark:bg-red-900/20">
            <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
          </div>
        )}

        <button
          type="submit"
          disabled={isLoading}
          className="w-full rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white"
        >
          {isLoading ? "Creating account..." : "Sign up"}
        </button>
      </form>

      <div className="mt-6 text-center">
        <p className="text-sm text-gray-600 dark:text-gray-300">
          Already have an account?{" "}
          <a href="/auth/signin" className="text-blue-600 dark:text-blue-400">
            Sign in
          </a>
        </p>
      </div>
    </div>
  );
}

