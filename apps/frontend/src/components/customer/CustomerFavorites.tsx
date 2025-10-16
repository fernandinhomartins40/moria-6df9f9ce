import { useState, useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { useCart } from "../../contexts/CartContext";
import { useFavorites } from "../../hooks/useFavorites";
import { productService } from "../../api";
import { Card, CardContent } from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Alert, AlertDescription } from "../ui/alert";
import { Skeleton } from "../ui/skeleton";
import { FavoriteButton } from "../FavoriteButton";
import { Heart, ShoppingCart, AlertCircle, RefreshCw } from "lucide-react";
import { useToast } from "../../hooks/use-toast";
import type { Product } from "../../api/productService";

interface FavoriteProductData extends Product {
  favoriteId: string;
  addedAt: string;
}

export function CustomerFavorites() {
  const { isAuthenticated } = useAuth();
  const { addItem, openCart } = useCart();
  const { favorites, loading, error, fetchFavorites, clearError } = useFavorites();
  const { toast } = useToast();

  const [favoriteProducts, setFavoriteProducts] = useState<FavoriteProductData[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [productError, setProductError] = useState<string | null>(null);

  useEffect(() => {
    if (isAuthenticated) {
      loadFavoritesData();
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (favorites.length > 0) {
      loadProductData();
    } else {
      setFavoriteProducts([]);
    }
  }, [favorites]);

  const loadFavoritesData = async () => {
    try {
      await fetchFavorites();
    } catch (err) {
      console.error('Error loading favorites:', err);
    }
  };

  const loadProductData = async () => {
    setLoadingProducts(true);
    setProductError(null);

    try {
      const productPromises = favorites.map(async (favorite) => {
        try {
          const product = await productService.getProductById(favorite.productId);
          return {
            ...product,
            favoriteId: favorite.id,
            addedAt: favorite.createdAt
          } as FavoriteProductData;
        } catch (err) {
          console.error(`Error loading product ${favorite.productId}:`, err);
          return null;
        }
      });

      const products = await Promise.all(productPromises);
      const validProducts = products.filter((p): p is FavoriteProductData => p !== null);

      setFavoriteProducts(validProducts);
    } catch (err) {
      setProductError("Erro ao carregar dados dos produtos");
      console.error('Error loading product data:', err);
    } finally {
      setLoadingProducts(false);
    }
  };

  const handleAddToCart = (product: FavoriteProductData) => {
    const price = product.promoPrice || product.salePrice;

    addItem({
      id: product.id,
      name: product.name,
      price: price,
      image: product.images,
      category: product.category,
      type: 'product'
    });

    toast({
      title: "Produto adicionado",
      description: `${product.name} foi adicionado ao carrinho.`,
    });

    openCart();
  };

  const handleRetry = () => {
    clearError();
    setProductError(null);
    loadFavoritesData();
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(price);
  };

  const formatDate = (dateString: string) => {
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    }).format(new Date(dateString));
  };

  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center py-12">
        <Card className="w-full max-w-md">
          <CardContent className="py-12 text-center">
            <Heart className="mx-auto h-12 w-12 text-muted-foreground/50" />
            <h3 className="mt-4 text-lg font-medium">Login necessário</h3>
            <p className="mt-2 text-muted-foreground">
              Faça login para ver seus produtos favoritos
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (loading || loadingProducts) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Meus Favoritos</h1>
          <p className="text-muted-foreground">Produtos que você salvou para depois</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {Array.from({ length: 6 }).map((_, index) => (
            <Card key={index} className="overflow-hidden">
              <Skeleton className="w-full h-48" />
              <CardContent className="p-4 space-y-3">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-8 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Meus Favoritos</h1>
        <p className="text-muted-foreground">Produtos que você salvou para depois</p>
      </div>

      {/* Error Display */}
      {(error || productError) && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="flex items-center justify-between">
            <span>{error || productError}</span>
            <Button
              variant="outline"
              size="sm"
              onClick={handleRetry}
              className="ml-4"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Tentar Novamente
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {favoriteProducts.length === 0 && !loading && !error && !productError ? (
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
          {favoriteProducts.map((product) => {
            const hasPromo = product.promoPrice && product.promoPrice < product.salePrice;
            const finalPrice = product.promoPrice || product.salePrice;
            const discount = hasPromo ? Math.round(((product.salePrice - product.promoPrice!) / product.salePrice) * 100) : 0;

            return (
              <Card key={product.id} className="product-hover overflow-hidden">
                <div className="relative">
                  <img
                    src={product.images || "/placeholder.svg"}
                    alt={product.name}
                    className="w-full h-48 object-cover"
                  />

                  {/* Discount Badge */}
                  {discount > 0 && (
                    <Badge className="absolute top-2 left-2 bg-red-500 text-white font-bold">
                      -{discount}%
                    </Badge>
                  )}

                  {/* Stock Status */}
                  {!product.isActive && (
                    <Badge className="absolute top-2 left-2 bg-gray-500 text-white">
                      Indisponível
                    </Badge>
                  )}

                  {/* Favorite Button */}
                  <div className="absolute top-2 right-2">
                    <FavoriteButton
                      productId={product.id}
                      productName={product.name}
                      className="bg-white/80 hover:bg-white"
                    />
                  </div>
                </div>

                <CardContent className="p-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Badge variant="secondary" className="text-xs">
                        {product.category}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        Favoritado em {formatDate(product.addedAt)}
                      </span>
                    </div>

                    <h3 className="font-semibold text-sm line-clamp-2 min-h-[2.5rem]">
                      {product.name}
                    </h3>

                    {product.subcategory && (
                      <p className="text-xs text-muted-foreground">
                        {product.subcategory}
                      </p>
                    )}

                    <div className="space-y-1">
                      {hasPromo ? (
                        <div>
                          <span className="text-xs text-muted-foreground line-through">
                            {formatPrice(product.salePrice)}
                          </span>
                          <div className="text-lg font-bold text-red-600">
                            {formatPrice(finalPrice)}
                          </div>
                        </div>
                      ) : (
                        <div className="text-lg font-bold text-green-600">
                          {formatPrice(finalPrice)}
                        </div>
                      )}
                    </div>

                    {product.stock <= product.minStock && product.isActive && (
                      <Badge variant="outline" className="text-xs text-orange-600">
                        Estoque baixo ({product.stock} unidades)
                      </Badge>
                    )}

                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full"
                      onClick={() => handleAddToCart(product)}
                      disabled={!product.isActive || product.stock === 0}
                    >
                      <ShoppingCart className="h-4 w-4 mr-1" />
                      {product.isActive && product.stock > 0
                        ? 'Adicionar ao Carrinho'
                        : 'Indisponível'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Summary */}
      {favoriteProducts.length > 0 && (
        <div className="text-center text-sm text-muted-foreground pt-4">
          {favoriteProducts.length === 1
            ? "1 produto favorito"
            : `${favoriteProducts.length} produtos favoritos`
          }
        </div>
      )}
    </div>
  );
}