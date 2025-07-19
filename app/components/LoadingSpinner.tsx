'use client'

import React from 'react';

interface LoadingSpinnerProps {
  message?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export default function LoadingSpinner({ 
  message = "로딩 중...", 
  size = 'md',
  className = ""
}: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'h-6 w-6',
    md: 'h-8 w-8',
    lg: 'h-12 w-12'
  };

  return (
    <div className={`flex flex-col items-center justify-center ${className}`}>
      <div className={`animate-spin rounded-full border-b-2 border-gray-900 mx-auto mb-4 ${sizeClasses[size]}`}></div>
      <p className="text-gray-600 text-sm">{message}</p>
    </div>
  );
} 