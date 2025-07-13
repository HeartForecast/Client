'use client'

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import React from 'react';
import { useRouter, useSearchParams } from "next/navigation";
import Button from '../../components/Button';
import Container from '../../components/Container';

export default function EditChildPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const childId = searchParams.get('id');
  
  const [currentDisplayStep, setCurrentDisplayStep] = useState(1);
  const [name, setName] = useState('');
  const [dob, setDob] = useState('');
  const [gender, setGender] = useState('');
  const [healthStatus, setHealthStatus] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  
  const nameRef = useRef<HTMLInputElement>(null);
  const dobRef = useRef<HTMLInputElement>(null);
  const healthStatusRef = useRef<HTMLInputElement>(null);
  const nameAdvanceTimeout = useRef<NodeJS.Timeout | null>(null);

  const childrenData = [
    {
      id: 1,
      name: '김민수',
      age: 12,
      dob: '2012-03-15',
      gender: 'male',
      healthStatus: '알레르기 없음',
      registeredDate: '2024.03.15'
    },
    {
      id: 2,
      name: '김지은',
      age: 15,
      dob: '2009-01-20',
      gender: 'female',
      healthStatus: '천식',
      registeredDate: '2024.01.20'
    },
    {
      id: 3,
      name: '이준호',
      age: 8,
      dob: '2016-05-10',
      gender: 'male',
      healthStatus: '특이사항 없음',
      registeredDate: '2024.05.10'
    }
  ];

  useEffect(() => {
    if (childId) {
      const child = childrenData.find(c => c.id === parseInt(childId));
      if (child) {
        setName(child.name);
        setDob(child.dob);
        setGender(child.gender);
        setHealthStatus(child.healthStatus);
      }
    }
    setIsLoading(false);
  }, [childId]);

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
      handleSave();
    }
  };

  const handleSave = () => {
    console.log("자녀 정보 수정 완료:", { childId, name, dob, gender, healthStatus });
    alert("자녀 정보가 수정되었습니다!");
    router.push('/settings');
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
      router.push('/settings');
    } else {
      setCurrentDisplayStep(prev => Math.max(1, prev - 1));
    }
  };

  const fadeInOutVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
    exit: { opacity: 0, y: -10, transition: { duration: 0.3 } },
  };

  if (isLoading) {
    return (
      <Container>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#FF6F71] mx-auto mb-4"></div>
            <p className="text-gray-600">정보를 불러오는 중...</p>
          </div>
        </div>
      </Container>
    );
  }

  return (
    <Container>
      <div className="w-full max-w-sm mx-auto">
        <button className="mb-4 cursor-pointer" onClick={handleBack}>
          <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
      </div>

      <div className="flex flex-col items-start justify-start flex-grow w-full max-w-sm mx-auto mt-4">
        <div className="w-full mb-8">
          <span className="text-gray-500 font-medium text-sm">설정</span>
          <h1 className="text-2xl font-semibold mb-3">자녀 정보 수정</h1>
          <p className="text-sm text-gray-600">자녀의 정보를 수정해주세요</p>
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
                생년월일 <span className="text-red-500">*</span>
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
            </motion.div>
          )}
        </AnimatePresence>

        {currentDisplayStep === 4 && (
          <motion.div
            key="final-button"
            initial="hidden"
            animate="visible"
            variants={fadeInOutVariants}
            className="flex flex-col items-center w-full max-w-sm mt-auto mb-4"
          >
            <Button
              className="flex w-full items-center justify-center gap-1 rounded-lg bg-[#FF6F71] text-white py-3 text-lg font-semibold mb-4"
              onClick={handleSave}
            >
              수정 완료
            </Button>
          </motion.div> 
        )}
      </div>
    </Container>
  );
} 