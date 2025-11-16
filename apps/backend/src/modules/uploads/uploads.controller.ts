import { Request, Response, NextFunction } from 'express';
import { UploadsService } from './uploads.service.js';
import { z } from 'zod';

const uploadSchema = z.object({
  images: z.array(z.string()).min(1, 'At least one image is required'),
});

export class UploadsController {
  private uploadsService: UploadsService;

  constructor() {
    this.uploadsService = new UploadsService();
  }

  /**
   * POST /uploads/images
   * Upload multiple base64 images
   */
  uploadImages = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { images } = uploadSchema.parse(req.body);

      const imageUrls = await this.uploadsService.saveMultipleImages(images);

      res.status(200).json({
        success: true,
        data: {
          urls: imageUrls,
        },
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * DELETE /uploads/images
   * Delete multiple images
   */
  deleteImages = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const deleteSchema = z.object({
        urls: z.array(z.string()).min(1, 'At least one URL is required'),
      });

      const { urls } = deleteSchema.parse(req.body);

      await this.uploadsService.deleteMultipleImages(urls);

      res.status(200).json({
        success: true,
        message: 'Images deleted successfully',
      });
    } catch (error) {
      next(error);
    }
  };
}
