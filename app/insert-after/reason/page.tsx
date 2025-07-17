'use client'

import React, { useState, useEffect, Suspense } from "react";
import { motion } from "framer-motion";
import { useRouter, useSearchParams } from "next/navigation";
import Button from "../../components/Button";
import { useChild } from "../../contexts/ChildContext";

const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;

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
}

const TIME_PERIODS = {
  morning: { label: '아침', text: '왜 이런 감정을' },
  afternoon: { label: '점심', text: '왜 이런 감정을' },
  evening: { label: '저녁', text: '왜 이런 감정을' }
};

function ReasonPageContent() {
  const { selectedChild } = useChild();
  const [currentEmotion, setCurrentEmotion] = useState<EmotionData | null>(null);
  const [currentStep, setCurrentStep] = useState<'morning' | 'afternoon' | 'evening'>('morning');
  const [reason, setReason] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showCompletionModal, setShowCompletionModal] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const forecastId = searchParams.get('forecastId');

  useEffect(() => {
    const step = searchParams.get('step') as 'morning' | 'afternoon' | 'evening';
    if (step && ['morning', 'afternoon', 'evening'].includes(step)) {
      setCurrentStep(step);
    }

    // localStorage에서 현재 단계의 감정 데이터 가져오기
    if (typeof window !== 'undefined') {
      const savedEmotions = localStorage.getItem('forecastRecordEmotions');
      if (savedEmotions) {
        try {
          const emotions = JSON.parse(savedEmotions);
          console.log('저장된 감정 데이터:', emotions);
          
          const currentEmotionData = emotions.find((item: any) => item.step === step);
          if (currentEmotionData) {
            setCurrentEmotion({
              step: currentEmotionData.step,
              emotion: currentEmotionData.emotion,
              category: currentEmotionData.category
            });
          } else {
            console.error('현재 단계의 감정 데이터를 찾을 수 없습니다.');
            setError('감정 데이터를 찾을 수 없습니다.');
          }
        } catch (error) {
          console.error('감정 데이터 파싱 오류:', error);
          setError('감정 데이터를 불러오는데 실패했습니다.');
        }
      } else {
        console.error('저장된 감정 데이터가 없습니다.');
        setError('감정 데이터를 찾을 수 없습니다.');
      }
    }
  }, [searchParams]);

  const handleBack = () => {
    window.history.back();
  };

  const handleNext = async () => {
    if (reason.trim().length === 0) return;
    if (!currentEmotion || !selectedChild?.id || !forecastId) {
      setError('필수 정보가 누락되었습니다.');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const forecastDate = searchParams.get('date') || new Date().toISOString().split('T')[0];
      const originalTimeZone = searchParams.get('timeZone');
      const currentTimeZone = TIME_PERIODS[currentStep].label;
      
      console.log('디버깅 정보:', {
        currentStep,
        originalTimeZone,
        currentTimeZone,
        forecastDate,
        forecastId
      });
      
      // 현재 단계의 예보 기록 생성
      const recordData = {
        forecastId: Number(forecastId),
        childId: selectedChild.id,
        emotionTypeId: currentEmotion.emotion.id,
        date: forecastDate,
        timeZone: originalTimeZone || currentTimeZone,
        memo: reason.trim()
      };

      console.log(`${currentStep} 예보 기록 생성:`, recordData);

      const response = await fetch(`${apiBaseUrl}/api/forecastRecords/forecastRecord`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(recordData)
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`예보 기록 생성 실패: ${errorText}`);
      }

      console.log(`${currentStep} 예보 기록 생성 완료`);

      // 다음 단계로 이동
      const steps = ['morning', 'afternoon', 'evening'];
      const currentIndex = steps.indexOf(currentStep);
      const nextStep = steps[currentIndex + 1];

      if (nextStep) {
        // localStorage에서 모든 forecastId 가져오기
        let allForecastIds = {};
        if (typeof window !== 'undefined') {
          const savedForecastIds = localStorage.getItem('allForecastIds');
          if (savedForecastIds) {
            allForecastIds = JSON.parse(savedForecastIds);
          }
        }
        
        // 다음 단계의 올바른 forecastId 사용
        const nextForecastId = allForecastIds[nextStep as keyof typeof allForecastIds] || forecastId;
        const nextTimeZone = TIME_PERIODS[nextStep as keyof typeof TIME_PERIODS].label;
        
        console.log('다음 단계 이동:', {
          currentStep,
          nextStep,
          currentForecastId: forecastId,
          nextForecastId,
          nextTimeZone
        });
        
        router.push(`/insert-after?step=${nextStep}&forecastId=${nextForecastId}&date=${searchParams.get('date')}&timeZone=${nextTimeZone}`);
      } else {
        // 모든 단계 완료
        setShowCompletionModal(true);
      }
    } catch (error) {
      console.error('예보 기록 생성 실패:', error);
      setError('예보 기록 생성에 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const isComplete = reason.trim().length > 0;

  const fadeInOutVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
    exit: { opacity: 0, y: -10, transition: { duration: 0.3 } },
  };

  const getButtonText = () => {
    if (currentStep === 'evening') return '완료';
    return '다음으로';
  };

  if (!currentEmotion) {
    return (
      <div className="container">
        <div className="min-h-screen flex items-center justify-center bg-white">
          <div className="text-center">
            <p className="text-gray-600">감정 데이터를 찾을 수 없습니다.</p>
            <button 
              onClick={() => router.push('/baby')}
              className="mt-4 px-4 py-2 bg-[#FF6F71] text-white rounded-lg"
            >
              돌아가기
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="min-h-screen flex flex-col items-center justify-center px-4 pt-10 pb-5 bg-white text-black">
        <div className="w-full max-w-sm mx-auto">
          <button className="mb-4 cursor-pointer" onClick={handleBack}>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
        </div>
        
        <div className="flex flex-col items-start justify-start flex-grow w-full max-w-sm mx-auto mt-4">
          <div className="text-xs text-gray-400 mb-2">
            {searchParams.get('date') || new Date().toISOString().split('T')[0]} {TIME_PERIODS[currentStep].label}
          </div>
          <div className="text-2xl font-bold leading-tight whitespace-pre-line mb-8">
            {TIME_PERIODS[currentStep].text}{`\n`}느꼈나요?
          </div>
          
          {error && (
            <div className="w-full mb-4 text-sm text-red-500 text-center">
              {error}
            </div>
          )}
          
          <div className="w-full flex-grow">
            <div className="relative">
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="어떤 일 때문에 이런 감정을 느꼈나요?"
                className="w-full h-100 p-5 border-2 border-gray-200 rounded-xl resize-none focus:border-[#FF6F71] focus:outline-none transition-all duration-300 text-base leading-relaxed placeholder-gray-400"
                maxLength={500}
              />
              <div className="absolute bottom-4 right-4 text-xs text-gray-400">
                {reason.length}/500
              </div>
            </div>
            <div className="mt-3  mb-8 text-sm text-gray-500 text-center">
              🫶 자세히 적을수록 더 좋아요
            </div>
          </div>
        </div>
        
        <motion.div
          key="final-button"
          initial="hidden"
          animate="visible"
          variants={fadeInOutVariants}
          className="flex flex-col items-center w-full max-w-sm mt-auto mb-4"
        >
          <Button
            className={`flex w-full items-center justify-center gap-1 rounded-lg bg-[#FF6F71] text-white py-3 text-lg font-semibold text-gray-900 mb-4 transition-opacity ${isComplete && !isLoading ? '' : 'opacity-50 cursor-not-allowed'}`}
            disabled={!isComplete || isLoading}
            onClick={handleNext}
          >
            {isLoading ? (
              <div className="flex items-center gap-2">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                저장 중...
              </div>
            ) : (
              getButtonText()
            )}
          </Button>
        </motion.div>
      </div>
      
      {/* 완료 모달 */}
      {showCompletionModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 mx-4 max-w-sm w-full text-center">
            <div className="text-6xl mb-4">🎉</div>
            <h2 className="text-xl font-bold text-gray-800 mb-2">완료!</h2>
            <p className="text-gray-600 mb-6">
              모든 예보 기록을 작성하였습니다.
            </p>
            <button
              onClick={() => {
                setShowCompletionModal(false);
                router.push('/baby');
              }}
              className="w-full bg-[#FF6F71] hover:bg-[#e55a5c] text-white font-medium py-3 px-6 rounded-lg transition-colors"
            >
              확인
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function ReasonPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p className="text-gray-600">로딩 중...</p>
        </div>
      </div>
    }>
      <ReasonPageContent />
    </Suspense>
  );
}