import { useState, useRef } from 'react';
import { Star, Camera, X, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { useQueryClient } from '@tanstack/react-query';

interface ReviewFormProps {
  orderId: string;
  productId: string;
  productName: string;
  onSuccess?: () => void;
}

const ReviewForm = ({ orderId, productId, productName, onSuccess }: ReviewFormProps) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [reviewText, setReviewText] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image must be under 5MB');
      return;
    }
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const removeImage = () => {
    setImageFile(null);
    if (imagePreview) URL.revokeObjectURL(imagePreview);
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSubmit = async () => {
    if (!user || rating === 0) {
      toast.error('Please select a star rating');
      return;
    }

    setSubmitting(true);
    try {
      let imageUrl: string | null = null;

      if (imageFile) {
        const ext = imageFile.name.split('.').pop();
        const path = `${user.id}/${orderId}_${productId}.${ext}`;
        const { error: uploadError } = await supabase.storage
          .from('review-images')
          .upload(path, imageFile, { upsert: true });

        if (uploadError) throw uploadError;

        const { data: urlData } = supabase.storage
          .from('review-images')
          .getPublicUrl(path);
        imageUrl = urlData.publicUrl;
      }

      const { error } = await supabase.from('reviews').insert({
        product_id: productId,
        order_id: orderId,
        user_id: user.id,
        reviewer_name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'Customer',
        rating,
        review_text: reviewText.trim() || null,
        image_url: imageUrl,
      });

      if (error) throw error;

      toast.success('Review submitted!');
      queryClient.invalidateQueries({ queryKey: ['reviews'] });
      queryClient.invalidateQueries({ queryKey: ['orderReviews', orderId] });
      onSuccess?.();
    } catch (err: any) {
      if (err.code === '23505') {
        toast.error('You already reviewed this product for this order');
      } else {
        toast.error('Failed to submit review');
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-4">
      <p className="text-sm font-medium">Review: {productName}</p>

      {/* Star Rating */}
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => setRating(star)}
            onMouseEnter={() => setHoverRating(star)}
            onMouseLeave={() => setHoverRating(0)}
            className="p-0.5"
          >
            <Star
              className={`h-6 w-6 transition-colors ${
                star <= (hoverRating || rating)
                  ? 'fill-gold text-gold'
                  : 'text-border'
              }`}
            />
          </button>
        ))}
      </div>

      {/* Review Text */}
      <Textarea
        placeholder="Share your experience with this product..."
        value={reviewText}
        onChange={(e) => setReviewText(e.target.value)}
        maxLength={500}
        className="resize-none"
        rows={3}
      />

      {/* Image Upload */}
      <div>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleImageSelect}
          className="hidden"
        />
        {imagePreview ? (
          <div className="relative inline-block">
            <img
              src={imagePreview}
              alt="Review"
              className="w-24 h-24 object-cover rounded-lg border border-border"
            />
            <button
              onClick={removeImage}
              className="absolute -top-2 -right-2 w-5 h-5 bg-destructive text-destructive-foreground rounded-full flex items-center justify-center"
            >
              <X className="h-3 w-3" />
            </button>
          </div>
        ) : (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => fileInputRef.current?.click()}
          >
            <Camera className="h-4 w-4 mr-2" />
            Add Photo
          </Button>
        )}
      </div>

      <Button
        variant="gold"
        onClick={handleSubmit}
        disabled={submitting || rating === 0}
        className="w-full"
      >
        {submitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
        Submit Review
      </Button>
    </div>
  );
};

export default ReviewForm;
