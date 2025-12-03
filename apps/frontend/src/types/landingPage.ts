/**
 * Sistema de Tipos para Landing Page da Moria
 * Baseado no padrão Ferraco, adaptado para Moria Peças & Serviços
 */

// ============================================================================
// TIPOS AUXILIARES
// ============================================================================

export interface ImageConfig {
  url: string;
  alt: string;
  objectFit?: 'cover' | 'contain' | 'fill' | 'none' | 'scale-down';
  width?: number;  // Largura recomendada em pixels
  height?: number; // Altura recomendada em pixels
  aspectRatio?: number | null; // Proporção (ex: 16/9, 1, null=livre)
}

export interface StyleConfig {
  backgroundColor?: string;
  textColor?: string;
  overlayOpacity?: number;
}

export interface GradientConfig {
  type: 'linear' | 'radial';
  angle?: number; // Para gradientes lineares (ex: 45, 90, 180)
  direction?: string; // Para gradientes com direção (ex: 'to-br', 'to-r')
  colors: string[]; // Array de cores hex
}

// ============================================================================
// 1. HEADER CONFIG
// ============================================================================

export interface HeaderMenuItem {
  id: string;
  label: string;
  href: string;
  isLink: boolean; // true para <Link>, false para <a>
}

export interface HeaderConfig {
  enabled: boolean;
  logo: ImageConfig;
  menuItems: HeaderMenuItem[];
  backgroundColor: string;
  textColor: string;
  hoverColor: string;
  backgroundGradient?: GradientConfig; // Gradiente opcional para o header
}

// ============================================================================
// 2. MARQUEE CONFIG
// ============================================================================

export interface MarqueeItem {
  id: string;
  icon: string; // emoji ou ícone
  text: string;
}

export interface MarqueeConfig {
  enabled: boolean;
  items: MarqueeItem[];
  speed: number; // velocidade em segundos
  backgroundColor: string;
  textColor: string;
}

// ============================================================================
// 3. HERO CONFIG
// ============================================================================

export interface HeroFeature {
  id: string;
  icon: string; // nome do ícone Lucide (Shield, Clock, Wrench, Star)
  text: string;
}

export interface ColorOrGradientValue {
  type: 'solid' | 'gradient';
  solid?: string;
  gradient?: GradientConfig;
}

export interface HeroButton {
  id: string;
  text: string;
  href: string;
  variant: 'hero' | 'premium' | 'outline';
  enabled: boolean;
  // Personalização de cores (opcional)
  background?: ColorOrGradientValue;
  textColor?: string;
}

export interface HeroConfig {
  enabled: boolean;
  title: string; // "MORIA"
  subtitle: string; // "Peças & Serviços"
  description: string;
  features: HeroFeature[]; // 4 features
  buttons: HeroButton[]; // 3 botões
  backgroundImage: ImageConfig;
  overlayOpacity: number; // 0-100
  // Gradientes
  titleGradient?: GradientConfig; // Gradiente do título (gold-metallic)
  overlayGradient?: GradientConfig; // Gradiente de overlay (orange overlay)
}

// ============================================================================
// 4. SERVICES SECTION CONFIG
// ============================================================================

export interface TrustIndicator {
  id: string;
  icon: string; // nome do ícone Lucide
  iconBackground: string; // Cor de fundo do ícone (hex, rgb, etc)
  title: string;
  description: string;
}

export interface ServicesSectionConfig {
  enabled: boolean;
  title: string; // "Nossos Serviços"
  subtitle: string;
  trustIndicators: TrustIndicator[]; // 4 indicadores
}

// ============================================================================
// 5. PRODUCTS SECTION CONFIG
// ============================================================================

export interface ProductsSectionConfig {
  enabled: boolean;
  title: string; // "Peças Originais"
  subtitle: string;
}

// ============================================================================
// 6. PROMOTIONS SECTION CONFIG
// ============================================================================

export interface PromotionsSectionConfig {
  enabled: boolean;
  title: string;
  subtitle: string;
}

// ============================================================================
// 7. CONTACT PAGE CONFIG
// ============================================================================

export interface ContactInfoCard {
  id: string;
  icon: string; // nome do ícone Lucide (MapPin, Phone, Mail, Clock)
  title: string;
  content: string[]; // Array de linhas de texto
  color: string; // Ex: "text-blue-600"
}

export interface ContactServiceType {
  id: string;
  name: string;
}

