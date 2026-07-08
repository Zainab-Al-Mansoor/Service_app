'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth';
import apiClient from '@/lib/api-client';
import { format } from 'date-fns';
import { User, Mail, Phone, Save, Loader2, Shield, Camera, Calendar } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

export default function CustomerProfilePage() {
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
    } catch (err) { toast.error('Failed to update profile'); }
    setLoading(false);
  };

  if (!user) return null;

  return (
    <div className="max-w-2xl mx-auto pb-20">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-[#0F172A]">Profile Settings</h1>
        <p className="text-slate-500 mt-1">Manage your account information and preferences</p>
      </div>

      <div className="grid gap-8">
        {/* Profile Header Card */}
        <Card className="rounded-3xl border-none shadow-sm p-8 bg-[#0F172A] text-white">
          <div className="flex items-center gap-6">
            <div className="relative">
              <div className="w-24 h-24 rounded-full bg-white/10 flex items-center justify-center text-3xl font-bold border-2 border-white/20">
                {user.full_name?.charAt(0) || 'U'}
              </div>
              <button className="absolute bottom-0 right-0 bg-[#E28557] p-2 rounded-full border-4 border-[#0F172A]">
                <Camera className="w-4 h-4" />
              </button>
            </div>
            <div>
              <h3 className="text-2xl font-bold">{user.full_name}</h3>
              <p className="text-slate-400">{user.email}</p>
              <div className="mt-2 px-3 py-1 bg-white/10 rounded-full text-xs font-bold w-fit uppercase tracking-wider">
                {user.role}
              </div>
            </div>
          </div>
        </Card>

        {/* Edit Form */}
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
                <Label>Email (Locked)</Label>
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

            <div className="space-y-2">
              <Label>Member Since</Label>
              <div className="relative">
                <Calendar className="absolute left-3 top-4 h-4 w-4 text-slate-400" />
                <Input value={format(new Date(user.created_at), 'MMMM dd, yyyy')} disabled className="pl-10 h-12 rounded-xl bg-slate-50" />
              </div>
            </div>

            <Button onClick={handleUpdate} disabled={loading} className="w-full bg-[#0F172A] hover:bg-black h-14 rounded-xl font-bold text-lg mt-4">
              {loading ? <Loader2 className="animate-spin" /> : <> <Save className="w-4 h-4 mr-2" /> Save Changes </>}
            </Button>
          </CardContent>
        </Card>

        {/* Security Card */}
        <Card className="rounded-3xl border-none shadow-sm p-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="bg-red-50 p-3 rounded-2xl"><Shield className="w-6 h-6 text-red-500" /></div>
            <div>
              <p className="font-bold text-[#0F172A]">Security Settings</p>
              <p className="text-sm text-slate-500">Manage your password and account security</p>
            </div>
          </div>
          <Button variant="outline" className="rounded-xl">Update Password</Button>
        </Card>
      </div>
    </div>
  );
}