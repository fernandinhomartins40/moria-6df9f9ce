import { useState } from "react";
import { ShoppingCart, User, Menu, X } from "lucide-react";
import { Button } from "./ui/button";
import { useCart } from "../contexts/CartContext";
import { useAuth } from "../contexts/AuthContext";
import { LoginDialog } from "./customer/LoginDialog";

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showLoginDialog, setShowLoginDialog] = useState(false);
  const { totalItems, openCart } = useCart();
  const { isAuthenticated, customer } = useAuth();

  const menuItems = [
    { name: "Início", href: "#inicio" },
    { name: "Serviços", href: "#servicos" },
    { name: "Peças", href: "#pecas" },
    { name: "Promoções", href: "#promocoes" },
    { name: "Sobre", href: "#sobre" },
    { name: "Contato", href: "#contato" },
  ];

  return (
    <header className="bg-moria-black text-white sticky top-0 z-50 shadow-lg">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-28">
          {/* Logo */}
          <div className="flex-shrink-0">
            <img 
              src="/logo_moria.png" 
              alt="Moria Peças e Serviços" 
              className="h-20 w-auto"
            />
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-8">
            {menuItems.map((item) => (
              <a
                key={item.name}
                href={item.href}
                className="text-white hover:text-moria-orange transition-colors duration-300 font-medium"
              >
                {item.name}
              </a>
            ))}
          </nav>

          {/* Desktop Icons */}
          <div className="hidden md:flex items-center space-x-4">
            <Button 
              variant="ghost" 
              size="icon" 
              className="hover:text-moria-orange"
              onClick={() => {
                if (isAuthenticated) {
                  window.location.href = '/customer';
                } else {
                  setShowLoginDialog(true);
                }
              }}
            >
              <User className="h-5 w-5" />
            </Button>
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
                <a
                  key={item.name}
                  href={item.href}
                  className="text-white hover:text-moria-orange transition-colors duration-300 py-2 px-4 rounded"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item.name}
                </a>
              ))}
            </nav>
            <div className="flex items-center justify-center space-x-4 mt-4 pt-4 border-t border-moria-orange/30">
              <Button 
                variant="ghost" 
                size="icon" 
                className="hover:text-moria-orange"
                onClick={() => {
                  if (isAuthenticated) {
                    window.location.href = '/customer';
                  } else {
                    setShowLoginDialog(true);
                  }
                }}
              >
                <User className="h-5 w-5" />
              </Button>
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
        )}
      </div>
      
      <LoginDialog open={showLoginDialog} onOpenChange={setShowLoginDialog} />
    </header>
  );
}