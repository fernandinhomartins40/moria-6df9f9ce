import { Request, Response, NextFunction } from 'express';
import { CmsService } from './cms.service.js';
import { updateHeroSchema } from './dto/update-hero.dto.js';
import { createMarqueeMessageSchema } from './dto/create-marquee-message.dto.js';
import { updateMarqueeMessageSchema } from './dto/update-marquee-message.dto.js';
import { updateFooterSchema } from './dto/update-footer.dto.js';

export class CmsController {
  private cmsService: CmsService;

  constructor() {
    this.cmsService = new CmsService();
  }

  // ============================================================================
  // HERO SECTION
  // ============================================================================

  /**
   * GET /cms/hero
   */
  getHero = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const hero = await this.cmsService.getHero();

      res.status(200).json({
        success: true,
        data: hero,
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * PUT /cms/hero
   */
  updateHero = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const dto = updateHeroSchema.parse(req.body);
      const hero = await this.cmsService.updateHero(dto);

      res.status(200).json({
        success: true,
        data: hero,
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * POST /cms/hero/reset
   */
  resetHero = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const hero = await this.cmsService.resetHero();

      res.status(200).json({
        success: true,
        data: hero,
      });
    } catch (error) {
      next(error);
    }
  };

  // ============================================================================
  // MARQUEE MESSAGES
  // ============================================================================

  /**
   * GET /cms/marquee
   */
  getMarqueeMessages = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const activeOnly = req.query.activeOnly === 'true';
      const messages = await this.cmsService.getMarqueeMessages(activeOnly);

      res.status(200).json({
        success: true,
        data: messages,
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * GET /cms/marquee/:id
   */
  getMarqueeMessageById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const message = await this.cmsService.getMarqueeMessageById(req.params.id);

      res.status(200).json({
        success: true,
        data: message,
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * POST /cms/marquee
   */
  createMarqueeMessage = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const dto = createMarqueeMessageSchema.parse(req.body);
      const message = await this.cmsService.createMarqueeMessage(dto);

      res.status(201).json({
        success: true,
        data: message,
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * PUT /cms/marquee/:id
   */
  updateMarqueeMessage = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const dto = updateMarqueeMessageSchema.parse(req.body);
      const message = await this.cmsService.updateMarqueeMessage(req.params.id, dto);

      res.status(200).json({
        success: true,
        data: message,
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * DELETE /cms/marquee/:id
   */
  deleteMarqueeMessage = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      await this.cmsService.deleteMarqueeMessage(req.params.id);

      res.status(204).send();
    } catch (error) {
      next(error);
    }
  };

  /**
   * POST /cms/marquee/reorder
   * Body: { ids: string[] }
   */
  reorderMarqueeMessages = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { ids } = req.body;

      if (!Array.isArray(ids)) {
        res.status(400).json({
          success: false,
          message: 'ids deve ser um array',
        });
        return;
      }

      await this.cmsService.reorderMarqueeMessages(ids);

      res.status(200).json({
        success: true,
        message: 'Mensagens reordenadas com sucesso',
      });
    } catch (error) {
      next(error);
    }
  };

  // ============================================================================
  // FOOTER CONTENT
  // ============================================================================

  /**
   * GET /cms/footer
   */
  getFooter = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const footer = await this.cmsService.getFooter();

      res.status(200).json({
        success: true,
        data: footer,
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * PUT /cms/footer
   */
  updateFooter = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const dto = updateFooterSchema.parse(req.body);
      const footer = await this.cmsService.updateFooter(dto);

      res.status(200).json({
        success: true,
        data: footer,
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * POST /cms/footer/reset
   */
  resetFooter = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const footer = await this.cmsService.resetFooter();

      res.status(200).json({
        success: true,
        data: footer,
      });
    } catch (error) {
      next(error);
    }
  };
}
