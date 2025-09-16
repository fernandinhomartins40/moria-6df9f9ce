import React, { useState, useRef, useCallback, useEffect, useImperativeHandle, forwardRef } from 'react';
import { Button } from './button';
import { Card, CardContent } from './card';
import { Badge } from './badge';
import { Progress } from './progress';
import { ImageCropper } from './ImageCropper';
import { apiClient } from '../../services/api';
import {
  Upload,
  Image as ImageIcon,
  Trash2,
  Edit3,
  Plus,
  FileImage,
  AlertCircle,
  Check
} from 'lucide-react';

interface UploadedImage {
  id: string;
  file?: File;
  tempUrl?: string;
  previewUrl?: string; // URL da prévia local após crop
  cropData?: CropData; // Dados do crop para processar depois
  processedUrls?: {
    thumbnail: string;
    medium: string;
    full: string;
  };
  metadata?: {
    width: number;
    height: number;
    format: string;
    size: number;
  };
  status: 'uploading' | 'uploaded' | 'awaiting-crop' | 'cropped' | 'processing' | 'ready' | 'error';
  progress: number;
  error?: string;
}

interface CropData {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface ImageUploadProps {
  onImagesChange: (images: UploadedImage[]) => void;
  maxImages?: number;
  aspectRatio?: number | null;
  className?: string;
  disabled?: boolean;
  initialImages?: UploadedImage[];
}

export interface ImageUploadRef {
  processImagesForSaving: () => Promise<UploadedImage[]>;
}

export const ImageUpload = forwardRef<ImageUploadRef, ImageUploadProps>(({
  onImagesChange,
  maxImages = 10,
  aspectRatio = null,
  className = '',
  disabled = false,
  initialImages = []
}, ref) => {
  const [images, setImages] = useState<UploadedImage[]>(initialImages);
  const [dragOver, setDragOver] = useState(false);
  const [cropImage, setCropImage] = useState<UploadedImage | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const onImagesChangeRef = useRef(onImagesChange);

  // Manter referência atualizada da função
  useEffect(() => {
    onImagesChangeRef.current = onImagesChange;
  }, [onImagesChange]);

  // Sincronizar com imagens iniciais quando mudarem
  useEffect(() => {
    setImages(initialImages);
  }, [initialImages]);

  // Notificar mudanças sempre que images mudar (usando ref para evitar loops)
  useEffect(() => {
    onImagesChangeRef.current(images);
  }, [images]);

  // Processar imagens realmente no backend (chamado quando salvar produto)
  const processImagesForSaving = useCallback(async (): Promise<UploadedImage[]> => {
    const imagesToProcess = images.filter(img =>
      (img.status === 'cropped' || img.status === 'ready') && img.file
    );

    const processedImages: UploadedImage[] = [];

    for (const image of imagesToProcess) {
      try {
        // Marcar como processando
        setImages(prev => prev.map(img =>
          img.id === image.id
            ? { ...img, status: 'processing', progress: 50 }
            : img
        ));

        // Fazer upload da imagem original
        const uploadResult = await uploadToAPI(image.file!);

        // Processar com crop se tiver cropData, senão processar direto
        const processResult = await processImageAPI(
          uploadResult.data.tempPath,
          image.cropData
        );

        // Atualizar com URLs processadas
        const processedImage: UploadedImage = {
          ...image,
          status: 'ready',
          progress: 100,
          processedUrls: processResult.data.urls,
          metadata: uploadResult.data.metadata
        };

        setImages(prev => prev.map(img =>
          img.id === image.id ? processedImage : img
        ));

        processedImages.push(processedImage);

      } catch (error) {
        setImages(prev => prev.map(img =>
          img.id === image.id
            ? {
                ...img,
                status: 'error',
                error: error instanceof Error ? error.message : 'Erro no processamento'
              }
            : img
        ));
      }
    }

    return processedImages;
  }, [images]);

  // Expor funções para o componente pai
  useImperativeHandle(ref, () => ({
    processImagesForSaving
  }), [processImagesForSaving]);

  // Gerar prévia local da imagem cropada usando canvas
  const generateCroppedPreview = (imageElement: HTMLImageElement, cropData: CropData): Promise<string> => {
    return new Promise((resolve, reject) => {
      try {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        if (!ctx) {
          reject(new Error('Não foi possível criar contexto do canvas'));
          return;
        }

        // Definir tamanho do canvas como o tamanho do crop
        canvas.width = cropData.width;
        canvas.height = cropData.height;

        // Desenhar a porção cropada da imagem
        ctx.drawImage(
          imageElement,
          cropData.x, cropData.y, cropData.width, cropData.height, // fonte
          0, 0, cropData.width, cropData.height // destino
        );

        // Converter canvas para blob URL
        canvas.toBlob((blob) => {
          if (blob) {
            const previewUrl = URL.createObjectURL(blob);
            resolve(previewUrl);
          } else {
            reject(new Error('Falha ao gerar blob do canvas'));
          }
        }, 'image/jpeg', 0.9);
      } catch (error) {
        reject(error);
      }
    });
  };

  // Upload para API usando apiClient com sistema de refresh automático
  const uploadToAPI = async (file: File): Promise<any> => {
    // Usar o método uploadFile correto do apiClient
    const result = await apiClient.uploadFile('images/upload', file);

    if (!result.success) {
      throw new Error(result.message || 'Erro no upload');
    }

    return result;
  };

  // Processar imagem na API usando apiClient com sistema de refresh automático
  const processImageAPI = async (tempPath: string, cropData?: CropData): Promise<any> => {
    // Normalizar path para evitar problemas com barras invertidas do Windows
    const normalizedPath = tempPath.replace(/\\/g, '/');

    const result = await apiClient.post('/images/process', {
      tempPath: normalizedPath,
      cropData
    });

    if (!result.success) {
      throw new Error(result.message || 'Erro no processamento');
    }

    return result;
  };

  // Adicionar imagens
  const handleFiles = useCallback(async (fileList: FileList) => {
    if (disabled) return;

    const files = Array.from(fileList);
    const validFiles = files.filter(file => {
      const isValidType = file.type.startsWith('image/');
      const isValidSize = file.size <= 10 * 1024 * 1024; // 10MB
      return isValidType && isValidSize;
    });

    if (validFiles.length === 0) return;

    // Criar entradas para as imagens e limitar quantidade
    const newImages: UploadedImage[] = [];

    setImages(prev => {
      const availableSlots = maxImages - prev.length;
      const filesToProcess = validFiles.slice(0, availableSlots);

      const imagesToAdd = filesToProcess.map(file => ({
        id: `temp-${Date.now()}-${Math.random()}`,
        file,
        tempUrl: URL.createObjectURL(file),
        status: 'uploading' as const,
        progress: 0
      }));

      newImages.push(...imagesToAdd);
      return [...prev, ...imagesToAdd];
    });

    // Processar cada arquivo - NOVO FLUXO CORRETO
    for (const newImage of newImages) {
      // Se tem aspect ratio definido, abrir cropper IMEDIATAMENTE
      if (aspectRatio !== null) {
        // Marcar como esperando crop
        setImages(prev => prev.map(img =>
          img.id === newImage.id
            ? {
                ...img,
                status: 'awaiting-crop',
                progress: 30
              }
            : img
        ));

        // Abrir cropper com a imagem local (blob URL) - APENAS UMA POR VEZ
        setCropImage(newImage);

        // Parar o loop aqui - processar apenas uma imagem por vez
        break;
      } else {
        // Sem crop - marcar como pronto para usar tempUrl
        setImages(prev => prev.map(img =>
          img.id === newImage.id
            ? {
                ...img,
                status: 'ready',
                progress: 100,
                previewUrl: img.tempUrl // Usar a própria imagem como prévia
              }
            : img
        ));
      }
    }
  }, [maxImages, aspectRatio, disabled]);

  // Processar imagem diretamente (sem crop)
  const processImageDirect = async (imageId: string, tempPath: string) => {
    try {
      setImages(prev => prev.map(img =>
        img.id === imageId
          ? { ...img, status: 'processing', progress: 75 }
          : img
      ));

      const processResult = await processImageAPI(tempPath);

      setImages(prev => {
        const updated = prev.map(img =>
          img.id === imageId
            ? {
                ...img,
                status: 'ready',
                progress: 100,
                processedUrls: processResult.data.urls
              }
            : img
        );

        return updated;
      });

    } catch (error) {
      console.error('Erro no processamento direto:', error);
      setImages(prev => {
        const updated = prev.map(img =>
          img.id === imageId
            ? {
                ...img,
                status: 'error',
                error: error instanceof Error ? error.message : 'Erro no processamento'
              }
            : img
        );

        return updated;
      });
    }
  };

  // Processar imagem com crop
  const processImageWithCrop = async (imageId: string, tempPath: string, cropData: CropData) => {
    try {
      setImages(prev => prev.map(img =>
        img.id === imageId
          ? { ...img, status: 'processing', progress: 75 }
          : img
      ));

      const processResult = await processImageAPI(tempPath, cropData);

      setImages(prev => {
        const updated = prev.map(img =>
          img.id === imageId
            ? {
                ...img,
                status: 'ready',
                progress: 100,
                processedUrls: processResult.data.urls
              }
            : img
        );

        return updated;
      });

    } catch (error) {
      setImages(prev => {
        const updated = prev.map(img =>
          img.id === imageId
            ? {
                ...img,
                status: 'error',
                error: error instanceof Error ? error.message : 'Erro no processamento'
              }
            : img
        );

        return updated;
      });
    }
  };

  // Finalizar crop - NOVO FLUXO: apenas gerar prévia local
  const handleCropComplete = async (cropData: CropData) => {
    if (!cropImage || !cropImage.tempUrl) {
      return;
    }

    const currentCropImageId = cropImage.id;

    try {
      // Carregar imagem para gerar prévia
      const img = new Image();
      img.onload = async () => {
        try {
          // Gerar prévia local da imagem cropada
          const previewUrl = await generateCroppedPreview(img, cropData);

          // Marcar como cropada com prévia local
          setImages(prev => prev.map(image =>
            image.id === currentCropImageId
              ? {
                  ...image,
                  status: 'cropped',
                  progress: 100,
                  previewUrl,
                  cropData // Salvar dados do crop para processar depois
                }
              : image
          ));

          // Limpar cropper
          setCropImage(null);

          // Processar próxima imagem se houver usando React.startTransition
          setTimeout(() => {
            const nextImage = images.find(img =>
              img.status === 'awaiting-crop' &&
              img.id !== currentCropImageId
            );
            if (nextImage && aspectRatio !== null) {
              setCropImage(nextImage);
            }
          }, 50);
        } catch (error) {
          setImages(prev => prev.map(image =>
            image.id === currentCropImageId
              ? {
                  ...image,
                  status: 'error',
                  error: 'Erro ao gerar prévia da imagem'
                }
              : image
          ));
          setCropImage(null);
        }
      };

      img.onerror = () => {
        setImages(prev => prev.map(image =>
          image.id === currentCropImageId
            ? {
                ...image,
                status: 'error',
                error: 'Erro ao carregar imagem para crop'
              }
            : image
        ));
        setCropImage(null);
      };

      img.src = cropImage.tempUrl;

    } catch (error) {
      setImages(prev => prev.map(image =>
        image.id === currentCropImageId
          ? {
              ...image,
              status: 'error',
              error: error instanceof Error ? error.message : 'Erro no crop'
            }
          : image
      ));
      setCropImage(null);
    }
  };

  // Cancelar crop
  const handleCropCancel = () => {
    const currentCropImageId = cropImage?.id;

    if (cropImage) {
      setImages(prev => prev.filter(img => img.id !== cropImage.id));
    }
    setCropImage(null);

    // Processar próxima imagem se houver
    setTimeout(() => {
      const nextImage = images.find(img =>
        img.status === 'awaiting-crop' &&
        img.id !== currentCropImageId
      );
      if (nextImage && aspectRatio !== null) {
        setCropImage(nextImage);
      }
    }, 50);
  };

  // Remover imagem
  const removeImage = (imageId: string) => {
    setImages(prev => prev.filter(img => img.id !== imageId));
  };

  // Abrir cropper para edição
  const editImage = (image: UploadedImage) => {
    // Usar tempUrl se disponível (imagem original), senão usar a URL processada
    const imageForCrop = {
      ...image,
      tempUrl: image.tempUrl || (image.processedUrls?.full)
    };
    setCropImage(imageForCrop);
  };

  // Drag & Drop handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (!disabled) setDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    if (!disabled && e.dataTransfer.files) {
      handleFiles(e.dataTransfer.files);
    }
  };

