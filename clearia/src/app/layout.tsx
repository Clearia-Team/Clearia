import { Inria_Sans } from 'next/font/google';
import "~/styles/globals.css";
import { SessionProvider } from "next-auth/react";
import { TRPCReactProvider } from "~/trpc/react";
import ClientHeaderWrapper from "~/app/_components/ClientHeaderWrapper";
import { type Metadata } from "next";

export const metadata: Metadata = {
  title: "Clearia",
  description: "A patient centric system",
  icons: [{ rel: "icon", url: "/assets/logo.png" }],
};

// Load Inria Sans font using next/font/google
const inriaSans = Inria_Sans({
  subsets: ["latin"],
  weight: ["400", "700"],
  display: "swap",
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inriaSans.className}>
      <body>
        <SessionProvider>
          <TRPCReactProvider>
            <ClientHeaderWrapper>
              {children}
            </ClientHeaderWrapper>
          </TRPCReactProvider>
        </SessionProvider>
      </body>
    </html>
  );
}

