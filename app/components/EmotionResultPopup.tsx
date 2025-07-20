'use client'

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence, PanInfo } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { CATEGORY_COLORS } from '../types/common';

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

const getEmotionImage = (imageUrl: string) => {
  // DB에서 받은 이미지 URL을 SVG big 버전으로 변환
  console.log('원본 이미지 URL:', imageUrl);
  
  if (!imageUrl) {
    console.error('이미지 URL이 없습니다');
    return '/icon/기쁜-big.svg'; // 기본 이미지
  }
  
  let processedUrl = imageUrl;
  
  // PNG를 SVG로 변경하고 big 버전 사용
  
  // small을 big으로 변경
  
  console.log('최종 SVG URL:', processedUrl);
  return processedUrl;
};

const getTimeSlotLabel = (timeSlot: string) => {
  const timeLabels: { [key: string]: string } = {
    'morning': '아침',
    'afternoon': '점심', 
    'evening': '저녁'
  };
  
  return timeLabels[timeSlot] || timeSlot;
};

const getCategoryColor = (category: string) => {
  return CATEGORY_COLORS[category as keyof typeof CATEGORY_COLORS] || '#666666';
};

export default function EmotionResultPopup({ isVisible, onClose, emotions }: EmotionResultPopupProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const router = useRouter();
  const [dragDirection, setDragDirection] = useState<'left' | 'right' | null>(null);
  const [hasSwiped, setHasSwiped] = useState(false);
  const [slideDirection, setSlideDirection] = useState<'left' | 'right' | null>(null);

  const handleClose = () => {
    onClose();
    router.push('/baby');
  };

  useEffect(() => {
    if (isVisible) {
      setCurrentIndex(0);
      setHasSwiped(false);
      console.log('팝업 열림 - 감정 데이터:', emotions);
    }
  }, [isVisible, emotions]);

  // 키보드 이벤트 처리
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!isVisible || emotions.length <= 1) return;
      
      switch (event.key) {
        case 'ArrowLeft':
          event.preventDefault();
          setCurrentIndex((prev) => (prev + 1) % emotions.length);
          setHasSwiped(true);
          break;
        case 'ArrowRight':
          event.preventDefault();
          setCurrentIndex((prev) => (prev - 1 + emotions.length) % emotions.length);
          setHasSwiped(true);
          break;
      }
    };

    if (isVisible) {
      document.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isVisible, emotions.length]);

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % emotions.length);
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + emotions.length) % emotions.length);
  };

  const handleDragEnd = (event: any, info: PanInfo) => {
    const threshold = 50; // 슬라이드 임계값
    
    if (info.offset.x > threshold) {
      // 오른쪽으로 드래그 - 이전 슬라이드
      setSlideDirection('right');
      setCurrentIndex((prev) => (prev - 1 + emotions.length) % emotions.length);
      setHasSwiped(true);
    } else if (info.offset.x < -threshold) {
      // 왼쪽으로 드래그 - 다음 슬라이드
      setSlideDirection('left');
      setCurrentIndex((prev) => (prev + 1) % emotions.length);
      setHasSwiped(true);
    }
    
    setDragDirection(null);
  };

  if (!isVisible || emotions.length === 0) return null;

  const currentEmotion = emotions[currentIndex];

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black bg-opacity-40 backdrop-blur-md flex items-center justify-center z-50 p-4"
      >
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.8, opacity: 0 }}
          className="w-full max-w-sm relative aspect-[3/3] rounded-2xl overflow-hidden"
          style={{ backgroundColor: getCategoryColor(currentEmotion.category) }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Slide Container */}
          <motion.div
            key={currentIndex}
            initial={{ 
              x: slideDirection === 'left' ? 300 : slideDirection === 'right' ? -300 : 0, 
              opacity: 0 
            }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ 
              x: slideDirection === 'left' ? -300 : slideDirection === 'right' ? 300 : 0, 
              opacity: 0 
            }}
            transition={{ 
              type: "spring", 
              stiffness: 300, 
              damping: 30,
              duration: 0.5 
            }}
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.2}
            onDragEnd={handleDragEnd}
            className="w-full h-full cursor-grab active:cursor-grabbing"
          >
          {/* Result Card */}
          <div className="p-8 h-full flex flex-col">
            {/* Top Row - Temperature */}
            <div className="mb-6">
              {/* Temperature - 왼쪽 상단 */}
              <div className="flex justify-start">
                <span 
                  className="text-5xl font-bold text-white text-right"
                  style={{ fontFamily: 'Cafe24Syongsyong, sans-serif' }}
                >
                  {currentEmotion.emotion.temp}°
                </span>
              </div>
            </div>

            {/* Content Area */}
            <div className="flex-1 flex flex-col justify-center items-center">
              {/* Emotion Icon - 가운데 */}
              <div className="w-40 h-40 mb-6">
                <img 
                  src={getEmotionImage(currentEmotion.emotion.image)} 
                  alt={currentEmotion.emotion.name}
                  className="w-full h-full object-contain"
                  onError={(e) => {
                    console.error('이미지 로딩 실패:', currentEmotion.emotion.image);
                    console.error('감정 데이터:', currentEmotion);
                    // 이미지 로딩 실패 시 기본 이모지 표시
                    e.currentTarget.style.display = 'none';
                    const fallbackDiv = document.createElement('div');
                    fallbackDiv.className = 'w-full h-full flex items-center justify-center text-4xl';
                    fallbackDiv.textContent = '😐';
                    e.currentTarget.parentNode?.appendChild(fallbackDiv);
                  }}
                  onLoad={() => {
                    console.log('이미지 로딩 성공:', currentEmotion.emotion.image);
                  }}
                />
              </div>
            </div>

            {/* Bottom Text */}
            <div className="flex justify-end">
              {/* Result Text */}
              <div 
                className="text-white text-base font-medium leading-relaxed text-right"
                style={{ fontFamily: 'Cafe24Syongsyong, sans-serif' }}
              >
                {getTimeSlotLabel(currentEmotion.step)}의 감정은{' '}
                <span className="font-bold">{currentEmotion.emotion.name}</span>으로<br />
                {currentEmotion.emotion.temp}° 느꼈어요.
              </div>
            </div>
          </div>

          {/* Swipe Hint */}
          {emotions.length > 1 && !hasSwiped && (
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-white text-xs opacity-60 text-center">
              <div>← 슬라이드 →</div>
              <div className="mt-1">또는 화살표 키 사용</div>
            </div>
          )}
          </motion.div>
        </motion.div>
        
        {/* 종료 버튼 */}
        <div className="absolute bottom-20 left-1/2 transform -translate-x-1/2">
          <button
            onClick={handleClose}
            className="bg-white bg-opacity-20 hover:bg-opacity-30 text-black font-medium py-3 px-6 rounded-full transition-all duration-300 backdrop-blur-sm border border-white border-opacity-30"
          >
            돌아가기
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
} 