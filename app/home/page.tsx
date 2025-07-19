'use client'

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Container from "../components/Container"
import NavigationBar from "../components/NavigationBar"
import Toast from "../components/Toast"
import { useChild } from "../contexts/ChildContext"
import { 
  getForecastsByDate, 
  getForecastRecordsByDate,
  ForecastData,
  ForecastRecordData,
  isAuthenticated
} from "../auth/index"
import Calendar from "../components/Calendar"
import PageHeader from "../components/PageHeader"
import { getEmotionColor, fetchEmotionType } from "../utils/emotionUtils"
import { 
  DiaryData, 
  DiaryTimeData, 
  TimeSlot, 
  ToastState,
  TIME_PERIODS
} from "../types/common"
import { 
  formatDate, 
  isToday, 
  isPastDate, 
  isCurrentMonth, 
  generateCalendarDays 
} from "../utils/dateUtils"
import LoadingSpinner from "../components/LoadingSpinner"
import ErrorMessage from "../components/ErrorMessage"
import EmptyState from "../components/EmptyState"
import TimeSlotSelector from "../components/TimeSlotSelector"
import DiaryCard from "../components/DiaryCard"


// 공통 타입 사용

export default function Register() {
  const router = useRouter()
  const { isChildMode, selectedChild, isLoading, hasChildren, exitChildMode, enterChildMode, autoSelectFirstChild } = useChild();
  const [childName, setChildName] = useState('')
  const [activeTab, setActiveTab] = useState('홈')
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<TimeSlot>('morning')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [diaryData, setDiaryData] = useState<Record<string, DiaryData>>({})
  const [toast, setToast] = useState<ToastState>({
    message: '',
    type: 'warning',
    isVisible: false
  })

  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [forecastData, setForecastData] = useState<Record<string, Record<TimeSlot, Partial<DiaryTimeData>>>>({});



  // 데이터 로딩 함수
  const loadDiaryData = async (date: string) => {
    if (!selectedChild?.id) {
      console.log('No selected child, cannot load diary data');
      return;
    }
    
    console.log('Loading diary data for date:', date, 'childId:', selectedChild.id);
    console.log('API_BASE_URL:', process.env.NEXT_PUBLIC_API_BASE_URL);
    setLoading(true)
    setError(null)
    
    try {
      console.log('Making API calls...');
      console.log('Forecasts endpoint:', `/api/forecasts/${selectedChild.id}/${date}`);
      console.log('Records endpoint:', `/api/forecastRecords/${selectedChild.id}/${date}`);
      
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
        for (const forecast of forecastsResponse.data) {
          let timeZone: 'morning' | 'afternoon' | 'evening' | null = null;
          switch (forecast.timeZone) {
            case '아침': timeZone = 'morning'; break;
            case '점심': timeZone = 'afternoon'; break;
            case '저녁': timeZone = 'evening'; break;
            default: continue;
          }
          if (!timeZone) continue;
          if (!newDiaryData[timeZone]) {
            newDiaryData[timeZone] = {
              predictedEmotions: [],
              predictedText: '',
              actualEmotions: [],
              actualText: ''
            }
          }
          // 예보 데이터를 올바른 형식으로 변환
          const emotionType = await fetchEmotionType(forecast.emotionTypeId);
          const emotionName = emotionType?.name || '알 수 없음';
          const emotionCategory = emotionType?.type || '알 수 없음';
          const emotionColor = getEmotionColor(emotionName);
          newDiaryData[timeZone]!.predictedEmotions = [{ emotion: emotionName, category: emotionCategory, color: emotionColor }]
          newDiaryData[timeZone]!.predictedText = forecast.memo || '작성된 메모가 없습니다.'
        }
      } else {
        console.log('Forecasts API failed or no data:', forecastsResponse);
        console.log('Forecasts error:', forecastsResponse.error);
      }

      // 예보 기록 데이터 처리
      if (recordsResponse.success && recordsResponse.data) {
        console.log('Processing records data:', recordsResponse.data);
        for (const record of recordsResponse.data) {
          let timeZone: 'morning' | 'afternoon' | 'evening' | null = null;
          switch (record.timeZone) {
            case '아침': timeZone = 'morning'; break;
            case '점심': timeZone = 'afternoon'; break;
            case '저녁': timeZone = 'evening'; break;
            default: continue;
          }
          if (!timeZone) continue;
          if (!newDiaryData[timeZone]) {
            newDiaryData[timeZone] = {
              predictedEmotions: [],
              predictedText: '',
              actualEmotions: [],
              actualText: ''
            }
          }
          // 기록 데이터를 올바른 형식으로 변환
          const emotionType = await fetchEmotionType(record.emotionTypeId);
          const emotionName = emotionType?.name || '알 수 없음';
          const emotionCategory = emotionType?.type || '알 수 없음';
          const emotionColor = getEmotionColor(emotionName);
          newDiaryData[timeZone]!.actualEmotions = [{ emotion: emotionName, category: emotionCategory, color: emotionColor }]
          newDiaryData[timeZone]!.actualText = record.memo || '작성된 메모가 없습니다.'
        }
      } else {
        console.log('Records API failed or no data:', recordsResponse);
        console.log('Records error:', recordsResponse.error);
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

  const loadForecastData = async (date: string) => {
    if (!selectedChild?.id) return;
    setLoading(true);
    setError(null);
    try {
      const [forecastResponse, recordResponse] = await Promise.all([
        getForecastsByDate(selectedChild.id, date),
        getForecastRecordsByDate(selectedChild.id, date)
      ]);
      if (forecastResponse.success && forecastResponse.data) {
        const transformedData: any = {
          morning: null,
          afternoon: null,
          evening: null
        };
        for (const forecast of forecastResponse.data) {
          let timeZone: 'morning' | 'afternoon' | 'evening' | null = null;
          switch (forecast.timeZone) {
            case '아침': timeZone = 'morning'; break;
            case '점심': timeZone = 'afternoon'; break;
            case '저녁': timeZone = 'evening'; break;
            default: continue;
          }
          if (timeZone) {
            const emotionType = await fetchEmotionType(forecast.emotionTypeId);
            const emotionName = emotionType?.name || '알 수 없음';
            const emotionCategory = emotionType?.type || '알 수 없음';
            const emotionColor = getEmotionColor(emotionName);
            transformedData[timeZone] = {
              id: forecast.id,
              originalTimeZone: forecast.timeZone,
              predictedEmotions: [{ emotion: emotionName, category: emotionCategory, color: emotionColor }],
              predictedText: forecast.memo || '작성된 메모가 없습니다.',
              actualEmotions: [],
              actualText: ''
            };
          }
        }
        if (recordResponse.success && recordResponse.data) {
          for (const record of recordResponse.data) {
            let timeZone: 'morning' | 'afternoon' | 'evening' | null = null;
            switch (record.timeZone) {
              case '아침': timeZone = 'morning'; break;
              case '점심': timeZone = 'afternoon'; break;
              case '저녁': timeZone = 'evening'; break;
              default: continue;
            }
            if (timeZone && transformedData[timeZone]) {
              const emotionType = await fetchEmotionType(record.emotionTypeId);
              const emotionName = emotionType?.name || '알 수 없음';
              const emotionCategory = emotionType?.type || '알 수 없음';
              const emotionColor = getEmotionColor(emotionName);
              transformedData[timeZone].actualEmotions = [{ emotion: emotionName, category: emotionCategory, color: emotionColor }];
              transformedData[timeZone].actualText = record.memo || '작성된 메모가 없습니다.';
            }
          }
        }
        setForecastData(prev => ({ ...prev, [date]: transformedData }));
      } else {
        setError('예보 데이터를 불러오는데 실패했습니다.');
      }
    } catch (err) {
      setError('예보 데이터를 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const hasDiary = (date: Date) => {
    const dateStr = formatDate(date);
    
    // diaryData 확인
    const data = diaryData[dateStr];
    if (data) {
      const hasDiaryData = Object.values(data).some((timeSlot: any) => 
        timeSlot && (
          (timeSlot.predictedEmotions && timeSlot.predictedEmotions.length > 0) ||
          (timeSlot.actualEmotions && timeSlot.actualEmotions.length > 0)
        )
      );
      if (hasDiaryData) return true;
    }
    
    // forecastData 확인
    const forecastDataForDate = forecastData[dateStr];
    if (forecastDataForDate) {
      const hasForecastData = Object.values(forecastDataForDate).some((timeSlot: any) => 
        timeSlot && timeSlot.predictedEmotions && timeSlot.predictedEmotions.length > 0
      );
      if (hasForecastData) return true;
    }
    
    return false;
  };

  const handleDateClick = async (date: Date) => {
    const dateStr = formatDate(date);
    setSelectedDate(dateStr);
    if (isPastDate(date) || isToday(date)) {
      await loadDiaryData(dateStr);
    }
  };

  const handlePrevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1));
  };
  const handleNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1));
  };

  // getDefaultDiary 함수 위치를 selectedDiary 선언 위로 이동
  const getDefaultDiary = (date: string): Record<'morning' | 'afternoon' | 'evening', Partial<DiaryTimeData> | undefined> => {
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




  const selectedDiary: DiaryData | null =
    selectedDate && (isPastDate(new Date(selectedDate)) || isToday(new Date(selectedDate)))
      ? (diaryData[selectedDate] || getDefaultDiary(selectedDate))
      : null;

  // 선택된 아이 이름 표시 (아이 모드일 때는 selectedChild, 보호자 모드일 때는 기본값)
  const displayChildName = isChildMode && selectedChild ? selectedChild.name : (selectedChild ? selectedChild.name : childName);

  // 선택된 아이가 변경될 때 이름 업데이트
  useEffect(() => {
    if (selectedChild?.name) {
      setChildName(selectedChild.name);
    }
  }, [selectedChild?.name]);

  // 토스트 메시지 표시 함수
  const showToast = (message: string, type: 'success' | 'error' | 'warning') => {
    setToast({
      message,
      type,
      isVisible: true
    });
  };

  const hideToast = () => {
    setToast(prev => ({ ...prev, isVisible: false }));
  };

  // 선택된 아이가 없을 때 자동 선택 시도
  useEffect(() => {
    if (!isLoading && !selectedChild) {
      autoSelectFirstChild();
    }
  }, [isLoading, selectedChild, autoSelectFirstChild]);

  // 아이가 없을 때 토스트 메시지 표시 (hasChildren이 로딩 완료된 후에만)
  useEffect(() => {
    if (!isLoading && hasChildren === false && !selectedChild) {
      showToast('이동할 수 없습니다. 아이를 생성하거나 연결해주세요.', 'warning');
    }
  }, [isLoading, hasChildren, selectedChild]);

  // 현재 달의 과거 날짜들과 오늘 날짜에 대한 데이터 미리 로드
  useEffect(() => {
    if (selectedChild?.id && !isLoading) {
      const today = new Date();
      const year = currentMonth.getFullYear();
      const month = currentMonth.getMonth();
      const firstDay = new Date(year, month, 1);
      const lastDay = new Date(year, month + 1, 0);
      for (let date = new Date(firstDay); date <= lastDay; date.setDate(date.getDate() + 1)) {
        if (isPastDate(date) || isToday(date)) {
          const dateStr = formatDate(date);
          if (!forecastData[dateStr]) {
            loadForecastData(dateStr);
          }
        }
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedChild?.id, currentMonth, isLoading]);

  // 디버깅용 로그
  console.log('Home page - isLoading:', isLoading);
  console.log('Home page - selectedChild:', selectedChild);
  console.log('Home page - isAuthenticated:', isAuthenticated());
  
  // 클라이언트 사이드에서만 localStorage 접근
  if (typeof window !== 'undefined') {
    console.log('Home page - localStorage isAuthenticated:', localStorage.getItem('isAuthenticated'));
    console.log('Home page - localStorage authTimestamp:', localStorage.getItem('authTimestamp'));
  }

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



  return (
    <Container className="bg-white">
      <Toast
        message={toast.message}
        type={toast.type}
        isVisible={toast.isVisible}
        onClose={hideToast}
      />
      <div className="flex flex-col items-start justify-start w-full max-w-sm mx-auto mt-4 pb-20">
        {/* 상단바 */}
        <PageHeader />

        {/* 달력 컴포넌트 */}
        <Calendar
          selectedDate={selectedDate}
          onDateSelect={handleDateClick}
          hasDiary={hasDiary}
          isToday={isToday}
          isPastDate={isPastDate}
          isCurrentMonth={isCurrentMonth}
          formatDate={formatDate}
          readOnly={true}
        />

        {selectedDate && (isPastDate(new Date(selectedDate)) || isToday(new Date(selectedDate))) && (
          <TimeSlotSelector
            selectedTimeSlot={selectedTimeSlot}
            onTimeSlotChange={setSelectedTimeSlot}
          />
        )}

        {selectedDate && (isPastDate(new Date(selectedDate)) || isToday(new Date(selectedDate))) && (
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
              <LoadingSpinner message="일기 데이터를 불러오는 중..." />
            )}

            {/* 에러 상태 */}
            {error && (
              <ErrorMessage 
                message={error}
                onRetry={() => selectedDate && loadDiaryData(selectedDate)}
              />
            )}

            {/* 데이터 표시 */}
            {!loading && !error && selectedDiary && selectedDiary[selectedTimeSlot] && (
              <>
                {/* 선택된 시간대 일기 */}
                <div className="text-lg font-semibold text-gray-800 mb-2">
                  {TIME_PERIODS[selectedTimeSlot].label} 기록
                </div>
                
                {(() => {
                  const timeData = selectedDiary?.[selectedTimeSlot];
                  
                  if (!timeData) {
                    return (
                      <div className="text-center py-8">
                        <p className="text-gray-500 text-sm">해당 시간대의 예보가 없습니다.</p>
                      </div>
                    );
                  }
                  
                  return (
                    <div className="space-y-3">
                      {/* 예보 섹션 */}
                      <DiaryCard 
                        title="예보"
                        data={timeData}
                        type="forecast"
                      />

                      {/* 예보 기록 섹션 */}
                      <DiaryCard 
                        title="예보 기록"
                        data={timeData}
                        type="record"
                      />
                    </div>
                  );
                })()}
              </>
            )}

            {/* 데이터가 없는 경우 */}
            {!loading && !error && (!selectedDiary || !selectedDiary[selectedTimeSlot]) && selectedDate && (
              <EmptyState message="해당 시간대의 예보가 없습니다." />
            )}
          </div>
        )}

        {/* 날짜가 선택되지 않았거나 미래 날짜인 경우 간소화된 메시지 */}
        {(!selectedDate || !isPastDate(new Date(selectedDate)) && !isToday(new Date(selectedDate))) && (
          <div className="w-full text-center py-4">
            <p className="text-gray-500 text-sm">
              과거 날짜를 클릭해서 {childName || '아이'}의 감정 일기를 확인해보세요
            </p>
          </div>
        )}


      </div>
      
      {/* 하단 여백 */}
      <div className="h-8"></div>
      
      {/* 네비게이션바는 보호자 모드에서만 노출 */}
      {!isChildMode && <NavigationBar activeTab={activeTab} onTabChange={setActiveTab} showToast={showToast} />}
    </Container>
  )
}