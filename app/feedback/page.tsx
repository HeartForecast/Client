'use client';

import { useState, useEffect, Suspense, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import Container from '../components/Container';
import HeaderBar from '../components/HeaderBar';
import Button from '../components/Button';
import { useChild } from '../contexts/ChildContext';
import { getForecastsByDate, getRecordsByDate, generateAIFeedbackData } from '../utils/forecastUtils';

interface TimeSlotEmotion {
  timeSlot: 'morning' | 'lunch' | 'dinner';
  forecastEmotion: string;
  actualEmotion: string;
  actualEmotionImage?: string;
  actualEmotionType?: string;
  memo?: string;
}

interface AIFeedback {
  morning: string;
  lunch: string;
  dinner: string;
}

interface ChatMessage {
  id: string;
  text: string;
  isCharacter: boolean;
  emotion?: string;
}

const timeSlots = ['morning', 'lunch', 'dinner'] as const;
const timeSlotInfo = {
  morning: { label: '아침' },
  lunch: { label: '점심' },
  dinner: { label: '저녁' }
};

function FeedbackPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { selectedChild } = useChild();
  
  const [isLoading, setIsLoading] = useState(true);
  const [emotionData, setEmotionData] = useState<TimeSlotEmotion[]>([]);
  const [aiFeedback, setAiFeedback] = useState<AIFeedback | null>(null);
  const [currentTimeSlot, setCurrentTimeSlot] = useState<'morning' | 'lunch' | 'dinner'>('morning');
  const [chatMessages, setChatMessages] = useState<{ [key: string]: ChatMessage[] }>({});
  const [currentMessageIndex, setCurrentMessageIndex] = useState<{ [key: string]: number }>({});
  const [isTyping, setIsTyping] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  const splitFeedbackIntoMessages = (feedbackText: string): string[] => {
    const cleanText = feedbackText.replace(/\[(아침|점심|저녁)\]\s*/g, '');
    const sentences = cleanText.split(/(?<=[.!?])\s+/).filter(s => s.trim().length > 0);
    
    const messages: string[] = [];
    
    for (const sentence of sentences) {
      const trimmedSentence = sentence.trim();
      if (trimmedSentence.length > 0) {
        messages.push(trimmedSentence);
      }
    }
    
    return messages.length > 0 ? messages : [cleanText];
  };

  const generateChatMessages = (feedbackText: string, emotion: string): ChatMessage[] => {
    const messages = splitFeedbackIntoMessages(feedbackText);
    return messages.map((text, index) => ({
      id: `msg-${currentTimeSlot}-${index}`,
      text,
      isCharacter: true,
      emotion
    }));
  };

    useEffect(() => {
    if (aiFeedback && emotionData.length > 0) {
      const currentData = emotionData.find(d => d.timeSlot === currentTimeSlot);
      const feedbackText = aiFeedback[currentTimeSlot];
      
      if (currentData && feedbackText) {
        if (!chatMessages[currentTimeSlot]) {
          setIsTransitioning(true);
          const messages = generateChatMessages(feedbackText, currentData.actualEmotion);
          setChatMessages(prev => ({
            ...prev,
            [currentTimeSlot]: messages
          }));
          setCurrentMessageIndex(prev => ({
            ...prev,
            [currentTimeSlot]: 0
          }));
          
          setTimeout(() => {
            setIsTransitioning(false);
          }, 300);
        }
      }
    }
  }, [currentTimeSlot, aiFeedback, emotionData, chatMessages]);

  useEffect(() => {
    const currentMessages = chatMessages[currentTimeSlot] || [];
    const currentIndex = currentMessageIndex[currentTimeSlot] || 0;
    
    if (currentMessages.length > 0 && currentIndex < currentMessages.length && !isTransitioning) {
      setIsTyping(true);
      const timer = setTimeout(() => {
        setIsTyping(false);
        if (currentIndex < currentMessages.length - 1) {
          setCurrentMessageIndex(prev => ({
            ...prev,
            [currentTimeSlot]: currentIndex + 1
          }));
        }
      }, 3500);

      return () => clearTimeout(timer);
    } else if (currentMessages.length > 0 && currentIndex >= currentMessages.length) {
      setIsTyping(false);
    }
  }, [currentMessageIndex, chatMessages, currentTimeSlot, isTransitioning]);

  useEffect(() => {
    const currentIndex = currentMessageIndex[currentTimeSlot] || 0;
    if (chatContainerRef.current && (currentIndex >= 0 || isTyping)) {
      const scrollToBottom = () => {
        if (chatContainerRef.current) {
          chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
        }
      };
      
      setTimeout(scrollToBottom, 100);
    }
  }, [currentMessageIndex, currentTimeSlot, isTyping, chatMessages]);

  useEffect(() => {
    const loadFeedbackData = async () => {
          if (!selectedChild) {
      return;
    }

      try {
        const dateParam = searchParams.get('date');
        let targetDate = dateParam;

        if (!targetDate) {
          const now = new Date();
          const koreaTime = new Date(now.getTime() + (9 * 60 * 60 * 1000));
          targetDate = koreaTime.toISOString().split('T')[0];
        }

        try {
          const forecasts = await getForecastsByDate(targetDate, selectedChild.id);
          const records = await getRecordsByDate(targetDate, selectedChild.id);

          if (forecasts.length > 0 && records.length > 0) {
            const childHealthInfo = "";
            
            const { emotionData: newEmotionData, aiFeedback: newAiFeedback } = await generateAIFeedbackData(
              forecasts, 
              records, 
              childHealthInfo
            );
            
            setEmotionData(newEmotionData);
            setAiFeedback(newAiFeedback);
          }
        } catch (error) {
        }
      } finally {
        setIsLoading(false);
      }
    };

    loadFeedbackData();
  }, [searchParams, selectedChild?.id]);

  const getCurrentEmotion = () => {
    const currentData = emotionData.find(d => d.timeSlot === currentTimeSlot);
    return currentData?.actualEmotion || '기쁜';
  };

  const getCurrentEmotionImage = () => {
    const currentData = emotionData.find(d => d.timeSlot === currentTimeSlot);
    return currentData?.actualEmotionImage || '/icon/기쁜 - big.svg';
  };

  const getEmotionGlowColor = () => {
    const currentData = emotionData.find(d => d.timeSlot === currentTimeSlot);
    const emotionType = currentData?.actualEmotionType || '중립';
    
    const emotionTypeColors = {
      '긍정': 'from-[#FF6F71]/10 to-[#FF8E8F]/10',
      '중립': 'from-[#FFD93D]/10 to-[#FFE55C]/10', 
      '부정': 'from-[#4A90E2]/10 to-[#5BA0F2]/10'
    };
    
    return emotionTypeColors[emotionType as keyof typeof emotionTypeColors] || emotionTypeColors['중립'];
  };

  const handleTimeSlotChange = (timeSlot: 'morning' | 'lunch' | 'dinner') => {
    setCurrentTimeSlot(timeSlot);
  };

  const handleNext = () => {
    const currentIndex = timeSlots.indexOf(currentTimeSlot);
    if (currentIndex < timeSlots.length - 1) {
      setCurrentTimeSlot(timeSlots[currentIndex + 1]);
    }
  };

  const handleGoBack = () => {
    router.push('/baby');
  };

  if (isLoading) {
    return (
      <Container>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#FF6F71] mx-auto mb-4"></div>
                            <p className="text-gray-600">이야기를 기다리고 있어요...</p>
          </div>
        </div>
      </Container>
    );
  }

  if (emotionData.length === 0) {
    return (
      <Container>
        <div className="flex-1 flex flex-col items-center justify-center px-4">
          <div className="text-center">
            <div className="w-32 h-32 mx-auto mb-6">
              <img
                src="/icon/그저 그런 - big.svg"
                alt="데이터 없음"
                className="w-full h-full"
              />
            </div>
            <h2 className="text-xl font-bold text-gray-800 mb-4">피드백 데이터가 없어요</h2>
            <p className="text-gray-600 mb-8">
              오늘의 예보와 기록을 완성하면<br />
              AI 피드백을 받을 수 있어요!
            </p>
            <Button
              onClick={handleGoBack}
              className="px-6 py-3 bg-[#FF6F71] text-white rounded-full hover:bg-[#FF5A5C]"
            >
              돌아가기
            </Button>
          </div>
        </div>
      </Container>
    );
  }

  const currentIndex = timeSlots.indexOf(currentTimeSlot);
  const isLast = currentIndex === timeSlots.length - 1;

    return (
    <Container>
      <div className="flex flex-col w-full h-full overflow-hidden">
        <div className="flex justify-center space-x-3 mb-16 px-4 pt-8">
          {timeSlots.map((timeSlot) => (
            <button
              key={timeSlot}
              onClick={() => handleTimeSlotChange(timeSlot)}
              className={`px-6 py-3 rounded-2xl text-base font-semibold transition-all duration-300 transform hover:scale-105 ${
                currentTimeSlot === timeSlot
                  ? 'bg-gradient-to-r from-[#FF6F71] to-[#FF8E8F] text-white shadow-xl shadow-[#FF6F71]/30'
                  : 'bg-white text-gray-600 hover:bg-gray-50 shadow-md hover:shadow-lg border border-gray-100'
              }`}
            >
              {timeSlotInfo[timeSlot].label}
            </button>
          ))}
        </div>

        <div className="flex flex-col px-4 pb-4 w-full h-full overflow-hidden">
          <div className="flex items-center justify-center mb-4 flex-shrink-0 pt-2">
            <motion.div
              animate={{
                y: [0, -8, 0],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              className="relative"
            >
              <div className="relative">
                <img
                  src={getCurrentEmotionImage()}
                  alt={`${getCurrentEmotion()} 감정 캐릭터`}
                  className="w-28 h-28 drop-shadow-lg"
                />
                <div className={`absolute -inset-0.5 bg-gradient-to-r ${getEmotionGlowColor()} rounded-full blur-sm`}></div>
              </div>
              <div className="absolute -bottom-3 left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-6 border-r-6 border-t-6 border-transparent border-t-white drop-shadow-sm"></div>
            </motion.div>
          </div>

          <div 
            ref={chatContainerRef}
            className="flex-1 bg-gradient-to-br from-gray-50 to-gray-100 rounded-3xl p-6 mb-4 overflow-y-auto shadow-inner border border-gray-200/50 w-full min-w-0" 
            style={{ minHeight: '300px', maxHeight: '300px' }}
          >
            <AnimatePresence mode="wait">
              {!isTransitioning && (
                <motion.div
                  key={`messages-${currentTimeSlot}`}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="w-full h-full"
                  style={{ minWidth: '100%', width: '100%' }}
                >
                  {(chatMessages[currentTimeSlot] || []).slice(0, (currentMessageIndex[currentTimeSlot] || 0) + 1).map((message, index) => (
                    <motion.div
                      key={message.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: index * 0.1 }}
                      className="mb-4 w-full"
                    >
                      <div className="bg-white rounded-2xl rounded-tl-sm p-5 shadow-lg border border-gray-100/50 backdrop-blur-sm w-full min-w-0">
                        <p className="text-gray-700 leading-relaxed text-base font-medium break-words">{message.text}</p>
                      </div>
                    </motion.div>
                  ))}
                  
                                {isTyping && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="bg-white rounded-2xl rounded-tl-sm p-5 shadow-lg border border-gray-100/50 backdrop-blur-sm w-full min-w-0"
                    >
                      <div className="flex space-x-2">
                        <div className="w-3 h-3 bg-gradient-to-r from-[#FF6F71] to-[#FF8E8F] rounded-full animate-pulse"></div>
                        <div className="w-3 h-3 bg-gradient-to-r from-[#FF6F71] to-[#FF8E8F] rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                        <div className="w-3 h-3 bg-gradient-to-r from-[#FF6F71] to-[#FF8E8F] rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
                      </div>
                    </motion.div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="flex justify-center flex-shrink-0">
            {!isLast && (
              <Button
                onClick={handleNext}
                className="px-8 py-4 bg-gradient-to-r from-[#FF6F71] to-[#FF8E8F] text-white rounded-2xl hover:from-[#FF5A5C] hover:to-[#FF7A7C] shadow-lg transform hover:scale-105 transition-all duration-300 font-semibold text-base"
              >
                다음
              </Button>
            )}
            
            {isLast && (
              <Button
                onClick={handleGoBack}
                className="px-8 py-4 bg-gradient-to-r from-[#FF6F71] to-[#FF8E8F] text-white rounded-2xl hover:from-[#FF5A5C] hover:to-[#FF7A7C] shadow-lg transform hover:scale-105 transition-all duration-300 font-semibold text-base"
              >
                돌아가기
              </Button>
            )}
          </div>
        </div>
      </div>
    </Container>
  );
}

export default function FeedbackPage() {
  return (
    <Suspense fallback={
      <Container>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#FF6F71] mx-auto mb-4"></div>
            <p className="text-gray-600">로딩 중...</p>
          </div>
        </div>
      </Container>
    }>
      <FeedbackPageContent />
    </Suspense>
  );
}