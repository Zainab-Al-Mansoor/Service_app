'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '@/lib/api-client';
import { useRouter, useParams } from 'next/navigation';
import { useState } from 'react';
import { format, addDays } from 'date-fns';
import { Calendar as CalendarIcon, Clock, MapPin, ArrowLeft, Loader2, Sparkles, Star } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

const timeSlots = ['09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00'];

export default function BookServicePage() {
  const params = useParams();
  const router = useRouter();
  const serviceId = params.id as string;
  const queryClient = useQueryClient();

  const [selectedDate, setSelectedDate] = useState<Date>();
  const [selectedTime, setSelectedTime] = useState<string>();
  const [address, setAddress] = useState('');
  const [notes, setNotes] = useState('');

  const { data: service, isLoading } = useQuery({
    queryKey: ['service', serviceId],
    queryFn: async () => (await apiClient.getServiceById(serviceId)).data?.service,
  });

  const bookMutation = useMutation({
    mutationFn: async () => {
      return await apiClient.createBooking({
        service_id: serviceId,
        scheduled_date: format(selectedDate!, 'yyyy-MM-dd'),
        scheduled_time: selectedTime!,
        address,
        notes,
      });
    },
    onSuccess: () => {
      toast.success('Booking confirmed!');
      queryClient.invalidateQueries({ queryKey: ['customer-bookings'] });
      router.push('/customer/bookings');
    },
    onError: (e: any) => toast.error(e.message || 'Failed to book'),
  });

  if (isLoading) return <div className="flex justify-center p-20"><Loader2 className="animate-spin text-[#E28557]" /></div>;
  if (!service) return <div className="text-center p-10">Service not found.</div>;

  return (
    <div className="max-w-5xl mx-auto pb-20">
      <Button variant="ghost" className="mb-6 hover:bg-slate-100 rounded-full" onClick={() => router.back()}>
        <ArrowLeft className="w-4 h-4 mr-2" /> Back to Services
      </Button>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Left: Details Card */}
        <Card className="lg:col-span-1 rounded-3xl border-none shadow-sm h-fit">
          <div className="h-48 bg-[#E28557]/10 flex items-center justify-center rounded-t-3xl">
            <Sparkles className="w-16 h-16 text-[#E28557]/40" />
          </div>
          <CardContent className="p-6 space-y-4">
            <h2 className="text-2xl font-bold text-[#0F172A]">{service.name}</h2>
            <p className="text-sm text-slate-500">{service.description}</p>
            <div className="flex items-center gap-2 text-[#0F172A] font-bold">
               <Star className="w-4 h-4 fill-amber-400 text-amber-400" /> 4.9 Rating
            </div>
            <div className="pt-4 border-t border-slate-100 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#0F172A] text-white flex items-center justify-center text-xs font-bold">
                {service.provider?.full_name.charAt(0)}
              </div>
              <div>
                <p className="font-bold text-sm">{service.provider?.full_name}</p>
                <p className="text-[10px] text-green-600 font-bold uppercase">Verified Provider</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Right: Booking Form */}
        <Card className="lg:col-span-2 rounded-3xl border-none shadow-sm p-6">
          <h3 className="text-xl font-bold text-[#0F172A] mb-6">Complete your booking</h3>
          <div className="space-y-6">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Select Date *</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start rounded-xl h-12 border-slate-200">
                      <CalendarIcon className="mr-2 h-4 w-4 text-[#E28557]" />
                      {selectedDate ? format(selectedDate, 'PPP') : 'Pick a date'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0 rounded-2xl"><Calendar mode="single" selected={selectedDate} onSelect={setSelectedDate} disabled={(d) => d < new Date()} /></PopoverContent>
                </Popover>
              </div>
              <div className="space-y-2">
                <Label>Select Time *</Label>
                <Select onValueChange={setSelectedTime} value={selectedTime}>
                  <SelectTrigger className="h-12 rounded-xl border-slate-200"><SelectValue placeholder="Choose time" /></SelectTrigger>
                  <SelectContent className="rounded-xl"><div className="grid grid-cols-2 p-2">{timeSlots.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</div></SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Service Address *</Label>
              <div className="relative">
                <MapPin className="absolute left-3 top-4 h-4 w-4 text-[#E28557]" />
                <Input className="pl-10 h-12 rounded-xl border-slate-200" placeholder="Enter your full address" value={address} onChange={(e) => setAddress(e.target.value)} />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Additional Notes</Label>
              <Textarea className="rounded-xl border-slate-200" placeholder="Any special instructions?" value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} />
            </div>

            <div className="bg-slate-50 p-4 rounded-2xl flex justify-between items-center">
              <span className="font-bold text-[#0F172A]">Total Amount</span>
              <span className="text-2xl font-extrabold text-[#E28557]">${service.price}</span>
            </div>

            <Button 
              className="w-full bg-[#0F172A] hover:bg-black text-white rounded-xl h-14 font-bold text-lg"
              onClick={() => bookMutation.mutate()}
              disabled={bookMutation.isPending || !selectedDate || !selectedTime || !address}
            >
              {bookMutation.isPending ? <Loader2 className="animate-spin" /> : 'Confirm Booking'}
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}