import { Star, Quote } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Skeleton } from '@/components/ui/skeleton';

const StarRating = ({ rating }: { rating: number }) => (
  <div className="flex gap-0.5">
    {[...Array(5)].map((_, i) => (
      <Star
        key={i}
        className={`h-3.5 w-3.5 ${i < rating ? 'fill-gold text-gold' : 'text-border'}`}
      />
    ))}
  </div>
);

const ProductReviews = ({ productId }: { productId: string }) => {
  const { data: reviews, isLoading } = useQuery({
    queryKey: ['reviews', productId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('reviews')
        .select('*')
        .eq('product_id', productId)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!productId,
  });

  if (isLoading) {
    return (
      <section className="border-t border-border pt-12 mt-12">
        <Skeleton className="h-8 w-48 mb-4" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2].map((i) => <Skeleton key={i} className="h-40 w-full" />)}
        </div>
      </section>
    );
  }

  if (!reviews || reviews.length === 0) {
    return (
      <section className="border-t border-border pt-12 mt-12">
        <h2 className="text-2xl font-bold tracking-tight mb-4">Customer Reviews</h2>
        <p className="text-muted-foreground">No reviews yet. Be the first to review this product!</p>
      </section>
    );
  }

  const avgRating = (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1);

  const timeAgo = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const days = Math.floor(diff / 86400000);
    if (days < 1) return 'Today';
    if (days < 7) return `${days}d ago`;
    if (days < 30) return `${Math.floor(days / 7)}w ago`;
    return `${Math.floor(days / 30)}mo ago`;
  };

  return (
    <section className="border-t border-border pt-12 mt-12">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-8">
        <div className="space-y-1">
          <h2 className="text-2xl font-bold tracking-tight">Customer Reviews</h2>
          <div className="flex items-center gap-3">
            <StarRating rating={Math.round(Number(avgRating))} />
            <span className="text-sm text-muted-foreground">
              {avgRating} out of 5 · {reviews.length} review{reviews.length !== 1 ? 's' : ''}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-gold/10 border border-gold/20">
          <Star className="h-3.5 w-3.5 fill-gold text-gold" />
          <span className="text-xs font-semibold text-gold">{avgRating} Average</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {reviews.map((review, i) => (
          <div
            key={review.id}
            className="group relative rounded-2xl border border-border/60 bg-card p-5 transition-all duration-300 hover:border-gold/20 hover:shadow-[0_4px_20px_-8px_hsl(43_74%_49%/0.15)]"
            style={{ animation: `fade-in 0.5s ease-out ${0.1 * i}s backwards` }}
          >
            <Quote className="absolute top-4 right-4 h-8 w-8 text-gold/[0.07] group-hover:text-gold/[0.12] transition-colors duration-300" />

            <div className="space-y-3">
              <StarRating rating={review.rating} />

              {review.review_text && (
                <p className="text-sm leading-relaxed text-foreground/80">
                  "{review.review_text}"
                </p>
              )}

              {review.image_url && (
                <img
                  src={review.image_url}
                  alt="Customer photo"
                  className="w-full max-w-[200px] h-auto rounded-lg border border-border/40 object-cover"
                />
              )}

              <div className="flex items-center justify-between pt-2 border-t border-border/40">
                <div className="flex items-center gap-2">
                  <div className="h-7 w-7 rounded-full bg-gradient-to-br from-gold/20 to-gold/5 flex items-center justify-center">
                    <span className="text-[11px] font-semibold text-gold">{review.reviewer_name.charAt(0)}</span>
                  </div>
                  <p className="text-xs font-medium">{review.reviewer_name}</p>
                </div>
                <span className="text-[10px] text-muted-foreground">{timeAgo(review.created_at)}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default ProductReviews;
