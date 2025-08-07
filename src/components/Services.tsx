import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { useCart } from "../contexts/CartContext";
import { 
  Wrench, 
  Droplets, 
  Search, 
  Disc, 
  Snowflake, 
  Zap,
  Clock,
  Shield,
  Plus
} from "lucide-react";

const services = [
  {
    id: 101,
    icon: Wrench,
    title: "Manutenção Preventiva",
    description: "Revisões completas para manter seu veículo sempre em perfeito estado",
    features: ["Revisão geral", "Checklist completo", "Relatório detalhado"],
    price: "A partir de R$ 150",
    category: "Manutenção"
  },
  {
    id: 102,
    icon: Droplets,
    title: "Troca de Óleo",
    description: "Óleos originais e de qualidade para prolongar a vida do motor",
    features: ["Óleos premium", "Filtros inclusos", "Descarte ecológico"],
    price: "A partir de R$ 80",
    category: "Manutenção"
  },
  {
    id: 103,
    icon: Search,
    title: "Diagnóstico Eletrônico",
    description: "Equipamentos modernos para identificar problemas com precisão",
    features: ["Scanner profissional", "Relatório técnico", "Solução rápida"],
    price: "A partir de R$ 50",
    category: "Diagnóstico"
  },
  {
    id: 104,
    icon: Disc,
    title: "Freios e Suspensão",
    description: "Segurança em primeiro lugar com serviços especializados",
    features: ["Pastilhas originais", "Fluido de freio", "Teste de segurança"],
    price: "A partir de R$ 200",
    category: "Segurança"
  },
  {
    id: 105,
    icon: Snowflake,
    title: "Ar Condicionado",
    description: "Climatização perfeita para seu conforto em qualquer época",
    features: ["Higienização", "Recarga de gás", "Troca de filtros"],
    price: "A partir de R$ 120",
    category: "Conforto"
  },
  {
    id: 106,
    icon: Zap,
    title: "Sistema Elétrico",
    description: "Especialistas em problemas elétricos e eletrônicos",
    features: ["Diagnóstico avançado", "Reparo de chicotes", "Atualização ECU"],
    price: "A partir de R$ 100",
    category: "Elétrica"
  }
];

export function Services() {
  const { addItem, openCart } = useCart();

  const handleAddService = (service: any) => {
    addItem({
      id: service.id,
      name: service.title,
      price: 0, // Serviços não têm preço fixo
      quantity: 1,
      category: service.category,
      type: 'service',
      description: service.description
    });
    openCart();
  };
  return (
    <section id="servicos" className="py-20 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Nossos <span className="gold-metallic">Serviços</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Oferecemos uma gama completa de serviços automotivos com qualidade profissional 
            e preços justos. Sua tranquilidade é nossa prioridade.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((service, index) => (
            <Card key={index} className="bg-card-dark text-card-dark-foreground p-6 hover-lift border-moria-orange/20 hover:border-moria-orange/50 transition-all duration-300">
              <div className="flex items-center mb-4">
                <div className="gold-metallic-bg p-3 rounded-full mr-4">
                  <service.icon className="h-6 w-6 text-moria-black" />
                </div>
                <h3 className="text-xl font-bold">{service.title}</h3>
              </div>
              
              <p className="text-gray-300 mb-4">{service.description}</p>
              
              <ul className="space-y-2 mb-6">
                {service.features.map((feature, idx) => (
                  <li key={idx} className="flex items-center text-sm text-gray-400">
                    <div className="w-2 h-2 bg-moria-orange rounded-full mr-2"></div>
                    {feature}
                  </li>
                ))}
              </ul>

              <div className="flex items-center justify-between">
                <span className="text-moria-orange font-bold">{service.price}</span>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => handleAddService(service)}
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Solicitar Orçamento
                </Button>
              </div>
            </Card>
          ))}
        </div>

        {/* Trust Indicators */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-16 text-center">
          <div className="flex flex-col items-center">
            <div className="gold-metallic-bg p-4 rounded-full mb-2">
              <Shield className="h-8 w-8 text-moria-black" />
            </div>
            <h4 className="font-bold text-moria-black">Garantia</h4>
            <p className="text-gray-600 text-sm">6 meses em todos os serviços</p>
          </div>
          <div className="flex flex-col items-center">
            <div className="gold-metallic-bg p-4 rounded-full mb-2">
              <Clock className="h-8 w-8 text-moria-black" />
            </div>
            <h4 className="font-bold text-moria-black">Agilidade</h4>
            <p className="text-gray-600 text-sm">Atendimento rápido e eficiente</p>
          </div>
          <div className="flex flex-col items-center">
            <div className="bg-moria-orange p-4 rounded-full mb-2">
              <Wrench className="h-8 w-8 text-white" />
            </div>
            <h4 className="font-bold text-moria-black">Expertise</h4>
            <p className="text-gray-600 text-sm">15+ anos de experiência</p>
          </div>
          <div className="flex flex-col items-center">
            <div className="bg-moria-orange p-4 rounded-full mb-2">
              <Zap className="h-8 w-8 text-white" />
            </div>
            <h4 className="font-bold text-moria-black">Tecnologia</h4>
            <p className="text-gray-600 text-sm">Equipamentos modernos</p>
          </div>
        </div>
      </div>
    </section>
  );
}