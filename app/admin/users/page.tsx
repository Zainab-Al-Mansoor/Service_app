'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '@/lib/api-client';
import { format } from 'date-fns';
import { 
  Search, Shield, CheckCircle, XCircle, MoreHorizontal, 
  User, Eye, Mail, Calendar, Trash2 
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow 
} from '@/components/ui/table';
import { 
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { 
  Dialog, DialogContent, DialogHeader, DialogTitle 
} from '@/components/ui/dialog';
import { toast } from 'sonner';

export default function AdminUsersPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRole, setSelectedRole] = useState<string | null>(null);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const queryClient = useQueryClient();

  const { data: usersData, isLoading } = useQuery({
    queryKey: ['admin-users', searchQuery, selectedRole],
    queryFn: async () => {
      const result = await apiClient.getUsers({
        role: selectedRole || undefined,
        search: searchQuery || undefined,
      });
      return result.data;
    },
  });

  const users = usersData?.users || [];

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      return await apiClient.updateUserStatus(id, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      toast.success('User updated successfully');
    },
    onError: () => toast.error('Failed to update user status'),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      return await apiClient.deleteUser(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      toast.success('User deleted successfully');
    },
    onError: () => toast.error('Failed to delete user'),
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Users Management</h1>
        <p className="text-slate-600 mt-1">Manage platform customers and service providers</p>
      </div>

      <div className="flex gap-4 items-center">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
          <Input 
            placeholder="Search by name or email..." 
            value={searchQuery} 
            onChange={(e) => setSearchQuery(e.target.value)} 
            className="pl-10 focus-visible:ring-[#EA580C]" 
          />
        </div>
        <div className="flex gap-2">
          {['All', 'Customer', 'Provider', 'Admin'].map((role) => (
            <Button
              key={role}
              variant={selectedRole === (role === 'All' ? null : role.toLowerCase()) ? 'default' : 'outline'}
              onClick={() => setSelectedRole(role === 'All' ? null : role.toLowerCase())}
              className={selectedRole === (role === 'All' ? null : role.toLowerCase()) 
                ? "bg-[#EA580C] hover:bg-[#c2410c] text-white border-[#EA580C]" 
                : "hover:border-[#EA580C] hover:text-[#EA580C]"}
            >
              {role}
            </Button>
          ))}
        </div>
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
                  <TableHead>User</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user: any) => (
                  <TableRow key={user.id} className="hover:bg-orange-50/30">
                    <TableCell className="font-semibold text-slate-900">{user.full_name}</TableCell>
                    <TableCell className="text-slate-600">{user.email}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="capitalize text-slate-600">
                        {user.role}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => updateMutation.mutate({ id: user.id, data: { is_verified: !user.is_verified } })}
                      >
                        {user.is_verified 
                          ? <CheckCircle className="w-5 h-5 text-emerald-500" /> 
                          : <XCircle className="w-5 h-5 text-amber-500" />
                        }
                      </Button>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="hover:bg-orange-100">
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => setSelectedUser(user)} className="cursor-pointer">
                            <Eye className="mr-2 h-4 w-4" /> View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => updateMutation.mutate({ id: user.id, data: { role: user.role === 'admin' ? 'customer' : 'admin' } })}
                            className="cursor-pointer"
                          >
                            <Shield className="mr-2 h-4 w-4" /> {user.role === 'admin' ? 'Remove Admin' : 'Make Admin'}
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            className="text-red-600 cursor-pointer" 
                            onClick={() => { if (confirm('Are you sure?')) deleteMutation.mutate(user.id); }}
                          >
                            <Trash2 className="mr-2 h-4 w-4" /> Delete
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

      <Dialog open={!!selectedUser} onOpenChange={() => setSelectedUser(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>User Profile Details</DialogTitle>
          </DialogHeader>
          {selectedUser && (
            <div className="space-y-6 py-4">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-orange-100 flex items-center justify-center text-[#EA580C] font-bold text-xl uppercase">
                  {selectedUser.full_name?.[0] || 'U'}
                </div>
                <div>
                  <h3 className="font-bold text-lg text-slate-900">{selectedUser.full_name}</h3>
                  <Badge className="bg-[#EA580C] text-white capitalize">{selectedUser.role}</Badge>
                </div>
              </div>
              <div className="grid gap-3 text-sm text-slate-600 border-t pt-4">
                <div className="flex items-center gap-3"><Mail className="w-4 h-4 text-[#EA580C]" /> {selectedUser.email}</div>
                <div className="flex items-center gap-3"><Calendar className="w-4 h-4 text-[#EA580C]" /> Joined: {format(new Date(selectedUser.created_at), 'PPP')}</div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}