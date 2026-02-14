import { Star, Quote } from 'lucide-react';

const reviews = [
  {
    name: 'Sarah M.',
    rating: 5,
    text: 'Absolutely flawless quality. The back glass fits perfectly on my iPhone 15 Pro — looks factory new.',
    date: '2 weeks ago',
    model: 'iPhone 15 Pro',
  },
  {
    name: 'James K.',
    rating: 5,
    text: 'Best screen protector I\'ve ever used. Crystal clear, no bubbles, and the anti-fingerprint coating actually works.',
    date: '1 month ago',
    model: 'iPhone 14 Pro Max',
  },
  {
    name: 'Amina R.',
    rating: 4,
    text: 'The leather case is stunning — premium feel and the MagSafe alignment is spot on. Highly recommend.',
    date: '3 weeks ago',
    model: 'iPhone 16 Pro',
  },
  {
    name: 'David O.',
    rating: 5,
    text: 'Fast delivery and the packaging was excellent. Product exceeded my expectations for the price.',
    date: '1 week ago',
    model: 'iPhone 15',
  },
];

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

const ProductReviews = () => {
  const avgRating = (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1);

  return (
    <section className="border-t border-border pt-12 mt-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-8">
        <div className="space-y-1">
          <h2 className="text-2xl font-bold tracking-tight">Customer Reviews</h2>
          <div className="flex items-center gap-3">
            <StarRating rating={Math.round(Number(avgRating))} />
            <span className="text-sm text-muted-foreground">
              {avgRating} out of 5 · {reviews.length} reviews
            </span>
          </div>
        </div>
        <div className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-gold/10 border border-gold/20">
          <Star className="h-3.5 w-3.5 fill-gold text-gold" />
          <span className="text-xs font-semibold text-gold">{avgRating} Average</span>
        </div>
      </div>

      {/* Review Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {reviews.map((review, i) => (
          <div
            key={i}
            className="group relative rounded-2xl border border-border/60 bg-card p-5 transition-all duration-300 hover:border-gold/20 hover:shadow-[0_4px_20px_-8px_hsl(43_74%_49%/0.15)]"
            style={{ animation: `fade-in 0.5s ease-out ${0.1 * i}s backwards` }}
          >
            {/* Quote accent */}
            <Quote className="absolute top-4 right-4 h-8 w-8 text-gold/[0.07] group-hover:text-gold/[0.12] transition-colors duration-300" />

            <div className="space-y-3">
              <StarRating rating={review.rating} />

              <p className="text-sm leading-relaxed text-foreground/80">
                "{review.text}"
              </p>

              <div className="flex items-center justify-between pt-2 border-t border-border/40">
                <div className="flex items-center gap-2">
                  <div className="h-7 w-7 rounded-full bg-gradient-to-br from-gold/20 to-gold/5 flex items-center justify-center">
                    <span className="text-[11px] font-semibold text-gold">{review.name.charAt(0)}</span>
                  </div>
                  <div>
                    <p className="text-xs font-medium">{review.name}</p>
                    <p className="text-[10px] text-muted-foreground">{review.model}</p>
                  </div>
                </div>
                <span className="text-[10px] text-muted-foreground">{review.date}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default ProductReviews;
