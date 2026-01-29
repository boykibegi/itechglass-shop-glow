import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Loader2, Truck, User } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';

interface AssignDriverDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  orderId: string;
  currentDriverId?: string | null;
}

const AssignDriverDialog = ({
  open,
  onOpenChange,
  orderId,
  currentDriverId,
}: AssignDriverDialogProps) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedDriver, setSelectedDriver] = useState<string>(currentDriverId || '');

  // Fetch all drivers
  const { data: drivers, isLoading: driversLoading } = useQuery({
    queryKey: ['drivers'],
    queryFn: async () => {
      // Get all users with driver role
      const { data: driverRoles, error: rolesError } = await supabase
        .from('user_roles')
        .select('user_id')
        .eq('role', 'driver');

      if (rolesError) throw rolesError;
      if (!driverRoles?.length) return [];

      // Get profiles for these drivers
      const driverIds = driverRoles.map(r => r.user_id);
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('user_id, full_name')
        .in('user_id', driverIds);

      if (profilesError) throw profilesError;

      return profiles || [];
    },
    enabled: open,
  });

  const assignDriver = useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from('orders')
        .update({
          driver_id: selectedDriver || null,
          assigned_at: selectedDriver ? new Date().toISOString() : null,
          order_status: selectedDriver ? 'processing' : 'pending',
        })
        .eq('id', orderId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminOrders'] });
      toast({
        title: selectedDriver ? 'Driver Assigned' : 'Driver Removed',
        description: selectedDriver 
          ? 'The driver has been assigned to this order.'
          : 'Driver has been removed from this order.',
      });
      onOpenChange(false);
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: 'Failed to update driver assignment.',
        variant: 'destructive',
      });
    },
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Truck className="h-5 w-5 text-gold" />
            Assign Driver
          </DialogTitle>
          <DialogDescription>
            Select a driver to deliver this order.
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          <Label htmlFor="driver">Driver</Label>
          <Select value={selectedDriver} onValueChange={setSelectedDriver}>
            <SelectTrigger id="driver" className="mt-2">
              <SelectValue placeholder="Select a driver" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">No Driver (Unassign)</SelectItem>
              {driversLoading ? (
                <div className="flex items-center justify-center py-4">
                  <Loader2 className="h-4 w-4 animate-spin" />
                </div>
              ) : drivers?.length === 0 ? (
                <div className="py-4 px-2 text-sm text-muted-foreground text-center">
                  No drivers available. Add driver role to users first.
                </div>
              ) : (
                drivers?.map((driver) => (
                  <SelectItem key={driver.user_id} value={driver.user_id}>
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4" />
                      {driver.full_name || 'Unnamed Driver'}
                    </div>
                  </SelectItem>
                ))
              )}
            </SelectContent>
          </Select>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            variant="gold"
            onClick={() => assignDriver.mutate()}
            disabled={assignDriver.isPending}
          >
            {assignDriver.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            {selectedDriver ? 'Assign Driver' : 'Remove Driver'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AssignDriverDialog;
