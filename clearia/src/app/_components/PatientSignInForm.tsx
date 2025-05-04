"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { api } from "~/trpc/react"; // adjust if your trpc hook path is different

export function PatientSignInForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const verifyCredentials = api.user.verifyCredentials.useMutation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      // Step 1: Call your TRPC mutation to verify credentials
      const result = await verifyCredentials.mutateAsync({ email, password });
      if (!result.success) {
        setError("Invalid credentials");
        return;
      }

      // Step 2: Now authenticate via NextAuth to set session
      const authResult = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (authResult?.ok) {
        router.push("/dashboard");
      } else {
        setError("Failed to sign in. Please try again.");
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message ?? "An error occurred during sign in");
      } else {
        setError("An unexpected error occurred during sign in");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleRedirectToRegister = () => {
    router.push("/auth/register");
  };

  return (
    <div className="mx-auto w-full max-w-md rounded-lg bg-white p-6 shadow-md dark:bg-gray-800">
      <h2 className="mb-6 text-center text-2xl font-bold text-gray-800 dark:text-white">
        Patient Sign In
      </h2>
      <form onSubmit={handleSubmit} className="space-y-6">
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
          {isLoading ? "Signing in..." : "Sign in"}
        </button>
      </form>

      <div className="mt-6 text-center">
        <button
          onClick={handleRedirectToRegister}
          className="text-blue-600 dark:text-blue-400"
        >
          Contact the hospital to register
        </button>
      </div>
    </div>
  );
}

