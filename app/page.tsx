'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { PostGrid } from 'components/post-grid';
import { createClient } from '@/lib/supabase/client';

export default function HomePage() {
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    const checkAuthStatus = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setIsLoggedIn(!!session);
    };

    checkAuthStatus();
  }, [supabase]);

  return (
    <div className="max-w-4xl mx-auto mt-10">
      <h1 className="text-3xl font-bold mb-4">Welcome to Our Blog Platform</h1>
      <p className="mb-4">
        Explore the latest posts and engage with the community.
      </p>
      {!isLoggedIn ? (
        <>
          <button
            onClick={() => router.push("/auth/signup")}
            className="mr-4 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
          >
            Register
          </button>
          <button
            onClick={() => router.push("/auth/signin")}
            className="mr-4 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700"
          >
            Sign In
          </button>
        </>
      ) : (
        <>
          <button
            onClick={() => router.push("/user/profile/edit")}
            className="mr-4 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-yellow-600 hover:bg-yellow-700"
          >
            Edit Profile
          </button>
          <button
            onClick={() => {
              supabase.auth.signOut();
              router.push("/");
            }}
            className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700"
          >
            Logout
          </button>
        </>
      )}
      <button
        onClick={() => router.push("/admin/signin")}
        className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
      >
        Admin Sign In
      </button>
      <div className="w-full py-10">
        <PostGrid />
      </div>
    </div>
  );
}
