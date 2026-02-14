import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import {
  Smartphone, Sparkles, ShoppingBag, ArrowRight, ArrowLeft,
  CheckCircle, Shield, Truck, MessageCircle, Search, Zap, Star, Gift
} from 'lucide-react';
import logo from '@/assets/logo.png';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import WhatsAppButton from '@/components/WhatsAppButton';
import { Progress } from '@/components/ui/progress';
import { supabase } from '@/integrations/supabase/client';

interface OnboardingStep {
  icon: React.ElementType;
  title: string;
  description: string;
  highlight: string;
  upsell?: {
    category: string;
    tagline: string;
    cta: string;
  };
}

const steps: OnboardingStep[] = [
  {
    icon: CheckCircle,
    title: 'Account Created! 🎉',
    description: 'Welcome to iTechGlass — your one-stop shop for premium iPhone protection in Tanzania.',
    highlight: 'You\'re all set up and ready to go!',
  },
  {
    icon: Search,
    title: 'Browse & Shop',
    description: 'Explore our curated collection of back glass replacements, screen protectors, and stylish cases for every iPhone model.',
    highlight: 'Filter by model to find your perfect fit',
    upsell: {
      category: 'back-glass',
      tagline: 'Most Popular — Back Glass',
      cta: 'View Back Glass',
    },
  },
  {
    icon: Shield,
    title: 'Premium Quality',
    description: 'Every product is carefully selected for durability and style. We stand behind our products with a quality warranty.',
    highlight: 'All products come with warranty coverage',
    upsell: {
      category: 'screen-protector',
      tagline: 'Best Sellers — Screen Protectors',
      cta: 'View Protectors',
    },
  },
  {
    icon: Truck,
    title: 'Fast Delivery',
    description: 'We deliver across Tanzania with real-time order tracking so you always know where your order is.',
    highlight: 'Track your order live on the map',
    upsell: {
      category: 'cover',
      tagline: 'Trending Now — Stylish Covers',
      cta: 'View Covers',
    },
  },
  {
    icon: MessageCircle,
    title: 'We\'re Here to Help',
    description: 'Need assistance? Reach out via WhatsApp for instant support. We\'re always happy to help you find the right product.',
    highlight: 'Tap the WhatsApp button anytime',
  },
];

interface FeaturedProduct {
  id: string;
  name: string;
  price: number;
  images: string[] | null;
  category: string;
}

const formatPrice = (price: number) =>
  new Intl.NumberFormat('en-TZ', { style: 'currency', currency: 'TZS', minimumFractionDigits: 0 }).format(price);

