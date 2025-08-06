import { useState } from "react";
import { Header } from "../components/Header";
import { Marquee } from "../components/Marquee";
import { Hero } from "../components/Hero";
import { Services } from "../components/Services";
import { Products } from "../components/Products";
import { Promotions } from "../components/Promotions";
import { Footer } from "../components/Footer";

interface CartItem {
  id: number;
  name: string;
  price: number;
  quantity: number;
}

const Index = () => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);

  const addToCart = (product: any) => {
    setCartItems(prev => {
      const existingItem = prev.find(item => item.id === product.id);
      if (existingItem) {
        return prev.map(item =>
          item.id === product.id 
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { 
        id: product.id, 
        name: product.name, 
        price: product.discountPrice || product.price, 
        quantity: 1 
      }];
    });
  };

  const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="min-h-screen">
      <Header cartItems={totalItems} />
      <Marquee />
      <Hero />
      <Services />
      <Products onAddToCart={addToCart} />
      <Promotions onAddToCart={addToCart} />
      <Footer />
    </div>
  );
};

export default Index;