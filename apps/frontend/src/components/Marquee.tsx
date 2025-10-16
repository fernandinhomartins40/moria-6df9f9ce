export function Marquee() {
  const messages = [
    "🔧 PEÇAS ORIGINAIS COM ATÉ 30% DE DESCONTO",
    "⚡ SERVIÇOS ESPECIALIZADOS - ORÇAMENTO GRÁTIS",
    "🚗 ENTREGA RÁPIDA EM TODA A CIDADE",
    "🛠️ QUALIDADE GARANTIDA - ESPECIALISTAS HÁ MAIS DE 15 ANOS",
    "💰 PROMOÇÕES IMPERDÍVEIS - CONFIRA NOSSAS OFERTAS",
  ];

  return (
    <div className="gradient-marquee text-white py-2 overflow-hidden">
      <div className="marquee whitespace-nowrap text-sm font-bold">
        {messages.join(" • ")} • {messages.join(" • ")} • {messages.join(" • ")} • {messages.join(" • ")}
      </div>
    </div>
  );
}