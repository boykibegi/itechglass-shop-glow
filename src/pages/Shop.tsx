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
      
      {/* Premium Page Header */}
      <section className="relative overflow-hidden bg-gradient-hero text-primary-foreground py-20 md:py-24">
        {/* Decorative elements */}
        <div className="absolute inset-0">
          <div className="absolute top-0 right-0 w-96 h-96 bg-gold/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3" />
          <div className="absolute bottom-0 left-0 w-72 h-72 bg-gold/3 rounded-full blur-3xl translate-y-1/2 -translate-x-1/4" />
          <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold/20 to-transparent" />
        </div>

        <div className="container relative z-10">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gold/10 border border-gold/20">
                <Sparkles className="h-3.5 w-3.5 text-gold" />
                <span className="text-xs font-semibold text-gold uppercase tracking-wider">
                  {activeCategory === 'all' ? 'All Collections' : categories.find(c => c.slug === activeCategory)?.name}
                </span>
              </div>
              <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
                {activeCategory === 'all' ? (
                  <>Our <span className="text-gradient-gold">Collection</span></>
                ) : activeCategory === 'back-glass' ? (
                  <>Back <span className="text-gradient-gold">Glass</span></>
                ) : activeCategory === 'screen-glass' ? (
                  <>Screen <span className="text-gradient-gold">Glass</span></>
                ) : (
                  <>Premium <span className="text-gradient-gold">Covers</span></>
                )}
              </h1>
              <p className="text-primary-foreground/50 max-w-md text-sm md:text-base leading-relaxed">
                {activeCategory === 'all'
                  ? 'Curated accessories crafted for perfection — protection meets luxury.'
                  : activeCategory === 'back-glass'
                  ? 'Crystal-clear replacement glass with precise cutouts and OEM-grade quality.'
                  : activeCategory === 'screen-glass'
                  ? '9H tempered glass with edge-to-edge clarity and anti-fingerprint coating.'
                  : 'Elegant cases in leather, silicone, and MagSafe — style meets defense.'}
              </p>
            </div>

            {/* Category icons */}
            <div className="hidden md:flex items-center gap-3">
              {[
                { icon: Layers, label: 'Back Glass' },
                { icon: Smartphone, label: 'Screens' },
                { icon: Shield, label: 'Covers' },
              ].map(({ icon: Icon, label }) => (
                <div key={label} className="flex flex-col items-center gap-1.5 px-4 py-3 rounded-xl bg-primary-foreground/5 border border-primary-foreground/10">
                  <Icon className="h-5 w-5 text-gold/70" />
                  <span className="text-[10px] text-primary-foreground/40 uppercase tracking-wider font-medium">{label}</span>
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
