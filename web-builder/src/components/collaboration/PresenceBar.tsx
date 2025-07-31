'use client';

import React from 'react';
import { Users } from 'lucide-react';

interface PresenceBarProps {
  activeUsers: any[];
  isConnected: boolean;
  connectionStatus: string;
  className?: string;
}

export function PresenceBar({ activeUsers, isConnected, connectionStatus, className = '' }: PresenceBarProps) {
  return (
    <div className={`bg-gray-900 border-b border-gray-800 px-4 py-2 ${className}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className={`flex items-center space-x-1 ${
            isConnected ? 'text-green-500' : 'text-red-500'
          }`}>
            <span className="text-sm font-medium">
              {isConnected ? 'Connected' : 'Disconnected'}
            </span>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Users className="w-4 h-4 text-gray-400" />
            <span className="text-sm text-gray-300">
              {activeUsers.length} {activeUsers.length === 1 ? 'user' : 'users'} online
            </span>
          </div>

          <div className="flex items-center space-x-2">
            {activeUsers.map((user) => (
              <div 
                key={user.id}
                className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white"
                style={{ backgroundColor: user.color || '#3b82f6' }}
                title={user.name}
              >
                {user.name?.[0]?.toUpperCase() || 'U'}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export function FloatingPresenceIndicator({ activeUsers, isConnected, className = '' }: { 
  activeUsers: any[]; 
  isConnected: boolean; 
  className?: string;
}) {
  return (
    <div className={`fixed bottom-4 right-4 bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 shadow-lg ${className}`}>
      <div className="flex items-center space-x-2">
        <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
        <span className="text-sm text-white">
          {isConnected ? `${activeUsers.length} viewing` : 'Offline'}
        </span>
        
        <div className="flex -space-x-1">
          {activeUsers.slice(0, 3).map((user) => (
            <div
              key={user.id}
              className="w-6 h-6 rounded-full border-2 border-gray-900 flex items-center justify-center text-xs font-bold"
              style={{ backgroundColor: user.color || '#3b82f6' }}
              title={user.name}
            >
              {user.name?.[0]?.toUpperCase() || 'U'}
            </div>
          ))}
          {activeUsers.length > 3 && (
            <div className="w-6 h-6 rounded-full bg-gray-700 border-2 border-gray-900 flex items-center justify-center text-xs font-bold text-white">
              +{activeUsers.length - 3}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}