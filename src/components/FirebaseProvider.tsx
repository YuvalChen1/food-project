'use client';

import { useEffect, useState } from 'react';
import { getApps } from 'firebase/app';

export default function FirebaseProvider({ children }: { children: React.ReactNode }) {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Firebase is initialized in config.ts when imported
    setIsLoading(false);
  }, []);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return <>{children}</>;
}