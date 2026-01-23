import { useParams, Link } from 'react-router-dom';
import { CheckCircle, Package, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import WhatsAppButton from '@/components/WhatsAppButton';

const OrderConfirmation = () => {
  const { orderId } = useParams<{ orderId: string }>();

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 py-20">
        <div className="container max-w-2xl text-center">
          <div className="bg-gold/10 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="h-10 w-10 text-gold" />
          </div>
          
          <h1 className="text-3xl font-bold mb-4">Order Placed Successfully!</h1>
          <p className="text-muted-foreground mb-2">
            Thank you for your order. We'll review your payment and process your order soon.
          </p>
          <p className="text-sm text-muted-foreground mb-8">
            Order ID: <span className="font-mono font-medium text-foreground">{orderId}</span>
          </p>

          <div className="bg-card rounded-lg border border-border p-6 mb-8 text-left">
            <h2 className="font-semibold mb-4 flex items-center gap-2">
              <Package className="h-5 w-5 text-gold" />
              What happens next?
            </h2>
            <ol className="space-y-3 text-sm text-muted-foreground">
              <li className="flex gap-3">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-gold/10 text-gold font-semibold text-xs flex items-center justify-center">1</span>
                <span>We'll verify your payment within 24 hours</span>
              </li>
              <li className="flex gap-3">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-gold/10 text-gold font-semibold text-xs flex items-center justify-center">2</span>
                <span>Once confirmed, we'll prepare your order for shipping</span>
              </li>
              <li className="flex gap-3">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-gold/10 text-gold font-semibold text-xs flex items-center justify-center">3</span>
                <span>You'll receive a confirmation email with tracking details</span>
              </li>
              <li className="flex gap-3">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-gold/10 text-gold font-semibold text-xs flex items-center justify-center">4</span>
                <span>Your order will be delivered to your address</span>
              </li>
            </ol>
          </div>

          <div className="bg-secondary/50 rounded-lg p-4 mb-8">
            <p className="text-sm text-muted-foreground">
              Questions about your order? Contact us on WhatsApp for instant support.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild variant="gold" size="lg">
              <Link to="/shop">
                Continue Shopping
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link to="/">Back to Home</Link>
            </Button>
          </div>
        </div>
      </main>

      <Footer />
      <WhatsAppButton />
    </div>
  );
};

export default OrderConfirmation;
