import { useState, useEffect } from "react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Clock, Timer, TrendingDown, Package, Loader2 } from "lucide-react";
import { useCart } from "../contexts/CartContext";
import { usePromotions } from "../hooks/usePromotions.js";

interface PromotionalProduct {
  id: number;
  productId?: number;
  name: string;
  originalPrice: number;
  discountPrice: number;
  discount: number;
  image: string;
  category: string;
  limited?: boolean;
  endTime?: Date;
  description?: string;
  type?: string;
  // Novos campos da Fase 2
  stock?: number;
  stockLow?: boolean;
  realProduct?: any;
  promotionData?: any;
  savings?: number;
}

// Simulated countdown timer hook
function useCountdown(targetDate: Date) {
  const [timeLeft, setTimeLeft] = useState({
    hours: 0,
    minutes: 0,
    seconds: 0
  });

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date().getTime();
      const distance = targetDate.getTime() - now;

      if (distance > 0) {
        setTimeLeft({
          hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((distance % (1000 * 60)) / 1000)
        });
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [targetDate]);

  return timeLeft;
}

// Dados mock removidos - agora usa dados reais do SQLite via usePromotions hook

export function Promotions() {
  const { addItem, openCart } = useCart();
  
  // Usar dados reais da API do SQLite
  const { 
    dailyOffers: apiDailyOffers, 
    weeklyOffers: apiWeeklyOffers, 
    monthlyOffers: apiMonthlyOffers, 
    loading, 
    error 
  } = usePromotions({
    active: true
  });

  // Usar dados da API ou arrays vazios em caso de erro
  const dailyOffers = error ? [] : apiDailyOffers;
  const weeklyOffers = error ? [] : apiWeeklyOffers;
  const monthlyOffers = error ? [] : apiMonthlyOffers;
  
  // Definir tempo de contagem baseado na primeira oferta diária ou padrão
  const countdownTime = dailyOffers.length > 0 && dailyOffers[0].endTime 
    ? dailyOffers[0].endTime 
    : new Date(Date.now() + 24 * 60 * 60 * 1000);
    
  const timeLeft = useCountdown(countdownTime);


  const PromotionCard = ({ product }: { product: PromotionalProduct }) => (
    <Card className="product-hover overflow-hidden">
      <div className="relative">
        <img 
          src={product.image} 
          alt={product.name}
          className="w-full h-48 object-cover"
          onError={(e) => {
            // Fallback para placeholder se imagem não carregar
            e.currentTarget.src = "/api/placeholder/300/300";
          }}
        />
        <Badge className="absolute top-2 left-2 bg-red-500 text-white font-bold animate-pulse">
          -{product.discount}%
        </Badge>
        {product.limited && (
          <Badge className="absolute top-2 right-2 bg-moria-orange text-white font-bold">
            LIMITADO
          </Badge>
        )}
        {/* Novo: Indicador de estoque baixo */}
        {product.stockLow && product.stock && product.stock > 0 && (
          <Badge className="absolute bottom-2 left-2 bg-yellow-500 text-black font-bold text-xs">
            Restam {product.stock}
          </Badge>
        )}
        {/* Novo: Indicador de produto esgotado */}
        {product.stock === 0 && (
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <Badge className="bg-red-600 text-white font-bold">
              ESGOTADO
            </Badge>
          </div>
        )}
      </div>

      <div className="p-4">
        <Badge variant="outline" className="mb-2 text-xs">
          {product.category}
        </Badge>
        
        <h3 className="font-semibold text-lg mb-3 line-clamp-2">
          {product.name}
        </h3>

        <div className="mb-4">
          <span className="text-sm text-gray-500 line-through mr-2">
            R$ {product.originalPrice.toFixed(2)}
          </span>
          <span className="text-xl font-bold text-red-600">
            R$ {product.discountPrice.toFixed(2)}
          </span>
          <div className="text-xs text-green-600 font-medium">
            Economia de R$ {product.savings?.toFixed(2) || (product.originalPrice - product.discountPrice).toFixed(2)}
          </div>
          {/* Novo: Mostrar informações de estoque */}
          {product.stock !== undefined && product.stock > 0 && !product.stockLow && (
            <div className="text-xs text-gray-600 mt-1">
              Em estoque ({product.stock} disponíveis)
            </div>
          )}
        </div>

        <Button
          variant="hero"
          size="sm"
          className="w-full"
          disabled={product.stock === 0}
          onClick={() => {
            addItem({
              id: product.productId || product.id, // Usar ID do produto real se disponível
              name: product.name,
              price: product.discountPrice,
              image: product.image,
              category: product.category
            });
            openCart();
          }}
        >
          {product.stock === 0 ? 'Indisponível' : 'Adicionar ao Carrinho'}
        </Button>
        
        {/* Novo: Informações adicionais do produto em development */}
        {process.env.NODE_ENV === 'development' && product.realProduct && (
          <div className="mt-2 text-xs text-gray-400 border-t pt-2">
            ID Real: {product.productId} | Promoção: {product.id}
          </div>
        )}
      </div>
    </Card>
  );

  return (
    <section id="promocoes" className="py-20 bg-gradient-to-br from-gray-900 to-moria-black text-white">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            <span className="gold-metallic">Promoções</span> Imperdíveis
          </h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Aproveite nossas ofertas especiais por tempo limitado. 
            Qualidade garantida com os melhores preços do mercado.
          </p>
        </div>

        {/* Daily Offers */}
        <div className="mb-16">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center">
              <Timer className="h-8 w-8 text-moria-orange mr-3" />
              <div>
                <h3 className="text-3xl font-bold">Ofertas do Dia</h3>
                <p className="text-gray-400">Válido até meia-noite</p>
              </div>
            </div>
            
            {/* Countdown Timer */}
            <div className="bg-moria-orange/20 border border-moria-orange rounded-lg p-4">
              <div className="flex items-center space-x-2 text-center">
                <div className="flex flex-col">
                  <span className="text-2xl font-bold text-moria-orange">
                    {timeLeft.hours.toString().padStart(2, '0')}
                  </span>
                  <span className="text-xs text-gray-400">HORAS</span>
                </div>
                <span className="text-moria-orange">:</span>
                <div className="flex flex-col">
                  <span className="text-2xl font-bold text-moria-orange">
                    {timeLeft.minutes.toString().padStart(2, '0')}
                  </span>
                  <span className="text-xs text-gray-400">MIN</span>
                </div>
                <span className="text-moria-orange">:</span>
                <div className="flex flex-col">
                  <span className="text-2xl font-bold text-moria-orange">
                    {timeLeft.seconds.toString().padStart(2, '0')}
                  </span>
                  <span className="text-xs text-gray-400">SEG</span>
                </div>
              </div>
            </div>
          </div>
          
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[1, 2, 3, 4].map((i) => (
                <Card key={i} className="animate-pulse overflow-hidden">
                  <div className="relative">
                    <div className="bg-gray-600 h-48 w-full"></div>
                    <div className="absolute top-2 left-2 bg-gray-500 h-6 w-12 rounded"></div>
                    <div className="absolute top-2 right-2 bg-gray-500 h-6 w-16 rounded"></div>
                  </div>
                  <div className="p-4 space-y-3">
                    <div className="bg-gray-600 h-4 rounded w-1/3"></div>
                    <div className="bg-gray-600 h-6 rounded w-4/5"></div>
                    <div className="bg-gray-600 h-4 rounded w-2/3"></div>
                    <div className="space-y-2">
                      <div className="bg-gray-600 h-4 rounded w-1/2"></div>
                      <div className="bg-gray-600 h-8 rounded w-full"></div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          ) : dailyOffers.length === 0 ? (
            <div className="text-center py-12">
              <Timer className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <p className="text-xl text-gray-400">
                {error ? 'Erro ao carregar ofertas diárias' : 'Nenhuma oferta diária disponível no momento'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {dailyOffers.map((product) => (
                <PromotionCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>

        {/* Weekly Offers */}
        <div className="mb-16">
          <div className="flex items-center mb-8">
            <TrendingDown className="h-8 w-8 text-gold-accent mr-3" />
            <div>
              <h3 className="text-3xl font-bold">Ofertas da Semana</h3>
              <p className="text-gray-400">Semana da Manutenção</p>
            </div>
          </div>
          
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[1, 2, 3, 4].map((i) => (
                <Card key={i} className="animate-pulse overflow-hidden">
                  <div className="relative">
                    <div className="bg-gray-600 h-48 w-full"></div>
                    <div className="absolute top-2 left-2 bg-gray-500 h-6 w-12 rounded"></div>
                    <div className="absolute top-2 right-2 bg-gray-500 h-6 w-16 rounded"></div>
                  </div>
                  <div className="p-4 space-y-3">
                    <div className="bg-gray-600 h-4 rounded w-1/3"></div>
                    <div className="bg-gray-600 h-6 rounded w-4/5"></div>
                    <div className="bg-gray-600 h-4 rounded w-2/3"></div>
                    <div className="space-y-2">
                      <div className="bg-gray-600 h-4 rounded w-1/2"></div>
                      <div className="bg-gray-600 h-8 rounded w-full"></div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          ) : weeklyOffers.length === 0 ? (
            <div className="text-center py-12">
              <TrendingDown className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <p className="text-xl text-gray-400">
                {error ? 'Erro ao carregar ofertas semanais' : 'Nenhuma oferta semanal disponível no momento'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {weeklyOffers.map((product) => (
                <PromotionCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>

        {/* Monthly Offers */}
        <div className="mb-16">
          <div className="gold-metallic-bg p-8 rounded-lg">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center">
                <Package className="h-8 w-8 text-moria-black mr-3" />
                <div>
                  <h3 className="text-3xl font-bold text-moria-black">Ofertas do Mês</h3>
                  <p className="text-moria-black/70">Kits promocionais com desconto progressivo</p>
                </div>
              </div>
              <Badge className="bg-moria-black text-gold-accent font-bold text-lg px-4 py-2">
                {monthlyOffers.length > 0 ? `ATÉ ${Math.max(...monthlyOffers.map(p => p.discount))}% OFF` : 'ATÉ 31% OFF'}
              </Badge>
            </div>
            
            {loading ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {[1, 2].map((i) => (
                  <Card key={i} className="animate-pulse overflow-hidden bg-moria-black/10">
                    <div className="relative">
                      <div className="bg-moria-black/20 h-48 w-full"></div>
                      <div className="absolute top-2 left-2 bg-moria-black/30 h-6 w-12 rounded"></div>
                      <div className="absolute top-2 right-2 bg-moria-black/30 h-6 w-16 rounded"></div>
                    </div>
                    <div className="p-4 space-y-3">
                      <div className="bg-moria-black/20 h-4 rounded w-1/3"></div>
                      <div className="bg-moria-black/20 h-6 rounded w-4/5"></div>
                      <div className="bg-moria-black/20 h-4 rounded w-2/3"></div>
                      <div className="space-y-2">
                        <div className="bg-moria-black/20 h-4 rounded w-1/2"></div>
                        <div className="bg-moria-black/20 h-8 rounded w-full"></div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            ) : monthlyOffers.length === 0 ? (
              <div className="text-center py-12">
                <Package className="h-16 w-16 text-moria-black/50 mx-auto mb-4" />
                <p className="text-xl text-moria-black/70">
                  {error ? 'Erro ao carregar ofertas mensais' : 'Nenhuma oferta mensal disponível no momento'}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {monthlyOffers.map((product) => (
                  <PromotionCard key={product.id} product={product} />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center bg-moria-orange/10 border border-moria-orange/30 rounded-lg p-8">
          <Clock className="h-16 w-16 text-moria-orange mx-auto mb-4" />
          <h3 className="text-2xl font-bold mb-4">
            Não perca essas ofertas!
          </h3>
          <p className="text-gray-300 mb-6 max-w-2xl mx-auto">
            Aproveite nossas promoções por tempo limitado. Peças originais com qualidade garantida 
            e os melhores preços do mercado.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button variant="hero" size="lg">
              Ver Todas as Promoções
            </Button>
            <Button variant="outline" size="lg" className="border-white text-white hover:bg-white hover:text-moria-black">
              Falar com Vendedor
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}