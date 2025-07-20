'use client'

import React, { useState, useEffect, Suspense } from "react";
import { motion } from "framer-motion";
import { useRouter, useSearchParams } from "next/navigation";
import Button from "../../components/Button";
import { useChild } from "../../contexts/ChildContext";
import EmotionForecastPopup from "../../components/EmotionForecastPopup";
import { getCurrentDate } from "../../utils/dateUtils";

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
  const [showResultPopup, setShowResultPopup] = useState(false);
  const [allEmotions, setAllEmotions] = useState<any[]>([]);
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const step = searchParams.get('step') as 'morning' | 'afternoon' | 'evening';
    if (step && ['morning', 'afternoon', 'evening'].includes(step)) {
      setCurrentStep(step);
    }

    // localStorage에서 현재 단계의 감정 데이터 가져오기
    if (typeof window !== 'undefined') {
      const savedEmotions = localStorage.getItem('forecastEmotions');
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
      router.push(`/insert/reason?step=${prevStep}`);
    } else {
      window.history.back();
    }
  };

  const handleNext = async () => {
    if (!currentEmotion || !selectedChild?.id) {
      setError('필수 정보가 누락되었습니다.');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const today = new Date();
      const year = today.getFullYear();
      const month = String(today.getMonth() + 1).padStart(2, '0');
      const day = String(today.getDate()).padStart(2, '0');
      const dateString = `${year}-${month}-${day}`;

      console.log('현재 날짜 정보:', {
        today: today,
        year,
        month,
        day,
        dateString,
        toISOString: today.toISOString(),
        toLocaleDateString: today.toLocaleDateString('ko-KR')
      });

      // 예보 생성
      const forecastData = {
        childId: selectedChild.id,
        emotionTypeId: currentEmotion.emotion.id,
        date: dateString,
        timeZone: TIME_PERIODS[currentStep].label,
        memo: reason.trim()
      };

      console.log(`${currentStep} 예보 생성:`, forecastData);

      const response = await fetch(`${apiBaseUrl}/api/forecasts/forecast`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(forecastData)
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`예보 생성 실패: ${errorText}`);
      }

      console.log(`${currentStep} 예보 생성 완료`);

      // 다음 단계로 이동
      const steps = ['morning', 'afternoon', 'evening'];
      const currentIndex = steps.indexOf(currentStep);
      const nextStep = steps[currentIndex + 1];

      if (nextStep) {
        router.push(`/insert?step=${nextStep}`);
      } else {
        // 모든 단계 완료 - 결과 팝업 표시
        const savedEmotions = localStorage.getItem('forecastEmotions');
        if (savedEmotions) {
          const emotions = JSON.parse(savedEmotions);
          setAllEmotions(emotions);
          setShowResultPopup(true);
        } else {
          setShowCompletionModal(true);
        }
      }
    } catch (error) {
      console.error('예보 생성 실패:', error);
      setError('예보 생성에 실패했습니다.');
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
              onClick={() => router.push('/insert')}
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
          <EmotionForecastPopup
            isOpen={showResultPopup}
            onClose={() => {
              setShowResultPopup(false);
              localStorage.removeItem('forecastEmotions'); // 저장된 감정 데이터 정리
            }}
            forecasts={allEmotions.map((emotion: any) => ({
              timeSlot: emotion.step,
              emotion: emotion.emotion.name,
              temperature: emotion.emotion.temp,
              image: emotion.emotion.image,
              category: emotion.category
            }))}
          />
          <div className="text-xs text-gray-400 mb-2">{getCurrentDate()} {TIME_PERIODS[currentStep].label}</div>
          <div className="text-2xl font-bold leading-tight whitespace-pre-line mb-8">
            {TIME_PERIODS[currentStep].text}{`\n`}느낄 것 같나요?
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
                placeholder="어떤 일 때문에 이런 감정을 느낄 거같아요?"
                className="w-full h-64 p-4 border-2 border-gray-200 rounded-xl resize-none focus:border-[#FF6F71] focus:outline-none transition-all duration-300 text-base leading-relaxed placeholder-gray-400"
                maxLength={500}
              />
              <div className="absolute bottom-4 right-4 text-xs text-gray-400">
                {reason.length}/500
              </div>
            </div>
            <div className="mt-3 text-sm text-gray-500 text-center">
              🫶 자세히 적을수록 더 좋아요 (선택사항)
            </div>
          </div>
        </div>
        
        <motion.div
          key="final-button"
          initial="hidden"
          animate="visible"
          variants={fadeInOutVariants}
          className="flex flex-col items-center w-full max-w-sm mx-auto mt-2 mb-4"
        >
          <Button
            className="flex w-full items-center justify-center gap-1 rounded-lg bg-[#FF6F71] text-white py-3 text-lg font-semibold text-gray-900 mb-4"
            onClick={handleNext}
          >
            {getButtonText()}
          </Button>
        </motion.div>
      </div>
      
      {/* 완료 모달 */}
      {showCompletionModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 mx-4 max-w-sm w-full">
            <div className="text-center">
              <div className="text-6xl mb-4">🎉</div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">예보 작성 완료!</h3>
              <p className="text-gray-600 mb-6">
                오늘 하루의 감정 예보를 모두 작성했어요.
              </p>
              <button
                onClick={() => {
                  // localStorage 정리
                  if (typeof window !== 'undefined') {
                    localStorage.removeItem('forecastEmotions');
                  }
                  router.push('/baby');
                }}
                className="w-full bg-[#FF6F71] text-white font-medium py-3 px-6 rounded-lg hover:bg-[#e55a5c] transition-colors"
              >
                홈으로 가기
              </button>
            </div>
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