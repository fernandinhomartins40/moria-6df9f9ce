import { PrismaClient } from '@prisma/client';
import { UpdateHeroDto } from './dto/update-hero.dto.js';
import { CreateMarqueeMessageDto } from './dto/create-marquee-message.dto.js';
import { UpdateMarqueeMessageDto } from './dto/update-marquee-message.dto.js';
import { UpdateFooterDto } from './dto/update-footer.dto.js';

const prisma = new PrismaClient();

export class CmsService {
  // ============================================================================
  // HERO SECTION
  // ============================================================================

  /**
   * Busca o conteúdo do Hero
   * Se não existir, cria com valores padrão
   */
  async getHero() {
    let hero = await prisma.heroSection.findFirst({
      where: { active: true },
    });

    // Se não existe, criar com valores padrão
    if (!hero) {
      hero = await prisma.heroSection.create({
        data: {},
      });
    }

    return hero;
  }

  /**
   * Atualiza o conteúdo do Hero
   */
  async updateHero(data: UpdateHeroDto) {
    const hero = await this.getHero();

    const updated = await prisma.heroSection.update({
      where: { id: hero.id },
      data,
    });

    return updated;
  }

  /**
   * Reseta o Hero para valores padrão
   */
  async resetHero() {
    const hero = await this.getHero();

    const reset = await prisma.heroSection.update({
      where: { id: hero.id },
      data: {
        title: 'MORIA Peças & Serviços',
        subtitle:
          'Especialistas em peças automotivas e serviços de qualidade há mais de 15 anos. Encontre tudo o que você precisa para manter seu veículo em perfeito estado com garantia e atendimento especializado.',
        imageUrl: '/assets/hero-garage.jpg',
        features: [
          { icon: 'Shield', text: 'Qualidade Garantida' },
          { icon: 'Truck', text: 'Entrega Rápida' },
          { icon: 'Wrench', text: 'Serviços Especializados' },
          { icon: 'Award', text: '15+ Anos no Mercado' },
        ],
        cta1Text: 'Ver Produtos',
        cta1Link: '#products',
        cta1Enabled: true,
        cta2Text: 'Nossos Serviços',
        cta2Link: '#services',
        cta2Enabled: true,
        cta3Text: 'Fale Conosco',
        cta3Link: 'https://wa.me/5511999999999',
        cta3Enabled: true,
        active: true,
      },
    });

    return reset;
  }

  // ============================================================================
  // MARQUEE MESSAGES
  // ============================================================================

  /**
   * Busca todas as mensagens do marquee (ativas e inativas)
   */
  async getMarqueeMessages(activeOnly: boolean = false) {
    const where = activeOnly ? { active: true } : {};

    const messages = await prisma.marqueeMessage.findMany({
      where,
      orderBy: { order: 'asc' },
    });

    return messages;
  }

  /**
   * Busca uma mensagem específica por ID
   */
  async getMarqueeMessageById(id: string) {
    const message = await prisma.marqueeMessage.findUnique({
      where: { id },
    });

    if (!message) {
      throw new Error('Mensagem não encontrada');
    }

    return message;
  }

  /**
   * Cria uma nova mensagem do marquee
   */
  async createMarqueeMessage(data: CreateMarqueeMessageDto) {
    // Se order não foi fornecida, pegar o próximo número
    let order = data.order;
    if (order === undefined) {
      const lastMessage = await prisma.marqueeMessage.findFirst({
        orderBy: { order: 'desc' },
      });

      order = lastMessage ? lastMessage.order + 1 : 0;
    }

    const message = await prisma.marqueeMessage.create({
      data: {
        message: data.message,
        order,
        active: data.active ?? true,
      },
    });

    return message;
  }

  /**
   * Atualiza uma mensagem do marquee
   */
  async updateMarqueeMessage(id: string, data: UpdateMarqueeMessageDto) {
    const message = await prisma.marqueeMessage.update({
      where: { id },
      data,
    });

    return message;
  }

  /**
   * Deleta uma mensagem do marquee
   */
  async deleteMarqueeMessage(id: string) {
    await prisma.marqueeMessage.delete({
      where: { id },
    });
  }

  /**
   * Reordena as mensagens do marquee
   */
  async reorderMarqueeMessages(ids: string[]) {
    const updates = ids.map((id, index) =>
      prisma.marqueeMessage.update({
        where: { id },
        data: { order: index },
      })
    );

    await Promise.all(updates);
  }

  // ============================================================================
  // FOOTER CONTENT
  // ============================================================================

  /**
   * Busca o conteúdo do Footer
   * Se não existir, cria com valores padrão
   */
  async getFooter() {
    let footer = await prisma.footerContent.findFirst();

    // Se não existe, criar com valores padrão
    if (!footer) {
      footer = await prisma.footerContent.create({
        data: {},
      });
    }

    return footer;
  }

  /**
   * Atualiza o conteúdo do Footer
   */
  async updateFooter(data: UpdateFooterDto) {
    const footer = await this.getFooter();

    const updated = await prisma.footerContent.update({
      where: { id: footer.id },
      data,
    });

    return updated;
  }

  /**
   * Reseta o Footer para valores padrão
   */
  async resetFooter() {
    const footer = await this.getFooter();

    const reset = await prisma.footerContent.update({
      where: { id: footer.id },
      data: {
        description:
          'A Moria Peças & Serviços é referência em peças automotivas e serviços especializados. Atendemos com excelência há mais de 15 anos.',
        services: [
          'Manutenção Preventiva',
          'Troca de Óleo e Filtros',
          'Revisão Completa',
          'Freios e Suspensão',
          'Ar Condicionado',
          'Diagnóstico Eletrônico',
        ],
        socialLinks: {
          facebook: '',
          instagram: '',
          whatsapp: '5511999999999',
          youtube: '',
        },
        certifications: [
          'Peças Originais',
          'Garantia de 90 dias',
          'Atendimento Especializado',
          'Orçamento Gratuito',
        ],
        footerLinks: {
          privacy: '#',
          terms: '#',
          warranty: '#',
        },
      },
    });

    return reset;
  }
}
