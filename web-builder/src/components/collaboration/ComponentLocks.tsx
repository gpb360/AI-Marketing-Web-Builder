/**
 * ComponentLocks Component
 * Visual indicators for components being edited by other users
 */

'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, Edit3, Move, MousePointer2 } from 'lucide-react';
import { ComponentLock, CollaborationUser } from '@/types/collaboration';
import { ComponentData } from '@/types/builder';

interface ComponentLocksProps {
  componentLocks: Map<string, ComponentLock>;
  activeUsers: CollaborationUser[];
  components: ComponentData[];
  currentUserId: string;
  zoom?: number;
  className?: string;
}

interface LockIndicatorProps {
  lock: ComponentLock;
  user: CollaborationUser;
  component: ComponentData;
  zoom: number;
}

const LockIcon: React.FC<{ lockType: ComponentLock['lockType']; size?: number }> = ({ 
  lockType, 
  size = 16 
}) => {
  const iconProps = { size, className: "text-white drop-shadow-sm" };
  
  switch (lockType) {
    case 'editing':
      return <Edit3 {...iconProps} />;
    case 'moving':
      return <Move {...iconProps} />;
    case 'resizing':
      return <MousePointer2 {...iconProps} />;
    default:
      return <Lock {...iconProps} />;
  }
};

const LockIndicator: React.FC<LockIndicatorProps> = ({ 
  lock, 
  user, 
  component, 
  zoom 
}) => {
  const isExpired = new Date() > lock.expiresAt;
  
  if (isExpired) return null;

  const getLockTypeText = () => {
    switch (lock.lockType) {
      case 'editing':
        return 'editing';
      case 'moving':
        return 'moving';
      case 'resizing':
        return 'resizing';
      default:
        return 'locked';
    }
  };

  const timeRemaining = Math.max(0, lock.expiresAt.getTime() - Date.now());
  const timeRemainingSeconds = Math.ceil(timeRemaining / 1000);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8 }}
      className="absolute pointer-events-none z-40"
      style={{
        left: (component.position.x * zoom) - 2,
        top: (component.position.y * zoom) - 2,
        width: (component.size.width * zoom) + 4,
        height: (component.size.height * zoom) + 4,
      }}
    >
      {/* Lock border */}
      <div
        className="absolute inset-0 border-2 border-dashed rounded-md"
        style={{ 
          borderColor: user.color,
          boxShadow: `0 0 0 1px rgba(255, 255, 255, 0.8)`,
        }}
      />

      {/* Lock indicator badge */}
      <div
        className="absolute -top-6 left-0 flex items-center gap-1 px-2 py-1 rounded-md text-white text-xs font-medium whitespace-nowrap shadow-lg"
        style={{ backgroundColor: user.color }}
      >
        <LockIcon lockType={lock.lockType} size={12} />
        <span>{user.name} is {getLockTypeText()}</span>
        {timeRemainingSeconds > 0 && (
          <span className="opacity-75">({timeRemainingSeconds}s)</span>
        )}
      </div>

      {/* Pulsing animation for active editing */}
      {lock.lockType === 'editing' && (
        <motion.div
          className="absolute inset-0 border-2 rounded-md"
          style={{ borderColor: user.color }}
          animate={{
            opacity: [0.3, 0.7, 0.3],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      )}
    </motion.div>
  );
};

const ComponentOverlay: React.FC<{
  component: ComponentData;
  lock: ComponentLock;
  user: CollaborationUser;
  zoom: number;
}> = ({ component, lock, user, zoom }) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 0.1 }}
      exit={{ opacity: 0 }}
      className="absolute pointer-events-none z-30"
      style={{
        left: component.position.x * zoom,
        top: component.position.y * zoom,
        width: component.size.width * zoom,
        height: component.size.height * zoom,
        backgroundColor: user.color,
      }}
    />
  );
};

