'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '@/lib/api-client';
import { Plus, Power } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { toast } from 'sonner';

export default function AdminCategoriesPage() {
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [categoryName, setCategoryName] = useState('');
  const [categoryDescription, setCategoryDescription] = useState('');

  const { data: categories = [], isLoading } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const result = await apiClient.getCategories();
      return result.data?.categories || [];
    },
  });

  const queryClient = useQueryClient();

  const addMutation = useMutation({
    mutationFn: async () => {
      return await apiClient.createCategory({
        name: categoryName,
        description: categoryDescription,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      setShowAddDialog(false);
      setCategoryName('');
      setCategoryDescription('');
      toast.success('Category added successfully');
    },
  });

  const toggleMutation = useMutation({
    mutationFn: async ({ id, isActive }: { id: string; isActive: boolean }) => {
      return await apiClient.updateCategory(id, { is_active: isActive });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      toast.success('Status updated');
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Categories</h1>
          <p className="text-slate-600 mt-1">Manage and organize your service categories</p>
        </div>
        <Button
          onClick={() => setShowAddDialog(true)}
          className="bg-[#EA580C] hover:bg-[#c2410c] text-white"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Category
        </Button>
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
                  <TableHead>Name</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Sort Order</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-24">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {categories.map((category: any) => (
                  <TableRow key={category.id} className="hover:bg-orange-50/30">
                    <TableCell className="font-semibold text-slate-900">{category.name}</TableCell>
                    <TableCell className="text-slate-600">{category.description || '-'}</TableCell>
                    <TableCell className="text-slate-600">{category.sort_order}</TableCell>
                    <TableCell>
                      <Badge className={category.is_active ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-700'}>
                        {category.is_active ? 'Active' : 'Inactive'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        className={category.is_active ? "text-red-600 hover:text-red-700 hover:bg-red-50" : "text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50"}
                        onClick={() => toggleMutation.mutate({ id: category.id, isActive: !category.is_active })}
                      >
                        <Power className="w-4 h-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Category</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label>Category Name</Label>
              <Input
                value={categoryName}
                onChange={(e) => setCategoryName(e.target.value)}
                placeholder="e.g., Home Cleaning"
                className="focus-visible:ring-[#EA580C]"
              />
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea
                value={categoryDescription}
                onChange={(e) => setCategoryDescription(e.target.value)}
                placeholder="Brief description..."
                className="focus-visible:ring-[#EA580C]"
              />
            </div>
            <Button
              className="w-full bg-[#EA580C] hover:bg-[#c2410c] text-white"
              onClick={() => addMutation.mutate()}
              disabled={!categoryName || addMutation.isPending}
            >
              {addMutation.isPending ? 'Adding...' : 'Add Category'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}