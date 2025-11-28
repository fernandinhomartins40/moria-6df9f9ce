import { useMarqueeMessages } from '@/hooks/useMarqueeMessages';

export function Marquee() {
  const { messages, loading } = useMarqueeMessages();

  // Pegar apenas mensagens ativas e ordenadas
  const activeMessages = messages
    .filter(msg => msg.active)
    .sort((a, b) => a.order - b.order)
    .map(msg => msg.message);

  // Fallback para mensagens padrão se não houver mensagens ou ainda estiver carregando
  const displayMessages = activeMessages.length > 0
    ? activeMessages
    : [
        "🔧 PEÇAS ORIGINAIS COM ATÉ 30% DE DESCONTO",
        "⚡ SERVIÇOS ESPECIALIZADOS - ORÇAMENTO GRÁTIS",
        "🚗 ENTREGA RÁPIDA EM TODA A CIDADE",
        "🛠️ QUALIDADE GARANTIDA - ESPECIALISTAS HÁ MAIS DE 15 ANOS",
        "💰 PROMOÇÕES IMPERDÍVEIS - CONFIRA NOSSAS OFERTAS",
      ];

  if (loading && messages.length === 0) {
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
    <div className="gradient-marquee text-white py-2 overflow-hidden">
      <div className="marquee whitespace-nowrap text-sm font-bold">
        {displayMessages.join(" • ")} • {displayMessages.join(" • ")} • {displayMessages.join(" • ")} • {displayMessages.join(" • ")}
      </div>
    </div>
  );
}