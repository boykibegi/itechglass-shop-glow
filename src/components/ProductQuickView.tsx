import { useState } from 'react';
import { Eye, Minus, Plus, ShoppingCart, Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useCart } from '@/lib/cart';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';

interface ProductQuickViewProps {
  productId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const fetchProduct = async (id: string) => {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('id', id)
    .single();
  if (error) throw error;
  return data;
};

const getCategoryLabel = (cat: string) => {
  switch (cat) {
    case 'back-glass': return 'Back Glass';
    case 'screen-glass': return 'Screen Glass';
    case 'covers': return 'Cover';
    default: return cat;
  }
};

const ProductQuickView = ({ productId, open, onOpenChange }: ProductQuickViewProps) => {
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedModel, setSelectedModel] = useState('');
  const [quantity, setQuantity] = useState(1);
  const { addItem } = useCart();

  const { data: product, isLoading } = useQuery({
    queryKey: ['product', productId],
    queryFn: () => fetchProduct(productId),
    enabled: open && !!productId,
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

    onOpenChange(false);
    setQuantity(1);
    setSelectedModel('');
    setSelectedImage(0);
  };

  const images = product?.images?.length ? product.images : ['/placeholder.svg'];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] p-0 overflow-hidden bg-card border-border/50">
        {isLoading || !product ? (
          <div className="p-8 space-y-4">
            <div className="aspect-square bg-muted rounded-lg animate-pulse" />
            <div className="h-6 bg-muted rounded w-3/4 animate-pulse" />
            <div className="h-4 bg-muted rounded w-1/2 animate-pulse" />
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-0">
            {/* Image section */}
            <div className="bg-secondary p-4 space-y-3">
              <div className="aspect-square rounded-lg overflow-hidden">
                <img
                  src={images[selectedImage]}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              </div>
              {images.length > 1 && (
                <div className="flex gap-2 overflow-x-auto pb-1">
                  {images.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedImage(idx)}
                      className={`flex-shrink-0 w-14 h-14 rounded-md overflow-hidden border-2 transition-colors ${
                        selectedImage === idx ? 'border-gold' : 'border-transparent'
                      }`}
                    >
                      <img src={img} alt="" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Details section */}
            <div className="p-5 flex flex-col">
              <DialogHeader className="text-left space-y-1 mb-3">
                <span className="text-xs font-medium text-gold uppercase tracking-wider">
                  {getCategoryLabel(product.category)}
                </span>
                <DialogTitle className="text-xl font-bold leading-tight">
                  {product.name}
                </DialogTitle>
              </DialogHeader>

              <p className="text-2xl font-bold text-gold mb-3">
                TSh {Number(product.price).toLocaleString()}
              </p>

              {product.description && (
                <p className="text-sm text-muted-foreground mb-4 line-clamp-3 leading-relaxed">
                  {product.description}
                </p>
              )}

              {/* Stock */}
              <div className="flex items-center gap-2 mb-4">
                {product.stock > 0 ? (
                  <>
                    <Check className="h-3.5 w-3.5 text-emerald-500" />
                    <span className="text-xs text-emerald-600 dark:text-emerald-400">In Stock ({product.stock})</span>
                  </>
                ) : (
                  <span className="text-xs text-destructive">Out of Stock</span>
                )}
              </div>

              {/* Model selector */}
              {product.compatible_models && product.compatible_models.length > 0 && (
                <div className="space-y-1.5 mb-4">
                  <label className="text-xs font-medium">iPhone Model</label>
                  <Select value={selectedModel} onValueChange={setSelectedModel}>
                    <SelectTrigger className="w-full h-9 text-sm">
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
              <div className="space-y-1.5 mb-5">
                <label className="text-xs font-medium">Quantity</label>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    disabled={quantity <= 1}
                  >
                    <Minus className="h-3.5 w-3.5" />
                  </Button>
                  <span className="text-sm font-semibold w-8 text-center">{quantity}</span>
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                    disabled={quantity >= product.stock}
                  >
                    <Plus className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>

              {/* Actions */}
              <div className="mt-auto flex flex-col gap-2">
                <Button
                  variant="gold"
                  className="w-full"
                  onClick={handleAddToCart}
                  disabled={product.stock <= 0}
                >
                  <ShoppingCart className="mr-2 h-4 w-4" />
                  Add to Cart
                </Button>
                <Button asChild variant="outline" size="sm" className="w-full">
                  <Link to={`/product/${product.id}`} onClick={() => onOpenChange(false)}>
                    View Full Details
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default ProductQuickView;

export const QuickViewTrigger = ({
  onClick,
}: {
  onClick: (e: React.MouseEvent) => void;
}) => (
  <button
    onClick={onClick}
    className="w-8 h-8 rounded-full bg-background/80 backdrop-blur-sm border border-border/50 hover:bg-gold hover:text-white hover:border-gold flex items-center justify-center transition-all duration-200 opacity-0 group-hover:opacity-100"
    title="Quick view"
  >
    <Eye className="h-4 w-4" />
  </button>
);
