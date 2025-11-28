import { Request, Response, NextFunction } from 'express';
import { SettingsService } from './settings.service.js';
import { updateSettingsSchema } from './dto/update-settings.dto.js';

export class SettingsController {
  private settingsService: SettingsService;

  constructor() {
    this.settingsService = new SettingsService();
  }

  /**
   * GET /settings
   * Busca as configurações da loja
   */
  getSettings = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const settings = await this.settingsService.getSettings();

      res.status(200).json({
        success: true,
        data: settings,
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * PUT /settings
   * Atualiza as configurações da loja
   */
  updateSettings = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const dto = updateSettingsSchema.parse(req.body);
      const settings = await this.settingsService.updateSettings(dto);

      res.status(200).json({
        success: true,
        data: settings,
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * POST /settings/reset
   * Reseta as configurações para os valores padrão
   */
  resetSettings = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const settings = await this.settingsService.resetSettings();

      res.status(200).json({
        success: true,
        data: settings,
      });
    } catch (error) {
      next(error);
    }
  };
}
