'use client';

import React, { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Upload, 
  Edit3, 
  Move, 
  Trash2, 
  Image as ImageIcon,
  Loader,
  AlertCircle,
  Settings,
  Eye,
  EyeOff
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface ImageSize {
  width: number;
  height: number;
}

interface ImageStyles {
  borderRadius?: string;
  opacity?: number;
  filter?: string;
  objectFit?: 'cover' | 'contain' | 'fill' | 'scale-down' | 'none';
  border?: string;
  shadow?: string;
}

interface ImageProps {
  id?: string;
  src?: string;
  alt?: string;
  size?: ImageSize;
  styles?: ImageStyles;
  className?: string;
  isSelected?: boolean;
  isBuilder?: boolean;
  onUpdate?: (src: string, alt: string, size?: ImageSize, styles?: ImageStyles) => void;
  onResize?: (size: ImageSize) => void;
  onDelete?: () => void;
  loading?: boolean;
  error?: string;
  placeholder?: string;
  maxSize?: number; // Max file size in MB
  acceptedFormats?: string[];
}

interface UploadState {
  isUploading: boolean;
  progress: number;
  error: string | null;
}

export const Image: React.FC<ImageProps> = ({
  id,
  src,
  alt = '',
  size = { width: 300, height: 200 },
  styles = {},
  className = '',
  isSelected = false,
  isBuilder = false,
  onUpdate,
  onResize,
  onDelete,
  loading = false,
  error,
  placeholder = 'Click to upload image',
  maxSize = 10,
  acceptedFormats = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
}) => {
  const [uploadState, setUploadState] = useState<UploadState>({
    isUploading: false,
    progress: 0,
    error: null
  });
  const [showControls, setShowControls] = useState(false);
  const [isEditingAlt, setIsEditingAlt] = useState(false);
  const [editAlt, setEditAlt] = useState(alt);
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);

  // Upload functionality
  const handleFileSelect = useCallback(async (file: File) => {
    if (!file || !isBuilder) return;

    // Validate file
    if (!acceptedFormats.includes(file.type)) {
      setUploadState(prev => ({
        ...prev,
        error: `Unsupported format. Please use: ${acceptedFormats.join(', ')}`
      }));
      return;
    }

    if (file.size > maxSize * 1024 * 1024) {
      setUploadState(prev => ({
        ...prev,
        error: `File too large. Maximum size: ${maxSize}MB`
      }));
      return;
    }

    setUploadState({
      isUploading: true,
      progress: 0,
      error: null
    });

    try {
      const formData = new FormData();
      formData.append('image', file);
      formData.append('alt', alt || file.name.split('.')[0]);

      // Create preview URL immediately
      const previewUrl = URL.createObjectURL(file);
      
      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadState(prev => ({
          ...prev,
          progress: Math.min(prev.progress + 10, 90)
        }));
      }, 200);

      // TODO: Replace with actual backend endpoint
      const response = await fetch('/api/upload/image', {
        method: 'POST',
        body: formData,
        headers: {
          'Authorization': `Bearer ${typeof window !== 'undefined' ? localStorage.getItem('auth_token') || '' : ''}`
        }
      });

      clearInterval(progressInterval);

      if (!response.ok) {
        // For now, use the preview URL as fallback
        console.warn('Backend upload failed, using local preview');
        setUploadState({ isUploading: false, progress: 100, error: null });
        onUpdate?.(previewUrl, alt, size, styles);
        return;
      }

      const data = await response.json();
      
      if (data.success) {
        setUploadState({ isUploading: false, progress: 100, error: null });
        onUpdate?.(data.url, alt, size, styles);
        URL.revokeObjectURL(previewUrl);
      } else {
        throw new Error(data.message || 'Upload failed');
      }

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Upload failed';
      setUploadState({
        isUploading: false,
        progress: 0,
        error: errorMessage
      });
      
      // For development, use local preview on error
      if (file) {
        const previewUrl = URL.createObjectURL(file);
        onUpdate?.(previewUrl, alt, size, styles);
        setUploadState({ isUploading: false, progress: 100, error: null });
      }
    }
  }, [alt, size, styles, onUpdate, isBuilder, acceptedFormats, maxSize]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (!isBuilder) return;
    
    const files = Array.from(e.dataTransfer.files);
    const imageFile = files.find(file => acceptedFormats.includes(file.type));
    
    if (imageFile) {
      handleFileSelect(imageFile);
    }
  }, [handleFileSelect, isBuilder, acceptedFormats]);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  }, [handleFileSelect]);

  // Alt text editing
  const handleAltSave = useCallback(() => {
    setIsEditingAlt(false);
    if (editAlt !== alt) {
      onUpdate?.(src || '', editAlt, size, styles);
    }
  }, [editAlt, alt, src, size, styles, onUpdate]);

  const handleAltCancel = useCallback(() => {
    setIsEditingAlt(false);
    setEditAlt(alt);
  }, [alt]);

  // Resize functionality
  const handleResizeStart = useCallback(() => {
    setIsResizing(true);
  }, []);

  const handleResizeEnd = useCallback(() => {
    setIsResizing(false);
  }, []);

  const handleResize = useCallback((newSize: ImageSize) => {
    onResize?.(newSize);
    onUpdate?.(src || '', alt, newSize, styles);
  }, [src, alt, styles, onResize, onUpdate]);

  // Style updates
  const updateStyles = useCallback((newStyles: Partial<ImageStyles>) => {
    const updatedStyles = { ...styles, ...newStyles };
    onUpdate?.(src || '', alt, size, updatedStyles);
  }, [src, alt, size, styles, onUpdate]);

  const imageStyles = {
    width: size.width,
    height: size.height,
    borderRadius: styles.borderRadius || '0px',
    opacity: styles.opacity ?? 1,
    filter: styles.filter || 'none',
    objectFit: styles.objectFit || 'cover',
    border: styles.border || 'none',
    boxShadow: styles.shadow || 'none',
  };

  if (!src && !isBuilder) {
    return null;
  }

  if (!src && isBuilder) {
    // Upload placeholder
    return (
      <div
        className={cn(
          'relative border-2 border-dashed rounded-lg transition-all cursor-pointer group',
          isDragging 
            ? 'border-blue-500 bg-blue-50' 
            : 'border-gray-300 hover:border-gray-400',
          isSelected && 'ring-2 ring-blue-500',
          className
        )}
        style={{ width: size.width, height: size.height }}
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
        onDragEnter={() => setIsDragging(true)}
        onDragLeave={() => setIsDragging(false)}
        onClick={() => fileInputRef.current?.click()}
      >
        <div className="absolute inset-0 flex flex-col items-center justify-center p-4">
          {uploadState.isUploading ? (
            <div className="text-center space-y-3">
              <Loader className="w-8 h-8 text-blue-500 animate-spin mx-auto" />
              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-700">Uploading...</p>
                <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-blue-500 transition-all duration-300"
                    style={{ width: `${uploadState.progress}%` }}
                  />
                </div>
                <p className="text-xs text-gray-500">{uploadState.progress}%</p>
              </div>
            </div>
          ) : uploadState.error ? (
            <div className="text-center space-y-2">
              <AlertCircle className="w-8 h-8 text-red-500 mx-auto" />
              <p className="text-sm text-red-600">{uploadState.error}</p>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setUploadState(prev => ({ ...prev, error: null }));
                }}
                className="text-xs text-red-500 underline"
              >
                Try again
              </button>
            </div>
          ) : (
            <div className="text-center space-y-2">
              <Upload className="w-8 h-8 text-gray-400 mx-auto group-hover:text-gray-600 transition-colors" />
              <p className="text-sm font-medium text-gray-600">{placeholder}</p>
              <p className="text-xs text-gray-400">
                {acceptedFormats.map(f => f.split('/')[1].toUpperCase()).join(', ')} • Max {maxSize}MB
              </p>
            </div>
          )}
        </div>
        
        <input
          ref={fileInputRef}
          type="file"
          accept={acceptedFormats.join(',')}
          onChange={handleFileInput}
          className="hidden"
        />
      </div>
    );
  }

  return (
    <div
      className={cn(
        'relative group transition-all',
        isSelected && isBuilder && 'ring-2 ring-blue-500',
        className
      )}
      style={{ width: size.width, height: size.height }}
      onMouseEnter={() => isBuilder && setShowControls(true)}
      onMouseLeave={() => isBuilder && setShowControls(false)}
    >
      {/* Image */}
      <img
        ref={imageRef}
        src={src}
        alt={alt}
        style={imageStyles}
        className={cn(
          'transition-all duration-200',
          isBuilder && 'cursor-pointer',
          loading && 'opacity-50'
        )}
        loading="lazy"
      />

      {/* Builder Controls */}
      {isBuilder && showControls && isSelected && (
        <div className="absolute inset-0 pointer-events-none">
          {/* Control Panel */}
          <div className="absolute -top-10 left-0 bg-white border border-gray-200 rounded-lg shadow-lg p-2 flex items-center gap-1 pointer-events-auto">
            {/* Upload new image */}
            <button
              onClick={() => fileInputRef.current?.click()}
              className="p-1.5 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
              title="Change image"
            >
              <Upload className="w-4 h-4" />
            </button>

            {/* Edit alt text */}
            <button
              onClick={() => setIsEditingAlt(true)}
              className="p-1.5 text-gray-600 hover:text-green-600 hover:bg-green-50 rounded transition-colors"
              title="Edit alt text"
            >
              <Edit3 className="w-4 h-4" />
            </button>

            {/* Move */}
            <button
              className="p-1.5 text-gray-600 hover:text-purple-600 hover:bg-purple-50 rounded transition-colors cursor-move"
              title="Move image"
            >
              <Move className="w-4 h-4" />
            </button>

            {/* Delete */}
            <button
              onClick={onDelete}
              className="p-1.5 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
              title="Delete image"
            >
              <Trash2 className="w-4 h-4" />
            </button>

            {/* Styles toggle */}
            <button
              onClick={() => updateStyles({ opacity: styles.opacity === 0.5 ? 1 : 0.5 })}
              className="p-1.5 text-gray-600 hover:text-orange-600 hover:bg-orange-50 rounded transition-colors"
              title="Toggle opacity"
            >
              {styles.opacity === 0.5 ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>

          {/* Resize Handles */}
          {!isResizing && (
            <>
              {/* Corner handles */}
              <div className="absolute -top-1 -left-1 w-3 h-3 bg-blue-500 border border-white rounded-full cursor-nw-resize pointer-events-auto" />
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-blue-500 border border-white rounded-full cursor-ne-resize pointer-events-auto" />
              <div className="absolute -bottom-1 -left-1 w-3 h-3 bg-blue-500 border border-white rounded-full cursor-sw-resize pointer-events-auto" />
              <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-blue-500 border border-white rounded-full cursor-se-resize pointer-events-auto" />
            </>
          )}
        </div>
      )}

      {/* Alt Text Editor */}
      <AnimatePresence>
        {isEditingAlt && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center z-10"
          >
            <div className="bg-white rounded-lg p-4 shadow-xl min-w-[300px]">
              <h4 className="font-medium text-gray-900 mb-3">Edit Alt Text</h4>
              <textarea
                value={editAlt}
                onChange={(e) => setEditAlt(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows={3}
                placeholder="Describe this image for accessibility..."
                autoFocus
              />
              <div className="flex gap-2 mt-3">
                <button
                  onClick={handleAltSave}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Save
                </button>
                <button
                  onClick={handleAltCancel}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept={acceptedFormats.join(',')}
        onChange={handleFileInput}
        className="hidden"
      />

      {/* Loading overlay */}
      {loading && (
        <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center">
          <Loader className="w-6 h-6 text-blue-500 animate-spin" />
        </div>
      )}
    </div>
  );
};

// Simpler image component for basic use cases
export const SimpleImage: React.FC<{
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  objectFit?: 'cover' | 'contain' | 'fill';
}> = ({ 
  src, 
  alt, 
  width = 300, 
  height = 200, 
  className = '',
  objectFit = 'cover'
}) => {
  return (
    <img
      src={src}
      alt={alt}
      className={cn('transition-all duration-200', className)}
      style={{
        width,
        height,
        objectFit
      }}
      loading="lazy"
    />
  );
};

// Gallery component for multiple images
export const ImageGallery: React.FC<{
  images: Array<{ src: string; alt: string; id?: string }>;
  columns?: number;
  gap?: number;
  aspectRatio?: string;
  onImageClick?: (image: { src: string; alt: string; id?: string }, index: number) => void;
  className?: string;
}> = ({ 
  images, 
  columns = 3, 
  gap = 16, 
  aspectRatio = '1/1',
  onImageClick,
  className = ''
}) => {
  return (
    <div 
      className={cn('grid', className)}
      style={{
        gridTemplateColumns: `repeat(${columns}, 1fr)`,
        gap: `${gap}px`
      }}
    >
      {images.map((image, index) => (
        <div
          key={image.id || index}
          className="relative overflow-hidden rounded-lg cursor-pointer group hover:scale-105 transition-transform duration-200"
          style={{ aspectRatio }}
          onClick={() => onImageClick?.(image, index)}
        >
          <img
            src={image.src}
            alt={image.alt}
            className="w-full h-full object-cover"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-200" />
        </div>
      ))}
    </div>
  );
};