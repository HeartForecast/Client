'use client'

import React from 'react';

interface ErrorMessageProps {
  message: string;
  onRetry?: () => void;
  retryText?: string;
  className?: string;
}

export default function ErrorMessage({ 
  message, 
  onRetry, 
  retryText = "다시 시도",
  className = ""
}: ErrorMessageProps) {
  return (
    <div className={`w-full text-center py-8 ${className}`}>
      <div className="text-red-400 mb-2">
        <svg className="w-8 h-8 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </div>
      <p className="text-red-500 text-sm mb-4">{message}</p>
      {onRetry && (
        <button 
          onClick={onRetry}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg text-sm hover:bg-blue-600 transition-colors"
        >
          {retryText}
        </button>
      )}
    </div>
  );
} 