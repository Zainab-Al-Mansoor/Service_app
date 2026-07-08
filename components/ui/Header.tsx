'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Menu, X, LayoutDashboard } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth'; // Yeh hook import karein

export default function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user, loading } = useAuth(); // User ka state check karne ke liye

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header className={`fixed top-0 w-full z-50 transition-all duration-300 ${isScrolled ? 'bg-white/80 backdrop-blur-lg border-b border-slate-200 py-3' : 'bg-transparent py-5'}`}>
      <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">
        
        {/* Logo Section */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-12 h-12 flex items-center justify-center">
            <img src="images/logo.png" alt="ServiceHub Logo" className="w-full h-full object-contain p-2 scale-150" />
          </div>
          <span className="text-2xl font-bold tracking-tighter text-slate-900">
            Service<span className="text-orange-600">Hub</span>
          </span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center bg-white/50 border border-slate-200/60 rounded-full px-2 py-1.5 shadow-sm">
          {['Services', 'Features', 'How It Works'].map((item) => (
            <a
              key={item}
              href={`#${item.toLowerCase().replace(/\s+/g, '-')}`}
              className="px-5 py-2 text-[15px] font-medium text-slate-600 hover:text-slate-900 transition-colors rounded-full hover:bg-slate-100"
            >
              {item}
            </a>
          ))}
        </nav>

        {/* Actions (Conditional Rendering) */}
        <div className="hidden md:flex items-center gap-3">
          {!loading && user ? (
            // Agar User Logged In hai
            <Link href={user.role === 'provider' ? '/provider' : '/customer'}>
              <Button className="bg-slate-900 hover:bg-slate-800 text-white rounded-full px-6 font-semibold shadow-xl shadow-slate-900/10">
                <LayoutDashboard className="w-4 h-4 mr-2" />
                Dashboard
              </Button>
            </Link>
          ) : (
            // Agar User Logged Out hai
            <>
              <Link href="/login" className="text-[15px] font-semibold text-slate-600 hover:text-slate-900 transition-colors">
                Sign In
              </Link>
              <Link href="/signup">
                <Button className="bg-slate-900 hover:bg-slate-800 text-white rounded-full px-6 font-semibold shadow-xl shadow-slate-900/10">
                  Get Started
                </Button>
              </Link>
            </>
          )}
        </div>

        {/* Mobile Toggle */}
        <button className="md:hidden p-2 text-slate-700" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
          {isMobileMenuOpen ? <X /> : <Menu />}
        </button>
      </div>
    </header>
  );
}