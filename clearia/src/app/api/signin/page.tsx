// app/signin/page.tsx
import { PatientSignInForm } from "~/components/PatientSignInForm";
import { auth } from "~/server/auth";
import { redirect } from "next/navigation";

export default async function SignInPage() {
  // Check if user is already logged in
  const session = await auth();
  
  if (session?.user) {
    redirect("/dashboard"); // Redirect to dashboard if already logged in
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-[#2e026d] to-[#15162c] p-4">
      <div className="container flex flex-col items-center justify-center gap-12 px-4 py-16">
        <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-[3rem]">
          <span className="text-[hsl(280,100%,70%)]">Clearia</span> Patient Portal
        </h1>
        
        <PatientSignInForm />
        
        <div className="text-center text-white">
          <p className="text-sm">
            Staff members please sign in through the admin portal.
          </p>
        </div>
      </div>
    </main>
  );
}
