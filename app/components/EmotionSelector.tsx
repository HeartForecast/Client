'use client'

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { EmotionType, CATEGORY_COLORS } from '../types/common';

interface EmotionSelectorProps {
  onEmotionSelect: (emotion: EmotionType, category: string) => void;
  selectedEmotion?: EmotionType | null;
  className?: string;
}

export default function EmotionSelector({ 
  onEmotionSelect, 
  selectedEmotion,
  className = ""
}: EmotionSelectorProps) {
  const [emotions, setEmotions] = useState<EmotionType[]>([]);
  const [emotionCategories, setEmotionCategories] = useState<{[key: string]: EmotionType[]}>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 감정 목록 조회
  const fetchEmotions = async () => {
    try {
      setIsLoading(true);
      const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
      const response = await fetch(`${apiBaseUrl}/api/emotionTypes/emotionType`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('감정 목록 조회에 실패했습니다.');
      }

      const emotionData: EmotionType[] = await response.json();
      setEmotions(emotionData);

      // 감정을 타입별로 그룹화
      const grouped = emotionData.reduce((acc, emotion) => {
        if (!acc[emotion.type]) {
          acc[emotion.type] = [];
        }
        acc[emotion.type].push(emotion);
        return acc;
      }, {} as {[key: string]: EmotionType[]});

      setEmotionCategories(grouped);
    } catch (error) {
      console.error('감정 목록 조회 실패:', error);
      setError('감정 목록을 불러오는데 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchEmotions();
  }, []);

  const handleEmotionClick = (category: string, emotion: EmotionType) => {
    onEmotionSelect(emotion, category);
  };

  const fadeInOutVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
    exit: { opacity: 0, y: -10, transition: { duration: 0.3 } },
  };

  if (isLoading) {
    return (
      <div className={`text-center py-8 ${className}`}>
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
        <p className="text-gray-600">감정 목록을 불러오는 중...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`text-center py-8 ${className}`}>
        <p className="text-red-500 text-sm mb-4">{error}</p>
        <button 
          onClick={fetchEmotions}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg text-sm hover:bg-blue-600"
        >
          다시 시도
        </button>
      </div>
    );
  }

  return (
    <div className={`w-full space-y-6 ${className}`}>
      {Object.entries(emotionCategories).map(([category, categoryEmotions]) => (
        <motion.div
          key={category}
          variants={fadeInOutVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          className="w-full"
        >
          <div className="text-sm font-medium text-gray-600 mb-3">{category}</div>
          <div className="flex flex-wrap gap-2">
            {categoryEmotions.map((emotion) => {
              const isSelected = selectedEmotion?.id === emotion.id;
              const categoryColor = CATEGORY_COLORS[category as keyof typeof CATEGORY_COLORS];
              
              return (
                <motion.button
                  key={`${category}-${emotion.id}`}
                  type="button"
                  className={`
                    px-4 py-2 rounded-full text-sm font-medium transition-all duration-200
                    border inline-flex items-center justify-center
                    ${isSelected 
                      ? 'text-white shadow-lg transform scale-105' 
                      : 'text-gray-700 hover:shadow-md hover:scale-105'
                    }
                  `}
                  style={{
                    backgroundColor: isSelected ? categoryColor : 'transparent',
                    borderColor: categoryColor,
                  }}
                  onClick={() => handleEmotionClick(category, emotion)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {emotion.name}
                </motion.button>
              );
            })}
          </div>
        </motion.div>
      ))}
    </div>
  );
} 