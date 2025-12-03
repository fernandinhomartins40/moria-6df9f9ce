import { useState, useEffect } from "react";
import { ShoppingCart, User, Menu, X, Gift } from "lucide-react";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { useCart } from "../contexts/CartContext";
import { useAuth } from "../contexts/AuthContext";
import { LoginDialog } from "./customer/LoginDialog";
import { Link } from "react-router-dom";
import couponService from "../api/couponService";
import { useLandingPageConfig } from "@/hooks/useLandingPageConfig";
import { colorOrGradientToCSS } from "@/components/admin/LandingPageEditor/StyleControls";

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showLoginDialog, setShowLoginDialog] = useState(false);
  const [activeCouponCount, setActiveCouponCount] = useState(0);
  const { totalItems, openCart } = useCart();
  const { isAuthenticated, customer } = useAuth();
  const { config, loading } = useLandingPageConfig();

  useEffect(() => {
    const loadCouponCount = async () => {
      try {
        const count = await couponService.getActiveCouponCount();
        setActiveCouponCount(count);
      } catch (error) {
        console.error('Erro ao carregar contagem de cupons:', error);
      }
    };

    loadCouponCount();
    const interval = setInterval(loadCouponCount, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const menuItems = loading ? [
    { name: "Início", href: "#inicio", isLink: false },
    { name: "Serviços", href: "#servicos", isLink: false },
    { name: "Peças", href: "#pecas", isLink: false },
    { name: "Promoções", href: "#promocoes", isLink: false },
    { name: "Sobre", href: "/about", isLink: true },
    { name: "Contato", href: "/contact", isLink: true },
  ] : (config.header.menuItems || []).map(item => ({
    name: item.label,
    href: item.href,
    isLink: item.isLink
  }));

  const headerStyle = loading ? {} : {
    ...colorOrGradientToCSS(config.header.backgroundColor),
    ...colorOrGradientToCSS(config.header.textColor, { forText: true }),
  };

  const logoSrc = loading ? "/logo_moria.png" : config.header.logo.url;
  const logoAlt = loading ? "Moria Peças e Serviços" : config.header.logo.alt;

  return (
    <header className="sticky top-0 z-50 shadow-lg" style={headerStyle}>
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-28">
          {/* Logo */}
          <div className="flex-shrink-0">
            <img
              src={logoSrc}
              alt={logoAlt}
              className="h-20 w-auto"
            />
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-8">
            {menuItems.map((item) => (
              item.isLink ? (
                <Link
                  key={item.name}
                  to={item.href}
                  className="text-white hover:text-moria-orange transition-colors duration-300 font-medium"
                >
                  {item.name}
                </Link>
              ) : (
                <a
                  key={item.name}
                  href={item.href}
                  className="text-white hover:text-moria-orange transition-colors duration-300 font-medium"
                >
                  {item.name}
                </a>
              )
            ))}
          </nav>

          {/* Desktop Icons */}
          <div className="hidden md:flex items-center space-x-4">
            {/* ✅ ETAPA 2.2: Badge de cupons disponíveis */}
            {activeCouponCount > 0 && (
              <Button
                variant="ghost"
                className="hover:text-moria-orange flex items-center gap-2 px-3"
                onClick={() => {
                  if (isAuthenticated) {
                    window.location.href = '/customer?tab=coupons';
                  } else {
                    setShowLoginDialog(true);
                  }
                }}
              >
                <Gift className="h-5 w-5" />
                <Badge variant="secondary" className="bg-moria-orange text-white hover:bg-moria-orange/90">
                  {activeCouponCount} {activeCouponCount === 1 ? 'cupom' : 'cupons'}
                </Badge>
              </Button>
            )}

            {isAuthenticated && customer ? (
              <Button
                variant="ghost"
                className="hover:text-moria-orange flex items-center gap-2 px-3"
                onClick={() => window.location.href = '/customer'}
              >
                <User className="h-5 w-5" />
                <div className="flex flex-col items-start">
                  <span className="text-sm font-medium">{customer.name}</span>
                  <span className="text-xs text-moria-orange/80">{customer.email}</span>
                </div>
              </Button>
            ) : (
              <Button
                variant="ghost"
                size="icon"
                className="hover:text-moria-orange"
                onClick={() => setShowLoginDialog(true)}
              >
                <User className="h-5 w-5" />
              </Button>
            )}
            <Button
              variant="ghost"
              size="icon"
              className="hover:text-moria-orange relative"
              onClick={openCart}
            >
              <ShoppingCart className="h-5 w-5" />
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 bg-moria-orange text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {totalItems}
                </span>
              )}
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-moria-orange/30">
            <nav className="flex flex-col space-y-2">
              {menuItems.map((item) => (
                item.isLink ? (
                  <Link
                    key={item.name}
                    to={item.href}
                    className="text-white hover:text-moria-orange transition-colors duration-300 py-2 px-4 rounded"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {item.name}
                  </Link>
                ) : (
                  <a
                    key={item.name}
                    href={item.href}
                    className="text-white hover:text-moria-orange transition-colors duration-300 py-2 px-4 rounded"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {item.name}
                  </a>
                )
              ))}
            </nav>
            <div className="flex flex-col items-center space-y-4 mt-4 pt-4 border-t border-moria-orange/30">
              {isAuthenticated && customer ? (
                <Button
                  variant="ghost"
                  className="hover:text-moria-orange w-full flex items-center gap-2 px-3"
                  onClick={() => window.location.href = '/customer'}
                >
                  <User className="h-5 w-5" />
                  <div className="flex flex-col items-start flex-1">
                    <span className="text-sm font-medium">{customer.name}</span>
                    <span className="text-xs text-moria-orange/80">{customer.email}</span>
                  </div>
                </Button>
              ) : (
                <Button
                  variant="ghost"
                  size="icon"
                  className="hover:text-moria-orange"
                  onClick={() => setShowLoginDialog(true)}
                >
                  <User className="h-5 w-5" />
                </Button>
              )}
              <div className="flex items-center space-x-4">
                <Button
                  variant="ghost"
                  size="icon"
                  className="hover:text-moria-orange relative"
                  onClick={openCart}
                >
                  <ShoppingCart className="h-5 w-5" />
                  {totalItems > 0 && (
                    <span className="absolute -top-1 -right-1 bg-moria-orange text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                      {totalItems}
                    </span>
                  )}
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
      
      <LoginDialog open={showLoginDialog} onOpenChange={setShowLoginDialog} />
    </header>
  );
}