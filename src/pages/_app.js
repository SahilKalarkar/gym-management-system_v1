'use client';

import "@/styles/globals.css";
import { useRouter } from 'next/router';
import AdminApp from './admin/_app';

export default function App({ Component, pageProps }) {
  const router = useRouter();
  const { pathname } = router;

  // Admin pages that need sidebar EXCEPT login & index
  const adminPagesWithLayout = [
    '/admin/dashboard',
    '/admin/members',
    '/admin/classes',
    '/admin/payments',
    '/admin/trainers',
    '/admin/settings'
  ];

  if (adminPagesWithLayout.includes(pathname)) {
    return <AdminApp Component={Component} pageProps={pageProps} />;
  }

  return <Component {...pageProps} />;
}
