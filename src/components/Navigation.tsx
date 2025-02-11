'use client'

import { getAuth, signOut } from 'firebase/auth';
import { useRouter } from 'next/navigation';

interface NavigationProps {
  title?: string;
  logoutText?: string;
  isHebrew?: boolean;
  logoutButtonClass?: string;
}

const Navigation = ({ title, logoutText, isHebrew, logoutButtonClass }: NavigationProps) => {
  const router = useRouter();
  const auth = getAuth();

  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.push('/staff/login');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  return (
    <nav className="bg-white shadow">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <h1 className="text-2xl font-bold text-gray-900">
              {title}
            </h1>
          </div>
          <div className="flex items-center">
            <button
              onClick={handleLogout}
              className={`${logoutButtonClass ? logoutButtonClass : "ml-4 px-4 py-2 text-sm font-medium bg-red-500 text-white rounded-md hover:bg-red-600"}`}
            >
              {logoutText}
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;