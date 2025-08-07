import { useState } from "react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Star, Plus, Heart } from "lucide-react";
import { useCart } from "../contexts/CartContext";

interface Product {
  id: number;
  name: string;
  category: string;
  price: number;
  originalPrice?: number;
  image: string;
  rating: number;
  inStock: boolean;
  discount?: number;
}

const categories = [
  "Todos",
  "Motor",
  "Freios", 
  "Suspensão",
  "Elétrica",
  "Filtros",
  "Óleos",
];

const products: Product[] = [
  {
    id: 1,
    name: "Pastilha de Freio Cerâmica",
    category: "Freios",
    price: 89.90,
    originalPrice: 120.00,
    image: "/api/placeholder/300/300",
    rating: 4.8,
    inStock: true,
    discount: 25
  },
  {
    id: 2,
    name: "Filtro de Ar Esportivo",
    category: "Filtros",
    price: 156.90,
    originalPrice: 220.00,
    image: "/api/placeholder/300/300",
    rating: 4.9,
    inStock: true,
    discount: 30
  },
  {
    id: 3,
    name: "Óleo Motor 5W30 Sintético",
    category: "Óleos",
    price: 45.90,
    image: "/api/placeholder/300/300",
    rating: 4.7,
    inStock: true
  },
  {
    id: 4,
    name: "Amortecedor Dianteiro",
    category: "Suspensão",
    price: 234.90,
    originalPrice: 280.00,
    image: "/api/placeholder/300/300",
    rating: 4.6,
    inStock: true,
    discount: 16
  },
  {
    id: 5,
    name: "Bateria 60Ah",
    category: "Elétrica",
    price: 189.90,
    originalPrice: 250.00,
    image: "/api/placeholder/300/300",
    rating: 4.8,
    inStock: true,
    discount: 24
  },
  {
    id: 6,
    name: "Kit Velas de Ignição",
    category: "Motor",
    price: 67.90,
    image: "/api/placeholder/300/300",
    rating: 4.9,
    inStock: false
  }
];

export function Products() {
  const { addItem, openCart } = useCart();
  const [selectedCategory, setSelectedCategory] = useState("Todos");
  const [favorites, setFavorites] = useState<number[]>([]);

  const filteredProducts = selectedCategory === "Todos" 
    ? products 
    : products.filter(product => product.category === selectedCategory);

  const toggleFavorite = (productId: number) => {
    setFavorites(prev => 
      prev.includes(productId) 
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    );
  };

  const handleWhatsAppOrder = (product: Product) => {
    const message = `Olá! Gostaria de comprar:\n🛒 ${product.name}\n💰 Preço: R$ ${product.price.toFixed(2)}\n📍 Endereço de entrega:`;
    const whatsappUrl = `https://wa.me/5511999999999?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  return (
    <section id="pecas" className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Peças <span className="gold-metallic">Originais</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Peças de qualidade original com os melhores preços do mercado. 
            Garantia de procedência e entrega rápida.
          </p>
        </div>

        {/* Category Filter */}
        <div className="flex flex-wrap justify-center gap-2 mb-12">
          {categories.map((category) => (
            <Button
              key={category}
              variant={selectedCategory === category ? "default" : "outline"}
              onClick={() => setSelectedCategory(category)}
              className="mb-2"
            >
              {category}
            </Button>
          ))}
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredProducts.map((product) => (
            <Card key={product.id} className="product-hover overflow-hidden">
              <div className="relative">
                <img 
                  src={product.image} 
                  alt={product.name}
                  className="w-full h-48 object-cover"
                />
                
                {/* Discount Badge */}
                {product.discount && (
                  <Badge className="absolute top-2 left-2 bg-moria-orange text-white font-bold">
                    -{product.discount}%
                  </Badge>
                )}

                {/* Favorite Button */}
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute top-2 right-2 bg-white/80 hover:bg-white"
                  onClick={() => toggleFavorite(product.id)}
                >
                  <Heart 
                    className={`h-4 w-4 ${
                      favorites.includes(product.id) 
                        ? 'text-red-500 fill-red-500' 
                        : 'text-gray-600'
                    }`} 
                  />
                </Button>

                {/* Stock Status */}
                {!product.inStock && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                    <span className="text-white font-bold">Esgotado</span>
                  </div>
                )}
              </div>

              <div className="p-4">
                <Badge variant="outline" className="mb-2 text-xs">
                  {product.category}
                </Badge>
                
                <h3 className="font-semibold text-lg mb-2 line-clamp-2">
                  {product.name}
                </h3>

                {/* Rating */}
                <div className="flex items-center mb-3">
                  <div className="flex">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`h-4 w-4 ${
                          i < Math.floor(product.rating)
                            ? 'text-yellow-400 fill-yellow-400'
                            : 'text-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="ml-2 text-sm text-gray-600">
                    ({product.rating})
                  </span>
                </div>

                {/* Price */}
                <div className="mb-4">
                  {product.originalPrice && (
                    <span className="text-sm text-gray-500 line-through mr-2">
                      R$ {product.originalPrice.toFixed(2)}
                    </span>
                  )}
                  <span className="text-xl font-bold text-moria-orange">
                    R$ {product.price.toFixed(2)}
                  </span>
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => {
                      addItem({
                        id: product.id,
                        name: product.name,
                        price: product.originalPrice ? product.originalPrice * (1 - (product.discount || 0) / 100) : product.price,
                        image: product.image,
                        category: product.category
                      });
                      openCart();
                    }}
                    disabled={!product.inStock}
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Carrinho
                  </Button>
                  <Button
                    variant="whatsapp"
                    size="sm"
                    className="flex-1"
                    onClick={() => handleWhatsAppOrder(product)}
                    disabled={!product.inStock}
                  >
                    WhatsApp
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* CTA Section */}
        <div className="text-center mt-16 p-8 bg-gray-50 rounded-lg">
          <h3 className="text-2xl font-bold mb-4">
            Não encontrou o que procura?
          </h3>
          <p className="text-gray-600 mb-6">
            Temos mais de 10.000 peças em estoque. Entre em contato e encontraremos a peça ideal para seu veículo.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button variant="hero" size="lg">
              Consultar Disponibilidade
            </Button>
            <Button variant="outline" size="lg">
              Falar com Especialista
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}