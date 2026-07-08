'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '@/lib/api-client';
import { format } from 'date-fns';
import {
  Search,
  MoreHorizontal,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  Eye,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { toast } from 'sonner';

// Updated theme config with #EA580C
const statusConfig: Record<string, { color: string; icon: any }> = {
  pending: { color: 'bg-orange-100 text-orange-700', icon: AlertCircle },
  accepted: { color: 'bg-blue-100 text-blue-700', icon: CheckCircle },
  rejected: { color: 'bg-red-100 text-red-700', icon: XCircle },
  in_progress: { color: 'bg-indigo-100 text-indigo-700', icon: Clock },
  completed: { color: 'bg-emerald-100 text-emerald-700', icon: CheckCircle },
  cancelled: { color: 'bg-slate-100 text-slate-700', icon: XCircle },
};

export default function AdminBookingsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);
  const [selectedBooking, setSelectedBooking] = useState<any | null>(null);
  const queryClient = useQueryClient();

  const { data: bookingsData, isLoading } = useQuery({
    queryKey: ['admin-bookings', searchQuery, selectedStatus],
    queryFn: async () => {
      const result = await apiClient.getBookings({
        status: selectedStatus || undefined,
      });
      return result.data?.bookings || [];
    },
  });

  const bookings = bookingsData || [];
  const filteredBookings = searchQuery
    ? bookings.filter((b: any) =>
        b.customer?.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        b.service?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        b.id.includes(searchQuery)
      )
    : bookings;

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      return await apiClient.updateBookingStatus(id, status);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-bookings'] });
      toast.success('Booking status updated successfully');
    },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Bookings Management</h1>
        <p className="text-slate-600 mt-1">View and manage all customer bookings</p>
      </div>

      {/* Filters */}
      <div className="flex gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Search by customer or service..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 focus-visible:ring-[#EA580C]"
          />
        </div>
        <Select
          onValueChange={(v) => setSelectedStatus(v === 'all' ? null : v)}
          value={selectedStatus || 'all'}
        >
          <SelectTrigger className="w-40 focus:ring-[#EA580C]">
            <SelectValue placeholder="All Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="accepted">Accepted</SelectItem>
            <SelectItem value="in_progress">In Progress</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Bookings Table */}
      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#EA580C]" />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Provider</TableHead>
                  <TableHead>Service</TableHead>
                  <TableHead>Date & Time</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-12"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredBookings.map((booking: any) => {
                  const config = statusConfig[booking.status] || statusConfig.pending;
                  const StatusIcon = config.icon;
                  return (
                    <TableRow key={booking.id} className="hover:bg-orange-50/30">
                      <TableCell className="font-mono text-xs text-slate-500">
                        {booking.id.slice(0, 8)}...
                      </TableCell>
                      <TableCell>
                        <p className="font-semibold text-slate-900">{booking.customer?.full_name || 'N/A'}</p>
                        <p className="text-xs text-slate-500">{booking.customer?.email}</p>
                      </TableCell>
                      <TableCell className="text-slate-600">{booking.provider?.full_name || 'N/A'}</TableCell>
                      <TableCell className="text-slate-600">{booking.service?.name || 'N/A'}</TableCell>
                      <TableCell>
                        <p className="text-sm">{format(new Date(booking.scheduled_date), 'MMM dd, yyyy')}</p>
                        <p className="text-xs text-slate-500">{booking.scheduled_time}</p>
                      </TableCell>
                      <TableCell className="font-bold text-[#EA580C]">${booking.total_amount}</TableCell>
                      <TableCell>
                        <Badge className={`${config.color} border-0`}>
                          <StatusIcon className="w-3 h-3 mr-1" />
                          {booking.status.replace('_', ' ')}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="hover:bg-orange-100">
                              <MoreHorizontal className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => setSelectedBooking(booking)}>
                              <Eye className="w-4 h-4 mr-2" /> View Details
                            </DropdownMenuItem>
                            {booking.status === 'pending' && (
                              <>
                                <DropdownMenuItem onClick={() => updateStatusMutation.mutate({ id: booking.id, status: 'accepted' })}>
                                  <CheckCircle className="w-4 h-4 mr-2 text-green-600" /> Accept
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => updateStatusMutation.mutate({ id: booking.id, status: 'rejected' })}>
                                  <XCircle className="w-4 h-4 mr-2 text-red-600" /> Reject
                                </DropdownMenuItem>
                              </>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
      
      {/* ... (Dialog stays similar, just ensure badge colors use updated config) */}
    </div>
  );
}