'use client'

import { useState, useRef, useEffect, Suspense } from "react";
import { motion, AnimatePresence } from "framer-motion";
import React from 'react';
import { useRouter, useSearchParams } from "next/navigation";
import Button from '../../components/Button';
import Container from '../../components/Container';

const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL

interface ApiChildData {
  id: number
  username: string
  birthdate: string
  gender: string
  healthInfo: string
  createdAt: string
  point: number
  inviteCode: string
}

interface ToastProps {
  message: string
  type: 'success' | 'error'
  isVisible: boolean
  onClose: () => void
}

function Toast({ message, type, isVisible, onClose }: ToastProps) {
  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(() => {
        onClose();
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [isVisible, onClose]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -50 }}
          className={`fixed top-4 left-1/2 transform -translate-x-1/2 z-50 px-6 py-3 rounded-lg shadow-lg flex items-center gap-3 ${
            type === 'success' 
              ? 'bg-green-500 text-white' 
              : 'bg-red-500 text-white'
          }`}
        >
          <div className={`w-5 h-5 rounded-full flex items-center justify-center ${
            type === 'success' ? 'bg-green-400' : 'bg-red-400'
          }`}>
            {type === 'success' ? (
              <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            ) : (
              <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            )}
          </div>
          <span className="font-medium">{message}</span>
          <button
            onClick={onClose}
            className="ml-2 text-white/80 hover:text-white"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function EditChildPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const childId = searchParams.get('id');

  const [currentDisplayStep, setCurrentDisplayStep] = useState(1);
  const [name, setName] = useState('');
  const [dob, setDob] = useState('');
  const [gender, setGender] = useState('');
  const [healthStatus, setHealthStatus] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<{
    message: string;
    type: 'success' | 'error';
    isVisible: boolean;
  }>({
    message: '',
    type: 'success',
    isVisible: false
  });

  const nameRef = useRef<HTMLInputElement>(null);
  const dobRef = useRef<HTMLInputElement>(null);
  const healthStatusRef = useRef<HTMLInputElement>(null);
  const nameAdvanceTimeout = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const fetchChildData = async () => {
      if (!childId) {
        setError('아이 ID가 없습니다.');
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);

        const response = await fetch(`${apiBaseUrl}/api/childRelations`, {
          method: 'GET',
          credentials: 'include',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          }
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data: ApiChildData[] = await response.json();
        const child = data.find(c => c.id === parseInt(childId));

        if (!child) {
          throw new Error('해당 아이를 찾을 수 없습니다.');
        }

        setName(child.username);
        setDob(child.birthdate);
        setGender(child.gender === '여성' ? 'female' : 'male');
        setHealthStatus(child.healthInfo);

      } catch (err) {
        console.error('아이 정보 불러오기 실패:', err);
        setError(err instanceof Error ? err.message : '아이 정보를 불러오는데 실패했습니다.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchChildData();
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

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({
      message,
      type,
      isVisible: true
    });
  };

  const hideToast = () => {
    setToast(prev => ({ ...prev, isVisible: false }));
  };

  const advanceStep = () => {
    if (currentDisplayStep < 4) {
      setCurrentDisplayStep(prevStep => prevStep + 1);
    } else {
      handleSave();
    }
  };

  const handleSave = async () => {
    if (!childId) return;

    setIsSaving(true);
    setError(null);

    const payload = {
      childId: parseInt(childId),
      username: name,
      birthdate: dob,
      gender: gender === 'male' ? '남성' : '여성',
      healthInfo: healthStatus
    };

    try {
      const response = await fetch(`${apiBaseUrl}/api/children/child`, {
        method: 'PUT',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error(`수정 실패: ${response.status}`);
      }

      showToast('아이 정보가 성공적으로 수정되었습니다!', 'success');
      
      // 성공 후 잠시 대기 후 페이지 이동
      setTimeout(() => {
        router.push('/settings');
      }, 1500);
    } catch (error) {
      console.error("수정 실패:", error);
      showToast('아이 정보 수정에 실패했습니다. 다시 시도해주세요.', 'error');
    } finally {
      setIsSaving(false);
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
        <div className="w-full max-w-sm mx-auto">
          <button className="mb-4 cursor-pointer" onClick={handleBack}>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
        </div>
        
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#FF6F71] mx-auto mb-4"></div>
            <p className="text-gray-600">아이 정보를 불러오는 중...</p>
          </div>
        </div>
      </Container>
    );
  }

  if (error) {
    return (
      <Container>
        <div className="w-full max-w-sm mx-auto">
          <button className="mb-4 cursor-pointer" onClick={handleBack}>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
        </div>
        
        <div className="flex flex-col items-center justify-center min-h-[60vh]">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
            <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">오류가 발생했습니다</h3>
          <p className="text-sm text-gray-500 text-center mb-4">{error}</p>
          <button 
            onClick={() => router.push('/settings')}
            className="px-4 py-2 bg-[#FF6F71] text-white rounded-lg hover:bg-[#e55a5c] transition-colors"
          >
            설정으로 돌아가기
          </button>
        </div>
      </Container>
    );
  }

  return (
    <Container>
      <Toast
        message={toast.message}
        type={toast.type}
        isVisible={toast.isVisible}
        onClose={hideToast}
      />
      
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
          <h1 className="text-2xl font-semibold mb-3">아이 정보 수정</h1>
          <p className="text-sm text-gray-600">아이의 정보를 수정해주세요</p>
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
              className="flex w-full items-center justify-center gap-1 rounded-lg bg-[#FF6F71] text-white py-3 text-lg font-semibold mb-4 disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={handleSave}
              disabled={isSaving}
            >
              {isSaving ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  수정 중...
                </>
              ) : (
                '수정 완료'
              )}
            </Button>
          </motion.div> 
        )}
      </div>
    </Container>
  );
}

export default function EditChildPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p className="text-gray-600">로딩 중...</p>
        </div>
      </div>
    }>
      <EditChildPageContent />
    </Suspense>
  );
} 