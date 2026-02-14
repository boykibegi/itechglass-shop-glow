import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart, Eye } from 'lucide-react';
import { useCart } from '@/lib/cart';
import { toast } from 'sonner';
import ProductQuickView from '@/components/ProductQuickView';

interface ProductCardProps {
  id: string;
  name: string;
  price: number;
  image: string;
  category: string;
  compatibleModels?: string[];
}

const ProductCard = ({ id, name, price, image, category, compatibleModels }: ProductCardProps) => {
  const { addItem } = useCart();
  const [quickViewOpen, setQuickViewOpen] = useState(false);

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    addItem({
      productId: id,
      name,
      price,
      quantity: 1,
      image,
      selectedModel: compatibleModels?.[0] || 'Universal',
    });
    
    toast.success('Added to cart!', {
      description: name,
    });
  };

  const handleQuickView = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setQuickViewOpen(true);
  };

  const getCategoryLabel = (cat: string) => {
    switch (cat) {
      case 'back-glass': return 'Back Glass';
      case 'screen-glass': return 'Screen Glass';
      case 'covers': return 'Cover';
      default: return cat;
    }
  };

  return (
    <>
      <Link to={`/product/${id}`} className="group block">
        <div className="bg-card rounded-xl overflow-hidden border border-border/50 hover:border-gold/30 transition-all duration-300 hover:shadow-lg">
          {/* Image */}
          <div className="aspect-[4/5] bg-secondary relative overflow-hidden">
            <img
              src={image || '/placeholder.svg'}
              alt={name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
            {/* Category badge */}
            <span className="absolute top-2 left-2 bg-gold/90 text-primary-foreground text-[10px] font-medium px-2 py-0.5 rounded-full">
              {getCategoryLabel(category)}
            </span>
            {/* Quick view button */}
            <button
              onClick={handleQuickView}
              className="absolute top-2 right-2 w-8 h-8 rounded-full bg-background/80 backdrop-blur-sm border border-border/50 hover:bg-gold hover:text-primary-foreground hover:border-gold flex items-center justify-center transition-all duration-200 opacity-0 group-hover:opacity-100"
              title="Quick view"
            >
              <Eye className="h-4 w-4" />
            </button>
          </div>

          {/* Content */}
          <div className="p-3 space-y-1.5">
            <h3 className="text-sm font-medium text-foreground line-clamp-2 leading-tight group-hover:text-gold transition-colors min-h-[2.5rem]">
              {name}
            </h3>
            
            {/* Price row */}
            <div className="flex items-center justify-between">
              <p className="text-lg font-bold text-gold">
                TSh {price.toLocaleString()}
              </p>
              <button
                onClick={handleQuickAdd}
                className="w-8 h-8 rounded-full bg-gold/10 hover:bg-gold hover:text-primary-foreground flex items-center justify-center transition-all duration-200"
              >
                <ShoppingCart className="h-4 w-4 text-gold group-hover:text-inherit" />
              </button>
            </div>

            {/* Compatible models hint */}
            {compatibleModels && compatibleModels.length > 0 && (
              <p className="text-[11px] text-muted-foreground truncate">
                {compatibleModels.length} model{compatibleModels.length > 1 ? 's' : ''} available
              </p>
            )}
          </div>
        </div>
      </Link>

      <ProductQuickView
        productId={id}
        open={quickViewOpen}
        onOpenChange={setQuickViewOpen}
      />
    </>
  );
};

export default ProductCard;
