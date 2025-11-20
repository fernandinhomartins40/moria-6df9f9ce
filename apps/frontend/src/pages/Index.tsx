import { Header } from "../components/Header";
import { Marquee } from "../components/Marquee";
import { Hero } from "../components/Hero";
import { Services } from "../components/Services";
import { Products } from "../components/Products";
import { Promotions } from "../components/Promotions";
import { Footer } from "../components/Footer";
import { CartDrawer } from "../components/CartDrawer";
import "../styles/public.css";

const Index = () => {
  return (
    <div className="min-h-screen">
      <Header />
      <Marquee />
      <Hero />
      <Services />
      <Products />
      <Promotions />
      <Footer />
      <CartDrawer />
    </div>
  );
};

export default Index;