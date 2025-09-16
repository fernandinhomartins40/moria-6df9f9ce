// ========================================
// PROCESSADOR DE IMAGENS - MORIA BACKEND
// Crop, redimensionamento e compressão com Sharp
// ========================================

const sharp = require('sharp');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');

class ImageProcessor {
  constructor() {
    this.uploadsDir = path.join(__dirname, '../../uploads');
    this.productsDir = path.join(this.uploadsDir, 'products');
  }

  // Processar imagem original para diferentes tamanhos
  async processImage(inputPath, outputBaseName, cropData = null) {
    try {
      let image = sharp(inputPath);

      // Aplicar crop se fornecido
      if (cropData) {
        const { x, y, width, height } = cropData;
        image = image.extract({
          left: Math.round(x),
          top: Math.round(y),
          width: Math.round(width),
          height: Math.round(height)
        });
      }

      // Processar em diferentes tamanhos
      const sizes = [
        { name: 'thumbnail', width: 150, height: 150, dir: 'thumbnails' },
        { name: 'medium', width: 500, height: 500, dir: 'medium' },
        { name: 'full', width: 1200, height: 1200, dir: 'full' }
      ];

      const results = {};

      for (const size of sizes) {
        const outputPath = path.join(
          this.productsDir,
          size.dir,
          `${outputBaseName}.webp`
        );

        // Redimensionar mantendo proporção
        await image
          .clone()
          .resize(size.width, size.height, {
            fit: 'inside',
            withoutEnlargement: true
          })
          .webp({ quality: 85 })
          .toFile(outputPath);

        results[size.name] = `/uploads/products/${size.dir}/${outputBaseName}.webp`;
      }

      return results;
    } catch (error) {
      console.error('Erro ao processar imagem:', error);
      throw new Error('Falha no processamento da imagem');
    }
  }

  // Aplicar crop a uma imagem existente
  async cropImage(imagePath, cropData, outputBaseName) {
    try {
      if (!fs.existsSync(imagePath)) {
        throw new Error('Arquivo de imagem não encontrado');
      }

      return await this.processImage(imagePath, outputBaseName, cropData);
    } catch (error) {
      console.error('Erro ao fazer crop:', error);
      throw new Error('Falha no crop da imagem');
    }
  }

  // Processar upload inicial
  async processUpload(tempFilePath) {
    try {
      const baseName = uuidv4();
      const results = await this.processImage(tempFilePath, baseName);

      // Remover arquivo temporário
      this.cleanupFile(tempFilePath);

      return {
        baseName,
        urls: results
      };
    } catch (error) {
      // Limpar arquivo temporário mesmo em caso de erro
      this.cleanupFile(tempFilePath);
      throw error;
    }
  }

  // Processar múltiplos uploads
  async processMultipleUploads(tempFilePaths) {
    const results = [];

    for (const filePath of tempFilePaths) {
      try {
        const result = await this.processUpload(filePath);
        results.push(result);
      } catch (error) {
        console.error(`Erro ao processar ${filePath}:`, error);
        // Continua com os próximos arquivos
      }
    }

    return results;
  }

  // Remover imagem e todos os seus tamanhos
  async deleteImage(baseName) {
    try {
      const sizes = ['thumbnails', 'medium', 'full'];

      for (const size of sizes) {
        const imagePath = path.join(this.productsDir, size, `${baseName}.webp`);
        if (fs.existsSync(imagePath)) {
          fs.unlinkSync(imagePath);
        }
      }

      return true;
    } catch (error) {
      console.error('Erro ao deletar imagem:', error);
      return false;
    }
  }

  // Obter metadados da imagem
  async getImageMetadata(imagePath) {
    try {
      const metadata = await sharp(imagePath).metadata();
      return {
        width: metadata.width,
        height: metadata.height,
        format: metadata.format,
        size: metadata.size
      };
    } catch (error) {
      console.error('Erro ao obter metadados:', error);
      return null;
    }
  }

  // Limpar arquivo temporário
  cleanupFile(filePath) {
    try {
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    } catch (error) {
      console.error('Erro ao limpar arquivo:', error);
    }
  }

  // Limpeza de arquivos temporários antigos (> 1 hora)
  async cleanupTempFiles() {
    try {
      const tempDir = path.join(this.uploadsDir, 'temp');
      const files = fs.readdirSync(tempDir);
      const oneHourAgo = Date.now() - (60 * 60 * 1000);

      for (const file of files) {
        const filePath = path.join(tempDir, file);
        const stats = fs.statSync(filePath);

        if (stats.mtime.getTime() < oneHourAgo) {
          fs.unlinkSync(filePath);
        }
      }
    } catch (error) {
      console.error('Erro na limpeza de arquivos temporários:', error);
    }
  }

  // Validar dados de crop
  validateCropData(cropData, imageMetadata) {
    const { x, y, width, height } = cropData;

    if (x < 0 || y < 0 || width <= 0 || height <= 0) {
      return false;
    }

    if (x + width > imageMetadata.width || y + height > imageMetadata.height) {
      return false;
    }

    return true;
  }
}

module.exports = new ImageProcessor();