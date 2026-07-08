'use client';

import { useQuery } from '@tanstack/react-query';
import apiClient from '@/lib/api-client';
import {
  Users,
  Wrench,
  CalendarDays,
  DollarSign,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { format } from 'date-fns';

// Updated theme config with #EA580C tones
const bookingStatusConfig: Record<string, { color: string; icon: any }> = {
  pending: { color: 'bg-orange-100 text-orange-700', icon: AlertCircle },
  accepted: { color: 'bg-blue-100 text-blue-700', icon: CheckCircle },
  rejected: { color: 'bg-red-100 text-red-700', icon: XCircle },
  in_progress: { color: 'bg-indigo-100 text-indigo-700', icon: Clock },
  completed: { color: 'bg-emerald-100 text-emerald-700', icon: CheckCircle },
  cancelled: { color: 'bg-slate-100 text-slate-700', icon: XCircle },
};

export default function AdminDashboard() {
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: async () => {
      const result = await apiClient.getAdminStats();
      return result.data;
    },
  });

  const { data: bookingsData = [], isLoading: bookingsLoading } = useQuery({
    queryKey: ['admin-recent-bookings'],
    queryFn: async () => {
      const result = await apiClient.getBookings({ limit: 10 });
      return result.data?.bookings || [];
    },
  });

  const recentBookings = bookingsData;

  // Reusable Stat Card Component Logic (simplified for brevity)
  const StatCard = ({ title, value, icon: Icon, gradient }: any) => (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-slate-500">{title}</p>
            <p className="text-3xl font-bold text-slate-900 mt-1">
              {statsLoading ? '---' : value}
            </p>
          </div>
          <div className={`w-12 h-12 rounded-full ${gradient} flex items-center justify-center`}>
            <Icon className="w-6 h-6 text-white" />
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Dashboard</h1>
        <p className="text-slate-600 mt-1">Overview of your platform activity</p>
      </div>

      {/* Stats Cards with #EA580C Theme */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Total Users" value={stats?.totalUsers || 0} icon={Users} gradient="bg-[#EA580C]" />
        <StatCard title="Total Services" value={stats?.totalServices || 0} icon={Wrench} gradient="bg-[#EA580C]" />
        <StatCard title="Total Bookings" value={stats?.totalBookings || 0} icon={CalendarDays} gradient="bg-[#EA580C]" />
        <StatCard title="Total Revenue" value={`$${stats?.totalRevenue || 0}`} icon={DollarSign} gradient="bg-[#EA580C]" />
      </div>

      {/* Booking Status Overview */}
      <div className="grid gap-4 md:grid-cols-4">
        {Object.entries(bookingStatusConfig).slice(0, 4).map(([status, config]) => (
          <Card key={status} className="border-l-4 border-l-[#EA580C]">
            <CardContent className="p-4 flex items-center gap-3">
              <div className={`w-10 h-10 rounded-full ${config.color} flex items-center justify-center`}>
                <config.icon className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">{status.replace('_', ' ')}</p>
                <p className="text-xl font-bold text-slate-900">
                  {statsLoading ? '---' : stats?.bookingStats?.[status] || 0}
                </p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent Bookings */}
      <Card>
        <CardHeader>
          <CardTitle className="text-slate-900">Recent Bookings</CardTitle>
        </CardHeader>
        <CardContent>
          {bookingsLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#EA580C]" />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Service</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentBookings.map((booking: any) => {
                  const config = bookingStatusConfig[booking.status] || bookingStatusConfig.pending;
                  return (
                    <TableRow key={booking.id} className="hover:bg-orange-50/50">
                      <TableCell className="font-mono text-xs text-slate-500">
                        {booking.id.slice(0, 8)}...
                      </TableCell>
                      <TableCell className="font-medium">{booking.customer?.full_name || 'N/A'}</TableCell>
                      <TableCell>{booking.service?.name || 'N/A'}</TableCell>
                      <TableCell>{format(new Date(booking.created_at), 'MMM dd, yyyy')}</TableCell>
                      <TableCell className="font-bold text-[#EA580C]">
                        ${booking.total_amount}
                      </TableCell>
                      <TableCell>
                        <Badge className={`${config.color} border-0`}>
                          {booking.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}