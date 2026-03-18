import { Link } from 'react-router-dom';
import { Phone, Mail, MapPin, Instagram, Facebook, Twitter } from 'lucide-react';
import { useLanguage } from '@/hooks/useLanguage';

const Footer = () => {
  const { t } = useLanguage();

  return (
    <footer className="bg-primary text-primary-foreground">
      <div className="container py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <Link to="/home">
              <span className="text-lg font-bold tracking-tight text-primary-foreground">iTech<span className="text-gold">Glass</span></span>
            </Link>
            <p className="text-sm text-primary-foreground/70 max-w-xs">
              {t('footer.description')}
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h4 className="text-sm font-semibold uppercase tracking-wider text-gold">{t('footer.quickLinks')}</h4>
            <nav className="flex flex-col gap-2">
              <Link to="/shop" className="text-sm text-primary-foreground/70 hover:text-gold transition-colors">
                {t('footer.allProducts')}
              </Link>
              <Link to="/shop?category=back-glass" className="text-sm text-primary-foreground/70 hover:text-gold transition-colors">
                {t('nav.backGlass')}
              </Link>
              <Link to="/shop?category=screen-glass" className="text-sm text-primary-foreground/70 hover:text-gold transition-colors">
                {t('nav.screenGlass')}
              </Link>
              <Link to="/shop?category=covers" className="text-sm text-primary-foreground/70 hover:text-gold transition-colors">
                {t('nav.covers')}
              </Link>
            </nav>
          </div>

          {/* Customer Service */}
          <div className="space-y-4">
            <h4 className="text-sm font-semibold uppercase tracking-wider text-gold">{t('footer.support')}</h4>
            <nav className="flex flex-col gap-2">
              <Link to="/cart" className="text-sm text-primary-foreground/70 hover:text-gold transition-colors">
                {t('footer.cart')}
              </Link>
              <Link to="/checkout" className="text-sm text-primary-foreground/70 hover:text-gold transition-colors">
                {t('footer.checkout')}
              </Link>
              <span className="text-sm text-primary-foreground/70">
                {t('footer.trackOrder')}
              </span>
              <span className="text-sm text-primary-foreground/70">
                {t('footer.returns')}
              </span>
            </nav>
          </div>

          {/* Contact */}
          <div className="space-y-4">
            <h4 className="text-sm font-semibold uppercase tracking-wider text-gold">{t('footer.contactUs')}</h4>
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
            © {new Date().getFullYear()} iTechGlass. {t('footer.rights')}
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
