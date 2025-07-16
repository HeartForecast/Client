'use client'

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Container from "../components/Container"
import ParentNavigationBar from "../components/ParentNavigationBar"
import { useChild } from "../contexts/ChildContext"
import { 
  getForecastsByDate, 
  getForecastRecordsByDate,
  ForecastData,
  ForecastRecordData,
  isAuthenticated
} from "../auth/index"
import { 
  getEmotionColor, 
  fetchEmotionType, 
  EmotionTypeData 
} from "../utils/emotionUtils"
import ModeToggleButton from "../components/ModeToggleButton"

// 감정 타입 인터페이스 (공통 유틸리티 사용)
type EmotionType = EmotionTypeData;

// 시간대별 일기 데이터 구조 (타입 정의만 유지)
interface DiaryData {
  morning?: {
    predictedEmotions: Array<{emotion: string, category: string, color: string}>;
    predictedText: string;
    actualEmotions: Array<{emotion: string, category: string, color: string}>;
    actualText: string;
  };
  afternoon?: {
    predictedEmotions: Array<{emotion: string, category: string, color: string}>;
    predictedText: string;
    actualEmotions: Array<{emotion: string, category: string, color: string}>;
    actualText: string;
  };
  evening?: {
    predictedEmotions: Array<{emotion: string, category: string, color: string}>;
    predictedText: string;
    actualEmotions: Array<{emotion: string, category: string, color: string}>;
    actualText: string;
  };
}

