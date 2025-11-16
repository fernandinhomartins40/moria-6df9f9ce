import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import crypto from 'crypto';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export class UploadsService {
  private uploadsDir: string;

  constructor() {
    // Define o diretório de uploads
    this.uploadsDir = path.join(__dirname, '../../../uploads/products');
    this.ensureUploadsDirExists();
  }

  private async ensureUploadsDirExists(): Promise<void> {
    try {
      await fs.access(this.uploadsDir);
    } catch {
      await fs.mkdir(this.uploadsDir, { recursive: true });
    }
  }

  /**
   * Salva uma imagem base64 e retorna a URL
   */
  async saveBase64Image(base64Data: string): Promise<string> {
    try {
      // Remove o prefixo data:image/...;base64,
      const matches = base64Data.match(/^data:image\/(\w+);base64,(.+)$/);
      if (!matches) {
        throw new Error('Invalid base64 image format');
      }

      const imageType = matches[1];
      const base64Image = matches[2];

      // Gera um nome único para a imagem
      const filename = `${crypto.randomBytes(16).toString('hex')}.${imageType}`;
      const filepath = path.join(this.uploadsDir, filename);

      // Converte base64 para buffer e salva
      const imageBuffer = Buffer.from(base64Image, 'base64');
      await fs.writeFile(filepath, imageBuffer);

      // Retorna a URL relativa
      return `/uploads/products/${filename}`;
    } catch (error) {
      console.error('Error saving image:', error);
      throw new Error('Failed to save image');
    }
  }

  /**
   * Salva múltiplas imagens base64
   */
  async saveMultipleImages(base64Images: string[]): Promise<string[]> {
    const savePromises = base64Images.map(img => this.saveBase64Image(img));
    return Promise.all(savePromises);
  }

  /**
   * Deleta uma imagem
   */
  async deleteImage(imageUrl: string): Promise<void> {
    try {
      // Extrai o nome do arquivo da URL
      const filename = path.basename(imageUrl);
      const filepath = path.join(this.uploadsDir, filename);

      await fs.unlink(filepath);
    } catch (error) {
      console.error('Error deleting image:', error);
      // Não lança erro se o arquivo não existir
    }
  }

  /**
   * Deleta múltiplas imagens
   */
  async deleteMultipleImages(imageUrls: string[]): Promise<void> {
    const deletePromises = imageUrls.map(url => this.deleteImage(url));
    await Promise.all(deletePromises);
  }
}
