/**
 * Tests for Image Component
 * Validates image upload, editing, resize functionality, and gallery features.
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Image, SimpleImage, ImageGallery } from '../Image';

// Mock framer-motion
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  },
  AnimatePresence: ({ children }: any) => <div>{children}</div>,
}));

// Mock cn utility
jest.mock('@/lib/utils', () => ({
  cn: (...classes: any[]) => classes.filter(Boolean).join(' '),
}));

// Mock URL.createObjectURL and revokeObjectURL
Object.defineProperty(global, 'URL', {
  value: {
    createObjectURL: jest.fn(() => 'mock-blob-url'),
    revokeObjectURL: jest.fn(),
  },
  writable: true,
});

// Mock fetch for upload tests
global.fetch = jest.fn();

describe('Image Component', () => {
  const mockOnUpdate = jest.fn();
  const mockOnResize = jest.fn();
  const mockOnDelete = jest.fn();

  beforeEach(() => {
    mockOnUpdate.mockClear();
    mockOnResize.mockClear();
    mockOnDelete.mockClear();
    (global.fetch as jest.Mock).mockClear();
  });

  describe('Basic Image Component', () => {
    it('renders image with src correctly', () => {
      render(
        <Image
          src="test-image.jpg"
          alt="Test image"
          isBuilder={false}
        />
      );
      
      const image = screen.getByRole('img');
      expect(image).toBeInTheDocument();
      expect(image).toHaveAttribute('src', 'test-image.jpg');
      expect(image).toHaveAttribute('alt', 'Test image');
    });

    it('shows upload placeholder when no src in builder mode', () => {
      render(
        <Image
          isBuilder={true}
          isSelected={true}
          placeholder="Upload your image"
        />
      );
      
      expect(screen.getByText('Upload your image')).toBeInTheDocument();
      expect(screen.getByText(/JPG, PNG, WEBP, GIF/)).toBeInTheDocument();
    });

    it('does not render when no src in published mode', () => {
      const { container } = render(
        <Image
          isBuilder={false}
        />
      );
      
      expect(container.firstChild).toBeNull();
    });

    it('applies custom size and styles', () => {
      render(
        <Image
          src="test-image.jpg"
          alt="Test image"
          size={{ width: 400, height: 300 }}
          styles={{
            borderRadius: '12px',
            opacity: 0.8,
            border: '2px solid red'
          }}
          isBuilder={false}
        />
      );
      
      const image = screen.getByRole('img');
      expect(image).toHaveStyle({
        width: '400px',
        height: '300px',
        borderRadius: '12px',
        opacity: '0.8',
        border: '2px solid red'
      });
    });
  });

  describe('Builder Mode Features', () => {
    it('shows controls when selected and hovered in builder mode', async () => {
      render(
        <Image
          src="test-image.jpg"
          alt="Test image"
          isBuilder={true}
          isSelected={true}
          onUpdate={mockOnUpdate}
          onDelete={mockOnDelete}
        />
      );
      
      const container = screen.getByRole('img').parentElement;
      fireEvent.mouseEnter(container!);
      
      await waitFor(() => {
        expect(screen.getByTitle('Change image')).toBeInTheDocument();
        expect(screen.getByTitle('Edit alt text')).toBeInTheDocument();
        expect(screen.getByTitle('Move image')).toBeInTheDocument();
        expect(screen.getByTitle('Delete image')).toBeInTheDocument();
      });
    });

    it('opens alt text editor when edit button clicked', async () => {
      render(
        <Image
          src="test-image.jpg"
          alt="Original alt text"
          isBuilder={true}
          isSelected={true}
          onUpdate={mockOnUpdate}
        />
      );
      
      const container = screen.getByRole('img').parentElement;
      fireEvent.mouseEnter(container!);
      
      await waitFor(() => {
        const editButton = screen.getByTitle('Edit alt text');
        fireEvent.click(editButton);
      });
      
      expect(screen.getByText('Edit Alt Text')).toBeInTheDocument();
      expect(screen.getByDisplayValue('Original alt text')).toBeInTheDocument();
    });

    it('calls onUpdate when alt text is saved', async () => {
      render(
        <Image
          src="test-image.jpg"
          alt="Original alt text"
          isBuilder={true}
          isSelected={true}
          onUpdate={mockOnUpdate}
        />
      );
      
      const container = screen.getByRole('img').parentElement;
      fireEvent.mouseEnter(container!);
      
      await waitFor(() => {
        const editButton = screen.getByTitle('Edit alt text');
        fireEvent.click(editButton);
      });
      
      const textarea = screen.getByDisplayValue('Original alt text');
      fireEvent.change(textarea, { target: { value: 'New alt text' } });
      
      const saveButton = screen.getByText('Save');
      fireEvent.click(saveButton);
      
      expect(mockOnUpdate).toHaveBeenCalledWith(
        'test-image.jpg',
        'New alt text',
        expect.any(Object),
        expect.any(Object)
      );
    });

    it('calls onDelete when delete button clicked', async () => {
      render(
        <Image
          src="test-image.jpg"
          alt="Test image"
          isBuilder={true}
          isSelected={true}
          onDelete={mockOnDelete}
        />
      );
      
      const container = screen.getByRole('img').parentElement;
      fireEvent.mouseEnter(container!);
      
      await waitFor(() => {
        const deleteButton = screen.getByTitle('Delete image');
        fireEvent.click(deleteButton);
      });
      
      expect(mockOnDelete).toHaveBeenCalled();
    });

    it('shows resize handles when selected', () => {
      render(
        <Image
          src="test-image.jpg"
          alt="Test image"
          isBuilder={true}
          isSelected={true}
        />
      );
      
      const container = screen.getByRole('img').parentElement;
      fireEvent.mouseEnter(container!);
      
      // Check for resize handles (corner dots)
      const handles = container!.querySelectorAll('.cursor-nw-resize, .cursor-ne-resize, .cursor-sw-resize, .cursor-se-resize');
      expect(handles).toHaveLength(4);
    });
  });

  describe('File Upload Functionality', () => {
    it('handles file selection through input', async () => {
      const mockFile = new File(['image data'], 'test.jpg', { type: 'image/jpeg' });
      
      render(
        <Image
          isBuilder={true}
          isSelected={true}
          onUpdate={mockOnUpdate}
        />
      );
      
      const input = screen.getByRole('button', { name: /upload/i }).closest('div')!.querySelector('input[type="file"]')!;
      
      fireEvent.change(input, { target: { files: [mockFile] } });
      
      // Should create a blob URL and call onUpdate
      await waitFor(() => {
        expect(global.URL.createObjectURL).toHaveBeenCalledWith(mockFile);
      });
    });

    it('handles drag and drop', async () => {
      const mockFile = new File(['image data'], 'test.jpg', { type: 'image/jpeg' });
      
      render(
        <Image
          isBuilder={true}
          isSelected={true}
          onUpdate={mockOnUpdate}
        />
      );
      
      const dropZone = screen.getByText(/upload/i).parentElement!;
      
      fireEvent.dragEnter(dropZone);
      expect(dropZone).toHaveClass('border-blue-500');
      
      fireEvent.drop(dropZone, {
        dataTransfer: { files: [mockFile] }
      });
      
      await waitFor(() => {
        expect(global.URL.createObjectURL).toHaveBeenCalledWith(mockFile);
      });
    });

    it('validates file format', async () => {
      const mockFile = new File(['image data'], 'test.txt', { type: 'text/plain' });
      
      render(
        <Image
          isBuilder={true}
          isSelected={true}
          onUpdate={mockOnUpdate}
          acceptedFormats={['image/jpeg', 'image/png']}
        />
      );
      
      const input = screen.getByRole('button', { name: /upload/i }).closest('div')!.querySelector('input[type="file"]')!;
      
      fireEvent.change(input, { target: { files: [mockFile] } });
      
      await waitFor(() => {
        expect(screen.getByText(/Unsupported format/)).toBeInTheDocument();
      });
      
      expect(mockOnUpdate).not.toHaveBeenCalled();
    });

    it('validates file size', async () => {
      // Create a mock file that's too large (11MB when max is 10MB)
      const mockFile = new File(['x'.repeat(11 * 1024 * 1024)], 'large.jpg', { type: 'image/jpeg' });
      
      render(
        <Image
          isBuilder={true}
          isSelected={true}
          onUpdate={mockOnUpdate}
          maxSize={10}
        />
      );
      
      const input = screen.getByRole('button', { name: /upload/i }).closest('div')!.querySelector('input[type="file"]')!;
      
      fireEvent.change(input, { target: { files: [mockFile] } });
      
      await waitFor(() => {
        expect(screen.getByText(/File too large/)).toBeInTheDocument();
      });
      
      expect(mockOnUpdate).not.toHaveBeenCalled();
    });
  });

  describe('SimpleImage Component', () => {
    it('renders simple image correctly', () => {
      render(
        <SimpleImage
          src="simple-test.jpg"
          alt="Simple test image"
          width={250}
          height={150}
          objectFit="contain"
        />
      );
      
      const image = screen.getByRole('img');
      expect(image).toHaveAttribute('src', 'simple-test.jpg');
      expect(image).toHaveAttribute('alt', 'Simple test image');
      expect(image).toHaveStyle({
        width: '250px',
        height: '150px',
        objectFit: 'contain'
      });
    });

    it('applies custom className', () => {
      render(
        <SimpleImage
          src="test.jpg"
          alt="Test"
          className="custom-class"
        />
      );
      
      const image = screen.getByRole('img');
      expect(image).toHaveClass('custom-class');
    });
  });

  describe('ImageGallery Component', () => {
    const mockImages = [
      { id: '1', src: 'image1.jpg', alt: 'Image 1' },
      { id: '2', src: 'image2.jpg', alt: 'Image 2' },
      { id: '3', src: 'image3.jpg', alt: 'Image 3' }
    ];

    const mockOnImageClick = jest.fn();

    beforeEach(() => {
      mockOnImageClick.mockClear();
    });

    it('renders gallery with correct grid layout', () => {
      render(
        <ImageGallery
          images={mockImages}
          columns={3}
          gap={16}
        />
      );
      
      const images = screen.getAllByRole('img');
      expect(images).toHaveLength(3);
      
      images.forEach((img, index) => {
        expect(img).toHaveAttribute('src', mockImages[index].src);
        expect(img).toHaveAttribute('alt', mockImages[index].alt);
      });
    });

    it('handles image click events', () => {
      render(
        <ImageGallery
          images={mockImages}
          onImageClick={mockOnImageClick}
        />
      );
      
      const firstImage = screen.getByAltText('Image 1');
      fireEvent.click(firstImage.parentElement!);
      
      expect(mockOnImageClick).toHaveBeenCalledWith(mockImages[0], 0);
    });

    it('applies custom grid configuration', () => {
      const { container } = render(
        <ImageGallery
          images={mockImages}
          columns={2}
          gap={20}
          aspectRatio="16/9"
        />
      );
      
      const gallery = container.firstChild as HTMLElement;
      expect(gallery).toHaveStyle({
        gridTemplateColumns: 'repeat(2, 1fr)',
        gap: '20px'
      });
    });
  });

  describe('Error Handling', () => {
    it('handles missing onUpdate callback gracefully', async () => {
      const mockFile = new File(['image data'], 'test.jpg', { type: 'image/jpeg' });
      
      render(
        <Image
          isBuilder={true}
          isSelected={true}
        />
      );
      
      const input = screen.getByRole('button', { name: /upload/i }).closest('div')!.querySelector('input[type="file"]')!;
      
      // Should not throw error when onUpdate is undefined
      expect(() => {
        fireEvent.change(input, { target: { files: [mockFile] } });
      }).not.toThrow();
    });

    it('shows loading state when loading prop is true', () => {
      render(
        <Image
          src="test-image.jpg"
          alt="Test image"
          loading={true}
          isBuilder={false}
        />
      );
      
      expect(screen.getByText(/loading/i)).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('provides proper alt text for images', () => {
      render(
        <Image
          src="test-image.jpg"
          alt="Descriptive alt text"
          isBuilder={false}
        />
      );
      
      const image = screen.getByRole('img');
      expect(image).toHaveAttribute('alt', 'Descriptive alt text');
    });

    it('includes proper labels and titles for controls', async () => {
      render(
        <Image
          src="test-image.jpg"
          alt="Test image"
          isBuilder={true}
          isSelected={true}
        />
      );
      
      const container = screen.getByRole('img').parentElement;
      fireEvent.mouseEnter(container!);
      
      await waitFor(() => {
        expect(screen.getByTitle('Change image')).toBeInTheDocument();
        expect(screen.getByTitle('Edit alt text')).toBeInTheDocument();
        expect(screen.getByTitle('Move image')).toBeInTheDocument();
        expect(screen.getByTitle('Delete image')).toBeInTheDocument();
      });
    });

    it('supports keyboard navigation in alt text editor', async () => {
      render(
        <Image
          src="test-image.jpg"
          alt="Test alt"
          isBuilder={true}
          isSelected={true}
          onUpdate={mockOnUpdate}
        />
      );
      
      const container = screen.getByRole('img').parentElement;
      fireEvent.mouseEnter(container!);
      
      await waitFor(() => {
        const editButton = screen.getByTitle('Edit alt text');
        fireEvent.click(editButton);
      });
      
      const textarea = screen.getByRole('textbox');
      expect(textarea).toHaveFocus();
    });
  });
});