export default function Present() {
  const router = useRouter()
  const { selectedChild, isLoading, exitChildMode } = useChild()
  const [currentName, setCurrentName] = useState('')
  const [currentId, setCurrentId] = useState('임시값 백엔드 추가예정')
  const [activeTab, setActiveTab] = useState('감정비교')
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<'morning' | 'afternoon' | 'evening'>('morning')
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [forecastData, setForecastData] = useState<Record<string, any>>({})

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
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
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

  const isMoreThanTwoDaysLater = (date: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const compareDate = new Date(date);
    compareDate.setHours(0, 0, 0, 0);
    
    // 2일 후 날짜 계산
    const twoDaysLater = new Date(today);
    twoDaysLater.setDate(today.getDate() + 2);
    
    return compareDate >= twoDaysLater;
  };

  const isCurrentMonth = (date: Date) => {
    return date.getMonth() === currentMonth.getMonth();
  };

  const hasDiary = (date: Date) => {
    return isPastDate(date);
  };

  const handleDateClick = async (date: Date) => {
    const dateStr = formatDate(date);
    console.log('Date clicked:', date, 'Formatted date:', dateStr);
    console.log('Is past date:', isPastDate(date));
    console.log('Is today:', isToday(date));
    console.log('Selected child:', selectedChild);
    setSelectedDate(dateStr);
    
    if (isPastDate(date) || isToday(date)) {
      console.log('Loading forecast data for past date or today...');
      await loadForecastData(dateStr);
    }
  };

  const handlePrevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1));
  };



  const loadForecastData = async (date: string) => {
    if (!selectedChild?.id) {
      console.log('No selected child, cannot load forecast data');
      return;
    }
    
    console.log('Loading forecast data for date:', date, 'childId:', selectedChild.id);
    setLoading(true)
    setError(null)
    
    try {
      console.log('🔍 API 호출 시작:', { childId: selectedChild.id, date });
      console.log('🔍 API_BASE_URL:', process.env.NEXT_PUBLIC_API_BASE_URL);
      
      // 예보와 예보 기록을 동시에 가져오기
      const [forecastResponse, recordResponse] = await Promise.all([
        getForecastsByDate(selectedChild.id, date),
        getForecastRecordsByDate(selectedChild.id, date)
      ]);
      
      console.log('Forecast response:', forecastResponse);
      console.log('Record response:', recordResponse);

      if (forecastResponse.success && forecastResponse.data) {
        console.log('✅ API 성공, 데이터 처리 시작');
        console.log('Processing forecast data:', forecastResponse.data);
        console.log('데이터 타입:', typeof forecastResponse.data);
        console.log('데이터 길이:', Array.isArray(forecastResponse.data) ? forecastResponse.data.length : 'not array');
        
        const transformedData: any = {
          morning: null,
          afternoon: null,
          evening: null
        };
        
        console.log('API response data length:', forecastResponse.data.length);
        for (const forecast of forecastResponse.data) {
          console.log('Processing forecast:', forecast);
          console.log('Forecast timeZone:', forecast.timeZone);
          
          let timeZone: 'morning' | 'afternoon' | 'evening' | null = null;
          switch (forecast.timeZone) {
            case '아침':
              timeZone = 'morning';
              break;
            case '점심':
              timeZone = 'afternoon';
              break;
            case '저녁':
              timeZone = 'evening';
              break;
            default:
              console.log('Unknown timeZone:', forecast.timeZone);
              continue;
          }
          
          if (timeZone) {
            const emotionType = await fetchEmotionType(forecast.emotionTypeId);
            const emotionName = emotionType?.name || '알 수 없음';
            const emotionCategory = emotionType?.type || '알 수 없음';
            const emotionColor = getEmotionColor(emotionName);
            
            transformedData[timeZone] = {
              predictedEmotions: [{ 
                emotion: emotionName, 
                category: emotionCategory,
                color: emotionColor
              }],
              predictedText: forecast.memo || '작성된 메모가 없습니다.',
              actualEmotions: [],
              actualText: ''
            };
            console.log('Updated timeZone data:', timeZone, transformedData[timeZone]);
          }
        }
        
        // 예보 기록 데이터 처리
        if (recordResponse.success && recordResponse.data) {
          console.log('Processing record data:', recordResponse.data);
          for (const record of recordResponse.data) {
            console.log('Processing record:', record);
            console.log('Record timeZone:', record.timeZone);
            
            let timeZone: 'morning' | 'afternoon' | 'evening' | null = null;
            switch (record.timeZone) {
              case '아침':
                timeZone = 'morning';
                break;
              case '점심':
                timeZone = 'afternoon';
                break;
              case '저녁':
                timeZone = 'evening';
                break;
              default:
                console.log('Unknown timeZone:', record.timeZone);
                continue;
            }
            
            if (timeZone && transformedData[timeZone]) {
              const emotionType = await fetchEmotionType(record.emotionTypeId);
              const emotionName = emotionType?.name || '알 수 없음';
              const emotionCategory = emotionType?.type || '알 수 없음';
              const emotionColor = getEmotionColor(emotionName);
              
              transformedData[timeZone].actualEmotions = [{ 
                emotion: emotionName, 
                category: emotionCategory,
                color: emotionColor
              }];
              transformedData[timeZone].actualText = record.memo || '작성된 메모가 없습니다.';
              console.log('Updated record data for timeZone:', timeZone, transformedData[timeZone]);
            }
          }
        }
        
        console.log('Transformed forecast data:', transformedData);
        console.log('저장할 날짜:', date);
        setForecastData(prev => {
          const newData = {
            ...prev,
            [date]: transformedData
          };
          console.log('업데이트된 forecastData:', newData);
          return newData;
        });
      } else {
        console.log('Forecast API failed or no data:', forecastResponse);
        setError('예보 데이터를 불러오는데 실패했습니다.');
      }
    } catch (err) {
      console.error('Forecast loading error:', err);
      setError('예보 데이터를 불러오는데 실패했습니다.');
    } finally {
      setLoading(false)
    }
  };

  const getDefaultDiary = (date: string): DiaryData => {
    return {
      morning: {
        predictedEmotions: [{ emotion: '예상 감정', category: '알 수 없음', color: '#6B7280' }],
        predictedText: '작성된 메모가 없습니다.',
        actualEmotions: [],
        actualText: ''
      },
      afternoon: {
        predictedEmotions: [{ emotion: '예상 감정', category: '알 수 없음', color: '#6B7280' }],
        predictedText: '작성된 메모가 없습니다.',
        actualEmotions: [],
        actualText: ''
      },
      evening: {
        predictedEmotions: [{ emotion: '예상 감정', category: '알 수 없음', color: '#6B7280' }],
        predictedText: '작성된 메모가 없습니다.',
        actualEmotions: [],
        actualText: ''
      }
    };
  };

  const calendarDays = generateCalendarDays();
  const selectedDiary = selectedDate && (isPastDate(new Date(selectedDate)) || isToday(new Date(selectedDate))) ? (forecastData[selectedDate] || getDefaultDiary(selectedDate)) : null;

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
          <span className="text-gray-900 font-semibold text-2xl">{selectedChild?.name || currentName}</span>
          <div className="flex items-center gap-1">
            <span className="text-sm text-gray-500 font-medium mr-1">{currentId}</span>
            <ModeToggleButton />
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
            <div className="w-full">
              {/* 로딩 상태 */}
              {loading && (
                <div className="w-full text-center py-8">
                  <div className="text-gray-400 mb-2">
                    <svg className="w-8 h-8 mx-auto animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                  </div>
                  <p className="text-gray-500 text-sm">예보 데이터를 불러오는 중...</p>
                </div>
              )}

              {/* 에러 상태 */}
              {error && (
                <div className="w-full text-center py-8">
                  <div className="text-red-400 mb-2">
                    <svg className="w-8 h-8 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <p className="text-red-500 text-sm">{error}</p>
                  <button 
                    onClick={() => selectedDate && loadForecastData(selectedDate)}
                    className="mt-2 px-4 py-2 bg-blue-500 text-white rounded-lg text-sm hover:bg-blue-600"
                  >
                    다시 시도
                  </button>
                </div>
              )}

              {/* 데이터 표시 */}
              {!loading && !error && selectedDiary && (
                <>
                  {/* 선택된 시간대 일기 */}
                  <div className="text-lg font-semibold text-gray-800 mb-2">
                    {timeSlots.find(t => t.key === selectedTimeSlot)?.label} 기록
                  </div>
                  
                  {(() => {
                    const timeData = selectedDiary[selectedTimeSlot];
                    
                    if (!timeData) {
                      return (
                        <div className="text-center py-8">
                          <p className="text-gray-500 text-sm">해당 시간대의 예보 데이터가 없습니다.</p>
                        </div>
                      );
                    }
                    
                    return (
                      <div className="space-y-3">
                        <div className="bg-white rounded-2xl p-5 border border-gray-100">
                          <div className="mb-3">
                            <span className="text-sm text-gray-400">
                              {timeData.predictedEmotions?.map((e: any) => (
                                <span 
                                  key={e.emotion} 
                                  className="inline-block px-2 py-1 rounded-full text-xs font-medium mr-1"
                                  style={{ backgroundColor: e.color + '20', color: e.color }}
                                >
                                  {e.emotion}
                                </span>
                              )) || '예상 감정'}
                            </span>
                          </div>
                          <p className="text-base text-gray-600 leading-normal">
                            {timeData.predictedText || '예보 메모가 없습니다.'}
                          </p>
                        </div>

                        <div className="bg-white rounded-2xl p-5 border border-gray-100">
                          <div className="mb-3">
                            <span className="text-sm text-gray-400">
                              {timeData.actualEmotions?.map((e: any) => (
                                <span 
                                  key={e.emotion} 
                                  className="inline-block px-2 py-1 rounded-full text-xs font-medium mr-1"
                                  style={{ backgroundColor: e.color + '20', color: e.color }}
                                >
                                  {e.emotion}
                                </span>
                              )) || '실제 감정'}
                            </span>
                          </div>
                          <p className="text-base text-gray-600 leading-normal">
                            {timeData.actualText || (isToday(new Date(selectedDate)) && (!timeData.actualEmotions || timeData.actualEmotions.length === 0) ? '' : '실제 기록이 없습니다.')}
                          </p>
                          
                          {/* 오늘 날짜이고 예보 기록이 없을 때 버튼 표시 */}
                          {isToday(new Date(selectedDate)) && (!timeData.actualEmotions || timeData.actualEmotions.length === 0) && (
                            <div className="mt-4">
                              <button
                                onClick={() => router.push(`/insert?step=${selectedTimeSlot}`)}
                                className="w-full bg-[#FF7B6F] hover:bg-[#FF6B5F] text-white font-medium py-2 px-4 rounded-lg transition-colors text-sm"
                              >
                                예보 기록 작성하기
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })()}
                </>
              )}

              {/* 데이터가 없는 경우 (2일 이후가 아닌 경우에만) */}
              {!loading && !error && !selectedDiary && !isMoreThanTwoDaysLater(new Date(selectedDate)) && (
                <div className="w-full text-center py-8">
                  <div className="text-gray-400 mb-2">
                    <svg className="w-12 h-12 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <p className="text-gray-500 text-sm">
                    해당 날짜의 예보 데이터가 없습니다.
                  </p>
                </div>
              )}
            </div>

            {isMoreThanTwoDaysLater(new Date(selectedDate)) && (
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