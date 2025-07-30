/**
 * useCollaboration Hook
 * Manages real-time collaboration state and operations
 */

import { useEffect, useRef, useState, useCallback } from 'react';
import { useBuilderStore } from '@/store/builderStore';
import { 
  CollaborationState, 
  CollaborationUser, 
  CollaborationEvent,
  UserCursor,
  ComponentLock,
  ChatMessage,
  CollaborationError,
  SyncPreferences
} from '@/types/collaboration';
import { ComponentData } from '@/types/builder';
import { collaborationWS, WebSocketStatus } from '@/lib/collaboration/websocket';

interface UseCollaborationOptions {
  projectId: string;
  userId: string;
  userName: string;
  userEmail: string;
  authToken: string;
  autoConnect?: boolean;
  syncPreferences?: Partial<SyncPreferences>;
}

interface UseCollaborationReturn {
  // Connection state
  isConnected: boolean;
  connectionStatus: WebSocketStatus;
  error: CollaborationError | null;
  
  // Users and presence
  currentUser: CollaborationUser | null;
  activeUsers: CollaborationUser[];
  userCursors: Map<string, UserCursor>;
  
  // Component management
  componentLocks: Map<string, ComponentLock>;
  isComponentLocked: (componentId: string) => boolean;
  lockComponent: (componentId: string, lockType: 'editing' | 'moving' | 'resizing') => void;
  unlockComponent: (componentId: string) => void;
  
  // Real-time operations
  updateCursor: (position: { x: number; y: number }, visible?: boolean) => void;
  selectComponent: (componentId: string | null) => void;
  
  // Chat functionality
  chatMessages: ChatMessage[];
  sendChatMessage: (message: string, componentId?: string) => void;
  
  // Connection management
  connect: () => Promise<void>;
  disconnect: () => void;
  reconnect: () => Promise<void>;
  
  // Sync preferences
  syncPreferences: SyncPreferences;
  updateSyncPreferences: (preferences: Partial<SyncPreferences>) => void;
}

const defaultSyncPreferences: SyncPreferences = {
  enableRealTimeSync: true,
  enableCursorSharing: true,
  enableComponentLocking: true,
  enableChatNotifications: true,
  autoSaveInterval: 5000, // 5 seconds
  conflictResolutionStrategy: 'auto',
};

