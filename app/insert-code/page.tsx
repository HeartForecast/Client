'use client'

import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import Button from '../components/Button';

const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;

interface ChildInfo {
  id: number;
  name: string;
  age: number;
  // 기타 필요한 정보들
}

export default function Register() {
  const router = useRouter();
  
  const handleBack = () => {
    window.history.back();
  };

  const [code, setCode] = useState(["", "", "", "", "", ""]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [childInfo, setChildInfo] = useState<ChildInfo | null>(null);
  const inputsRef = useRef<(HTMLInputElement | null)[]>([]);

  const handleCodeChange = (e: React.ChangeEvent<HTMLInputElement>, idx: number) => {
    const val = e.target.value.replace(/[^0-9]/g, "").slice(0, 1); // 숫자만 허용
    const newCode = [...code];
    newCode[idx] = val;
    setCode(newCode);
    setError(null); // 에러 메시지 초기화
    
    if (val && idx < 5) {
      inputsRef.current[idx + 1]?.focus();
    }
  };

  const handleCodeKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, idx: number) => {
    if (e.key === "Backspace" && !code[idx] && idx > 0) {
      setCode((prev) => {
        const newCode = [...prev];
        newCode[idx - 1] = "";
        return newCode;
      });
      inputsRef.current[idx - 1]?.focus();
    }
  };

  const verifyCode = async (inviteCode: string) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await fetch(`${apiBaseUrl}/api/childRelations/childRelation`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          inviteCode: inviteCode
        })
      });

      if (!response.ok) {
        throw new Error('잘못된 초대 코드입니다.');
      }

      const data = await response.json();
      
      // 임시로 하드코딩된 아이 정보 (실제로는 API 응답에서 받아와야 함)
      setChildInfo({
        id: 1,
        name: "신희성",
        age: 8
      });
      
      return true;
    } catch (error) {
      console.error('코드 검증 실패:', error);
      setError('잘못된 초대 코드입니다. 다시 확인해주세요.');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const handleComplete = async () => {
    const inviteCode = code.join('');
    const success = await verifyCode(inviteCode);
    
    if (success) {
      // 성공 시 홈으로 이동
      router.push('/home');
    }
  };

  const fadeInOutVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
    exit: { opacity: 0, y: -10, transition: { duration: 0.3 } },
  };

  useEffect(() => {
    if (inputsRef.current[0]) {
      inputsRef.current[0].focus();
    }
  }, []);

  const isCodeComplete = code.every(c => c.length === 1);

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
        <div className="w-full mb-8">
          <span className="text-gray-500 font-medium text-sm mr-1">등록된 아이 프로필 추가</span>
          <h1 className="text-2xl font-semibold mb-3">아이 코드를 입력해주세요.</h1>
          <div className="w-full flex justify-center items-center mt-8">
            <div className="flex gap-2 justify-center items-center w-full">
              {code.map((c, i) => (
                <input
                  key={i}
                  ref={el => { inputsRef.current[i] = el; }}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  className="flex-1 min-w-0 h-16 text-2xl text-center border border-gray-300 rounded-lg bg-white focus:border-[#FF6F71] outline-none transition-colors"
                  value={c}
                  onChange={e => handleCodeChange(e, i)}
                  onKeyDown={e => handleCodeKeyDown(e, i)}
                  autoComplete="one-time-code"
                  disabled={isLoading}
                />
              ))}
            </div>
          </div>
          
          {error && (
            <div className="mt-4 text-sm text-red-500 text-center w-full">
              {error}
            </div>
          )}
          
          {isCodeComplete && !error && childInfo ? (
            <div className="mt-4 text-base text-gray-500 font-medium text-center w-full">
              {childInfo.name}님을 등록하려고 한게 맞을까요?
            </div>
          ) : (
            <div className="mt-4 text-base text-gray-500 font-medium text-center w-full select-none">
              6자리 코드를 모두 입력해주세요.
            </div>
          )}
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
          className={`flex w-full items-center justify-center gap-1 rounded-lg bg-[#FF6F71] text-white py-3 text-lg font-semibold text-gray-900 mb-4 transition-opacity ${isCodeComplete && !isLoading ? '' : 'opacity-50 cursor-not-allowed'}`}
          disabled={!isCodeComplete || isLoading}
          onClick={handleComplete}
        >
          {isLoading ? (
            <div className="flex items-center gap-2">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              확인 중...
            </div>
          ) : (
            '완료'
          )}
        </Button>
      </motion.div>
    </div>
  );
}