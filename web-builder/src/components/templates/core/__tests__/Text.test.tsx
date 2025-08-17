/**
 * Tests for Text Component
 * Validates text editing, style controls, and component behavior.
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Text, RichText, SimpleText } from '../Text';

// Mock framer-motion
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  },
}));

// Mock cn utility
jest.mock('@/lib/utils', () => ({
  cn: (...classes: any[]) => classes.filter(Boolean).join(' '),
}));

describe('Text Component', () => {
  const mockOnUpdate = jest.fn();

  beforeEach(() => {
    mockOnUpdate.mockClear();
  });

  describe('Basic Text Component', () => {
    it('renders text content correctly', () => {
      render(
        <Text
          content="Test content"
          isBuilder={false}
        />
      );
      
      expect(screen.getByText('Test content')).toBeInTheDocument();
    });

    it('shows placeholder when no content provided', () => {
      render(
        <Text
          content=""
          isBuilder={true}
          isSelected={false}
        />
      );
      
      expect(screen.getByText('Click to edit text')).toBeInTheDocument();
    });

    it('enters edit mode when clicked in builder mode and selected', () => {
      render(
        <Text
          content="Test content"
          isBuilder={true}
          isSelected={true}
          onUpdate={mockOnUpdate}
        />
      );
      
      const textElement = screen.getByText('Test content');
      fireEvent.click(textElement);
      
      expect(screen.getByRole('textbox')).toBeInTheDocument();
      expect(screen.getByDisplayValue('Test content')).toBeInTheDocument();
    });

    it('calls onUpdate when text is saved', async () => {
      render(
        <Text
          content="Original text"
          isBuilder={true}
          isSelected={true}
          onUpdate={mockOnUpdate}
        />
      );
      
      // Enter edit mode
      const textElement = screen.getByText('Original text');
      fireEvent.click(textElement);
      
      // Change text
      const textarea = screen.getByRole('textbox');
      fireEvent.change(textarea, { target: { value: 'New text' } });
      
      // Save by pressing Enter
      fireEvent.keyDown(textarea, { key: 'Enter', shiftKey: false });
      
      await waitFor(() => {
        expect(mockOnUpdate).toHaveBeenCalledWith(
          'New text',
          expect.any(Object)
        );
      });
    });

    it('cancels edit on Escape key', () => {
      render(
        <Text
          content="Original text"
          isBuilder={true}
          isSelected={true}
          onUpdate={mockOnUpdate}
        />
      );
      
      // Enter edit mode
      const textElement = screen.getByText('Original text');
      fireEvent.click(textElement);
      
      // Change text
      const textarea = screen.getByRole('textbox');
      fireEvent.change(textarea, { target: { value: 'New text' } });
      
      // Cancel with Escape
      fireEvent.keyDown(textarea, { key: 'Escape' });
      
      // Should show original text again
      expect(screen.getByText('Original text')).toBeInTheDocument();
      expect(mockOnUpdate).not.toHaveBeenCalled();
    });

    it('applies custom styles correctly', () => {
      const customStyles = {
        fontSize: '24px',
        color: '#ff0000',
        fontWeight: 'bold',
      };

      render(
        <Text
          content="Styled text"
          styles={customStyles}
          isBuilder={false}
        />
      );
      
      const textElement = screen.getByText('Styled text');
      
      // Check if styles are applied
      expect(textElement).toHaveStyle('font-size: 24px');
      expect(textElement).toHaveStyle('color: rgb(255, 0, 0)');
      expect(textElement).toHaveStyle('font-weight: bold');
    });

    it('renders with correct HTML tag', () => {
      render(
        <Text
          content="Heading text"
          props={{ tag: 'h1' }}
          isBuilder={false}
        />
      );
      
      const heading = screen.getByRole('heading', { level: 1 });
      expect(heading).toBeInTheDocument();
      expect(heading).toHaveTextContent('Heading text');
    });

    it('shows style controls on hover when selected in builder mode', async () => {
      render(
        <Text
          content="Test content"
          isBuilder={true}
          isSelected={true}
          onUpdate={mockOnUpdate}
        />
      );
      
      const textElement = screen.getByText('Test content');
      fireEvent.mouseEnter(textElement.parentElement!);
      
      await waitFor(() => {
        // Check for style control buttons
        expect(screen.getByTitle('Bold')).toBeInTheDocument();
        expect(screen.getByTitle('Italic')).toBeInTheDocument();
        expect(screen.getByTitle('Underline')).toBeInTheDocument();
        expect(screen.getByTitle('Align left')).toBeInTheDocument();
        expect(screen.getByTitle('Align center')).toBeInTheDocument();
        expect(screen.getByTitle('Align right')).toBeInTheDocument();
      });
    });
  });

  describe('SimpleText Component', () => {
    const mockOnChange = jest.fn();

    beforeEach(() => {
      mockOnChange.mockClear();
    });

    it('renders simple text correctly', () => {
      render(
        <SimpleText
          text="Simple text"
          onChange={mockOnChange}
        />
      );
      
      expect(screen.getByText('Simple text')).toBeInTheDocument();
    });

    it('calls onChange when text is updated', async () => {
      render(
        <SimpleText
          text="Original"
          onChange={mockOnChange}
          editable={true}
        />
      );
      
      const textElement = screen.getByText('Original');
      fireEvent.click(textElement);
      
      // Find the textarea and change its value
      const textarea = screen.getByRole('textbox');
      fireEvent.change(textarea, { target: { value: 'Changed' } });
      fireEvent.keyDown(textarea, { key: 'Enter' });
      
      await waitFor(() => {
        expect(mockOnChange).toHaveBeenCalledWith('Changed');
      });
    });
  });

  describe('RichText Component', () => {
    it('renders with rich text features enabled', () => {
      render(
        <RichText
          content="Rich text content"
          isBuilder={true}
          isSelected={true}
          allowRichText={true}
          toolbar={true}
          onUpdate={mockOnUpdate}
        />
      );
      
      expect(screen.getByText('Rich text content')).toBeInTheDocument();
    });

    it('falls back to basic Text when rich text disabled', () => {
      render(
        <RichText
          content="Basic text content"
          allowRichText={false}
          onUpdate={mockOnUpdate}
        />
      );
      
      expect(screen.getByText('Basic text content')).toBeInTheDocument();
    });

    it('shows advanced controls toggle when enabled', () => {
      render(
        <RichText
          content="Rich text"
          isBuilder={true}
          isSelected={true}
          allowRichText={true}
          toolbar={true}
          onUpdate={mockOnUpdate}
        />
      );
      
      expect(screen.getByTitle('Advanced controls')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('provides proper keyboard navigation', () => {
      render(
        <Text
          content="Accessible text"
          isBuilder={true}
          isSelected={true}
          onUpdate={mockOnUpdate}
        />
      );
      
      const textElement = screen.getByText('Accessible text');
      fireEvent.click(textElement);
      
      const textarea = screen.getByRole('textbox');
      expect(textarea).toHaveFocus();
    });

    it('includes proper ARIA labels and titles', () => {
      render(
        <Text
          content="Test content"
          isBuilder={true}
          isSelected={true}
          onUpdate={mockOnUpdate}
        />
      );
      
      const textElement = screen.getByText('Test content');
      fireEvent.mouseEnter(textElement.parentElement!);
      
      // Check for accessibility attributes on control buttons
      expect(screen.getByTitle('Bold')).toBeInTheDocument();
      expect(screen.getByTitle('Edit text')).toBeInTheDocument();
      expect(screen.getByTitle('Text color')).toBeInTheDocument();
    });
  });

  describe('Error Handling', () => {
    it('handles missing onUpdate callback gracefully', () => {
      render(
        <Text
          content="Test content"
          isBuilder={true}
          isSelected={true}
        />
      );
      
      const textElement = screen.getByText('Test content');
      fireEvent.click(textElement);
      
      const textarea = screen.getByRole('textbox');
      fireEvent.change(textarea, { target: { value: 'New text' } });
      fireEvent.keyDown(textarea, { key: 'Enter' });
      
      // Should not throw error
      expect(textElement).toBeInTheDocument();
    });

    it('handles empty or undefined content', () => {
      render(
        <Text
          content={undefined}
          isBuilder={true}
          isSelected={false}
        />
      );
      
      expect(screen.getByText('Click to edit text')).toBeInTheDocument();
    });
  });
});