'use client';

import React, { useState } from 'react';
import { Monitor, Smartphone, Tablet, Tv, RotateCcw, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { 
  BREAKPOINTS, 
  MOBILE_PREVIEW_DEVICES, 
  BreakpointSize, 
  ViewportState,
  ResponsivePreviewSettings 
} from '@/types/responsive';
import { cn } from '@/lib/utils';

interface ResponsiveControlsProps {
  viewport: ViewportState;
  settings: ResponsivePreviewSettings;
  onViewportChange: (viewport: Partial<ViewportState>) => void;
  onSettingsChange: (settings: Partial<ResponsivePreviewSettings>) => void;
  className?: string;
}

const BREAKPOINT_ICONS = {
  mobile: Smartphone,
  tablet: Tablet,
  desktop: Monitor,
  wide: Tv
};

export function ResponsiveControls({
  viewport,
  settings,
  onViewportChange,
  onSettingsChange,
  className
}: ResponsiveControlsProps) {
  const [customDevice, setCustomDevice] = useState<string>('');

  const handleBreakpointChange = (breakpoint: BreakpointSize) => {
    const bp = BREAKPOINTS[breakpoint];
    onViewportChange({
      currentBreakpoint: breakpoint,
      width: bp.width,
      height: bp.height,
      orientation: bp.width < bp.height ? 'portrait' : 'landscape'
    });
  };

  const handleDeviceChange = (deviceName: string) => {
    const device = MOBILE_PREVIEW_DEVICES.find(d => d.name === deviceName);
    if (device) {
      setCustomDevice(deviceName);
      onViewportChange({
        currentBreakpoint: 'mobile',
        width: device.width,
        height: device.height,
        orientation: device.width < device.height ? 'portrait' : 'landscape'
      });
    }
  };

  const handleOrientationToggle = () => {
    const newOrientation = viewport.orientation === 'portrait' ? 'landscape' : 'portrait';
    onViewportChange({
      orientation: newOrientation,
      width: viewport.height,
      height: viewport.width
    });
  };

  const getCurrentBreakpointInfo = () => {
    const bp = BREAKPOINTS[viewport.currentBreakpoint];
    return `${bp.name} (${viewport.width}×${viewport.height})`;
  };

  return (
    <div className={cn(
      "flex items-center gap-2 p-2 bg-white border rounded-lg shadow-sm",
      className
    )}>
      {/* Breakpoint Selection */}
      <div className="flex items-center gap-1 border-r pr-2">
        {Object.entries(BREAKPOINTS).map(([key, breakpoint]) => {
          const Icon = BREAKPOINT_ICONS[key as BreakpointSize];
          const isActive = viewport.currentBreakpoint === key;
          
          return (
            <Button
              key={key}
              variant={isActive ? "default" : "ghost"}
              size="sm"
              onClick={() => handleBreakpointChange(key as BreakpointSize)}
              className={cn(
                "w-9 h-9 p-0",
                isActive && "bg-blue-600 hover:bg-blue-700"
              )}
              title={`${breakpoint.name} (${breakpoint.width}×${breakpoint.height})`}
            >
              <Icon className="w-4 h-4" />
            </Button>
          );
        })}
      </div>

      {/* Device Presets for Mobile */}
      {viewport.currentBreakpoint === 'mobile' && (
        <div className="border-r pr-2">
          <Select value={customDevice} onValueChange={handleDeviceChange}>
            <SelectTrigger className="w-[140px] h-8">
              <SelectValue placeholder="Device preset" />
            </SelectTrigger>
            <SelectContent>
              {MOBILE_PREVIEW_DEVICES.map((device) => (
                <SelectItem key={device.name} value={device.name}>
                  {device.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {/* Orientation Toggle */}
      <Button
        variant="ghost"
        size="sm"
        onClick={handleOrientationToggle}
        className="w-9 h-9 p-0"
        title={`Switch to ${viewport.orientation === 'portrait' ? 'landscape' : 'portrait'}`}
      >
        <RotateCcw className="w-4 h-4" />
      </Button>

      {/* Current Viewport Info */}
      <div className="text-sm text-gray-600 font-medium border-r pr-2">
        {getCurrentBreakpointInfo()}
      </div>

      {/* Zoom Level */}
      <div className="text-sm text-gray-500 border-r pr-2">
        {Math.round(viewport.zoom * 100)}%
      </div>

      {/* Settings Popover */}
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="ghost" size="sm" className="w-9 h-9 p-0">
            <Settings className="w-4 h-4" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80" align="end">
          <div className="space-y-4">
            <h4 className="font-medium">Responsive Preview Settings</h4>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label htmlFor="breakpoint-borders" className="text-sm">
                  Show breakpoint borders
                </Label>
                <Switch
                  id="breakpoint-borders"
                  checked={settings.showBreakpointBorders}
                  onCheckedChange={(checked) => 
                    onSettingsChange({ showBreakpointBorders: checked })
                  }
                />
              </div>
              
              <div className="flex items-center justify-between">
                <Label htmlFor="responsive-grid" className="text-sm">
                  Show responsive grid
                </Label>
                <Switch
                  id="responsive-grid"
                  checked={settings.showResponsiveGrid}
                  onCheckedChange={(checked) => 
                    onSettingsChange({ showResponsiveGrid: checked })
                  }
                />
              </div>
              
              <div className="flex items-center justify-between">
                <Label htmlFor="auto-rotate" className="text-sm">
                  Auto-rotate preview
                </Label>
                <Switch
                  id="auto-rotate"
                  checked={settings.autoRotate}
                  onCheckedChange={(checked) => 
                    onSettingsChange({ autoRotate: checked })
                  }
                />
              </div>
              
              <div className="flex items-center justify-between">
                <Label htmlFor="simulate-touch" className="text-sm">
                  Simulate touch interactions
                </Label>
                <Switch
                  id="simulate-touch"
                  checked={settings.simulateTouch}
                  onCheckedChange={(checked) => 
                    onSettingsChange({ simulateTouch: checked })
                  }
                />
              </div>
            </div>
            
            <div className="pt-3 border-t">
              <p className="text-xs text-gray-500">
                Changes apply to canvas preview only. Published sites will be fully responsive.
              </p>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}