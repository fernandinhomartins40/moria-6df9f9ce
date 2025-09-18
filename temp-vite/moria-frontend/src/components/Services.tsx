import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { useCart } from "../contexts/CartContext";
import { useServices } from "../hooks/useServices.js";
import { 
  Wrench, 
  Droplets, 
  Search, 
  Disc, 
  Snowflake, 
  Zap,
  Clock,
  Shield,
  Plus,
  Target,
  RotateCcw
} from "lucide-react";

// Dados mock removidos - agora usa dados reais do SQLite via useServices hook

// Mapeamento de ícones para compatibilidade
const iconMap: Record<string, any> = {
  'Droplets': Droplets,
  'Wrench': Wrench,
  'Search': Search,
  'Disc': Disc,
  'Snowflake': Snowflake,
  'Zap': Zap,
  'Target': Target,
  'RotateCcw': RotateCcw
};

export function Services() {
  const { addItem, openCart } = useCart();
  
  // Usar dados reais da API do SQLite
  const { services: apiServices, loading, error } = useServices({
    active: true
  });

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

  // Usar serviços da API (dados reais do SQLite)
  const servicesToShow = error ? [] : apiServices;
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
          {servicesToShow.map((service, index) => {
            const IconComponent = iconMap[service.icon] || Wrench;
            return (
              <Card key={service.id} className="bg-card-dark text-card-dark-foreground p-6 hover-lift border-moria-orange/20 hover:border-moria-orange/50 transition-all duration-300">
                <div className="flex items-center mb-4">
                  <div className="gold-metallic-bg p-3 rounded-full mr-4">
                    <IconComponent className="h-6 w-6 text-moria-black" />
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
            );
          })}
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