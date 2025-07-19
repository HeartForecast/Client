'use client'

import React, { useState, useEffect, Suspense } from "react";
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
  const forecastId = searchParams.get('forecastId');

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
    router.push(`/insert-after/reason?step=${currentStep}&forecastId=${forecastId}&date=${searchParams.get('date')}&timeZone=${searchParams.get('timeZone')}`);
  };

  const isEmotionSelected = selectedEmotion !== null;

  return (
    <div className="container">
      <div className="min-h-screen flex flex-col bg-white text-black">
        <div className="flex-1 flex flex-col px-4 pt-10 pb-5">
          {/* 로고 */}
          <div className="flex justify-center mb-4 w-full">
            <div className="flex items-center gap-2">
              <img src="/logo_not_title.svg" alt="HeartForecast" className="w-10 h-10" />
            </div>
          </div>
          
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
            
            <EmotionSelector
              onEmotionSelect={handleEmotionSelect}
              selectedEmotion={selectedEmotion}
            />

            <div className="w-full mt-8">
              <Button
                onClick={handleNext}
                disabled={!isEmotionSelected || isLoading}
                className="w-full"
              >
                {isLoading ? '처리 중...' : '다음'}
              </Button>
            </div>
          </div>
        </div>
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
