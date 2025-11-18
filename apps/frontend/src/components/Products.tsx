import { useState, useEffect } from "react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Star, Plus, Heart, Loader2, AlertCircle, Package } from "lucide-react";
import { useCart } from "../contexts/CartContext";
import productService, { Product as ApiProduct } from "@/api/productService";
import { getImageUrl } from "@/utils/imageUrl";

export function Products() {
  const { addItem, openCart } = useCart();
  const [selectedCategory, setSelectedCategory] = useState("Todos");
  const [favorites, setFavorites] = useState<string[]>([]);
  const [products, setProducts] = useState<ApiProduct[]>([]);
  const [categories, setCategories] = useState<string[]>(["Todos"]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Carregar categorias ao montar
  useEffect(() => {
    loadCategories();
  }, []);

  // Carregar produtos quando categoria muda
  useEffect(() => {
    loadProducts();
  }, [selectedCategory]);

  const loadCategories = async () => {
    try {
      const response = await productService.getCategories();
      const categoryNames = response.data.map(c => c.category);
      setCategories(["Todos", ...categoryNames]);
    } catch (error) {
      console.error('Erro ao carregar categorias:', error);
      // Fallback para categorias padrão
      setCategories([
        "Todos",
        "Motor",
        "Freios",
        "Suspensão",
        "Elétrica",
        "Filtros",
        "Óleos",
      ]);
    }
  };

  const loadProducts = async () => {
    try {
      setLoading(true);
      setError(null);

      const params = {
        limit: 20,
        ...(selectedCategory !== "Todos" && { category: selectedCategory }),
        inStock: true, // Apenas produtos em estoque
      };

      const response = await productService.getPublicProducts(params);

      // Filtrar apenas produtos ativos
      const activeProducts = response.data.filter(p => p.status === 'ACTIVE');
      setProducts(activeProducts);
    } catch (error) {
      console.error('Erro ao carregar produtos:', error);
      setError('Erro ao carregar produtos. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const toggleFavorite = (productId: string) => {
    setFavorites(prev =>
      prev.includes(productId)
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    );
  };

  // Calcular preço de exibição
  const getDisplayPrice = (product: ApiProduct) => {
    return product.promoPrice || product.salePrice;
  };

  // Calcular desconto percentual
  const getDiscountPercentage = (product: ApiProduct) => {
    if (product.promoPrice && product.salePrice && product.promoPrice < product.salePrice) {
      return Math.round((1 - product.promoPrice / product.salePrice) * 100);
    }
    return 0;
  };

  // Verificar se produto está em estoque
  const isInStock = (product: ApiProduct) => {
    return product.stock > 0 && product.status === 'ACTIVE';
  };

  // Obter primeira imagem ou placeholder
  const getProductImage = (product: ApiProduct) => {
    if (product.images && product.images.length > 0) {
      return getImageUrl(product.images[0]);
    }
    return '/placeholder-product.jpg';
  };

  // Rating fictício (pode ser implementado no futuro)
  const getProductRating = () => {
    return 4.5 + Math.random() * 0.5; // Entre 4.5 e 5.0
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
              disabled={loading}
            >
              {category}
            </Button>
          ))}
        </div>

        {/* Loading State with Skeleton */}
        {loading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, index) => (
              <Card key={index} className="overflow-hidden">
                <div className="relative">
                  <div className="w-full h-48 bg-gray-200 animate-pulse" />
                </div>
                <div className="p-4 space-y-3">
                  <div className="h-5 w-20 bg-gray-200 animate-pulse rounded" />
                  <div className="h-6 w-full bg-gray-200 animate-pulse rounded" />
                  <div className="h-4 w-24 bg-gray-200 animate-pulse rounded" />
                  <div className="h-8 w-32 bg-gray-200 animate-pulse rounded" />
                  <div className="h-10 w-full bg-gray-200 animate-pulse rounded" />
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div className="flex flex-col items-center justify-center py-20">
            <AlertCircle className="h-16 w-16 text-red-500 mb-4" />
            <p className="text-xl text-gray-600 mb-4">{error}</p>
            <Button onClick={loadProducts} variant="hero">
              Tentar Novamente
            </Button>
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && products.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20">
            <Package className="h-16 w-16 text-gray-400 mb-4" />
            <p className="text-xl text-gray-600 mb-2">Nenhum produto encontrado</p>
            <p className="text-gray-500">
              {selectedCategory !== "Todos"
                ? `Não há produtos na categoria ${selectedCategory} no momento.`
                : 'Não há produtos disponíveis no momento.'}
            </p>
          </div>
        )}

        {/* Products Grid */}
        {!loading && !error && products.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map((product) => {
              const displayPrice = getDisplayPrice(product);
              const discount = getDiscountPercentage(product);
              const inStock = isInStock(product);
              const imageUrl = getProductImage(product);
              const rating = getProductRating();

              return (
                <Card key={product.id} className="product-hover overflow-hidden">
                  <div className="relative">
                    <img
                      src={imageUrl}
                      alt={product.name}
                      className="w-full h-48 object-cover"
                      onError={(e) => {
                        // Fallback se imagem falhar
                        (e.target as HTMLImageElement).src = '/placeholder-product.jpg';
                      }}
                    />

                    {/* Discount Badge */}
                    {discount > 0 && (
                      <Badge className="absolute top-2 left-2 bg-moria-orange text-white font-bold">
                        -{discount}%
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
                    {!inStock && (
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
                              i < Math.floor(rating)
                                ? 'text-yellow-400 fill-yellow-400'
                                : 'text-gray-300'
                            }`}
                          />
                        ))}
                      </div>
                      <span className="ml-2 text-sm text-gray-600">
                        ({rating.toFixed(1)})
                      </span>
                    </div>

                    {/* Price */}
                    <div className="mb-4">
                      {product.promoPrice && product.salePrice && product.promoPrice < product.salePrice && (
                        <span className="text-sm text-gray-500 line-through mr-2">
                          R$ {Number(product.salePrice).toFixed(2)}
                        </span>
                      )}
                      <span className="text-xl font-bold text-moria-orange">
                        R$ {Number(displayPrice).toFixed(2)}
                      </span>
                    </div>

                    {/* Stock Info */}
                    {inStock && product.stock <= product.minStock && (
                      <p className="text-xs text-orange-600 mb-2">
                        Últimas unidades!
                      </p>
                    )}

                    {/* Actions */}
                    <Button
                      variant="hero"
                      size="sm"
                      className="w-full"
                      onClick={() => {
                        addItem({
                          id: product.id,
                          name: product.name,
                          price: Number(displayPrice),
                          image: imageUrl,
                          category: product.category
                        });
                        openCart();
                      }}
                      disabled={!inStock}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Adicionar ao Carrinho
                    </Button>
                  </div>
                </Card>
              );
            })}
          </div>
        )}

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