export const ComponentLocks: React.FC<ComponentLocksProps> = ({
  componentLocks,
  activeUsers,
  components,
  currentUserId,
  zoom = 1,
  className = '',
}) => {
  // Create user lookup map
  const userMap = new Map(activeUsers.map(user => [user.id, user]));
  
  // Create component lookup map
  const componentMap = new Map(components.map(comp => [comp.id, comp]));

  // Filter out expired locks and locks from current user
  const activeLocks = Array.from(componentLocks.entries())
    .filter(([, lock]) => {
      return lock.userId !== currentUserId && 
             new Date() <= lock.expiresAt;
    })
    .map(([componentId, lock]) => ({
      componentId,
      lock,
      user: userMap.get(lock.userId),
      component: componentMap.get(componentId),
    }))
    .filter(item => item.user && item.component);

  if (activeLocks.length === 0) return null;

  return (
    <div className={`absolute inset-0 pointer-events-none ${className}`}>
      <AnimatePresence>
        {activeLocks.map(({ componentId, lock, user, component }) => (
          <React.Fragment key={componentId}>
            {/* Component overlay */}
            <ComponentOverlay
              component={component!}
              lock={lock}
              user={user!}
              zoom={zoom}
            />
            
            {/* Lock indicator */}
            <LockIndicator
              lock={lock}
              user={user!}
              component={component!}
              zoom={zoom}
            />
          </React.Fragment>
        ))}
      </AnimatePresence>
    </div>
  );
};

// Hook for managing component locking
export const useComponentLocking = (
  componentId: string | null,
  isComponentLocked: (componentId: string) => boolean,
  lockComponent: (componentId: string, lockType: ComponentLock['lockType']) => void,
  unlockComponent: (componentId: string) => void,
  enabled: boolean = true
) => {
  const lockTimeoutRef = React.useRef<NodeJS.Timeout | null>(null);

  // Auto-lock component when starting to edit
  const startEditing = React.useCallback((lockType: ComponentLock['lockType'] = 'editing') => {
    if (!enabled || !componentId || isComponentLocked(componentId)) return false;
    
    lockComponent(componentId, lockType);
    
    // Set auto-unlock timer (25 seconds, gives 5 second buffer before server expires it)
    if (lockTimeoutRef.current) {
      clearTimeout(lockTimeoutRef.current);
    }
    
    lockTimeoutRef.current = setTimeout(() => {
      unlockComponent(componentId);
    }, 25000);
    
    return true;
  }, [enabled, componentId, isComponentLocked, lockComponent, unlockComponent]);

  // Stop editing and unlock component
  const stopEditing = React.useCallback(() => {
    if (!componentId) return;
    
    if (lockTimeoutRef.current) {
      clearTimeout(lockTimeoutRef.current);
      lockTimeoutRef.current = null;
    }
    
    unlockComponent(componentId);
  }, [componentId, unlockComponent]);

  // Extend lock if still editing
  const extendLock = React.useCallback((lockType: ComponentLock['lockType'] = 'editing') => {
    if (!enabled || !componentId) return;
    
    lockComponent(componentId, lockType);
    
    // Reset auto-unlock timer
    if (lockTimeoutRef.current) {
      clearTimeout(lockTimeoutRef.current);
    }
    
    lockTimeoutRef.current = setTimeout(() => {
      unlockComponent(componentId);
    }, 25000);
  }, [enabled, componentId, lockComponent, unlockComponent]);

  // Check if component is locked by another user
  const isLockedByOthers = React.useCallback(() => {
    return componentId ? isComponentLocked(componentId) : false;
  }, [componentId, isComponentLocked]);

  // Cleanup on unmount or component change
  React.useEffect(() => {
    return () => {
      if (lockTimeoutRef.current) {
        clearTimeout(lockTimeoutRef.current);
      }
      if (componentId) {
        unlockComponent(componentId);
      }
    };
  }, [componentId, unlockComponent]);

  return {
    startEditing,
    stopEditing,
    extendLock,
    isLockedByOthers,
  };
};