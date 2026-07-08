'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Sparkles, Mail, Lock, Eye, EyeOff, User, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';

export default function SignupPage() {
  const searchParams = useSearchParams();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [role, setRole] = useState<'customer' | 'provider'>('customer');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const { signUp } = useAuth();
  const router = useRouter();

  useEffect(() => {
    const roleParam = searchParams.get('role');
    if (roleParam === 'provider') setRole('provider');
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await signUp(email, password, fullName, role);

    if (error) {
      toast.error(error.message || 'Failed to create account');
      setLoading(false);
    } else {
      toast.success('Account created successfully!');
      setTimeout(() => {
        router.push(role === 'provider' ? '/provider' : '/customer');
      }, 500);
    }
  };

  return (
    <main className="min-h-screen w-full flex font-sans bg-[#FDFBF7] text-[#0F172A]">
      
      {/* --- LEFT SIDE: Signup Form --- */}
      <div className="flex-1 flex items-center justify-center p-6 md:p-12 lg:p-16">
        <div className="w-full max-w-[440px] space-y-8">
          
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
            <h1 className="text-4xl font-bold tracking-tight">Create your account</h1>
            <p className="text-lg text-[#64748B]">Join CareSync to start booking services.</p>
          </div>

          {/* Role Toggle */}
          <div className="flex p-1 bg-slate-100 rounded-xl border border-slate-200">
            {['customer', 'provider'].map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => setRole(r as any)}
                className={`flex-1 py-3 text-sm font-semibold rounded-lg capitalize transition ${
                  role === r ? 'bg-white text-[#0F172A] shadow-sm' : 'text-[#64748B] hover:text-[#0F172A]'
                }`}
              >
                {r}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <label className="font-medium text-sm">Full Name</label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#64748B]" />
                <input 
                  type="text" placeholder="John Doe" value={fullName} 
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full pl-12 py-3.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-orange-200 focus:border-[#E28557] outline-none" required 
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="font-medium text-sm">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#64748B]" />
                <input 
                  type="email" placeholder="name@example.com" value={email} 
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-12 py-3.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-orange-200 focus:border-[#E28557] outline-none" required 
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="font-medium text-sm">Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#64748B]" />
                <input 
                  type={showPassword ? 'text' : 'password'} placeholder="••••••••" value={password} 
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-12 pr-12 py-3.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-orange-200 focus:border-[#E28557] outline-none" required 
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-[#64748B]">
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <button type="submit" disabled={loading} className="w-full flex items-center justify-center gap-3 bg-[#E28557] hover:bg-[#d1794f] text-white py-4 rounded-xl font-semibold transition text-lg">
              {loading ? 'Creating...' : 'Create Account'}
              <ArrowRight className="w-5 h-5" />
            </button>
          </form>

          <p className="text-center text-[#64748B]">
            Already have an account? <Link href="/login" className="font-semibold text-[#E28557]">Sign in</Link>
          </p>
        </div>
      </div>

      {/* --- RIGHT SIDE: Visual Showcase --- */}
      <div className="hidden lg:block flex-1 relative bg-slate-950 m-4 rounded-[36px] overflow-hidden">
        <img src="/images/img.jpeg" alt="Signup" className="absolute inset-0 w-full h-full object-cover opacity-50" />
        <div className="absolute bottom-0 left-0 right-0 p-16 z-20 text-white space-y-4">
          <h2 className="text-5xl font-extrabold">Start your journey with ServiceHub.</h2>
          <p className="text-xl text-slate-200">Join thousands of professionals and customers today.</p>
        </div>
      </div>
    </main>
  );
}