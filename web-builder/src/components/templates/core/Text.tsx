'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { 
  Edit3, 
  Check, 
  X, 
  Type, 
  AlignLeft, 
  AlignCenter, 
  AlignRight, 
  Bold, 
  Italic, 
  Underline,
  Palette,
  Minus,
  Plus
} from 'lucide-react';

interface TextProps {
  id?: string;
  content?: string;
  styles?: React.CSSProperties;
  className?: string;
  isSelected?: boolean;
  isBuilder?: boolean;
  onUpdate?: (content: string, styles: React.CSSProperties) => void;
  props?: {
    text?: string;
    tag?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'p' | 'span' | 'div';
    fontSize?: number;
    fontWeight?: 'normal' | 'bold' | 'bolder' | 'lighter' | '100' | '200' | '300' | '400' | '500' | '600' | '700' | '800' | '900';
    fontStyle?: 'normal' | 'italic' | 'oblique';
    textAlign?: 'left' | 'center' | 'right' | 'justify';
    color?: string;
    backgroundColor?: string;
    textDecoration?: 'none' | 'underline' | 'line-through' | 'overline';
    lineHeight?: number;
    letterSpacing?: number;
    textTransform?: 'none' | 'uppercase' | 'lowercase' | 'capitalize';
    maxWidth?: string;
    padding?: string;
    margin?: string;
    borderRadius?: number;
    boxShadow?: string;
    gradient?: boolean;
    gradientFrom?: string;
    gradientTo?: string;
    animation?: 'none' | 'fade-in' | 'slide-up' | 'bounce' | 'pulse';
  };
}

