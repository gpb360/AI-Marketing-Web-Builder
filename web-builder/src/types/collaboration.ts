/**
 * Real-time Collaboration Types
 * Defines the structure for multi-user collaborative editing
 */

import { ComponentData } from './builder';

// User presence and session management
export interface CollaborationUser {
  id: string;
  name: string;
  email: string;
  color: string;
  avatar?: string;
  status: 'active' | 'idle' | 'away';
  lastSeen: Date;
  permissions: UserPermission;
}

export type UserPermission = 'owner' | 'editor' | 'viewer';

// Real-time cursor and selection tracking
export interface UserCursor {
  userId: string;
  position: {
    x: number;
    y: number;
  };
  visible: boolean;
  timestamp: Date;
}

export interface UserSelection {
  userId: string;
  componentId: string | null;
  timestamp: Date;
}

// Component locking for conflict prevention
export interface ComponentLock {
  componentId: string;
  userId: string;
  lockType: 'editing' | 'moving' | 'resizing';
  timestamp: Date;
  expiresAt: Date;
}

// Real-time events for synchronization
export type CollaborationEvent = 
  | UserJoinedEvent
  | UserLeftEvent
  | UserCursorUpdateEvent
  | ComponentAddedEvent
  | ComponentUpdatedEvent
  | ComponentDeletedEvent
  | ComponentMovedEvent
  | ComponentResizedEvent
  | ComponentSelectedEvent
  | ComponentLockedEvent
  | ComponentUnlockedEvent
  | ChatMessageEvent;

export interface BaseCollaborationEvent {
  id: string;
  type: string;
  userId: string;
  timestamp: Date;
  projectId: string;
}

export interface UserJoinedEvent extends BaseCollaborationEvent {
  type: 'user.joined';
  user: CollaborationUser;
}

export interface UserLeftEvent extends BaseCollaborationEvent {
  type: 'user.left';
  userId: string;
}

export interface UserCursorUpdateEvent extends BaseCollaborationEvent {
  type: 'user.cursor_update';
  cursor: UserCursor;
}

export interface ComponentAddedEvent extends BaseCollaborationEvent {
  type: 'component.added';
  component: ComponentData;
  position: { x: number; y: number };
}

export interface ComponentUpdatedEvent extends BaseCollaborationEvent {
  type: 'component.updated';
  componentId: string;
  changes: Partial<ComponentData>;
  version: number;
}

export interface ComponentDeletedEvent extends BaseCollaborationEvent {
  type: 'component.deleted';
  componentId: string;
}

export interface ComponentMovedEvent extends BaseCollaborationEvent {
  type: 'component.moved';
  componentId: string;
  position: { x: number; y: number };
}

export interface ComponentResizedEvent extends BaseCollaborationEvent {
  type: 'component.resized';
  componentId: string;
  size: { width: number; height: number };
}

export interface ComponentSelectedEvent extends BaseCollaborationEvent {
  type: 'component.selected';
  componentId: string | null;
}

export interface ComponentLockedEvent extends BaseCollaborationEvent {
  type: 'component.locked';
  lock: ComponentLock;
}

export interface ComponentUnlockedEvent extends BaseCollaborationEvent {
  type: 'component.unlocked';
  componentId: string;
}

export interface ChatMessageEvent extends BaseCollaborationEvent {
  type: 'chat.message';
  message: string;
  timestamp: Date;
}

// Operational Transform for conflict resolution
export interface Operation {
  id: string;
  type: 'insert' | 'delete' | 'retain' | 'modify';
  position?: number;
  length?: number;
  data?: any;
  componentId?: string;
  property?: string;
  timestamp: Date;
  userId: string;
}

export interface OperationResult {
  applied: boolean;
  transformedOps: Operation[];
  conflicts: ConflictResolution[];
}

export interface ConflictResolution {
  type: 'auto_resolved' | 'manual_required' | 'user_choice_needed';
  description: string;
  operations: Operation[];
  suggestedResolution?: 'accept_local' | 'accept_remote' | 'merge';
}

// WebSocket connection state
export interface CollaborationState {
  isConnected: boolean;
  connectionStatus: 'connecting' | 'connected' | 'disconnected' | 'error';
  currentUser: CollaborationUser | null;
  activeUsers: CollaborationUser[];
  userCursors: Map<string, UserCursor>;
  componentLocks: Map<string, ComponentLock>;
  lastPingTime: Date | null;
  connectionId: string | null;
}

// Room and project context
export interface CollaborationRoom {
  id: string;
  projectId: string;
  name: string;
  activeUsers: string[];
  maxUsers: number;
  createdAt: Date;
  updatedAt: Date;
}

// Chat and communication
export interface ChatMessage {
  id: string;
  userId: string;
  user: CollaborationUser;
  message: string;
  timestamp: Date;
  type: 'text' | 'system' | 'component_mention';
  componentId?: string;
}

// Real-time synchronization preferences
export interface SyncPreferences {
  enableRealTimeSync: boolean;
  enableCursorSharing: boolean;
  enableComponentLocking: boolean;
  enableChatNotifications: boolean;
  autoSaveInterval: number; // milliseconds
  conflictResolutionStrategy: 'auto' | 'manual' | 'ask_user';
}

// Error handling for collaboration
export interface CollaborationError {
  type: 'connection' | 'permission' | 'conflict' | 'validation' | 'timeout';
  message: string;
  code: string;
  timestamp: Date;
  userId?: string;
  componentId?: string;
  recoverable: boolean;
}

// Analytics and monitoring
export interface CollaborationMetrics {
  activeUsers: number;
  totalOperations: number;
  conflictsResolved: number;
  averageLatency: number;
  connectionUptime: number;
  lastSyncTime: Date;
}