'use client';

import { usePathname } from 'next/navigation';
import Header from './Header';

const hideHeaderRoutes = [
  '/admin/login',
  '/admin/dashboard',
  '/test',
  '/about',
  '/dashboard',
];

export default function ClientHeaderWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const shouldHideHeader = hideHeaderRoutes.some((route) => pathname.startsWith(route));

  return (
    <>
      {!shouldHideHeader && <Header />}
      {children}
    </>
  );
}
