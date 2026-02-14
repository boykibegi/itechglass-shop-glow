import { useState, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, SlidersHorizontal, Sparkles, Shield, Smartphone, Layers } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import WhatsAppButton from '@/components/WhatsAppButton';
import ProductCard from '@/components/ProductCard';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';
import shopHero from '@/assets/shop-hero.jpg';

const fetchProducts = async () => {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .gt('stock', 0)
    .order('created_at', { ascending: false });
  
  if (error) throw error;
  return data;
};

const Shop = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState('');
  
  const activeCategory = searchParams.get('category') || 'all';

  const { data: products, isLoading } = useQuery({
    queryKey: ['products'],
    queryFn: fetchProducts,
  });

  const categories = [
    { slug: 'all', name: 'All Products' },
    { slug: 'back-glass', name: 'Back Glass' },
    { slug: 'screen-glass', name: 'Screen Glass' },
    { slug: 'covers', name: 'Covers' },
  ];

  const filteredProducts = useMemo(() => {
    if (!products) return [];
    
    return products.filter((product) => {
      const matchesCategory = activeCategory === 'all' || product.category === activeCategory;
      const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.description?.toLowerCase().includes(searchQuery.toLowerCase());
      
      return matchesCategory && matchesSearch;
    });
  }, [products, activeCategory, searchQuery]);

  const handleCategoryChange = (slug: string) => {
    if (slug === 'all') {
      searchParams.delete('category');
    } else {
      searchParams.set('category', slug);
    }
    setSearchParams(searchParams);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      {/* Cinematic Shop Hero */}
      <section className="relative overflow-hidden text-primary-foreground py-24 md:py-36 lg:py-44">
        {/* Background image with Ken Burns zoom */}
        <img
          src={shopHero}
          alt=""
          className="absolute inset-0 w-full h-full object-cover"
          style={{ animation: 'shopHeroZoom 25s ease-in-out infinite alternate' }}
          aria-hidden="true"
        />

        {/* Multi-layer cinematic overlays */}
        <div className="absolute inset-0 bg-gradient-to-r from-primary/98 via-primary/80 to-primary/40" />
        <div className="absolute inset-0 bg-gradient-to-t from-primary via-primary/30 to-primary/60" />
        <div className="absolute inset-0 bg-gradient-to-br from-transparent via-gold/[0.03] to-transparent" />

        {/* Animated gold accent lines */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold/40 to-transparent" style={{ animation: 'heroLineSlide 4s ease-in-out infinite alternate' }} />
          <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold/30 to-transparent" />
          {/* Floating orbs */}
          <div className="absolute top-1/4 right-1/4 w-80 h-80 bg-gold/[0.04] rounded-full blur-[100px]" style={{ animation: 'heroOrbFloat 8s ease-in-out infinite alternate' }} />
          <div className="absolute bottom-0 left-1/6 w-96 h-96 bg-gold/[0.03] rounded-full blur-[120px]" style={{ animation: 'heroOrbFloat 10s ease-in-out infinite alternate-reverse' }} />
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary-foreground/[0.02] rounded-full blur-[80px]" style={{ animation: 'heroOrbFloat 12s ease-in-out infinite alternate' }} />
        </div>

        {/* Watermark / ambient text */}
        <div className="absolute inset-0 pointer-events-none select-none overflow-hidden">
          <span
            className="absolute -right-10 top-1/2 -translate-y-1/2 text-[12rem] md:text-[18rem] font-bold uppercase tracking-tighter text-primary-foreground/[0.02] leading-none"
            style={{ animation: 'heroTextDrift 20s ease-in-out infinite alternate' }}
            aria-hidden="true"
          >
            {activeCategory === 'all' ? 'LUXURY' : activeCategory === 'back-glass' ? 'GLASS' : activeCategory === 'screen-glass' ? 'SHIELD' : 'STYLE'}
          </span>
        </div>

        <div className="container relative z-10">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-8">
            <div className="space-y-5 max-w-xl">
              {/* Animated tag */}
              <div
                className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-gold/20 backdrop-blur-md"
                style={{ background: 'hsl(43 74% 49% / 0.08)', animation: 'fade-in 0.6s ease-out 0.2s backwards' }}
              >
                <Sparkles className="h-3.5 w-3.5 text-gold animate-[heroSparkle_2s_ease-in-out_infinite]" />
                <span className="text-[11px] font-semibold text-gold uppercase tracking-[0.15em]">
                  {activeCategory === 'all' ? 'Curated Collection' : categories.find(c => c.slug === activeCategory)?.name}
                </span>
              </div>

              {/* Main heading with staggered reveal */}
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight leading-[0.95]" style={{ animation: 'fade-in 0.8s ease-out 0.35s backwards' }}>
                {activeCategory === 'all' ? (
                  <>
                    <span className="block">Our</span>
                    <span className="block text-gradient-gold">Collection</span>
                  </>
                ) : activeCategory === 'back-glass' ? (
                  <>
                    <span className="block">Back</span>
                    <span className="block text-gradient-gold">Glass</span>
                  </>
                ) : activeCategory === 'screen-glass' ? (
                  <>
                    <span className="block">Screen</span>
                    <span className="block text-gradient-gold">Glass</span>
                  </>
                ) : (
                  <>
                    <span className="block">Premium</span>
                    <span className="block text-gradient-gold">Covers</span>
                  </>
                )}
              </h1>

              {/* Accent divider */}
              <div className="flex items-center gap-3" style={{ animation: 'fade-in 0.6s ease-out 0.5s backwards' }}>
                <div className="h-px w-12 bg-gradient-to-r from-gold/60 to-gold/0" />
                <span className="text-[10px] text-gold/50 uppercase tracking-[0.2em] font-medium">Since 2024</span>
              </div>

              <p className="text-primary-foreground/45 max-w-md text-sm md:text-base leading-relaxed" style={{ animation: 'fade-in 0.6s ease-out 0.55s backwards' }}>
                {activeCategory === 'all'
                  ? 'Curated accessories crafted for perfection — where protection meets luxury.'
                  : activeCategory === 'back-glass'
                  ? 'Crystal-clear replacement glass with precise cutouts and OEM-grade quality.'
                  : activeCategory === 'screen-glass'
                  ? '9H tempered glass with edge-to-edge clarity and anti-fingerprint coating.'
                  : 'Elegant cases in leather, silicone, and MagSafe — style meets defense.'}
              </p>
            </div>

            {/* Floating category cards */}
            <div className="hidden md:flex items-end gap-3" style={{ animation: 'fade-in 0.7s ease-out 0.6s backwards' }}>
              {[
                { icon: Layers, label: 'Back Glass', stat: 'OEM Grade' },
                { icon: Smartphone, label: 'Screens', stat: '9H Hardness' },
                { icon: Shield, label: 'Covers', stat: 'MagSafe Ready' },
              ].map(({ icon: Icon, label, stat }, i) => (
                <div
                  key={label}
                  className="group flex flex-col items-center gap-2 px-5 py-4 rounded-2xl border border-primary-foreground/[0.08] backdrop-blur-md hover:border-gold/25 transition-all duration-500 hover:-translate-y-1"
                  style={{
                    background: 'hsl(0 0% 100% / 0.04)',
                    animation: `fade-in 0.5s ease-out ${0.7 + i * 0.1}s backwards`,
                  }}
                >
                  <Icon className="h-5 w-5 text-gold/60 group-hover:text-gold transition-colors duration-300" />
                  <span className="text-[10px] text-primary-foreground/50 uppercase tracking-[0.15em] font-medium">{label}</span>
                  <span className="text-[9px] text-gold/40 font-medium tracking-wider">{stat}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <main className="flex-1 py-12">
        <div className="container">
          {/* Filters */}
          <div className="flex flex-col md:flex-row gap-4 mb-8">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Category filters */}
            <div className="flex flex-wrap gap-2">
              {categories.map((category) => (
                <Button
                  key={category.slug}
                  variant={activeCategory === category.slug ? 'gold' : 'outline'}
                  size="sm"
                  onClick={() => handleCategoryChange(category.slug)}
                >
                  {category.name}
                </Button>
              ))}
            </div>
          </div>

          {/* Results count */}
          <p className="text-sm text-muted-foreground mb-6">
            {filteredProducts.length} product{filteredProducts.length !== 1 ? 's' : ''} found
          </p>

          {/* Products Grid */}
          {isLoading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 md:gap-4">
              {[...Array(10)].map((_, i) => (
                <div key={i} className="bg-card rounded-xl overflow-hidden border border-border/50 animate-pulse">
                  <div className="aspect-[4/5] bg-muted" />
                  <div className="p-3 space-y-2">
                    <div className="h-4 bg-muted rounded w-full" />
                    <div className="h-4 bg-muted rounded w-2/3" />
                    <div className="h-5 bg-muted rounded w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          ) : filteredProducts.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 md:gap-4">
              {filteredProducts.map((product) => (
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
            <div className="text-center py-16">
              <SlidersHorizontal className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No products found</h3>
              <p className="text-muted-foreground mb-6">
                Try adjusting your search or filter criteria
              </p>
              <Button variant="outline" onClick={() => { setSearchQuery(''); handleCategoryChange('all'); }}>
                Clear Filters
              </Button>
            </div>
          )}
        </div>
      </main>

      <Footer />
      <WhatsAppButton />
    </div>
  );
};

export default Shop;
