'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '@/lib/api-client';
import { useAuth } from '@/hooks/use-auth';
import { Plus, MoreHorizontal, Loader2, Edit, Trash2, Power, Sparkles, Wrench } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

export default function ProviderServicesPage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editingService, setEditingService] = useState<any>(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [duration, setDuration] = useState('60');
  const [categoryId, setCategoryId] = useState('');

  const { data: categories = [] } = useQuery({ queryKey: ['categories'], queryFn: async () => (await apiClient.getCategories()).data?.categories || [] });
  const { data: services = [], isLoading } = useQuery({
    queryKey: ['provider-services'],
    queryFn: async () => (await apiClient.getServices({ limit: 100 })).data?.services.filter((s: any) => s.provider_id === user?.id) || [],
    enabled: !!user,
  });

  const mutationOptions = {
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['provider-services'] });
      setShowAddDialog(false); setEditingService(null); resetForm();
      toast.success('Service updated successfully');
    }
  };

  const addMutation = useMutation({ mutationFn: () => apiClient.createService({ name, description, price: parseFloat(price), duration_minutes: parseInt(duration), category_id: categoryId || undefined }), ...mutationOptions });
  const updateMutation = useMutation({ mutationFn: (id: string) => apiClient.updateService(id, { name, description, price: parseFloat(price), duration_minutes: parseInt(duration), category_id: categoryId || undefined }), ...mutationOptions });
  const toggleMutation = useMutation({ mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) => apiClient.updateService(id, { is_active: isActive }), onSuccess: () => queryClient.invalidateQueries({ queryKey: ['provider-services'] }) });
  const deleteMutation = useMutation({ mutationFn: (id: string) => apiClient.deleteService(id), onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['provider-services'] }); toast.success('Service deleted'); } });

  const resetForm = () => { setName(''); setDescription(''); setPrice(''); setDuration('60'); setCategoryId(''); };
  const handleEdit = (s: any) => { setEditingService(s); setName(s.name); setDescription(s.description || ''); setPrice(s.price.toString()); setDuration(s.duration_minutes.toString()); setCategoryId(s.category_id || ''); };

  return (
    <div className="space-y-8 max-w-5xl">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-extrabold text-[#0F172A]">My Services</h1>
          <p className="text-slate-500">Manage the services you offer to customers</p>
        </div>
        <Button onClick={() => setShowAddDialog(true)} className="bg-[#E28557] hover:bg-[#d4784d] h-12 rounded-xl font-bold">
          <Plus className="w-4 h-4 mr-2" /> Add New Service
        </Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center p-20"><Loader2 className="animate-spin w-8 h-8 text-[#E28557]" /></div>
      ) : services.length === 0 ? (
        <Card className="rounded-3xl border-none shadow-sm py-20 text-center">
          <Wrench className="w-12 h-12 text-slate-300 mx-auto mb-4" />
          <h3 className="font-bold text-lg">No services listed yet</h3>
          <Button variant="outline" className="mt-4 rounded-xl" onClick={() => setShowAddDialog(true)}>Add your first service</Button>
        </Card>
      ) : (
        <div className="grid gap-4">
          {services.map((service: any) => (
            <Card key={service.id} className="rounded-2xl border-none shadow-sm p-6 hover:shadow-md transition-all">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center text-[#E28557]"><Sparkles className="w-6 h-6" /></div>
                  <div>
                    <h3 className="font-bold text-[#0F172A]">{service.name}</h3>
                    <p className="text-sm text-slate-500">{service.category?.name || 'General'} • {service.duration_minutes} min</p>
                  </div>
                </div>
                <div className="flex items-center gap-6">
                  <p className="font-bold text-lg text-[#0F172A]">${service.price}</p>
                  <Badge className={cn("rounded-full px-4 py-1", service.is_active ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-700')}>
                    {service.is_active ? 'Active' : 'Inactive'}
                  </Badge>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild><Button variant="ghost"><MoreHorizontal /></Button></DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="rounded-xl">
                      <DropdownMenuItem onClick={() => handleEdit(service)}><Edit className="w-4 h-4 mr-2" /> Edit</DropdownMenuItem>
                      <DropdownMenuItem onClick={() => toggleMutation.mutate({ id: service.id, isActive: !service.is_active })}><Power className="w-4 h-4 mr-2" /> {service.is_active ? 'Deactivate' : 'Activate'}</DropdownMenuItem>
                      <DropdownMenuItem className="text-red-600" onClick={() => deleteMutation.mutate(service.id)}><Trash2 className="w-4 h-4 mr-2" /> Delete</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Add/Edit Dialog */}
      <Dialog open={showAddDialog || !!editingService} onOpenChange={() => { setShowAddDialog(false); setEditingService(null); resetForm(); }}>
        <DialogContent className="rounded-3xl">
          <DialogHeader><DialogTitle>{editingService ? 'Edit Service' : 'Add New Service'}</DialogTitle></DialogHeader>
          <div className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label>Service Name</Label>
              <Input value={name} onChange={(e) => setName(e.target.value)} className="rounded-xl" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>Price ($)</Label><Input type="number" value={price} onChange={(e) => setPrice(e.target.value)} className="rounded-xl" /></div>
              <div className="space-y-2"><Label>Duration (min)</Label><Input type="number" value={duration} onChange={(e) => setDuration(e.target.value)} className="rounded-xl" /></div>
            </div>
            <Button onClick={() => editingService ? updateMutation.mutate(editingService.id) : addMutation.mutate()} className="w-full bg-[#E28557] rounded-xl h-12">Save Service</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}