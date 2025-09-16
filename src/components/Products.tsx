import { useState } from "react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { ProductImageGallery } from "./ui/ProductImageGallery";
import { Star, Plus, Heart } from "lucide-react";
import { useCart } from "../contexts/CartContext";
import { useProducts } from "../hooks/useProducts.js";

interface Product {
  id: number;
  name: string;
  category: string;
  price: number;
  originalPrice?: number;
  image: string;
  images?: Array<{
    thumbnail: string;
    medium: string;
    full: string;
  }> | string[]; // Suportar tanto a nova estrutura quanto a antiga
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

// Dados mock removidos - agora usa dados reais do SQLite via useProducts hook

export function Products() {
  const { addItem, openCart } = useCart();
  const [selectedCategory, setSelectedCategory] = useState("Todos");
  const [favorites, setFavorites] = useState<number[]>([]);
  
  // Usar dados reais da API do SQLite
  const { products: apiProducts, loading, error, updateFilters } = useProducts({
    category: selectedCategory === "Todos" ? undefined : selectedCategory,
    active: true
  });

  // Função helper para processar imagens
  const getProductImages = (product: any) => {
    if (!product.images || product.images.length === 0) {
      return {
        imageUrls: [product.image || product.image_url || '/api/placeholder/400/400'],
        primaryImage: product.image || product.image_url || '/api/placeholder/400/400'
      };
    }

    // Se é a nova estrutura (array de objetos com thumbnail, medium, full)
    if (Array.isArray(product.images) && product.images[0] && typeof product.images[0] === 'object' && product.images[0].thumbnail) {
      return {
        imageUrls: product.images.map((img: any) => img.medium || img.thumbnail), // Usar medium para visualização
        primaryImage: product.images[0]?.thumbnail || product.image || '/api/placeholder/400/400'
      };
    }

    // Se é a estrutura antiga (array de strings)
    if (Array.isArray(product.images) && typeof product.images[0] === 'string') {
      return {
        imageUrls: product.images,
        primaryImage: product.images[0] || product.image || '/api/placeholder/400/400'
      };
    }

    // Fallback
    return {
      imageUrls: [product.image || product.image_url || '/api/placeholder/400/400'],
      primaryImage: product.image || product.image_url || '/api/placeholder/400/400'
    };
  };

  // Usar produtos da API (dados reais do SQLite)
  const filteredProducts = error ? [] : apiProducts;

  const toggleFavorite = (productId: number) => {
    setFavorites(prev => 
      prev.includes(productId) 
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    );
  };

  // Atualizar filtros da API quando categoria muda
  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
    updateFilters({
      category: category === "Todos" ? undefined : category
    });
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
              onClick={() => handleCategoryChange(category)}
              className="mb-2"
            >
              {category}
            </Button>
          ))}
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredProducts.map((product) => {
            const { imageUrls, primaryImage } = getProductImages(product);

            return (
              <Card key={product.id} className="product-hover overflow-hidden">
                <div className="relative">
                  {/* Usar galeria se há múltiplas imagens, senão imagem simples */}
                  {imageUrls.length > 1 ? (
                    <ProductImageGallery
                      images={imageUrls}
                      productName={product.name}
                      aspectRatio="square"
                      thumbnailSize="sm"
                      enableZoom={false}
                      enableFullscreen={true}
                      className="h-48"
                    />
                  ) : (
                    <img
                      src={primaryImage}
                      alt={product.name}
                      className="w-full h-48 object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = '/api/placeholder/400/400';
                      }}
                    />
                  )}

                {/* Discount Badge */}
                {product.discount && (
                  <Badge className="absolute top-2 left-2 bg-moria-orange text-white font-bold z-10">
                    -{product.discount}%
                  </Badge>
                )}

                {/* Favorite Button */}
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute top-2 right-2 bg-white/80 hover:bg-white z-10"
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
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-10">
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
                <Button
                  variant="hero"
                  size="sm"
                  className="w-full"
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
                  <Plus className="h-4 w-4 mr-2" />
                  Adicionar ao Carrinho
                </Button>
              </div>
            </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}