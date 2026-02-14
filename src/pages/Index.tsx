import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Shield, Truck, Award, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import WhatsAppButton from '@/components/WhatsAppButton';
import ProductCard from '@/components/ProductCard';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';
import heroBg from '@/assets/hero-bg.jpg';

const fetchFeaturedProducts = async () => {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('featured', true)
    .limit(6);
  if (error) throw error;
  return data;
};

const fetchAllProducts = async () => {
  const { data, error } = await supabase
    .from('products')
    .select('id, name, price, images, category')
    .limit(8);
  if (error) throw error;
  return data;
};

const Index = () => {
  const { data: featuredProducts, isLoading } = useQuery({
    queryKey: ['featured-products'],
    queryFn: fetchFeaturedProducts,
  });

  const { data: galleryProducts } = useQuery({
    queryKey: ['gallery-products'],
    queryFn: fetchAllProducts,
  });

  const [activeSlide, setActiveSlide] = useState(0);
  const heroItems = galleryProducts?.filter(p => p.images?.[0]) || [];

  const nextSlide = useCallback(() => {
    if (heroItems.length > 0) {
      setActiveSlide((prev) => (prev + 1) % heroItems.length);
    }
  }, [heroItems.length]);

  const prevSlide = useCallback(() => {
    if (heroItems.length > 0) {
      setActiveSlide((prev) => (prev - 1 + heroItems.length) % heroItems.length);
    }
  }, [heroItems.length]);

  // Auto-rotate gallery
  useEffect(() => {
    if (heroItems.length <= 1) return;
    const interval = setInterval(nextSlide, 4000);
    return () => clearInterval(interval);
  }, [nextSlide, heroItems.length]);

  const categories = [
    {
      name: 'Back Glass',
      slug: 'back-glass',
      description: 'Premium replacement glass for iPhone backs',
      image: 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=400&h=400&fit=crop',
    },
    {
      name: 'Screen Glass',
      slug: 'screen-glass',
      description: 'Crystal-clear screen protectors',
      image: 'https://images.unsplash.com/photo-1601784551446-20c9e07cdbdb?w=400&h=400&fit=crop',
    },
    {
      name: 'Covers',
      slug: 'covers',
      description: 'Stylish and protective cases',
      image: 'https://images.unsplash.com/photo-1609081219090-a6d81d3085bf?w=400&h=400&fit=crop',
    },
  ];

  const features = [
    { icon: Shield, title: 'Premium Quality', description: 'Only the finest materials for lasting protection' },
    { icon: Truck, title: 'Fast Delivery', description: 'Quick shipping across Tanzania' },
    { icon: Award, title: 'Warranty Included', description: 'Every product backed by our guarantee' },
  ];

  const currentProduct = heroItems[activeSlide];

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      {/* ═══ LUXURY HERO ═══ */}
      <section className="relative min-h-[85vh] flex items-center overflow-hidden">
        {/* Background image */}
        <img
          src={heroBg}
          alt=""
          className="absolute inset-0 w-full h-full object-cover"
          aria-hidden="true"
        />
        {/* Overlays */}
        <div className="absolute inset-0 bg-gradient-to-r from-primary/95 via-primary/70 to-primary/40" />
        <div className="absolute inset-0 bg-gradient-to-t from-primary via-transparent to-primary/30" />

        <div className="container relative z-10 py-20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            {/* Left — Text */}
            <div className="space-y-8 animate-fade-in">
              <div className="space-y-2">
                <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gold/10 border border-gold/20 text-gold text-xs font-semibold uppercase tracking-[0.2em]">
                  <span className="w-1.5 h-1.5 rounded-full bg-gold animate-pulse" />
                  New Collection Available
                </span>
              </div>

              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight leading-[1.08] text-primary-foreground">
                Protect Your
                <br />
                iPhone with
                <br />
                <span className="text-gradient-gold">Premium Glass</span>
              </h1>

              <p className="text-lg text-primary-foreground/60 max-w-md leading-relaxed">
                Discover our curated collection of high-quality back glass, screen protectors, and stylish covers.
              </p>

              <div className="flex flex-wrap gap-4 pt-2">
                <Button asChild variant="hero-gold" size="xl">
                  <Link to="/shop">
                    Shop Now
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
                <Button asChild variant="outline-white" size="xl">
                  <Link to="/shop?category=back-glass">
                    Explore Back Glass
                  </Link>
                </Button>
              </div>

              {/* Stats */}
              <div className="flex gap-10 pt-4">
                {[
                  { value: '500+', label: 'Happy Customers' },
                  { value: '50+', label: 'Products' },
                  { value: '24h', label: 'Delivery' },
                ].map((stat) => (
                  <div key={stat.label}>
                    <p className="text-2xl font-bold text-gold">{stat.value}</p>
                    <p className="text-xs text-primary-foreground/40 uppercase tracking-wider mt-0.5">{stat.label}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Right — Dynamic Product Gallery */}
            <div className="relative hidden lg:block animate-fade-in" style={{ animationDelay: '0.3s', animationFillMode: 'backwards' }}>
              {heroItems.length > 0 && currentProduct ? (
                <div className="relative">
                  {/* Main showcase card */}
                  <div className="relative rounded-2xl overflow-hidden border border-gold/20 shadow-[0_20px_60px_-15px_hsl(43_74%_49%/0.2)] bg-card/5 backdrop-blur-sm">
                    <Link to={`/product/${currentProduct.id}`} className="block">
                      <div className="aspect-[4/5] relative overflow-hidden">
                        <img
                          key={activeSlide}
                          src={currentProduct.images?.[0] || '/placeholder.svg'}
                          alt={currentProduct.name}
                          className="w-full h-full object-cover animate-fade-in"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-primary/80 via-transparent to-transparent" />
                      </div>
                      <div className="absolute bottom-0 left-0 right-0 p-6">
                        <span className="text-xs text-gold font-semibold uppercase tracking-wider">
                          {currentProduct.category.replace('-', ' ')}
                        </span>
                        <h3 className="text-xl font-bold text-primary-foreground mt-1 leading-tight">
                          {currentProduct.name}
                        </h3>
                        <p className="text-lg font-bold text-gold mt-2">
                          TSh {Number(currentProduct.price).toLocaleString()}
                        </p>
                      </div>
                    </Link>
                  </div>

                  {/* Gallery navigation */}
                  <div className="flex items-center justify-between mt-4">
                    <div className="flex gap-1.5">
                      {heroItems.map((_, i) => (
                        <button
                          key={i}
                          onClick={() => setActiveSlide(i)}
                          className={`h-1 rounded-full transition-all duration-500 ${
                            i === activeSlide ? 'w-8 bg-gold' : 'w-3 bg-primary-foreground/20'
                          }`}
                        />
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={prevSlide}
                        className="w-9 h-9 rounded-full border border-primary-foreground/20 flex items-center justify-center text-primary-foreground/60 hover:border-gold hover:text-gold transition-colors"
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </button>
                      <button
                        onClick={nextSlide}
                        className="w-9 h-9 rounded-full border border-primary-foreground/20 flex items-center justify-center text-primary-foreground/60 hover:border-gold hover:text-gold transition-colors"
                      >
                        <ChevronRight className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  {/* Floating thumbnails */}
                  <div className="absolute -left-6 top-1/2 -translate-y-1/2 space-y-3 hidden xl:block">
                    {heroItems.slice(0, 4).map((item, i) => (
                      <button
                        key={item.id}
                        onClick={() => setActiveSlide(i)}
                        className={`w-16 h-16 rounded-xl overflow-hidden border-2 transition-all duration-300 shadow-lg ${
                          i === activeSlide ? 'border-gold scale-110' : 'border-primary-foreground/10 opacity-60 hover:opacity-100'
                        }`}
                      >
                        <img src={item.images?.[0] || '/placeholder.svg'} alt="" className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="aspect-[4/5] rounded-2xl bg-secondary/20 animate-pulse" />
              )}
            </div>
          </div>
        </div>

        {/* Bottom shimmer line */}
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold/30 to-transparent" />
      </section>

      {/* ═══ FEATURES ═══ */}
      <section className="py-16 border-b border-border">
        <div className="container">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feature) => (
              <div key={feature.title} className="flex items-start gap-4 p-6 rounded-xl bg-secondary/50 border border-border/50 hover:border-gold/20 transition-colors">
                <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-gold/10 border border-gold/15 flex items-center justify-center">
                  <feature.icon className="h-5 w-5 text-gold" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground mt-1">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ CATEGORIES ═══ */}
      <section className="py-20">
        <div className="container">
          <div className="text-center mb-12">
            <span className="text-gold text-xs font-semibold uppercase tracking-[0.2em]">Collections</span>
            <h2 className="text-3xl md:text-4xl font-bold mt-2 mb-4">Shop by Category</h2>
            <p className="text-muted-foreground max-w-lg mx-auto">
              Find the perfect protection for your iPhone from our curated collections
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {categories.map((category) => (
              <Link
                key={category.slug}
                to={`/shop?category=${category.slug}`}
                className="group relative overflow-hidden rounded-2xl aspect-[4/5] hover-lift"
              >
                <img
                  src={category.image}
                  alt={category.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-primary via-primary/40 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-6 text-primary-foreground">
                  <h3 className="text-2xl font-bold mb-2">{category.name}</h3>
                  <p className="text-sm text-primary-foreground/70 mb-4">{category.description}</p>
                  <span className="inline-flex items-center text-gold text-sm font-semibold group-hover:gap-2 transition-all">
                    Shop Now <ArrowRight className="h-4 w-4 ml-1" />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ FEATURED PRODUCTS ═══ */}
      <section className="py-20 bg-secondary/30">
        <div className="container">
          <div className="flex items-center justify-between mb-12">
            <div>
              <span className="text-gold text-xs font-semibold uppercase tracking-[0.2em]">Bestsellers</span>
              <h2 className="text-3xl md:text-4xl font-bold mt-2 mb-1">Featured Products</h2>
              <p className="text-muted-foreground">Our most popular items</p>
            </div>
            <Button asChild variant="outline">
              <Link to="/shop">View All</Link>
            </Button>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="bg-card rounded-xl overflow-hidden border border-border animate-pulse">
                  <div className="aspect-[4/5] bg-muted" />
                  <div className="p-4 space-y-3">
                    <div className="h-3 bg-muted rounded w-1/3" />
                    <div className="h-4 bg-muted rounded w-2/3" />
                    <div className="h-5 bg-muted rounded w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          ) : featuredProducts && featuredProducts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {featuredProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  id={product.id}
                  name={product.name}
                  price={Number(product.price)}
                  image={product.images?.[0] || '/placeholder.svg'}
                  category={product.category}
                  compatibleModels={product.compatible_models || []}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground mb-4">No featured products yet.</p>
              <Button asChild variant="outline">
                <Link to="/shop">Browse All Products</Link>
              </Button>
            </div>
          )}
        </div>
      </section>

      {/* ═══ CTA ═══ */}
      <section className="relative py-24 overflow-hidden">
        <img src={heroBg} alt="" className="absolute inset-0 w-full h-full object-cover" aria-hidden="true" />
        <div className="absolute inset-0 bg-primary/80" />
        <div className="container relative z-10 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-primary-foreground">
            Ready to Protect Your iPhone?
          </h2>
          <p className="text-primary-foreground/60 max-w-lg mx-auto mb-8">
            Join thousands of satisfied customers who trust iTechGlass for premium iPhone protection.
          </p>
          <Button asChild variant="hero-gold" size="xl">
            <Link to="/shop">
              Start Shopping
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
        </div>
      </section>

      <Footer />
      <WhatsAppButton />
    </div>
  );
};

export default Index;
