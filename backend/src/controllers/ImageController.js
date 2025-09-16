// ========================================
// CONTROLADOR DE IMAGENS - MORIA BACKEND
// Upload, crop, compressão e gerenciamento
// ========================================

const imageProcessor = require('../utils/imageProcessor');
const knex = require('../database');
const fs = require('fs');
const path = require('path');

class ImageController {
  // Upload único de imagem
  async uploadSingle(req, res) {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: 'Nenhuma imagem foi enviada'
        });
      }

      // Obter metadados da imagem
      const metadata = await imageProcessor.getImageMetadata(req.file.path);
      if (!metadata) {
        imageProcessor.cleanupFile(req.file.path);
        return res.status(400).json({
          success: false,
          message: 'Arquivo de imagem inválido'
        });
      }

      res.json({
        success: true,
        data: {
          tempPath: req.file.path,
          originalName: req.file.originalname,
          size: req.file.size,
          metadata: metadata
        },
        message: 'Upload realizado com sucesso'
      });

    } catch (error) {
      console.error('Erro no upload:', error);
      if (req.file) {
        imageProcessor.cleanupFile(req.file.path);
      }

      res.status(500).json({
        success: false,
        message: 'Erro interno no servidor'
      });
    }
  }

  // Upload múltiplo de imagens
  async uploadMultiple(req, res) {
    try {
      if (!req.files || req.files.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Nenhuma imagem foi enviada'
        });
      }

      const results = [];

      for (const file of req.files) {
        const metadata = await imageProcessor.getImageMetadata(file.path);
        if (metadata) {
          results.push({
            tempPath: file.path,
            originalName: file.originalname,
            size: file.size,
            metadata: metadata
          });
        } else {
          imageProcessor.cleanupFile(file.path);
        }
      }

      res.json({
        success: true,
        data: results,
        message: `${results.length} imagens enviadas com sucesso`
      });

    } catch (error) {
      console.error('Erro no upload múltiplo:', error);

      // Limpar todos os arquivos em caso de erro
      if (req.files) {
        req.files.forEach(file => {
          imageProcessor.cleanupFile(file.path);
        });
      }

      res.status(500).json({
        success: false,
        message: 'Erro interno no servidor'
      });
    }
  }

  // Processar e salvar imagem (com ou sem crop)
  async processImage(req, res) {
    try {
      const { tempPath, cropData } = req.body;

      if (!tempPath) {
        return res.status(400).json({
          success: false,
          message: 'Caminho da imagem temporária é obrigatório'
        });
      }

      // Normalizar path para funcionar tanto com barras normais quanto invertidas
      const normalizedPath = path.normalize(tempPath.replace(/\//g, path.sep));

      if (!fs.existsSync(normalizedPath)) {
        return res.status(400).json({
          success: false,
          message: 'Arquivo temporário não encontrado'
        });
      }

      // Validar dados de crop se fornecidos
      if (cropData) {
        const metadata = await imageProcessor.getImageMetadata(normalizedPath);
        if (!imageProcessor.validateCropData(cropData, metadata)) {
          return res.status(400).json({
            success: false,
            message: 'Dados de crop inválidos'
          });
        }
      }

      // Processar imagem
      const result = await imageProcessor.processImage(
        normalizedPath,
        require('uuid').v4(),
        cropData
      );

      // Limpar arquivo temporário
      imageProcessor.cleanupFile(normalizedPath);

      res.json({
        success: true,
        data: {
          urls: result
        },
        message: 'Imagem processada com sucesso'
      });

    } catch (error) {
      console.error('Erro ao processar imagem:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Erro interno no servidor'
      });
    }
  }

  // Fazer crop de imagem existente
  async cropExistingImage(req, res) {
    try {
      const { baseName, cropData } = req.body;

      if (!baseName || !cropData) {
        return res.status(400).json({
          success: false,
          message: 'Nome base da imagem e dados de crop são obrigatórios'
        });
      }

      // Buscar imagem original (full size)
      const originalPath = path.join(
        __dirname,
        '../../uploads/products/full',
        `${baseName}.webp`
      );

      if (!fs.existsSync(originalPath)) {
        return res.status(404).json({
          success: false,
          message: 'Imagem original não encontrada'
        });
      }

      // Validar dados de crop
      const metadata = await imageProcessor.getImageMetadata(originalPath);
      if (!imageProcessor.validateCropData(cropData, metadata)) {
        return res.status(400).json({
          success: false,
          message: 'Dados de crop inválidos'
        });
      }

      // Gerar novo nome base para a versão cropada
      const newBaseName = require('uuid').v4();

      // Fazer crop
      const result = await imageProcessor.cropImage(
        originalPath,
        cropData,
        newBaseName
      );

      res.json({
        success: true,
        data: {
          baseName: newBaseName,
          urls: result
        },
        message: 'Crop realizado com sucesso'
      });

    } catch (error) {
      console.error('Erro ao fazer crop:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Erro interno no servidor'
      });
    }
  }

  // Deletar imagem
  async deleteImage(req, res) {
    try {
      const { baseName } = req.params;

      if (!baseName) {
        return res.status(400).json({
          success: false,
          message: 'Nome base da imagem é obrigatório'
        });
      }

      const deleted = await imageProcessor.deleteImage(baseName);

      if (deleted) {
        res.json({
          success: true,
          message: 'Imagem deletada com sucesso'
        });
      } else {
        res.status(404).json({
          success: false,
          message: 'Imagem não encontrada'
        });
      }

    } catch (error) {
      console.error('Erro ao deletar imagem:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno no servidor'
      });
    }
  }

  // Listar imagens de um produto
  async getProductImages(req, res) {
    try {
      const { productId } = req.params;

      if (!productId) {
        return res.status(400).json({
          success: false,
          message: 'ID do produto é obrigatório'
        });
      }

      // Buscar produto no banco
      const product = await knex('products')
        .where('id', productId)
        .first();

      if (!product) {
        return res.status(404).json({
          success: false,
          message: 'Produto não encontrado'
        });
      }

      // Retornar imagens
      const images = Array.isArray(product.images) ? product.images : [];

      res.json({
        success: true,
        data: {
          images: images,
          total: images.length
        }
      });

    } catch (error) {
      console.error('Erro ao buscar imagens:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno no servidor'
      });
    }
  }

  // Limpeza de arquivos temporários
  async cleanupTemp(req, res) {
    try {
      await imageProcessor.cleanupTempFiles();

      res.json({
        success: true,
        message: 'Limpeza de arquivos temporários concluída'
      });

    } catch (error) {
      console.error('Erro na limpeza:', error);
      res.status(500).json({
        success: false,
        message: 'Erro na limpeza de arquivos'
      });
    }
  }
}

module.exports = new ImageController();