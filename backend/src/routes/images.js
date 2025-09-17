// ========================================
// ROTAS DE IMAGENS - MORIA BACKEND
// Upload, crop, processamento e gerenciamento
// ========================================

const express = require('express');
const router = express.Router();
const ImageController = require('../controllers/ImageController');
const { uploadSingle, uploadMultiple } = require('../middleware/upload');
const { authenticateToken } = require('../middleware/auth');

// Middleware de autenticação para todas as rotas
router.use(authenticateToken);

// ========================================
// ROTAS DE UPLOAD
// ========================================

// Upload de imagem única
router.post('/upload', uploadSingle, ImageController.uploadSingle);

// Upload de múltiplas imagens
router.post('/upload-multiple', uploadMultiple, ImageController.uploadMultiple);

// ========================================
// ROTAS DE PROCESSAMENTO
// ========================================

// Processar imagem temporária (com ou sem crop)
router.post('/process', ImageController.processImage);

// TODO: Implementar cropExistingImage no ImageController
// router.post('/crop', ImageController.cropExistingImage);

// ========================================
// ROTAS DE GERENCIAMENTO
// ========================================

// TODO: Implementar deleteImage no ImageController
// router.delete('/:baseName', ImageController.deleteImage);

// TODO: Implementar getProductImages no ImageController
// router.get('/product/:productId', ImageController.getProductImages);

// ========================================
// ROTAS DE MANUTENÇÃO
// ========================================

// Limpeza de arquivos temporários (apenas admin)
router.post('/cleanup', (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Acesso negado'
    });
  }
  next();
}, (req, res) => {
  res.json({ success: true, message: 'Cleanup não implementado' });
});

// ========================================
// DOCUMENTAÇÃO DAS ROTAS
// ========================================

// GET /api/images/docs - Documentação das rotas
router.get('/docs', (req, res) => {
  res.json({
    success: true,
    data: {
      routes: {
        upload: {
          method: 'POST',
          path: '/api/images/upload',
          description: 'Upload de imagem única',
          body: 'FormData com campo "image"',
          response: 'Dados temporários da imagem'
        },
        uploadMultiple: {
          method: 'POST',
          path: '/api/images/upload-multiple',
          description: 'Upload de múltiplas imagens',
          body: 'FormData com campo "images[]"',
          response: 'Array com dados temporários'
        },
        process: {
          method: 'POST',
          path: '/api/images/process',
          description: 'Processar imagem temporária',
          body: '{ tempPath: string, cropData?: object }',
          response: 'URLs das imagens processadas'
        },
        crop: {
          method: 'POST',
          path: '/api/images/crop',
          description: 'Crop de imagem existente',
          body: '{ baseName: string, cropData: object }',
          response: 'Nova imagem com crop aplicado'
        },
        delete: {
          method: 'DELETE',
          path: '/api/images/:baseName',
          description: 'Deletar imagem',
          response: 'Confirmação da exclusão'
        },
        productImages: {
          method: 'GET',
          path: '/api/images/product/:productId',
          description: 'Listar imagens de um produto',
          response: 'Array de URLs das imagens'
        }
      },
      cropData: {
        description: 'Estrutura dos dados de crop',
        format: {
          x: 'number - Posição X inicial',
          y: 'number - Posição Y inicial',
          width: 'number - Largura da área de crop',
          height: 'number - Altura da área de crop'
        }
      },
      imageSizes: {
        thumbnail: '150x150 - Para listagens e previews',
        medium: '500x500 - Para visualização padrão',
        full: '1200x1200 - Para zoom e detalhes'
      }
    }
  });
});

module.exports = router;