export const Text: React.FC<TextProps> = ({
  id,
  content,
  styles,
  className,
  isSelected = false,
  isBuilder = false,
  onUpdate,
  props = {}
}) => {
  const {
    text = content || 'Click to edit text',
    tag = 'p',
    fontSize = 16,
    fontWeight = 'normal',
    fontStyle = 'normal',
    textAlign = 'left',
    color = '#000000',
    backgroundColor = 'transparent',
    textDecoration = 'none',
    lineHeight = 1.5,
    letterSpacing = 0,
    textTransform = 'none',
    maxWidth = 'none',
    padding = '8px',
    margin = '0',
    borderRadius = 0,
    boxShadow = 'none',
    gradient = false,
    gradientFrom = '#3b82f6',
    gradientTo = '#8b5cf6',
    animation = 'none'
  } = props;

  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(text);
  const [showControls, setShowControls] = useState(false);
  const [localStyles, setLocalStyles] = useState({
    fontSize,
    fontWeight,
    fontStyle,
    textAlign,
    color,
    backgroundColor,
    textDecoration,
    lineHeight,
    letterSpacing,
    textTransform,
    maxWidth,
    padding,
    margin,
    borderRadius: `${borderRadius}px`,
    boxShadow
  });

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setEditText(text);
  }, [text]);

  useEffect(() => {
    if (isEditing && textareaRef.current) {
      textareaRef.current.focus();
      textareaRef.current.select();
      // Auto-resize textarea
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [isEditing]);

  const handleTextClick = () => {
    if (isBuilder && isSelected) {
      setIsEditing(true);
    }
  };

  const handleSave = () => {
    const finalStyles = { ...localStyles };
    
    if (gradient) {
      finalStyles.background = `linear-gradient(135deg, ${gradientFrom}, ${gradientTo})`;
      finalStyles.backgroundClip = 'text';
      finalStyles.WebkitBackgroundClip = 'text';
      finalStyles.WebkitTextFillColor = 'transparent';
    }

    onUpdate?.(editText, finalStyles);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditText(text);
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSave();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      handleCancel();
    }
  };

  const handleStyleChange = (property: string, value: any) => {
    const newStyles = { ...localStyles, [property]: value };
    setLocalStyles(newStyles);
    
    if (!isEditing) {
      const finalStyles = { ...newStyles };
      if (gradient) {
        finalStyles.background = `linear-gradient(135deg, ${gradientFrom}, ${gradientTo})`;
        finalStyles.backgroundClip = 'text';
        finalStyles.WebkitBackgroundClip = 'text';
        finalStyles.WebkitTextFillColor = 'transparent';
      }
      onUpdate?.(editText, finalStyles);
    }
  };

  const getAnimationClass = () => {
    switch (animation) {
      case 'fade-in':
        return 'animate-fade-in';
      case 'slide-up':
        return 'animate-slide-up';
      case 'bounce':
        return 'animate-bounce';
      case 'pulse':
        return 'animate-pulse';
      default:
        return '';
    }
  };

  const computedStyles: React.CSSProperties = {
    ...styles,
    ...localStyles,
    fontSize: `${localStyles.fontSize}px`,
    lineHeight: localStyles.lineHeight,
    letterSpacing: `${localStyles.letterSpacing}px`,
  };

  if (gradient) {
    computedStyles.background = `linear-gradient(135deg, ${gradientFrom}, ${gradientTo})`;
    computedStyles.backgroundClip = 'text';
    computedStyles.WebkitBackgroundClip = 'text';
    computedStyles.WebkitTextFillColor = 'transparent';
  }

  const Element = tag;

  return (
    <div
      className={cn('relative group', className)}
      onMouseEnter={() => isBuilder && isSelected && setShowControls(true)}
      onMouseLeave={() => setShowControls(false)}
    >
      {/* Style Controls */}
      {isBuilder && isSelected && showControls && !isEditing && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="absolute -top-12 left-0 bg-white border border-gray-200 rounded-lg shadow-lg p-2 flex items-center gap-2 z-50"
        >
          {/* Font Size Controls */}
          <div className="flex items-center gap-1">
            <button
              onClick={() => handleStyleChange('fontSize', Math.max(8, localStyles.fontSize - 2))}
              className="p-1 hover:bg-gray-100 rounded"
              title="Decrease font size"
            >
              <Minus className="w-3 h-3" />
            </button>
            <span className="text-xs px-1 min-w-[24px] text-center">{localStyles.fontSize}</span>
            <button
              onClick={() => handleStyleChange('fontSize', Math.min(72, localStyles.fontSize + 2))}
              className="p-1 hover:bg-gray-100 rounded"
              title="Increase font size"
            >
              <Plus className="w-3 h-3" />
            </button>
          </div>

          <div className="w-px h-4 bg-gray-300" />

          {/* Text Formatting */}
          <button
            onClick={() => handleStyleChange('fontWeight', localStyles.fontWeight === 'bold' ? 'normal' : 'bold')}
            className={cn(
              "p-1 rounded",
              localStyles.fontWeight === 'bold' ? 'bg-blue-100 text-blue-600' : 'hover:bg-gray-100'
            )}
            title="Bold"
          >
            <Bold className="w-3 h-3" />
          </button>
          
          <button
            onClick={() => handleStyleChange('fontStyle', localStyles.fontStyle === 'italic' ? 'normal' : 'italic')}
            className={cn(
              "p-1 rounded",
              localStyles.fontStyle === 'italic' ? 'bg-blue-100 text-blue-600' : 'hover:bg-gray-100'
            )}
            title="Italic"
          >
            <Italic className="w-3 h-3" />
          </button>
          
          <button
            onClick={() => handleStyleChange('textDecoration', localStyles.textDecoration === 'underline' ? 'none' : 'underline')}
            className={cn(
              "p-1 rounded",
              localStyles.textDecoration === 'underline' ? 'bg-blue-100 text-blue-600' : 'hover:bg-gray-100'
            )}
            title="Underline"
          >
            <Underline className="w-3 h-3" />
          </button>

          <div className="w-px h-4 bg-gray-300" />

          {/* Text Alignment */}
          <button
            onClick={() => handleStyleChange('textAlign', 'left')}
            className={cn(
              "p-1 rounded",
              localStyles.textAlign === 'left' ? 'bg-blue-100 text-blue-600' : 'hover:bg-gray-100'
            )}
            title="Align left"
          >
            <AlignLeft className="w-3 h-3" />
          </button>
          
          <button
            onClick={() => handleStyleChange('textAlign', 'center')}
            className={cn(
              "p-1 rounded",
              localStyles.textAlign === 'center' ? 'bg-blue-100 text-blue-600' : 'hover:bg-gray-100'
            )}
            title="Align center"
          >
            <AlignCenter className="w-3 h-3" />
          </button>
          
          <button
            onClick={() => handleStyleChange('textAlign', 'right')}
            className={cn(
              "p-1 rounded",
              localStyles.textAlign === 'right' ? 'bg-blue-100 text-blue-600' : 'hover:bg-gray-100'
            )}
            title="Align right"
          >
            <AlignRight className="w-3 h-3" />
          </button>

          <div className="w-px h-4 bg-gray-300" />

          {/* Color Picker */}
          <div className="relative">
            <input
              type="color"
              value={localStyles.color}
              onChange={(e) => handleStyleChange('color', e.target.value)}
              className="w-6 h-6 rounded border border-gray-300 cursor-pointer"
              title="Text color"
            />
          </div>

          {/* Edit Button */}
          <button
            onClick={() => setIsEditing(true)}
            className="p-1 hover:bg-gray-100 rounded"
            title="Edit text"
          >
            <Edit3 className="w-3 h-3" />
          </button>
        </motion.div>
      )}

      {/* Text Editor */}
      {isEditing ? (
        <div className="relative">
          <textarea
            ref={textareaRef}
            value={editText}
            onChange={(e) => setEditText(e.target.value)}
            onKeyDown={handleKeyDown}
            className={cn(
              "w-full min-h-[40px] p-2 border-2 border-blue-500 rounded-md resize-none",
              "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2",
              "bg-white shadow-lg",
              getAnimationClass()
            )}
            style={computedStyles}
            placeholder="Enter your text..."
          />
          
          {/* Edit Controls */}
          <div className="absolute -top-10 right-0 flex items-center gap-1 bg-white border border-gray-200 rounded-md shadow-lg p-1">
            <button
              onClick={handleSave}
              className="p-1 text-green-600 hover:bg-green-50 rounded transition-colors"
              title="Save (Enter)"
            >
              <Check className="w-4 h-4" />
            </button>
            <button
              onClick={handleCancel}
              className="p-1 text-red-600 hover:bg-red-50 rounded transition-colors"
              title="Cancel (Esc)"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      ) : (
        <Element
          ref={contentRef}
          className={cn(
            "cursor-text transition-all duration-200",
            getAnimationClass(),
            !editText.trim() && "text-gray-400 italic",
            isBuilder && isSelected && "hover:bg-gray-50 hover:outline-2 hover:outline-dashed hover:outline-gray-300"
          )}
          style={computedStyles}
          onClick={handleTextClick}
          suppressContentEditableWarning
        >
          {editText.trim() || (isBuilder ? 'Click to edit text' : '')}
        </Element>
      )}

      {/* Edit Button Overlay for non-selected state */}
      {isBuilder && !isSelected && !isEditing && (
        <button
          onClick={() => setIsEditing(true)}
          className="absolute top-0 right-0 -translate-y-full translate-x-2 bg-blue-500 text-white p-1 rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-blue-600"
          title="Click to edit text"
        >
          <Edit3 className="w-3 h-3" />
        </button>
      )}
    </div>
  );
};

