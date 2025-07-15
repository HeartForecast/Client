'use client'

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Container from "../components/Container"
import NavigationBar from "../components/NavigationBar"
import { useChild } from "../contexts/ChildContext";

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
      predictedText: '오늘은 친구들과 만나서 즐거운 시간을 보낼 것 같아요! 새로운 장소도 가보고 맛있는 음식도 먹으면서 정말 행복한 하루가 될 것 같습니다.',
      actualEmotions: [{ emotion: '설레는', category: '즐거움' }],
      actualText: '아침부터 친구들 만날 생각에 정말 설렜어요. 오랜만에 만나는 친구들이라 더욱 기대되었고 어떤 이야기를 나눌지 상상만 해도 즐거웠습니다.'
    },
    afternoon: {
      predictedEmotions: [{ emotion: '활발한', category: '즐거움' }],
      predictedText: '체육시간에 운동하면서 활기찬 오후가 될 것 같아요. 친구들과 함께 뛰어놀면서 스트레스도 풀고 건강도 챙길 수 있을 것 같습니다.',
      actualEmotions: [{ emotion: '신나는', category: '즐거움' }, { emotion: '즐거운', category: '즐거움' }],
      actualText: '체육시간에 축구했는데 너무 재미있었어요! 친구들과 같이 웃으면서 놀았고 골도 넣어서 정말 신났습니다. 오랜만에 이렇게 즐거운 시간을 보냈어요.'
    },
    evening: {
      predictedEmotions: [{ emotion: '만족스러운', category: '즐거움' }],
      predictedText: '하루를 정리하면서 뿌듯한 저녁이 될 것 같아요. 친구들과 보낸 시간을 떠올리며 오늘 하루에 대해 만족스러운 마음이 들 것 같습니다.',
      actualEmotions: [{ emotion: '행복한', category: '즐거움' }],
      actualText: '정말 완벽한 하루였어요. 친구들과 보낸 시간이 너무 소중했고 오랜만에 이렇게 행복한 기분을 느꼈습니다. 내일도 이런 날이었으면 좋겠어요.'
    }
  },
  '2025-07-12': {
    morning: {
      predictedEmotions: [{ emotion: '평온한', category: '중립' }],
      predictedText: '미술시간이 있어서 차분하고 집중된 아침이 될 것 같아요. 그림을 그리면서 마음을 안정시키고 창의적인 생각을 할 수 있을 것 같습니다.',
      actualEmotions: [{ emotion: '집중된', category: '중립' }],
      actualText: '미술시간에 풍경화를 그렸는데 정말 집중해서 그렸어요. 색칠하는 동안 마음이 차분해지고 평온한 기분이 들었습니다. 시간가는 줄 몰랐어요.'
    },
    afternoon: {
      predictedEmotions: [{ emotion: '창의적인', category: '즐거움' }],
      predictedText: '오후에는 더 창의적인 활동을 할 수 있을 것 같아요. 새로운 아이디어들이 떠올라서 더욱 흥미로운 작품을 만들 수 있을 것 같습니다.',
      actualEmotions: [{ emotion: '어려운', category: '슬픔' }],
      actualText: '그림이 생각보다 너무 어려웠어요. 계속 지우고 다시 그렸는데도 만족스럽지 않았습니다. 다른 친구들은 잘 그리는 것 같은데 저만 못하는 것 같았어요.'
    },
    evening: {
      predictedEmotions: [{ emotion: '뿌듯한', category: '즐거움' }],
      predictedText: '완성된 작품을 보면서 성취감을 느낄 것 같아요. 오늘 하루 열심히 노력한 결과물을 보며 뿌듯한 마음이 들 것 같습니다.',
      actualEmotions: [{ emotion: '기쁜', category: '즐거움' }],
      actualText: '선생님이 제 그림을 칭찬해주셔서 정말 기뻤어요! 어려웠지만 포기하지 않고 끝까지 완성해서 뿌듯했습니다. 다음에도 더 열심히 해보고 싶어요.'
    }
  },
  '2025-07-11': {
    morning: {
      predictedEmotions: [{ emotion: '걱정되는', category: '슬픔' }],
      predictedText: '수학 시험이 있어서 조금 걱정되네요. 어려운 문제들이 나올까봐 불안하고 준비를 충분히 했는지 확신이 서지 않습니다.',
      actualEmotions: [{ emotion: '긴장된', category: '슬픔' }],
      actualText: '아침부터 시험 때문에 정말 긴장되었어요. 밤새 공부했는데도 자신이 없었고 시험장에 들어가기 전까지 계속 떨렸습니다. 손에 땀이 날 정도로 긴장했어요.'
    },
    afternoon: {
      predictedEmotions: [{ emotion: '어려운', category: '슬픔' }],
      predictedText: '시험 문제가 어려울 것 같아요. 평소보다 더 복잡한 문제들이 나와서 시간 안에 다 풀지 못할 것 같은 불안감이 듭니다.',
      actualEmotions: [{ emotion: '당황스러운', category: '슬픔' }],
      actualText: '시험 문제가 예상보다 훨씬 어려워서 당황했어요. 처음 보는 유형의 문제들이 많았고 시간도 부족해서 마지막 문제는 거의 찍었습니다. 정말 힘들었어요.'
    },
    evening: {
      predictedEmotions: [{ emotion: '후회되는', category: '슬픔' }],
      predictedText: '더 열심히 공부하지 못한 것이 후회될 것 같아요. 시험을 치고 나서 틀린 것들을 생각하면 아쉬운 마음이 들 것 같습니다.',
      actualEmotions: [{ emotion: '안도하는', category: '중립' }],
      actualText: '시험이 끝나니까 일단 안도되었어요. 결과는 기다려봐야겠지만 최선을 다했으니 후회는 없습니다. 다음엔 더 준비를 철저히 해야겠어요.'
    }
  },
  '2025-07-10': {
    morning: {
      predictedEmotions: [{ emotion: '상쾌한', category: '즐거움' }],
      predictedText: '토요일 아침, 늦잠 자고 일어나서 기분이 좋을 것 같아요. 평일보다 여유롭게 시작하는 하루라서 더욱 상쾌할 것 같습니다.',
      actualEmotions: [{ emotion: '개운한', category: '즐거움' }],
      actualText: '푹 자고 일어나니까 정말 개운했어요. 알람 소리에 급하게 일어나지 않아도 되니까 몸도 마음도 편했습니다. 오랜만에 이렇게 여유로운 아침이었어요.'
    },
    afternoon: {
      predictedEmotions: [{ emotion: '여유로운', category: '중립' }],
      predictedText: '주말이라 여유롭게 보낼 수 있을 것 같아요. 평소에 못했던 취미활동도 하고 책도 읽으면서 편안한 시간을 보낼 수 있을 것 같습니다.',
      actualEmotions: [{ emotion: '편안한', category: '중립' }],
      actualText: '집에서 편하게 쉬면서 여유로운 오후를 보냈어요. 좋아하는 음악을 들으며 책을 읽고 간식도 먹으면서 정말 평화로운 시간이었습니다.'
    },
    evening: {
      predictedEmotions: [{ emotion: '즐거운', category: '즐거움' }],
      predictedText: '가족과 함께 시간을 보내며 즐거운 저녁이 될 것 같아요. 평소에 바빠서 못했던 대화도 나누고 함께 활동할 수 있을 것 같습니다.',
      actualEmotions: [{ emotion: '따뜻한', category: '즐거움' }],
      actualText: '가족들과 함께 영화를 보면서 따뜻한 시간을 보냈어요. 팝콘도 먹고 함께 웃으면서 정말 행복했습니다. 이런 시간이 더 많았으면 좋겠어요.'
    }
  }
};

