"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";

const Adminlogin = () => {
  const router = useRouter();
  const [generalError, setGeneralError] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm();

  const networkdelay = (ms: number) => {
    return new Promise((resolve) => setTimeout(resolve, ms));
  };

  const onSubmit = async (data: any) => {
    setGeneralError(""); // clear previous error
    await networkdelay(1000); // simulate network delay

    // Simulated login check
    if (
      data.email === "admin123@hospital.com" &&
      data.password === "admin123" &&
      data.id === "hospital123"
    ) {
      router.push("/admin/dashboard");
    } else {
      setGeneralError("Invalid Credentials, please recheck!");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 px-6">
      <h2 className="text-4xl font-bold text-blue-600 mb-4">Login</h2>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="bg-white shadow-md rounded-lg p-6 w-full max-w-md space-y-4"
      >
        <input
          type="email"
          defaultValue={"admin123@hospital.com"}
          placeholder="Email"
          className="w-full p-3 border rounded"
          {...register("email", {
            required: "Email is required",
            minLength: { value: 5, message: "Email must be at least 5 characters" },
            maxLength: { value: 50, message: "Email must be less than 50 characters" },
            pattern: {
              value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
              message: "Invalid email format",
            },
          })}
        />
        {errors.email && <p className="text-red-500">{errors.email.message}</p>}

        <input
          type="password"
          placeholder="Password"
          defaultValue={"admin123"}
          className="w-full p-3 border rounded"
          {...register("password", {
            required: "Password is required",
            minLength: { value: 5, message: "Password must be at least 5 characters" },
            maxLength: { value: 20, message: "Password must be less than 20 characters" },
          })}
        />
        {errors.password && <p className="text-red-500">{errors.password.message}</p>}

        <input
          type="text"
          placeholder="Hospital ID"
          defaultValue={"hospital123"}
          className="w-full p-3 border rounded"
          {...register("id", {
            required: "Hospital ID is required",
            minLength: { value: 3, message: "Hospital ID must be at least 3 characters" },
          })}
        />
        {errors.id && <p className="text-red-500">{errors.id.message}</p>}

        <button
          disabled={isSubmitting}
          type="submit"
          className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700"
        >
          {isSubmitting ? "Logging in..." : "Login"}
        </button>

        {generalError && <p className="text-red-500 mt-2">{generalError}</p>}
      </form>

      <p className="mt-4">
        Don't have an account?{" "}
        <span
          onClick={() => router.push("/auth/signup")}
          className="text-blue-500 hover:cursor-pointer"
        >
          Register
        </span>
      </p>
    </div>
  );
};

export default Adminlogin;


