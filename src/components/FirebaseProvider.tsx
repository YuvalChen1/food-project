'use client';

import { useEffect, useState } from 'react';

export default function FirebaseProvider({ children }: { children: React.ReactNode }) {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [debugInfo, setDebugInfo] = useState<any>(null);

  useEffect(() => {
    // More detailed environment variable checking
    const envVars = {
      apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
      authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
      messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
      appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
    };

    // Save debug info
    setDebugInfo({
      hasEnvVars: {
        apiKey: !!envVars.apiKey,
        authDomain: !!envVars.authDomain,
        projectId: !!envVars.projectId,
        storageBucket: !!envVars.storageBucket,
        messagingSenderId: !!envVars.messagingSenderId,
        appId: !!envVars.appId
      },
      envVarValues: {
        apiKey: envVars.apiKey ? `${envVars.apiKey.slice(0, 5)}...` : 'missing',
        authDomain: envVars.authDomain || 'missing',
        projectId: envVars.projectId || 'missing',
        storageBucket: envVars.storageBucket || 'missing',
        messagingSenderId: envVars.messagingSenderId || 'missing',
        appId: envVars.appId ? `${envVars.appId.slice(0, 5)}...` : 'missing'
      }
    });

    // Check for missing required variables
    const missingVars = Object.entries(envVars)
      .filter(([key, value]) => !value)
      .map(([key]) => key);

    if (missingVars.length > 0) {
      setError(`Missing environment variables: ${missingVars.join(', ')}`);
    }

    setIsLoading(false);
  }, []);

  if (error || debugInfo) {
    return (
      <div className="flex min-h-screen items-center justify-center flex-col gap-4 p-4">
        {error && (
          <>
            <div className="text-red-500 font-bold">Error: {error}</div>
            <div className="text-sm text-gray-600">
              Please check your environment variables in Vercel
            </div>
          </>
        )}
        {debugInfo && (
          <div className="mt-4 p-4 bg-gray-100 rounded-lg text-sm">
            <pre className="whitespace-pre-wrap">
              {JSON.stringify(debugInfo, null, 2)}
            </pre>
          </div>
        )}
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
      </div>
    );
  }

  return <>{children}</>;
}