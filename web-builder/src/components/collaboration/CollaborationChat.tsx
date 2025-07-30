/**
 * CollaborationChat Component
 * Team chat for collaborative editing
 */

'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MessageSquare, 
  Send, 
  X, 
  Minimize2, 
  Maximize2,
  Clock,
  AtSign
} from 'lucide-react';
import { ChatMessage, CollaborationUser } from '@/types/collaboration';

interface CollaborationChatProps {
  messages: ChatMessage[];
  currentUser: CollaborationUser | null;
  onSendMessage: (message: string, componentId?: string) => void;
  isOpen: boolean;
  onToggle: () => void;
  onClose: () => void;
  className?: string;
}

interface ChatMessageProps {
  message: ChatMessage;
  currentUserId: string | null;
  onMentionClick?: (userId: string) => void;
}

const formatTimestamp = (timestamp: Date): string => {
  const now = new Date();
  const diff = now.getTime() - timestamp.getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;
  
  return timestamp.toLocaleDateString();
};

const ChatMessageItem: React.FC<ChatMessageProps> = ({ 
  message, 
  currentUserId,
  onMentionClick 
}) => {
  const isOwnMessage = message.userId === currentUserId;
  const isSystemMessage = message.type === 'system';

  if (isSystemMessage) {
    return (
      <div className="flex justify-center my-2">
        <div className="px-3 py-1 bg-gray-100 rounded-full text-xs text-gray-600">
          {message.message}
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'} mb-3`}
    >
      <div className={`max-w-xs ${isOwnMessage ? 'order-2' : 'order-1'}`}>
        {/* User info */}
        {!isOwnMessage && (
          <div className="flex items-center gap-2 mb-1">
            <div
              className="w-4 h-4 rounded-full border border-white"
              style={{ backgroundColor: message.user.color }}
            />
            <span className="text-xs font-medium text-gray-700">
              {message.user.name}
            </span>
            <span className="text-xs text-gray-400">
              {formatTimestamp(message.timestamp)}
            </span>
          </div>
        )}

        {/* Message bubble */}
        <div
          className={`px-3 py-2 rounded-lg ${
            isOwnMessage
              ? 'bg-blue-500 text-white'
              : 'bg-gray-100 text-gray-900'
          }`}
        >
          <div className="text-sm whitespace-pre-wrap break-words">
            {message.message}
          </div>
          
          {isOwnMessage && (
            <div className="text-xs opacity-75 mt-1">
              {formatTimestamp(message.timestamp)}
            </div>
          )}
        </div>

        {/* Component mention indicator */}
        {message.type === 'component_mention' && message.componentId && (
          <div className="text-xs text-blue-600 mt-1 flex items-center gap-1">
            <AtSign className="w-3 h-3" />
            Referenced component
          </div>
        )}
      </div>
    </motion.div>
  );
};

const ChatInput: React.FC<{
  onSendMessage: (message: string) => void;
  disabled?: boolean;
  placeholder?: string;
}> = ({ onSendMessage, disabled = false, placeholder = "Type a message..." }) => {
  const [message, setMessage] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim() && !disabled) {
      onSendMessage(message.trim());
      setMessage('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-2 p-3 border-t border-gray-200">
      <input
        ref={inputRef}
        type="text"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        disabled={disabled}
        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
      />
      <button
        type="submit"
        disabled={!message.trim() || disabled}
        className="px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
      >
        <Send className="w-4 h-4" />
      </button>
    </form>
  );
};

export const CollaborationChat: React.FC<CollaborationChatProps> = ({
  messages,
  currentUser,
  onSendMessage,
  isOpen,
  onToggle,
  onClose,
  className = '',
}) => {
  const [isMinimized, setIsMinimized] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (messagesEndRef.current && !isMinimized) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isMinimized]);

  // Mark unread messages as read when chat is opened
  useEffect(() => {
    if (isOpen && !isMinimized) {
      // TODO: Mark messages as read
    }
  }, [isOpen, isMinimized]);

  if (!isOpen) return null;

  const unreadCount = messages.filter(m => 
    m.userId !== currentUser?.id && 
    m.timestamp > (currentUser?.lastSeen || new Date(0))
  ).length;

  return (
    <motion.div
      initial={{ opacity: 0, x: 300 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 300 }}
      className={`fixed right-4 bottom-4 w-80 bg-white rounded-lg shadow-xl border border-gray-200 z-50 ${className}`}
    >
      {/* Chat header */}
      <div className="flex items-center justify-between p-3 border-b border-gray-200 bg-gray-50 rounded-t-lg">
        <div className="flex items-center gap-2">
          <MessageSquare className="w-4 h-4 text-gray-600" />
          <span className="font-medium text-gray-900">Team Chat</span>
          {unreadCount > 0 && !isMinimized && (
            <span className="px-2 py-1 bg-red-500 text-white text-xs rounded-full">
              {unreadCount}
            </span>
          )}
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={() => setIsMinimized(!isMinimized)}
            className="p-1 rounded hover:bg-gray-200 transition-colors"
            title={isMinimized ? 'Maximize' : 'Minimize'}
          >
            {isMinimized ? (
              <Maximize2 className="w-4 h-4 text-gray-600" />
            ) : (
              <Minimize2 className="w-4 h-4 text-gray-600" />
            )}
          </button>
          
          <button
            onClick={onClose}
            className="p-1 rounded hover:bg-gray-200 transition-colors"
            title="Close chat"
          >
            <X className="w-4 h-4 text-gray-600" />
          </button>
        </div>
      </div>

      {!isMinimized && (
        <>
          {/* Messages container */}
          <div
            ref={messagesContainerRef}
            className="h-64 overflow-y-auto p-3 bg-white"
          >
            {messages.length === 0 ? (
              <div className="flex items-center justify-center h-full text-gray-500 text-sm">
                <div className="text-center">
                  <MessageSquare className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p>No messages yet</p>
                  <p className="text-xs mt-1">Start a conversation with your team</p>
                </div>
              </div>
            ) : (
              <>
                <AnimatePresence>
                  {messages.map((message) => (
                    <ChatMessageItem
                      key={message.id}
                      message={message}
                      currentUserId={currentUser?.id || null}
                    />
                  ))}
                </AnimatePresence>
                <div ref={messagesEndRef} />
              </>
            )}
          </div>

          {/* Message input */}
          <ChatInput
            onSendMessage={onSendMessage}
            disabled={!currentUser}
            placeholder={
              currentUser 
                ? "Type a message..." 
                : "Connect to start chatting..."
            }
          />
        </>
      )}

      {/* Minimized state */}
      {isMinimized && unreadCount > 0 && (
        <div className="p-2 text-center bg-blue-50 rounded-b-lg">
          <span className="text-sm text-blue-600">
            {unreadCount} new message{unreadCount !== 1 ? 's' : ''}
          </span>
        </div>
      )}
    </motion.div>
  );
};

// Chat toggle button for when chat is closed
export const ChatToggleButton: React.FC<{
  onClick: () => void;
  unreadCount?: number;
  className?: string;
}> = ({ onClick, unreadCount = 0, className = '' }) => {
  return (
    <motion.button
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      onClick={onClick}
      className={`fixed bottom-4 right-4 w-12 h-12 bg-blue-500 text-white rounded-full shadow-lg hover:bg-blue-600 transition-colors z-40 ${className}`}
      title="Open team chat"
    >
      <MessageSquare className="w-6 h-6 mx-auto" />
      
      {unreadCount > 0 && (
        <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
          {unreadCount > 9 ? '9+' : unreadCount}
        </div>
      )}
    </motion.button>
  );
};