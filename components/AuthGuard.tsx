"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/lib/firebase"; 
import { Loader2 } from "lucide-react";

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Listen to the exact same Firebase auth state used in your AuthPage
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) {
        // Kick unauthenticated users back to the auth page
        router.push("/auth"); 
      } else {
        // Reveal the protected content for logged-in users
        setIsLoading(false); 
      }
    });

    return () => unsubscribe();
  }, [router]);

  // Show a seamless loading screen matching your dark theme while verifying
  if (isLoading) {
    return (
      <div className="min-h-screen w-full flex flex-col items-center justify-center bg-[#030303]">
        <Loader2 className="w-10 h-10 animate-spin text-amber-500 mb-4" />
        <p className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest animate-pulse">
          Verifying Session...
        </p>
      </div>
    );
  }

  // Render the protected pages if authenticated
  return <>{children}</>;
}