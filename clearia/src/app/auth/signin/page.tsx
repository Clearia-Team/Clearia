// app/signin/page.tsx
"use client";

import { useEffect } from "react";
import { useSession, signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { PatientSignInForm } from "~/app/_components/PatientSignInForm";

export default function SignInPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  // Redirect if already logged in
  useEffect(() => {
    if (status === "authenticated") {
      router.push("/dashboard");
    }
  }, [status, router]);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-[#2e026d] to-[#15162c] p-4">
      <div className="container flex flex-col items-center justify-center gap-12 px-4 py-16">
        <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-[3rem]">
          <span className="text-[hsl(280,100%,70%)]">Clearia</span> Patient Portal
        </h1>

        <PatientSignInForm />

        <div className="mt-6 flex flex-col items-center space-y-4">
          <button
            onClick={() => signIn("google")}
            className="rounded bg-white px-6 py-2 text-sm font-medium text-gray-900 shadow hover:bg-gray-200"
          >
            Sign in with Google
          </button>

          <p className="text-sm text-white text-center">
            Staff members please sign in through the <a href="/admin/login" className="underline">admin portal</a>.
          </p>
        </div>
      </div>
    </main>
  );
}

