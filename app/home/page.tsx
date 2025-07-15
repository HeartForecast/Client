'use client'

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Container from "../components/Container"
import NavigationBar from "../components/NavigationBar"
import { useChild } from "../contexts/ChildContext"
import { 
  getForecastsByDate, 
  getForecastRecordsByDate,
  ForecastData,
  ForecastRecordData
} from "../auth/index"



// API 데이터 타입 정의
interface DiaryData {
  morning?: {
    forecast?: ForecastData;
    record?: ForecastRecordData;
  };
  afternoon?: {
    forecast?: ForecastData;
    record?: ForecastRecordData;
  };
  evening?: {
    forecast?: ForecastData;
    record?: ForecastRecordData;
  };
}

export default function Register() {
  const router = useRouter()
  const { isChildMode, selectedChild, isLoading, exitChildMode, enterChildMode } = useChild();
  const [childName, setChildName] = useState('')
  const [activeTab, setActiveTab] = useState('홈')
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<'morning' | 'afternoon' | 'evening'>('morning')
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [diaryData, setDiaryData] = useState<Record<string, DiaryData>>({})

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

  // 데이터 로딩 함수
  const loadDiaryData = async (date: string) => {
    if (!selectedChild?.id) {
      console.log('No selected child, cannot load diary data');
      return;
    }
    
    console.log('Loading diary data for date:', date, 'childId:', selectedChild.id);
    setLoading(true)
    setError(null)
    
    try {
      console.log('Making API calls...');
      const [forecastsResponse, recordsResponse] = await Promise.all([
        getForecastsByDate(selectedChild.id, date),
        getForecastRecordsByDate(selectedChild.id, date)
      ])

      console.log('Forecasts response:', forecastsResponse);
      console.log('Records response:', recordsResponse);

      const newDiaryData: DiaryData = {}

      // 예보 데이터 처리
      if (forecastsResponse.success && forecastsResponse.data) {
        console.log('Processing forecasts data:', forecastsResponse.data);
        forecastsResponse.data.forEach(forecast => {
          const timeZone = forecast.timeZone as 'morning' | 'afternoon' | 'evening'
          if (!newDiaryData[timeZone]) {
            newDiaryData[timeZone] = {}
          }
          newDiaryData[timeZone]!.forecast = forecast
        })
      } else {
        console.log('Forecasts API failed or no data:', forecastsResponse);
      }

      // 예보 기록 데이터 처리
      if (recordsResponse.success && recordsResponse.data) {
        console.log('Processing records data:', recordsResponse.data);
        recordsResponse.data.forEach(record => {
          const timeZone = record.timeZone as 'morning' | 'afternoon' | 'evening'
          if (!newDiaryData[timeZone]) {
            newDiaryData[timeZone] = {}
          }
          newDiaryData[timeZone]!.record = record
        })
      } else {
        console.log('Records API failed or no data:', recordsResponse);
      }

      console.log('Final diary data:', newDiaryData);
      setDiaryData(prev => ({
        ...prev,
        [date]: newDiaryData
      }))

    } catch (err) {
      console.error('Diary loading error:', err);
      setError('일기 데이터를 불러오는데 실패했습니다.')
    } finally {
      setLoading(false)
    }
  }

  const hasDiary = (date: Date) => {
    return isPastDate(date) && diaryData[formatDate(date)];
  };

  const handleDateClick = async (date: Date) => {
    console.log('Date clicked:', date);
    console.log('Is past date:', isPastDate(date));
    
    if (isPastDate(date)) {
      const dateStr = formatDate(date);
      console.log('Formatted date:', dateStr);
      setSelectedDate(dateStr);
      
      // 데이터가 없으면 로딩
      if (!diaryData[dateStr]) {
        console.log('No cached data, loading diary data...');
        await loadDiaryData(dateStr);
      } else {
        console.log('Using cached data:', diaryData[dateStr]);
      }
    } else {
      console.log('Date is not in the past, ignoring click');
    }
  };

  const handlePrevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1));
  };



  const calendarDays = generateCalendarDays();
  const selectedDiary = selectedDate ? diaryData[selectedDate] : null;

  const timeSlots = [
    { key: 'morning', label: '아침' },
    { key: 'afternoon', label: '점심' },
    { key: 'evening', label: '저녁' }
  ];

  // 선택된 아이 이름 표시 (아이 모드일 때는 selectedChild, 보호자 모드일 때는 기본값)
  const displayChildName = isChildMode && selectedChild ? selectedChild.name : (selectedChild ? selectedChild.name : childName);

  // 선택된 아이가 변경될 때 이름 업데이트
  useEffect(() => {
    if (selectedChild?.name) {
      setChildName(selectedChild.name);
    }
  }, [selectedChild?.name]);

  // 아이 모드 전환 함수
  const handleEnterChildMode = () => {
    if (selectedChild) {
      enterChildMode(selectedChild);
    }
  };

  // 디버깅용 로그
  console.log('Home page - isLoading:', isLoading);
  console.log('Home page - selectedChild:', selectedChild);

  // 로딩 중일 때
  if (isLoading) {
    return (
      <Container className="bg-white">
        <div className="flex flex-col items-center justify-center flex-grow w-full max-w-sm mx-auto mt-4">
          <div className="text-gray-400 mb-2">
            <svg className="w-8 h-8 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </div>
          <p className="text-gray-500 text-sm">아이 정보를 불러오는 중...</p>
        </div>
      </Container>
    );
  }

  // 선택된 아이가 없을 때
  if (!selectedChild) {
    return (
      <Container className="bg-white">
        <div className="flex flex-col items-center justify-center flex-grow w-full max-w-sm mx-auto mt-4">
          <div className="text-gray-400 mb-4">
            <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          <p className="text-gray-600 text-lg font-medium mb-2">선택된 아이가 없습니다</p>
          <p className="text-gray-500 text-sm text-center mb-4">
            아이 목록에서 아이를 선택해주세요
          </p>
          <button
            onClick={() => router.push('/settings')}
            className="px-6 py-2 bg-blue-500 text-white rounded-lg text-sm font-medium hover:bg-blue-600"
          >
            아이 목록으로 이동
          </button>
        </div>
      </Container>
    );
  }

  return (
    <Container className="bg-white">
      <div className="flex flex-col items-start justify-start flex-grow w-full max-w-sm mx-auto mt-4">
        <div className="w-full flex justify-between items-center mb-4">
          <span className="text-gray-900 font-semibold text-2xl">{displayChildName}</span>
          <div className="flex gap-2">
            {isChildMode ? (
              <button
                onClick={exitChildMode}
                className="px-3 py-1 bg-gray-200 text-gray-700 rounded-lg text-xs font-medium hover:bg-gray-300"
              >
                보호자 모드
              </button>
            ) : selectedChild && (
              <button
                onClick={handleEnterChildMode}
                className="px-3 py-1 bg-blue-200 text-blue-700 rounded-lg text-xs font-medium hover:bg-blue-300"
              >
                아이 모드
              </button>
            )}
          </div>
        </div>

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

        {selectedDate && (
          <div className="w-full space-y-4">
            <div className="text-xs text-gray-400 mb-2">
              {new Date(selectedDate).toLocaleDateString('ko-KR', { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric',
                weekday: 'long'
              })}
            </div>

            {/* 로딩 상태 */}
            {loading && (
              <div className="w-full text-center py-8">
                <div className="text-gray-400 mb-2">
                  <svg className="w-8 h-8 mx-auto animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                </div>
                <p className="text-gray-500 text-sm">일기 데이터를 불러오는 중...</p>
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
                  onClick={() => selectedDate && loadDiaryData(selectedDate)}
                  className="mt-2 px-4 py-2 bg-blue-500 text-white rounded-lg text-sm hover:bg-blue-600"
                >
                  다시 시도
                </button>
              </div>
            )}

            {/* 데이터 표시 */}
            {!loading && !error && selectedDiary && (
              <div className="w-full">
                <div className="text-lg font-semibold text-gray-800 mb-2">
                  {timeSlots.find(t => t.key === selectedTimeSlot)?.label} 기록
                </div>
              
              {(() => {
                const timeData = selectedDiary[selectedTimeSlot];
                
                if (!timeData) {
                  return (
                    <div className="text-center py-8">
                      <p className="text-gray-500 text-sm">해당 시간대의 데이터가 없습니다.</p>
                    </div>
                  );
                }
                
                return (
                  <div className="space-y-3">
                    {/* 예보 데이터 */}
                    {timeData.forecast && (
                      <div className="bg-white rounded-2xl p-5 border border-gray-100">
                        <div className="mb-3">
                          <span className="text-sm text-gray-400">예보</span>
                        </div>
                        <p className="text-base text-gray-600 leading-normal">
                          {timeData.forecast.memo || '예보 메모가 없습니다.'}
                        </p>
                      </div>
                    )}

                    {/* 실제 기록 데이터 */}
                    {timeData.record && (
                      <div className="bg-white rounded-2xl p-5 border border-gray-100">
                        <div className="mb-3">
                          <span className="text-sm text-gray-400">실제 기록</span>
                        </div>
                        <p className="text-base text-gray-600 leading-normal">
                          {timeData.record.memo || '실제 기록이 없습니다.'}
                        </p>
                      </div>
                    )}

                    {/* 데이터가 없는 경우 */}
                    {!timeData.forecast && !timeData.record && (
                      <div className="text-center py-8">
                        <p className="text-gray-500 text-sm">해당 시간대의 데이터가 없습니다.</p>
                      </div>
                    )}
                  </div>
                );
              })()}
              </div>
            )}
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
              과거 날짜를 클릭해서 {childName || '아이'}의 감정 일기를 확인해보세요
            </p>
            <p className="text-xs text-gray-400 mt-1">
              예보와 실제 기록을 비교하여 확인할 수 있습니다
            </p>
          </div>
        )}
      </div>
      {/* 네비게이션바는 보호자 모드에서만 노출 */}
      {!isChildMode && <NavigationBar activeTab={activeTab} onTabChange={setActiveTab} />}
    </Container>
  )
}