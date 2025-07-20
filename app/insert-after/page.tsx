'use client'

import React, { useState, useEffect, Suspense } from "react";
import { motion } from "framer-motion";
import { useRouter, useSearchParams } from "next/navigation";
import Button from "../components/Button";
import { useChild } from "../contexts/ChildContext";
import { EmotionType, TIME_PERIODS, TimeSlot } from "../types/common";
import { getCurrentDate } from "../utils/dateUtils";
import EmotionSelector from "../components/EmotionSelector";
import EmotionResultPopup from "../components/EmotionResultPopup";

function InsertAfterPageContent() {
  const { selectedChild } = useChild();
  const [selectedEmotion, setSelectedEmotion] = useState<EmotionType | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [currentStep, setCurrentStep] = useState<TimeSlot>('morning');
  const [isLoading, setIsLoading] = useState(false);
  const [savedSteps, setSavedSteps] = useState<Set<string>>(new Set());
  
  const router = useRouter();
  const searchParams = useSearchParams();
  const baseForecastId = searchParams.get('forecastId');
  
  // 각 시간대별 예보 ID 계산 (아침: baseId-1, 점심: baseId, 저녁: baseId+1)
  const getForecastIdForStep = (step: TimeSlot) => {
    if (!baseForecastId) return null;
    const baseId = parseInt(baseForecastId);
    let forecastId: number;
    
    switch (step) {
      case 'morning':
        forecastId = baseId; // 아침은 baseId보다 1 작음
        break;
      case 'afternoon':
        forecastId = baseId + 1; // 점심은 baseId
        break;
      case 'evening':
        forecastId = baseId + 1; // 저녁은 baseId보다 1 큼
        break;
      default:
        forecastId = baseId;
    }
    
    console.log(`📊 ${step} 단계 예보 ID 계산: baseId=${baseId}, forecastId=${forecastId}`);
    return forecastId;
  };

  useEffect(() => {
    const step = searchParams.get('step') as TimeSlot;
    if (step && ['morning', 'afternoon', 'evening'].includes(step)) {
      setCurrentStep(step);
    }
  }, [searchParams]);

  const handleEmotionSelect = (emotion: EmotionType, category: string) => {
    setSelectedEmotion(emotion);
    setSelectedCategory(category);
  };

  const handleBack = () => {
    window.history.back();
  };

  const handleNext = () => {
    if (!selectedEmotion) return;
    
    // 현재 선택된 감정을 localStorage에 저장
    const currentEmotionData = {
      step: currentStep,
      emotion: selectedEmotion,
      category: selectedCategory
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
    const currentForecastId = getForecastIdForStep(currentStep);
    router.push(`/insert-after/reason?step=${currentStep}&forecastId=${currentForecastId}&date=${searchParams.get('date')}&timeZone=${searchParams.get('timeZone')}`);
  };

  const isEmotionSelected = selectedEmotion !== null;

  const fadeInOutVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
    exit: { opacity: 0, y: -10, transition: { duration: 0.3 } },
  };

  return (
    <div className="container">
      <div className="h-screen flex flex-col px-4 pt-6 pb-3 bg-white text-black">
        
        <div className="w-full max-w-sm mx-auto mb-2">
          <button className="cursor-pointer" onClick={handleBack}>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
        </div>
        
        <div className="flex flex-col items-start justify-start flex-1 w-full max-w-sm mx-auto">
          <div className="text-xs text-gray-400 mb-2">{getCurrentDate()} {TIME_PERIODS[currentStep].label}</div>
          <div className="text-2xl font-bold leading-tight whitespace-pre-line mb-5">
            {TIME_PERIODS[currentStep].text}{`\n`}느꼈나요?
          </div>
          
          <div className="w-full flex-grow">
            <EmotionSelector
              onEmotionSelect={handleEmotionSelect}
              selectedEmotion={selectedEmotion}
            />
          </div>
        </div>
        
        <motion.div
          key="final-button"
          initial="hidden"
          animate="visible"
          variants={fadeInOutVariants}
          className="flex flex-col items-center w-full max-w-sm mx-auto mt-auto mb-20"
        >
          <Button
            onClick={handleNext}
            disabled={!isEmotionSelected || isLoading}
            className={`w-full transition-opacity ${!isEmotionSelected ? 'opacity-50' : ''}`}
          >
            {isLoading ? '처리 중...' : '다음으로'}
          </Button>
        </motion.div>
      </div>
    </div>
  );
}

export default function InsertAfterPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <InsertAfterPageContent />
    </Suspense>
  );
}
