/**
 * PresenceBar Component
 * Shows active collaborators and connection status
 */

'use client';

import React, { useState } from 'react';
import { Users, Wifi, WifiOff, Settings, MessageSquare } from 'lucide-react';
import { CollaborationUser, SyncPreferences } from '@/types/collaboration';
import { WebSocketStatus } from '@/lib/collaboration/websocket';

interface PresenceBarProps {
  currentUser: CollaborationUser | null;
  activeUsers: CollaborationUser[];
  connectionStatus: WebSocketStatus;
  isConnected: boolean;
  syncPreferences: SyncPreferences;
  onUpdateSyncPreferences: (preferences: Partial<SyncPreferences>) => void;
  onToggleChat?: () => void;
  className?: string;
}

const ConnectionStatusIndicator: React.FC<{ status: WebSocketStatus; isConnected: boolean }> = ({
  status,
  isConnected,
}) => {
  const getStatusColor = () => {
    switch (status) {
      case 'connected':
        return 'text-green-500';
      case 'connecting':
      case 'reconnecting':
        return 'text-yellow-500';
      case 'disconnected':
        return 'text-gray-400';
      case 'error':
        return 'text-red-500';
      default:
        return 'text-gray-400';
    }
  };

  const getStatusText = () => {
    switch (status) {
      case 'connected':
        return 'Connected';
      case 'connecting':
        return 'Connecting...';
      case 'reconnecting':
        return 'Reconnecting...';
      case 'disconnected':
        return 'Offline';
      case 'error':
        return 'Connection Error';
      default:
        return 'Unknown';
    }
  };

  return (
    <div className="flex items-center gap-2">
      {isConnected ? (
        <Wifi className={`w-4 h-4 ${getStatusColor()}`} />
      ) : (
        <WifiOff className={`w-4 h-4 ${getStatusColor()}`} />
      )}
      <span className={`text-sm ${getStatusColor()}`}>
        {getStatusText()}
      </span>
    </div>
  );
};

const UserAvatar: React.FC<{ 
  user: CollaborationUser; 
  size?: 'sm' | 'md'; 
  showTooltip?: boolean;
}> = ({ user, size = 'md', showTooltip = true }) => {
  const sizeClasses = {
    sm: 'w-6 h-6 text-xs',
    md: 'w-8 h-8 text-sm',
  };

  const initials = user.name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="relative group">
      <div
        className={`${sizeClasses[size]} rounded-full flex items-center justify-center text-white font-medium border-2 border-white shadow-sm`}
        style={{ backgroundColor: user.color }}
        title={showTooltip ? `${user.name} (${user.permissions})` : undefined}
      >
        {user.avatar ? (
          <img 
            src={user.avatar} 
            alt={user.name}
            className="w-full h-full rounded-full object-cover"
          />
        ) : (
          initials
        )}
      </div>
      
      {/* Status indicator */}
      <div className="absolute -bottom-1 -right-1 w-3 h-3 rounded-full border border-white">
        <div
          className={`w-full h-full rounded-full ${
            user.status === 'active' 
              ? 'bg-green-400' 
              : user.status === 'idle' 
              ? 'bg-yellow-400' 
              : 'bg-gray-400'
          }`}
        />
      </div>

      {/* Tooltip */}
      {showTooltip && (
        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
          {user.name}
          <div className="text-gray-300 text-xs">{user.permissions}</div>
        </div>
      )}
    </div>
  );
};

