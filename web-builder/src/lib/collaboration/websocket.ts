/**
 * WebSocket Client for Real-time Collaboration
 * Handles connection, event broadcasting, and message routing
 */

import { 
  CollaborationEvent, 
  CollaborationUser, 
  CollaborationError,
  Operation,
  OperationResult
} from '@/types/collaboration';

export type WebSocketStatus = 'connecting' | 'connected' | 'disconnected' | 'error' | 'reconnecting';

export interface WebSocketConfig {
  url: string;
  reconnectAttempts: number;
  reconnectInterval: number;
  heartbeatInterval: number;
  timeout: number;
}

export interface WebSocketMessage {
  type: string;
  payload: any;
  timestamp: Date;
  messageId: string;
}

export class CollaborationWebSocket {
  private ws: WebSocket | null = null;
  private config: WebSocketConfig;
  private status: WebSocketStatus = 'disconnected';
  private reconnectCount = 0;
  private heartbeatTimer: NodeJS.Timeout | null = null;
  private messageQueue: WebSocketMessage[] = [];
  private eventListeners: Map<string, Set<Function>> = new Map();
  
  // Authentication and room context
  private userId: string | null = null;
  private projectId: string | null = null;
  private authToken: string | null = null;
  
  constructor(config: Partial<WebSocketConfig> = {}) {
    this.config = {
      url: config.url || this.getWebSocketUrl(),
      reconnectAttempts: config.reconnectAttempts || 5,
      reconnectInterval: config.reconnectInterval || 3000,
      heartbeatInterval: config.heartbeatInterval || 30000,
      timeout: config.timeout || 10000,
    };
  }

  private getWebSocketUrl(): string {
    // Use different URLs based on environment
    if (typeof window !== 'undefined') {
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const host = process.env.NODE_ENV === 'production' 
        ? window.location.host 
        : 'localhost:8000';
      return `${protocol}//${host}/ws/collaboration`;
    }
    return 'ws://localhost:8000/ws/collaboration';
  }

  /**
   * Connect to the collaboration room
   */
  async connect(userId: string, projectId: string, authToken: string): Promise<void> {
    if (this.status === 'connected' || this.status === 'connecting') {
      return;
    }

    this.userId = userId;
    this.projectId = projectId;
    this.authToken = authToken;
    this.status = 'connecting';

    return new Promise((resolve, reject) => {
      try {
        const wsUrl = `${this.config.url}?userId=${userId}&projectId=${projectId}&token=${authToken}`;
        this.ws = new WebSocket(wsUrl);

        this.ws.onopen = () => {
          this.onConnectionOpen();
          resolve();
        };

        this.ws.onmessage = (event) => {
          this.onMessage(event);
        };

        this.ws.onclose = (event) => {
          this.onConnectionClose(event);
        };

        this.ws.onerror = (error) => {
          this.onConnectionError(error);
          reject(new Error('WebSocket connection failed'));
        };

        // Set connection timeout
        setTimeout(() => {
          if (this.status === 'connecting') {
            this.disconnect();
            reject(new Error('Connection timeout'));
          }
        }, this.config.timeout);

      } catch (error) {
        this.status = 'error';
        reject(error);
      }
    });
  }

