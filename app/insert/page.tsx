'use client'

import React, { useState } from "react";
import { motion } from "framer-motion";
import Button from "../components/Button";

const EMOTIONS = [
  "신나는", "열정적인", "희망찬", "기대되는", "뿌듯한",
  "황홀한", "설레는", "기쁜", "감동한", "대견한",
  "즐거운", "영감을 받은", "행복한", "사랑하는", "만족스러운",
  "감사한", "평온한", "여유로운", "자신감 있는", "든든한"
];

export default function InsertPage() {
  const [selected, setSelected] = useState<number[]>([]);

  const handleEmotionClick = (idx: number) => {
    setSelected((prev) =>
      prev.includes(idx)
        ? prev.filter((i) => i !== idx)
        : [...prev, idx]
    );
  };

  const handleBack = () => {
    window.history.back();
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
        <div className="text-xs text-gray-400 mb-2">7월 12일 토요일</div>
        <div className="text-2xl font-bold leading-tight whitespace-pre-line mb-8">
          오전에는 어떤 감정을{`\n`}느낄까요?
        </div>
        <div className="w-full">
          <div className="flex flex-wrap gap-3">
            {EMOTIONS.map((emotion, idx) => (
              <Button
                key={idx}
                type="button"
                className={`rounded-full px-3 py-1 text-base font-medium transition-all duration-150
                  border inline-flex items-center justify-center
                  ${selected.includes(idx)
                    ? "bg-blue-500 text-white border-blue-500"
                    : "bg-white text-[#6B7A90] border-[#C7D0D9] hover:bg-blue-50 hover:border-blue-300"}
                  shadow-none
                `}
                style={{
                  fontFamily: 'inherit',
                  fontWeight: 500,
                  fontSize: '15px',
                  letterSpacing: '0.01em',
                  width: 'auto',
                  minWidth: 'auto',
                }}
                whileTap={{ scale: 0.97 }}
                onClick={() => handleEmotionClick(idx)}
              >
                {emotion}
              </Button>
            ))}
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
          className={`flex w-full items-center justify-center gap-1 rounded-lg bg-[#FF6F71] text-white py-3 text-lg font-semibold text-gray-900 mb-4 transition-opacity ${isCodeComplete ? '' : 'opacity-50 cursor-not-allowed'}`}
          disabled={!isCodeComplete}
        >
          완료
        </Button>
      </motion.div>
    </div>
  );
}
