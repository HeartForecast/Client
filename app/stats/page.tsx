'use client'

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Container from "../components/Container"
import NavigationBar from "../components/NavigationBar"
import Toast from "../components/Toast"
import { useChild } from "../contexts/ChildContext"
import { 
  getDailyTemperature, 
  getAverageTemperature, 
  getTimezoneEmotions, 
  getEmotionRatio, 
  getEmotionErrorRate,
  DailyTemperatureData,
  AverageTemperatureData,
  TimezoneEmotionData,
  EmotionRatioData,
  EmotionErrorRateData
} from "../auth/index"
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  LineElement,
  PointElement,
  Filler,
} from 'chart.js'
import { Doughnut, Bar, Line } from 'react-chartjs-2'

ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  LineElement,
  PointElement,
  Filler
)

const EMOTION_COLORS = {
  기쁨: '#3DC8EF',
  슬픔: '#FF7B6F',
  중립: '#FFD340',
  분노: '#FF6B6B',
  놀람: '#4ECDC4',
  두려움: '#9B59B6',
  혐오: '#E67E22'
};

export default function StatsPage() {
  const router = useRouter()
  const { isChildMode, selectedChild, hasChildren, autoSelectFirstChild } = useChild();
  const [childName, setChildName] = useState('')
  const [activeTab, setActiveTab] = useState('통계')
  const [statsUnit, setStatsUnit] = useState<'week' | 'month'>('week')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [toast, setToast] = useState<{
    message: string;
    type: 'success' | 'error' | 'warning';
    isVisible: boolean;
  }>({
    message: '',
    type: 'warning',
    isVisible: false
  })
  
  // API 데이터 상태
  const [dailyTemperatureData, setDailyTemperatureData] = useState<DailyTemperatureData[]>([])
  const [averageTemperatureData, setAverageTemperatureData] = useState<AverageTemperatureData | null>(null)
  const [timezoneEmotionsData, setTimezoneEmotionsData] = useState<TimezoneEmotionData[]>([])
  const [emotionRatioData, setEmotionRatioData] = useState<EmotionRatioData[]>([])
  const [emotionErrorRateData, setEmotionErrorRateData] = useState<EmotionErrorRateData[]>([])

  // 날짜 범위 계산
  const getDateRange = () => {
    const now = new Date()
    
    if (statsUnit === 'week') {
      // 이번 주 (월요일부터 일요일까지)
      const startOfWeek = new Date(now)
      const dayOfWeek = now.getDay()
      const diff = now.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1) // 월요일이 1, 일요일이 0
      startOfWeek.setDate(diff)
      
      const endOfWeek = new Date(startOfWeek)
      endOfWeek.setDate(startOfWeek.getDate() + 6) // 일요일까지
      
      return {
        startDate: startOfWeek.toISOString().split('T')[0],
        endDate: endOfWeek.toISOString().split('T')[0]
      }
    } else {
      // 현재 달 (1일부터 마지막 날까지)
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
      const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0) // 다음 달 0일 = 이번 달 마지막 날
      
      return {
        startDate: startOfMonth.toISOString().split('T')[0],
        endDate: endOfMonth.toISOString().split('T')[0]
      }
    }
  }

  // 데이터 로딩
  const loadStatisticsData = async () => {
    if (!selectedChild?.id) return
    
    setLoading(true)
    setError(null)
    
    try {
      const { startDate, endDate } = getDateRange()
      const childId = selectedChild.id

      const [
        dailyTempResponse,
        avgTempResponse,
        timezoneResponse,
        ratioResponse,
        errorRateResponse
      ] = await Promise.all([
        getDailyTemperature(childId, startDate, endDate),
        getAverageTemperature(childId, startDate, endDate),
        getTimezoneEmotions(childId, startDate, endDate),
        getEmotionRatio(childId, startDate, endDate),
        getEmotionErrorRate(childId, startDate, endDate)
      ])

      if (dailyTempResponse.success) setDailyTemperatureData(dailyTempResponse.data || [])
      if (avgTempResponse.success) setAverageTemperatureData(avgTempResponse.data || null)
      if (timezoneResponse.success) setTimezoneEmotionsData(timezoneResponse.data || [])
      if (ratioResponse.success) setEmotionRatioData(ratioResponse.data || [])
      if (errorRateResponse.success) setEmotionErrorRateData(errorRateResponse.data || [])

    } catch (err) {
      setError('통계 데이터를 불러오는데 실패했습니다.')
      console.error('Statistics loading error:', err)
    } finally {
      setLoading(false)
    }
  }

  // 선택된 아이가 변경되거나 단위가 변경될 때 데이터 로딩
  useEffect(() => {
    if (selectedChild?.id) {
      setChildName(selectedChild.name)
      loadStatisticsData()
    }
  }, [selectedChild?.id, statsUnit])

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
    if (!selectedChild) {
      autoSelectFirstChild();
    }
  }, [selectedChild, autoSelectFirstChild]);

  // 아이가 없을 때 토스트 메시지 표시
  useEffect(() => {
    if (!hasChildren && !selectedChild) {
      showToast('이동할 수 없습니다. 아이를 생성하거나 연결해주세요.', 'warning');
    }
  }, [hasChildren, selectedChild]);

  // 계산된 데이터
  const currentAccuracyData = dailyTemperatureData.map(d => d.avgTemp)
  const latestAccuracy = currentAccuracyData.length > 0 ? currentAccuracyData[currentAccuracyData.length - 1] : 0
  const averageAccuracy = currentAccuracyData.length > 0 
    ? currentAccuracyData.reduce((sum, val) => sum + val, 0) / currentAccuracyData.length 
    : 0

  // 아이 모드일 때 접근 차단
  if (isChildMode) {
    if (typeof window !== 'undefined') {
      router.replace('/home');
    }
    return null;
  }



  // 감정 예측 정확도 반원형 게이지 차트 데이터
  const accuracyChartData = {
    labels: ['정확도'],
    datasets: [
      {
        data: [latestAccuracy, 100 - latestAccuracy],
        backgroundColor: [
          latestAccuracy >= 90 ? '#10B981' : latestAccuracy >= 70 ? '#3B82F6' : '#F59E0B',
          'rgba(243, 244, 246, 0.3)'
        ],
        borderColor: [
          latestAccuracy >= 90 ? '#10B981' : latestAccuracy >= 70 ? '#3B82F6' : '#F59E0B',
          'rgba(229, 231, 235, 0.5)'
        ],
        borderWidth: 0,
        cutout: '80%',
        circumference: 180,
        rotation: -90,
      },
    ],
  };

  const accuracyChartOptions = {
    responsive: true,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        enabled: false,
      }
    },
    animation: {
      duration: 800,
    },
    maintainAspectRatio: false,
  };

  // 정확도 추이 라인 차트 데이터
  const accuracyTrendData = {
    labels: statsUnit === 'week' 
      ? dailyTemperatureData.map(item => {
          const date = new Date(item.date)
          const dayNames = ['일', '월', '화', '수', '목', '금', '토']
          return dayNames[date.getDay()]
        })
      : dailyTemperatureData.map(item => {
          const date = new Date(item.date)
          return `${date.getMonth() + 1}/${date.getDate()}`
        }),
    datasets: [
      {
        label: '정확도 추이',
        data: currentAccuracyData,
        borderColor: 'rgba(61, 200, 239, 1)',
        backgroundColor: 'rgba(61, 200, 239, 0.1)',
        borderWidth: 4,
        fill: true,
        tension: 0.4,
        pointBackgroundColor: 'rgba(61, 200, 239, 1)',
        pointBorderColor: 'white',
        pointBorderWidth: 3,
        pointRadius: 8,
        pointHoverRadius: 12,
        pointHoverBackgroundColor: 'rgba(61, 200, 239, 0.8)',
        pointHoverBorderColor: 'white',
        pointHoverBorderWidth: 4,
      },
    ],
  };

  const accuracyTrendOptions = {
    responsive: true,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: 'white',
        bodyColor: 'white',
        borderColor: 'rgba(61, 200, 239, 1)',
        borderWidth: 1,
        callbacks: {
          label: function(context: any) {
            return '정확도: ' + context.parsed.y + '%';
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 100,
        ticks: {
          callback: function(value: any) {
            return value + '%';
          },
          color: 'rgba(107, 114, 128, 0.8)',
        },
        grid: {
          color: 'rgba(0, 0, 0, 0.05)',
        },
        border: {
          display: false,
        }
      },
      x: {
        grid: {
          display: false,
        },
        ticks: {
          color: 'rgba(107, 114, 128, 0.8)',
        },
        border: {
          display: false,
        }
      }
    },
    animation: {
      duration: 800,
    },
    maintainAspectRatio: false,
  };

  // 감정 분포 바 차트 데이터 (API 데이터 기반)
  const emotionChartData = {
    labels: emotionRatioData.map(item => item.emotionName),
    datasets: [
      {
        label: '감정 분포',
        data: emotionRatioData.map(item => item.ratio * 100),
        backgroundColor: emotionRatioData.map(item => 
          `rgba(${EMOTION_COLORS[item.emotionName as keyof typeof EMOTION_COLORS]?.replace('#', '').match(/.{2}/g)?.map(x => parseInt(x, 16)).join(', ')}, 0.8)` || 'rgba(128, 128, 128, 0.8)'
        ),
        borderColor: emotionRatioData.map(item => 
          EMOTION_COLORS[item.emotionName as keyof typeof EMOTION_COLORS] || '#808080'
        ),
        borderWidth: 3,
        borderRadius: 12,
        borderSkipped: false,
        hoverBackgroundColor: emotionRatioData.map(item => 
          `rgba(${EMOTION_COLORS[item.emotionName as keyof typeof EMOTION_COLORS]?.replace('#', '').match(/.{2}/g)?.map(x => parseInt(x, 16)).join(', ')}, 1)` || 'rgba(128, 128, 128, 1)'
        ),
        hoverBorderWidth: 4,
      },
    ],
  };

  const emotionChartOptions = {
    responsive: true,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: 'white',
        bodyColor: 'white',
        borderWidth: 1,
        callbacks: {
          label: function(context: any) {
            return context.dataset.label + ': ' + context.parsed.y + '%';
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 100,
        ticks: {
          callback: function(value: any) {
            return value + '%';
          },
          color: 'rgba(107, 114, 128, 0.8)',
        },
        grid: {
          color: 'rgba(0, 0, 0, 0.05)',
        },
        border: {
          display: false,
        }
      },
      x: {
        grid: {
          display: false,
        },
        ticks: {
          color: 'rgba(107, 114, 128, 0.8)',
        },
        border: {
          display: false,
        }
      }
    },
    animation: {
      duration: 800,
    },
    maintainAspectRatio: false,
  };

  return (
    <Container className="bg-white">
      <Toast
        message={toast.message}
        type={toast.type}
        isVisible={toast.isVisible}
        onClose={hideToast}
      />
      <div className="flex flex-col items-start justify-start flex-grow w-full max-w-sm mx-auto mt-4">
        <div className="flex items-center gap-2 rounded-lg px-2 mb-6">
          <span className="text-gray-900 font-semibold text-2xl">{childName}의 통계</span>
        </div>

        {/* 로딩 상태 */}
        {loading && (
          <div className="w-full text-center py-8">
            <div className="text-gray-400 mb-2">
              <svg className="w-8 h-8 mx-auto animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </div>
            <p className="text-gray-500 text-sm">통계 데이터를 불러오는 중...</p>
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
              onClick={loadStatisticsData}
              className="mt-2 px-4 py-2 bg-blue-500 text-white rounded-lg text-sm hover:bg-blue-600"
            >
              다시 시도
            </button>
          </div>
        )}

        {/* 데이터가 없을 때 */}
        {!loading && !error && currentAccuracyData.length === 0 && (
          <div className="w-full text-center py-8">
            <div className="text-gray-400 mb-2">
              <svg className="w-12 h-12 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <p className="text-gray-500 text-sm">아직 통계 데이터가 없습니다</p>
            <p className="text-xs text-gray-400 mt-1">감정 예측을 시작하면 통계가 표시됩니다</p>
          </div>
        )}

        {/* 단위 선택 */}
        {!loading && !error && currentAccuracyData.length > 0 && (
          <div className="w-full mb-6">
            <div className="flex bg-gray-100 rounded-xl p-1">
              <button
                onClick={() => setStatsUnit('week')}
                className={`
                  flex-1 py-2 px-4 text-sm font-medium rounded-lg transition-all
                  ${statsUnit === 'week' 
                    ? 'bg-white text-gray-900 shadow-sm' 
                    : 'text-gray-500 hover:text-gray-700'
                  }
                `}
              >
                주 단위
              </button>
              <button
                onClick={() => setStatsUnit('month')}
                className={`
                  flex-1 py-2 px-4 text-sm font-medium rounded-lg transition-all
                  ${statsUnit === 'month' 
                    ? 'bg-white text-gray-900 shadow-sm' 
                    : 'text-gray-500 hover:text-gray-700'
                  }
                `}
              >
                월 단위
              </button>
            </div>
          </div>
        )}

        {/* 감정 예측 정확도 차트 */}
        {!loading && !error && currentAccuracyData.length > 0 && (
          <div className="w-full mb-6">
            <div className="bg-white rounded-2xl p-5 border border-gray-100">
              <h3 className="text-lg font-semibold text-gray-800 mb-6">감정 예측 정확도</h3>
            
            {/* 게이지 차트 */}
            <div className="relative" style={{ height: '140px' }}>
              <Doughnut data={accuracyChartData} options={accuracyChartOptions} />
              <div className="absolute inset-0 flex items-end justify-center pb-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-800">{latestAccuracy.toFixed(1)}%</div>
                  <div className="text-xs text-gray-500">예측 성공률</div>
                </div>
              </div>
            </div>
            
            {/* 성능 지표 */}
            <div className="mt-6 grid grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-lg font-semibold text-green-600">
                  {latestAccuracy >= 90 ? '우수' : latestAccuracy >= 70 ? '양호' : '개선필요'}
                </div>
                <div className="text-xs text-gray-500">성능 등급</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-semibold text-gray-800">
                  {averageAccuracy.toFixed(1)}%
                </div>
                <div className="text-xs text-gray-500">평균 정확도</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-semibold text-gray-800">
                  {Math.max(...currentAccuracyData).toFixed(1)}%
                </div>
                <div className="text-xs text-gray-500">최고 정확도</div>
              </div>
            </div>
            
            {/* 상세 정보 */}
            <div className="mt-4 p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">분석 기간</span>
                <span className="font-medium text-gray-800">
                  {(() => {
                    const { startDate, endDate } = getDateRange()
                    const start = new Date(startDate)
                    const end = new Date(endDate)
                    
                    if (statsUnit === 'week') {
                      return `${start.getMonth() + 1}/${start.getDate()} - ${end.getMonth() + 1}/${end.getDate()}`
                    } else {
                      return `${start.getFullYear()}년 ${start.getMonth() + 1}월`
                    }
                  })()}
                </span>
              </div>
            </div>
          </div>
        </div>
        )}

        {/* 정확도 추이 차트 */}
        {!loading && !error && currentAccuracyData.length > 0 && (
          <div className="w-full mb-6">
            <div className="bg-white rounded-2xl p-5 border border-gray-100">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">정확도 추이</h3>
              <div className="relative" style={{ height: '200px' }}>
                <Line data={accuracyTrendData} options={accuracyTrendOptions} />
              </div>
              <p className="text-sm text-gray-500 mt-4 text-center">
                평균 정확도: {averageAccuracy.toFixed(1)}%
              </p>
            </div>
          </div>
        )}

        {/* 감정 분포 차트 */}
        {!loading && !error && emotionRatioData.length > 0 && (
          <div className="w-full mb-6">
            <div className="bg-white rounded-2xl p-5 border border-gray-100">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">감정 분포</h3>
              <div className="relative" style={{ height: '250px' }}>
                <Bar data={emotionChartData} options={emotionChartOptions} />
              </div>
              <div className="mt-4 space-y-2">
                {emotionRatioData.map((item) => (
                  <div key={item.emotionName} className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div 
                        className="w-3 h-3 rounded-full mr-2"
                        style={{ backgroundColor: EMOTION_COLORS[item.emotionName as keyof typeof EMOTION_COLORS] || '#808080' }}
                      ></div>
                      <span className="text-sm text-gray-600">{item.emotionName}</span>
                    </div>
                    <span className="text-sm font-medium text-gray-700">{(item.ratio * 100).toFixed(1)}%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
      
      <NavigationBar activeTab={activeTab} onTabChange={setActiveTab} showToast={showToast} />
    </Container>
  )
} 