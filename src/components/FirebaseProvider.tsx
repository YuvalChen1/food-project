'use client';

import { useEffect, useState } from 'react';
import { getApps } from 'firebase/app';

export default function FirebaseProvider({ children }: { children: React.ReactNode }) {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    try {
      // Check if Firebase is initialized
      const apps = getApps();
      if (apps.length === 0) {
        throw new Error('Firebase not initialized');
      }
      
      // Verify environment variables
      const requiredVars = [
        'NEXT_PUBLIC_FIREBASE_API_KEY',
        'NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN',
        'NEXT_PUBLIC_FIREBASE_PROJECT_ID'
      ];
      
      const missingVars = requiredVars.filter(varName => !process.env[varName]);
      if (missingVars.length > 0) {
        throw new Error(`Missing environment variables: ${missingVars.join(', ')}`);
      }

      setIsLoading(false);
    } catch (err) {
      console.error('Firebase initialization error:', err);
      setError(err instanceof Error ? err.message : 'Failed to initialize Firebase');
    }
  }, []);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Initialization Error</h1>
          <p className="text-red-600">{error}</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}