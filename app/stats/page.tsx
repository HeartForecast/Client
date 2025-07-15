'use client'

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Container from "../components/Container"
import NavigationBar from "../components/NavigationBar"
import { useChild } from "../contexts/ChildContext"
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
  즐거움: '#3DC8EF',
  슬픔: '#FF7B6F',
  중립: '#FFD340'
};

// 간단한 모의 데이터 (시간대별 기록 제거)
const weeklyAccuracyData = [78, 82, 85, 88, 92, 89, 94];
const monthlyAccuracyData = [85, 87, 83, 89, 91, 88, 92, 85, 90, 93, 95, 89];
const emotionDistribution = { 즐거움: 65, 슬픔: 20, 중립: 15 };

export default function StatsPage() {
  const router = useRouter()
  const { isChildMode } = useChild();
  const [childName, setChildName] = useState('신희성')
  const [activeTab, setActiveTab] = useState('통계')
  const [statsUnit, setStatsUnit] = useState<'week' | 'month'>('week')
  const [currentAccuracy, setCurrentAccuracy] = useState(0)

  const currentAccuracyData = statsUnit === 'week' ? weeklyAccuracyData : monthlyAccuracyData;
  const latestAccuracy = currentAccuracyData[currentAccuracyData.length - 1];

  // 정확도 설정
  useEffect(() => {
    setCurrentAccuracy(latestAccuracy);
  }, [latestAccuracy]);

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
        data: [currentAccuracy, 100 - currentAccuracy],
        backgroundColor: [
          currentAccuracy >= 90 ? '#10B981' : currentAccuracy >= 70 ? '#3B82F6' : '#F59E0B',
          'rgba(243, 244, 246, 0.3)'
        ],
        borderColor: [
          currentAccuracy >= 90 ? '#10B981' : currentAccuracy >= 70 ? '#3B82F6' : '#F59E0B',
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
      ? ['월', '화', '수', '목', '금', '토', '일']
      : ['1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월', '9월', '10월', '11월', '12월'],
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

  // 감정 분포 바 차트 데이터 (개선된 버전)
  const emotionChartData = {
    labels: ['즐거움', '슬픔', '중립'],
    datasets: [
      {
        label: '감정 분포',
        data: [
          emotionDistribution.즐거움,
          emotionDistribution.슬픔,
          emotionDistribution.중립
        ],
        backgroundColor: [
          'rgba(61, 200, 239, 0.8)',
          'rgba(255, 123, 111, 0.8)',
          'rgba(255, 211, 64, 0.8)'
        ],
        borderColor: [
          EMOTION_COLORS.즐거움,
          EMOTION_COLORS.슬픔,
          EMOTION_COLORS.중립
        ],
        borderWidth: 3,
        borderRadius: 12,
        borderSkipped: false,
        hoverBackgroundColor: [
          'rgba(61, 200, 239, 1)',
          'rgba(255, 123, 111, 1)',
          'rgba(255, 211, 64, 1)'
        ],
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
    <Container>
      <div className="flex flex-col items-start justify-start flex-grow w-full max-w-sm mx-auto mt-4">
        <div className="flex items-center gap-2 rounded-lg px-2 mb-6">
          <span className="text-gray-900 font-semibold text-2xl">{childName}의 통계</span>
        </div>

        {/* 단위 선택 */}
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

        {/* 감정 예측 정확도 차트 */}
        <div className="w-full mb-6">
          <div className="bg-white rounded-2xl p-5 border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-800 mb-6">감정 예측 정확도</h3>
            
            {/* 게이지 차트 */}
            <div className="relative" style={{ height: '140px' }}>
              <Doughnut data={accuracyChartData} options={accuracyChartOptions} />
              <div className="absolute inset-0 flex items-end justify-center pb-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-800">{currentAccuracy}%</div>
                  <div className="text-xs text-gray-500">예측 성공률</div>
                </div>
              </div>
            </div>
            
            {/* 성능 지표 */}
            <div className="mt-6 grid grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-lg font-semibold text-green-600">
                  {currentAccuracy >= 90 ? '우수' : currentAccuracy >= 70 ? '양호' : '개선필요'}
                </div>
                <div className="text-xs text-gray-500">성능 등급</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-semibold text-gray-800">
                  {Math.round(currentAccuracyData.reduce((sum, val) => sum + val, 0) / currentAccuracyData.length)}%
                </div>
                <div className="text-xs text-gray-500">평균 정확도</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-semibold text-gray-800">
                  {Math.max(...currentAccuracyData)}%
                </div>
                <div className="text-xs text-gray-500">최고 정확도</div>
              </div>
            </div>
            
            {/* 상세 정보 */}
            <div className="mt-4 p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">분석 기간</span>
                <span className="font-medium text-gray-800">
                  {statsUnit === 'week' ? '최근 7일' : '최근 12개월'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* 정확도 추이 차트 */}
        <div className="w-full mb-6">
          <div className="bg-white rounded-2xl p-5 border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">정확도 추이</h3>
            <div className="relative" style={{ height: '200px' }}>
              <Line data={accuracyTrendData} options={accuracyTrendOptions} />
            </div>
            <p className="text-sm text-gray-500 mt-4 text-center">
              평균 정확도: {Math.round(currentAccuracyData.reduce((sum, val) => sum + val, 0) / currentAccuracyData.length)}%
            </p>
          </div>
        </div>

        {/* 감정 분포 차트 */}
        <div className="w-full mb-6">
          <div className="bg-white rounded-2xl p-5 border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">감정 분포</h3>
            <div className="relative" style={{ height: '250px' }}>
              <Bar data={emotionChartData} options={emotionChartOptions} />
            </div>
            <div className="mt-4 space-y-2">
              {Object.entries(emotionDistribution).map(([emotion, percentage]) => (
                <div key={emotion} className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div 
                      className="w-3 h-3 rounded-full mr-2"
                      style={{ backgroundColor: EMOTION_COLORS[emotion as keyof typeof EMOTION_COLORS] }}
                    ></div>
                    <span className="text-sm text-gray-600">{emotion}</span>
                  </div>
                  <span className="text-sm font-medium text-gray-700">{percentage}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      
      <NavigationBar activeTab={activeTab} onTabChange={setActiveTab} />
    </Container>
  )
} 