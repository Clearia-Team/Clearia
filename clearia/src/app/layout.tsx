import { Inria_Sans } from 'next/font/google';
import "~/styles/globals.css";
import { SessionProvider } from "next-auth/react";
import { TRPCReactProvider } from "~/trpc/react";
import ClientHeaderWrapper from "~/app/_components/ClientHeaderWrapper"; // ✅ Import it
import { type Metadata } from "next";

export const metadata: Metadata = {
  title: "Clearia",
  description: "A patient centric system",
  icons: [{ rel: "icon", url: "/assets/logo.png" }],
};

const inria = Inria_Sans({
  subsets: ['latin'],
  weight: ['400', '700'],
});

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={inria.className}>
      <body>
        <SessionProvider>
          <TRPCReactProvider>
            <ClientHeaderWrapper> {/* 👈 Header wrapper here */}
              {children}
            </ClientHeaderWrapper>
          </TRPCReactProvider>
        </SessionProvider>
      </body>
    </html>
  );
}

