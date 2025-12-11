'use client';

import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { LogOut, User } from 'lucide-react';
import { useEffect, useState, useMemo } from 'react';

export default function TopBar() {
  const router = useRouter();
  const [email, setEmail] = useState<string>('');
  // Memoize supabase client to prevent recreating on every render
  const supabase = useMemo(() => createClient(), []);

  useEffect(() => {
    let mounted = true;
    
    const getUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (mounted && user) {
        setEmail(user.email || '');
      }
    };
    
    getUser();
    
    return () => {
      mounted = false;
    };
  }, []); // Empty dependency array - only run once

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/');
    router.refresh();
  };

  return (
    <div className="flex h-16 items-center justify-between border-b border-gray-200 bg-white px-6">
      <div className="flex items-center space-x-4">
        <User className="h-5 w-5 text-gray-500" />
        <span className="text-sm text-gray-700">{email || 'Loading...'}</span>
      </div>
      <button
        onClick={handleLogout}
        className="flex items-center space-x-2 rounded-lg px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100"
      >
        <LogOut className="h-4 w-4" />
        <span>Logout</span>
      </button>
    </div>
  );
}



