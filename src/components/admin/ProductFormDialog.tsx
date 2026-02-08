import { useState, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Loader2, Upload, X } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import { z } from 'zod';
import type { Tables } from '@/integrations/supabase/types';

type Product = Tables<'products'>;

// Validation schema for product data
const productSchema = z.object({
  name: z.string().trim().min(1, 'Product name is required').max(200, 'Name must be less than 200 characters'),
  description: z.string().trim().max(2000, 'Description must be less than 2000 characters').optional().or(z.literal('')),
  price: z.string().refine(val => {
    const num = parseFloat(val);
    return !isNaN(num) && num > 0 && num <= 10000000;
  }, 'Price must be between 1 and 10,000,000'),
  stock: z.string().refine(val => {
    const num = parseInt(val);
    return !isNaN(num) && num >= 0 && num <= 100000;
  }, 'Stock must be between 0 and 100,000'),
  category: z.string().min(1, 'Category is required'),
  featured: z.boolean(),
  compatibleModels: z.array(z.string()),
});

interface ProductFormDialogProps {
  open: boolean;
  onClose: () => void;
  product: Product | null;
}

const categories = [
  { value: 'back-glass', label: 'Back Glass' },
  { value: 'screen-glass', label: 'Screen Glass' },
  { value: 'covers', label: 'Covers' },
];

const iphoneModels = [
  'iPhone 16 Pro Max', 'iPhone 16 Pro', 'iPhone 16 Plus', 'iPhone 16',
  'iPhone 15 Pro Max', 'iPhone 15 Pro', 'iPhone 15 Plus', 'iPhone 15',
  'iPhone 14 Pro Max', 'iPhone 14 Pro', 'iPhone 14 Plus', 'iPhone 14',
  'iPhone 13 Pro Max', 'iPhone 13 Pro', 'iPhone 13', 'iPhone 13 mini',
  'iPhone 12 Pro Max', 'iPhone 12 Pro', 'iPhone 12', 'iPhone 12 mini',
  'iPhone 11 Pro Max', 'iPhone 11 Pro', 'iPhone 11',
  'iPhone XS Max', 'iPhone XS', 'iPhone XR', 'iPhone X',
  'iPhone 8 Plus', 'iPhone 8',
];

export function ProductFormDialog({ open, onClose, product }: ProductFormDialogProps) {
  const queryClient = useQueryClient();
  const isEditing = !!product;

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    stock: '',
    category: 'back-glass',
    featured: false,
    compatibleModels: [] as string[],
  });
  const [images, setImages] = useState<string[]>([]);
  const [uploadingImage, setUploadingImage] = useState(false);

  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name,
        description: product.description || '',
        price: product.price.toString(),
        stock: product.stock.toString(),
        category: product.category,
        featured: product.featured || false,
        compatibleModels: product.compatible_models || [],
      });
      setImages(product.images || []);
    } else {
      setFormData({
        name: '',
        description: '',
        price: '',
        stock: '',
        category: 'back-glass',
        featured: false,
        compatibleModels: [],
      });
      setImages([]);
    }
  }, [product, open]);

  const mutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const payload = {
        name: data.name.trim(),
        description: data.description.trim() || null,
        price: parseFloat(data.price),
        stock: parseInt(data.stock),
        category: data.category,
        featured: data.featured,
        compatible_models: data.compatibleModels,
        images,
      };

      if (isEditing) {
        const { error } = await supabase
          .from('products')
          .update(payload)
          .eq('id', product.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('products').insert([payload]);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-products'] });
      toast.success(isEditing ? 'Product updated' : 'Product created');
      onClose();
    },
    onError: (error) => {
      toast.error('Failed to save product');
      console.error(error);
    },
  });

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image too large. Max 5MB allowed.');
      return;
    }

    setUploadingImage(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('product-images')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('product-images')
        .getPublicUrl(fileName);

      setImages((prev) => [...prev, publicUrl]);
    } catch (error) {
      toast.error('Failed to upload image');
    } finally {
      setUploadingImage(false);
    }
  };

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const toggleModel = (model: string) => {
    setFormData((prev) => ({
      ...prev,
      compatibleModels: prev.compatibleModels.includes(model)
        ? prev.compatibleModels.filter((m) => m !== model)
        : [...prev.compatibleModels, model],
    }));
  };

  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setValidationErrors({});

    // Validate form data with Zod schema
    const result = productSchema.safeParse(formData);
    if (!result.success) {
      const errors: Record<string, string> = {};
      result.error.errors.forEach((err) => {
        if (err.path[0]) {
          errors[err.path[0] as string] = err.message;
        }
      });
      setValidationErrors(errors);
      toast.error('Please fix the validation errors');
      return;
    }

    mutation.mutate(formData);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Edit Product' : 'Add New Product'}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Product Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                placeholder="iPhone 15 Pro Back Glass"
                maxLength={200}
              />
              {validationErrors.name && <p className="text-sm text-destructive">{validationErrors.name}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Category *</Label>
              <Select
                value={formData.category}
                onValueChange={(value) => setFormData((prev) => ({ ...prev, category: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat.value} value={cat.value}>
                      {cat.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {validationErrors.category && <p className="text-sm text-destructive">{validationErrors.category}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="price">Price (TSh) *</Label>
              <Input
                id="price"
                type="number"
                value={formData.price}
                onChange={(e) => setFormData((prev) => ({ ...prev, price: e.target.value }))}
                placeholder="25000"
                min="1"
                max="10000000"
              />
              {validationErrors.price && <p className="text-sm text-destructive">{validationErrors.price}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="stock">Stock *</Label>
              <Input
                id="stock"
                type="number"
                value={formData.stock}
                onChange={(e) => setFormData((prev) => ({ ...prev, stock: e.target.value }))}
                placeholder="50"
                min="0"
                max="100000"
              />
              {validationErrors.stock && <p className="text-sm text-destructive">{validationErrors.stock}</p>}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
              placeholder="High-quality replacement back glass..."
              rows={3}
              maxLength={2000}
            />
            {validationErrors.description && <p className="text-sm text-destructive">{validationErrors.description}</p>}
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="featured"
              checked={formData.featured}
              onCheckedChange={(checked) =>
                setFormData((prev) => ({ ...prev, featured: checked === true }))
              }
            />
            <Label htmlFor="featured" className="cursor-pointer">
              Featured Product (shown on homepage)
            </Label>
          </div>

          <div className="space-y-2">
            <Label>Product Images</Label>
            <div className="flex flex-wrap gap-3">
              {images.map((img, idx) => (
                <div key={idx} className="relative w-20 h-20 rounded-lg overflow-hidden border border-border">
                  <img src={img} alt="" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => removeImage(idx)}
                    className="absolute top-1 right-1 w-5 h-5 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
              <label className="w-20 h-20 rounded-lg border-2 border-dashed border-border flex items-center justify-center cursor-pointer hover:border-gold transition-colors">
                {uploadingImage ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <Upload className="h-5 w-5 text-muted-foreground" />
                )}
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageUpload}
                  disabled={uploadingImage}
                />
              </label>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Compatible iPhone Models</Label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-40 overflow-y-auto border border-border rounded-lg p-3">
              {iphoneModels.map((model) => (
                <div key={model} className="flex items-center space-x-2">
                  <Checkbox
                    id={model}
                    checked={formData.compatibleModels.includes(model)}
                    onCheckedChange={() => toggleModel(model)}
                  />
                  <Label htmlFor={model} className="text-sm cursor-pointer">
                    {model}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" variant="gold" disabled={mutation.isPending}>
              {mutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isEditing ? 'Update Product' : 'Create Product'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
