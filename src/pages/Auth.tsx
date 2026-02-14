import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Loader2, Smartphone, Phone, Mail, Lock, ArrowRight, Sparkles, User, Shield, Truck, Award } from 'lucide-react';
import logo from '@/assets/logo.png';
import authHero from '@/assets/auth-hero.jpg';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { z } from 'zod';

const phoneSignInSchema = z.object({
  phone: z.string().min(10, 'Phone number must be at least 10 digits').regex(/^[0-9+\s-]+$/, 'Invalid phone number format'),
  password: z.string().min(1, 'Password is required'),
});

const emailSignInSchema = z.object({
  email: z.string().trim().email('Please enter a valid email'),
  password: z.string().min(1, 'Password is required'),
});

const signUpSchema = z.object({
  phone: z.string().min(10, 'Phone number must be at least 10 digits').regex(/^[0-9+\s-]+$/, 'Invalid phone number format'),
  email: z.string().trim().email('Please enter a valid email').optional().or(z.literal('')),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  name: z.string().min(1, 'Name is required').max(100, 'Name is too long'),
});

const Auth = () => {
  const navigate = useNavigate();
  const { user, isLoading, signIn, signUp } = useAuth();
  const [isSignUp, setIsSignUp] = useState(false);
  const [loginMethod, setLoginMethod] = useState<'phone' | 'email'>('phone');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!isLoading && user) {
      navigate('/shop');
    }
  }, [user, isLoading, navigate]);

  const generateEmail = (phoneNumber: string) => {
    const cleanPhone = phoneNumber.replace(/[^0-9]/g, '');
    return `${cleanPhone}@itechglass.user`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    try {
      if (isSignUp) {
        signUpSchema.parse({ phone, email, password, name });
      } else if (loginMethod === 'phone') {
        phoneSignInSchema.parse({ phone, password });
      } else {
        emailSignInSchema.parse({ email, password });
      }
    } catch (err) {
      if (err instanceof z.ZodError) {
        const newErrors: Record<string, string> = {};
        err.errors.forEach((error) => {
          if (error.path[0]) {
            newErrors[error.path[0] as string] = error.message;
          }
        });
        setErrors(newErrors);
        return;
      }
    }

    if (isSignUp && password !== confirmPassword) {
      setErrors({ confirmPassword: 'Passwords do not match' });
      return;
    }

    setIsSubmitting(true);

    try {
      if (isSignUp) {
        const authEmail = email || generateEmail(phone);
        const { error } = await signUp(authEmail, password);
        if (error) {
          if (error.message.includes('already registered')) {
            toast.error('This phone number is already registered. Please sign in instead.');
            setIsSignUp(false);
          } else {
            toast.error(error.message || 'Failed to create account');
          }
          return;
        }
        // Send welcome email if real email provided
        if (email && !email.endsWith('@itechglass.user')) {
          try {
            const { supabase } = await import('@/integrations/supabase/client');
            await supabase.functions.invoke('send-welcome-email', {
              body: { email, name: name || 'Customer' },
            });
          } catch {
            // Non-critical, don't block signup
          }
        }
        navigate('/welcome');
        return;
      } else {
        const authEmail = loginMethod === 'phone' ? generateEmail(phone) : email.trim();
        const { error } = await signIn(authEmail, password);
        if (error) {
          if (error.message.includes('Invalid login')) {
            if (loginMethod === 'phone') {
              toast.error('No account found with this phone number, or the password is incorrect. Please check your details or sign up.');
            } else {
              toast.error('No account found with this email, or the password is incorrect. Please check your details or sign up.');
            }
          } else {
            toast.error(error.message || 'Failed to sign in');
          }
          return;
        }
      }
    } catch (error) {
      toast.error('An unexpected error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-10 w-10 animate-spin text-gold" />
          <p className="text-muted-foreground animate-pulse">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-background">
      {/* Left side - Hero Visual */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        {/* Hero Image */}
        <img
          src={authHero}
          alt="Premium iPhone accessories"
          className="absolute inset-0 w-full h-full object-cover"
        />
        {/* Overlay gradients */}
        <div className="absolute inset-0 bg-gradient-to-r from-primary/90 via-primary/60 to-primary/30" />
        <div className="absolute inset-0 bg-gradient-to-t from-primary via-transparent to-primary/50" />
        
        <div className="relative z-10 flex flex-col justify-between p-16 w-full">
          {/* Hero text */}
          
          {/* Hero text */}
          <div className="space-y-6">
            <h2 className="text-5xl font-bold leading-[1.1] text-primary-foreground tracking-tight">
              Elevate Your
              <br />
              iPhone
              <br />
              <span className="text-gradient-gold">Experience</span>
            </h2>
            
            <p className="text-base text-primary-foreground/60 max-w-sm leading-relaxed">
              Premium back glass, screen protectors, and stylish covers — crafted for perfection.
            </p>
            
            <div className="flex gap-6 pt-2">
              {[
                { icon: Shield, label: 'Quality' },
                { icon: Truck, label: 'Fast Delivery' },
                { icon: Award, label: 'Warranty' },
              ].map(({ icon: Icon, label }) => (
                <div key={label} className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-gold/15 border border-gold/20 flex items-center justify-center">
                    <Icon className="h-4 w-4 text-gold" />
                  </div>
                  <span className="text-xs font-medium text-primary-foreground/70">{label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Bottom tagline */}
          <p className="text-[11px] text-primary-foreground/30 uppercase tracking-[0.3em] font-medium">
            Premium Protection · Smart Price
          </p>
        </div>
      </div>

      {/* Right side - Auth Form */}
      <div className="flex-1 flex flex-col min-h-screen lg:min-h-0">
        {/* Mobile Header */}
        <div className="lg:hidden relative overflow-hidden">
          <img
            src={authHero}
            alt="Premium iPhone accessories"
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-primary/80 via-primary/60 to-primary" />
          <div className="relative z-10 flex flex-col items-center px-6 pt-12 pb-10">
            <div className="h-4" />
            <h1 className="text-2xl font-bold text-primary-foreground tracking-tight">
              iTech<span className="text-gold">Glass</span>
            </h1>
            <p className="text-[11px] text-primary-foreground/40 mt-1.5 uppercase tracking-[0.25em] font-medium">
              Premium Protection · Smart Price
            </p>
          </div>
        </div>

        {/* Form Container */}
        <div className="flex-1 flex items-center justify-center px-6 py-8 lg:p-12">
          <div className="w-full max-w-md">
            <div className="space-y-1 mb-6 lg:mb-8 text-center lg:text-left animate-fade-in" style={{ animationDelay: '0.1s', animationFillMode: 'backwards' }}>
              <h2 className="text-2xl lg:text-3xl font-bold text-foreground">
                {isSignUp ? 'Create Account' : 'Welcome Back'}
              </h2>
              <p className="text-sm lg:text-base text-muted-foreground">
                {isSignUp
                  ? 'Join us for premium iPhone protection'
                  : 'Sign in to continue shopping'}
              </p>
            </div>

            {/* Login method tabs - only show on sign in */}
            {!isSignUp && (
              <div className="mb-5 animate-fade-in" style={{ animationDelay: '0.15s', animationFillMode: 'backwards' }}>
                <Tabs value={loginMethod} onValueChange={(v) => { setLoginMethod(v as 'phone' | 'email'); setErrors({}); }}>
                  <TabsList className="w-full grid grid-cols-2">
                    <TabsTrigger value="phone" className="gap-2">
                      <Phone className="h-4 w-4" />
                      Phone
                    </TabsTrigger>
                    <TabsTrigger value="email" className="gap-2">
                      <Mail className="h-4 w-4" />
                      Email
                    </TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4 lg:space-y-5">
              {/* Name field - signup only */}
              {isSignUp && (
                <div className="space-y-1.5 animate-fade-in" style={{ animationDelay: '0.2s', animationFillMode: 'backwards' }}>
                  <Label htmlFor="name" className="text-sm font-medium flex items-center gap-2">
                    <User className="h-4 w-4 text-gold" />
                    Full Name <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="John Doe"
                    className="h-11 lg:h-12 bg-secondary/50 border-border/50 focus:border-gold focus:ring-gold/20 text-base transition-all duration-200 hover:border-gold/50"
                    autoComplete="name"
                  />
                  {errors.name && <p className="text-xs text-destructive mt-1">{errors.name}</p>}
                </div>
              )}

              {/* Phone field - show on signup or phone login */}
              {(isSignUp || loginMethod === 'phone') && (
                <div className="space-y-1.5 animate-fade-in" style={{ animationDelay: isSignUp ? '0.25s' : '0.2s', animationFillMode: 'backwards' }}>
                  <Label htmlFor="phone" className="text-sm font-medium flex items-center gap-2">
                    <Phone className="h-4 w-4 text-gold" />
                    Phone Number <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+255 7XX XXX XXX"
                    className="h-11 lg:h-12 bg-secondary/50 border-border/50 focus:border-gold focus:ring-gold/20 text-base transition-all duration-200 hover:border-gold/50"
                    autoComplete="tel"
                  />
                  {errors.phone && <p className="text-xs text-destructive mt-1">{errors.phone}</p>}
                </div>
              )}

              {/* Email field - show on signup (optional) or email login (required) */}
              {(isSignUp || loginMethod === 'email') && (
                <div className="space-y-1.5 animate-fade-in" style={{ animationDelay: isSignUp ? '0.3s' : '0.2s', animationFillMode: 'backwards' }}>
                  <Label htmlFor="email" className="text-sm font-medium flex items-center gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    Email {isSignUp ? (
                      <span className="text-muted-foreground text-xs">(Optional - for order updates)</span>
                    ) : (
                      <span className="text-destructive">*</span>
                    )}
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
                  {errors.email && <p className="text-xs text-destructive mt-1">{errors.email}</p>}
                </div>
              )}

              <div className="space-y-1.5 animate-fade-in" style={{ animationDelay: isSignUp ? '0.35s' : '0.25s', animationFillMode: 'backwards' }}>
                <Label htmlFor="password" className="text-sm font-medium flex items-center gap-2">
                  <Lock className="h-4 w-4 text-muted-foreground" />
                  Password
                </Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="h-11 lg:h-12 bg-secondary/50 border-border/50 focus:border-gold focus:ring-gold/20 text-base transition-all duration-200 hover:border-gold/50"
                  autoComplete={isSignUp ? 'new-password' : 'current-password'}
                />
                {errors.password && <p className="text-xs text-destructive mt-1">{errors.password}</p>}
              </div>

              {isSignUp && (
                <div className="space-y-1.5 animate-fade-in" style={{ animationDelay: '0.4s', animationFillMode: 'backwards' }}>
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
              )}

              {!isSignUp && (
                <div className="text-right animate-fade-in" style={{ animationDelay: '0.3s', animationFillMode: 'backwards' }}>
                  <Link
                    to="/forgot-password"
                    className="text-sm text-gold hover:text-gold/80 font-medium transition-colors hover:underline underline-offset-4"
                  >
                    Forgot password?
                  </Link>
                </div>
              )}

              <div className="animate-fade-in" style={{ animationDelay: isSignUp ? '0.45s' : '0.35s', animationFillMode: 'backwards' }}>
                <Button
                  type="submit"
                  variant="gold"
                  size="lg"
                  className="w-full h-11 lg:h-12 text-base font-semibold group mt-2 transition-all duration-300 hover:shadow-gold hover:scale-[1.02] active:scale-[0.98]"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      {isSignUp ? 'Creating account...' : 'Signing in...'}
                    </>
                  ) : (
                    <>
                      {isSignUp ? 'Create Account' : 'Sign In'}
                      <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </Button>
              </div>
            </form>

            <div className="mt-6 lg:mt-8 text-center animate-fade-in" style={{ animationDelay: isSignUp ? '0.5s' : '0.4s', animationFillMode: 'backwards' }}>
              <p className="text-sm text-muted-foreground">
                {isSignUp ? 'Already have an account?' : "Don't have an account?"}
                <button
                  type="button"
                  onClick={() => {
                    setIsSignUp(!isSignUp);
                    setErrors({});
                  }}
                  className="ml-2 text-gold hover:text-gold/80 font-semibold transition-colors hover:underline underline-offset-4"
                >
                  {isSignUp ? 'Sign in' : 'Sign up'}
                </button>
              </p>
            </div>

            <p className="mt-6 text-center text-xs text-muted-foreground px-4 animate-fade-in" style={{ animationDelay: isSignUp ? '0.55s' : '0.45s', animationFillMode: 'backwards' }}>
              By continuing, you agree to our Terms of Service and Privacy Policy
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;
