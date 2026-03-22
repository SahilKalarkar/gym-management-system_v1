'use client';

import "@/styles/globals.css";
import { useRouter } from 'next/router';
import AdminLayout from "@/components/AdminLayout";

export default function App({ Component, pageProps }) {
  const router = useRouter();
  const { pathname } = router;

  // Admin pages that need sidebar EXCEPT login & index
  const adminPagesWithLayout = [
    '/admin/dashboard',
    '/admin/members',
    '/admin/classes',
    '/admin/payments',
    '/admin/equipments',
    '/admin/trainers',
    '/admin/settings'
  ];

  if (adminPagesWithLayout.includes(pathname)) {
    return (
      <AdminLayout>
        <Component {...pageProps} />
      </AdminLayout>
    );
  }

  return <Component {...pageProps} />;
}