  // Click handler
  const handleClick = () => {
    if (!disabled) {
      fileInputRef.current?.click();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      handleFiles(e.target.files);
    }
  };

  // Renderizar status da imagem
  const renderImageStatus = (image: UploadedImage) => {
    switch (image.status) {
      case 'uploading':
      case 'processing':
        return (
          <div className="absolute inset-0 bg-black bg-opacity-50 flex flex-col items-center justify-center">
            <Progress value={image.progress} className="w-16 mb-2" />
            <Badge variant="secondary" className="text-xs">
              {image.status === 'uploading' ? 'Enviando...' : 'Processando...'}
            </Badge>
          </div>
        );
      case 'awaiting-crop':
        return (
          <div className="absolute inset-0 bg-blue-500 bg-opacity-50 flex flex-col items-center justify-center">
            <Progress value={image.progress} className="w-16 mb-2" />
            <Badge variant="secondary" className="text-xs">
              Aguardando crop...
            </Badge>
          </div>
        );
      case 'error':
        return (
          <div className="absolute inset-0 bg-red-500 bg-opacity-50 flex items-center justify-center">
            <AlertCircle className="h-6 w-6 text-white" />
          </div>
        );
      case 'cropped':
        return (
          <div className="absolute top-1 right-1">
            <Badge variant="outline" className="text-xs bg-green-100 border-green-300 text-green-700">
              <Check className="h-3 w-3 mr-1" />
              Cropado
            </Badge>
          </div>
        );
      case 'ready':
        return (
          <div className="absolute top-1 right-1">
            <Badge variant="default" className="text-xs">
              <Check className="h-3 w-3 mr-1" />
              Pronto
            </Badge>
          </div>
        );
      default:
        return null;
    }
  };

