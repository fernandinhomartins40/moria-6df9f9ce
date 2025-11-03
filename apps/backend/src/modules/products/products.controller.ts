import { Request, Response, NextFunction } from 'express';
import { ProductsService } from './products.service.js';
import { createProductSchema } from './dto/create-product.dto.js';
import { updateProductSchema } from './dto/update-product.dto.js';
import { queryProductsSchema } from './dto/query-products.dto.js';
import { z } from 'zod';

export class ProductsController {
  private productsService: ProductsService;

  constructor() {
    this.productsService = new ProductsService();
  }

  /**
   * GET /products
   */
  getProducts = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const query = queryProductsSchema.parse(req.query);
      const result = await this.productsService.getProducts(query);

      res.status(200).json({
        success: true,
        data: result.data,
        meta: result.meta,
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * GET /products/:id
   */
  getProductById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const product = await this.productsService.getProductById(req.params.id);

      res.status(200).json({
        success: true,
        data: product,
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * GET /products/slug/:slug
   */
  getProductBySlug = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const product = await this.productsService.getProductBySlug(req.params.slug);

      res.status(200).json({
        success: true,
        data: product,
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * GET /products/sku/:sku
   */
  getProductBySku = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const product = await this.productsService.getProductBySku(req.params.sku);

      res.status(200).json({
        success: true,
        data: product,
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * GET /products/category/:category
   */
  getProductsByCategory = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 20;
      const products = await this.productsService.getProductsByCategory(req.params.category, limit);

      res.status(200).json({
        success: true,
        data: products,
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * GET /products/categories/list
   */
  getCategories = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const categories = await this.productsService.getCategories();

      res.status(200).json({
        success: true,
        data: categories,
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * GET /products/stock/low
   */
  getLowStockProducts = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const products = await this.productsService.getLowStockProducts();

      res.status(200).json({
        success: true,
        data: products,
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * POST /products
   */
  createProduct = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const dto = createProductSchema.parse(req.body);
      const product = await this.productsService.createProduct(dto);

      res.status(201).json({
        success: true,
        data: product,
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * PUT /products/:id
   */
  updateProduct = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const dto = updateProductSchema.parse(req.body);
      const product = await this.productsService.updateProduct(req.params.id, dto);

      res.status(200).json({
        success: true,
        data: product,
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * DELETE /products/:id
   */
  deleteProduct = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      await this.productsService.deleteProduct(req.params.id);

      res.status(204).send();
    } catch (error) {
      next(error);
    }
  };

  /**
   * PATCH /products/:id/stock
   */
  updateStock = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const schema = z.object({
        quantity: z.number().int('Quantity must be an integer'),
      });

      const { quantity } = schema.parse(req.body);
      const product = await this.productsService.updateStock(req.params.id, quantity);

      res.status(200).json({
        success: true,
        data: product,
      });
    } catch (error) {
      next(error);
    }
  };
}
