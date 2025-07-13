'use client'

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import React from 'react';
import { useRouter } from "next/navigation";
import Button from '../components/Button';

export default function Register() {
  const [currentDisplayStep, setCurrentDisplayStep] = useState(1); 

  const [name, setName] = useState('');
  const [dob, setDob] = useState('');
  const [gender, setGender] = useState('');
  const [healthStatus, setHealthStatus] = useState('');
  const nameRef = useRef<HTMLInputElement>(null);
  const dobRef = useRef<HTMLInputElement>(null);
  const healthStatusRef = useRef<HTMLInputElement>(null);
  const nameAdvanceTimeout = useRef<NodeJS.Timeout | null>(null);
  const router = useRouter();

  useEffect(() => {
    switch (currentDisplayStep) {
      case 1:
        nameRef.current?.focus();
        break;
      case 2:
        dobRef.current?.focus();
        break;
      case 3:
        break;
      case 4:
        healthStatusRef.current?.focus();
        break;
      default:
        break;
    }
  }, [currentDisplayStep]);

  const advanceStep = () => {
    if (currentDisplayStep < 4) {
      setCurrentDisplayStep(prevStep => prevStep + 1);
    } else {
      console.log("Registration Finished!", { name, dob, gender, healthStatus });
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      event.preventDefault();

      if (currentDisplayStep === 1 && name.trim() === '') return;
      if (currentDisplayStep === 2 && dob.trim() === '') return;
      if (currentDisplayStep === 4 && healthStatus.trim() === '') return;

      advanceStep();
    }
  };

  const handleGenderSelect = (selectedGender: string) => {
    setGender(selectedGender);
    advanceStep();
  };

  const handleBack = () => {
    if (currentDisplayStep === 1) {
      window.history.back();
    } else {
      setCurrentDisplayStep(prev => Math.max(1, prev - 1));
    }
  };

  const fadeInOutVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
    exit: { opacity: 0, y: -10, transition: { duration: 0.3 } },
  };

  return (
    <div className="min-h-screen flex flex-col items-center px-4 pt-10 pb-5 bg-white text-black">
      <div className="w-full max-w-sm mx-auto">
        <button className="mb-4 cursor-pointer" onClick={handleBack}>
          <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
      </div>

      <div className="flex flex-col items-start justify-start flex-grow w-full max-w-sm mx-auto mt-4">
        <div className="w-full mb-8">
          <span className="text-gray-500 font-medium text-sm mr-1">새로운 아이 프로필 추가</span>
          <h1 className="text-2xl font-semibold mb-3">새로운 아이 프로필을 생성할게요</h1>
        </div>
        <AnimatePresence mode="wait" initial={false}>
          {currentDisplayStep >= 1 && (
            <motion.div
              key="step1-name"
              initial="hidden"
              animate="visible"
              exit="exit"
              variants={fadeInOutVariants}
              className="w-full mb-12"
            >
              <label htmlFor="name" className="text-gray-500 text-sm font-semibold mb-2 block">
                이름 <span className="text-red-500">*</span>
              </label>
              <div className="w-full border-b-2 border-gray-300 pb-2">
                <input
                  type="text"
                  id="name"
                  ref={nameRef}
                  className="w-full text-xl focus:outline-none placeholder-gray-400"
                  placeholder="이름을 입력해주세요."
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    const koreanCharCount = e.target.value.match(/[\uAC00-\uD7A3]/g)?.length || 0;
                    if (nameAdvanceTimeout.current) {
                      clearTimeout(nameAdvanceTimeout.current);
                    }
                    if (currentDisplayStep === 1 && koreanCharCount === 3) {
                      nameAdvanceTimeout.current = setTimeout(() => {
                        advanceStep();
                      }, 500);
                    }
                  }}
                  onKeyDown={handleKeyDown}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence mode="wait" initial={false}>
          {currentDisplayStep >= 2 && (
            <motion.div
              key="step2-dob"
              initial="hidden"
              animate="visible"
              exit="exit"
              variants={fadeInOutVariants}
              className="w-full mb-12"
            >
              <label htmlFor="dob" className="text-gray-500 text-sm font-semibold mb-2 block">
                생년월일 (8자리) <span className="text-red-500">*</span>
              </label>
              <div className="w-full border-b-2 border-gray-300 pb-2">
                <input
                  type="text"
                  id="dob"
                  ref={dobRef}
                  className="w-full text-xl focus:outline-none placeholder-gray-400"
                  placeholder="생년월일을 입력해주세요."
                  value={dob}
                  onChange={(e) => {
                    let value = e.target.value.replace(/[^0-9]/g, '');
                    if (value.length > 8) value = value.slice(0, 8);
                    let formatted = value;
                    if (value.length > 4) {
                      formatted = value.slice(0, 4) + '-' + value.slice(4);
                    }
                    if (value.length > 6) {
                      formatted = value.slice(0, 4) + '-' + value.slice(4, 6) + '-' + value.slice(6);
                    }
                    setDob(formatted);
                    if (currentDisplayStep === 2 && value.length === 8) {
                      advanceStep();
                    }
                  }}
                  onKeyDown={handleKeyDown}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence mode="wait" initial={false}>
          {currentDisplayStep >= 3 && (
            <motion.div
              key="step3-gender"
              initial="hidden"
              animate="visible"
              exit="exit"
              variants={fadeInOutVariants}
              className="w-full mb-12"
            >
              <label htmlFor="gender" className="text-gray-500 text-sm font-semibold mb-2 block">
                성별 <span className="text-red-500">*</span>
              </label>
              <div className="flex flex-row space-x-8 mt-2">
                <label className="flex items-center space-x-3">
                  <input
                    type="radio"
                    name="gender"
                    value="male"
                    checked={gender === 'male'}
                    onChange={() => handleGenderSelect('male')}
                    className="form-radio h-5 w-5 text-[#FF6F71] focus:ring-[#FF6F71]"
                  />
                  <span className="text-black text-xl font-medium">남자</span>
                </label>
                <label className="flex items-center space-x-3">
                  <input
                    type="radio"
                    name="gender"
                    value="female"
                    checked={gender === 'female'}
                    onChange={() => handleGenderSelect('female')}
                    className="form-radio h-5 w-5 text-[#FF6F71] focus:ring-[#FF6F71]"
                  />
                  <span className="text-black text-xl font-medium">여자</span>
                </label>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence mode="wait" initial={false}>
          {currentDisplayStep >= 4 && (
            <motion.div
              key="step4-health"
              initial="hidden"
              animate="visible"
              exit="exit"
              variants={fadeInOutVariants}
              className="w-full mb-12"
            >
              <label htmlFor="healthStatus" className="text-gray-500 text-sm font-semibold mb-2 block">건강 상태</label>
              <div className="w-full border-b-2 border-gray-300 pb-2">
                <input
                  type="text"
                  id="healthStatus"
                  ref={healthStatusRef}
                  className="w-full text-xl focus:outline-none placeholder-gray-400"
                  placeholder="ex) 알레르기, 복용 약... 등"
                  value={healthStatus}
                  onChange={(e) => setHealthStatus(e.target.value)}
                  onKeyDown={handleKeyDown}
                />
              </div>
              <p className="text-gray-500 text-sm mt-2">알레르기와 같은 참고해야할 사항이 있다면 적어주세요.</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      {currentDisplayStep >= 4 && (
        <motion.div
          key="final-button"
          initial="hidden"
          animate="visible"
          variants={fadeInOutVariants}
          className="flex flex-col items-center w-full max-w-sm mt-auto mb-4"
        >
          <Button onClick={advanceStep}>완료</Button>
        </motion.div>
      )}
    </div>
  );
}