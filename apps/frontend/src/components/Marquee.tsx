import { useMarqueeMessages } from '@/hooks/useMarqueeMessages';
import { useLandingPageConfig } from '@/hooks/useLandingPageConfig';
import { colorOrGradientToCSS } from '@/components/admin/LandingPageEditor/StyleControls';

export function Marquee() {
  const { messages, loading } = useMarqueeMessages();
  const { config, loading: configLoading } = useLandingPageConfig();

  // Pegar mensagens do CMS se disponível, senão usar API, senão usar fallback
  const cmsMessages = !configLoading && config.marquee.items && config.marquee.items.length > 0
    ? config.marquee.items.map(item => `${item.icon} ${item.text}`)
    : null;

  // Pegar apenas mensagens ativas e ordenadas da API
  const apiMessages = messages
    .filter(msg => msg.active)
    .sort((a, b) => a.order - b.order)
    .map(msg => msg.message);

  // Prioridade: CMS > API > Fallback
  const displayMessages = cmsMessages || (apiMessages.length > 0 ? apiMessages : [
    "🔧 PEÇAS ORIGINAIS COM ATÉ 30% DE DESCONTO",
    "⚡ SERVIÇOS ESPECIALIZADOS - ORÇAMENTO GRÁTIS",
    "🚗 ENTREGA RÁPIDA EM TODA A CIDADE",
    "🛠️ QUALIDADE GARANTIDA - ESPECIALISTAS HÁ MAIS DE 15 ANOS",
    "💰 PROMOÇÕES IMPERDÍVEIS - CONFIRA NOSSAS OFERTAS",
  ]);

  // Usar cores e configurações do CMS
  const backgroundStyle = !configLoading ? colorOrGradientToCSS(config.marquee.backgroundColor) : { background: 'linear-gradient(90deg, #667eea 0%, #764ba2 100%)' };
  const textStyle = !configLoading ? colorOrGradientToCSS(config.marquee.textColor) : { color: '#ffffff' };
  const speed = !configLoading ? config.marquee.speed : 30;

  if (loading && messages.length === 0 && configLoading) {
    // Enquanto carrega, mostra as mensagens padrão
    return (
      <div className="gradient-marquee text-white py-2 overflow-hidden">
        <div className="marquee whitespace-nowrap text-sm font-bold">
          🔧 PEÇAS ORIGINAIS COM ATÉ 30% DE DESCONTO • ⚡ SERVIÇOS ESPECIALIZADOS - ORÇAMENTO GRÁTIS • 🚗 ENTREGA RÁPIDA EM TODA A CIDADE
        </div>
      </div>
    );
  }

  return (
    <div
      className="text-white py-2 overflow-hidden"
      style={{
        ...backgroundStyle,
        ...textStyle,
      }}
    >
      <div
        className="marquee whitespace-nowrap text-sm font-bold"
        style={{
          animationDuration: `${speed}s`,
        }}
      >
        {displayMessages.join(" • ")} • {displayMessages.join(" • ")} • {displayMessages.join(" • ")} • {displayMessages.join(" • ")}
      </div>
    </div>
  );
}