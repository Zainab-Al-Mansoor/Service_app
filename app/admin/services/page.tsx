'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '@/lib/api-client';
import { Search, MoreHorizontal, Trash2, Power } from 'lucide-react';
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
import { toast } from 'sonner';

export default function AdminServicesPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const { data: categoriesData } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const result = await apiClient.getCategories();
      return result.data?.categories || [];
    },
  });

  const categories = categoriesData || [];

  const { data: servicesData, isLoading } = useQuery({
    queryKey: ['admin-services', searchQuery, selectedCategory],
    queryFn: async () => {
      const result = await apiClient.getServices({
        category: selectedCategory || undefined,
        search: searchQuery || undefined,
        limit: 100,
      });
      return result.data?.services || [];
    },
  });

  const services = servicesData || [];

  const toggleMutation = useMutation({
    mutationFn: async ({ id, isActive }: { id: string; isActive: boolean }) => {
      return await apiClient.updateService(id, { is_active: isActive });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-services'] });
      toast.success('Service status updated');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      return await apiClient.deleteService(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-services'] });
      toast.success('Service deleted successfully');
    },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Services Management</h1>
        <p className="text-slate-600 mt-1">View and control services provided on the platform</p>
      </div>

      <div className="flex gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Search services or providers..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 focus-visible:ring-[#EA580C]"
          />
        </div>
        <Select onValueChange={(v) => setSelectedCategory(v === 'all' ? null : v)}>
          <SelectTrigger className="w-48 focus:ring-[#EA580C]">
            <SelectValue placeholder="All Categories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {categories.map((cat: any) => (
              <SelectItem key={cat.id} value={cat.id}>
                {cat.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

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
                  <TableHead>Service</TableHead>
                  <TableHead>Provider</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-12"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {services.map((service: any) => (
                  <TableRow 
                    key={service.id}
                    className="hover:bg-orange-50/30 transition-colors"
                  >
                    <TableCell>
                      <p className={`font-semibold ${!service.is_active ? 'text-slate-400' : 'text-slate-900'}`}>
                        {service.name}
                      </p>
                    </TableCell>
                    <TableCell className="text-slate-600">{service.provider?.full_name || 'N/A'}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-slate-600 border-slate-200">
                        {service.category?.name || 'Uncategorized'}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-bold text-[#EA580C]">${service.price}</TableCell>
                    <TableCell>
                      <Badge className={service.is_active ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'}>
                        {service.is_active ? 'Active' : 'Inactive'}
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
                          <DropdownMenuItem 
                            onClick={() => toggleMutation.mutate({ id: service.id, isActive: !service.is_active })}
                            className="cursor-pointer"
                          >
                            <Power className="w-4 h-4 mr-2" />
                            {service.is_active ? 'Deactivate' : 'Activate'}
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            className="text-red-600 cursor-pointer" 
                            onClick={() => { if (confirm('Are you sure you want to delete this service?')) deleteMutation.mutate(service.id); }}
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}