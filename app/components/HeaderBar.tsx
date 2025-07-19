'use client'

import React from 'react';
import { useRouter } from 'next/navigation';

interface HeaderBarProps {
  childName: string;
  inviteCode?: string;
  showChildListButton?: boolean;
  showSettingsButton?: boolean;
  onChildListClick?: () => void;
  onSettingsClick?: () => void;
}

export default function HeaderBar({
  childName,
  inviteCode,
  showChildListButton = false,
  showSettingsButton = false,
  onChildListClick,
  onSettingsClick
}: HeaderBarProps) {
  const router = useRouter();

  const handleChildListClick = () => {
    if (onChildListClick) {
      onChildListClick();
    } else {
      router.push('/childList');
    }
  };

  const handleSettingsClick = () => {
    if (onSettingsClick) {
      onSettingsClick();
    } else {
      router.push('/settings');
    }
  };

  return (
    <div className="flex items-end justify-between w-full">
      <div className="flex items-end gap-1">
        <span className="text-gray-900 font-semibold text-2xl">{childName}</span>
        {inviteCode && (
          <span className="text-sm text-gray-500 font-medium">
            #{inviteCode}
          </span>
        )}
        {showChildListButton && (
          <button
            onClick={handleChildListClick}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors ml-2 flex items-center justify-center"
            title="아이 목록"
          >
            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </button>
        )}
      </div>
      {showSettingsButton && (
        <button
          onClick={handleSettingsClick}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors flex items-center justify-center"
          title="설정"
        >
          <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </button>
      )}
    </div>
  );
} 