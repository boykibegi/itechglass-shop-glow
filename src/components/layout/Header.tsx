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
    if (href === '/home') return location.pathname === '/home';
    return location.pathname + location.search === href;
  };

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <header className="sticky top-0 z-50 w-full bg-primary/95 backdrop-blur supports-[backdrop-filter]:bg-primary/80 shadow-lg">
      {/* Top bar with logo centered */}
      <div className="container flex h-20 items-center justify-between">
        {/* Mobile menu toggle - left */}
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden text-primary-foreground hover:bg-primary-foreground/10"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>

        {/* Left nav - desktop */}
        <nav className="hidden md:flex items-center gap-6">
          {navLinks.slice(0, 3).map((link) => (
            <Link
              key={link.href}
              to={link.href}
              className={cn(
                "text-xs font-medium uppercase tracking-widest transition-colors hover:text-gold",
                isActive(link.href) ? "text-gold" : "text-primary-foreground/70"
              )}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Center Logo */}
        <Link to="/home" className="flex items-center">
          <img src={logo} alt="iTechGlass" className="h-10 md:h-12" />
        </Link>

        {/* Right nav - desktop */}
        <nav className="hidden md:flex items-center gap-6">
          {navLinks.slice(3).map((link) => (
            <Link
              key={link.href}
              to={link.href}
              className={cn(
                "text-xs font-medium uppercase tracking-widest transition-colors hover:text-gold",
                isActive(link.href) ? "text-gold" : "text-primary-foreground/70"
              )}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-1">
          {user && (
            <Link to="/profile" className="hidden md:block" title="My Profile">
              <Button variant="ghost" size="icon" className="text-primary-foreground hover:bg-primary-foreground/10">
                <User className="h-4 w-4" />
              </Button>
            </Link>
          )}

          {user && (
            <Link to="/orders" className="hidden md:block" title="My Orders">
              <Button variant="ghost" size="icon" className="text-primary-foreground hover:bg-primary-foreground/10">
                <Package className="h-4 w-4" />
              </Button>
            </Link>
          )}

          {isDriver && (
            <Link to="/delivery" className="hidden md:block" title="Driver Dashboard">
              <Button variant="ghost" size="icon" className="text-primary-foreground hover:bg-primary-foreground/10">
                <Truck className="h-4 w-4" />
              </Button>
            </Link>
          )}

          {isAdmin && (
            <Link to="/admin" className="hidden md:block" title="Admin Dashboard">
              <Button variant="ghost" size="icon" className="text-primary-foreground hover:bg-primary-foreground/10">
                <Package className="h-4 w-4" />
              </Button>
            </Link>
          )}
          
          <Link to="/cart" className="relative">
            <Button variant="ghost" size="icon" className="text-primary-foreground hover:bg-primary-foreground/10">
              <ShoppingCart className="h-4 w-4" />
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-gold text-[10px] font-semibold text-primary flex items-center justify-center">
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
              className="hidden md:flex text-primary-foreground hover:bg-primary-foreground/10"
              title="Sign out"
            >
              <LogOut className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Mobile Navigation */}
      {isMenuOpen && (
        <div className="md:hidden border-t border-primary-foreground/10 bg-primary">
          <nav className="container py-4 flex flex-col gap-4">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                to={link.href}
                onClick={() => setIsMenuOpen(false)}
                className={cn(
                  "text-xs font-medium uppercase tracking-widest transition-colors hover:text-gold py-2",
                  isActive(link.href) ? "text-gold" : "text-primary-foreground/70"
                )}
              >
                {link.label}
              </Link>
            ))}
            {user && (
              <Link
                to="/profile"
                onClick={() => setIsMenuOpen(false)}
                className="text-xs font-medium uppercase tracking-widest text-primary-foreground/70 hover:text-gold py-2"
              >
                My Profile
              </Link>
            )}
            {user && (
              <Link
                to="/orders"
                onClick={() => setIsMenuOpen(false)}
                className="text-xs font-medium uppercase tracking-widest text-primary-foreground/70 hover:text-gold py-2"
              >
                My Orders
              </Link>
            )}
            {isDriver && (
              <Link
                to="/delivery"
                onClick={() => setIsMenuOpen(false)}
                className="text-xs font-medium uppercase tracking-widest text-primary-foreground/70 hover:text-gold py-2"
              >
                Driver Dashboard
              </Link>
            )}
            {isAdmin && (
              <Link
                to="/admin"
                onClick={() => setIsMenuOpen(false)}
                className="text-xs font-medium uppercase tracking-widest text-primary-foreground/70 hover:text-gold py-2"
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
                className="text-xs font-medium uppercase tracking-widest text-primary-foreground/70 hover:text-gold py-2 text-left"
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
