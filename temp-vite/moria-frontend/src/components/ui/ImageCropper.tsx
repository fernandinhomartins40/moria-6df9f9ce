import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Button } from './button';
import { Slider } from './slider';
import { Card, CardContent, CardHeader, CardTitle } from './card';
import { Badge } from './badge';
import { ZoomIn, ZoomOut, RotateCcw, Move, Crop, Check, X } from 'lucide-react';

interface CropData {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface ImageCropperProps {
  imageUrl: string;
  onCropComplete: (cropData: CropData) => void;
  onCancel: () => void;
  aspectRatio?: number; // null para livre, ou número como 1 para 1:1
  minCropSize?: number;
  maxWidth?: number;
  maxHeight?: number;
}

export function ImageCropper({
  imageUrl,
  onCropComplete,
  onCancel,
  aspectRatio = null,
  minCropSize = 50,
  maxWidth = 800,
  maxHeight = 600
}: ImageCropperProps) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageSize, setImageSize] = useState({ width: 0, height: 0 });
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [cropArea, setCropArea] = useState<CropData>({ x: 0, y: 0, width: 200, height: 200 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [resizing, setResizing] = useState<string | null>(null);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Carregar imagem
  useEffect(() => {
    const img = new Image();

    // Só definir crossOrigin para URLs externas, não para blob URLs locais
    if (!imageUrl.startsWith('blob:')) {
      img.crossOrigin = 'anonymous';
    }

    img.onload = () => {
      console.log('Imagem carregada no cropper:', imageUrl);

      // Usar dimensões padrão se container não estiver disponível
      let containerWidth = maxWidth || 800;
      let containerHeight = maxHeight || 600;

      const container = containerRef.current;
      if (container && container.clientWidth > 0 && container.clientHeight > 0) {
        containerWidth = Math.min(maxWidth, container.clientWidth);
        containerHeight = Math.min(maxHeight, container.clientHeight);
      }

      console.log('Dimensões do container:', { containerWidth, containerHeight });

      // Calcular tamanho para caber no container
      const imgAspect = img.naturalWidth / img.naturalHeight;
      const containerAspect = containerWidth / containerHeight;

      let displayWidth, displayHeight;
      if (imgAspect > containerAspect) {
        displayWidth = containerWidth;
        displayHeight = containerWidth / imgAspect;
      } else {
        displayHeight = containerHeight;
        displayWidth = containerHeight * imgAspect;
      }

      console.log('Dimensões calculadas:', { displayWidth, displayHeight });

      setImageSize({
        width: displayWidth,
        height: displayHeight
      });

      // Centralizar crop inicial
      const initialCropSize = Math.min(displayWidth, displayHeight) * 0.6;
      setCropArea({
        x: (displayWidth - initialCropSize) / 2,
        y: (displayHeight - initialCropSize) / 2,
        width: initialCropSize,
        height: aspectRatio ? initialCropSize : initialCropSize
      });

      console.log('Crop inicial:', {
        x: (displayWidth - initialCropSize) / 2,
        y: (displayHeight - initialCropSize) / 2,
        width: initialCropSize,
        height: aspectRatio ? initialCropSize : initialCropSize
      });

      setImageLoaded(true);
    };

    img.onerror = () => {
      console.error('Erro ao carregar imagem no cropper:', imageUrl);
      // Ainda assim marca como carregada para mostrar uma mensagem de erro
      setImageLoaded(true);
    };

    img.src = imageUrl;
  }, [imageUrl, maxWidth, maxHeight, aspectRatio]);

  // Aplicar crop com aspect ratio
  const applyCropConstraints = useCallback((newCrop: CropData) => {
    if (aspectRatio) {
      // Manter aspect ratio
      newCrop.height = newCrop.width / aspectRatio;
    }

    // Limitar ao tamanho mínimo
    newCrop.width = Math.max(minCropSize, newCrop.width);
    newCrop.height = Math.max(minCropSize, newCrop.height);

    // Limitar aos bounds da imagem
    newCrop.width = Math.min(newCrop.width, imageSize.width - newCrop.x);
    newCrop.height = Math.min(newCrop.height, imageSize.height - newCrop.y);

    // Ajustar posição se crop sair dos bounds
    newCrop.x = Math.max(0, Math.min(newCrop.x, imageSize.width - newCrop.width));
    newCrop.y = Math.max(0, Math.min(newCrop.y, imageSize.height - newCrop.height));

    return newCrop;
  }, [aspectRatio, minCropSize, imageSize]);

  // Handlers de mouse
  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;

    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Verificar se clicou em algum handle de resize
    const handles = getResizeHandles();
    const clickedHandle = handles.find(handle =>
      x >= handle.x - 5 && x <= handle.x + 15 &&
      y >= handle.y - 5 && y <= handle.y + 15
    );

    if (clickedHandle) {
      setResizing(clickedHandle.cursor);
      setDragStart({ x, y });
      return;
    }

    // Verificar se clicou dentro da área de crop para mover
    if (x >= cropArea.x && x <= cropArea.x + cropArea.width &&
        y >= cropArea.y && y <= cropArea.y + cropArea.height) {
      setIsDragging(true);
      setDragStart({
        x: x - cropArea.x,
        y: y - cropArea.y
      });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;

    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    if (resizing) {
      handleResize(x, y);
    } else if (isDragging) {
      const newCrop = {
        ...cropArea,
        x: Math.max(0, Math.min(x - dragStart.x, imageSize.width - cropArea.width)),
        y: Math.max(0, Math.min(y - dragStart.y, imageSize.height - cropArea.height))
      };
      setCropArea(newCrop);
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    setResizing(null);
  };

  // Resize handlers
  const handleResize = (mouseX: number, mouseY: number) => {
    const newCrop = { ...cropArea };

    switch (resizing) {
      case 'nw-resize': // Top-left
        const deltaX = mouseX - dragStart.x;
        const deltaY = mouseY - dragStart.y;
        newCrop.x += deltaX;
        newCrop.y += deltaY;
        newCrop.width -= deltaX;
        newCrop.height -= deltaY;
        break;
      case 'ne-resize': // Top-right
        newCrop.width = mouseX - cropArea.x;
        newCrop.height = cropArea.height - (mouseY - dragStart.y);
        newCrop.y += mouseY - dragStart.y;
        break;
      case 'sw-resize': // Bottom-left
        newCrop.width = cropArea.width - (mouseX - dragStart.x);
        newCrop.height = mouseY - cropArea.y;
        newCrop.x += mouseX - dragStart.x;
        break;
      case 'se-resize': // Bottom-right
        newCrop.width = mouseX - cropArea.x;
        newCrop.height = mouseY - cropArea.y;
        break;
    }

    setCropArea(applyCropConstraints(newCrop));
  };

  // Obter handles de resize
  const getResizeHandles = () => {
    return [
      { x: cropArea.x, y: cropArea.y, cursor: 'nw-resize' },
      { x: cropArea.x + cropArea.width, y: cropArea.y, cursor: 'ne-resize' },
      { x: cropArea.x, y: cropArea.y + cropArea.height, cursor: 'sw-resize' },
      { x: cropArea.x + cropArea.width, y: cropArea.y + cropArea.height, cursor: 'se-resize' }
    ];
  };

  // Zoom handlers
  const handleZoomChange = (newScale: number[]) => {
    setScale(newScale[0]);
  };

  const zoomIn = () => setScale(prev => Math.min(prev + 0.1, 3));
  const zoomOut = () => setScale(prev => Math.max(prev - 0.1, 0.5));
  const resetZoom = () => {
    setScale(1);
    setPosition({ x: 0, y: 0 });
  };

  // Desenhar canvas
  useEffect(() => {
    if (!imageLoaded || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = imageSize.width;
    canvas.height = imageSize.height;

    // Limpar canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Desenhar imagem
    const img = new Image();

    // Só definir crossOrigin para URLs externas, não para blob URLs locais
    if (!imageUrl.startsWith('blob:')) {
      img.crossOrigin = 'anonymous';
    }

    img.onload = () => {
      // Aplicar transformações
      ctx.save();
      ctx.translate(position.x, position.y);
      ctx.scale(scale, scale);

      ctx.drawImage(img, 0, 0, imageSize.width, imageSize.height);
      ctx.restore();

      // Desenhar overlay escuro
      ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Recortar área de crop
      ctx.globalCompositeOperation = 'destination-out';
      ctx.fillRect(cropArea.x, cropArea.y, cropArea.width, cropArea.height);
      ctx.globalCompositeOperation = 'source-over';

      // Desenhar borda do crop
      ctx.strokeStyle = '#3b82f6';
      ctx.lineWidth = 2;
      ctx.strokeRect(cropArea.x, cropArea.y, cropArea.width, cropArea.height);

      // Desenhar handles de resize
      const handles = getResizeHandles();
      handles.forEach(handle => {
        ctx.fillStyle = '#3b82f6';
        ctx.fillRect(handle.x - 5, handle.y - 5, 10, 10);
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1;
        ctx.strokeRect(handle.x - 5, handle.y - 5, 10, 10);
      });

      // Desenhar grid
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
      ctx.lineWidth = 1;
      for (let i = 1; i < 3; i++) {
        const x = cropArea.x + (cropArea.width / 3) * i;
        const y = cropArea.y + (cropArea.height / 3) * i;
        ctx.beginPath();
        ctx.moveTo(x, cropArea.y);
        ctx.lineTo(x, cropArea.y + cropArea.height);
        ctx.moveTo(cropArea.x, y);
        ctx.lineTo(cropArea.x + cropArea.width, y);
        ctx.stroke();
      }
    };
    img.src = imageUrl;
  }, [imageLoaded, imageSize, scale, position, cropArea, imageUrl]);

  // Aplicar crop
  const handleApplyCrop = () => {
    // Converter coordenadas para imagem original
    const img = imageRef.current || new Image();

    // Só definir crossOrigin para URLs externas, não para blob URLs locais
    if (!imageUrl.startsWith('blob:')) {
      img.crossOrigin = 'anonymous';
    }

    img.onload = () => {
      const scaleX = img.naturalWidth / imageSize.width;
      const scaleY = img.naturalHeight / imageSize.height;

      const finalCrop: CropData = {
        x: Math.round(cropArea.x * scaleX / scale),
        y: Math.round(cropArea.y * scaleY / scale),
        width: Math.round(cropArea.width * scaleX / scale),
        height: Math.round(cropArea.height * scaleY / scale)
      };

      onCropComplete(finalCrop);
    };
    img.src = imageUrl;
  };

  if (!imageLoaded) {
    return (
      <Card className="w-full">
        <CardContent className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-2"></div>
            <p>Carregando imagem...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Crop className="h-5 w-5" />
          Editor de Imagem
          {aspectRatio && (
            <Badge variant="outline">
              {aspectRatio === 1 ? '1:1' : `${aspectRatio}:1`}
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Controles */}
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={zoomOut}>
              <ZoomOut className="h-4 w-4" />
            </Button>
            <div className="w-24">
              <Slider
                value={[scale]}
                onValueChange={handleZoomChange}
                min={0.5}
                max={3}
                step={0.1}
              />
            </div>
            <Button variant="outline" size="sm" onClick={zoomIn}>
              <ZoomIn className="h-4 w-4" />
            </Button>
            <span className="text-sm text-gray-500">{Math.round(scale * 100)}%</span>
          </div>

          <Button variant="outline" size="sm" onClick={resetZoom}>
            <RotateCcw className="h-4 w-4 mr-1" />
            Resetar
          </Button>
        </div>

        {/* Canvas de edição */}
        <div
          ref={containerRef}
          className="relative border border-gray-200 rounded-lg overflow-hidden bg-gray-50"
          style={{ maxWidth: maxWidth, maxHeight: maxHeight }}
        >
          <canvas
            ref={canvasRef}
            className="block cursor-move"
            style={{
              cursor: resizing ? resizing : isDragging ? 'grabbing' : 'grab'
            }}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
          />
        </div>

        {/* Informações do crop */}
        <div className="text-sm text-gray-500 space-y-1">
          <div className="flex gap-4">
            <span>Posição: {Math.round(cropArea.x)}, {Math.round(cropArea.y)}</span>
            <span>Tamanho: {Math.round(cropArea.width)} × {Math.round(cropArea.height)}</span>
          </div>
          <p className="text-xs">
            <Move className="inline h-3 w-3 mr-1" />
            Arraste para mover • Use os cantos para redimensionar • Scroll para zoom
          </p>
        </div>

        {/* Botões de ação */}
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={onCancel}>
            <X className="h-4 w-4 mr-1" />
            Cancelar
          </Button>
          <Button onClick={handleApplyCrop}>
            <Check className="h-4 w-4 mr-1" />
            Aplicar Crop
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}