import { Button } from "./ui/button";
import { Wrench, Shield, Clock, Star } from "lucide-react";
import heroImage from "@/assets/hero-garage.jpg";

export function Hero() {
  return (
    <section id="inicio" className="relative min-h-screen flex items-center">
      {/* Background Image with Overlay */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${heroImage})` }}
      >
        <div className="absolute inset-0 bg-moria-black/70"></div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-4xl">
          <h1 className="text-5xl md:text-7xl font-bold text-white mb-6">
            <span className="gold-metallic">MORIA</span>
            <br />
            <span className="text-white">Peças & Serviços</span>
          </h1>
          
          <p className="text-xl md:text-2xl text-gray-300 mb-8 max-w-2xl">
            Especialistas em peças automotivas e serviços de qualidade. 
            Mais de 15 anos cuidando do seu veículo com excelência.
          </p>

          {/* Features */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="flex items-center space-x-2 text-white">
              <Shield className="h-5 w-5 text-moria-orange" />
              <span className="text-sm">Qualidade Garantida</span>
            </div>
            <div className="flex items-center space-x-2 text-white">
              <Clock className="h-5 w-5 text-moria-orange" />
              <span className="text-sm">Entrega Rápida</span>
            </div>
            <div className="flex items-center space-x-2 text-white">
              <Wrench className="h-5 w-5 text-moria-orange" />
              <span className="text-sm">Serviços Especializados</span>
            </div>
            <div className="flex items-center space-x-2 text-white">
              <Star className="h-5 w-5 text-moria-orange" />
              <span className="text-sm">15+ Anos no Mercado</span>
            </div>
          </div>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row gap-4">
            <Button variant="hero" size="lg" className="text-lg">
              Ver Promoções
            </Button>
            <Button variant="premium" size="lg" className="text-lg">
              Solicitar Orçamento
            </Button>
            <Button variant="outline" size="lg" className="text-lg">
              Falar no WhatsApp
            </Button>
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 text-white animate-bounce">
        <div className="w-6 h-10 border-2 border-white rounded-full flex justify-center">
          <div className="w-1 h-3 bg-white rounded-full mt-2 animate-pulse"></div>
        </div>
      </div>
    </section>
  );
}