'use client';

import { useAuth } from '@/hooks/use-auth';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect } from 'react';
import Link from 'next/link';
import { Home, CalendarDays, User, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const navigation = [
  { name: 'Services', href: '/customer', icon: Home },
  { name: 'My Bookings', href: '/customer/bookings', icon: CalendarDays },
  { name: 'Profile', href: '/customer/profile', icon: User },
];

export default function CustomerLayout({ children }: { children: React.ReactNode }) {
  const { user, loading, signOut } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!loading && (!user || user.role === 'admin')) {
      router.push('/login');
    }
  }, [user, loading, router]);

  if (loading || !user) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;

  return (
    <div className="min-h-screen bg-[#FDFBF7]">
      {/* Header - Styled with Brand Identity */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="flex items-center gap-3">
              <div className="w-9 h-9 flex items-center justify-center">
                 <img src="images/logo.png" alt="Logo" className="w-5 h-5 object-contain" />
              </div>
              <span className="text-xl font-bold text-[#0F172A]">Service<span className="text-[#E28557]">Hub</span></span>
            </Link>
            
            <div className="flex items-center gap-6">
              <div className="text-right">
                <p className="text-xs text-slate-500">Welcome</p>
                <p className="text-sm font-semibold text-[#0F172A]">Hi, {user.full_name || 'User'}</p>
              </div>
              <Button variant="ghost" size="sm" onClick={signOut} className="text-slate-600 hover:text-red-600">
                <LogOut className="w-4 h-4 mr-2" /> Sign Out
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Sidebar + Content */}
      <div className="flex">
        <aside className="w-64 bg-white border-r border-slate-200 min-h-[calc(100vh-64px)] p-4 flex flex-col justify-between">
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

          {/* Referral/Back Home Section */}
          <div className="space-y-3">
            <div className="p-4 bg-[#E28557]/10 rounded-xl">
               <p className="text-xs font-bold text-[#E28557] uppercase mb-1">Refer a friend</p>
               <p className="text-[11px] text-slate-700 mb-3">Get $20 credit for every friend who books.</p>
               <Button size="sm" className="w-full bg-[#E28557] hover:bg-[#d1794f] text-xs h-8">Invite</Button>
            </div>
            <Link href="/" className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-slate-500 hover:text-[#0F172A]">
              <Home className="w-5 h-5" /> Back to Home
            </Link>
          </div>
        </aside>

        <main className="flex-1 p-8 bg-[#FDFBF7]">{children}</main>
      </div>
    </div>
  );
}