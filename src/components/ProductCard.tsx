import { Link } from 'react-router-dom';
import { ShoppingCart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCart } from '@/lib/cart';
import { toast } from 'sonner';

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

  const getCategoryLabel = (cat: string) => {
    switch (cat) {
      case 'back-glass': return 'Back Glass';
      case 'screen-glass': return 'Screen Glass';
      case 'covers': return 'Cover';
      default: return cat;
    }
  };

  return (
    <Link to={`/product/${id}`} className="group">
      <div className="bg-card rounded-lg overflow-hidden border border-border hover:border-gold/50 transition-all duration-300 hover-lift">
        {/* Image */}
        <div className="aspect-square bg-secondary relative overflow-hidden">
          <img
            src={image || '/placeholder.svg'}
            alt={name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-primary/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          
          {/* Quick add button */}
          <Button
            variant="gold"
            size="icon"
            className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
            onClick={handleQuickAdd}
          >
            <ShoppingCart className="h-4 w-4" />
          </Button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-2">
          <span className="text-xs font-medium text-gold uppercase tracking-wider">
            {getCategoryLabel(category)}
          </span>
          <h3 className="font-medium text-foreground line-clamp-2 group-hover:text-gold transition-colors">
            {name}
          </h3>
          <p className="text-lg font-semibold text-foreground">
            TSh {price.toLocaleString()}
          </p>
        </div>
      </div>
    </Link>
  );
};

export default ProductCard;