const Welcome = () => {
  const navigate = useNavigate();
  const { user, isLoading } = useAuth();
  const [currentStep, setCurrentStep] = useState(0);
  const [direction, setDirection] = useState<'forward' | 'backward'>('forward');
  const [featuredProducts, setFeaturedProducts] = useState<FeaturedProduct[]>([]);

  useEffect(() => {
    if (!isLoading && !user) {
      navigate('/');
    }
  }, [user, isLoading, navigate]);

  // Fetch a few featured products for upsell banners
  useEffect(() => {
    const fetchProducts = async () => {
      const { data } = await supabase
        .from('products')
        .select('id, name, price, images, category')
        .eq('featured', true)
        .limit(9);
      if (data) setFeaturedProducts(data);
    };
    fetchProducts();
  }, []);

  const progress = ((currentStep + 1) / steps.length) * 100;
  const step = steps[currentStep];
  const StepIcon = step.icon;
  const isLastStep = currentStep === steps.length - 1;
  const isFirstStep = currentStep === 0;

  const getUpsellProducts = (category: string) =>
    featuredProducts.filter((p) => p.category.toLowerCase().includes(category.replace('-', ' ').split(' ')[0]) || p.category.toLowerCase().includes(category.replace('-', '_'))).slice(0, 3);

  // Fallback: if no category match, show any featured
  const getDisplayProducts = (category: string) => {
    const matched = getUpsellProducts(category);
    return matched.length > 0 ? matched : featuredProducts.slice(0, 3);
  };

  const goNext = () => {
    if (isLastStep) {
      navigate('/shop');
    } else {
      setDirection('forward');
      setCurrentStep((s) => s + 1);
    }
  };

  const goBack = () => {
    if (!isFirstStep) {
      setDirection('backward');
      setCurrentStep((s) => s - 1);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Premium Header */}
      <div className="bg-gradient-hero px-6 pt-safe-top pb-14 relative overflow-hidden">
        {/* Layered radial glow effects */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_-20%,hsl(43_74%_49%/0.15),transparent_70%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_100%,hsl(0_0%_12%/0.8),transparent_60%)]" />
        {/* Subtle shimmer line */}
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold/40 to-transparent" />

        <div className="relative z-10 flex flex-col items-center pt-10 pb-2">
          {/* Logo with refined glow backdrop */}
          <div className="relative mb-5 animate-fade-in">
            <div className="absolute inset-0 -m-4 rounded-full bg-gold/5 blur-2xl" />
            <img src={logo} alt="iTechGlass" className="relative h-16 drop-shadow-[0_2px_12px_hsl(43_74%_49%/0.3)]" />
          </div>
          {/* Tagline */}
          <p className="text-primary-foreground/50 text-[11px] font-medium uppercase tracking-[0.25em] animate-fade-in" style={{ animationDelay: '0.15s', animationFillMode: 'backwards' }}>
            Premium Protection · Smart Price
          </p>
        </div>
      </div>

      {/* Progress — refined */}
      <div className="px-8 -mt-3 relative z-20">
        <div className="max-w-md mx-auto">
          <Progress value={progress} className="h-1 bg-border/50" />
          <p className="text-[10px] text-muted-foreground/60 text-right mt-2 font-medium tracking-wider uppercase">
            Step {currentStep + 1} of {steps.length}
          </p>
        </div>
      </div>

      {/* Step Content */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-8 overflow-y-auto">
        <div key={currentStep} className="w-full max-w-md text-center animate-fade-in">
          {/* Icon — elevated glass card */}
          <div className="w-[72px] h-[72px] rounded-[20px] bg-gradient-to-br from-gold/15 to-gold/5 border border-gold/20 shadow-[0_8px_32px_-8px_hsl(43_74%_49%/0.2)] flex items-center justify-center mx-auto mb-6 backdrop-blur-sm">
            <StepIcon className="h-8 w-8 text-gold" />
          </div>

          {/* Title — larger, more refined */}
          <h2 className="text-2xl lg:text-[32px] font-bold text-foreground mb-3 tracking-tight leading-tight">
            {step.title}
          </h2>

          {/* Description — better line height */}
          <p className="text-muted-foreground text-[15px] lg:text-base mb-5 leading-relaxed max-w-sm mx-auto">
            {step.description}
          </p>

          {/* Highlight pill — refined */}
          <div className="inline-flex items-center gap-2.5 px-5 py-2.5 rounded-full bg-gold/8 border border-gold/15 mb-6 shadow-sm">
            <Sparkles className="h-3.5 w-3.5 text-gold flex-shrink-0" />
            <span className="text-xs font-semibold text-foreground tracking-wide">{step.highlight}</span>
          </div>

          {/* Upsell Banner */}
          {step.upsell && (
            <div className="mt-2 mb-4 animate-fade-in" style={{ animationDelay: '0.2s', animationFillMode: 'backwards' }}>
              <div className="rounded-xl border border-gold/20 bg-secondary/50 overflow-hidden">
                {/* Banner header */}
                <div className="flex items-center gap-2 px-4 py-2.5 bg-gold/10 border-b border-gold/15">
                  <Gift className="h-4 w-4 text-gold" />
                  <span className="text-xs font-semibold text-foreground tracking-wide uppercase">
                    {step.upsell.tagline}
                  </span>
                  <Star className="h-3 w-3 text-gold ml-auto" />
                </div>

                {/* Product cards */}
                <div className="p-3">
                  {getDisplayProducts(step.upsell.category).length > 0 ? (
                    <div className="grid grid-cols-3 gap-2">
                      {getDisplayProducts(step.upsell.category).map((product) => (
                        <button
                          key={product.id}
                          onClick={() => navigate(`/product/${product.id}`)}
                          className="group text-left rounded-lg bg-background border border-border/50 overflow-hidden transition-all duration-200 hover:border-gold/40 hover:shadow-sm active:scale-[0.97]"
                        >
                          <div className="aspect-square bg-secondary/80 flex items-center justify-center overflow-hidden">
                            {product.images?.[0] ? (
                              <img
                                src={product.images[0]}
                                alt={product.name}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                loading="lazy"
                              />
                            ) : (
                              <Smartphone className="h-6 w-6 text-muted-foreground/40" />
                            )}
                          </div>
                          <div className="p-2">
                            <p className="text-[11px] text-foreground/80 font-medium truncate leading-tight">
                              {product.name}
                            </p>
                            <p className="text-[11px] font-bold text-gold mt-0.5">
                              {formatPrice(product.price)}
                            </p>
                          </div>
                        </button>
                      ))}
                    </div>
                  ) : (
                    <div className="py-4 text-center">
                      <Zap className="h-6 w-6 text-gold/40 mx-auto mb-2" />
                      <p className="text-xs text-muted-foreground">Loading products...</p>
                    </div>
                  )}

                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full mt-3 h-8 text-xs font-medium border-gold/30 text-gold hover:bg-gold/10 hover:text-gold transition-all"
                    onClick={() => navigate('/shop')}
                  >
                    {step.upsell.cta}
                    <ArrowRight className="ml-1.5 h-3 w-3" />
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Step indicators */}
          <div className="flex items-center justify-center gap-2 mt-2 mb-4">
            {steps.map((_, i) => (
              <button
                key={i}
                onClick={() => { setDirection(i > currentStep ? 'forward' : 'backward'); setCurrentStep(i); }}
                className={`h-2 rounded-full transition-all duration-300 ${
                  i === currentStep
                    ? 'w-8 bg-gold'
                    : i < currentStep
                    ? 'w-2 bg-gold/40'
                    : 'w-2 bg-border'
                }`}
                aria-label={`Go to step ${i + 1}`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Navigation — refined spacing */}
      <div className="px-6 pb-10 pt-4">
        <div className="w-full max-w-md mx-auto flex items-center gap-3">
          {!isFirstStep && (
            <Button
              variant="outline"
              size="lg"
              onClick={goBack}
              className="h-13 px-6 rounded-xl border-border/60 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
          )}

          <Button
            variant="gold"
            size="lg"
            className="flex-1 h-13 text-base font-semibold rounded-xl group transition-all duration-300 hover:shadow-gold hover:scale-[1.02] active:scale-[0.98]"
            onClick={goNext}
          >
            {isLastStep ? 'Start Shopping' : 'Continue'}
            <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
          </Button>
        </div>

        {!isLastStep && (
          <button
            onClick={() => navigate('/shop')}
            className="block mx-auto mt-5 text-xs text-muted-foreground/60 hover:text-foreground transition-colors tracking-wide uppercase font-medium"
          >
            Skip tour
          </button>
        )}
      </div>
      <WhatsAppButton />
    </div>
  );
};

export default Welcome;
