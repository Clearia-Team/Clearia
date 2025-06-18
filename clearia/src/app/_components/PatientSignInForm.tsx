import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { FcGoogle } from "react-icons/fc";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { api } from "~/trpc/react"; // Adjust path if needed

export function PatientSignInForm() {
  const router = useRouter();
  const [generalError, setGeneralError] = useState("");
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotPasswordEmail, setForgotPasswordEmail] = useState("");
  const [forgotPasswordMessage, setForgotPasswordMessage] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const verifyCredentials = api.user.verifyCredentials.useMutation();
  const resetPassword = api.user.resetPassword.useMutation(); // Assuming you have this mutation

  const onSubmit = async (data: {
    email: string;
    password: string;
  }) => {
    setGeneralError("");
    try {
      const result = await verifyCredentials.mutateAsync({
        email: data.email,
        password: data.password,
      });

      if (!result.success) {
        setGeneralError("Invalid email or password");
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

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setForgotPasswordMessage("");
    
    if (!forgotPasswordEmail) {
      setForgotPasswordMessage("Please enter your email address");
      return;
    }

    try {
      await resetPassword.mutateAsync({ email: forgotPasswordEmail });
      setForgotPasswordMessage("Password reset instructions have been sent to your email");
      setForgotPasswordEmail("");
    } catch (err: unknown) {
      if (err instanceof Error) {
        setForgotPasswordMessage(err.message ?? "Failed to send reset email");
      } else {
        setForgotPasswordMessage("An error occurred. Please try again.");
      }
    }
  };

  if (showForgotPassword) {
    return (
      <div className="w-full max-w-md rounded-2xl bg-white/80 p-4 shadow-2xl backdrop-blur-lg">
        <div className="mb-4 text-center">
          <h2 className="text-xl font-semibold text-gray-800">Reset Password</h2>
          <p className="text-sm text-gray-600 mt-1">
            Enter your email address and we'll send you a link to reset your password
          </p>
        </div>

        <form onSubmit={handleForgotPassword} className="space-y-4">
          <div>
            <label
              htmlFor="forgotEmail"
              className="block text-sm font-semibold text-gray-700"
            >
              Email Address
            </label>
            <input
              id="forgotEmail"
              type="email"
              value={forgotPasswordEmail}
              onChange={(e) => setForgotPasswordEmail(e.target.value)}
              className="mt-1 w-full rounded-md border border-gray-300 px-4 py-2 transition focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter your email"
              required
            />
          </div>

          {forgotPasswordMessage && (
            <p className={`text-center text-sm ${
              forgotPasswordMessage.includes("sent") 
                ? "text-green-600" 
                : "text-red-600"
            }`}>
              {forgotPasswordMessage}
            </p>
          )}

          <button
            type="submit"
            disabled={resetPassword.isLoading}
            className={`w-full rounded-md bg-blue-600 py-2 font-medium text-white transition ${
              resetPassword.isLoading 
                ? "cursor-not-allowed opacity-50" 
                : "hover:bg-blue-700"
            }`}
          >
            {resetPassword.isLoading ? "Sending..." : "Send Reset Link"}
          </button>
        </form>

        <div className="mt-4 text-center">
          <button
            onClick={() => {
              setShowForgotPassword(false);
              setForgotPasswordMessage("");
              setForgotPasswordEmail("");
            }}
            className="text-sm text-blue-600 hover:text-blue-800 transition"
          >
            ← Back to Sign In
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md rounded-2xl bg-white/80 p-4 shadow-2xl backdrop-blur-lg">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
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

      <div className="mt-3 text-center">
        <button
          onClick={() => setShowForgotPassword(true)}
          className="text-sm text-blue-600 hover:text-blue-800 transition"
        >
          Forgot your password?
        </button>
      </div>

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
