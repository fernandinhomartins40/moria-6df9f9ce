import { MapPin, Phone, Clock, Mail, Facebook, Instagram, Wrench, Settings } from "lucide-react";
import { Button } from "./ui/button";
import { Link } from "react-router-dom";

export function Footer() {
  return (
    <footer className="bg-moria-black text-white">
      {/* Main Footer Content */}
      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div>
            <img 
              src="/logo_moria.png" 
              alt="Moria Peças e Serviços" 
              className="h-16 mb-4"
            />
            <p className="text-gray-300 mb-6">
              Especialistas em peças automotivas e serviços de qualidade há mais de 15 anos. 
              Sua tranquilidade é nossa prioridade.
            </p>
            <div className="flex flex-col space-y-4">
              <div className="flex space-x-4">
                <Button variant="ghost" size="icon" className="hover:text-moria-orange">
                  <Facebook className="h-5 w-5" />
                </Button>
                <Button variant="ghost" size="icon" className="hover:text-moria-orange">
                  <Instagram className="h-5 w-5" />
                </Button>
              </div>
              
              <Link to="/store-panel">
                <Button variant="outline" size="sm" className="border-moria-orange text-moria-orange hover:bg-moria-orange hover:text-white">
                  <Settings className="h-4 w-4 mr-2" />
                  Painel do Lojista
                </Button>
              </Link>
            </div>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="text-lg font-bold mb-4 text-moria-orange">Contato</h4>
            <div className="space-y-3">
              <div className="flex items-start space-x-3">
                <MapPin className="h-5 w-5 text-moria-orange mt-1" />
                <div>
                  <p className="text-gray-300">Rua das Oficinas, 123</p>
                  <p className="text-gray-300">Centro - São Paulo/SP</p>
                  <p className="text-gray-300">CEP: 01234-567</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Phone className="h-5 w-5 text-moria-orange" />
                <p className="text-gray-300">(11) 99999-9999</p>
              </div>
              <div className="flex items-center space-x-3">
                <Mail className="h-5 w-5 text-moria-orange" />
                <p className="text-gray-300">contato@moriapecas.com.br</p>
              </div>
            </div>
          </div>

          {/* Business Hours */}
          <div>
            <h4 className="text-lg font-bold mb-4 text-moria-orange">Horário de Funcionamento</h4>
            <div className="space-y-2">
              <div className="flex items-center space-x-3">
                <Clock className="h-5 w-5 text-moria-orange" />
                <div>
                  <p className="text-gray-300">Segunda a Sexta:</p>
                  <p className="text-white font-semibold">8:00h às 18:00h</p>
                </div>
              </div>
              <div className="ml-8">
                <p className="text-gray-300">Sábado:</p>
                <p className="text-white font-semibold">8:00h às 12:00h</p>
              </div>
              <div className="ml-8">
                <p className="text-gray-300">Domingo:</p>
                <p className="text-gray-400">Fechado</p>
              </div>
            </div>
          </div>

          {/* Services */}
          <div>
            <h4 className="text-lg font-bold mb-4 text-moria-orange">Serviços</h4>
            <ul className="space-y-2">
              {[
                "Manutenção Preventiva",
                "Troca de Óleo",
                "Diagnóstico Eletrônico",
                "Freios e Suspensão",
                "Ar Condicionado",
                "Sistema Elétrico"
              ].map((service, index) => (
                <li key={index} className="flex items-center space-x-2">
                  <Wrench className="h-4 w-4 text-moria-orange" />
                  <span className="text-gray-300 text-sm">{service}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Certifications & Guarantees */}
        <div className="border-t border-gray-700 mt-12 pt-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div className="flex flex-col items-center">
              <div className="gold-metallic-bg p-4 rounded-full mb-3">
                <Wrench className="h-8 w-8 text-moria-black" />
              </div>
              <h5 className="font-bold text-white mb-2">Garantia de 6 Meses</h5>
              <p className="text-gray-400 text-sm">Em todos os serviços realizados</p>
            </div>
            <div className="flex flex-col items-center">
              <div className="bg-moria-orange p-4 rounded-full mb-3">
                <Clock className="h-8 w-8 text-white" />
              </div>
              <h5 className="font-bold text-white mb-2">Atendimento Rápido</h5>
              <p className="text-gray-400 text-sm">Diagnóstico em até 30 minutos</p>
            </div>
            <div className="flex flex-col items-center">
              <div className="gold-metallic-bg p-4 rounded-full mb-3">
                <MapPin className="h-8 w-8 text-moria-black" />
              </div>
              <h5 className="font-bold text-white mb-2">Entrega na Região</h5>
              <p className="text-gray-400 text-sm">Peças entregues em até 24h</p>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Footer */}
      <div className="border-t border-gray-700">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 text-sm mb-4 md:mb-0">
              © 2024 Moria Peças e Serviços. Todos os direitos reservados.
            </p>
            <div className="flex space-x-6 text-sm">
              <a href="#" className="text-gray-400 hover:text-moria-orange transition-colors">
                Política de Privacidade
              </a>
              <a href="#" className="text-gray-400 hover:text-moria-orange transition-colors">
                Termos de Uso
              </a>
              <a href="#" className="text-gray-400 hover:text-moria-orange transition-colors">
                Garantia
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}