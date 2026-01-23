import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Minus, Plus, ShoppingCart, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import WhatsAppButton from '@/components/WhatsAppButton';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';
import { useCart } from '@/lib/cart';
import { toast } from 'sonner';

const fetchProduct = async (id: string) => {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('id', id)
    .single();
  
  if (error) throw error;
  return data;
};

const ProductDetail = () => {
  const { id } = useParams<{ id: string }>();
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedModel, setSelectedModel] = useState<string>('');
  const [quantity, setQuantity] = useState(1);
  const { addItem } = useCart();

  const { data: product, isLoading, error } = useQuery({
    queryKey: ['product', id],
    queryFn: () => fetchProduct(id!),
    enabled: !!id,
  });

  const handleAddToCart = () => {
    if (!product) return;
    
    if (product.compatible_models && product.compatible_models.length > 0 && !selectedModel) {
      toast.error('Please select an iPhone model');
      return;
    }

    addItem({
      productId: product.id,
      name: product.name,
      price: Number(product.price),
      quantity,
      image: product.images?.[0] || '/placeholder.svg',
      selectedModel: selectedModel || 'Universal',
    });

    toast.success('Added to cart!', {
      description: `${quantity}x ${product.name}`,
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 py-12">
          <div className="container">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              <div className="aspect-square bg-muted rounded-lg animate-pulse" />
              <div className="space-y-6">
                <div className="h-8 bg-muted rounded w-3/4 animate-pulse" />
                <div className="h-6 bg-muted rounded w-1/2 animate-pulse" />
                <div className="h-24 bg-muted rounded animate-pulse" />
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 py-12">
          <div className="container text-center">
            <h1 className="text-2xl font-bold mb-4">Product not found</h1>
            <Button asChild variant="outline">
              <Link to="/shop">Back to Shop</Link>
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const images = product.images && product.images.length > 0 
    ? product.images 
    : ['/placeholder.svg'];

  const getCategoryLabel = (cat: string) => {
    switch (cat) {
      case 'back-glass': return 'Back Glass';
      case 'screen-glass': return 'Screen Glass';
      case 'covers': return 'Cover';
      default: return cat;
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 py-8 md:py-12">
        <div className="container">
          {/* Breadcrumb */}
          <Link to="/shop" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-gold mb-8">
            <ArrowLeft className="h-4 w-4" />
            Back to Shop
          </Link>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
            {/* Images */}
            <div className="space-y-4">
              <div className="aspect-square bg-secondary rounded-lg overflow-hidden">
                <img
                  src={images[selectedImage]}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              </div>
              
              {images.length > 1 && (
                <div className="flex gap-3 overflow-x-auto pb-2">
                  {images.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedImage(idx)}
                      className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-colors ${
                        selectedImage === idx ? 'border-gold' : 'border-transparent'
                      }`}
                    >
                      <img src={img} alt="" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Details */}
            <div className="space-y-6">
              <div>
                <span className="text-sm font-medium text-gold uppercase tracking-wider">
                  {getCategoryLabel(product.category)}
                </span>
                <h1 className="text-3xl md:text-4xl font-bold mt-2">{product.name}</h1>
              </div>

              <p className="text-3xl font-bold">TSh {Number(product.price).toLocaleString()}</p>

              {product.description && (
                <p className="text-muted-foreground leading-relaxed">{product.description}</p>
              )}

              {/* Stock status */}
              <div className="flex items-center gap-2">
                {product.stock > 0 ? (
                  <>
                    <Check className="h-4 w-4 text-green-500" />
                    <span className="text-sm text-green-600">In Stock ({product.stock} available)</span>
                  </>
                ) : (
                  <span className="text-sm text-destructive">Out of Stock</span>
                )}
              </div>

              {/* Model selector */}
              {product.compatible_models && product.compatible_models.length > 0 && (
                <div className="space-y-2">
                  <label className="text-sm font-medium">Select iPhone Model</label>
                  <Select value={selectedModel} onValueChange={setSelectedModel}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Choose your model" />
                    </SelectTrigger>
                    <SelectContent>
                      {product.compatible_models.map((model) => (
                        <SelectItem key={model} value={model}>
                          {model}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* Quantity */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Quantity</label>
                <div className="flex items-center gap-3">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    disabled={quantity <= 1}
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <span className="text-lg font-semibold w-12 text-center">{quantity}</span>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                    disabled={quantity >= product.stock}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Add to cart */}
              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <Button
                  variant="gold"
                  size="xl"
                  className="flex-1"
                  onClick={handleAddToCart}
                  disabled={product.stock <= 0}
                >
                  <ShoppingCart className="mr-2 h-5 w-5" />
                  Add to Cart
                </Button>
                <Button asChild variant="outline" size="xl">
                  <Link to="/cart">View Cart</Link>
                </Button>
              </div>

              {/* Compatible models list */}
              {product.compatible_models && product.compatible_models.length > 0 && (
                <div className="border-t border-border pt-6">
                  <h3 className="text-sm font-medium mb-3">Compatible Models</h3>
                  <div className="flex flex-wrap gap-2">
                    {product.compatible_models.map((model) => (
                      <span
                        key={model}
                        className="px-3 py-1 bg-secondary text-sm rounded-full"
                      >
                        {model}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer />
      <WhatsAppButton />
    </div>
  );
};

export default ProductDetail;
