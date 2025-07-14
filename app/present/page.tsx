'use client'

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Container from "../components/Container"
import ParentNavigationBar from "../components/ParentNavigationBar"

const EMOTION_COLORS = {
  즐거움: '#3DC8EF',
  슬픔: '#FF7B6F',
  중립: '#FFD340'
};

const diaryData: Record<string, {
  morning: {
    predictedEmotions: Array<{emotion: string, category: string}>;
    predictedText: string;
    actualEmotions: Array<{emotion: string, category: string}>;
    actualText: string;
  };
  afternoon: {
    predictedEmotions: Array<{emotion: string, category: string}>;
    predictedText: string;
    actualEmotions: Array<{emotion: string, category: string}>;
    actualText: string;
  };
  evening: {
    predictedEmotions: Array<{emotion: string, category: string}>;
    predictedText: string;
    actualEmotions: Array<{emotion: string, category: string}>;
    actualText: string;
  };
}> = {
  '2025-07-13': {
    morning: {
      predictedEmotions: [{ emotion: '기대되는', category: '즐거움' }],
      predictedText: '오늘은 친구들과 만나서 즐거운 시간을 보낼 것 같아요!',
      actualEmotions: [{ emotion: '설레는', category: '즐거움' }],
      actualText: '아침부터 친구들 만날 생각에 정말 설렜어요.'
    },
    afternoon: {
      predictedEmotions: [{ emotion: '활발한', category: '즐거움' }],
      predictedText: '체육시간에 운동하면서 활기찬 오후가 될 것 같아요.',
      actualEmotions: [{ emotion: '신나는', category: '즐거움' }, { emotion: '즐거운', category: '즐거움' }],
      actualText: '체육시간에 축구했는데 너무 재미있었어요! 친구들과 같이 웃으면서 놀았습니다.'
    },
    evening: {
      predictedEmotions: [{ emotion: '만족스러운', category: '즐거움' }],
      predictedText: '하루를 정리하면서 뿌듯한 저녁이 될 것 같아요.',
      actualEmotions: [{ emotion: '행복한', category: '즐거움' }],
      actualText: '정말 완벽한 하루였어요. 친구들과 보낸 시간이 너무 소중했습니다.'
    }
  },
  '2025-07-12': {
    morning: {
      predictedEmotions: [{ emotion: '평온한', category: '중립' }],
      predictedText: '미술시간이 있어서 차분하고 집중된 아침이 될 것 같아요.',
      actualEmotions: [{ emotion: '집중된', category: '중립' }],
      actualText: '미술시간에 풍경화를 그렸는데 정말 집중해서 그렸어요.'
    },
    afternoon: {
      predictedEmotions: [{ emotion: '창의적인', category: '즐거움' }],
      predictedText: '오후에는 더 창의적인 활동을 할 수 있을 것 같아요.',
      actualEmotions: [{ emotion: '어려운', category: '슬픔' }],
      actualText: '그림이 생각보다 너무 어려웠어요. 계속 지우고 다시 그렸습니다.'
    },
    evening: {
      predictedEmotions: [{ emotion: '뿌듯한', category: '즐거움' }],
      predictedText: '완성된 작품을 보면서 성취감을 느낄 것 같아요.',
      actualEmotions: [{ emotion: '기쁜', category: '즐거움' }],
      actualText: '선생님이 제 그림을 칭찬해주셔서 정말 기뻤어요!'
    }
  },
  '2025-07-11': {
    morning: {
      predictedEmotions: [{ emotion: '걱정되는', category: '슬픔' }],
      predictedText: '수학 시험이 있어서 조금 걱정되네요.',
      actualEmotions: [{ emotion: '긴장된', category: '슬픔' }],
      actualText: '아침부터 시험 때문에 정말 긴장되었어요.'
    },
    afternoon: {
      predictedEmotions: [{ emotion: '어려운', category: '슬픔' }],
      predictedText: '시험 문제가 어려울 것 같아요.',
      actualEmotions: [{ emotion: '당황스러운', category: '슬픔' }],
      actualText: '시험 문제가 예상보다 훨씬 어려워서 당황했어요.'
    },
    evening: {
      predictedEmotions: [{ emotion: '후회되는', category: '슬픔' }],
      predictedText: '더 열심히 공부하지 못한 것이 후회될 것 같아요.',
      actualEmotions: [{ emotion: '안도하는', category: '중립' }],
      actualText: '시험이 끝나니까 일단 안도되었어요. 결과는 기다려봐야죠.'
    }
  },
  '2025-07-10': {
    morning: {
      predictedEmotions: [{ emotion: '상쾌한', category: '즐거움' }],
      predictedText: '토요일 아침, 늦잠 자고 일어나서 기분이 좋을 것 같아요.',
      actualEmotions: [{ emotion: '개운한', category: '즐거움' }],
      actualText: '푹 자고 일어나니까 정말 개운했어요.'
    },
    afternoon: {
      predictedEmotions: [{ emotion: '여유로운', category: '중립' }],
      predictedText: '주말이라 여유롭게 보낼 수 있을 것 같아요.',
      actualEmotions: [{ emotion: '편안한', category: '중립' }],
      actualText: '집에서 편하게 쉬면서 여유로운 오후를 보냈어요.'
    },
    evening: {
      predictedEmotions: [{ emotion: '즐거운', category: '즐거움' }],
      predictedText: '가족과 함께 시간을 보내며 즐거운 저녁이 될 것 같아요.',
      actualEmotions: [{ emotion: '따뜻한', category: '즐거움' }],
      actualText: '가족들과 함께 영화를 보면서 따뜻한 시간을 보냈어요.'
    }
  }
};

