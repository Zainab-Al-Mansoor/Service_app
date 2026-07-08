'use client';

import { useAuth } from '@/hooks/use-auth';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Users,
  Wrench,
  CalendarDays,
  LayoutDashboard,
  LogOut,
  Sparkles,
  BarChart3,
  Home,
  ChevronRight,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const navigation = [
  { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
  { name: 'Users', href: '/admin/users', icon: Users },
  { name: 'Services', href: '/admin/services', icon: Wrench },
  { name: 'Bookings', href: '/admin/bookings', icon: CalendarDays },
  { name: 'Categories', href: '/admin/categories', icon: BarChart3 },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, loading, signOut } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!loading && (!user || user.role !== 'admin')) {
      router.push('/login');
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-100">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#EA580C]" />
      </div>
    );
  }

  if (!user || user.role !== 'admin') return null;

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-slate-900 text-white sticky top-0 z-50 shadow-md">
        <div className="flex h-16 items-center px-6">
          <div className="flex items-center gap-3">
        
            <span className="text-lg font-bold tracking-tight">Admin Panel</span>
          </div>
          
          <div className="ml-auto flex items-center gap-4">
            <div className="hidden md:block text-right">
              <p className="text-sm font-medium">{user.full_name || 'Admin'}</p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={signOut}
              className="text-slate-400 hover:text-white hover:bg-slate-800"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside className="w-64 bg-white border-r border-slate-200 min-h-[calc(100vh-64px)] sticky top-16 shadow-sm">
          <nav className="p-4 flex flex-col justify-between h-[calc(100vh-64px)]">
            <div className="space-y-1">
              {navigation.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={cn(
                      'group flex items-center justify-between px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200',
                      isActive
                        ? 'bg-slate-900 text-white shadow-lg'
                        : 'text-slate-600 hover:bg-orange-50 hover:text-[#EA580C]'
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <item.icon className={cn("w-5 h-5", isActive ? "text-[#EA580C]" : "text-slate-400 group-hover:text-[#EA580C]")} />
                      {item.name}
                    </div>
                    {isActive && <ChevronRight className="w-4 h-4 opacity-70" />}
                  </Link>
                );
              })}
            </div>

            {/* Bottom Link */}
            <div className="pb-4">
              <Link
                href="/"
                className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-slate-500 hover:bg-orange-50 hover:text-[#EA580C] transition-colors"
              >
                <Home className="w-5 h-5" />
                Back to Home
              </Link>
            </div>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-8 overflow-y-auto">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}