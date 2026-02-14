import { useNavigate } from 'react-router-dom';
import { Smartphone, Sparkles, ShoppingBag, ArrowRight, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { useEffect } from 'react';

const Welcome = () => {
  const navigate = useNavigate();
  const { user, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading && !user) {
      navigate('/');
    }
  }, [user, isLoading, navigate]);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Header */}
      <div className="bg-gradient-hero px-6 pt-safe-top pb-12 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,hsl(var(--gold)/0.2),transparent_60%)]" />
        <div className="relative z-10 flex flex-col items-center pt-8">
          <div className="w-16 h-16 rounded-2xl bg-gold/20 backdrop-blur-sm flex items-center justify-center mb-4 border border-gold/30 animate-fade-in">
            <Smartphone className="h-8 w-8 text-gold" />
          </div>
          <h1 className="text-2xl font-bold text-primary-foreground animate-fade-in" style={{ animationDelay: '0.1s', animationFillMode: 'backwards' }}>
            iTech<span className="text-gold">Glass</span>
          </h1>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 flex items-center justify-center px-6 py-10 -mt-6">
        <div className="w-full max-w-md text-center">
          <div className="w-20 h-20 rounded-full bg-accent/15 flex items-center justify-center mx-auto mb-6 animate-fade-in" style={{ animationDelay: '0.2s', animationFillMode: 'backwards' }}>
            <CheckCircle className="h-10 w-10 text-accent-foreground" />
          </div>

          <h2 className="text-3xl font-bold text-foreground mb-3 animate-fade-in" style={{ animationDelay: '0.3s', animationFillMode: 'backwards' }}>
            Welcome to iTechGlass! 🎉
          </h2>

          <p className="text-muted-foreground text-lg mb-8 animate-fade-in" style={{ animationDelay: '0.4s', animationFillMode: 'backwards' }}>
            Your account has been created successfully. Start exploring our premium iPhone protection products.
          </p>

          <div className="space-y-4 mb-10 text-left animate-fade-in" style={{ animationDelay: '0.5s', animationFillMode: 'backwards' }}>
            {[
              { icon: ShoppingBag, text: 'Browse our premium collection of back glass & screen protectors' },
              { icon: Sparkles, text: 'Get exclusive deals and fast delivery across Tanzania' },
            ].map((item, i) => (
              <div key={i} className="flex items-start gap-3 p-3 rounded-xl bg-secondary/50 border border-border/50">
                <div className="w-8 h-8 rounded-lg bg-gold/15 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <item.icon className="h-4 w-4 text-gold" />
                </div>
                <p className="text-sm text-foreground/80">{item.text}</p>
              </div>
            ))}
          </div>

          <div className="animate-fade-in" style={{ animationDelay: '0.6s', animationFillMode: 'backwards' }}>
            <Button
              variant="gold"
              size="lg"
              className="w-full h-12 text-base font-semibold group transition-all duration-300 hover:shadow-gold hover:scale-[1.02] active:scale-[0.98]"
              onClick={() => navigate('/shop')}
            >
              Start Shopping
              <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Welcome;
