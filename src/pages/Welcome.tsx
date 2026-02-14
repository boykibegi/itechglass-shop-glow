import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import {
  Smartphone, Sparkles, ShoppingBag, ArrowRight, ArrowLeft,
  CheckCircle, Shield, Truck, MessageCircle, User, Search
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { Progress } from '@/components/ui/progress';

interface OnboardingStep {
  icon: React.ElementType;
  title: string;
  description: string;
  highlight: string;
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
  },
  {
    icon: Shield,
    title: 'Premium Quality',
    description: 'Every product is carefully selected for durability and style. We stand behind our products with a quality warranty.',
    highlight: 'All products come with warranty coverage',
  },
  {
    icon: Truck,
    title: 'Fast Delivery',
    description: 'We deliver across Tanzania with real-time order tracking so you always know where your order is.',
    highlight: 'Track your order live on the map',
  },
  {
    icon: MessageCircle,
    title: 'We\'re Here to Help',
    description: 'Need assistance? Reach out via WhatsApp for instant support. We\'re always happy to help you find the right product.',
    highlight: 'Tap the WhatsApp button anytime',
  },
];

const Welcome = () => {
  const navigate = useNavigate();
  const { user, isLoading } = useAuth();
  const [currentStep, setCurrentStep] = useState(0);
  const [direction, setDirection] = useState<'forward' | 'backward'>('forward');

  useEffect(() => {
    if (!isLoading && !user) {
      navigate('/');
    }
  }, [user, isLoading, navigate]);

  const progress = ((currentStep + 1) / steps.length) * 100;
  const step = steps[currentStep];
  const StepIcon = step.icon;
  const isLastStep = currentStep === steps.length - 1;
  const isFirstStep = currentStep === 0;

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
      <div className="flex-1 flex items-center justify-center px-6 py-8">
        <div key={currentStep} className="w-full max-w-md text-center animate-fade-in">
          {/* Icon */}
          <div className="w-20 h-20 rounded-2xl bg-gold/10 border border-gold/20 flex items-center justify-center mx-auto mb-6">
            <StepIcon className="h-10 w-10 text-gold" />
          </div>

          {/* Title */}
          <h2 className="text-2xl lg:text-3xl font-bold text-foreground mb-3">
            {step.title}
          </h2>

          {/* Description */}
          <p className="text-muted-foreground text-base lg:text-lg mb-6 leading-relaxed">
            {step.description}
          </p>

          {/* Highlight card */}
          <div className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-gold/10 border border-gold/20 mb-8">
            <Sparkles className="h-4 w-4 text-gold flex-shrink-0" />
            <span className="text-sm font-medium text-foreground">{step.highlight}</span>
          </div>

          {/* Step indicators */}
          <div className="flex items-center justify-center gap-2 mb-8">
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
