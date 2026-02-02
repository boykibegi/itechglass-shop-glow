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
  const [selectedDriver, setSelectedDriver] = useState<string>(currentDriverId || 'none');

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

      // Get profiles for these drivers (profiles may not exist)
      const driverIds = driverRoles.map(r => r.user_id);
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('user_id, full_name')
        .in('user_id', driverIds);

      if (profilesError) throw profilesError;

      // Map driver roles with their profile names (or null if no profile)
      return driverIds.map(userId => {
        const profile = profiles?.find(p => p.user_id === userId);
        return {
          user_id: userId,
          full_name: profile?.full_name || null,
        };
      });
    },
    enabled: open,
  });

  const assignDriver = useMutation({
    mutationFn: async () => {
      const driverId = selectedDriver === 'none' ? null : selectedDriver;
      const { error } = await supabase
        .from('orders')
        .update({
          driver_id: driverId,
          assigned_at: driverId ? new Date().toISOString() : null,
          order_status: driverId ? 'processing' : 'pending',
        })
        .eq('id', orderId);

      if (error) throw error;
    },
    onSuccess: () => {
      const driverId = selectedDriver === 'none' ? null : selectedDriver;
      queryClient.invalidateQueries({ queryKey: ['adminOrders'] });
      toast({
        title: driverId ? 'Driver Assigned' : 'Driver Removed',
        description: driverId 
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
              <SelectItem value="none">No Driver (Unassign)</SelectItem>
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
            {selectedDriver !== 'none' ? 'Assign Driver' : 'Remove Driver'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AssignDriverDialog;
