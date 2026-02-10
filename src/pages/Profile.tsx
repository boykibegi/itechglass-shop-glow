import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2, Phone, Mail, Lock, User, ArrowLeft, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { z } from 'zod';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

const phoneSchema = z.string().min(10, 'Phone number must be at least 10 digits').regex(/^[0-9+\s-]+$/, 'Invalid phone number format');
const emailSchema = z.string().email('Please enter a valid email');
const passwordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string().min(1, 'Please confirm your password'),
}).refine(data => data.newPassword === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

const Profile = () => {
  const navigate = useNavigate();
  const { user, isLoading } = useAuth();
  const [phoneNumber, setPhoneNumber] = useState('');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingEmail, setSavingEmail] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [profileLoading, setProfileLoading] = useState(true);

  useEffect(() => {
    if (!isLoading && !user) {
      navigate('/');
    }
  }, [user, isLoading, navigate]);

  useEffect(() => {
    const loadProfile = async () => {
      if (!user) return;
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (data) {
        setPhoneNumber(data.phone_number || '');
        setFullName(data.full_name || '');
      }
      // Set email from auth user
      const authEmail = user.email || '';
      setEmail(authEmail.endsWith('@itechglass.user') ? '' : authEmail);
      setProfileLoading(false);
    };
    loadProfile();
  }, [user]);

  const handleSaveProfile = async () => {
    if (!user) return;
    try {
      phoneSchema.parse(phoneNumber);
    } catch (err) {
      if (err instanceof z.ZodError) {
        toast.error(err.errors[0].message);
        return;
      }
    }

    setSavingProfile(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .upsert({
          user_id: user.id,
          phone_number: phoneNumber,
          full_name: fullName || null,
          updated_at: new Date().toISOString(),
        }, { onConflict: 'user_id' });

      if (error) throw error;
      toast.success('Profile updated successfully');
    } catch (error: any) {
      toast.error(error.message || 'Failed to update profile');
    } finally {
      setSavingProfile(false);
    }
  };

  const handleUpdateEmail = async () => {
    if (!email) {
      toast.error('Please enter an email address');
      return;
    }
    try {
      emailSchema.parse(email);
    } catch (err) {
      if (err instanceof z.ZodError) {
        toast.error(err.errors[0].message);
        return;
      }
    }

    setSavingEmail(true);
    try {
      const { error } = await supabase.auth.updateUser({ email });
      if (error) throw error;
      toast.success('Confirmation email sent. Please check your inbox to verify the new email.');
    } catch (error: any) {
      toast.error(error.message || 'Failed to update email');
    } finally {
      setSavingEmail(false);
    }
  };

  const handleUpdatePassword = async () => {
    try {
      passwordSchema.parse({ currentPassword, newPassword, confirmPassword });
    } catch (err) {
      if (err instanceof z.ZodError) {
        toast.error(err.errors[0].message);
        return;
      }
    }

    setSavingPassword(true);
    try {
      // Verify current password by re-authenticating
      const userEmail = user?.email || '';
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: userEmail,
        password: currentPassword,
      });
      if (signInError) {
        toast.error('Current password is incorrect');
        setSavingPassword(false);
        return;
      }

      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) throw error;
      toast.success('Password updated successfully');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error: any) {
      toast.error(error.message || 'Failed to update password');
    } finally {
      setSavingPassword(false);
    }
  };

  if (isLoading || profileLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-gold" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <main className="flex-1 container max-w-2xl py-8 px-4">
        <div className="animate-fade-in" style={{ animationDelay: '0.1s', animationFillMode: 'backwards' }}>
          <Button
            variant="ghost"
            onClick={() => navigate(-1)}
            className="mb-6 -ml-2 text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>

          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 rounded-full bg-gold/20 flex items-center justify-center">
              <User className="h-6 w-6 text-gold" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">My Profile</h1>
              <p className="text-sm text-muted-foreground">Manage your account settings</p>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          {/* Profile Info */}
          <Card className="animate-fade-in" style={{ animationDelay: '0.2s', animationFillMode: 'backwards' }}>
            <CardHeader>
              <CardTitle className="text-lg">Personal Information</CardTitle>
              <CardDescription>Update your name and phone number</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="fullName" className="text-sm font-medium flex items-center gap-2">
                  <User className="h-4 w-4 text-gold" />
                  Full Name
                </Label>
                <Input
                  id="fullName"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Your full name"
                  className="h-11 bg-secondary/50 border-border/50 focus:border-gold focus:ring-gold/20 text-base transition-all duration-200 hover:border-gold/50"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="phone" className="text-sm font-medium flex items-center gap-2">
                  <Phone className="h-4 w-4 text-gold" />
                  Phone Number
                </Label>
                <Input
                  id="phone"
                  type="tel"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="+255 7XX XXX XXX"
                  className="h-11 bg-secondary/50 border-border/50 focus:border-gold focus:ring-gold/20 text-base transition-all duration-200 hover:border-gold/50"
                />
              </div>
              <Button
                variant="gold"
                onClick={handleSaveProfile}
                disabled={savingProfile}
                className="w-full h-11 font-semibold transition-all duration-300 hover:shadow-gold hover:scale-[1.02] active:scale-[0.98]"
              >
                {savingProfile ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Check className="h-4 w-4 mr-2" />}
                Save Profile
              </Button>
            </CardContent>
          </Card>

          {/* Email */}
          <Card className="animate-fade-in" style={{ animationDelay: '0.3s', animationFillMode: 'backwards' }}>
            <CardHeader>
              <CardTitle className="text-lg">Email Address</CardTitle>
              <CardDescription>Update your email for order notifications</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="email" className="text-sm font-medium flex items-center gap-2">
                  <Mail className="h-4 w-4 text-gold" />
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  className="h-11 bg-secondary/50 border-border/50 focus:border-gold focus:ring-gold/20 text-base transition-all duration-200 hover:border-gold/50"
                />
              </div>
              <Button
                variant="gold"
                onClick={handleUpdateEmail}
                disabled={savingEmail}
                className="w-full h-11 font-semibold transition-all duration-300 hover:shadow-gold hover:scale-[1.02] active:scale-[0.98]"
              >
                {savingEmail ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Check className="h-4 w-4 mr-2" />}
                Update Email
              </Button>
            </CardContent>
          </Card>

          {/* Password */}
          <Card className="animate-fade-in" style={{ animationDelay: '0.4s', animationFillMode: 'backwards' }}>
            <CardHeader>
              <CardTitle className="text-lg">Change Password</CardTitle>
              <CardDescription>Update your account password</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="currentPassword" className="text-sm font-medium flex items-center gap-2">
                  <Lock className="h-4 w-4 text-muted-foreground" />
                  Current Password
                </Label>
                <Input
                  id="currentPassword"
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="••••••••"
                  className="h-11 bg-secondary/50 border-border/50 focus:border-gold focus:ring-gold/20 text-base transition-all duration-200 hover:border-gold/50"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="newPassword" className="text-sm font-medium flex items-center gap-2">
                  <Lock className="h-4 w-4 text-muted-foreground" />
                  New Password
                </Label>
                <Input
                  id="newPassword"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="••••••••"
                  className="h-11 bg-secondary/50 border-border/50 focus:border-gold focus:ring-gold/20 text-base transition-all duration-200 hover:border-gold/50"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="confirmNewPassword" className="text-sm font-medium flex items-center gap-2">
                  <Lock className="h-4 w-4 text-muted-foreground" />
                  Confirm New Password
                </Label>
                <Input
                  id="confirmNewPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="h-11 bg-secondary/50 border-border/50 focus:border-gold focus:ring-gold/20 text-base transition-all duration-200 hover:border-gold/50"
                />
              </div>
              <Button
                variant="gold"
                onClick={handleUpdatePassword}
                disabled={savingPassword}
                className="w-full h-11 font-semibold transition-all duration-300 hover:shadow-gold hover:scale-[1.02] active:scale-[0.98]"
              >
                {savingPassword ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Check className="h-4 w-4 mr-2" />}
                Update Password
              </Button>
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Profile;
