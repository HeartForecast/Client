'use client'

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Container from "../components/Container"
import ParentNavigationBar from "../components/ParentNavigationBar"

// 감정 카테고리 색상
const EMOTION_COLORS = {
  즐거움: '#3DC8EF',
  슬픔: '#FF7B6F',
  중립: '#FFD340'
};

// 시간대별 일기 데이터 구조
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
  '2024-01-15': {
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
  '2024-01-14': {
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
  }
};

export default function Present() {
  const router = useRouter()
  const [currentName, setCurrentName] = useState('신희성')
  const [currentId, setCurrentId] = useState('#342944')
  const [activeTab, setActiveTab] = useState('감정비교')
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<'morning' | 'afternoon' | 'evening'>('morning')
  const [currentMonth, setCurrentMonth] = useState(new Date())

  // 현재 달의 날짜들을 생성
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

  const isTomorrow = (date: Date) => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return date.toDateString() === tomorrow.toDateString();
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
    // 과거 날짜만 일기가 있다고 표시
    return isPastDate(date);
  };

  const handleDateClick = (date: Date) => {
    const dateStr = formatDate(date);
    setSelectedDate(dateStr);
  };

  const handlePrevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1));
  };

  // 일기가 없는 날짜에도 기본 일기 내용 제공
  const getDefaultDiary = (date: string) => {
    const dayNum = new Date(date).getDate();
    
    const sampleMorning = [
      {
        predictedEmotions: [{ emotion: '기대되는', category: '즐거움' }],
        predictedText: '새로운 하루가 시작되네요! 오늘은 뭔가 좋은 일이 있을 것 같아요.',
        actualEmotions: [{ emotion: '상쾌한', category: '즐거움' }],
        actualText: '아침에 일어나니 기분이 좋았어요. 날씨도 맑고 컨디션도 좋았습니다.'
      },
      {
        predictedEmotions: [{ emotion: '집중된', category: '중립' }],
        predictedText: '오늘은 공부에 집중할 수 있을 것 같아요.',
        actualEmotions: [{ emotion: '차분한', category: '중립' }],
        actualText: '아침 시간에 조용히 책을 읽었어요. 마음이 평온했습니다.'
      }
    ];

    const sampleAfternoon = [
      {
        predictedEmotions: [{ emotion: '활발한', category: '즐거움' }],
        predictedText: '오후에는 친구들과 활동적인 시간을 보낼 거예요.',
        actualEmotions: [{ emotion: '즐거운', category: '즐거움' }],
        actualText: '친구들과 함께 놀면서 정말 재미있는 시간을 보냈어요.'
      },
      {
        predictedEmotions: [{ emotion: '호기심 많은', category: '즐거움' }],
        predictedText: '새로운 것을 배우는 시간이 될 것 같아요.',
        actualEmotions: [{ emotion: '뿌듯한', category: '즐거움' }],
        actualText: '새로운 지식을 배워서 뿌듯했어요. 점점 실력이 늘고 있는 것 같습니다.'
      }
    ];

    const sampleEvening = [
      {
        predictedEmotions: [{ emotion: '평온한', category: '중립' }],
        predictedText: '저녁에는 가족과 함께 편안한 시간을 보낼 거예요.',
        actualEmotions: [{ emotion: '따뜻한', category: '즐거움' }],
        actualText: '가족과 함께 저녁을 먹으며 하루 이야기를 나누었어요. 정말 따뜻한 시간이었습니다.'
      },
      {
        predictedEmotions: [{ emotion: '만족스러운', category: '즐거움' }],
        predictedText: '하루를 마무리하며 성취감을 느낄 것 같아요.',
        actualEmotions: [{ emotion: '감사한', category: '중립' }],
        actualText: '오늘 하루를 돌이켜보니 정말 감사한 마음이 들었어요.'
      }
    ];
    
    const index = dayNum % 2;
    return {
      morning: sampleMorning[index],
      afternoon: sampleAfternoon[index],
      evening: sampleEvening[index]
    };
  };

  const calendarDays = generateCalendarDays();
  const selectedDiary = selectedDate && isPastDate(new Date(selectedDate)) ? (diaryData[selectedDate] || getDefaultDiary(selectedDate)) : null;

  const timeSlots = [
    { key: 'morning', label: '아침', time: '오전' },
    { key: 'afternoon', label: '점심', time: '오후' },
    { key: 'evening', label: '저녁', time: '저녁' }
  ];

  return (
    <Container>
      <div className="flex flex-col items-start justify-start flex-grow w-full max-w-sm mx-auto mt-4">
        {/* 사용자 정보 */}
        <div className="flex items-end gap-1 rounded-lg px-2 mb-6">
          <span className="text-gray-900 font-semibold text-2xl">{currentName}</span>
          <div className="flex items-center gap-1">
            <span className="text-sm text-gray-500 font-medium mr-1">{currentId}</span>
          </div>
        </div>

        {/* 달력 */}
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

          {/* 요일 헤더 */}
          <div className="grid grid-cols-7 gap-1 mb-2">
            {['일', '월', '화', '수', '목', '금', '토'].map(day => (
              <div key={day} className="text-center text-sm font-medium text-gray-500 py-2">
                {day}
              </div>
            ))}
          </div>

          {/* 날짜 그리드 */}
          <div className="grid grid-cols-7 gap-1">
            {calendarDays.map(date => (
              <button
                key={date.toISOString()}
                onClick={() => handleDateClick(date)}
                className={`
                  relative h-10 text-sm rounded-lg transition-colors hover:bg-gray-100
                  ${isCurrentMonth(date) ? 'text-gray-900' : 'text-gray-300'}
                  ${isToday(date) ? 'bg-blue-100 text-blue-600 font-semibold' : ''}
                  ${selectedDate === formatDate(date) ? 'bg-[#FF6F71] text-white' : ''}
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

        {/* 시간대 선택 버튼 */}
        {selectedDate && (
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

        {/* 선택된 날짜의 내용 */}
        {selectedDate && (
          <div className="w-full space-y-4">
            {/* 날짜 정보 */}
            <div className="text-xs text-gray-400 mb-2">
              {new Date(selectedDate).toLocaleDateString('ko-KR', { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric',
                weekday: 'long'
              })}
            </div>

            {/* 내일인 경우 - 예측 버튼 */}
            {isTomorrow(new Date(selectedDate)) && (
              <div className="w-full text-center py-8">
                <div className="bg-white rounded-2xl p-5 border border-gray-100">
                  <div className="text-lg font-semibold text-gray-800 mb-4">
                    내일의 일을 예측해보세요!
                  </div>
                  <p className="text-gray-600 text-sm mb-6">
                    내일 하루 어떤 감정을 느낄지 미리 예측해보아요
                  </p>
                  <button
                    onClick={() => router.push('/insert')}
                    className="bg-purple-500 hover:bg-purple-600 text-white font-medium py-3 px-6 rounded-lg transition-colors"
                  >
                    감정 예측하러 가기
                  </button>
                </div>
              </div>
            )}

            {/* 과거 날짜인 경우 - 일기 표시 */}
            {selectedDiary && (
              <div className="w-full">
                {/* 선택된 시간대 일기 */}
                <div className="text-lg font-semibold text-gray-800 mb-2">
                  {timeSlots.find(t => t.key === selectedTimeSlot)?.label} 기록
                </div>
                
                {(() => {
                  const timeData = selectedDiary[selectedTimeSlot];
                  return (
                    <div className="space-y-3">
                      <div className="bg-white rounded-2xl p-5 border border-gray-100">
                        <div className="mb-3">
                          <span className="text-sm text-gray-400">
                            {timeData.predictedEmotions.map(e => e.emotion).join(', ')}
                          </span>
                        </div>
                        <p className="text-base text-gray-600 leading-normal">
                          {timeData.predictedText}
                        </p>
                      </div>

                      <div className="bg-white rounded-2xl p-5 border border-gray-100">
                        <div className="mb-3">
                          <span className="text-sm text-gray-400">
                            {timeData.actualEmotions.map(e => e.emotion).join(', ')}
                          </span>
                        </div>
                        <p className="text-base text-gray-600 leading-normal">
                          {timeData.actualText}
                        </p>
                      </div>
                    </div>
                  );
                })()}
              </div>
            )}

            {!isPastDate(new Date(selectedDate)) && !isTomorrow(new Date(selectedDate)) && (
              <div className="w-full text-center py-8">
                <div className="bg-white rounded-2xl p-5 border border-gray-100">
                  <div className="text-lg font-semibold text-gray-800 mb-4">
                    감정 등록까지 멀었어요!!
                  </div>
                  <p className="text-gray-500 text-sm">
                    아직 시간이 많이 남았어요. 조금만 기다려주세요!
                  </p>
                </div>
              </div>
            )}
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
              날짜를 클릭해서 일기를 확인해보세요
            </p>
          </div>
        )}
      </div>
      
      <ParentNavigationBar activeTab={activeTab} onTabChange={setActiveTab} />
    </Container>
  )
} 