import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { FcGoogle } from "react-icons/fc";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { api } from "~/trpc/react"; // Adjust path if needed

export function PatientSignInForm() {
  const router = useRouter();
  const [generalError, setGeneralError] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: {
      email: "",
      password: "",
      medicalId: "",
    },
  });

  const verifyCredentials = api.user.verifyCredentials.useMutation();

  const onSubmit = async (data: {
    email: string;
    password: string;
    medicalId: string;
  }) => {
    setGeneralError("");
    try {
      const result = await verifyCredentials.mutateAsync({
        email: data.email,
        password: data.password,
        medicalId: data.medicalId,
      });

      if (!result.success) {
        setGeneralError("Invalid credentials");
        return;
      }

      const authResult = await signIn("credentials", {
        email: data.email,
        password: data.password,
        redirect: false,
      });

      if (authResult?.ok) {
        router.push("/dashboard");
      } else {
        setGeneralError("Failed to sign in. Please try again.");
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        setGeneralError(err.message ?? "An error occurred during sign in");
      } else {
        setGeneralError("An unexpected error occurred during sign in");
      }
    }
  };

  const handleGoogleLogin = async () => {
    await signIn("google");
    router.push("/dashboard");
  };

  return (
    <div className="w-full max-w-md rounded-2xl bg-white/80 p-4 shadow-2xl backdrop-blur-lg">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-2">
        <div>
          <label
            htmlFor="medicalId"
            className="block text-sm font-semibold text-gray-700"
          >
            Medical ID
          </label>
          <input
            id="medicalId"
            type="text"
            {...register("medicalId", { required: "Medical ID is required" })}
            className="mt-1 w-full rounded-md border border-gray-300 px-4 py-2 transition focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {errors.medicalId && (
            <p className="text-sm text-red-500">{errors.medicalId.message}</p>
          )}
        </div>

        <div>
          <label
            htmlFor="email"
            className="block text-sm font-semibold text-gray-700"
          >
            Email
          </label>
          <input
            id="email"
            type="email"
            {...register("email", {
              required: "Email is required",
              pattern: {
                value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                message: "Invalid email format",
              },
            })}
            className="mt-1 w-full rounded-md border border-gray-300 px-4 py-2 transition focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {errors.email && (
            <p className="text-sm text-red-500">{errors.email.message}</p>
          )}
        </div>

        <div>
          <label
            htmlFor="password"
            className="block text-sm font-semibold text-gray-700"
          >
            Password
          </label>
          <input
            id="password"
            type="password"
            {...register("password", {
              required: "Password is required",
              minLength: { value: 5, message: "Minimum 5 characters" },
            })}
            className="mt-1 w-full rounded-md border border-gray-300 px-4 py-2 transition focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {errors.password && (
            <p className="text-sm text-red-500">{errors.password.message}</p>
          )}
        </div>

        {generalError && (
          <p className="text-center text-sm text-red-600">{generalError}</p>
        )}

        <button
          type="submit"
          disabled={isSubmitting}
          className={`w-full rounded-md bg-blue-600 py-2 font-medium text-white transition ${
            isSubmitting ? "cursor-not-allowed opacity-50" : "hover:bg-blue-700"
          }`}
        >
          {isSubmitting ? "Logging in..." : "Login"}
        </button>
      </form>

      <div className="my-4 text-center text-gray-500">or</div>

      <button
        onClick={handleGoogleLogin}
        className="flex w-full items-center justify-center gap-2 rounded-md border py-2 transition hover:bg-gray-100"
      >
        <FcGoogle size={22} />
        <span className="text-sm font-medium">Sign in with Google</span>
      </button>
    </div>
  );
}
