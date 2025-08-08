import { useState, useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { useCart } from "../../contexts/CartContext";
import { Card, CardContent } from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Heart, Plus, ShoppingCart } from "lucide-react";

// Mock products (same as in Products.tsx)
const products = [
  {
    id: 1,
    name: "Filtro de Óleo Bosch",
    category: "Filtros",
    price: 35.90,
    originalPrice: 42.90,
    image: "/placeholder.svg",
    rating: 4.8,
    inStock: true,
    discount: 16
  },
  {
    id: 3,
    name: "Óleo Motor Castrol 5W30",
    category: "Óleos",
    price: 45.90,
    image: "/placeholder.svg",
    rating: 4.9,
    inStock: true
  },
  {
    id: 5,
    name: "Amortecedor Dianteiro Monroe",
    category: "Suspensão",
    price: 180.00,
    originalPrice: 220.00,
    image: "/placeholder.svg",
    rating: 4.7,
    inStock: true,
    discount: 18
  }
];

export function CustomerFavorites() {
  const { getFavorites, removeFromFavorites } = useAuth();
  const { addItem, openCart } = useCart();
  const [favoriteIds, setFavoriteIds] = useState<number[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadFavorites();
  }, []);

  const loadFavorites = async () => {
    try {
      const favorites = await getFavorites();
      setFavoriteIds(favorites);
    } catch (error) {
      console.error('Error loading favorites:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveFromFavorites = async (productId: number) => {
    try {
      await removeFromFavorites(productId);
      setFavoriteIds(prev => prev.filter(id => id !== productId));
    } catch (error) {
      console.error('Error removing from favorites:', error);
    }
  };

  const handleAddToCart = (product: any) => {
    addItem({
      id: product.id,
      name: product.name,
      price: product.originalPrice ? product.originalPrice * (1 - (product.discount || 0) / 100) : product.price,
      image: product.image,
      category: product.category
    });
    openCart();
  };

  const favoriteProducts = products.filter(product => favoriteIds.includes(product.id));

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(price);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Heart className="h-8 w-8 animate-pulse text-moria-orange" />
        <span className="ml-2">Carregando favoritos...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Meus Favoritos</h1>
        <p className="text-muted-foreground">Produtos que você salvou para depois</p>
      </div>

      {favoriteProducts.length === 0 ? (
        <Card>
          <CardContent className="py-12">
            <div className="text-center text-muted-foreground">
              <Heart className="mx-auto h-12 w-12 text-muted-foreground/50" />
              <h3 className="mt-2 text-lg font-medium">Nenhum produto favorito</h3>
              <p className="mt-1">
                Adicione produtos aos favoritos para encontrá-los facilmente depois
              </p>
              <Button className="mt-4" onClick={() => window.location.hash = '#pecas'}>
                Explorar Produtos
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {favoriteProducts.map((product) => (
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

                {/* Remove from Favorites Button */}
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute top-2 right-2 bg-white/80 hover:bg-white"
                  onClick={() => handleRemoveFromFavorites(product.id)}
                >
                  <Heart className="h-4 w-4 fill-red-500 text-red-500" />
                </Button>
              </div>

              <CardContent className="p-4">
                <div className="space-y-2">
                  <Badge variant="secondary" className="text-xs">
                    {product.category}
                  </Badge>
                  
                  <h3 className="font-semibold text-sm line-clamp-2">
                    {product.name}
                  </h3>
                  
                  <div className="flex items-center space-x-1">
                    <span className="text-yellow-500">★</span>
                    <span className="text-xs text-muted-foreground">
                      {product.rating}
                    </span>
                  </div>

                  <div className="space-y-1">
                    {product.originalPrice && product.discount ? (
                      <div>
                        <span className="text-xs text-muted-foreground line-through">
                          {formatPrice(product.originalPrice)}
                        </span>
                        <div className="text-lg font-bold text-moria-orange">
                          {formatPrice(product.price)}
                        </div>
                      </div>
                    ) : (
                      <div className="text-lg font-bold text-moria-orange">
                        {formatPrice(product.price)}
                      </div>
                    )}
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full"
                    onClick={() => handleAddToCart(product)}
                    disabled={!product.inStock}
                  >
                    <ShoppingCart className="h-4 w-4 mr-1" />
                    {product.inStock ? 'Adicionar ao Carrinho' : 'Indisponível'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}