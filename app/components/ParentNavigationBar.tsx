'use client'

import React from "react";
import { useRouter } from "next/navigation";

interface ParentNavigationBarProps {
  activeTab?: string;
  onTabChange?: (tab: string) => void;
}

export default function ParentNavigationBar({ activeTab = "감정비교", onTabChange }: ParentNavigationBarProps) {
  const router = useRouter();

  const tabs = [
    {
      id: "감정비교",
      label: "감정비교",
      path: "/present",
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      )
    },
    {
      id: "childList",
      label: "아이 목록",
      path: "/childList",
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      )
    },
  ];

  const handleTabClick = (tab: any) => {
    onTabChange?.(tab.id);
    router.push(tab.path);
  };

  return (
    <div className="w-full bg-white py-3 mt-auto">
      <div className="flex justify-around items-center w-full max-w-sm mx-auto">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => handleTabClick(tab)}
            className={`flex flex-col items-center py-2 px-4 rounded-lg transition-colors ${
              activeTab === tab.id
                ? "text-red-600"
                : "text-gray-400"
            }`}
          >
            <div className="mb-1">
              {tab.icon}
            </div>
            <span className="text-xs font-medium">{tab.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
} 