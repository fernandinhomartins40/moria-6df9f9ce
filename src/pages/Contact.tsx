import { useState } from "react";
import { Header } from "../components/Header";
import { Marquee } from "../components/Marquee";
import { Footer } from "../components/Footer";
import { CartProvider } from "../contexts/CartContext";
import { AuthProvider } from "../contexts/AuthContext";
import "../styles/public.css";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Textarea } from "../components/ui/textarea";
import { Label } from "../components/ui/label";
import { Badge } from "../components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { 
  MapPin, 
  Phone, 
  Mail, 
  Clock, 
  MessageCircle,
  Send,
  CheckCircle,
  Loader2
} from "lucide-react";
import { toast } from "sonner";

export default function Contact() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
    serviceType: ""
  });

  const contactInfo = [
    {
      icon: MapPin,
      title: "Endereço",
      content: ["Rua das Oficinas, 123", "Centro - São Paulo/SP", "CEP: 01234-567"],
      color: "text-blue-600"
    },
    {
      icon: Phone,
      title: "Telefone",
      content: ["(11) 99999-9999", "WhatsApp disponível"],
      color: "text-green-600"
    },
    {
      icon: Mail,
      title: "E-mail",
      content: ["contato@moriapecas.com.br", "Resposta em até 24h"],
      color: "text-red-600"
    },
    {
      icon: Clock,
      title: "Horário",
      content: ["Seg a Sex: 8h às 18h", "Sábado: 8h às 12h", "Domingo: Fechado"],
      color: "text-purple-600"
    }
  ];

  const serviceTypes = [
    "Manutenção Preventiva",
    "Diagnóstico de Problemas",
    "Troca de Peças",
    "Orçamento Geral",
    "Urgência/Emergência",
    "Outros"
  ];

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.email || !formData.message) {
      toast.error("Preencha todos os campos obrigatórios");
      return;
    }

    setIsSubmitting(true);

    try {
      // Simular envio
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Gerar mensagem WhatsApp
      const whatsappMessage = `
🔧 *CONTATO - MORIA PEÇAS E SERVIÇOS*

👤 *Nome:* ${formData.name}
📧 *E-mail:* ${formData.email}
📞 *Telefone:* ${formData.phone || 'Não informado'}
🔧 *Tipo de Serviço:* ${formData.serviceType || 'Não especificado'}
📋 *Assunto:* ${formData.subject || 'Não especificado'}

💬 *Mensagem:*
${formData.message}

---
Enviado através do site
${new Date().toLocaleString('pt-BR')}
      `.trim();

      // Abrir WhatsApp
      const whatsappUrl = `https://wa.me/5511999999999?text=${encodeURIComponent(whatsappMessage)}`;
      window.open(whatsappUrl, '_blank');

      toast.success("Mensagem enviada! Redirecionando para WhatsApp...");
      
      // Limpar formulário
      setFormData({
        name: "",
        email: "",
        phone: "",
        subject: "",
        message: "",
        serviceType: ""
      });

    } catch (error) {
      toast.error("Erro ao enviar mensagem. Tente novamente.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleWhatsAppDirect = () => {
    const message = "Olá! Gostaria de falar com a equipe da Moria Peças e Serviços.";
    const whatsappUrl = `https://wa.me/5511999999999?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  return (
    <AuthProvider>
      <CartProvider>
        <div className="min-h-screen bg-white">
          <Header />
          <Marquee />
          
          {/* Hero Section */}
          <section className="relative py-20 bg-gradient-to-br from-moria-black to-gray-900 text-white overflow-hidden">
            <div className="absolute inset-0 bg-[url('/api/placeholder/1920/600')] bg-cover bg-center opacity-20"></div>
            <div className="container mx-auto px-4 relative z-10">
              <div className="max-w-4xl mx-auto text-center">
                <Badge className="mb-6 bg-moria-orange text-white px-4 py-2 text-lg">
                  Fale Conosco
                </Badge>
                <h1 className="text-4xl md:text-6xl font-bold mb-6">
                  Entre em <span className="gold-metallic">Contato</span>
                </h1>
                <p className="text-xl md:text-2xl text-gray-300 max-w-3xl mx-auto">
                  Estamos prontos para ajudar com suas necessidades automotivas. 
                  Entre em contato e receba atendimento personalizado.
                </p>
              </div>
            </div>
          </section>

          {/* Contact Info Cards */}
          <section className="py-16 bg-gray-50">
            <div className="container mx-auto px-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {contactInfo.map((info, index) => {
                  const IconComponent = info.icon;
                  return (
                    <Card key={index} className="text-center hover:shadow-lg transition-shadow">
                      <CardContent className="p-6">
                        <div className="bg-gray-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                          <IconComponent className={`h-8 w-8 ${info.color}`} />
                        </div>
                        <h3 className="font-bold text-lg mb-3 text-moria-black">
                          {info.title}
                        </h3>
                        <div className="space-y-1">
                          {info.content.map((line, i) => (
                            <p key={i} className="text-gray-600 text-sm">
                              {line}
                            </p>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
          </section>

          {/* Contact Form & Map */}
          <section className="py-20 bg-white">
            <div className="container mx-auto px-4">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                {/* Contact Form */}
                <div>
                  <div className="mb-8">
                    <h2 className="text-3xl md:text-4xl font-bold mb-4">
                      Envie sua <span className="gold-metallic">Mensagem</span>
                    </h2>
                    <p className="text-gray-600 text-lg">
                      Preencha o formulário abaixo e entraremos em contato o mais breve possível.
                    </p>
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="name">Nome Completo *</Label>
                        <Input
                          id="name"
                          placeholder="Seu nome completo"
                          value={formData.name}
                          onChange={(e) => handleInputChange('name', e.target.value)}
                          disabled={isSubmitting}
                          required
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label htmlFor="email">E-mail *</Label>
                        <Input
                          id="email"
                          type="email"
                          placeholder="seu@email.com"
                          value={formData.email}
                          onChange={(e) => handleInputChange('email', e.target.value)}
                          disabled={isSubmitting}
                          required
                          className="mt-1"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="phone">Telefone/WhatsApp</Label>
                        <Input
                          id="phone"
                          placeholder="(11) 99999-9999"
                          value={formData.phone}
                          onChange={(e) => handleInputChange('phone', e.target.value)}
                          disabled={isSubmitting}
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label htmlFor="serviceType">Tipo de Serviço</Label>
                        <Select 
                          value={formData.serviceType} 
                          onValueChange={(value) => handleInputChange('serviceType', value)}
                          disabled={isSubmitting}
                        >
                          <SelectTrigger className="mt-1">
                            <SelectValue placeholder="Selecione o tipo de serviço" />
                          </SelectTrigger>
                          <SelectContent>
                            {serviceTypes.map((type) => (
                              <SelectItem key={type} value={type}>
                                {type}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="subject">Assunto</Label>
                      <Input
                        id="subject"
                        placeholder="Sobre o que gostaria de falar?"
                        value={formData.subject}
                        onChange={(e) => handleInputChange('subject', e.target.value)}
                        disabled={isSubmitting}
                        className="mt-1"
                      />
                    </div>

                    <div>
                      <Label htmlFor="message">Mensagem *</Label>
                      <Textarea
                        id="message"
                        placeholder="Descreva sua necessidade ou dúvida..."
                        rows={5}
                        value={formData.message}
                        onChange={(e) => handleInputChange('message', e.target.value)}
                        disabled={isSubmitting}
                        required
                        className="mt-1"
                      />
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4">
                      <Button 
                        type="submit" 
                        className="flex-1 bg-moria-orange hover:bg-moria-orange/90"
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? (
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                          <Send className="mr-2 h-4 w-4" />
                        )}
                        {isSubmitting ? 'Enviando...' : 'Enviar Mensagem'}
                      </Button>
                      
                      <Button 
                        type="button"
                        variant="outline"
                        onClick={handleWhatsAppDirect}
                        className="flex-1 border-green-500 text-green-600 hover:bg-green-50"
                        disabled={isSubmitting}
                      >
                        <MessageCircle className="mr-2 h-4 w-4" />
                        WhatsApp Direto
                      </Button>
                    </div>
                  </form>
                </div>

                {/* Map & Additional Info */}
                <div>
                  <div className="mb-8">
                    <h2 className="text-3xl md:text-4xl font-bold mb-4">
                      Nossa <span className="gold-metallic">Localização</span>
                    </h2>
                    <p className="text-gray-600 text-lg">
                      Visite nossa oficina para um atendimento presencial personalizado.
                    </p>
                  </div>

                  {/* Placeholder Map */}
                  <div className="bg-gray-200 rounded-lg h-64 mb-6 flex items-center justify-center">
                    <div className="text-center text-gray-500">
                      <MapPin className="h-12 w-12 mx-auto mb-2" />
                      <p>Mapa da Localização</p>
                      <p className="text-sm">Rua das Oficinas, 123 - Centro/SP</p>
                    </div>
                  </div>

                  {/* Quick Info Cards */}
                  <div className="space-y-4">
                    <Card className="border-l-4 border-l-moria-orange">
                      <CardContent className="p-4">
                        <div className="flex items-center space-x-3">
                          <CheckCircle className="h-5 w-5 text-green-500" />
                          <div>
                            <h4 className="font-semibold">Atendimento Rápido</h4>
                            <p className="text-gray-600 text-sm">Diagnóstico inicial em até 30 minutos</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="border-l-4 border-l-green-500">
                      <CardContent className="p-4">
                        <div className="flex items-center space-x-3">
                          <MessageCircle className="h-5 w-5 text-green-500" />
                          <div>
                            <h4 className="font-semibold">WhatsApp 24h</h4>
                            <p className="text-gray-600 text-sm">Suporte via WhatsApp todos os dias</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="border-l-4 border-l-blue-500">
                      <CardContent className="p-4">
                        <div className="flex items-center space-x-3">
                          <Clock className="h-5 w-5 text-blue-500" />
                          <div>
                            <h4 className="font-semibold">Horário Flexível</h4>
                            <p className="text-gray-600 text-sm">Agendamento conforme sua disponibilidade</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* CTA Section */}
          <section className="py-16 bg-gradient-to-r from-moria-orange to-gold-accent text-white">
            <div className="container mx-auto px-4 text-center">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Precisa de Ajuda Imediata?
              </h2>
              <p className="text-xl mb-8 opacity-90">
                Entre em contato via WhatsApp para atendimento prioritário
              </p>
              <Button 
                variant="outline" 
                size="lg" 
                onClick={handleWhatsAppDirect}
                className="bg-white text-moria-orange hover:bg-gray-100 border-0 text-lg px-8 py-3"
              >
                <MessageCircle className="mr-2 h-5 w-5" />
                Falar Agora no WhatsApp
              </Button>
            </div>
          </section>

          <Footer />
        </div>
      </CartProvider>
    </AuthProvider>
  );
}