import { Link } from 'react-router-dom';
import { ArrowRight, Shield, Truck, Award } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import WhatsAppButton from '@/components/WhatsAppButton';
import ProductCard from '@/components/ProductCard';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';

const fetchFeaturedProducts = async () => {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('featured', true)
    .limit(4);
  
  if (error) throw error;
  return data;
};

const Index = () => {
  const { data: featuredProducts, isLoading } = useQuery({
    queryKey: ['featured-products'],
    queryFn: fetchFeaturedProducts,
  });

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
    {
      icon: Shield,
      title: 'Premium Quality',
      description: 'Only the finest materials for lasting protection',
    },
    {
      icon: Truck,
      title: 'Fast Delivery',
      description: 'Quick shipping across Tanzania',
    },
    {
      icon: Award,
      title: 'Warranty Included',
      description: 'Every product backed by our guarantee',
    },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      {/* Hero Section */}
      <section className="relative bg-gradient-hero text-primary-foreground">
        <div className="container py-24 md:py-32">
          <div className="max-w-2xl space-y-6 animate-fade-in">
            <span className="text-gold text-sm font-semibold uppercase tracking-widest">
              Premium iPhone Accessories
            </span>
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight leading-tight">
              Protect Your iPhone with{' '}
              <span className="text-gradient-gold">Premium Glass</span>
            </h1>
            <p className="text-lg text-primary-foreground/70 max-w-lg">
              Discover our collection of high-quality back glass, screen protectors, and stylish covers designed for your iPhone.
            </p>
            <div className="flex flex-wrap gap-4 pt-4">
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
          </div>
        </div>
        
        {/* Decorative element */}
        <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-gold/5 to-transparent pointer-events-none" />
      </section>

      {/* Features */}
      <section className="py-16 border-b border-border">
        <div className="container">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feature) => (
              <div key={feature.title} className="flex items-start gap-4 p-6 rounded-lg bg-secondary/50">
                <div className="flex-shrink-0 w-12 h-12 rounded-full bg-gold/10 flex items-center justify-center">
                  <feature.icon className="h-6 w-6 text-gold" />
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

      {/* Categories */}
      <section className="py-20">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Shop by Category</h2>
            <p className="text-muted-foreground max-w-lg mx-auto">
              Find the perfect protection for your iPhone from our curated collections
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {categories.map((category) => (
              <Link
                key={category.slug}
                to={`/shop?category=${category.slug}`}
                className="group relative overflow-hidden rounded-xl aspect-[4/5] hover-lift"
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

      {/* Featured Products */}
      <section className="py-20 bg-secondary/30">
        <div className="container">
          <div className="flex items-center justify-between mb-12">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold mb-2">Featured Products</h2>
              <p className="text-muted-foreground">Our most popular items</p>
            </div>
            <Button asChild variant="outline">
              <Link to="/shop">View All</Link>
            </Button>
          </div>
          
          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="bg-card rounded-lg overflow-hidden border border-border animate-pulse">
                  <div className="aspect-square bg-muted" />
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

      {/* CTA */}
      <section className="py-20 bg-gradient-hero text-primary-foreground">
        <div className="container text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to Protect Your iPhone?
          </h2>
          <p className="text-primary-foreground/70 max-w-lg mx-auto mb-8">
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