  // Se estamos no modo crop
  if (cropImage) {
    return (
      <ImageCropper
        imageUrl={cropImage.tempUrl!}
        onCropComplete={handleCropComplete}
        onCancel={handleCropCancel}
        aspectRatio={aspectRatio}
      />
    );
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Área de upload */}
      <Card
        className={`border-2 border-dashed transition-colors cursor-pointer ${
          dragOver
            ? 'border-blue-500 bg-blue-50'
            : disabled
              ? 'border-gray-200 bg-gray-50'
              : 'border-gray-300 hover:border-gray-400'
        }`}
      >
        <CardContent
          className="p-6 text-center"
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={handleClick}
        >
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
            disabled={disabled}
          />

          <div className="flex flex-col items-center gap-2">
            <div className="p-3 bg-gray-100 rounded-full">
              <Upload className="h-8 w-8 text-gray-400" />
            </div>

            <div>
              <p className="text-lg font-medium">
                {disabled ? 'Upload desabilitado' : 'Envie suas imagens'}
              </p>
              <p className="text-sm text-gray-500">
                Arraste e solte ou clique para selecionar
              </p>
              <p className="text-xs text-gray-400 mt-1">
                JPEG, PNG, GIF até 10MB • Máx. {maxImages} imagens
              </p>
            </div>

