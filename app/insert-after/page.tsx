'use client'

import React, { useState, useEffect, Suspense } from "react";
import { motion } from "framer-motion";
import { useRouter, useSearchParams } from "next/navigation";
import Button from "../components/Button";
import { useChild } from "../contexts/ChildContext";

const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;

// 감정 타입 정의
interface EmotionType {
  id: number;
  name: string;
  type: string;
  temp: number;
  image: string;
}

const CATEGORY_COLORS = {
  긍정: '#FF7B6F',
  중립: '#FFD340',
  부정: '#3DC8EF'
};

const TIME_PERIODS = {
  morning: { label: '아침', text: '아침에는 어떤 감정을' },
  afternoon: { label: '점심', text: '점심에는 어떤 감정을' },
  evening: { label: '저녁', text: '저녁에는 어떤 감정을' }
};

function InsertAfterPageContent() {
  const { selectedChild } = useChild();
  const [emotions, setEmotions] = useState<EmotionType[]>([]);
  const [emotionCategories, setEmotionCategories] = useState<{[key: string]: EmotionType[]}>({});
  const [selectedEmotion, setSelectedEmotion] = useState<{
    emotion: EmotionType;
    categoryIdx: number;
    emotionIdx: number;
  } | null>(null);
  const [currentStep, setCurrentStep] = useState<'morning' | 'afternoon' | 'evening'>('morning');
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingEmotions, setIsLoadingEmotions] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [savedSteps, setSavedSteps] = useState<Set<string>>(new Set());
  const router = useRouter();
  const searchParams = useSearchParams();
  const forecastId = searchParams.get('forecastId');

  // 감정 목록 조회
  const fetchEmotions = async () => {
    try {
      setIsLoadingEmotions(true);
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
      setIsLoadingEmotions(false);
    }
  };

  useEffect(() => {
    fetchEmotions();
  }, []);

  useEffect(() => {
    const step = searchParams.get('step') as 'morning' | 'afternoon' | 'evening';
    if (step && ['morning', 'afternoon', 'evening'].includes(step)) {
      setCurrentStep(step);
    }
  }, [searchParams]);

  const handleEmotionClick = (categoryIdx: number, emotionIdx: number) => {
    const categories = Object.entries(emotionCategories);
    const [categoryName, categoryEmotions] = categories[categoryIdx];
    const emotion = categoryEmotions[emotionIdx];
    
    setSelectedEmotion({
      emotion,
      categoryIdx,
      emotionIdx
    });
  };

  const handleBack = () => {
    window.history.back();
  };

  const handleNext = () => {
    if (!selectedEmotion) return;
    
    // 현재 선택된 감정을 localStorage에 저장
    const currentEmotionData = {
      step: currentStep,
      emotion: selectedEmotion.emotion,
      category: Object.keys(emotionCategories)[selectedEmotion.categoryIdx]
    };

    // 기존 데이터 가져오기
    let allEmotionData = [];
    if (typeof window !== 'undefined') {
      const existingData = localStorage.getItem('forecastRecordEmotions');
      if (existingData) {
        allEmotionData = JSON.parse(existingData);
      }
      
      // 현재 단계 데이터 업데이트
      allEmotionData = allEmotionData.filter((data: any) => data.step !== currentStep);
      allEmotionData.push(currentEmotionData);
      localStorage.setItem('forecastRecordEmotions', JSON.stringify(allEmotionData));
    }

    console.log(`${currentStep} 감정 저장:`, currentEmotionData);

    // reason 페이지로 이동
    router.push(`/insert-after/reason?step=${currentStep}&forecastId=${forecastId}&date=${searchParams.get('date')}&timeZone=${searchParams.get('timeZone')}`);
  };

  const isEmotionSelected = selectedEmotion !== null;

  // 현재 날짜 포맷팅
  const getCurrentDate = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const fadeInOutVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
    exit: { opacity: 0, y: -10, transition: { duration: 0.3 } },
  };

  if (isLoadingEmotions) {
    return (
      <div className="container">
        <div className="min-h-screen flex items-center justify-center bg-white">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
            <p className="text-gray-600">감정 목록을 불러오는 중...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="min-h-screen flex flex-col bg-white text-black">
        <div className="flex-1 flex flex-col px-4 pt-10 pb-5">
          <div className="w-full max-w-sm mx-auto">
            <button className="mb-4 cursor-pointer" onClick={handleBack}>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
            </button>
          </div>
          <div className="flex flex-col items-start justify-start flex-grow w-full max-w-sm mx-auto mt-4">
            <div className="text-xs text-gray-400 mb-2">{getCurrentDate()} {TIME_PERIODS[currentStep].label}</div>
            <div className="text-2xl font-bold leading-tight whitespace-pre-line mb-8">
              {TIME_PERIODS[currentStep].text}{`\n`}느꼈나요?
            </div>
            
            {error && (
              <div className="w-full mb-4 text-sm text-red-500 text-center">
                {error}
              </div>
            )}
            
            <div className="w-full space-y-6">
              {Object.entries(emotionCategories).map(([category, categoryEmotions], categoryIdx) => (
                <div key={category} className="w-full">
                  <div className="text-sm font-medium text-gray-600 mb-3">{category}</div>
                  <div className="flex flex-wrap gap-2">
                    {categoryEmotions.map((emotion, emotionIdx) => {
                      const isSelected = selectedEmotion && 
                        selectedEmotion.categoryIdx === categoryIdx && 
                        selectedEmotion.emotionIdx === emotionIdx;
                      const categoryColor = CATEGORY_COLORS[category as keyof typeof CATEGORY_COLORS];
                      
                      return (
                        <motion.button
                          key={`${category}-${emotion.id}`}
                          type="button"
                          className={`
                            px-4 py-2 rounded-full text-sm font-medium transition-all duration-200
                            border inline-flex items-center justify-center
                            ${isSelected
                              ? "text-white border-transparent"
                              : "bg-white text-gray-700 border-gray-300 hover:border-gray-400"
                            }
                            focus:outline-none
                          `}
                          style={{
                            fontFamily: 'inherit',
                            fontWeight: 500,
                            fontSize: '14px',
                            minHeight: '36px',
                            whiteSpace: 'nowrap',
                            backgroundColor: isSelected ? categoryColor : 'white'
                          }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => handleEmotionClick(categoryIdx, emotionIdx)}
                          disabled={isLoading}
                        >
                          {emotion.name}
                        </motion.button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        <motion.div
          key="final-button"
          initial="hidden"
          animate="visible"
          variants={fadeInOutVariants}
          className="flex flex-col items-center w-full max-w-sm mx-auto mb-4 px-4"
        >
          <Button
            className={`flex w-full items-center justify-center gap-1 rounded-lg bg-[#FF6F71] text-white py-3 text-lg font-semibold text-gray-900 mb-4 transition-opacity ${isEmotionSelected && !isLoading ? '' : 'opacity-50 cursor-not-allowed'}`}
            disabled={!isEmotionSelected || isLoading}
            onClick={handleNext}
          >
            {isLoading ? (
              <div className="flex items-center gap-2">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                처리 중...
              </div>
            ) : (
              '다음으로'
            )}
          </Button>
        </motion.div>
      </div>
    </div>
  );
}

export default function InsertPage() {
  return (
    <Suspense fallback={
      <div className="container">
        <div className="min-h-screen flex items-center justify-center bg-white">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
            <p className="text-gray-600">로딩 중...</p>
          </div>
        </div>
      </div>
    }>
      <InsertAfterPageContent />
    </Suspense>
  );
}