export default function Present() {
  const router = useRouter()
  const [childName, setChildName] = useState('신희성')
  const [activeTab, setActiveTab] = useState('감정비교')
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<'morning' | 'afternoon' | 'evening'>('morning')
  const [currentMonth, setCurrentMonth] = useState(new Date())

  const generateCalendarDays = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());
    
    const days = [];
    const endDate = new Date(lastDay);
    endDate.setDate(endDate.getDate() + (6 - lastDay.getDay()));
    
    const current = new Date(startDate);
    while (current <= endDate) {
      days.push(new Date(current));
      current.setDate(current.getDate() + 1);
    }
    
    return days;
  };

  const formatDate = (date: Date) => {
    return date.toISOString().split('T')[0];
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const isPastDate = (date: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const compareDate = new Date(date);
    compareDate.setHours(0, 0, 0, 0);
    return compareDate < today;
  };

  const isCurrentMonth = (date: Date) => {
    return date.getMonth() === currentMonth.getMonth();
  };

  const hasDiary = (date: Date) => {
    return isPastDate(date) && diaryData[formatDate(date)];
  };

  const handleDateClick = (date: Date) => {
    if (isPastDate(date)) {
      const dateStr = formatDate(date);
      setSelectedDate(dateStr);
    }
  };

  const handlePrevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1));
  };

  const analyzeEmotionComparison = (predicted: Array<{emotion: string, category: string}>, actual: Array<{emotion: string, category: string}>) => {
    const predictedCategories = predicted.map(p => p.category);
    const actualCategories = actual.map(a => a.category);
    
    const matchedCategories = predictedCategories.filter(cat => actualCategories.includes(cat));
    const matchPercentage = (matchedCategories.length / Math.max(predictedCategories.length, actualCategories.length)) * 100;
    
    if (matchPercentage >= 80) {
      return { status: 'excellent', message: '예측이 매우 정확했어요!', color: 'text-green-600' };
    } else if (matchPercentage >= 50) {
      return { status: 'good', message: '예측이 어느 정도 맞았어요', color: 'text-blue-600' };
    } else {
      return { status: 'different', message: '예측과 실제가 달랐어요', color: 'text-orange-600' };
    }
  };

  const calendarDays = generateCalendarDays();
  const selectedDiary = selectedDate ? diaryData[selectedDate] : null;

  const timeSlots = [
    { key: 'morning', label: '아침', time: '오전' },
    { key: 'afternoon', label: '점심', time: '오후' },
    { key: 'evening', label: '저녁', time: '저녁' }
  ];

  return (
    <Container>
      <div className="flex flex-col items-start justify-start flex-grow w-full max-w-sm mx-auto mt-4">
        <div className="flex items-center gap-2 rounded-lg px-2 mb-6">
          <div className="text-sm text-gray-500">보호자 모드</div>
          <span className="text-gray-900 font-semibold text-xl">{childName}의 감정 일기</span>
        </div>

        <div className="w-full mb-4">
          <div className="flex items-center justify-between mb-4">
            <button onClick={handlePrevMonth} className="p-2 hover:bg-gray-100 rounded-lg">
              <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <h2 className="text-lg font-semibold text-gray-900">
              {currentMonth.getFullYear()}년 {currentMonth.getMonth() + 1}월
            </h2>
            <button onClick={handleNextMonth} className="p-2 hover:bg-gray-100 rounded-lg">
              <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>

          <div className="grid grid-cols-7 gap-1 mb-2">
            {['일', '월', '화', '수', '목', '금', '토'].map(day => (
              <div key={day} className="text-center text-sm font-medium text-gray-500 py-2">
                {day}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1">
            {calendarDays.map(date => (
              <button
                key={date.toISOString()}
                onClick={() => handleDateClick(date)}
                disabled={!isPastDate(date)}
                className={`
                  relative h-10 text-sm rounded-lg transition-colors
                  ${isCurrentMonth(date) ? 'text-gray-900' : 'text-gray-300'}
                  ${isToday(date) ? 'bg-blue-100 text-blue-600 font-semibold' : ''}
                  ${selectedDate === formatDate(date) ? 'bg-[#FF6F71] text-white' : ''}
                  ${isPastDate(date) ? 'hover:bg-gray-100 cursor-pointer' : 'cursor-not-allowed opacity-50'}
                `}
              >
                {date.getDate()}
                {hasDiary(date) && (
                  <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-[#FF6F71] rounded-full"></div>
                )}
              </button>
            ))}
          </div>
        </div>

        {selectedDate && selectedDiary && (
          <div className="w-full mb-4">
            <div className="flex bg-gray-100 rounded-xl p-1">
              {timeSlots.map((timeSlot) => (
                <button
                  key={timeSlot.key}
                  onClick={() => setSelectedTimeSlot(timeSlot.key as 'morning' | 'afternoon' | 'evening')}
                  className={`
                    flex-1 py-2 px-4 text-sm font-medium rounded-lg transition-all
                    ${selectedTimeSlot === timeSlot.key 
                      ? 'bg-white text-gray-900 shadow-sm' 
                      : 'text-gray-500 hover:text-gray-700'
                    }
                  `}
                >
                  {timeSlot.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {selectedDate && selectedDiary && (
          <div className="w-full space-y-4">
            <div className="text-xs text-gray-400 mb-2">
              {new Date(selectedDate).toLocaleDateString('ko-KR', { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric',
                weekday: 'long'
              })}
            </div>

            <div className="w-full">
              <div className="text-lg font-semibold text-gray-800 mb-4">
                {timeSlots.find(t => t.key === selectedTimeSlot)?.label} 시간대 분석
              </div>
              
              {(() => {
                const timeData = selectedDiary[selectedTimeSlot];
                const analysis = analyzeEmotionComparison(timeData.predictedEmotions, timeData.actualEmotions);
                
                return (
                  <div className="space-y-4">
                    <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                      <div className="flex items-center justify-between mb-2">
                        <div className="text-sm font-semibold text-gray-700">예측 정확도</div>
                        <div className={`text-sm font-medium ${analysis.color}`}>
                          {analysis.message}
                        </div>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="bg-white border-2 border-blue-200 rounded-xl p-4 shadow-sm">
                        <div className="flex items-start justify-between mb-3">
                          <div className="text-sm font-semibold text-blue-600">예측했던 감정</div>
                          <div className="flex flex-wrap gap-2 justify-end">
                            {timeData.predictedEmotions.map((emotion, index) => (
                              <div
                                key={index}
                                className="px-3 py-1 rounded-full text-sm font-medium text-white"
                                style={{
                                  backgroundColor: EMOTION_COLORS[emotion.category as keyof typeof EMOTION_COLORS]
                                }}
                              >
                                {emotion.emotion}
                              </div>
                            ))}
                          </div>
                        </div>
                        <p className="text-gray-700 text-sm leading-relaxed">
                          {timeData.predictedText}
                        </p>
                      </div>

                      <div className="bg-white border-2 border-green-200 rounded-xl p-4 shadow-sm">
                        <div className="flex items-start justify-between mb-3">
                          <div className="text-sm font-semibold text-green-600">실제 느낀 감정</div>
                          <div className="flex flex-wrap gap-2 justify-end">
                            {timeData.actualEmotions.map((emotion, index) => (
                              <div
                                key={index}
                                className="px-3 py-1 rounded-full text-sm font-medium text-white"
                                style={{
                                  backgroundColor: EMOTION_COLORS[emotion.category as keyof typeof EMOTION_COLORS]
                                }}
                              >
                                {emotion.emotion}
                              </div>
                            ))}
                          </div>
                        </div>
                        <p className="text-gray-700 text-sm leading-relaxed">
                          {timeData.actualText}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })()}
            </div>
          </div>
        )}

        {!selectedDate && (
          <div className="w-full text-center py-8">
            <div className="text-gray-400 mb-2">
              <svg className="w-12 h-12 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 002 2z" />
              </svg>
            </div>
            <p className="text-gray-500 text-sm">
              과거 날짜를 클릭해서 {childName}의 감정 일기를 확인해보세요
            </p>
            <p className="text-xs text-gray-400 mt-1">
              예측과 실제 감정을 비교하여 분석해드립니다
            </p>
          </div>
        )}
      </div>
      
      <ParentNavigationBar activeTab={activeTab} onTabChange={setActiveTab} />
    </Container>
  )
} 