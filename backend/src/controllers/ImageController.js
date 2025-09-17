// ========================================
// IMAGE CONTROLLER - PRISMA VERSION
// ✅ Implementação 100% Prisma
// ✅ Type safety 100% com Prisma
// ✅ Relacionamentos automáticos para uploads/images
// ========================================

const prisma = require('../services/prisma.js');
const imageProcessor = require('../utils/imageProcessor');
const { asyncHandler, AppError } = require('../middleware/errorHandler.js');
const fs = require('fs');
const path = require('path');

// Upload único de imagem
const uploadSingle = asyncHandler(async (req, res) => {
  if (!req.file) {
    throw new AppError('Nenhuma imagem foi enviada', 400);
  }

  try {
    // Obter metadados da imagem
    const metadata = await imageProcessor.getImageMetadata(req.file.path);
    if (!metadata) {
      imageProcessor.cleanupFile(req.file.path);
      throw new AppError('Arquivo de imagem inválido', 400);
    }

    // ✅ Registrar upload no banco com Prisma
    const upload = await prisma.upload.create({
      data: {
        originalName: req.file.originalname,
        fileName: path.basename(req.file.path),
        mimeType: req.file.mimetype,
        size: req.file.size,
        path: req.file.path,
        type: 'IMAGE',
        status: 'PROCESSING',
        metadata: JSON.stringify(metadata)
      }
    });

    res.json({
      success: true,
      data: {
        upload,
        tempPath: req.file.path,
        originalName: req.file.originalname,
        size: req.file.size,
        metadata
      },
      message: 'Upload realizado com sucesso'
    });

  } catch (error) {
    if (req.file) {
      imageProcessor.cleanupFile(req.file.path);
    }
    throw error;
  }
});

// Upload múltiplo de imagens
const uploadMultiple = asyncHandler(async (req, res) => {
  if (!req.files || req.files.length === 0) {
    throw new AppError('Nenhuma imagem foi enviada', 400);
  }

  const results = [];
  const uploadPromises = [];

  try {
    for (const file of req.files) {
      const metadata = await imageProcessor.getImageMetadata(file.path);

      if (metadata) {
        // ✅ Criar registro de upload no banco
        const uploadPromise = prisma.upload.create({
          data: {
            originalName: file.originalname,
            fileName: path.basename(file.path),
            mimeType: file.mimetype,
            size: file.size,
            path: file.path,
            type: 'IMAGE',
            status: 'PROCESSING',
            metadata: JSON.stringify(metadata)
          }
        });

        uploadPromises.push(uploadPromise);

        results.push({
          tempPath: file.path,
          originalName: file.originalname,
          size: file.size,
          metadata
        });
      } else {
        imageProcessor.cleanupFile(file.path);
      }
    }

    // Executar todos os uploads em paralelo
    const uploads = await Promise.all(uploadPromises);

    res.json({
      success: true,
      data: {
        uploads,
        files: results
      },
      message: `${results.length} imagens enviadas com sucesso`
    });

  } catch (error) {
    // Limpar todos os arquivos em caso de erro
    if (req.files) {
      req.files.forEach(file => {
        imageProcessor.cleanupFile(file.path);
      });
    }
    throw error;
  }
});

// Processar imagem (crop, resize, compress)
const processImage = asyncHandler(async (req, res) => {
  const { uploadId } = req.params;
  const {
    crop,
    sizes = ['thumbnail', 'medium', 'large'],
    quality = 85,
    format = 'webp'
  } = req.body;

  // ✅ Buscar upload com Prisma
  const upload = await prisma.upload.findUnique({
    where: { id: parseInt(uploadId) }
  });

  if (!upload) {
    throw new AppError('Upload não encontrado', 404);
  }

  if (upload.status === 'COMPLETED') {
    throw new AppError('Imagem já foi processada', 400);
  }

  try {
    // ✅ Atualizar status para processando
    await prisma.upload.update({
      where: { id: upload.id },
      data: { status: 'PROCESSING' }
    });

    // Processar imagem
    const processedImages = await imageProcessor.processImage(upload.path, {
      crop,
      sizes,
      quality,
      format
    });

    // ✅ Criar registros de imagem processada no banco
    const imagePromises = processedImages.map(processed =>
      prisma.image.create({
        data: {
          uploadId: upload.id,
          fileName: processed.fileName,
          path: processed.path,
          size: processed.size.toUpperCase(),
          width: processed.width,
          height: processed.height,
          fileSize: processed.fileSize,
          mimeType: processed.mimeType,
          url: processed.url
        }
      })
    );

    const images = await Promise.all(imagePromises);

    // ✅ Atualizar upload como concluído
    const updatedUpload = await prisma.upload.update({
      where: { id: upload.id },
      data: {
        status: 'COMPLETED',
        processedAt: new Date()
      },
      include: {
        images: true
      }
    });

    // Limpar arquivo temporário
    imageProcessor.cleanupFile(upload.path);

    res.json({
      success: true,
      data: {
        upload: updatedUpload,
        images
      },
      message: 'Imagem processada com sucesso'
    });

  } catch (error) {
    // ✅ Marcar upload como erro
    await prisma.upload.update({
      where: { id: upload.id },
      data: {
        status: 'ERROR',
        error: error.message
      }
    });

    throw new AppError('Erro ao processar imagem: ' + error.message, 500);
  }
});

