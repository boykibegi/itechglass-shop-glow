import { Link } from 'react-router-dom';
import { Phone, Mail, MapPin, Instagram, Facebook, Twitter } from 'lucide-react';
import logo from '@/assets/logo.png';

const Footer = () => {
  return (
    <footer className="bg-primary text-primary-foreground">
      <div className="container py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <Link to="/">
              <img src={logo} alt="iTechGlass" className="h-8" />
            </Link>
            <p className="text-sm text-primary-foreground/70 max-w-xs">
              Premium iPhone accessories. Quality glass protection and stylish covers for your device.
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h4 className="text-sm font-semibold uppercase tracking-wider text-gold">Quick Links</h4>
            <nav className="flex flex-col gap-2">
              <Link to="/shop" className="text-sm text-primary-foreground/70 hover:text-gold transition-colors">
                All Products
              </Link>
              <Link to="/shop?category=back-glass" className="text-sm text-primary-foreground/70 hover:text-gold transition-colors">
                Back Glass
              </Link>
              <Link to="/shop?category=screen-glass" className="text-sm text-primary-foreground/70 hover:text-gold transition-colors">
                Screen Glass
              </Link>
              <Link to="/shop?category=covers" className="text-sm text-primary-foreground/70 hover:text-gold transition-colors">
                Covers
              </Link>
            </nav>
          </div>

          {/* Customer Service */}
          <div className="space-y-4">
            <h4 className="text-sm font-semibold uppercase tracking-wider text-gold">Support</h4>
            <nav className="flex flex-col gap-2">
              <Link to="/cart" className="text-sm text-primary-foreground/70 hover:text-gold transition-colors">
                Cart
              </Link>
              <Link to="/checkout" className="text-sm text-primary-foreground/70 hover:text-gold transition-colors">
                Checkout
              </Link>
              <span className="text-sm text-primary-foreground/70">
                Track Order
              </span>
              <span className="text-sm text-primary-foreground/70">
                Returns
              </span>
            </nav>
          </div>

          {/* Contact */}
          <div className="space-y-4">
            <h4 className="text-sm font-semibold uppercase tracking-wider text-gold">Contact Us</h4>
            <div className="flex flex-col gap-3">
              <a href="tel:+255746582989" className="flex items-center gap-2 text-sm text-primary-foreground/70 hover:text-gold transition-colors">
                <Phone className="h-4 w-4" />
                +255 746 582 989
              </a>
              <a href="mailto:support@itechglass.co.tz" className="flex items-center gap-2 text-sm text-primary-foreground/70 hover:text-gold transition-colors">
                <Mail className="h-4 w-4" />
                support@itechglass.co.tz
              </a>
              <span className="flex items-center gap-2 text-sm text-primary-foreground/70">
                <MapPin className="h-4 w-4" />
                Dar es Salaam, Tanzania
              </span>
            </div>
            
            {/* Social */}
            <div className="flex gap-4 pt-2">
              <a href="#" className="text-primary-foreground/70 hover:text-gold transition-colors">
                <Instagram className="h-5 w-5" />
              </a>
              <a href="#" className="text-primary-foreground/70 hover:text-gold transition-colors">
                <Facebook className="h-5 w-5" />
              </a>
              <a href="#" className="text-primary-foreground/70 hover:text-gold transition-colors">
                <Twitter className="h-5 w-5" />
              </a>
            </div>
          </div>
        </div>

        {/* Bottom */}
        <div className="border-t border-primary-foreground/10 mt-12 pt-8 text-center">
          <p className="text-sm text-primary-foreground/50">
            © {new Date().getFullYear()} iTechGlass. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
