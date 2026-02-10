import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Loader2, Mail, ArrowLeft, CheckCircle, Smartphone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { z } from 'zod';

const emailSchema = z.string().trim().email('Please enter a valid email address').max(255, 'Email is too long');

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      emailSchema.parse(email);
    } catch (err) {
      if (err instanceof z.ZodError) {
        setError(err.errors[0].message);
        return;
      }
    }

    setIsSubmitting(true);

    try {
      const { data, error: fnError } = await supabase.functions.invoke('send-password-reset', {
        body: { email: email.trim() },
      });

      if (fnError) {
        toast.error('Failed to send reset link. Please try again.');
        return;
      }

      setIsSuccess(true);
      toast.success('Password reset email sent!');
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
            <h2 className="text-2xl font-bold text-foreground mb-3">Check Your Email</h2>
            <p className="text-muted-foreground mb-8">
              If an account exists with this email address, you'll receive a password reset link shortly.
            </p>
            <Link to="/">
              <Button variant="outline" className="gap-2">
                <ArrowLeft className="h-4 w-4" />
                Back to Sign In
              </Button>
            </Link>
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
          <Link 
            to="/" 
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors animate-fade-in"
            style={{ animationDelay: '0.1s', animationFillMode: 'backwards' }}
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Sign In
          </Link>

          <div className="space-y-1 mb-6 animate-fade-in" style={{ animationDelay: '0.15s', animationFillMode: 'backwards' }}>
            <h2 className="text-2xl lg:text-3xl font-bold text-foreground">Forgot Password?</h2>
            <p className="text-sm lg:text-base text-muted-foreground">
              Enter your email address and we'll send you a reset link.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5 animate-fade-in" style={{ animationDelay: '0.2s', animationFillMode: 'backwards' }}>
              <Label htmlFor="email" className="text-sm font-medium flex items-center gap-2">
                <Mail className="h-4 w-4 text-gold" />
                Email Address
              </Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                className="h-11 lg:h-12 bg-secondary/50 border-border/50 focus:border-gold focus:ring-gold/20 text-base transition-all duration-200 hover:border-gold/50"
                autoComplete="email"
              />
              {error && <p className="text-xs text-destructive mt-1">{error}</p>}
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
                    Sending...
                  </>
                ) : (
                  'Send Reset Link'
                )}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
