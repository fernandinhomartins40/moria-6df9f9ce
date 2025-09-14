import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { Header } from "../components/Header";
import { Marquee } from "../components/Marquee";
import { Hero } from "../components/Hero";
import { Services } from "../components/Services";
import { Products } from "../components/Products";
import { Promotions } from "../components/Promotions";
import { Footer } from "../components/Footer";
import { CartDrawer } from "../components/CartDrawer";
import { LoginModal } from "../components/LoginModal";
import { CartProvider } from "../contexts/CartContext";
import { AuthProvider } from "../contexts/AuthContext";
import "../styles/public.css";

const Index = () => {
  const [showLogin, setShowLogin] = useState(false);
  const [redirectTo, setRedirectTo] = useState<string>('');
  const location = useLocation();

  useEffect(() => {
    // Verificar se deve mostrar modal de login via URL
    const urlParams = new URLSearchParams(location.search);
    const shouldLogin = urlParams.get('login') === 'true';
    const redirect = urlParams.get('redirect');

    if (shouldLogin) {
      setShowLogin(true);
      setRedirectTo(redirect || '');

      // Limpar parâmetros da URL
      const newUrl = window.location.pathname;
      window.history.replaceState({}, '', newUrl);
    }
  }, [location]);

  return (
    <AuthProvider>
      <CartProvider>
        <div className="min-h-screen">
          <Header />
          <Marquee />
          <Hero />
          <Services />
          <Products />
          <Promotions />
          <Footer />
          <CartDrawer />

          <LoginModal
            isOpen={showLogin}
            onClose={() => setShowLogin(false)}
            redirectTo={redirectTo}
          />
        </div>
      </CartProvider>
    </AuthProvider>
  );
};

export default Index;