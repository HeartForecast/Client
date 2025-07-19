'use client'

import React, { useState, useEffect, Suspense } from "react";
import { motion } from "framer-motion";
import { useRouter, useSearchParams } from "next/navigation";
import Button from "../../components/Button";
import { useChild } from "../../contexts/ChildContext";
import EmotionResultPopup from "../../components/EmotionResultPopup";

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
  const [showResultPopup, setShowResultPopup] = useState(false);
  const [allEmotions, setAllEmotions] = useState<any[]>([]);
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
    const steps = ['morning', 'afternoon', 'evening'];
    const currentIndex = steps.indexOf(currentStep);
    const prevStep = steps[currentIndex - 1];
    
    if (prevStep) {
      router.push(`/insert-after?step=${prevStep}&forecastId=${searchParams.get('forecastId')}&date=${searchParams.get('date')}&timeZone=${searchParams.get('timeZone')}`);
    } else {
      window.history.back();
    }
  };

  const handleNext = async () => {
    if (!currentEmotion || !selectedChild?.id || !forecastId) {
      setError('필수 정보가 누락되었습니다.');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const date = searchParams.get('date');
      const timeZone = searchParams.get('timeZone');

      // 예보 기록 생성
      const recordData = {
        forecastId: parseInt(forecastId),
        emotionTypeId: currentEmotion.emotion.id,
        memo: reason.trim(),
        childId: selectedChild.id,
        date: date,
        timeZone: timeZone
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
        router.push(`/insert-after?step=${nextStep}&forecastId=${forecastId}&date=${date}&timeZone=${timeZone}`);
      } else {
        // 모든 단계 완료 - 결과 팝업 표시
        const savedEmotions = localStorage.getItem('forecastRecordEmotions');
        if (savedEmotions) {
          const emotions = JSON.parse(savedEmotions);
          setAllEmotions(emotions);
          setShowResultPopup(true);
        } else {
          router.push('/home');
        }
      }
    } catch (error) {
      console.error('예보 기록 생성 실패:', error);
      setError('예보 기록 생성에 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const isComplete = true; // 메모는 선택사항이므로 항상 true

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
              onClick={() => router.push('/insert-after')}
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
      <div className="h-screen flex flex-col px-4 pt-6 pb-4 bg-white text-black">
        
        <div className="w-full max-w-sm mx-auto mb-2">
          <button className="cursor-pointer" onClick={handleBack}>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
        </div>
        
        <div className="flex flex-col items-start justify-start flex-1 w-full max-w-sm mx-auto">
          
          {/* 결과 팝업 */}
          <EmotionResultPopup
            isVisible={showResultPopup}
            onClose={() => {
              setShowResultPopup(false);
              localStorage.removeItem('forecastRecordEmotions'); // 저장된 감정 데이터 정리
              router.push('/home'); // 홈으로 이동
            }}
            emotions={allEmotions}
          />
          
          <div className="text-xs text-gray-400 mb-1">{new Date().toLocaleDateString('ko-KR')} {TIME_PERIODS[currentStep].label}</div>
          <div className="text-xl sm:text-2xl font-bold leading-tight whitespace-pre-line mb-4">
            {TIME_PERIODS[currentStep].text}{`\n`}느꼈나요?
          </div>
          
          <motion.div
            initial="hidden"
            animate="visible"
            exit="exit"
            variants={fadeInOutVariants}
            className="w-full flex-1 flex flex-col"
          >
            <div className="relative flex-1">
              <textarea
                id="reason"
                className="w-full h-full min-h-[400px] p-4 border-2 border-gray-200 rounded-xl resize-none focus:border-[#FF6F71] focus:outline-none transition-all duration-300 text-base leading-relaxed placeholder-gray-400"
                placeholder="어떤 일 때문에 이런 감정을 느꼈나요?"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                maxLength={500}
                onKeyDown={(e) => {
                  // 메모 단계에서는 엔터키 동작하지 않음
                  if (e.key === 'Enter') {
                    e.preventDefault();
                  }
                }}
              />
              <div className="absolute bottom-4 right-4 text-xs text-gray-400">
                {reason.length}/500
              </div>
            </div>
            <div className="mt-3 text-sm text-gray-500 text-center">
              🫶 자세히 적을수록 더 좋아요 (선택사항)
            </div>
          </motion.div>

          <div className="flex flex-col items-center w-full max-w-sm mt-8">
            <Button
              onClick={handleNext}
              disabled={!isComplete || isLoading}
              className="w-full"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  처리 중...
                </>
              ) : (
                getButtonText()
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ReasonPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#FF6F71] mx-auto mb-4"></div>
          <p className="text-gray-600">페이지를 불러오는 중...</p>
        </div>
      </div>
    }>
      <ReasonPageContent />
    </Suspense>
  );
}