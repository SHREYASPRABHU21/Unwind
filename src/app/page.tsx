'use client';

import { useState, useEffect } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth, googleProvider } from '@/lib/firebase';
import { signInWithPopup } from 'firebase/auth';
import { useRouter } from 'next/navigation';

export default function LandingPage() {
  const [user, loading] = useAuthState(auth);
  const router = useRouter();

  useEffect(() => {
    if (user) {
      router.push('/dashboard');
    }
  }, [user, router]);

  const handleGoogleSignIn = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      // Store user in Supabase after Firebase auth
      await fetch('/api/auth/sync-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          uid: result.user.uid,
          email: result.user.email,
          name: result.user.displayName
        })
      });
    } catch (error) {
      console.error('Sign in error:', error);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4">
      {/* User Profile Picture - Top Right */}
      {user && (
        <div className="absolute top-6 right-6">
          <img 
            src={user.photoURL || ''} 
            alt="Profile"
            className="w-12 h-12 rounded-full border-2 border-white shadow-lg"
          />
        </div>
      )}

      {/* Hero Section */}
      <div className="text-center space-y-8 max-w-2xl">
        {/* Logo */}
        <div className="space-y-4">
          <h1 className="text-6xl font-bold text-slate-800 tracking-tight">
            Unwind
          </h1>
          <p className="text-2xl text-slate-600 font-medium">
            Your safe shore in a restless sea
          </p>
        </div>

        {/* Auth Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center mt-12">
          <button
            onClick={handleGoogleSignIn}
            className="bg-white text-slate-800 px-8 py-4 rounded-2xl font-semibold 
                     shadow-lg hover:shadow-xl transition-all duration-300
                     border-2 border-slate-200 hover:border-slate-300"
          >
            Continue with Google
          </button>
        </div>
      </div>
    </div>
  );
}