export function useCollaboration(options: UseCollaborationOptions): UseCollaborationReturn {
  const {
    projectId,
    userId,
    userName,
    userEmail,
    authToken,
    autoConnect = true,
    syncPreferences: initialSyncPreferences = {},
  } = options;

  // Builder store actions
  const {
    addComponent,
    updateComponent,
    removeComponent,
    updateComponentPosition,
    updateComponentSize,
    selectComponent: selectComponentInStore,
  } = useBuilderStore();

  // Local collaboration state
  const [collaborationState, setCollaborationState] = useState<CollaborationState>({
    isConnected: false,
    connectionStatus: 'disconnected',
    currentUser: null,
    activeUsers: [],
    userCursors: new Map(),
    componentLocks: new Map(),
    lastPingTime: null,
    connectionId: null,
  });

  const [error, setError] = useState<CollaborationError | null>(null);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [syncPreferences, setSyncPreferences] = useState<SyncPreferences>({
    ...defaultSyncPreferences,
    ...initialSyncPreferences,
  });

  // Refs for stable callbacks
  const lastCursorUpdate = useRef<Date>(new Date());
  const autoSaveTimer = useRef<NodeJS.Timeout | null>(null);
  const isInitialized = useRef(false);

  // Generate user color for cursor/presence
  const getUserColor = useCallback((userId: string): string => {
    const colors = [
      '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7',
      '#DDA0DD', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E9',
    ];
    const hash = userId.split('').reduce((a, b) => {
      a = ((a << 5) - a) + b.charCodeAt(0);
      return a & a;
    }, 0);
    return colors[Math.abs(hash) % colors.length];
  }, []);

  // Create current user object
  const currentUser: CollaborationUser = {
    id: userId,
    name: userName,
    email: userEmail,
    color: getUserColor(userId),
    status: 'active',
    lastSeen: new Date(),
    permissions: 'editor', // TODO: Get from user context
  };

  // WebSocket event handlers
  const handleConnectionStatusChange = useCallback((status: WebSocketStatus) => {
    setCollaborationState(prev => ({
      ...prev,
      connectionStatus: status,
      isConnected: status === 'connected',
    }));
  }, []);

  const handleCollaborationEvent = useCallback((event: CollaborationEvent) => {
    if (!syncPreferences.enableRealTimeSync) return;

    switch (event.type) {
      case 'user.joined':
        setCollaborationState(prev => ({
          ...prev,
          activeUsers: [...prev.activeUsers.filter(u => u.id !== event.user.id), event.user],
        }));
        break;

      case 'user.left':
        setCollaborationState(prev => ({
          ...prev,
          activeUsers: prev.activeUsers.filter(u => u.id !== event.userId),
          userCursors: new Map([...prev.userCursors].filter(([id]) => id !== event.userId)),
          componentLocks: new Map([...prev.componentLocks].filter(([, lock]) => lock.userId !== event.userId)),
        }));
        break;

      case 'user.cursor_update':
        if (syncPreferences.enableCursorSharing && event.userId !== userId) {
          setCollaborationState(prev => ({
            ...prev,
            userCursors: new Map(prev.userCursors.set(event.userId, event.cursor)),
          }));
        }
        break;

      case 'component.added':
        if (event.userId !== userId) {
          addComponent(event.component);
        }
        break;

      case 'component.updated':
        if (event.userId !== userId) {
          updateComponent(event.componentId, event.changes);
        }
        break;

      case 'component.deleted':
        if (event.userId !== userId) {
          removeComponent(event.componentId);
        }
        break;

      case 'component.moved':
        if (event.userId !== userId) {
          updateComponentPosition(event.componentId, event.position);
        }
        break;

      case 'component.resized':
        if (event.userId !== userId) {
          updateComponentSize(event.componentId, event.size);
        }
        break;

      case 'component.selected':
        if (event.userId !== userId) {
          // Show visual indicator of other user's selection
          // This doesn't change our local selection
        }
        break;

      case 'component.locked':
        if (syncPreferences.enableComponentLocking) {
          setCollaborationState(prev => ({
            ...prev,
            componentLocks: new Map(prev.componentLocks.set(event.lock.componentId, event.lock)),
          }));
        }
        break;

      case 'component.unlocked':
        setCollaborationState(prev => ({
          ...prev,
          componentLocks: new Map([...prev.componentLocks].filter(([id]) => id !== event.componentId)),
        }));
        break;

      case 'chat.message':
        const chatMessage: ChatMessage = {
          id: event.id,
          userId: event.userId,
          user: collaborationState.activeUsers.find(u => u.id === event.userId) || currentUser,
          message: event.message,
          timestamp: event.timestamp,
          type: 'text',
        };
        setChatMessages(prev => [...prev, chatMessage]);
        break;
    }
  }, [
    syncPreferences,
    userId,
    addComponent,
    updateComponent,
    removeComponent,
    updateComponentPosition,
    updateComponentSize,
    collaborationState.activeUsers,
    currentUser,
  ]);

  const handleUserList = useCallback((users: CollaborationUser[]) => {
    setCollaborationState(prev => ({
      ...prev,
      activeUsers: users.filter(u => u.id !== userId),
    }));
  }, [userId]);

  const handleError = useCallback((error: CollaborationError) => {
    console.error('Collaboration error:', error);
    setError(error);
    
    // Clear error after 5 seconds for recoverable errors
    if (error.recoverable) {
      setTimeout(() => setError(null), 5000);
    }
  }, []);

  // Connection management
  const connect = useCallback(async () => {
    try {
      setError(null);
      await collaborationWS.connect(userId, projectId, authToken);
      
      setCollaborationState(prev => ({
        ...prev,
        currentUser,
        isConnected: true,
        connectionStatus: 'connected',
      }));

      // Request current user list
      collaborationWS.requestUserList();
    } catch (error) {
      setError({
        type: 'connection',
        message: error instanceof Error ? error.message : 'Connection failed',
        code: 'CONNECTION_FAILED',
        timestamp: new Date(),
        recoverable: true,
      });
    }
  }, [userId, projectId, authToken, currentUser]);

  const disconnect = useCallback(() => {
    collaborationWS.disconnect();
    setCollaborationState(prev => ({
      ...prev,
      isConnected: false,
      connectionStatus: 'disconnected',
      activeUsers: [],
      userCursors: new Map(),
      componentLocks: new Map(),
    }));
  }, []);

  const reconnect = useCallback(async () => {
    disconnect();
    await connect();
  }, [connect, disconnect]);

  // Real-time operations
  const updateCursor = useCallback((position: { x: number; y: number }, visible: boolean = true) => {
    if (!syncPreferences.enableCursorSharing || !collaborationWS.isConnected()) return;
    
    const now = new Date();
    if (now.getTime() - lastCursorUpdate.current.getTime() > 100) { // Throttle to 10fps
      collaborationWS.updateCursor(position, visible);
      lastCursorUpdate.current = now;
    }
  }, [syncPreferences.enableCursorSharing]);

  const selectComponent = useCallback((componentId: string | null) => {
    selectComponentInStore(componentId);
    
    if (collaborationWS.isConnected()) {
      collaborationWS.selectComponent(componentId);
    }
  }, [selectComponentInStore]);

  // Component locking
  const isComponentLocked = useCallback((componentId: string): boolean => {
    const lock = collaborationState.componentLocks.get(componentId);
    if (!lock) return false;
    
    // Check if lock has expired
    if (new Date() > lock.expiresAt) {
      // Remove expired lock
      setCollaborationState(prev => ({
        ...prev,
        componentLocks: new Map([...prev.componentLocks].filter(([id]) => id !== componentId)),
      }));
      return false;
    }
    
    return lock.userId !== userId;
  }, [collaborationState.componentLocks, userId]);

  const lockComponent = useCallback((componentId: string, lockType: 'editing' | 'moving' | 'resizing') => {
    if (!syncPreferences.enableComponentLocking || !collaborationWS.isConnected()) return;
    
    if (!isComponentLocked(componentId)) {
      collaborationWS.lockComponent(componentId, lockType);
    }
  }, [syncPreferences.enableComponentLocking, isComponentLocked]);

  const unlockComponent = useCallback((componentId: string) => {
    if (collaborationWS.isConnected()) {
      collaborationWS.unlockComponent(componentId);
    }
  }, []);

  // Chat functionality
  const sendChatMessage = useCallback((message: string, componentId?: string) => {
    if (collaborationWS.isConnected()) {
      collaborationWS.sendChatMessage(message, componentId);
    }
  }, []);

  // Sync preferences
  const updateSyncPreferences = useCallback((preferences: Partial<SyncPreferences>) => {
    setSyncPreferences(prev => ({ ...prev, ...preferences }));
  }, []);

  // Setup WebSocket event listeners
  useEffect(() => {
    if (isInitialized.current) return;
    isInitialized.current = true;

    collaborationWS.on('connected', () => handleConnectionStatusChange('connected'));
    collaborationWS.on('disconnected', () => handleConnectionStatusChange('disconnected'));
    collaborationWS.on('error', handleError);
    collaborationWS.on('event', handleCollaborationEvent);
    collaborationWS.on('user_list', handleUserList);

    return () => {
      collaborationWS.off('connected', handleConnectionStatusChange);
      collaborationWS.off('disconnected', handleConnectionStatusChange);
      collaborationWS.off('error', handleError);
      collaborationWS.off('event', handleCollaborationEvent);
      collaborationWS.off('user_list', handleUserList);
    };
  }, [
    handleConnectionStatusChange,
    handleError,
    handleCollaborationEvent,
    handleUserList,
  ]);

  // Auto-connect on mount
  useEffect(() => {
    if (autoConnect && !collaborationWS.isConnected()) {
      connect();
    }

    return () => {
      if (autoSaveTimer.current) {
        clearTimeout(autoSaveTimer.current);
      }
    };
  }, [autoConnect, connect]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      disconnect();
    };
  }, [disconnect]);

  return {
    // Connection state
    isConnected: collaborationState.isConnected,
    connectionStatus: collaborationState.connectionStatus,
    error,
    
    // Users and presence
    currentUser: collaborationState.currentUser,
    activeUsers: collaborationState.activeUsers,
    userCursors: collaborationState.userCursors,
    
    // Component management
    componentLocks: collaborationState.componentLocks,
    isComponentLocked,
    lockComponent,
    unlockComponent,
    
    // Real-time operations
    updateCursor,
    selectComponent,
    
    // Chat functionality
    chatMessages,
    sendChatMessage,
    
    // Connection management
    connect,
    disconnect,
    reconnect,
    
    // Sync preferences
    syncPreferences,
    updateSyncPreferences,
  };
}