'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth';
import apiClient from '@/lib/api-client';
import { User, Mail, Phone, Save, Camera, Shield, Calendar } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

export default function ProviderProfilePage() {
  const { user, refreshProfile } = useAuth();
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      setFullName(user.full_name || '');
      setPhone(user.phone || '');
    }
  }, [user]);

  const handleUpdate = async () => {
    setLoading(true);
    try {
      const result = await apiClient.updateProfile({ full_name: fullName, phone });
      if (result.error) toast.error(result.error.message);
      else {
        toast.success('Profile updated successfully');
        refreshProfile();
      }
    } catch { toast.error('Failed to update profile'); }
    setLoading(false);
  };

  if (!user) return null;

  return (
    <div className="max-w-3xl pb-20">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-[#0F172A]">Provider Profile</h1>
        <p className="text-slate-500 mt-1">Manage your professional information and settings</p>
      </div>

      <div className="grid gap-8">
        {/* Profile Identity Card */}
        <Card className="rounded-3xl border-none shadow-sm p-8 bg-[#0F172A] text-white">
          <div className="flex items-center gap-6">
            <div className="relative">
              <div className="w-24 h-24 rounded-full bg-white/10 flex items-center justify-center text-3xl font-bold border-2 border-white/20">
                {user.full_name?.charAt(0) || 'P'}
              </div>
              <button className="absolute bottom-0 right-0 bg-[#E28557] p-2 rounded-full border-4 border-[#0F172A]">
                <Camera className="w-4 h-4" />
              </button>
            </div>
            <div>
              <h3 className="text-2xl font-bold">{user.full_name}</h3>
              <p className="text-slate-400">{user.email}</p>
              <div className="mt-2 px-3 py-1 bg-emerald-500/20 text-emerald-400 rounded-full text-xs font-bold w-fit uppercase tracking-wider">
                {user.is_verified ? 'Verified Provider' : 'Pending Verification'}
              </div>
            </div>
          </div>
        </Card>

        {/* Update Form */}
        <Card className="rounded-3xl border-none shadow-sm">
          <CardContent className="p-8 space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label>Full Name</Label>
                <div className="relative">
                  <User className="absolute left-3 top-4 h-4 w-4 text-[#E28557]" />
                  <Input value={fullName} onChange={(e) => setFullName(e.target.value)} className="pl-10 h-12 rounded-xl" />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-4 h-4 w-4 text-slate-400" />
                  <Input value={user.email} disabled className="pl-10 h-12 rounded-xl bg-slate-50 cursor-not-allowed" />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Phone Number</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-4 h-4 w-4 text-[#E28557]" />
                <Input value={phone} onChange={(e) => setPhone(e.target.value)} className="pl-10 h-12 rounded-xl" placeholder="+1 234 567 8900" />
              </div>
            </div>

            <Button onClick={handleUpdate} disabled={loading} className="w-full bg-[#E28557] hover:bg-[#d4784d] h-14 rounded-xl font-bold text-lg mt-4">
              {loading ? 'Saving...' : 'Save Changes'}
            </Button>
          </CardContent>
        </Card>

        {/* Availability Info */}
        <Card className="rounded-3xl border-none shadow-sm p-8 flex items-center gap-6">
          <div className="bg-blue-50 p-4 rounded-2xl">
            <Calendar className="w-8 h-8 text-blue-600" />
          </div>
          <div>
            <h3 className="font-bold text-[#0F172A]">Weekly Availability</h3>
            <p className="text-slate-500 text-sm mt-1">Management features for your weekly schedule are currently being integrated. Please contact site administration for updates.</p>
          </div>
        </Card>
      </div>
    </div>
  );
}