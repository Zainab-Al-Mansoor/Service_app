'use client';

import { useState } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Sparkles, Mail, Lock, Eye, EyeOff, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { signIn } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { user: loggedInUser, error } = await signIn(email, password);

    if (error) {
      toast.error(error.message || 'Failed to sign in');
      setLoading(false);
    } else {
      toast.success('Welcome back!');
      if (loggedInUser?.role === 'admin') {
        router.push('/admin');
      } else if (loggedInUser?.role === 'provider') {
        router.push('/provider');
      } else {
        router.push('/customer');
      }
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen w-full flex font-sans bg-[#FDFBF7] text-[#0F172A]">
      {/* --- LEFT SIDE: Login Form --- */}
      <div className="flex-1 flex items-center justify-center p-6 md:p-12 lg:p-24">
        <div className="w-full max-w-[440px] space-y-10">
        <Link href="/" className="flex items-center gap-3 group">
  {/* Logo Icon Container */}
  <div className="w-12 h-12 rounded-2xl  flex items-center justify-center transition-transform group-hover:scale-105">
    <img 
      src="images/logo.png" 
      alt="ServiceHub Logo" 
      className="w-8 h-8 object-contain" 
    />
  </div>
  
  {/* Brand Name - Matching your screenshot style */}
  <span className="text-3xl font-extrabold tracking-tighter text-[#0F172A]">
    Service<span className="text-[#E28557]">Hub</span>
  </span>
</Link>

          <div className="space-y-2">
            <h1 className="text-4xl font-bold tracking-tight text-[#0F172A]">Welcome back</h1>
            <p className="text-lg text-[#64748B]">Sign in to continue to your CareSync account.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2.5">
              <label className="font-medium text-sm text-[#0F172A]">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#64748B]" />
                <input
                  type="email"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-12 pr-4 py-3.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-orange-200 focus:border-[#E28557] outline-none bg-white"
                  required
                />
              </div>
            </div>

            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <label className="font-medium text-sm text-[#0F172A]">Password</label>
                <Link href="/forgot-password" className="text-sm font-medium text-[#E28557]">Forgot password?</Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#64748B]" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-12 pr-12 py-3.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-orange-200 focus:border-[#E28557] outline-none bg-white"
                  required
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-[#64748B]">
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <button type="submit" disabled={loading} className="w-full flex items-center justify-center gap-3 bg-[#E28557] hover:bg-[#d1794f] text-white py-4 rounded-xl font-semibold transition text-lg">
              {loading ? 'Signing in...' : 'Sign In'}
              <ArrowRight className="w-5 h-5" />
            </button>
          </form>

          <p className="text-center text-base text-[#64748B]">
            Don't have an account? <Link href="/signup" className="font-semibold text-[#E28557]">Sign up →</Link>
          </p>
        </div>
      </div>

      {/* --- RIGHT SIDE: Image --- */}
      <div className="hidden lg:block flex-1 relative bg-slate-950 m-4 rounded-[36px] overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 to-transparent z-10" />
        <img src="/images/img.jpeg" alt="Login Hero" className="absolute inset-0 w-full h-full object-cover opacity-60" />
        <div className="absolute bottom-0 left-0 right-0 p-16 z-20 text-white space-y-4">
          <h2 className="text-5xl font-extrabold">Your trusted partner for home services.</h2>
          <p className="text-xl text-slate-200">Book vetted professionals for cleaning, repairs, and more.</p>
        </div>
      </div>
    </main>
  );
}