            {images.length < maxImages && !disabled && (
              <Button variant="outline" size="sm" className="mt-2">
                <Plus className="h-4 w-4 mr-1" />
                Adicionar Imagens
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Grid de imagens */}
      {images.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {images.map((image) => (
            <Card key={image.id} className="relative group">
              <CardContent className="p-2">
                <div className="relative aspect-square">
                  {/* Thumbnail */}
                  <div className="w-full h-full bg-gray-100 rounded-lg overflow-hidden">
                    {/* Priorizar previewUrl (local crop), depois processedUrls (banco), depois tempUrl (original) */}
                    {image.previewUrl ? (
                      <img
                        src={image.previewUrl}
                        alt="Prévia cropada"
                        className="w-full h-full object-cover"
                      />
                    ) : image.processedUrls?.thumbnail ? (
                      <img
                        src={image.processedUrls.thumbnail}
                        alt="Produto"
                        className="w-full h-full object-cover"
                      />
                    ) : image.tempUrl ? (
                      <img
                        src={image.tempUrl}
                        alt="Preview"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <FileImage className="h-8 w-8 text-gray-400" />
                      </div>
                    )}
                  </div>

                  {/* Status overlay */}
                  {renderImageStatus(image)}

                  {/* Controles */}
                  {image.status === 'ready' && (
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
                      <div className="flex gap-1">
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => editImage(image)}
                        >
                          <Edit3 className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => removeImage(image.id)}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Info */}
      {images.length > 0 && (
        <div className="text-sm text-gray-500 text-center">
          {images.length} de {maxImages} imagens
          {aspectRatio && ` • Proporção ${aspectRatio === 1 ? '1:1' : `${aspectRatio}:1`}`}
        </div>
      )}
    </div>
  );
});

ImageUpload.displayName = 'ImageUpload';