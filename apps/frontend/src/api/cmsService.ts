import apiClient from './apiClient';

// ============================================================================
// TYPES
// ============================================================================

export interface HeroFeature {
  icon: string;
  text: string;
}

export interface HeroSection {
  id: string;
  title: string;
  subtitle: string;
  imageUrl: string;
  features: HeroFeature[];
  cta1Text: string;
  cta1Link: string;
  cta1Enabled: boolean;
  cta2Text: string;
  cta2Link: string;
  cta2Enabled: boolean;
  cta3Text: string;
  cta3Link: string;
  cta3Enabled: boolean;
  active: boolean;
  updatedAt: string;
}

export interface MarqueeMessage {
  id: string;
  message: string;
  order: number;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface FooterContent {
  id: string;
  description: string;
  services: string[];
  socialLinks: Record<string, string>;
  certifications: string[];
  footerLinks: Record<string, string>;
  updatedAt: string;
}

export interface UpdateHeroData {
  title?: string;
  subtitle?: string;
  imageUrl?: string;
  features?: HeroFeature[];
  cta1Text?: string;
  cta1Link?: string;
  cta1Enabled?: boolean;
  cta2Text?: string;
  cta2Link?: string;
  cta2Enabled?: boolean;
  cta3Text?: string;
  cta3Link?: string;
  cta3Enabled?: boolean;
  active?: boolean;
}

export interface CreateMarqueeMessageData {
  message: string;
  order?: number;
  active?: boolean;
}

export interface UpdateMarqueeMessageData {
  message?: string;
  order?: number;
  active?: boolean;
}

export interface UpdateFooterData {
  description?: string;
  services?: string[];
  socialLinks?: Record<string, string>;
  certifications?: string[];
  footerLinks?: Record<string, string>;
}

// ============================================================================
// SERVICE CLASS
// ============================================================================

class CmsService {
  // ==========================================================================
  // HERO SECTION
  // ==========================================================================

  /**
   * Busca o conteúdo do Hero
   */
  async getHero(): Promise<HeroSection> {
    const response = await apiClient.get<{ success: boolean; data: HeroSection }>('/cms/hero');
    return response.data.data;
  }

  /**
   * Atualiza o conteúdo do Hero
   */
  async updateHero(data: UpdateHeroData): Promise<HeroSection> {
    const response = await apiClient.put<{ success: boolean; data: HeroSection }>('/cms/hero', data);
    return response.data.data;
  }

  /**
   * Reseta o Hero para valores padrão
   */
  async resetHero(): Promise<HeroSection> {
    const response = await apiClient.post<{ success: boolean; data: HeroSection }>('/cms/hero/reset');
    return response.data.data;
  }

  // ==========================================================================
  // MARQUEE MESSAGES
  // ==========================================================================

  /**
   * Busca todas as mensagens do marquee
   */
  async getMarqueeMessages(activeOnly: boolean = false): Promise<MarqueeMessage[]> {
    const response = await apiClient.get<{ success: boolean; data: MarqueeMessage[] }>(
      '/cms/marquee',
      { params: { activeOnly } }
    );
    return response.data.data;
  }

  /**
   * Busca uma mensagem específica
   */
  async getMarqueeMessageById(id: string): Promise<MarqueeMessage> {
    const response = await apiClient.get<{ success: boolean; data: MarqueeMessage }>(
      `/cms/marquee/${id}`
    );
    return response.data.data;
  }

  /**
   * Cria uma nova mensagem do marquee
   */
  async createMarqueeMessage(data: CreateMarqueeMessageData): Promise<MarqueeMessage> {
    const response = await apiClient.post<{ success: boolean; data: MarqueeMessage }>(
      '/cms/marquee',
      data
    );
    return response.data.data;
  }

  /**
   * Atualiza uma mensagem do marquee
   */
  async updateMarqueeMessage(id: string, data: UpdateMarqueeMessageData): Promise<MarqueeMessage> {
    const response = await apiClient.put<{ success: boolean; data: MarqueeMessage }>(
      `/cms/marquee/${id}`,
      data
    );
    return response.data.data;
  }

  /**
   * Deleta uma mensagem do marquee
   */
  async deleteMarqueeMessage(id: string): Promise<void> {
    await apiClient.delete(`/cms/marquee/${id}`);
  }

  /**
   * Reordena as mensagens do marquee
   */
  async reorderMarqueeMessages(ids: string[]): Promise<void> {
    await apiClient.post('/cms/marquee/reorder', { ids });
  }

  // ==========================================================================
  // FOOTER CONTENT
  // ==========================================================================

  /**
   * Busca o conteúdo do Footer
   */
  async getFooter(): Promise<FooterContent> {
    const response = await apiClient.get<{ success: boolean; data: FooterContent }>('/cms/footer');
    return response.data.data;
  }

  /**
   * Atualiza o conteúdo do Footer
   */
  async updateFooter(data: UpdateFooterData): Promise<FooterContent> {
    const response = await apiClient.put<{ success: boolean; data: FooterContent }>(
      '/cms/footer',
      data
    );
    return response.data.data;
  }

  /**
   * Reseta o Footer para valores padrão
   */
  async resetFooter(): Promise<FooterContent> {
    const response = await apiClient.post<{ success: boolean; data: FooterContent }>(
      '/cms/footer/reset'
    );
    return response.data.data;
  }
}

export default new CmsService();
