// 공통 타입 정의
export interface EmotionType {
  id: number;
  name: string;
  type: string;
  temp: number;
  image: string;
}

export interface DiaryTimeData {
  predictedEmotions: Array<{emotion: string, category: string, color: string}>;
  predictedText: string;
  actualEmotions: Array<{emotion: string, category: string, color: string}>;
  actualText: string;
}

export interface DiaryData {
  morning?: DiaryTimeData;
  afternoon?: DiaryTimeData;
  evening?: DiaryTimeData;
}

export type TimeSlot = 'morning' | 'afternoon' | 'evening';

export interface TimePeriod {
  label: string;
  text: string;
}

export const TIME_PERIODS: Record<TimeSlot, TimePeriod> = {
  morning: { label: '아침', text: '아침에는 어떤 감정을' },
  afternoon: { label: '점심', text: '점심에는 어떤 감정을' },
  evening: { label: '저녁', text: '저녁에는 어떤 감정을' }
};

export const CATEGORY_COLORS = {
  긍정: '#FF7B6F',
  중립: '#FFD340',
  부정: '#3DC8EF'
} as const;

export interface ToastState {
  message: string;
  type: 'success' | 'error' | 'warning';
  isVisible: boolean;
} 