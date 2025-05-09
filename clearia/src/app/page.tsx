import { api, HydrateClient } from "~/trpc/server";
import HeroSection from "./_components/HeroSection";

export default async function Home() {
  void api.user.getLatest.prefetch();

  return (
    <HydrateClient>
      <div className="flex min-h-screen flex-col bg-[url('/assets/bg.jpg')] bg-cover bg-center">
        <HeroSection />
      </div>
    </HydrateClient>
  );
}

