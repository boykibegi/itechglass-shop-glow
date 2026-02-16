import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Clock, LogOut } from 'lucide-react';
import { useSessionTimeout } from '@/hooks/useSessionTimeout';

export function SessionTimeoutDialog() {
  const { showWarning, secondsLeft, stayLoggedIn, handleLogout } = useSessionTimeout();

  const minutes = Math.floor(secondsLeft / 60);
  const seconds = secondsLeft % 60;
  const timeDisplay = `${minutes}:${seconds.toString().padStart(2, '0')}`;

  return (
    <AlertDialog open={showWarning}>
      <AlertDialogContent className="max-w-sm">
        <AlertDialogHeader>
          <div className="flex items-center justify-center mb-2">
            <div className="w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center">
              <Clock className="h-6 w-6 text-destructive" />
            </div>
          </div>
          <AlertDialogTitle className="text-center">Session Expiring</AlertDialogTitle>
          <AlertDialogDescription className="text-center">
            You've been inactive. Your session will expire in{' '}
            <span className="font-bold text-foreground tabular-nums">{timeDisplay}</span>.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="flex-col gap-2 sm:flex-col">
          <Button onClick={stayLoggedIn} className="w-full">
            Stay Logged In
          </Button>
          <Button variant="outline" onClick={handleLogout} className="w-full">
            <LogOut className="mr-2 h-4 w-4" />
            Log Out Now
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
