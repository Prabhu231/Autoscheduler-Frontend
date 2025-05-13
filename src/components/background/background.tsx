'use client';

import { ReactNode } from 'react';
import { cn } from '@/lib/utils'; 
import { motion } from 'framer-motion';

interface BackgroundWrapperProps {
  children: ReactNode;
  variant?: 'default' | 'gradient' | 'dark';
}

const BackgroundWrapper = ({ 
  children, 
  variant = 'default' 
}: BackgroundWrapperProps) => {
  return (
    <div className="relative min-h-screen w-full overflow-hidden">
      {/* Base background */}
      <div 
        className={cn(
          "absolute inset-0 z-0",
          variant === 'default' && "bg-gradient-to-br from-blue-50 to-indigo-50",
          variant === 'gradient' && "bg-gradient-to-br from-purple-50 via-pink-50 to-amber-50",
          variant === 'dark' && "bg-gradient-to-br from-gray-900 to-slate-800"
        )}
      />

      {/* Subtle decorative pattern */}
      <div 
        className="absolute inset-0 z-0 opacity-20" 
        style={{ 
          backgroundImage: "radial-gradient(circle at 1px 1px, rgba(0,0,0,0.1) 1px, transparent 0)",
          backgroundSize: "40px 40px" 
        }}
      />

      {/* Animated decorative elements */}
      <motion.div
        className="absolute top-20 left-10 w-64 h-64 rounded-full bg-blue-300 opacity-10 z-0 blur-3xl"
        animate={{
          x: [0, 50, 0],
          y: [0, 30, 0],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          repeatType: "reverse",
        }}
      />
      
      <motion.div
        className="absolute bottom-20 right-10 w-96 h-96 rounded-full bg-purple-300 opacity-10 z-0 blur-3xl"
        animate={{
          x: [0, -70, 0],
          y: [0, -40, 0],
        }}
        transition={{
          duration: 25,
          repeat: Infinity,
          repeatType: "reverse",
        }}
      />

      <motion.div
        className="absolute top-1/3 right-1/4 w-72 h-72 rounded-full bg-pink-300 opacity-5 z-0 blur-3xl"
        animate={{
          x: [0, 60, 0],
          y: [0, -30, 0],
        }}
        transition={{
          duration: 30,
          repeat: Infinity,
          repeatType: "reverse",
        }}
      />

      {/* Main content container with proper z-index to appear above background elements */}
      <div className="relative z-10 min-h-screen w-full">
        {children}
      </div>
    </div>
  );
}

export default BackgroundWrapper