// Listar uploads
const getUploads = asyncHandler(async (req, res) => {
  const {
    page = 1,
    limit = 10,
    status,
    type,
    startDate,
    endDate
  } = req.query;

  const where = {
    ...(status && { status: status.toUpperCase() }),
    ...(type && { type: type.toUpperCase() }),
    ...(startDate && endDate && {
      createdAt: {
        gte: new Date(startDate),
        lte: new Date(endDate)
      }
    })
  };

  const [data, total] = await Promise.all([
    prisma.upload.findMany({
      where,
      skip: (parseInt(page) - 1) * parseInt(limit),
      take: parseInt(limit),
      orderBy: { createdAt: 'desc' },
      include: {
        images: true,
        _count: {
          select: { images: true }
        }
      }
    }),
    prisma.upload.count({ where })
  ]);

  res.json({
    success: true,
    data,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      totalPages: Math.ceil(total / parseInt(limit))
    }
  });
});

// Obter imagens por upload
const getImagesByUpload = asyncHandler(async (req, res) => {
  const { uploadId } = req.params;

  const images = await prisma.image.findMany({
    where: { uploadId: parseInt(uploadId) },
    orderBy: { createdAt: 'asc' }
  });

  res.json({
    success: true,
    data: images
  });
});

// Deletar upload e imagens associadas
const deleteUpload = asyncHandler(async (req, res) => {
  const { id } = req.params;

  // ✅ Buscar upload com imagens
  const upload = await prisma.upload.findUnique({
    where: { id: parseInt(id) },
    include: { images: true }
  });

  if (!upload) {
    throw new AppError('Upload não encontrado', 404);
  }

  try {
    // Deletar arquivos físicos
    if (fs.existsSync(upload.path)) {
      fs.unlinkSync(upload.path);
    }

    upload.images.forEach(image => {
      if (fs.existsSync(image.path)) {
        fs.unlinkSync(image.path);
      }
    });

    // ✅ Deletar registros do banco (cascade automático)
    await prisma.upload.delete({
      where: { id: parseInt(id) }
    });

    res.json({
      success: true,
      message: 'Upload e imagens deletados com sucesso'
    });

  } catch (error) {
    throw new AppError('Erro ao deletar upload: ' + error.message, 500);
  }
});

// Obter estatísticas de uploads
const getUploadStats = asyncHandler(async (req, res) => {
  const [
    totalUploads,
    completedUploads,
    processingUploads,
    errorUploads,
    totalImages,
    totalSize
  ] = await Promise.all([
    prisma.upload.count(),
    prisma.upload.count({ where: { status: 'COMPLETED' } }),
    prisma.upload.count({ where: { status: 'PROCESSING' } }),
    prisma.upload.count({ where: { status: 'ERROR' } }),
    prisma.image.count(),
    prisma.upload.aggregate({ _sum: { size: true } })
  ]);

  res.json({
    success: true,
    data: {
      uploads: {
        total: totalUploads,
        completed: completedUploads,
        processing: processingUploads,
        error: errorUploads
      },
      images: {
        total: totalImages
      },
      storage: {
        totalSizeBytes: totalSize._sum.size || 0,
        totalSizeMB: Math.round((totalSize._sum.size || 0) / 1024 / 1024 * 100) / 100
      }
    }
  });
});

// Associar imagens a produtos
const linkImagesToProduct = asyncHandler(async (req, res) => {
  const { productId } = req.params;
  const { imageIds, primary = false } = req.body;

  if (!imageIds || imageIds.length === 0) {
    throw new AppError('IDs das imagens são obrigatórios', 400);
  }

  // ✅ Verificar se produto existe
  const product = await prisma.product.findUnique({
    where: { id: parseInt(productId) }
  });

  if (!product) {
    throw new AppError('Produto não encontrado', 404);
  }

  // ✅ Criar associações product-image
  const associations = imageIds.map((imageId, index) =>
    prisma.productImage.create({
      data: {
        productId: parseInt(productId),
        imageId: parseInt(imageId),
        isPrimary: primary && index === 0,
        order: index + 1
      }
    })
  );

  const results = await Promise.all(associations);

  res.json({
    success: true,
    data: results,
    message: 'Imagens associadas ao produto com sucesso'
  });
});

module.exports = {
  uploadSingle,
  uploadMultiple,
  processImage,
  getUploads,
  getImagesByUpload,
  deleteUpload,
  getUploadStats,
  linkImagesToProduct
};