'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import useAuthStore from '@/store/authStore';
import { Brain, Loader2 } from 'lucide-react';

export default function ProtectedRoute({ children, allowedRoles = [] }) {
  const router = useRouter();
  const { isAuthenticated, user, loading, _hasHydrated } = useAuthStore();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    // Wait for store to rehydrate from localStorage
    if (_hasHydrated) {
      if (!loading) {
        if (!isAuthenticated) {
          router.push('/login');
        } else if (allowedRoles.length > 0 && !allowedRoles.includes(user?.Role)) {
          router.push('/dashboard');
        } else {
          setIsChecking(false);
        }
      }
    }
  }, [_hasHydrated, isAuthenticated, user, loading, router, allowedRoles]);

  // Show loading state while checking authentication
  if (!_hasHydrated || loading || isChecking) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 via-white to-indigo-50">
        <div className="relative">
          {/* Animated background elements */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-32 h-32 bg-gradient-to-r from-blue-400/20 to-indigo-400/20 rounded-full blur-2xl animate-pulse"></div>
          </div>
          
          {/* Logo and spinner */}
          <div className="relative z-10 flex flex-col items-center gap-6">
            <div className="relative">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center shadow-xl shadow-blue-500/25 animate-pulse">
                <Brain className="w-10 h-10 text-white" />
              </div>
              <Loader2 className="w-8 h-8 text-blue-600 absolute -bottom-2 -right-2 animate-spin" />
            </div>
            <div className="text-center space-y-2">
              <p className="text-lg font-semibold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                Loading your profile...
              </p>
              <p className="text-sm text-gray-500">Please wait a moment</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Check role permissions
  if (allowedRoles.length > 0 && !allowedRoles.includes(user?.Role)) {
    return null;
  }

  return <>{children}</>;
}
