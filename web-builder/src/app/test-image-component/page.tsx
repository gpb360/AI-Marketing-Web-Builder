'use client';

import React, { useState } from 'react';
import { Image, SimpleImage, ImageGallery } from '@/components/templates/core';

export default function TestImageComponent() {
  const [mainImage, setMainImage] = useState({
    src: 'https://via.placeholder.com/400x300/3b82f6/ffffff?text=Test+Image',
    alt: 'Test image for image component demo',
    size: { width: 400, height: 300 }
  });

  const [galleryImages] = useState([
    { id: '1', src: 'https://via.placeholder.com/300x200/ef4444/ffffff?text=Gallery+1', alt: 'Gallery image 1' },
    { id: '2', src: 'https://via.placeholder.com/300x200/10b981/ffffff?text=Gallery+2', alt: 'Gallery image 2' },
    { id: '3', src: 'https://via.placeholder.com/300x200/f59e0b/ffffff?text=Gallery+3', alt: 'Gallery image 3' },
    { id: '4', src: 'https://via.placeholder.com/300x200/8b5cf6/ffffff?text=Gallery+4', alt: 'Gallery image 4' },
    { id: '5', src: 'https://via.placeholder.com/300x200/06b6d4/ffffff?text=Gallery+5', alt: 'Gallery image 5' },
    { id: '6', src: 'https://via.placeholder.com/300x200/f97316/ffffff?text=Gallery+6', alt: 'Gallery image 6' }
  ]);

  const handleImageUpdate = (src: string, alt: string, size?: any, styles?: any) => {
    console.log('Image updated:', { src, alt, size, styles });
    setMainImage(prev => ({ ...prev, src, alt, size: size || prev.size }));
  };

  const handleImageResize = (size: any) => {
    console.log('Image resized:', size);
    setMainImage(prev => ({ ...prev, size }));
  };

  const handleImageDelete = () => {
    console.log('Image deleted');
    setMainImage(prev => ({ ...prev, src: '' }));
  };

  const handleGalleryImageClick = (image: any, index: number) => {
    console.log('Gallery image clicked:', image, index);
    alert(`Clicked on ${image.alt} (index: ${index})`);
  };

  return (
    <div className="p-8 space-y-12 max-w-6xl mx-auto">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Image Component Test Suite</h1>
        <p className="text-lg text-gray-600">Testing all Image component variants and features</p>
      </div>

      {/* Main Image Component - Builder Mode */}
      <section className="space-y-6">
        <div className="border-b border-gray-200 pb-4">
          <h2 className="text-2xl font-semibold text-gray-800">Main Image Component (Builder Mode)</h2>
          <p className="text-gray-600 mt-2">Full-featured image component with upload, resize, and editing capabilities</p>
        </div>
        
        <div className="bg-gray-50 p-8 rounded-lg">
          <div className="flex justify-center">
            <Image
              id="main-image"
              src={mainImage.src}
              alt={mainImage.alt}
              size={mainImage.size}
              isBuilder={true}
              isSelected={true}
              onUpdate={handleImageUpdate}
              onResize={handleImageResize}
              onDelete={handleImageDelete}
              acceptedFormats={['image/jpeg', 'image/png', 'image/webp', 'image/gif']}
              maxSize={10}
              placeholder="Upload your image here"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Upload Area Test */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-700">Upload Test</h3>
            <Image
              id="upload-test"
              isBuilder={true}
              isSelected={true}
              onUpdate={(src, alt) => console.log('Upload test:', { src, alt })}
              size={{ width: 200, height: 150 }}
              placeholder="Drop image here"
            />
          </div>

          {/* Style Variants */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-700">Rounded Style</h3>
            <Image
              src="https://via.placeholder.com/200x150/6366f1/ffffff?text=Rounded"
              alt="Rounded image example"
              size={{ width: 200, height: 150 }}
              styles={{ borderRadius: '12px', border: '2px solid #6366f1' }}
              isBuilder={true}
              isSelected={false}
            />
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-700">Shadow Style</h3>
            <Image
              src="https://via.placeholder.com/200x150/ec4899/ffffff?text=Shadow"
              alt="Shadow image example"
              size={{ width: 200, height: 150 }}
              styles={{ 
                borderRadius: '8px', 
                shadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)' 
              }}
              isBuilder={true}
              isSelected={false}
            />
          </div>
        </div>
      </section>

      {/* Simple Image Component */}
      <section className="space-y-6">
        <div className="border-b border-gray-200 pb-4">
          <h2 className="text-2xl font-semibold text-gray-800">Simple Image Component</h2>
          <p className="text-gray-600 mt-2">Lightweight image component for basic display</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center space-y-4">
            <h3 className="text-lg font-medium text-gray-700">Cover (Default)</h3>
            <SimpleImage
              src="https://via.placeholder.com/250x150/14b8a6/ffffff?text=Cover"
              alt="Cover fit example"
              width={250}
              height={150}
              objectFit="cover"
              className="mx-auto rounded-lg"
            />
          </div>

          <div className="text-center space-y-4">
            <h3 className="text-lg font-medium text-gray-700">Contain</h3>
            <SimpleImage
              src="https://via.placeholder.com/250x150/f59e0b/ffffff?text=Contain"
              alt="Contain fit example"
              width={250}
              height={150}
              objectFit="contain"
              className="mx-auto rounded-lg border border-gray-200"
            />
          </div>

          <div className="text-center space-y-4">
            <h3 className="text-lg font-medium text-gray-700">Fill</h3>
            <SimpleImage
              src="https://via.placeholder.com/250x150/dc2626/ffffff?text=Fill"
              alt="Fill fit example"
              width={250}
              height={150}
              objectFit="fill"
              className="mx-auto rounded-lg"
            />
          </div>
        </div>
      </section>

      {/* Image Gallery Component */}
      <section className="space-y-6">
        <div className="border-b border-gray-200 pb-4">
          <h2 className="text-2xl font-semibold text-gray-800">Image Gallery Component</h2>
          <p className="text-gray-600 mt-2">Grid-based image gallery with hover effects and click handling</p>
        </div>

        <div className="space-y-8">
          {/* 3-column gallery */}
          <div>
            <h3 className="text-lg font-medium text-gray-700 mb-4">3-Column Gallery</h3>
            <ImageGallery
              images={galleryImages}
              columns={3}
              gap={16}
              aspectRatio="3/2"
              onImageClick={handleGalleryImageClick}
              className="mb-6"
            />
          </div>

          {/* 4-column gallery */}
          <div>
            <h3 className="text-lg font-medium text-gray-700 mb-4">4-Column Gallery (Square)</h3>
            <ImageGallery
              images={galleryImages}
              columns={4}
              gap={12}
              aspectRatio="1/1"
              onImageClick={handleGalleryImageClick}
            />
          </div>

          {/* 2-column gallery */}
          <div>
            <h3 className="text-lg font-medium text-gray-700 mb-4">2-Column Gallery (Wide)</h3>
            <ImageGallery
              images={galleryImages.slice(0, 4)}
              columns={2}
              gap={20}
              aspectRatio="16/9"
              onImageClick={handleGalleryImageClick}
            />
          </div>
        </div>
      </section>

      {/* Non-Builder Mode Examples */}
      <section className="space-y-6">
        <div className="border-b border-gray-200 pb-4">
          <h2 className="text-2xl font-semibold text-gray-800">Published Mode Examples</h2>
          <p className="text-gray-600 mt-2">How images appear on published sites (no builder controls)</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Image
            src="https://via.placeholder.com/300x200/8b5cf6/ffffff?text=Published+1"
            alt="Published mode example 1"
            size={{ width: 300, height: 200 }}
            isBuilder={false}
            styles={{ borderRadius: '8px' }}
          />

          <Image
            src="https://via.placeholder.com/300x200/06b6d4/ffffff?text=Published+2"
            alt="Published mode example 2"
            size={{ width: 300, height: 200 }}
            isBuilder={false}
            styles={{ 
              borderRadius: '12px',
              shadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
              border: '1px solid #e5e7eb'
            }}
          />

          <Image
            src="https://via.placeholder.com/300x200/f97316/ffffff?text=Published+3"
            alt="Published mode example 3"
            size={{ width: 300, height: 200 }}
            isBuilder={false}
            styles={{ 
              borderRadius: '20px',
              opacity: 0.9
            }}
          />
        </div>
      </section>

      {/* Feature Testing Instructions */}
      <section className="bg-blue-50 rounded-lg p-6">
        <h2 className="text-xl font-semibold text-blue-900 mb-4">Testing Instructions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
          <div>
            <h3 className="font-medium text-blue-800 mb-2">Builder Mode Features:</h3>
            <ul className="space-y-1 text-blue-700">
              <li>• Click upload areas to select files</li>
              <li>• Drag and drop images onto upload areas</li>
              <li>• Hover over images to see control toolbar</li>
              <li>• Click edit button to modify alt text</li>
              <li>• Use resize handles on image corners</li>
              <li>• Test upload with different file formats</li>
              <li>• Try uploading files larger than 10MB</li>
              <li>• Test drag operations with move button</li>
            </ul>
          </div>
          <div>
            <h3 className="font-medium text-blue-800 mb-2">Expected Behaviors:</h3>
            <ul className="space-y-1 text-blue-700">
              <li>• Upload progress indicator during file upload</li>
              <li>• Error messages for invalid files</li>
              <li>• Alt text modal opens when clicking edit</li>
              <li>• Controls only visible in builder mode</li>
              <li>• Gallery images respond to click events</li>
              <li>• Hover effects on gallery items</li>
              <li>• Responsive layout on mobile screens</li>
              <li>• Smooth animations and transitions</li>
            </ul>
          </div>
        </div>
      </section>
    </div>
  );
}