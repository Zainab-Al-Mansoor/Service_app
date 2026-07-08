'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '@/lib/api-client';
import { useAuth } from '@/hooks/use-auth';
import { format } from 'date-fns';
import { CheckCircle2, XCircle, Clock, AlertCircle, CalendarDays, User, Loader2, Sparkles, Filter, ChevronDown } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

const statusConfig: Record<string, { bg: string; text: string; icon: any; border: string }> = {
  pending: { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200', icon: AlertCircle },
  accepted: { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200', icon: CheckCircle2 },
  rejected: { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200', icon: XCircle },
  in_progress: { bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200', icon: Clock },
  completed: { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200', icon: CheckCircle2 },
  cancelled: { bg: 'bg-slate-50', text: 'text-slate-700', border: 'border-slate-200', icon: XCircle },
};

export default function ProviderBookingsPage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);
  const [selectedBooking, setSelectedBooking] = useState<any>(null);

  const { data: bookings = [], isLoading } = useQuery({
    queryKey: ['provider-bookings', selectedStatus],
    queryFn: async () => (await apiClient.getBookings({ status: selectedStatus || undefined })).data?.bookings || [],
    enabled: !!user,
  });

  const updateMutation = useMutation({
    mutationFn: (data: { id: string; status: string }) => apiClient.updateBookingStatus(data.id, data.status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['provider-bookings'] });
      setSelectedBooking(null);
      toast.success('Booking status updated!');
    },
  });

  return (
    <div className="space-y-8 max-w-5xl animate-in fade-in duration-500">
      <div className="flex justify-between items-center bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
        <div>
          <h1 className="text-3xl font-extrabold text-[#0F172A]">Bookings Management</h1>
          <p className="text-slate-500">Manage your active, pending, and completed service requests</p>
        </div>
        <Select onValueChange={(v) => setSelectedStatus(v === 'all' ? null : v)} value={selectedStatus || 'all'}>
          <SelectTrigger className="w-48 rounded-2xl h-12 bg-slate-50 border-none font-bold text-[#0F172A]">
            <Filter className="w-4 h-4 mr-2" />
            <SelectValue placeholder="Status Filter" />
          </SelectTrigger>
          <SelectContent className="rounded-2xl">
            {['all', 'pending', 'accepted', 'in_progress', 'completed', 'cancelled'].map(s => (
              <SelectItem key={s} value={s} className="capitalize font-medium">{s.replace('_', ' ')}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <div className="flex justify-center p-20"><Loader2 className="animate-spin w-10 h-10 text-[#E28557]" /></div>
      ) : bookings.length === 0 ? (
        <Card className="rounded-3xl border-dashed border-2 border-slate-200 shadow-none py-20 text-center bg-transparent">
          <Sparkles className="w-12 h-12 text-slate-300 mx-auto mb-4" />
          <h3 className="font-bold text-lg text-slate-400">No bookings available</h3>
        </Card>
      ) : (
        <div className="grid gap-4">
          {bookings.map((booking: any) => (
            <BookingRow key={booking.id} booking={booking} onAction={(id, status) => updateMutation.mutate({ id, status })} onReject={setSelectedBooking} />
          ))}
        </div>
      )}
    </div>
  );
}

function BookingRow({ booking, onAction, onReject }: any) {
  const config = statusConfig[booking.status] || statusConfig.pending;
  const Icon = config.icon;

  return (
    <Card className="rounded-3xl border border-slate-100 p-6 shadow-sm hover:shadow-lg transition-all duration-300 group">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-5">
          <div className={cn("w-16 h-16 rounded-2xl flex items-center justify-center border", config.bg, config.border, config.text)}>
            <Icon className="w-7 h-7" />
          </div>
          <div>
            <h3 className="font-extrabold text-lg text-[#0F172A]">{booking.service?.name}</h3>
            <div className="flex items-center gap-4 text-sm text-slate-500 mt-1">
              <span className="flex items-center gap-1.5"><CalendarDays className="w-4 h-4" /> {format(new Date(booking.scheduled_date), 'MMM dd')}</span>
              <span className="flex items-center gap-1.5"><Clock className="w-4 h-4" /> {booking.scheduled_time}</span>
              <span className="flex items-center gap-1.5 font-bold text-[#E28557]">${booking.price || '0'}</span>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-6">
          <div className="text-right mr-4">
            <p className="text-[10px] uppercase tracking-widest font-extrabold text-slate-400">Customer</p>
            <p className="font-bold text-[#0F172A] flex items-center justify-end gap-1"><User className="w-3 h-3" />{booking.customer?.full_name}</p>
          </div>
          
          <div className="flex gap-2">
            {booking.status === 'pending' && (
              <>
                <Button size="sm" className="rounded-xl bg-[#0F172A] hover:bg-[#1a2642] px-6" onClick={() => onAction(booking.id, 'accepted')}>Accept</Button>
                <Button size="sm" variant="ghost" className="rounded-xl text-red-500 hover:bg-red-50 px-6" onClick={() => onReject(booking)}>Reject</Button>
              </>
            )}
            {booking.status === 'accepted' && <Button size="sm" className="rounded-xl bg-[#E28557] hover:bg-[#d4784d] px-6" onClick={() => onAction(booking.id, 'in_progress')}>Start Service</Button>}
            {booking.status === 'in_progress' && <Button size="sm" className="rounded-xl bg-emerald-600 hover:bg-emerald-700 px-6" onClick={() => onAction(booking.id, 'completed')}>Mark Complete</Button>}
          </div>
        </div>
      </div>
    </Card>
  );
}