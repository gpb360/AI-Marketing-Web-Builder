'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { useAuthContext } from './AuthProvider';
import theme from '@/lib/theme';

const { luxuryTheme, componentStyles } = theme;
import { User, LogOut, Settings } from 'lucide-react';

interface UserNavProps {
  isMobile?: boolean;
}

export function UserNav({ isMobile = false }: UserNavProps) {
  const { user, isAuthenticated, logout } = useAuthContext();
  const router = useRouter();

  const handleLogout = async () => {
    await logout();
    router.push('/');
  };

  if (!isAuthenticated || !user) {
    // Professional unauthenticated state with luxury styling
    return (
      <div className={`flex items-center ${isMobile ? 'flex-col space-y-3 w-full' : 'space-x-3'}`}>
        {/* Sign In Button - Ghost variant with white text and yellow hover */}
        <motion.button
          onClick={() => router.push('/auth/login')}
          className={`${
            isMobile
              ? 'w-full justify-center py-3 px-6'
              : 'px-4 py-2.5'
          } bg-transparent ${luxuryTheme.colors.text.primary} font-medium rounded-xl transition-all duration-200 hover:${luxuryTheme.colors.text.accent} hover:bg-yellow-400/10 border border-transparent hover:border-yellow-400/20`}
          whileHover={{ scale: isMobile ? 1 : 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          Sign In
        </motion.button>
        
        {/* Sign Up Button - Outline variant with yellow border */}
        <motion.button
          onClick={() => router.push('/auth/register')}
          className={`${
            isMobile
              ? 'w-full justify-center py-3 px-6'
              : 'px-6 py-2.5'
          } bg-gradient-to-r from-yellow-400 to-yellow-500 text-black font-semibold rounded-xl transition-all duration-300 hover:from-yellow-300 hover:to-yellow-400 hover:shadow-2xl hover:shadow-yellow-400/30 hover:-translate-y-1`}
          whileHover={{ scale: isMobile ? 1 : 1.05, y: isMobile ? 0 : -2 }}
          whileTap={{ scale: 0.95 }}
        >
          Get Started
        </motion.button>
      </div>
    );
  }

  // Professional authenticated state
  return (
    <div className={`flex items-center ${isMobile ? 'flex-col space-y-4 w-full' : 'space-x-4'}`}>
      {/* Professional User Profile Section */}
      <motion.div 
        className={`flex items-center space-x-3 ${
          isMobile 
            ? 'w-full justify-center p-4 bg-gray-800/50 backdrop-blur-md rounded-xl border border-gray-700'
            : 'bg-gray-800/30 backdrop-blur-md border border-gray-700/50 rounded-xl px-4 py-2'
        }`}
        whileHover={{ scale: 1.02 }}
      >
        {/* Luxury Avatar */}
        <div className="relative">
          <div className="w-10 h-10 bg-gradient-to-br from-yellow-400 to-yellow-500 rounded-xl flex items-center justify-center shadow-lg shadow-yellow-400/20">
            <User className="w-5 h-5 text-black" />
          </div>
          <div className="absolute -inset-1 bg-gradient-to-br from-yellow-400/20 to-transparent rounded-xl blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        </div>
        
        {/* User Welcome Text */}
        <div className="flex flex-col">
          <span className={`text-sm font-semibold ${luxuryTheme.colors.text.primary}`}>
            Welcome back!
          </span>
          <span className={`text-xs ${luxuryTheme.colors.text.accent} font-medium`}>
            {user.first_name || user.email.split('@')[0]}
          </span>
        </div>
      </motion.div>
      
      {/* Professional Action Buttons */}
      <div className={`flex ${isMobile ? 'w-full space-x-3' : 'space-x-2'}`}>
        {/* Settings Button */}
        <motion.button 
          onClick={() => router.push('/settings')}
          className={`${
            isMobile ? 'flex-1 py-3' : 'p-2.5'
          } bg-gray-800/50 backdrop-blur-md border border-gray-700 ${luxuryTheme.colors.text.secondary} hover:${luxuryTheme.colors.text.accent} hover:border-yellow-400/50 hover:bg-yellow-400/10 rounded-xl transition-all duration-200 flex items-center justify-center space-x-2`}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Settings className="w-4 h-4" />
          {isMobile && <span className="text-sm font-medium">Settings</span>}
        </motion.button>
        
        {/* Professional Sign Out Button */}
        <motion.button 
          onClick={handleLogout}
          className={`${
            isMobile ? 'flex-1 py-3' : 'p-2.5'
          } bg-gray-800/50 backdrop-blur-md border border-gray-700 ${luxuryTheme.colors.text.secondary} hover:text-red-400 hover:border-red-400/50 hover:bg-red-400/10 rounded-xl transition-all duration-200 flex items-center justify-center space-x-2`}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <LogOut className="w-4 h-4" />
          {isMobile && <span className="text-sm font-medium">Sign Out</span>}
        </motion.button>
      </div>
    </div>
  );
}