// Advanced Text Component with Rich Text Features
interface RichTextProps extends TextProps {
  allowRichText?: boolean;
  toolbar?: boolean;
}

export const RichText: React.FC<RichTextProps> = ({
  allowRichText = true,
  toolbar = true,
  ...props
}) => {
  const [showAdvancedControls, setShowAdvancedControls] = useState(false);

  if (!allowRichText) {
    return <Text {...props} />;
  }

  return (
    <div className="relative">
      <Text {...props} />
      
      {/* Advanced Controls Toggle */}
      {toolbar && props.isBuilder && props.isSelected && (
        <button
          onClick={() => setShowAdvancedControls(!showAdvancedControls)}
          className="absolute -top-16 right-0 bg-gray-700 text-white p-1 rounded text-xs"
          title="Advanced controls"
        >
          <Type className="w-3 h-3" />
        </button>
      )}

      {/* Advanced Controls Panel */}
      {showAdvancedControls && props.isBuilder && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          className="absolute -top-32 left-0 bg-white border border-gray-200 rounded-lg shadow-xl p-4 z-50 min-w-[300px]"
        >
          <h4 className="text-sm font-semibold mb-3">Advanced Text Settings</h4>
          
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div>
              <label className="block text-gray-600 mb-1">Line Height</label>
              <input
                type="range"
                min="1"
                max="3"
                step="0.1"
                value={props.props?.lineHeight || 1.5}
                onChange={(e) => props.onUpdate?.(props.content || '', { 
                  ...props.styles, 
                  lineHeight: parseFloat(e.target.value) 
                })}
                className="w-full"
              />
            </div>
            
            <div>
              <label className="block text-gray-600 mb-1">Letter Spacing</label>
              <input
                type="range"
                min="-2"
                max="5"
                step="0.1"
                value={props.props?.letterSpacing || 0}
                onChange={(e) => props.onUpdate?.(props.content || '', { 
                  ...props.styles, 
                  letterSpacing: `${e.target.value}px` 
                })}
                className="w-full"
              />
            </div>
            
            <div>
              <label className="block text-gray-600 mb-1">Text Transform</label>
              <select
                value={props.props?.textTransform || 'none'}
                onChange={(e) => props.onUpdate?.(props.content || '', { 
                  ...props.styles, 
                  textTransform: e.target.value as any 
                })}
                className="w-full border border-gray-300 rounded px-2 py-1"
              >
                <option value="none">None</option>
                <option value="uppercase">UPPERCASE</option>
                <option value="lowercase">lowercase</option>
                <option value="capitalize">Capitalize</option>
              </select>
            </div>
            
            <div>
              <label className="block text-gray-600 mb-1">Background</label>
              <input
                type="color"
                value={props.props?.backgroundColor || '#transparent'}
                onChange={(e) => props.onUpdate?.(props.content || '', { 
                  ...props.styles, 
                  backgroundColor: e.target.value 
                })}
                className="w-full h-8 border border-gray-300 rounded"
              />
            </div>
          </div>
          
          <button
            onClick={() => setShowAdvancedControls(false)}
            className="absolute top-2 right-2 text-gray-400 hover:text-gray-600"
          >
            <X className="w-4 h-4" />
          </button>
        </motion.div>
      )}
    </div>
  );
};

// Simple Text Component for basic use cases
export const SimpleText: React.FC<{
  text: string;
  onChange?: (text: string) => void;
  placeholder?: string;
  className?: string;
  editable?: boolean;
}> = ({ text, onChange, placeholder = "Click to edit", className, editable = true }) => {
  return (
    <Text
      content={text}
      onUpdate={(newText) => onChange?.(newText)}
      className={className}
      isBuilder={editable}
      props={{
        text,
      }}
    />
  );
};