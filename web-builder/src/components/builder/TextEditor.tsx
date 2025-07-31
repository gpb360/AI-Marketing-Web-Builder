'use client';

import React, { useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { Check, X, Edit3 } from 'lucide-react';

interface TextEditorProps {
  text: string;
  onChange: (text: string) => void;
  className?: string;
  style?: React.CSSProperties;
  tag?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'p' | 'span' | 'div';
  placeholder?: string;
  isSelected?: boolean;
}

export function TextEditor({ 
  text, 
  onChange, 
  className, 
  style, 
  tag = 'div',
  placeholder = "Click to edit...",
  isSelected = false 
}: TextEditorProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(text);
  const [showEditButton, setShowEditButton] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setEditText(text);
  }, [text]);

  useEffect(() => {
    if (isEditing && textareaRef.current) {
      textareaRef.current.focus();
      textareaRef.current.select();
    }
  }, [isEditing]);

  const handleClick = () => {
    if (isSelected) {
      setIsEditing(true);
    }
  };

  const handleSave = () => {
    onChange(editText);
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

  const handleMouseEnter = () => {
    if (isSelected && !isEditing) {
      setShowEditButton(true);
    }
  };

  const handleMouseLeave = () => {
    setShowEditButton(false);
  };

  const handleEditButtonClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsEditing(true);
  };

  const Element = tag;

  if (isEditing) {
    return (
      <div className={cn("relative", className)}>
        <textarea
          ref={textareaRef}
          value={editText}
          onChange={(e) => setEditText(e.target.value)}
          onKeyDown={handleKeyDown}
          className={cn(
            "w-full min-h-[40px] p-2 border-2 border-blue-500 rounded-md resize-none",
            "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2",
            "bg-white shadow-lg"
          )}
          style={{
            ...style,
            fontFamily: 'inherit',
            fontSize: 'inherit',
            fontWeight: 'inherit',
            lineHeight: 'inherit',
          }}
          placeholder={placeholder}
        />
        
        {/* Edit controls */}
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
    );
  }

  return (
    <div 
      ref={contentRef}
      className={cn("relative group", className)}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <Element
        className={cn(
          "cursor-text transition-all duration-200",
          !text && "text-gray-400 italic",
          isSelected && "hover:bg-gray-50 hover:outline-2 hover:outline-dashed hover:outline-gray-300"
        )}
        style={{
          ...style,
          padding: '2px 4px',
          borderRadius: '2px',
        }}
        onClick={handleClick}
      >
        {text || placeholder}
      </Element>

      {/* Edit button overlay */}
      {showEditButton && (
        <button
          onClick={handleEditButtonClick}
          className="absolute top-0 right-0 -translate-y-full translate-x-2 bg-blue-500 text-white p-1 rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-blue-600"
          title="Click to edit text"
        >
          <Edit3 className="w-3 h-3" />
        </button>
      )}
    </div>
  );
}

interface InlineTextEditorProps {
  text: string;
  onChange: (text: string) => void;
  className?: string;
  placeholder?: string;
}

export function InlineTextEditor({ 
  text, 
  onChange, 
  className, 
  placeholder = "Type here..." 
}: InlineTextEditorProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(text);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const handleClick = () => {
    setIsEditing(true);
  };

  const handleSave = () => {
    onChange(editText);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditText(text);
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSave();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      handleCancel();
    }
  };

  if (isEditing) {
    return (
      <input
        ref={inputRef}
        type="text"
        value={editText}
        onChange={(e) => setEditText(e.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={handleSave}
        className={cn(
          "px-2 py-1 text-sm border-2 border-blue-500 rounded focus:outline-none focus:ring-2 focus:ring-blue-500",
          className
        )}
        placeholder={placeholder}
      />
    );
  }

  return (
    <span
      className={cn(
        "cursor-text hover:bg-gray-100 rounded px-1 transition-colors",
        !text && "text-gray-400 italic",
        className
      )}
      onClick={handleClick}
    >
      {text || placeholder}
    </span>
  );
}