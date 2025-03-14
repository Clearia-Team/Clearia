import Link from "next/link";
import { IcuAdmissionForm } from "~/app/_components/icu";
import { api, HydrateClient } from "~/trpc/server";

export default async function Home() {
  const hello = await api.icu.hello({ text: "from tRPC" });

  void api.icu.getActiveAdmissions.prefetch();

  return (
    <HydrateClient>
      <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-[#2e026d] to-[#15162c] text-white">
        <div className="container flex flex-col items-center justify-center gap-12 px-4 py-16">
          
          <h1 className="text-2xl font-bold">ICU Admission System</h1>
          <p className="text-lg">{hello.greeting}</p>

          {/* ICU Admission Form */}
          <IcuAdmissionForm />

          {/* Optional: Add a link to view active ICU admissions */}
          <Link href="/icu-admissions">
            <span className="mt-4 inline-block rounded-lg bg-blue-600 px-6 py-2 font-semibold transition hover:bg-blue-700">
              View ICU Admissions
            </span>
          </Link>

        </div>
      </main>
    </HydrateClient>
  );
}