const SyncPreferencesPanel: React.FC<{
  preferences: SyncPreferences;
  onUpdate: (preferences: Partial<SyncPreferences>) => void;
  onClose: () => void;
}> = ({ preferences, onUpdate, onClose }) => {
  return (
    <div className="absolute top-full right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 p-4 z-50">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium text-gray-900">Collaboration Settings</h3>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600"
        >
          ×
        </button>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <label className="text-sm text-gray-700">Real-time sync</label>
          <input
            type="checkbox"
            checked={preferences.enableRealTimeSync}
            onChange={(e) => onUpdate({ enableRealTimeSync: e.target.checked })}
            className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
          />
        </div>

        <div className="flex items-center justify-between">
          <label className="text-sm text-gray-700">Show cursors</label>
          <input
            type="checkbox"
            checked={preferences.enableCursorSharing}
            onChange={(e) => onUpdate({ enableCursorSharing: e.target.checked })}
            className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
          />
        </div>

        <div className="flex items-center justify-between">
          <label className="text-sm text-gray-700">Component locking</label>
          <input
            type="checkbox"
            checked={preferences.enableComponentLocking}
            onChange={(e) => onUpdate({ enableComponentLocking: e.target.checked })}
            className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
          />
        </div>

        <div className="flex items-center justify-between">
          <label className="text-sm text-gray-700">Chat notifications</label>
          <input
            type="checkbox"
            checked={preferences.enableChatNotifications}
            onChange={(e) => onUpdate({ enableChatNotifications: e.target.checked })}
            className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm text-gray-700 mb-2">
            Auto-save interval (seconds)
          </label>
          <input
            type="range"
            min="1"
            max="30"
            value={preferences.autoSaveInterval / 1000}
            onChange={(e) => onUpdate({ autoSaveInterval: parseInt(e.target.value) * 1000 })}
            className="w-full"
          />
          <div className="text-xs text-gray-500 mt-1">
            {preferences.autoSaveInterval / 1000}s
          </div>
        </div>

        <div>
          <label className="block text-sm text-gray-700 mb-2">
            Conflict resolution
          </label>
          <select
            value={preferences.conflictResolutionStrategy}
            onChange={(e) => onUpdate({ 
              conflictResolutionStrategy: e.target.value as SyncPreferences['conflictResolutionStrategy']
            })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="auto">Automatic</option>
            <option value="manual">Manual</option>
            <option value="ask_user">Ask me</option>
          </select>
        </div>
      </div>
    </div>
  );
};

export const PresenceBar: React.FC<PresenceBarProps> = ({
  currentUser,
  activeUsers,
  connectionStatus,
  isConnected,
  syncPreferences,
  onUpdateSyncPreferences,
  onToggleChat,
  className = '',
}) => {
  const [showSettings, setShowSettings] = useState(false);

  const totalUsers = activeUsers.length + (currentUser ? 1 : 0);

  return (
    <div className={`flex items-center justify-between bg-white border-b border-gray-200 px-4 py-2 ${className}`}>
      {/* Left side - Connection status and user count */}
      <div className="flex items-center gap-4">
        <ConnectionStatusIndicator status={connectionStatus} isConnected={isConnected} />
        
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Users className="w-4 h-4" />
          <span>{totalUsers} user{totalUsers !== 1 ? 's' : ''} online</span>
        </div>
      </div>

      {/* Center - Active users */}
      <div className="flex items-center gap-2">
        {currentUser && (
          <div className="flex items-center gap-2">
            <UserAvatar user={currentUser} size="sm" />
            <span className="text-xs text-gray-500">(You)</span>
          </div>
        )}
        
        {activeUsers.slice(0, 5).map((user) => (
          <UserAvatar key={user.id} user={user} size="sm" />
        ))}
        
        {activeUsers.length > 5 && (
          <div className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center text-xs text-gray-600 border border-gray-200">
            +{activeUsers.length - 5}
          </div>
        )}
      </div>

      {/* Right side - Actions */}
      <div className="flex items-center gap-2">
        {onToggleChat && (
          <button
            onClick={onToggleChat}
            className="p-2 rounded-md hover:bg-gray-100 transition-colors"
            title="Toggle chat"
          >
            <MessageSquare className="w-4 h-4 text-gray-600" />
          </button>
        )}

        <div className="relative">
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="p-2 rounded-md hover:bg-gray-100 transition-colors"
            title="Collaboration settings"
          >
            <Settings className="w-4 h-4 text-gray-600" />
          </button>

          {showSettings && (
            <SyncPreferencesPanel
              preferences={syncPreferences}
              onUpdate={onUpdateSyncPreferences}
              onClose={() => setShowSettings(false)}
            />
          )}
        </div>
      </div>

      {/* Overlay to close settings panel */}
      {showSettings && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setShowSettings(false)}
        />
      )}
    </div>
  );
};