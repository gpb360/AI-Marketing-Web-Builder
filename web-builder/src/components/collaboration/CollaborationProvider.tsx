/**
 * CollaborationProvider Component
 * Main provider that integrates all collaboration features
 */

'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useBuilderStore } from '@/store/builderStore';
import { useCollaboration } from '@/hooks/useCollaboration';
import { useCursorTracking } from './UserCursors';
import { useComponentLocking } from './ComponentLocks';
import { PresenceBar } from './PresenceBar';
import { UserCursors } from './UserCursors';
import { ComponentLocks } from './ComponentLocks';
import { CollaborationChat, ChatToggleButton } from './CollaborationChat';

interface CollaborationProviderProps {
  projectId: string;
  userId: string;
  userName: string;
  userEmail: string;
  authToken: string;
  children: React.ReactNode;
  canvasRef?: React.RefObject<HTMLElement>;
  className?: string;
}

export const CollaborationProvider: React.FC<CollaborationProviderProps> = ({
  projectId,
  userId,
  userName,
  userEmail,
  authToken,
  children,
  canvasRef,
  className = '',
}) => {
  // Builder store state
  const { 
    components, 
    selectedComponentId, 
    zoom,
    selectComponent: selectComponentInStore,
  } = useBuilderStore();

  // Collaboration state and actions
  const collaboration = useCollaboration({
    projectId,
    userId,
    userName,
    userEmail,
    authToken,
    autoConnect: true,
  });

  // Local UI state
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [showPresenceBar, setShowPresenceBar] = useState(true);
  const internalCanvasRef = useRef<HTMLDivElement>(null);
  
  // Use provided canvasRef or internal one
  const activeCanvasRef = canvasRef || internalCanvasRef;

  // Component locking for selected component
  const componentLocking = useComponentLocking(
    selectedComponentId,
    collaboration.isComponentLocked,
    collaboration.lockComponent,
    collaboration.unlockComponent,
    collaboration.syncPreferences.enableComponentLocking
  );

  // Cursor tracking
  useCursorTracking(
    activeCanvasRef,
    collaboration.updateCursor,
    collaboration.syncPreferences.enableCursorSharing && collaboration.isConnected,
    zoom
  );

  // Handle component selection with locking
  const handleComponentSelect = (componentId: string | null) => {
    // Unlock previous component
    if (selectedComponentId) {
      componentLocking.stopEditing();
    }

    // Select new component
    collaboration.selectComponent(componentId);

    // Lock new component if it's not locked by others
    if (componentId && !collaboration.isComponentLocked(componentId)) {
      componentLocking.startEditing('editing');
    }
  };

  // Auto-lock component when starting drag/resize operations
  useEffect(() => {
    const handleDragStart = () => {
      if (selectedComponentId && !collaboration.isComponentLocked(selectedComponentId)) {
        componentLocking.startEditing('moving');
      }
    };

    const handleResizeStart = () => {
      if (selectedComponentId && !collaboration.isComponentLocked(selectedComponentId)) {
        componentLocking.startEditing('resizing');
      }
    };

    // Listen for drag/resize events from the builder
    // This would typically be integrated with your existing drag/drop system
    document.addEventListener('component-drag-start', handleDragStart);
    document.addEventListener('component-resize-start', handleResizeStart);

    return () => {
      document.removeEventListener('component-drag-start', handleDragStart);
      document.removeEventListener('component-resize-start', handleResizeStart);
    };
  }, [selectedComponentId, collaboration.isComponentLocked, componentLocking]);

  // Calculate unread messages count
  const unreadMessagesCount = collaboration.chatMessages.filter(m => 
    m.userId !== userId && 
    m.timestamp > (collaboration.currentUser?.lastSeen || new Date(0))
  ).length;

  // Handle chat toggle
  const handleChatToggle = () => {
    setIsChatOpen(!isChatOpen);
  };

  const handleChatClose = () => {
    setIsChatOpen(false);
  };

  // Render connection error state
  if (collaboration.error && !collaboration.error.recoverable) {
    return (
      <div className={`flex flex-col h-full ${className}`}>
        <div className="bg-red-50 border-l-4 border-red-400 p-4">
          <div className="flex">
            <div className="ml-3">
              <p className="text-sm text-red-700">
                <strong>Collaboration Error:</strong> {collaboration.error.message}
              </p>
              <button
                onClick={collaboration.reconnect}
                className="mt-2 text-sm text-red-600 underline hover:text-red-800"
              >
                Try reconnecting
              </button>
            </div>
          </div>
        </div>
        {children}
      </div>
    );
  }

  return (
    <div className={`flex flex-col h-full relative ${className}`}>
      {/* Presence bar */}
      {showPresenceBar && (
        <PresenceBar
          currentUser={collaboration.currentUser}
          activeUsers={collaboration.activeUsers}
          connectionStatus={collaboration.connectionStatus}
          isConnected={collaboration.isConnected}
          syncPreferences={collaboration.syncPreferences}
          onUpdateSyncPreferences={collaboration.updateSyncPreferences}
          onToggleChat={handleChatToggle}
        />
      )}

      {/* Main content area */}
      <div className="flex-1 relative overflow-hidden">
        {/* Canvas wrapper with internal ref if none provided */}
        {!canvasRef ? (
          <div ref={internalCanvasRef} className="w-full h-full">
            {children}
          </div>
        ) : (
          children
        )}

        {/* Collaboration overlays */}
        {collaboration.isConnected && (
          <>
            {/* Component locks */}
            <ComponentLocks
              componentLocks={collaboration.componentLocks}
              activeUsers={collaboration.activeUsers}
              components={components}
              currentUserId={userId}
              zoom={zoom}
              className="absolute inset-0 pointer-events-none"
            />

            {/* User cursors */}
            <UserCursors
              userCursors={collaboration.userCursors}
              activeUsers={collaboration.activeUsers}
              canvasRef={activeCanvasRef}
              zoom={zoom}
            />
          </>
        )}
      </div>

      {/* Chat system */}
      {collaboration.isConnected && (
        <>
          <CollaborationChat
            messages={collaboration.chatMessages}
            currentUser={collaboration.currentUser}
            onSendMessage={collaboration.sendChatMessage}
            isOpen={isChatOpen}
            onToggle={handleChatToggle}
            onClose={handleChatClose}
          />

          {!isChatOpen && (
            <ChatToggleButton
              onClick={handleChatToggle}
              unreadCount={unreadMessagesCount}
            />
          )}
        </>
      )}

      {/* Connection status overlay for disconnected state */}
      {!collaboration.isConnected && collaboration.connectionStatus !== 'disconnected' && (
        <div className="absolute inset-0 bg-black bg-opacity-10 flex items-center justify-center pointer-events-none z-50">
          <div className="bg-white rounded-lg shadow-lg p-4 flex items-center gap-3">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-500"></div>
            <span className="text-gray-700">
              {collaboration.connectionStatus === 'connecting' && 'Connecting to collaboration...'}
              {collaboration.connectionStatus === 'reconnecting' && 'Reconnecting...'}
              {collaboration.connectionStatus === 'error' && 'Connection failed. Retrying...'}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

// Enhanced version with additional customization options
export interface CollaborationConfigProps extends CollaborationProviderProps {
  enablePresenceBar?: boolean;
  enableChat?: boolean;
  enableCursorSharing?: boolean;
  enableComponentLocking?: boolean;
  customCursorColors?: Record<string, string>;
  onUserJoin?: (user: any) => void;
  onUserLeave?: (userId: string) => void;
  onComponentLock?: (componentId: string, userId: string) => void;
  onComponentUnlock?: (componentId: string) => void;
}

export const CollaborationProviderWithConfig: React.FC<CollaborationConfigProps> = ({
  enablePresenceBar = true,
  enableChat = true,
  enableCursorSharing = true,
  enableComponentLocking = true,
  onUserJoin,
  onUserLeave,
  onComponentLock,
  onComponentUnlock,
  ...props
}) => {
  // Apply configuration overrides
  const configuredProps = {
    ...props,
    syncPreferences: {
      enableRealTimeSync: true,
      enableCursorSharing,
      enableComponentLocking,
      enableChatNotifications: enableChat,
      autoSaveInterval: 5000,
      conflictResolutionStrategy: 'auto' as const,
      ...props.syncPreferences,
    },
  };

  return <CollaborationProvider {...configuredProps} />;
};

// Hook for accessing collaboration context in child components
export const useCollaborationContext = () => {
  // This would typically use React Context to access collaboration state
  // For now, we'll return the hook directly
  return {
    // These would be provided by context
    isConnected: false,
    activeUsers: [],
    currentUser: null,
    sendMessage: () => {},
    lockComponent: () => {},
    unlockComponent: () => {},
  };
};