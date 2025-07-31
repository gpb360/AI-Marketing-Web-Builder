'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { Palette } from 'lucide-react';

interface ColorPickerProps {
  color: string;
  onChange: (color: string) => void;
  label?: string;
  className?: string;
}

const PRESET_COLORS = [
  '#000000', '#FFFFFF', '#FF0000', '#00FF00', '#0000FF',
  '#FFFF00', '#FF00FF', '#00FFFF', '#FFA500', '#800080',
  '#FFC0CB', '#A52A2A', '#808080', '#C0C0C0', '#800000',
  '#008000', '#000080', '#808000', '#800080', '#008080',
];

export function ColorPicker({ color, onChange, label, className }: ColorPickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [customColor, setCustomColor] = useState(color);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setCustomColor(color);
  }, [color]);

  const handleColorSelect = (selectedColor: string) => {
    onChange(selectedColor);
    setIsOpen(false);
  };

  const handleCustomColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newColor = e.target.value;
    setCustomColor(newColor);
    onChange(newColor);
  };

  return (
    <div className={cn("flex items-center gap-2", className)}>
      {label && <label className="text-sm font-medium text-gray-700">{label}</label>}
      
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <button
            type="button"
            className="relative w-8 h-8 rounded-md border border-gray-300 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all hover:scale-110"
            style={{ backgroundColor: color }}
            aria-label="Select color"
          >
            <div className="absolute inset-0 rounded-md bg-gradient-to-br from-transparent to-black/20" />
          </button>
        </PopoverTrigger>
        
        <PopoverContent className="w-64 p-4" align="start">
          <div className="space-y-4">
            <div>
              <h4 className="text-sm font-medium text-gray-900 mb-2">Preset Colors</h4>
              <div className="grid grid-cols-5 gap-2">
                {PRESET_COLORS.map((presetColor) => (
                  <button
                    key={presetColor}
                    type="button"
                    className={cn(
                      "w-8 h-8 rounded-md border border-gray-300 transition-all hover:scale-110 focus:outline-none focus:ring-2 focus:ring-blue-500",
                      color === presetColor && "ring-2 ring-blue-500 ring-offset-2"
                    )}
                    style={{ backgroundColor: presetColor }}
                    onClick={() => handleColorSelect(presetColor)}
                    aria-label={`Select ${presetColor}`}
                  />
                ))}
              </div>
            </div>
            
            <div>
              <h4 className="text-sm font-medium text-gray-900 mb-2">Custom Color</h4>
              <div className="flex items-center gap-2">
                <input
                  ref={inputRef}
                  type="color"
                  value={customColor}
                  onChange={handleCustomColorChange}
                  className="w-8 h-8 border border-gray-300 rounded-md cursor-pointer"
                />
                <input
                  type="text"
                  value={customColor}
                  onChange={handleCustomColorChange}
                  className="flex-1 px-2 py-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="#000000"
                />
              </div>
            </div>
            
            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="px-3 py-1 text-sm text-gray-600 hover:text-gray-800 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}

interface QuickColorPickerProps {
  colors: string[];
  selectedColor: string;
  onSelect: (color: string) => void;
}

export function QuickColorPicker({ colors, selectedColor, onSelect }: QuickColorPickerProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {colors.map((color) => (
        <button
          key={color}
          type="button"
          className={cn(
            "w-6 h-6 rounded-full border-2 transition-all hover:scale-110",
            selectedColor === color 
              ? "border-blue-500 ring-2 ring-blue-500 ring-offset-1" 
              : "border-gray-300 hover:border-gray-400"
          )}
          style={{ backgroundColor: color }}
          onClick={() => onSelect(color)}
          aria-label={`Select ${color}`}
        />
      ))}
    </div>
  );
}