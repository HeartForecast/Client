'use client'

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface EmotionData {
  step: string;
  emotion: {
    id: number;
    name: string;
    type: string;
    temp: number;
    image: string;
  };
  category: string;
  memo?: string;
}

interface EmotionResultPopupProps {
  isVisible: boolean;
  onClose: () => void;
  emotions: EmotionData[];
}

const TIME_PERIODS = {
  morning: { label: '오전', text: '오전의 감정은' },
  afternoon: { label: '오후', text: '오후의 감정은' },
  evening: { label: '저녁', text: '저녁의 감정은' }
};

const getEmotionColor = (type: string) => {
  switch (type) {
    case 'positive':
      return 'bg-red-500';
    case 'negative':
      return 'bg-blue-500';
    default:
      return 'bg-gray-500';
  }
};

const getTemperatureColor = (temp: number) => {
  if (temp >= 0) return 'text-red-600';
  return 'text-blue-600';
};

export default function EmotionResultPopup({ isVisible, onClose, emotions }: EmotionResultPopupProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % emotions.length);
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + emotions.length) % emotions.length);
  };

  const currentEmotion = emotions[currentIndex];
  const step = currentEmotion?.step as keyof typeof TIME_PERIODS;

  if (!isVisible || !currentEmotion) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-white rounded-2xl p-6 w-full max-w-sm relative"
          onClick={(e) => e.stopPropagation()}
        >
          {/* 닫기 버튼 */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          {/* 슬라이드 컨테이너 */}
          <div className="relative overflow-hidden">
            <motion.div
              key={currentIndex}
              initial={{ x: 300, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -300, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="text-center"
            >
              {/* 시간대 표시 */}
              <div className="mb-4">
                <span className="text-sm text-gray-500 font-medium">
                  {TIME_PERIODS[step]?.label}
                </span>
              </div>

              {/* 감정 카드 */}
              <div className={`rounded-2xl p-6 mb-6 ${getEmotionColor(currentEmotion.emotion.type)}`}>
                <div className="flex items-center justify-between mb-4">
                  {/* 온도 */}
                  <div className="text-left">
                    <span className={`text-4xl font-bold ${getTemperatureColor(currentEmotion.emotion.temp)}`}>
                      {currentEmotion.emotion.temp > 0 ? '+' : ''}{currentEmotion.emotion.temp}°
                    </span>
                  </div>
                  
                  {/* 감정 아이콘 */}
                  <div className="text-right">
                    <div className="w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                      <img 
                        src={currentEmotion.emotion.image} 
                        alt={currentEmotion.emotion.name}
                        className="w-10 h-10"
                      />
                    </div>
                  </div>
                </div>

                {/* 감정 설명 */}
                <div className="text-white text-left">
                  <p className="text-lg font-medium">
                    {TIME_PERIODS[step]?.text} {currentEmotion.emotion.name}으로 {currentEmotion.emotion.temp > 0 ? '+' : ''}{currentEmotion.emotion.temp}° 예정이에요.
                  </p>
                </div>
              </div>

              {/* 메모 (있는 경우) */}
              {currentEmotion.memo && (
                <div className="bg-gray-50 rounded-xl p-4 mb-4">
                  <p className="text-sm text-gray-600 text-left">
                    "{currentEmotion.memo}"
                  </p>
                </div>
              )}

              {/* 감정 카테고리 */}
              <div className="text-center">
                <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                  currentEmotion.emotion.type === 'positive' 
                    ? 'bg-red-100 text-red-700' 
                    : 'bg-blue-100 text-blue-700'
                }`}>
                  {currentEmotion.category}
                </span>
              </div>
            </motion.div>
          </div>

          {/* 네비게이션 */}
          {emotions.length > 1 && (
            <div className="flex items-center justify-between mt-6">
              <button
                onClick={prevSlide}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                disabled={currentIndex === 0}
              >
                <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>

              {/* 인디케이터 */}
              <div className="flex space-x-2">
                {emotions.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentIndex(index)}
                    className={`w-2 h-2 rounded-full transition-colors ${
                      index === currentIndex ? 'bg-blue-500' : 'bg-gray-300'
                    }`}
                  />
                ))}
              </div>

              <button
                onClick={nextSlide}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                disabled={currentIndex === emotions.length - 1}
              >
                <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          )}

          {/* 완료 버튼 */}
          <div className="mt-6">
            <button
              onClick={onClose}
              className="w-full bg-blue-500 hover:bg-blue-600 text-white font-medium py-3 px-4 rounded-lg transition-colors"
            >
              확인
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
} 