  /**
   * Disconnect from the collaboration room
   */
  disconnect(): void {
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
      this.heartbeatTimer = null;
    }

    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }

    this.status = 'disconnected';
    this.reconnectCount = 0;
    this.messageQueue = [];
    this.emit('disconnected');
  }

  /**
   * Send a collaboration event
   */
  sendEvent(event: Omit<CollaborationEvent, 'id' | 'timestamp' | 'userId' | 'projectId'>): void {
    if (!this.userId || !this.projectId) {
      console.error('Cannot send event: user or project not set');
      return;
    }

    const fullEvent: CollaborationEvent = {
      ...event,
      id: this.generateMessageId(),
      timestamp: new Date(),
      userId: this.userId,
      projectId: this.projectId,
    } as CollaborationEvent;

    this.send({
      type: 'collaboration_event',
      payload: fullEvent,
      timestamp: new Date(),
      messageId: this.generateMessageId(),
    });
  }

  /**
   * Send operation for operational transform
   */
  sendOperation(operation: Omit<Operation, 'id' | 'timestamp' | 'userId'>): void {
    if (!this.userId) {
      console.error('Cannot send operation: user not set');
      return;
    }

    const fullOperation: Operation = {
      ...operation,
      id: this.generateMessageId(),
      timestamp: new Date(),
      userId: this.userId,
    };

    this.send({
      type: 'operation',
      payload: fullOperation,
      timestamp: new Date(),
      messageId: this.generateMessageId(),
    });
  }

  /**
   * Request user list for the current room
   */
  requestUserList(): void {
    this.send({
      type: 'get_users',
      payload: {},
      timestamp: new Date(),
      messageId: this.generateMessageId(),
    });
  }

  /**
   * Send cursor position update
   */
  updateCursor(position: { x: number; y: number }, visible: boolean = true): void {
    this.sendEvent({
      type: 'user.cursor_update',
      cursor: {
        userId: this.userId!,
        position,
        visible,
        timestamp: new Date(),
      },
    });
  }

  /**
   * Send component selection event
   */
  selectComponent(componentId: string | null): void {
    this.sendEvent({
      type: 'component.selected',
      componentId,
    });
  }

  /**
   * Lock a component for editing
   */
  lockComponent(componentId: string, lockType: 'editing' | 'moving' | 'resizing'): void {
    this.sendEvent({
      type: 'component.locked',
      lock: {
        componentId,
        userId: this.userId!,
        lockType,
        timestamp: new Date(),
        expiresAt: new Date(Date.now() + 30000), // 30 second lock
      },
    });
  }

  /**
   * Unlock a component
   */
  unlockComponent(componentId: string): void {
    this.sendEvent({
      type: 'component.unlocked',
      componentId,
    });
  }

  /**
   * Send chat message
   */
  sendChatMessage(message: string, componentId?: string): void {
    this.sendEvent({
      type: 'chat.message',
      message,
      timestamp: new Date(),
    });
  }

  /**
   * Add event listener
   */
  on(eventType: string, callback: Function): void {
    if (!this.eventListeners.has(eventType)) {
      this.eventListeners.set(eventType, new Set());
    }
    this.eventListeners.get(eventType)!.add(callback);
  }

  /**
   * Remove event listener
   */
  off(eventType: string, callback: Function): void {
    const listeners = this.eventListeners.get(eventType);
    if (listeners) {
      listeners.delete(callback);
    }
  }

  /**
   * Get current connection status
   */
  getStatus(): WebSocketStatus {
    return this.status;
  }

  /**
   * Check if connected
   */
  isConnected(): boolean {
    return this.status === 'connected' && this.ws?.readyState === WebSocket.OPEN;
  }

  // Private methods

  private send(message: WebSocketMessage): void {
    if (this.isConnected()) {
      this.ws!.send(JSON.stringify(message));
    } else {
      // Queue message for later sending
      this.messageQueue.push(message);
      
      // Attempt to reconnect if not already doing so
      if (this.status === 'disconnected') {
        this.attemptReconnect();
      }
    }
  }

  private onConnectionOpen(): void {
    console.log('WebSocket connected');
    this.status = 'connected';
    this.reconnectCount = 0;
    
    // Send queued messages
    while (this.messageQueue.length > 0) {
      const message = this.messageQueue.shift()!;
      this.ws!.send(JSON.stringify(message));
    }

    // Start heartbeat
    this.startHeartbeat();
    
    this.emit('connected');
  }

  private onMessage(event: MessageEvent): void {
    try {
      const message: WebSocketMessage = JSON.parse(event.data);
      this.handleMessage(message);
    } catch (error) {
      console.error('Failed to parse WebSocket message:', error);
      this.emit('error', {
        type: 'validation',
        message: 'Invalid message format',
        code: 'INVALID_MESSAGE',
        timestamp: new Date(),
        recoverable: true,
      } as CollaborationError);
    }
  }

  private onConnectionClose(event: CloseEvent): void {
    console.log('WebSocket disconnected:', event.code, event.reason);
    this.status = 'disconnected';
    
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
      this.heartbeatTimer = null;
    }

    this.emit('disconnected', { code: event.code, reason: event.reason });

    // Attempt to reconnect if it wasn't a clean close
    if (event.code !== 1000 && this.reconnectCount < this.config.reconnectAttempts) {
      this.attemptReconnect();
    }
  }

  private onConnectionError(error: Event): void {
    console.error('WebSocket error:', error);
    this.status = 'error';
    
    this.emit('error', {
      type: 'connection',
      message: 'WebSocket connection error',
      code: 'CONNECTION_ERROR',
      timestamp: new Date(),
      recoverable: true,
    } as CollaborationError);
  }

  private handleMessage(message: WebSocketMessage): void {
    switch (message.type) {
      case 'collaboration_event':
        this.emit('event', message.payload as CollaborationEvent);
        break;
      
      case 'operation_result':
        this.emit('operation_result', message.payload as OperationResult);
        break;
      
      case 'user_list':
        this.emit('user_list', message.payload as CollaborationUser[]);
        break;
      
      case 'error':
        this.emit('error', message.payload as CollaborationError);
        break;
      
      case 'heartbeat':
        this.emit('heartbeat');
        break;
      
      default:
        console.warn('Unknown message type:', message.type);
    }
  }

  private startHeartbeat(): void {
    this.heartbeatTimer = setInterval(() => {
      if (this.isConnected()) {
        this.send({
          type: 'heartbeat',
          payload: { timestamp: new Date() },
          timestamp: new Date(),
          messageId: this.generateMessageId(),
        });
      }
    }, this.config.heartbeatInterval);
  }

  private attemptReconnect(): void {
    if (this.reconnectCount >= this.config.reconnectAttempts) {
      console.error('Max reconnection attempts reached');
      this.emit('max_reconnect_attempts');
      return;
    }

    this.status = 'reconnecting';
    this.reconnectCount++;
    
    console.log(`Attempting to reconnect (${this.reconnectCount}/${this.config.reconnectAttempts})`);
    
    setTimeout(() => {
      if (this.userId && this.projectId && this.authToken) {
        this.connect(this.userId, this.projectId, this.authToken)
          .catch((error) => {
            console.error('Reconnection failed:', error);
            this.attemptReconnect();
          });
      }
    }, this.config.reconnectInterval * this.reconnectCount);
  }

  private emit(eventType: string, data?: any): void {
    const listeners = this.eventListeners.get(eventType);
    if (listeners) {
      listeners.forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error(`Error in event listener for ${eventType}:`, error);
        }
      });
    }
  }

  private generateMessageId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}

// Export singleton instance
export const collaborationWS = new CollaborationWebSocket();