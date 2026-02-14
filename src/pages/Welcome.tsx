import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import {
  Smartphone, Sparkles, ShoppingBag, ArrowRight, ArrowLeft,
  CheckCircle, Shield, Truck, MessageCircle, Search, Zap, Star, Gift
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
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
      {/* Header */}
      <div className="bg-gradient-hero px-6 pt-safe-top pb-10 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,hsl(var(--gold)/0.2),transparent_60%)]" />
        <div className="relative z-10 flex flex-col items-center pt-8">
          <div className="w-14 h-14 rounded-2xl bg-gold/20 backdrop-blur-sm flex items-center justify-center mb-3 border border-gold/30 animate-fade-in">
            <Smartphone className="h-7 w-7 text-gold" />
          </div>
          <h1 className="text-xl font-bold text-primary-foreground animate-fade-in" style={{ animationDelay: '0.1s', animationFillMode: 'backwards' }}>
            iTech<span className="text-gold">Glass</span>
          </h1>
        </div>
      </div>

      {/* Progress */}
      <div className="px-6 -mt-1">
        <Progress value={progress} className="h-1.5 bg-secondary" />
        <p className="text-xs text-muted-foreground text-right mt-1.5">
          {currentStep + 1} of {steps.length}
        </p>
      </div>

      {/* Step Content */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-6 overflow-y-auto">
        <div key={currentStep} className="w-full max-w-md text-center animate-fade-in">
          {/* Icon */}
          <div className="w-16 h-16 rounded-2xl bg-gold/10 border border-gold/20 flex items-center justify-center mx-auto mb-5">
            <StepIcon className="h-8 w-8 text-gold" />
          </div>

          {/* Title */}
          <h2 className="text-2xl lg:text-3xl font-bold text-foreground mb-2">
            {step.title}
          </h2>

          {/* Description */}
          <p className="text-muted-foreground text-sm lg:text-base mb-4 leading-relaxed">
            {step.description}
          </p>

          {/* Highlight pill */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gold/10 border border-gold/20 mb-5">
            <Sparkles className="h-3.5 w-3.5 text-gold flex-shrink-0" />
            <span className="text-xs font-medium text-foreground">{step.highlight}</span>
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

      {/* Bottom Navigation */}
      <div className="px-6 pb-8 pt-2">
        <div className="w-full max-w-md mx-auto flex items-center gap-3">
          {!isFirstStep && (
            <Button
              variant="outline"
              size="lg"
              onClick={goBack}
              className="h-12 px-5 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
          )}

          <Button
            variant="gold"
            size="lg"
            className="flex-1 h-12 text-base font-semibold group transition-all duration-300 hover:shadow-gold hover:scale-[1.02] active:scale-[0.98]"
            onClick={goNext}
          >
            {isLastStep ? 'Start Shopping' : 'Next'}
            <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
          </Button>
        </div>

        {!isLastStep && (
          <button
            onClick={() => navigate('/shop')}
            className="block mx-auto mt-4 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            Skip tour
          </button>
        )}
      </div>
    </div>
  );
};

export default Welcome;
