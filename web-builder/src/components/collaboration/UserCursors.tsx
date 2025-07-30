/**
 * UserCursors Component
 * Displays live cursors of other users in the canvas
 */

'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { UserCursor, CollaborationUser } from '@/types/collaboration';

interface UserCursorsProps {
  userCursors: Map<string, UserCursor>;
  activeUsers: CollaborationUser[];
  canvasRef: React.RefObject<HTMLElement>;
  zoom?: number;
  className?: string;
}

interface CursorPosition {
  x: number;
  y: number;
  visible: boolean;
  user: CollaborationUser;
  timestamp: Date;
}

const CursorIcon: React.FC<{ color: string; size?: number }> = ({ 
  color, 
  size = 20 
}) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none"
    className="drop-shadow-md"
  >
    <path
      d="M3 3L10.3 20.3L12.6 12.6L20.3 10.3L3 3Z"
      fill={color}
      stroke="white"
      strokeWidth="1"
      strokeLinejoin="round"
    />
  </svg>
);

const UserLabel: React.FC<{ 
  user: CollaborationUser; 
  position: { x: number; y: number };
  visible: boolean;
}> = ({ user, position, visible }) => {
  if (!visible) return null;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8 }}
      className="absolute pointer-events-none z-50"
      style={{
        left: position.x + 20,
        top: position.y - 10,
      }}
    >
      <div
        className="px-2 py-1 rounded-md text-white text-xs font-medium whitespace-nowrap shadow-lg"
        style={{ backgroundColor: user.color }}
      >
        {user.name}
      </div>
    </motion.div>
  );
};

const AnimatedCursor: React.FC<{
  cursor: UserCursor;
  user: CollaborationUser;
  canvasRect: DOMRect | null;
  zoom: number;
}> = ({ cursor, user, canvasRect, zoom }) => {
  const [showLabel, setShowLabel] = useState(true);
  const [lastMoveTime, setLastMoveTime] = useState(Date.now());

  // Calculate cursor position relative to viewport
  const getScreenPosition = () => {
    if (!canvasRect) return { x: 0, y: 0 };
    
    return {
      x: canvasRect.left + (cursor.position.x * zoom),
      y: canvasRect.top + (cursor.position.y * zoom),
    };
  };

  const screenPosition = getScreenPosition();

  // Hide label after 3 seconds of no movement
  useEffect(() => {
    setLastMoveTime(Date.now());
    setShowLabel(true);
    
    const timer = setTimeout(() => {
      setShowLabel(false);
    }, 3000);

    return () => clearTimeout(timer);
  }, [cursor.position.x, cursor.position.y]);

  if (!cursor.visible || !canvasRect) return null;

  return (
    <>
      {/* Cursor */}
      <motion.div
        className="fixed pointer-events-none z-50"
        initial={false}
        animate={{
          x: screenPosition.x,
          y: screenPosition.y,
        }}
        transition={{
          type: "spring",
          damping: 30,
          stiffness: 800,
          mass: 0.1,
        }}
      >
        <CursorIcon color={user.color} />
      </motion.div>

      {/* User label */}
      <AnimatePresence>
        {showLabel && (
          <UserLabel
            user={user}
            position={screenPosition}
            visible={cursor.visible}
          />
        )}
      </AnimatePresence>
    </>
  );
};

export const UserCursors: React.FC<UserCursorsProps> = ({
  userCursors,
  activeUsers,
  canvasRef,
  zoom = 1,
  className = '',
}) => {
  const [canvasRect, setCanvasRect] = useState<DOMRect | null>(null);

  // Update canvas rect on resize or scroll
  useEffect(() => {
    const updateCanvasRect = () => {
      if (canvasRef.current) {
        setCanvasRect(canvasRef.current.getBoundingClientRect());
      }
    };

    updateCanvasRect();

    // Update on window resize and scroll
    const handleUpdate = () => {
      requestAnimationFrame(updateCanvasRect);
    };

    window.addEventListener('resize', handleUpdate);
    window.addEventListener('scroll', handleUpdate);
    
    // Also update when canvas element changes
    const resizeObserver = new ResizeObserver(handleUpdate);
    if (canvasRef.current) {
      resizeObserver.observe(canvasRef.current);
    }

    return () => {
      window.removeEventListener('resize', handleUpdate);
      window.removeEventListener('scroll', handleUpdate);
      resizeObserver.disconnect();
    };
  }, [canvasRef]);

  // Create map of users for quick lookup
  const userMap = new Map(activeUsers.map(user => [user.id, user]));

  return (
    <div className={className}>
      <AnimatePresence>
        {Array.from(userCursors.entries()).map(([userId, cursor]) => {
          const user = userMap.get(userId);
          if (!user) return null;

          return (
            <AnimatedCursor
              key={userId}
              cursor={cursor}
              user={user}
              canvasRect={canvasRect}
              zoom={zoom}
            />
          );
        })}
      </AnimatePresence>
    </div>
  );
};

// Hook for tracking and sending cursor position
export const useCursorTracking = (
  canvasRef: React.RefObject<HTMLElement>,
  onCursorUpdate: (position: { x: number; y: number }, visible: boolean) => void,
  enabled: boolean = true,
  zoom: number = 1
) => {
  useEffect(() => {
    if (!enabled || !canvasRef.current) return;

    const canvas = canvasRef.current;
    let isMouseInCanvas = false;
    let lastUpdateTime = 0;
    const updateThrottle = 50; // 20fps max

    const handleMouseMove = (event: MouseEvent) => {
      const now = Date.now();
      if (now - lastUpdateTime < updateThrottle) return;
      
      const rect = canvas.getBoundingClientRect();
      const position = {
        x: (event.clientX - rect.left) / zoom,
        y: (event.clientY - rect.top) / zoom,
      };

      onCursorUpdate(position, isMouseInCanvas);
      lastUpdateTime = now;
    };

    const handleMouseEnter = () => {
      isMouseInCanvas = true;
    };

    const handleMouseLeave = () => {
      isMouseInCanvas = false;
      onCursorUpdate({ x: 0, y: 0 }, false);
    };

    // Add event listeners
    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('mouseenter', handleMouseEnter);
    canvas.addEventListener('mouseleave', handleMouseLeave);

    // Handle window blur/focus for cursor visibility
    const handleWindowBlur = () => {
      onCursorUpdate({ x: 0, y: 0 }, false);
    };

    window.addEventListener('blur', handleWindowBlur);

    return () => {
      canvas.removeEventListener('mousemove', handleMouseMove);
      canvas.removeEventListener('mouseenter', handleMouseEnter);
      canvas.removeEventListener('mouseleave', handleMouseLeave);
      window.removeEventListener('blur', handleWindowBlur);
    };
  }, [enabled, canvasRef, onCursorUpdate, zoom]);
};