// 감정 타입별 색상
export const EMOTION_COLORS = {
  '긍정': '#FF7B6F',
  '중립': '#FFD340',
  '부정': '#3DC8EF'
} as const;

export type EmotionType = keyof typeof EMOTION_COLORS;

// 감정 타입 판별 함수
export const getEmotionType = (emotionName: string): EmotionType => {
  const positiveKeywords = ['기쁜', '행복한', '신나는', '즐거운', '만족스러운', '감사한', '기대되는', '평온한'];
  const negativeKeywords = ['슬픈', '짜증나는', '두려운', '외로운'];
  
  if (positiveKeywords.some(keyword => emotionName.includes(keyword))) return '긍정';
  if (negativeKeywords.some(keyword => emotionName.includes(keyword))) return '부정';
  return '중립';
};

export const getEmotionColor = (emotionName: string): string => {
  const emotionType = getEmotionType(emotionName);
  return EMOTION_COLORS[emotionType] || '#6B7280';
};

export const hexToRgba = (hex: string, alpha: number = 0.8): string => {
  const rgb = hex.replace('#', '').match(/.{2}/g)?.map(x => parseInt(x, 16)).join(', ');
  return `rgba(${rgb}, ${alpha})` || 'rgba(128, 128, 128, 0.8)';
};

export interface EmotionTypeData {
  id: number;
  name: string;
  type: string;
  temp: number;
  image: string;
}

export const fetchEmotionType = async (emotionTypeId: number): Promise<EmotionTypeData | null> => {
  try {
    const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
    const response = await fetch(`${apiBaseUrl}/api/emotionTypes/${emotionTypeId}`, {
      method: 'GET',
      credentials: 'include',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    });

    if (response.ok) {
      const data = await response.json();
      return data;
    } else {
      console.log('감정 타입 API 실패:', response.status);
      return null;
    }
  } catch (error) {
    console.error('감정 타입 API 오류:', error);
    return null;
  }
}; 