import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2, Lock, Smartphone, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const ResetPassword = () => {
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    // Check if we have access token in URL (from email link)
    const hashParams = new URLSearchParams(window.location.hash.substring(1));
    const accessToken = hashParams.get('access_token');
    const type = hashParams.get('type');

    if (accessToken && type === 'recovery') {
      // Session will be set automatically by Supabase
      supabase.auth.setSession({
        access_token: accessToken,
        refresh_token: hashParams.get('refresh_token') || '',
      });
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    if (password.length < 6) {
      setErrors({ password: 'Password must be at least 6 characters' });
      return;
    }

    if (password !== confirmPassword) {
      setErrors({ confirmPassword: 'Passwords do not match' });
      return;
    }

    setIsSubmitting(true);

    try {
      const { error } = await supabase.auth.updateUser({ password });

      if (error) {
        toast.error(error.message || 'Failed to reset password');
        return;
      }

      setIsSuccess(true);
      toast.success('Password reset successfully!');
      
      // Redirect to home after a short delay
      setTimeout(() => {
        navigate('/shop');
      }, 2000);
    } catch (err) {
      toast.error('An unexpected error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <div className="lg:hidden bg-gradient-hero px-6 pt-safe-top pb-8 relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,hsl(var(--gold)/0.2),transparent_60%)]" />
          <div className="relative z-10 flex flex-col items-center pt-8">
            <div className="w-14 h-14 rounded-2xl bg-gold/20 backdrop-blur-sm flex items-center justify-center mb-3 border border-gold/30">
              <Smartphone className="h-7 w-7 text-gold" />
            </div>
            <h1 className="text-2xl font-bold text-primary-foreground">
              iTech<span className="text-gold">Glass</span>
            </h1>
          </div>
        </div>

        <div className="flex-1 flex items-center justify-center px-6 py-8">
          <div className="w-full max-w-md text-center animate-fade-in">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="h-8 w-8 text-emerald-500" />
            </div>
            <h2 className="text-2xl font-bold text-foreground mb-3">Password Reset!</h2>
            <p className="text-muted-foreground mb-4">
              Your password has been successfully reset. Redirecting you to the shop...
            </p>
            <Loader2 className="h-5 w-5 animate-spin mx-auto text-gold" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <div className="lg:hidden bg-gradient-hero px-6 pt-safe-top pb-8 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,hsl(var(--gold)/0.2),transparent_60%)]" />
        <div className="relative z-10 flex flex-col items-center pt-8">
          <div className="w-14 h-14 rounded-2xl bg-gold/20 backdrop-blur-sm flex items-center justify-center mb-3 border border-gold/30">
            <Smartphone className="h-7 w-7 text-gold" />
          </div>
          <h1 className="text-2xl font-bold text-primary-foreground">
            iTech<span className="text-gold">Glass</span>
          </h1>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center px-6 py-8">
        <div className="w-full max-w-md">
          <div className="space-y-1 mb-6 animate-fade-in" style={{ animationDelay: '0.1s', animationFillMode: 'backwards' }}>
            <h2 className="text-2xl lg:text-3xl font-bold text-foreground">Set New Password</h2>
            <p className="text-sm lg:text-base text-muted-foreground">
              Enter your new password below.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5 animate-fade-in" style={{ animationDelay: '0.15s', animationFillMode: 'backwards' }}>
              <Label htmlFor="password" className="text-sm font-medium flex items-center gap-2">
                <Lock className="h-4 w-4 text-gold" />
                New Password
              </Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="h-11 lg:h-12 bg-secondary/50 border-border/50 focus:border-gold focus:ring-gold/20 text-base transition-all duration-200 hover:border-gold/50"
                autoComplete="new-password"
              />
              {errors.password && <p className="text-xs text-destructive mt-1">{errors.password}</p>}
            </div>

            <div className="space-y-1.5 animate-fade-in" style={{ animationDelay: '0.2s', animationFillMode: 'backwards' }}>
              <Label htmlFor="confirmPassword" className="text-sm font-medium flex items-center gap-2">
                <Lock className="h-4 w-4 text-muted-foreground" />
                Confirm Password
              </Label>
              <Input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                className="h-11 lg:h-12 bg-secondary/50 border-border/50 focus:border-gold focus:ring-gold/20 text-base transition-all duration-200 hover:border-gold/50"
                autoComplete="new-password"
              />
              {errors.confirmPassword && (
                <p className="text-xs text-destructive mt-1">{errors.confirmPassword}</p>
              )}
            </div>

            <div className="animate-fade-in" style={{ animationDelay: '0.25s', animationFillMode: 'backwards' }}>
              <Button
                type="submit"
                variant="gold"
                size="lg"
                className="w-full h-11 lg:h-12 text-base font-semibold mt-2 transition-all duration-300 hover:shadow-gold hover:scale-[1.02] active:scale-[0.98]"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Resetting...
                  </>
                ) : (
                  'Reset Password'
                )}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
