import { Header } from "../components/Header";
import { Marquee } from "../components/Marquee";
import { Footer } from "../components/Footer";
import { CartProvider } from "../contexts/CartContext";
import { AuthProvider } from "../contexts/AuthContext";
import "../styles/public.css";
import { Badge } from "../components/ui/badge";
import { Card, CardContent } from "../components/ui/card";
import { 
  Wrench, 
  Shield, 
  Clock, 
  Users, 
  Award, 
  CheckCircle, 
  Star,
  Target,
  Heart
} from "lucide-react";

export default function About() {
  const milestones = [
    { year: "2009", title: "Fundação", description: "Início da Moria Peças e Serviços" },
    { year: "2012", title: "Expansão", description: "Ampliação do estoque e serviços" },
    { year: "2015", title: "Modernização", description: "Investimento em equipamentos de diagnóstico" },
    { year: "2018", title: "Certificação", description: "Certificação ISO 9001" },
    { year: "2021", title: "Digital", description: "Lançamento da plataforma online" },
    { year: "2024", title: "Presente", description: "Mais de 15 anos servindo com excelência" }
  ];

  const values = [
    {
      icon: Shield,
      title: "Qualidade",
      description: "Compromisso com peças originais e serviços de alta qualidade",
      color: "text-blue-600"
    },
    {
      icon: Heart,
      title: "Confiança",
      description: "Relacionamento baseado na transparência e honestidade",
      color: "text-red-600"
    },
    {
      icon: Target,
      title: "Excelência",
      description: "Busca constante pela melhoria contínua dos nossos serviços",
      color: "text-green-600"
    },
    {
      icon: Users,
      title: "Relacionamento",
      description: "Foco no atendimento personalizado e duradouro",
      color: "text-purple-600"
    }
  ];

  const stats = [
    { number: "15+", label: "Anos de Experiência" },
    { number: "10k+", label: "Peças em Estoque" },
    { number: "5k+", label: "Clientes Satisfeitos" },
    { number: "50k+", label: "Serviços Realizados" }
  ];

  const services = [
    "Manutenção Preventiva e Corretiva",
    "Diagnóstico Eletrônico Completo",
    "Troca de Óleo e Filtros",
    "Sistema de Freios e ABS",
    "Suspensão e Amortecedores",
    "Sistema Elétrico e Eletrônico",
    "Ar Condicionado Automotivo",
    "Injeção Eletrônica",
    "Sistema de Ignição",
    "Alinhamento e Balanceamento"
  ];

  return (
    <AuthProvider>
      <CartProvider>
        <div className="min-h-screen bg-white">
          <Header />
          <Marquee />
          
          {/* Hero Section */}
          <section className="relative py-20 bg-gradient-to-br from-moria-black to-gray-900 text-white overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-moria-orange/10 to-transparent"></div>
            <div className="container mx-auto px-4 relative z-10">
              <div className="max-w-4xl mx-auto text-center">
                <Badge className="mb-6 bg-moria-orange text-white px-4 py-2 text-lg">
                  Sobre Nós
                </Badge>
                <h1 className="text-4xl md:text-6xl font-bold mb-6">
                  Mais de <span className="gold-metallic">15 Anos</span>
                  <br />
                  Cuidando do Seu Veículo
                </h1>
                <p className="text-xl md:text-2xl text-gray-300 max-w-3xl mx-auto">
                  Especialistas em peças automotivas e serviços de qualidade. 
                  Nossa missão é garantir que seu veículo esteja sempre em perfeitas condições.
                </p>
              </div>
            </div>
          </section>

          {/* Stats Section */}
          <section className="py-16 bg-gray-50">
            <div className="container mx-auto px-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
                {stats.map((stat, index) => (
                  <div key={index} className="bg-white p-6 rounded-lg shadow-md">
                    <div className="text-3xl md:text-4xl font-bold text-moria-orange mb-2">
                      {stat.number}
                    </div>
                    <div className="text-gray-600 font-medium">
                      {stat.label}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Nossa História */}
          <section className="py-20 bg-white">
            <div className="container mx-auto px-4">
              <div className="text-center mb-16">
                <h2 className="text-4xl md:text-5xl font-bold mb-4">
                  Nossa <span className="gold-metallic">História</span>
                </h2>
                <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                  Uma jornada de dedicação, crescimento e compromisso com a excelência no setor automotivo.
                </p>
              </div>

              <div className="max-w-4xl mx-auto">
                <div className="relative">
                  {/* Timeline Line */}
                  <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-moria-orange hidden md:block"></div>
                  
                  <div className="space-y-12">
                    {milestones.map((milestone, index) => (
                      <div key={index} className="relative flex items-center">
                        {/* Timeline Dot */}
                        <div className="hidden md:flex w-16 h-16 bg-moria-orange rounded-full items-center justify-center text-white font-bold text-lg mr-8 shadow-lg">
                          <Clock className="h-6 w-6" />
                        </div>
                        
                        <Card className="flex-1">
                          <CardContent className="p-6">
                            <div className="flex flex-col md:flex-row md:items-center gap-4">
                              <Badge className="bg-gold-accent text-moria-black w-fit font-bold text-lg px-4 py-2">
                                {milestone.year}
                              </Badge>
                              <div>
                                <h3 className="text-xl font-bold text-moria-black mb-2">
                                  {milestone.title}
                                </h3>
                                <p className="text-gray-600">
                                  {milestone.description}
                                </p>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Nossos Valores */}
          <section className="py-20 bg-gray-900 text-white">
            <div className="container mx-auto px-4">
              <div className="text-center mb-16">
                <h2 className="text-4xl md:text-5xl font-bold mb-4">
                  Nossos <span className="gold-metallic">Valores</span>
                </h2>
                <p className="text-xl text-gray-300 max-w-3xl mx-auto">
                  Os princípios que guiam nossa empresa e nosso compromisso com cada cliente.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                {values.map((value, index) => {
                  const IconComponent = value.icon;
                  return (
                    <Card key={index} className="bg-white/10 border-white/20 text-white hover:bg-white/20 transition-all">
                      <CardContent className="p-6 text-center">
                        <div className="bg-white/10 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                          <IconComponent className={`h-8 w-8 ${value.color}`} />
                        </div>
                        <h3 className="text-xl font-bold mb-3">
                          {value.title}
                        </h3>
                        <p className="text-gray-300 text-sm">
                          {value.description}
                        </p>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
          </section>

          {/* Nossos Serviços */}
          <section className="py-20 bg-white">
            <div className="container mx-auto px-4">
              <div className="text-center mb-16">
                <h2 className="text-4xl md:text-5xl font-bold mb-4">
                  Nossos <span className="gold-metallic">Serviços</span>
                </h2>
                <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                  Oferecemos uma ampla gama de serviços especializados para manter seu veículo em perfeitas condições.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {services.map((service, index) => (
                  <div key={index} className="flex items-center p-4 bg-gray-50 rounded-lg hover:bg-moria-orange/10 transition-colors">
                    <CheckCircle className="h-5 w-5 text-moria-orange mr-3 flex-shrink-0" />
                    <span className="text-gray-700 font-medium">{service}</span>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Compromisso */}
          <section className="py-20 bg-gradient-to-r from-moria-orange to-gold-accent text-white">
            <div className="container mx-auto px-4">
              <div className="max-w-4xl mx-auto text-center">
                <Award className="h-16 w-16 mx-auto mb-6 text-white" />
                <h2 className="text-4xl md:text-5xl font-bold mb-6">
                  Nosso Compromisso
                </h2>
                <p className="text-xl md:text-2xl mb-8 leading-relaxed">
                  "Garantir que cada cliente tenha a melhor experiência possível, 
                  com serviços de qualidade superior, atendimento personalizado e 
                  preços justos. Sua satisfação é nossa maior conquista."
                </p>
                <div className="flex justify-center">
                  <div className="flex items-center space-x-2">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="h-6 w-6 text-yellow-300 fill-yellow-300" />
                    ))}
                    <span className="ml-4 text-lg font-semibold">15+ Anos de Excelência</span>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <Footer />
        </div>
      </CartProvider>
    </AuthProvider>
  );
}