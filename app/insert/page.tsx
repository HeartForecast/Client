'use client'

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useRouter, useSearchParams } from "next/navigation";
import Button from "../components/Button";

const EMOTION_CATEGORIES = {
  즐거움: [
    "신나는", "열정적인", "희망찬", "기대되는", "뿌듯한",
    "황홀한", "설레는", "기쁜", "감동한", "대견한",
    "즐거운", "영감을 받은", "행복한", "사랑하는", "만족스러운"
  ],
  슬픔: [
    "우울한", "속상한", "실망한", "외로운", "불안한",
    "화난", "짜증나는", "스트레스받는", "걱정되는", "답답한"
  ],
  중립: [
    "감사한", "평온한", "여유로운", "자신감 있는", "든든한",
    "차분한", "안정된", "집중된", "편안한", "고요한"
  ]
};

const CATEGORY_COLORS = {
  즐거움: '#3DC8EF',
  슬픔: '#FF7B6F',
  중립: '#FFD340'
};

const TIME_PERIODS = {
  morning: { label: '오전', text: '오전에는 어떤 감정을' },
  afternoon: { label: '오후', text: '오후에는 어떤 감정을' },
  evening: { label: '저녁', text: '저녁에는 어떤 감정을' }
};

export default function InsertPage() {
  const [selected, setSelected] = useState<number[]>([]);
  const [currentStep, setCurrentStep] = useState<'morning' | 'afternoon' | 'evening'>('morning');
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const step = searchParams.get('step') as 'morning' | 'afternoon' | 'evening';
    if (step && ['morning', 'afternoon', 'evening'].includes(step)) {
      setCurrentStep(step);
    }
  }, [searchParams]);

  const handleEmotionClick = (categoryIdx: number, emotionIdx: number) => {
    const globalIdx = categoryIdx * 1000 + emotionIdx;
    setSelected((prev) => {
      if (prev.includes(globalIdx)) {
        return prev.filter((i) => i !== globalIdx);
      } else {
        return [...prev, globalIdx];
      }
    });
  };

  const handleBack = () => {
    window.history.back();
  };

  const handleNext = () => {
    if (selected.length === 0) return;
    const selectedEmotions = selected.map(globalIdx => {
      const categoryIdx = Math.floor(globalIdx / 1000);
      const emotionIdx = globalIdx % 1000;
      const categories = Object.entries(EMOTION_CATEGORIES);
      const [categoryName, emotions] = categories[categoryIdx];
      return {
        category: categoryName,
        emotion: emotions[emotionIdx],
        color: CATEGORY_COLORS[categoryName as keyof typeof CATEGORY_COLORS]
      };
    });

    const params = new URLSearchParams();
    params.set('emotions', JSON.stringify(selectedEmotions));
    params.set('step', currentStep);
    router.push(`/insert/reason?${params.toString()}`);
  };

  const isCodeComplete = selected.length > 0;

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
        <div className="text-xs text-gray-400 mb-2">7월 12일 토요일 {TIME_PERIODS[currentStep].label}</div>
        <div className="text-2xl font-bold leading-tight whitespace-pre-line mb-8">
          {TIME_PERIODS[currentStep].text}{`\n`}느낄까요?
        </div>
        <div className="w-full space-y-6">
          {Object.entries(EMOTION_CATEGORIES).map(([category, emotions], categoryIdx) => (
            <div key={category} className="w-full">
              <div className="text-sm font-medium text-gray-600 mb-3">{category}</div>
              <div className="flex flex-wrap gap-2">
                {emotions.map((emotion, emotionIdx) => {
                  const globalIdx = categoryIdx * 1000 + emotionIdx;
                  const isSelected = selected.includes(globalIdx);
                  const categoryColor = CATEGORY_COLORS[category as keyof typeof CATEGORY_COLORS];
                  
                  return (
                    <motion.button
                      key={`${category}-${emotionIdx}`}
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
                    >
                      {emotion}
                    </motion.button>
                  );
                })}
              </div>
            </div>
          ))}
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
          className={`flex w-full items-center justify-center gap-1 rounded-lg bg-[#FF6F71] text-white py-3 text-lg font-semibold text-gray-900 mb-4 transition-opacity ${isCodeComplete ? '' : 'opacity-50 cursor-not-allowed'}`}
          disabled={!isCodeComplete}
          onClick={handleNext}
        >
          다음으로
        </Button>
      </motion.div>
    </div>
  );
}
