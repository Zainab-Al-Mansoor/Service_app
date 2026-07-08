'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/hooks/use-auth';
import apiClient from '@/lib/api-client';
import { format } from 'date-fns';
import Link from 'next/link';
import { useState } from 'react';
import { toast } from 'sonner';
import { Calendar, Clock, MapPin, CheckCircle, XCircle, AlertCircle, Loader2, Star, Sparkles } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';

// Status Configuration
const statusConfig = {
  pending: { color: 'bg-amber-100 text-amber-700', icon: AlertCircle, label: 'Pending' },
  accepted: { color: 'bg-blue-100 text-blue-700', icon: CheckCircle, label: 'Confirmed' },
  rejected: { color: 'bg-red-100 text-red-700', icon: XCircle, label: 'Rejected' },
  in_progress: { color: 'bg-purple-100 text-purple-700', icon: Loader2, label: 'In Progress' },
  completed: { color: 'bg-emerald-100 text-emerald-700', icon: CheckCircle, label: 'Completed' },
  cancelled: { color: 'bg-slate-100 text-slate-700', icon: XCircle, label: 'Cancelled' },
};

export default function CustomerBookingsPage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [cancellationReason, setCancellationReason] = useState('');

  const { data: bookingsData, isLoading } = useQuery({
    queryKey: ['customer-bookings'],
    queryFn: async () => (await apiClient.getBookings()).data,
    enabled: !!user,
  });

  const bookings = bookingsData?.bookings || [];

  const cancelMutation = useMutation({
    mutationFn: async ({ bookingId, reason }: { bookingId: string; reason: string }) => 
      await apiClient.cancelBooking(bookingId, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customer-bookings'] });
      toast.success('Booking cancelled successfully');
      setCancellationReason('');
    },
    onError: () => toast.error('Failed to cancel booking'),
  });

  const activeBookings = bookings.filter((b: any) => ['pending', 'accepted', 'in_progress'].includes(b.status));
  const pastBookings = bookings.filter((b: any) => ['completed', 'cancelled', 'rejected'].includes(b.status));

  return (
    <div className="max-w-4xl mx-auto space-y-10 pb-20">
      <div>
        <h1 className="text-3xl font-extrabold text-[#0F172A]">My Bookings</h1>
        <p className="text-slate-500 mt-1">Manage your service requests and view history</p>
      </div>

      {isLoading ? (
        <div className="flex justify-center p-20"><Loader2 className="animate-spin text-[#E28557]" /></div>
      ) : bookings.length === 0 ? (
        <Card className="rounded-3xl border-none shadow-sm py-16 text-center">
          <Sparkles className="w-12 h-12 text-slate-300 mx-auto mb-4" />
          <h3 className="text-lg font-bold">No bookings yet</h3>
          <Link href="/customer"><Button className="mt-4 bg-[#0F172A] rounded-xl px-8">Browse Services</Button></Link>
        </Card>
      ) : (
        <div className="space-y-10">
          {/* Active Bookings */}
          {activeBookings.length > 0 && (
            <section>
              <h2 className="text-xl font-bold text-[#0F172A] mb-6">Active Bookings</h2>
              <div className="grid gap-4">
                {activeBookings.map((booking: any) => (
                  <BookingCard key={booking.id} booking={booking} onCancel={(id) => cancelMutation.mutate({ bookingId: id, reason: cancellationReason })} />
                ))}
              </div>
            </section>
          )}

          {/* Past Bookings */}
          {pastBookings.length > 0 && (
            <section>
              <h2 className="text-xl font-bold text-[#0F172A] mb-6">Past History</h2>
              <div className="grid gap-4 opacity-80">
                {pastBookings.map((booking: any) => (
                  <BookingCard key={booking.id} booking={booking} />
                ))}
              </div>
            </section>
          )}
        </div>
      )}
    </div>
  );
}

// Reusable Booking Card Component for Clean Code
function BookingCard({ booking, onCancel }: { booking: any; onCancel?: (id: string) => void }) {
  const config = statusConfig[booking.status as keyof typeof statusConfig];
  const StatusIcon = config.icon;
  const date = new Date(`${booking.scheduled_date}T${booking.scheduled_time}`);

  return (
    <Card className="rounded-3xl border-none shadow-sm p-6 hover:shadow-md transition-all">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex gap-4">
          <div className="w-14 h-14 rounded-2xl bg-[#E28557]/10 flex items-center justify-center">
            <Calendar className="w-6 h-6 text-[#E28557]" />
          </div>
          <div>
            <h3 className="font-bold text-lg">{booking.service?.name}</h3>
            <div className="flex items-center gap-4 mt-1 text-sm text-slate-500">
              <span className="flex items-center gap-1"><Clock className="w-4 h-4" /> {format(date, 'MMM dd, hh:mm a')}</span>
              <span className="flex items-center gap-1"><MapPin className="w-4 h-4" /> {booking.address.substring(0, 20)}...</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <Badge className={cn("px-4 py-1 rounded-full", config.color)}>
            <StatusIcon className="w-3 h-3 mr-1" /> {config.label}
          </Badge>
          <span className="font-extrabold text-lg">${booking.total_amount}</span>
          
          {onCancel && booking.status === 'pending' && (
            <Dialog>
              <DialogTrigger asChild><Button variant="outline" className="rounded-xl border-red-200 text-red-600">Cancel</Button></DialogTrigger>
              <DialogContent className="rounded-3xl"><DialogHeader><DialogTitle>Cancel Booking</DialogTitle></DialogHeader><Button variant="destructive" className="mt-4" onClick={() => onCancel(booking.id)}>Confirm Cancellation</Button></DialogContent>
            </Dialog>
          )}
        </div>
      </div>
    </Card>
  );
}