// ========================================
// MIDDLEWARE DE UPLOAD - MORIA BACKEND
// Sistema completo de upload e processamento de imagens
// ========================================

const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Import dinâmico do uuid para compatibilidade com ES Modules
let uuidv4;

// Configurar storage para arquivos temporários
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const tempDir = path.join(__dirname, '../../uploads/temp');

    // Criar diretório se não existir
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }

    cb(null, tempDir);
  },
  filename: async function (req, file, cb) {
    // Garantir que uuid foi carregado
    if (!uuidv4) {
      const { v4 } = await import('uuid');
      uuidv4 = v4;
    }
    
    // Gerar nome único com timestamp e UUID
    const uniqueName = `${Date.now()}-${uuidv4()}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  }
});

// Filtro de tipos de arquivo
const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif|webp/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error('Apenas imagens são permitidas (JPEG, JPG, PNG, GIF, WebP)'));
  }
};

// Configuração do multer
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB max
    files: 10 // Máximo 10 arquivos por vez
  },
  fileFilter: fileFilter
});

// Middleware para upload único
const uploadSingle = upload.single('image');

// Middleware para upload múltiplo
const uploadMultiple = upload.array('images', 10);

// Middleware com tratamento de erro
const handleUpload = (uploadType) => {
  return (req, res, next) => {
    uploadType(req, res, (err) => {
      if (err) {
        if (err instanceof multer.MulterError) {
          if (err.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({
              success: false,
              message: 'Arquivo muito grande. Tamanho máximo: 10MB'
            });
          }
          if (err.code === 'LIMIT_FILE_COUNT') {
            return res.status(400).json({
              success: false,
              message: 'Muitos arquivos. Máximo: 10 imagens'
            });
          }
        }

        return res.status(400).json({
          success: false,
          message: err.message || 'Erro no upload do arquivo'
        });
      }
      next();
    });
  };
};

// Criar diretórios necessários
const ensureDirectories = () => {
  const dirs = [
    'uploads/temp',
    'uploads/products/thumbnails',
    'uploads/products/medium',
    'uploads/products/full'
  ];

  dirs.forEach(dir => {
    const fullPath = path.join(__dirname, '../../', dir);
    if (!fs.existsSync(fullPath)) {
      fs.mkdirSync(fullPath, { recursive: true });
    }
  });
};

// Inicializar diretórios na importação
ensureDirectories();

module.exports = {
  uploadSingle: handleUpload(uploadSingle),
  uploadMultiple: handleUpload(uploadMultiple),
  ensureDirectories
};