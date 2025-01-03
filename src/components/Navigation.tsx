'use client'

import { getAuth, signOut } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';

interface NavigationProps {
  title?: string;
  logoutText?: string;
  isHebrew?: boolean;
}

export default function Navigation({ title, logoutText, isHebrew }: NavigationProps) {
  const router = useRouter();
  const auth = getAuth();

  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.push('/staff/login');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <nav className="bg-white shadow-sm">
      <div className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 ${isHebrew ? 'rtl' : 'ltr'}`}>
        <div className="flex justify-between h-16 items-center">
          <h1 className="text-xl font-semibold">{title}</h1>
          <Button
            onClick={handleLogout}
            variant="ghost"
            size="sm"
          >
            {logoutText}
          </Button>
        </div>
      </div>
    </nav>
  );
} 