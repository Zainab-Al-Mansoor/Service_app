'use client';

import { useQuery } from '@tanstack/react-query';
import apiClient from '@/lib/api-client';
import { useAuth } from '@/hooks/use-auth';
import Link from 'next/link';
import {
  CalendarDays,
  Wrench,
  CheckCircle,
  Clock,
  DollarSign,
  AlertCircle,
  XCircle,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';

export default function ProviderDashboard() {
  const { user } = useAuth();

  const { data: stats } = useQuery({
    queryKey: ['provider-stats', user?.id],
    queryFn: async () => {
      const result = await apiClient.getProviderStats();
      return result.data;
    },
    enabled: !!user,
  });

  const { data: bookingsData } = useQuery({
    queryKey: ['provider-recent-bookings', user?.id],
    queryFn: async () => {
      const result = await apiClient.getBookings();
      return result.data?.bookings || [];
    },
    enabled: !!user,
  });

  const recentBookings = (bookingsData || []).filter((b: any) =>
    ['pending', 'accepted', 'in_progress'].includes(b.status)
  ).slice(0, 5);

  const statusConfig: Record<string, { color: string; icon: any }> = {
    pending: { color: 'bg-yellow-100 text-yellow-700', icon: AlertCircle },
    accepted: { color: 'bg-blue-100 text-blue-700', icon: CheckCircle },
    in_progress: { color: 'bg-purple-100 text-purple-700', icon: Clock },
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Provider Dashboard</h1>
        <p className="text-slate-600 mt-1">Manage your services and bookings</p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">Total Bookings</p>
                <p className="text-3xl font-bold text-slate-900 mt-1">
                  {stats?.totalBookings || 0}
                </p>
              </div>
              <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                <CalendarDays className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">Pending Requests</p>
                <p className="text-3xl font-bold text-yellow-600 mt-1">
                  {stats?.pendingBookings || 0}
                </p>
              </div>
              <div className="w-12 h-12 rounded-full bg-yellow-100 flex items-center justify-center">
                <AlertCircle className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">Active Services</p>
                <p className="text-3xl font-bold text-slate-900 mt-1">
                  {stats?.totalServices || 0}
                </p>
              </div>
              <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                <Wrench className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">Total Earnings</p>
                <p className="text-3xl font-bold text-green-600 mt-1">
                  ${stats?.totalRevenue || 0}
                </p>
              </div>
              <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Booking Requests */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg">Recent Requests</CardTitle>
          <Link href="/provider/bookings">
            <Button variant="ghost" size="sm">View All</Button>
          </Link>
        </CardHeader>
        <CardContent>
          {recentBookings.length === 0 ? (
            <div className="text-center py-8 text-slate-500">
              <CalendarDays className="w-10 h-10 mx-auto mb-2 text-slate-300" />
              <p>No pending bookings</p>
            </div>
          ) : (
            <div className="space-y-3">
              {recentBookings.map((booking: any) => {
                const config = statusConfig[booking.status];
                const StatusIcon = config?.icon || AlertCircle;
                return (
                  <div
                    key={booking.id}
                    className="flex items-center justify-between p-3 bg-slate-50 rounded-lg"
                  >
                    <div>
                      <p className="font-medium text-slate-900">
                        {booking.service?.name}
                      </p>
                      <p className="text-sm text-slate-500">
                        {booking.customer?.full_name} - {format(new Date(booking.scheduled_date), 'MMM dd')}
                      </p>
                    </div>
                    <Badge className={config?.color}>
                      <StatusIcon className="w-3 h-3 mr-1" />
                      {booking.status}
                    </Badge>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
