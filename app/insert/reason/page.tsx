'use client'

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useRouter, useSearchParams } from "next/navigation";
import Button from "../../components/Button";

interface SelectedEmotion {
  category: string;
  emotion: string;
  color: string;
}

export default function ReasonPage() {
  const [selectedEmotions, setSelectedEmotions] = useState<SelectedEmotion[]>([]);
  const [reason, setReason] = useState('');
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const emotionsParam = searchParams.get('emotions');
    if (emotionsParam) {
      try {
        const emotions = JSON.parse(emotionsParam);
        setSelectedEmotions(emotions);
      } catch (error) {
        console.error('감정 데이터 파싱 오류:', error);
        router.push('/insert');
      }
    } else {
      router.push('/insert');
    }
  }, [searchParams, router]);

  const handleBack = () => {
    window.history.back();
  };

  const handleNext = () => {
    if (reason.trim().length === 0) return;
    
    console.log('선택된 감정들:', selectedEmotions);
    console.log('이유:', reason);

    router.push('/home');
  };

  const isComplete = reason.trim().length > 0;

  const fadeInOutVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
    exit: { opacity: 0, y: -10, transition: { duration: 0.3 } },
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 pt-10 pb-5 bg-white text-black">
      <div className="w-full max-w-sm mx-auto">
        <button className="mb-4 cursor-pointer" onClick={handleBack}>
          <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
      </div>
      
      <div className="flex flex-col items-start justify-start flex-grow w-full max-w-sm mx-auto mt-4">
        <div className="text-xs text-gray-400 mb-2">7월 12일 토요일 오전</div>
        <div className="text-2xl font-bold leading-tight whitespace-pre-line mb-8">
          왜 이런 감정을{`\n`}느낄 것 같나요?
        </div>
        
        <div className="w-full flex-grow">
          <div className="relative">
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="어떤 일 때문에 이런 감정을 느낄 거같아요?"
              className="w-full h-132 p-5 border-2 border-gray-200 rounded-xl resize-none focus:border-[#FF6F71] focus:outline-none transition-all duration-300 text-base leading-relaxed placeholder-gray-400"
              maxLength={500}
            />
            <div className="absolute bottom-4 right-4 text-xs text-gray-400">
              {reason.length}/500
            </div>
          </div>
          <div className="mt-3 text-sm text-gray-500 text-center">
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
          className={`flex w-full items-center justify-center gap-1 rounded-lg bg-[#FF6F71] text-white py-3 text-lg font-semibold text-gray-900 mb-4 transition-opacity ${isComplete ? '' : 'opacity-50 cursor-not-allowed'}`}
          disabled={!isComplete}
          onClick={handleNext}
        >
          완료
        </Button>
      </motion.div>
    </div>
  );
}