"use client";

import { FcGoogle } from "react-icons/fc";
import { useSession, signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { PatientSignInForm } from "~/app/_components/PatientSignInForm";

export default function SignInPage() {
  const { status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "authenticated") {
      router.push("/dashboard");
    }
  }, [status, router]);

  return (
    <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-100 via-white to-green-100 px-4">
      <div className="w-full max-w-md rounded-2xl bg-white/80 p-6 shadow-2xl backdrop-blur-lg">
        <h1 className="mb-4 text-center text-3xl font-bold text-blue-700"> Patient Login </h1>

        <PatientSignInForm />


        <p className="mt-6 text-center text-sm text-gray-700">
          Don&apos;t have an account?{" "}
          <span
            onClick={() => router.push("/auth/register")}
            className="cursor-pointer text-blue-600 hover:underline"
          >
            Register
          </span>
        </p>
      </div>
    </main>
  );
}

