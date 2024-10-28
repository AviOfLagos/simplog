'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminPage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to the sign-in page
    router.push('/admin/signin');
  }, [router]);

  return null;
}