export default function Register() {
  const router = useRouter()
  const { isChildMode, selectedChild, exitChildMode } = useChild();
  const [childName, setChildName] = useState('신희성')
  const [activeTab, setActiveTab] = useState('홈')
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

  // 아이 모드일 때 childName을 selectedChild에서 가져옴
  const displayChildName = isChildMode && selectedChild ? selectedChild.name : childName;

  return (
    <Container>
      <div className="flex flex-col items-start justify-start flex-grow w-full max-w-sm mx-auto mt-4">
        {isChildMode && (
          <div className="w-full flex justify-between items-center mb-4">
            <span className="text-gray-900 font-semibold text-2xl">{displayChildName}</span>
            <button
              onClick={exitChildMode}
              className="px-3 py-1 bg-gray-200 text-gray-700 rounded-lg text-xs font-medium hover:bg-gray-300"
            >
              보호자 모드로 전환
            </button>
          </div>
        )}
        {!isChildMode && (
          <div className="flex items-center gap-2 rounded-lg px-2 mb-6">
            <span className="text-gray-900 font-semibold text-2xl">{displayChildName}</span>
          </div>
        )}

        {/* 달력 및 일기 UI는 항상 노출 */}
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
          </div>
        )}

        {!selectedDate && (
          <div className="w-full text-center py-8">
            <div className="text-gray-400 mb-2">
              <svg className="w-12 h-12 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
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
      {/* 네비게이션바는 보호자 모드에서만 노출 */}
      {!isChildMode && <NavigationBar activeTab={activeTab} onTabChange={setActiveTab} />}
    </Container>
  )
}