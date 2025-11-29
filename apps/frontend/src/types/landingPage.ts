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

export interface HeroButton {
  id: string;
  text: string;
  href: string;
  variant: 'hero' | 'premium' | 'outline';
  enabled: boolean;
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
}

// ============================================================================
// 4. SERVICES SECTION CONFIG
// ============================================================================

export interface TrustIndicator {
  id: string;
  icon: string; // nome do ícone Lucide
  iconBackground: 'gold' | 'orange'; // gold-metallic-bg ou bg-moria-orange
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
  iconBackground: 'gold' | 'orange';
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
  contact: any; // Placeholder (não usado por enquanto)
  footer: FooterConfig;
}

// ============================================================================
// TIPOS PARA O EDITOR
// ============================================================================

export type SectionKey = 'header' | 'hero' | 'marquee' | 'about' | 'products' | 'services' | 'footer';

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
