import { Link, useLocation } from 'react-router-dom';
import { ShoppingCart, Menu, X, User, LogOut, Package, Truck } from 'lucide-react';
import logo from '@/assets/logo.png';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useCart } from '@/lib/cart';
import { useAuth } from '@/hooks/useAuth';
import { cn } from '@/lib/utils';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();
  const { getTotalItems } = useCart();
  const { user, isAdmin, isDriver, signOut } = useAuth();
  const totalItems = getTotalItems();

  const navLinks = [
    { href: '/home', label: 'Home' },
    { href: '/shop', label: 'Shop' },
    { href: '/shop?category=back-glass', label: 'Back Glass' },
    { href: '/shop?category=screen-glass', label: 'Screen Glass' },
    { href: '/shop?category=covers', label: 'Covers' },
  ];

  const isActive = (href: string) => {
    if (href === '/') return location.pathname === '/';
    return location.pathname + location.search === href;
  };

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        {/* Logo */}
        <Link to="/home" className="flex items-center gap-2">
          <img src={logo} alt="iTechGlass" className="h-8" />
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              to={link.href}
              className={cn(
                "text-sm font-medium transition-colors hover:text-gold",
                isActive(link.href) ? "text-gold" : "text-muted-foreground"
              )}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-2">
          {user && (
            <Link to="/profile" className="hidden md:block" title="My Profile">
              <Button variant="ghost" size="icon">
                <User className="h-5 w-5" />
              </Button>
            </Link>
          )}

          {user && (
            <Link to="/orders" className="hidden md:block" title="My Orders">
              <Button variant="ghost" size="icon">
                <Package className="h-5 w-5" />
              </Button>
            </Link>
          )}

          {isDriver && (
            <Link to="/delivery" className="hidden md:block" title="Driver Dashboard">
              <Button variant="ghost" size="icon">
                <Truck className="h-5 w-5" />
              </Button>
            </Link>
          )}

          {isAdmin && (
            <Link to="/admin" className="hidden md:block" title="Admin Dashboard">
              <Button variant="ghost" size="icon">
                <Package className="h-5 w-5" />
              </Button>
            </Link>
          )}
          
          <Link to="/cart" className="relative">
            <Button variant="ghost" size="icon">
              <ShoppingCart className="h-5 w-5" />
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-gold text-xs font-semibold text-primary flex items-center justify-center">
                  {totalItems}
                </span>
              )}
            </Button>
          </Link>

          {user && (
            <Button
              variant="ghost"
              size="icon"
              onClick={handleSignOut}
              className="hidden md:flex"
              title="Sign out"
            >
              <LogOut className="h-5 w-5" />
            </Button>
          )}

          {/* Mobile menu toggle */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isMenuOpen && (
        <div className="md:hidden border-t border-border bg-background">
          <nav className="container py-4 flex flex-col gap-4">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                to={link.href}
                onClick={() => setIsMenuOpen(false)}
                className={cn(
                  "text-sm font-medium transition-colors hover:text-gold py-2",
                  isActive(link.href) ? "text-gold" : "text-muted-foreground"
                )}
              >
                {link.label}
              </Link>
            ))}
            {user && (
              <Link
                to="/profile"
                onClick={() => setIsMenuOpen(false)}
                className="text-sm font-medium text-muted-foreground hover:text-gold py-2"
              >
                My Profile
              </Link>
            )}
            {user && (
              <Link
                to="/orders"
                onClick={() => setIsMenuOpen(false)}
                className="text-sm font-medium text-muted-foreground hover:text-gold py-2"
              >
                My Orders
              </Link>
            )}
            {isDriver && (
              <Link
                to="/delivery"
                onClick={() => setIsMenuOpen(false)}
                className="text-sm font-medium text-muted-foreground hover:text-gold py-2"
              >
                Driver Dashboard
              </Link>
            )}
            {isAdmin && (
              <Link
                to="/admin"
                onClick={() => setIsMenuOpen(false)}
                className="text-sm font-medium text-muted-foreground hover:text-gold py-2"
              >
                Admin
              </Link>
            )}
            {user && (
              <button
                onClick={() => {
                  handleSignOut();
                  setIsMenuOpen(false);
                }}
                className="text-sm font-medium text-muted-foreground hover:text-gold py-2 text-left"
              >
                Sign Out
              </button>
            )}
          </nav>
        </div>
      )}
    </header>
  );
};

export default Header;
