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
import { useLanguage } from '@/hooks/useLanguage';
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
  const { t } = useLanguage();

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

  useEffect(() => {
    if (heroItems.length <= 1) return;
    const interval = setInterval(nextSlide, 4000);
    return () => clearInterval(interval);
  }, [nextSlide, heroItems.length]);

  const { data: categoryImages } = useQuery({
    queryKey: ['category-images'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products')
        .select('category, images')
        .not('images', 'is', null)
        .order('created_at', { ascending: false });
      if (error) throw error;
      const map: Record<string, string> = {};
      for (const p of data || []) {
        if (!map[p.category] && p.images?.[0]) {
          map[p.category] = p.images[0];
        }
      }
      return map;
    },
  });

  const categories = [
    {
      name: t('nav.backGlass'),
      slug: 'back-glass',
      description: t('category.backGlassDesc'),
      image: categoryImages?.['back-glass'] || '/placeholder.svg',
    },
    {
      name: t('nav.screenGlass'),
      slug: 'screen-glass',
      description: t('category.screenGlassDesc'),
      image: categoryImages?.['screen-glass'] || '/placeholder.svg',
    },
    {
      name: t('nav.covers'),
      slug: 'covers',
      description: t('category.coversDesc'),
      image: categoryImages?.['covers'] || '/placeholder.svg',
    },
  ];

  const features = [
    { icon: Shield, title: t('feature.premiumQuality'), description: t('feature.premiumQualityDesc') },
    { icon: Truck, title: t('feature.fastDelivery'), description: t('feature.fastDeliveryDesc') },
    { icon: Award, title: t('feature.warrantyIncluded'), description: t('feature.warrantyIncludedDesc') },
  ];

  const currentProduct = heroItems[activeSlide];

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      {/* ═══ LUXURY HERO ═══ */}
      <section className="relative min-h-[85vh] flex items-center overflow-hidden">
        <img src={heroBg} alt="" className="absolute inset-0 w-full h-full object-cover" aria-hidden="true" />
        <div className="absolute inset-0 bg-gradient-to-r from-primary/95 via-primary/70 to-primary/40" />
        <div className="absolute inset-0 bg-gradient-to-t from-primary via-transparent to-primary/30" />

        <div className="container relative z-10 py-20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            <div className="space-y-8 animate-fade-in">
              <div className="space-y-2">
                <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gold/10 border border-gold/20 text-gold text-xs font-semibold uppercase tracking-[0.2em]">
                  <span className="w-1.5 h-1.5 rounded-full bg-gold animate-pulse" />
                  {t('hero.badge')}
                </span>
              </div>

              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight leading-[1.08] text-primary-foreground">
                {t('hero.title1')}
                <br />
                {t('hero.title2')}
                <br />
                <span className="text-gradient-gold">{t('hero.title3')}</span>
              </h1>

              <p className="text-lg text-primary-foreground/60 max-w-md leading-relaxed">
                {t('hero.description')}
              </p>

              <div className="flex flex-wrap gap-4 pt-2">
                <Button asChild variant="hero-gold" size="xl">
                  <Link to="/shop">
                    {t('hero.shopNow')}
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
                <Button asChild variant="outline-white" size="xl">
                  <Link to="/shop?category=back-glass">
                    {t('hero.exploreBackGlass')}
                  </Link>
                </Button>
              </div>

              <div className="flex gap-10 pt-4">
                {[
                  { value: '500+', label: t('hero.happyCustomers') },
                  { value: '50+', label: t('hero.products') },
                  { value: '24h', label: t('hero.delivery') },
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
                  <div className="relative rounded-2xl overflow-hidden border border-gold/20 shadow-[0_20px_60px_-15px_hsl(43_74%_49%/0.2)] bg-card/5 backdrop-blur-sm">
                    <Link to={`/product/${currentProduct.id}`} className="block">
                      <div className="aspect-[4/5] relative overflow-hidden">
                        <img key={activeSlide} src={currentProduct.images?.[0] || '/placeholder.svg'} alt={currentProduct.name} className="w-full h-full object-cover animate-fade-in" />
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

                  <div className="flex items-center justify-between mt-4">
                    <div className="flex gap-1.5">
                      {heroItems.map((_, i) => (
                        <button key={i} onClick={() => setActiveSlide(i)} className={`h-1 rounded-full transition-all duration-500 ${i === activeSlide ? 'w-8 bg-gold' : 'w-3 bg-primary-foreground/20'}`} />
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <button onClick={prevSlide} className="w-9 h-9 rounded-full border border-primary-foreground/20 flex items-center justify-center text-primary-foreground/60 hover:border-gold hover:text-gold transition-colors">
                        <ChevronLeft className="h-4 w-4" />
                      </button>
                      <button onClick={nextSlide} className="w-9 h-9 rounded-full border border-primary-foreground/20 flex items-center justify-center text-primary-foreground/60 hover:border-gold hover:text-gold transition-colors">
                        <ChevronRight className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  <div className="absolute -left-6 top-1/2 -translate-y-1/2 space-y-3 hidden xl:block">
                    {heroItems.slice(0, 4).map((item, i) => (
                      <button key={item.id} onClick={() => setActiveSlide(i)} className={`w-16 h-16 rounded-xl overflow-hidden border-2 transition-all duration-300 shadow-lg ${i === activeSlide ? 'border-gold scale-110' : 'border-primary-foreground/10 opacity-60 hover:opacity-100'}`}>
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
            <span className="text-gold text-xs font-semibold uppercase tracking-[0.2em]">{t('category.collections')}</span>
            <h2 className="text-3xl md:text-4xl font-bold mt-2 mb-4">{t('category.shopByCategory')}</h2>
            <p className="text-muted-foreground max-w-lg mx-auto">
              {t('category.shopByCategoryDesc')}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {categories.map((category) => (
              <Link key={category.slug} to={`/shop?category=${category.slug}`} className="group relative overflow-hidden rounded-2xl aspect-[4/5] hover-lift">
                <img src={category.image} alt={category.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                <div className="absolute inset-0 bg-gradient-to-t from-primary via-primary/40 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-6 text-primary-foreground">
                  <h3 className="text-2xl font-bold mb-2">{category.name}</h3>
                  <p className="text-sm text-primary-foreground/70 mb-4">{category.description}</p>
                  <span className="inline-flex items-center text-gold text-sm font-semibold group-hover:gap-2 transition-all">
                    {t('common.shopNow')} <ArrowRight className="h-4 w-4 ml-1" />
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
              <span className="text-gold text-xs font-semibold uppercase tracking-[0.2em]">{t('featured.bestsellers')}</span>
              <h2 className="text-3xl md:text-4xl font-bold mt-2 mb-1">{t('featured.title')}</h2>
              <p className="text-muted-foreground">{t('featured.subtitle')}</p>
            </div>
            <Button asChild variant="outline">
              <Link to="/shop">{t('featured.viewAll')}</Link>
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
              <p className="text-muted-foreground mb-4">{t('featured.noProducts')}</p>
              <Button asChild variant="outline">
                <Link to="/shop">{t('featured.browseAll')}</Link>
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
            {t('cta.title')}
          </h2>
          <p className="text-primary-foreground/60 max-w-lg mx-auto mb-8">
            {t('cta.description')}
          </p>
          <Button asChild variant="hero-gold" size="xl">
            <Link to="/shop">
              {t('cta.startShopping')}
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
