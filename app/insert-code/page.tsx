'use client'

import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import Button from '../components/Button';

export default function Register() {
  const handleBack = () => {
    window.history.back();
  };

  const [code, setCode] = useState(["", "", "", "", "", ""]);
  const inputsRef = useRef<(HTMLInputElement | null)[]>([]);

  const handleCodeChange = (e: React.ChangeEvent<HTMLInputElement>, idx: number) => {
    const val = e.target.value.replace(/[^a-zA-Z0-9]/g, "").slice(0, 1);
    const newCode = [...code];
    newCode[idx] = val;
    setCode(newCode);
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
          <h1 className="text-2xl font-semibold mb-1">아이 코드를 입력해주세요.</h1>
          <h1 className="text-base font-medium mb-4 text-gray-500">
            아이코드는 <span className="text-[#FF6F71] font-semibold">설정 &gt; 아이 코드</span>에서 확인할 수 있어요.
          </h1>
          <div className="w-full flex justify-center items-center mt-8">
            <div className="flex gap-2 justify-center items-center w-full">
              {code.map((c, i) => (
                <input
                  key={i}
                  ref={el => { inputsRef.current[i] = el; }}
                  type="text"
                  inputMode="text"
                  maxLength={1}
                  className="flex-1 min-w-0 h-16 text-2xl text-center border border-gray-300 rounded-lg bg-white focus:border-[#FF6F71] outline-none transition-colors"
                  value={c}
                  onChange={e => handleCodeChange(e, i)}
                  onKeyDown={e => handleCodeKeyDown(e, i)}
                  autoComplete="one-time-code"
                />
              ))}
            </div>
          </div>
          {isCodeComplete ? (
            <div className="mt-4 text-base text-gray-500 font-medium text-center w-full">신O성님을 등록하려고 한게 맞을까요?</div>
          ) : (
            <div className="mt-4 text-base text-gray-500 font-medium text-center w-full select-none">6자리 코드를 모두 입력해주세요.</div>
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
          className={`flex w-full items-center justify-center gap-1 rounded-lg bg-[#FF6F71] text-white py-3 text-lg font-semibold text-gray-900 mb-4 transition-opacity ${isCodeComplete ? '' : 'opacity-50 cursor-not-allowed'}`}
          disabled={!isCodeComplete}
        >
          완료
        </Button>
      </motion.div>
    </div>
  );
}