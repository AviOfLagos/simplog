'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';

export default function Navbar() {
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
    <nav className="bg-gray-800 p-4">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <div className="text-white text-lg font-bold cursor-pointer" onClick={() => router.push('/')}>
          Blog Platform
        </div>
        <div>
          {!isLoggedIn ? (
            <>
              <button
                onClick={() => router.push("/auth/signup")}
                className="mr-4 text-white"
              >
                Register
              </button>
              <button
                onClick={() => router.push("/auth/signin")}
                className="text-white"
              >
                Sign In
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => router.push("/user/profile/edit")}
                className="mr-4 text-white"
              >
                Edit Profile
              </button>
              <button
                onClick={() => {
                  supabase.auth.signOut();
                  router.push("/");
                }}
                className="text-white"
              >
                Logout
              </button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