export interface ContactConfig {
  enabled: boolean;
  // Hero Section
  heroTitle: string; // "Entre em Contato"
  heroSubtitle: string;
  heroBadge: string; // "Fale Conosco"
  // Contact Info Cards
  contactInfoCards: ContactInfoCard[];
  // Form Section
  formTitle: string; // "Envie sua Mensagem"
  formSubtitle: string;
  serviceTypes: ContactServiceType[];
  // Map Section
  mapTitle: string; // "Nossa Localização"
  mapSubtitle: string;
  // Quick Info Cards (below map)
  quickInfoEnabled: boolean;
  // CTA Section
  ctaTitle: string;
  ctaSubtitle: string;
}

// ============================================================================
// 8. ABOUT PAGE CONFIG
// ============================================================================

export interface AboutMilestone {
  id: string;
  year: string;
  title: string;
  description: string;
}

export interface AboutValue {
  id: string;
  icon: string; // nome do ícone Lucide
  title: string;
  description: string;
  color: string; // Ex: "text-blue-600"
}

export interface AboutStat {
  id: string;
  number: string; // "15+"
  label: string; // "Anos de Experiência"
}

export interface AboutService {
  id: string;
  name: string;
}

export interface AboutConfig {
  enabled: boolean;
  // Hero Section
  heroTitle: string; // "Mais de 15 Anos"
  heroHighlight: string; // "Cuidando do Seu Veículo" (parte em dourado)
  heroSubtitle: string;
  heroBadge: string; // "Sobre Nós"
  // Stats
  stats: AboutStat[];
  // História
  historyTitle: string; // "Nossa História"
  historySubtitle: string;
  milestones: AboutMilestone[];
  // Valores
  valuesTitle: string; // "Nossos Valores"
  valuesSubtitle: string;
  values: AboutValue[];
  // Serviços
  servicesTitle: string; // "Nossos Serviços"
  servicesSubtitle: string;
  services: AboutService[];
  // Compromisso
  commitmentTitle: string; // "Nosso Compromisso"
  commitmentText: string;
  commitmentYears: string; // "15+ Anos de Excelência"
}

// ============================================================================
// 7. FOOTER CONFIG
// ============================================================================

export interface FooterContactInfo {
  address: {
    street: string;
    city: string;
    zipCode: string;
  };
  phone: string;
  email: string;
}

export interface FooterBusinessHours {
  weekdays: string; // "Segunda a Sexta:\n8:00h às 18:00h"
  saturday: string; // "Sábado:\n8:00h às 12:00h"
  sunday: string; // "Domingo:\nFechado"
}

export interface FooterService {
  id: string;
  name: string;
}

export interface FooterSocialLink {
  id: string;
  platform: 'facebook' | 'instagram';
  url: string;
  enabled: boolean;
}

export interface FooterCertification {
  id: string;
  icon: string; // nome do ícone Lucide
  iconBackground: string; // Cor de fundo do ícone (hex, rgb, etc)
  title: string;
  description: string;
}

export interface FooterBottomLink {
  id: string;
  text: string;
  href: string;
}

export interface FooterConfig {
  enabled: boolean;
  logo: ImageConfig;
  description: string;
  contactInfo: FooterContactInfo;
  businessHours: FooterBusinessHours;
  services: FooterService[]; // lista de serviços
  socialLinks: FooterSocialLink[];
  certifications: FooterCertification[]; // 3 certificações
  copyright: string;
  bottomLinks: FooterBottomLink[]; // Política, Termos, Garantia
}

// ============================================================================
// CONFIGURAÇÃO PRINCIPAL
// ============================================================================

export interface LandingPageConfig {
  version: string;
  lastModified: string;
  header: HeaderConfig;
  hero: HeroConfig;
  marquee: MarqueeConfig;
  about: ServicesSectionConfig; // Seção "Nossos Serviços"
  products: ProductsSectionConfig; // Seção "Peças Originais"
  services: PromotionsSectionConfig; // Seção "Promoções" (mantém nome 'services' do schema)
  contactPage: ContactConfig; // Página de Contato
  aboutPage: AboutConfig; // Página Sobre Nós
  contact: any; // Placeholder (não usado por enquanto)
  footer: FooterConfig;
}

// ============================================================================
// TIPOS PARA O EDITOR
// ============================================================================

export type SectionKey = 'header' | 'hero' | 'marquee' | 'about' | 'products' | 'services' | 'contactPage' | 'aboutPage' | 'footer';

export interface EditorState {
  config: LandingPageConfig;
  currentSection: SectionKey;
  isDirty: boolean;
  isSaving: boolean;
  previewMode: 'desktop' | 'tablet' | 'mobile';
  showPreview: boolean;
}

export interface EditorAction {
  type: 'UPDATE_SECTION' | 'RESET_CONFIG' | 'LOAD_CONFIG' | 'SET_SECTION' | 'SET_PREVIEW_MODE' | 'TOGGLE_PREVIEW';
  payload?: any;
}
