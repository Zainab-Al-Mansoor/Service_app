'use client';

import { useAuth } from '@/hooks/use-auth';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect } from 'react';
import Link from 'next/link';
import { Wrench, CalendarDays, User, LogOut, Sparkles, Home, BarChart3 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const navigation = [
  { name: 'Dashboard', href: '/provider', icon: BarChart3 },
  { name: 'My Services', href: '/provider/services', icon: Wrench },
  { name: 'Bookings', href: '/provider/bookings', icon: CalendarDays },
  { name: 'Profile', href: '/provider/profile', icon: User },
];

export default function ProviderLayout({ children }: { children: React.ReactNode }) {
  const { user, loading, signOut } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!loading && (!user || (user.role !== 'provider' && user.role !== 'admin'))) {
      router.push(user ? '/' : '/login');
    }
  }, [user, loading, router]);

  // Loading state
  if (loading || !user) return (
    <div className="min-h-screen flex items-center justify-center bg-[#FDFBF7]">
      <Sparkles className="animate-spin w-8 h-8 text-[#E28557]" />
    </div>
  );

  // Dynamic header title helper
  const getPageTitle = () => {
    const segment = pathname.split('/').pop();
    if (segment === 'provider') return 'Dashboard';
    return segment?.replace('-', ' ') || 'Dashboard';
  };

  return (
    <div className="min-h-screen bg-[#FDFBF7] flex">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-slate-200 min-h-screen p-4 flex flex-col justify-between fixed left-0 top-0 z-50">
        <div>
          {/* Logo Section */}
          <div className="px-4 py-6 mb-4">
            <Link href="/" className="flex items-center gap-3">
              <div className="w-9 h-9  rounded-xl flex items-center justify-center">
                <img src="images/logo.png" alt="ServiceHub Logo" className="w-5 h-5 object-contain" />
              </div>
              <span className="text-xl font-bold text-[#0F172A]">Service<span className="text-[#E28557]">Hub</span></span>
            </Link>
          </div>

          <nav className="space-y-1">
            {navigation.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    'flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all',
                    isActive 
                      ? 'bg-[#0F172A] text-white shadow-lg' 
                      : 'text-slate-600 hover:bg-slate-100'
                  )}
                >
                  <item.icon className="w-5 h-5" />
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Footer Actions */}
        <div className="space-y-3 pb-2">
          <Link href="/" className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-slate-500 hover:text-[#0F172A]">
            <Home className="w-5 h-5" /> Back to Home
          </Link>
          <Button 
            variant="ghost" 
            className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50 rounded-xl" 
            onClick={signOut}
          >
            <LogOut className="w-4 h-4 mr-2" /> Sign Out
          </Button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 ml-64 min-h-screen flex flex-col">
        <header className="h-16 bg-white/80 backdrop-blur-sm border-b border-slate-200 flex items-center justify-between px-8 sticky top-0 z-40">
          <h2 className="text-lg font-bold text-[#0F172A] capitalize">
            {getPageTitle()}
          </h2>
          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <p className="text-xs text-slate-500">Provider Account</p>
              <p className="text-sm font-semibold text-[#0F172A]">{user.full_name}</p>
            </div>
            <div className="w-9 h-9 rounded-full bg-[#E28557] text-white flex items-center justify-center font-bold text-sm shadow-md">
              {user.full_name?.charAt(0).toUpperCase()}
            </div>
          </div>
        </header>
        
        <div className="p-8">
          {children}
        </div>
      </main>
    </div>
  );
}