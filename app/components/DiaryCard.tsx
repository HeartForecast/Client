'use client'

import React from 'react';
import { DiaryTimeData } from '../types/common';

interface DiaryCardProps {
  title: string;
  data: DiaryTimeData;
  type: 'forecast' | 'record'; // 예보인지 기록인지 구분
  className?: string;
}

export default function DiaryCard({ title, data, type, className = "" }: DiaryCardProps) {
  const emotions = type === 'forecast' ? data.predictedEmotions : data.actualEmotions;
  const text = type === 'forecast' ? data.predictedText : data.actualText;
  const defaultEmotionText = type === 'forecast' ? '예상 감정' : '실제 감정';
  const defaultText = type === 'forecast' ? '예보 메모가 없습니다.' : '실제 기록이 없습니다.';

  return (
    <div className={`bg-white rounded-2xl p-5 border border-gray-100 ${className}`}>
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm font-medium text-[#FF6F71]">{title}</span>
        <span className="text-sm text-gray-400">
          {emotions?.map((e, index) => (
            <span 
              key={`${e.emotion}-${index}`}
              className="inline-block px-2 py-1 rounded-full text-xs font-medium mr-1"
              style={{ backgroundColor: e.color + '20', color: e.color }}
            >
              {e.emotion}
            </span>
          )) || defaultEmotionText}
        </span>
      </div>
      <p className="text-base text-gray-600 leading-normal">
        {text || defaultText}
      </p>
    </div>
  );
} 