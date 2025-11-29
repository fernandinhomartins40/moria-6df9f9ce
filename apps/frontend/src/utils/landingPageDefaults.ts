/**
 * Valores padrão da Landing Page da Moria
 * Baseado no design atual, mantendo 100% a identidade visual
 */

import { LandingPageConfig } from '@/types/landingPage';

export const getDefaultConfig = (): LandingPageConfig => ({
  version: '1.0.0',
  lastModified: new Date().toISOString(),

  // ============================================================================
  // HEADER
  // ============================================================================
  header: {
    enabled: true,
    logo: {
      url: '/logo_moria.png',
      alt: 'Moria Peças e Serviços',
    },
    menuItems: [
      { id: '1', label: 'Início', href: '#inicio', isLink: false },
      { id: '2', label: 'Serviços', href: '#servicos', isLink: false },
      { id: '3', label: 'Peças', href: '#pecas', isLink: false },
      { id: '4', label: 'Promoções', href: '#promocoes', isLink: false },
      { id: '5', label: 'Sobre', href: '/about', isLink: true },
      { id: '6', label: 'Contato', href: '/contact', isLink: true },
    ],
    backgroundColor: '#000000', // moria-black
    textColor: '#ffffff',
    hoverColor: '#ff6b35', // moria-orange
  },

  // ============================================================================
  // HERO
  // ============================================================================
  hero: {
    enabled: true,
    title: 'MORIA',
    subtitle: 'Peças & Serviços',
    description:
      'Especialistas em peças automotivas e serviços de qualidade. Mais de 15 anos cuidando do seu veículo com excelência.',
    features: [
      { id: '1', icon: 'Shield', text: 'Qualidade Garantida' },
      { id: '2', icon: 'Clock', text: 'Entrega Rápida' },
      { id: '3', icon: 'Wrench', text: 'Serviços Especializados' },
      { id: '4', icon: 'Star', text: '15+ Anos no Mercado' },
    ],
    buttons: [
      {
        id: '1',
        text: 'Ver Promoções',
        href: '#promocoes',
        variant: 'hero',
        enabled: true,
      },
      {
        id: '2',
        text: 'Solicitar Orçamento',
        href: '#servicos',
        variant: 'premium',
        enabled: true,
      },
      {
        id: '3',
        text: 'Falar no WhatsApp',
        href: 'https://wa.me/5511999999999',
        variant: 'outline',
        enabled: true,
      },
    ],
    backgroundImage: {
      url: '/assets/hero-garage.jpg',
      alt: 'Oficina Moria',
    },
    overlayOpacity: 70, // 70% de opacidade preta
  },

  // ============================================================================
  // MARQUEE
  // ============================================================================
  marquee: {
    enabled: true,
    items: [
      { id: '1', icon: '🔧', text: 'PEÇAS ORIGINAIS COM ATÉ 30% DE DESCONTO' },
      { id: '2', icon: '⚡', text: 'SERVIÇOS ESPECIALIZADOS - ORÇAMENTO GRÁTIS' },
      { id: '3', icon: '🚗', text: 'ENTREGA RÁPIDA EM TODA A CIDADE' },
      { id: '4', icon: '🛠️', text: 'QUALIDADE GARANTIDA - ESPECIALISTAS HÁ MAIS DE 15 ANOS' },
      { id: '5', icon: '💰', text: 'PROMOÇÕES IMPERDÍVEIS - CONFIRA NOSSAS OFERTAS' },
    ],
    speed: 30, // 30 segundos para completar o loop
    backgroundColor: 'linear-gradient(90deg, #667eea 0%, #764ba2 100%)', // gradient-marquee
    textColor: '#ffffff',
  },

  // ============================================================================
  // ABOUT (Seção "Nossos Serviços")
  // ============================================================================
  about: {
    enabled: true,
    title: 'Nossos Serviços',
    subtitle:
      'Oferecemos uma gama completa de serviços automotivos com qualidade profissional e preços justos. Sua tranquilidade é nossa prioridade.',
    trustIndicators: [
      {
        id: '1',
        icon: 'Shield',
        iconBackground: 'gold',
        title: 'Garantia',
        description: '6 meses em todos os serviços',
      },
      {
        id: '2',
        icon: 'Clock',
        iconBackground: 'gold',
        title: 'Agilidade',
        description: 'Atendimento rápido e eficiente',
      },
      {
        id: '3',
        icon: 'Wrench',
        iconBackground: 'orange',
        title: 'Expertise',
        description: '15+ anos de experiência',
      },
      {
        id: '4',
        icon: 'Zap',
        iconBackground: 'orange',
        title: 'Tecnologia',
        description: 'Equipamentos modernos',
      },
    ],
  },

  // ============================================================================
  // PRODUCTS (Seção "Peças Originais")
  // ============================================================================
  products: {
    enabled: true,
    title: 'Peças Originais',
    subtitle: 'Temos as melhores peças para o seu veículo com preços competitivos e qualidade garantida.',
  },

  // ============================================================================
  // SERVICES (Seção "Promoções" - nome mantido do schema)
  // ============================================================================
  services: {
    enabled: true,
    title: 'Promoções Especiais',
    subtitle: 'Aproveite nossas ofertas exclusivas em peças e serviços. Economize mantendo seu veículo em dia!',
  },

  // ============================================================================
  // CONTACT (placeholder - não usado)
  // ============================================================================
  contact: {},

  // ============================================================================
  // FOOTER
  // ============================================================================
  footer: {
    enabled: true,
    logo: {
      url: '/logo_moria.png',
      alt: 'Moria Peças e Serviços',
    },
    description:
      'Especialistas em peças automotivas e serviços de qualidade há mais de 15 anos. Sua tranquilidade é nossa prioridade.',
    contactInfo: {
      address: {
        street: 'Rua das Oficinas, 123',
        city: 'Centro - São Paulo/SP',
        zipCode: 'CEP: 01234-567',
      },
      phone: '(11) 99999-9999',
      email: 'contato@moriapecas.com.br',
    },
    businessHours: {
      weekdays: 'Segunda a Sexta:\n8:00h às 18:00h',
      saturday: 'Sábado:\n8:00h às 12:00h',
      sunday: 'Domingo:\nFechado',
    },
    services: [
      { id: '1', name: 'Manutenção Preventiva' },
      { id: '2', name: 'Troca de Óleo' },
      { id: '3', name: 'Diagnóstico Eletrônico' },
      { id: '4', name: 'Freios e Suspensão' },
      { id: '5', name: 'Ar Condicionado' },
      { id: '6', name: 'Sistema Elétrico' },
    ],
    socialLinks: [
      { id: '1', platform: 'facebook', url: 'https://facebook.com/moriapecas', enabled: true },
      { id: '2', platform: 'instagram', url: 'https://instagram.com/moriapecas', enabled: true },
    ],
    certifications: [
      {
        id: '1',
        icon: 'Wrench',
        iconBackground: 'gold',
        title: 'Garantia de 6 Meses',
        description: 'Em todos os serviços realizados',
      },
      {
        id: '2',
        icon: 'Clock',
        iconBackground: 'orange',
        title: 'Atendimento Rápido',
        description: 'Diagnóstico em até 30 minutos',
      },
      {
        id: '3',
        icon: 'MapPin',
        iconBackground: 'gold',
        title: 'Entrega na Região',
        description: 'Peças entregues em até 24h',
      },
    ],
    copyright: '© 2024 Moria Peças e Serviços. Todos os direitos reservados.',
    bottomLinks: [
      { id: '1', text: 'Política de Privacidade', href: '#' },
      { id: '2', text: 'Termos de Uso', href: '#' },
      { id: '3', text: 'Garantia', href: '#' },
    ],
  },
});
