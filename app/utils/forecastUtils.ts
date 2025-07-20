const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;

// fetchEmotionType 함수 import
import { fetchEmotionType } from './emotionUtils';

// 예보 데이터 타입
export interface ForecastData {
  id: number;
  date: string;
  timeZone: string;
  childId: number;
  emotionTypeId: number;
  emotionName: string;
  emotionImage?: string;
  memo?: string;
}

// 기록 데이터 타입
export interface RecordData {
  id: number;
  forecastId: number;
  date: string;
  timeZone: string;
  childId: number;
  emotionTypeId: number;
  emotionName: string;
  emotionImage?: string;
  memo?: string;
}

// 시간대별 예보 데이터 가져오기
export async function getForecastsByDate(date: string, childId: number): Promise<ForecastData[]> {
  try {
    const url = `${apiBaseUrl}/api/forecasts/${childId}/${date}`;
    console.log(`📡 예보 API 호출: ${url}`);
    
    const response = await fetch(url, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include'
    });

    console.log(`📡 예보 API 응답 상태: ${response.status} ${response.statusText}`);

    if (!response.ok) {
      const errorText = await response.text();
      console.log(`❌ 예보 API 에러 응답: ${errorText}`);
      throw new Error('예보 데이터를 가져올 수 없습니다.');
    }

    const data = await response.json();
    
    // API 응답 구조에 따라 데이터 매핑
    console.log('📡 예보 API 응답 데이터:', data);
    console.log('📡 예보 API 응답 타입:', typeof data);
    console.log('📡 예보 API 응답 키:', Object.keys(data || {}));
    
    if (data.success && data.data) {
      console.log('📊 예보 데이터 (success):', data.data);
      return data.data.map((forecast: any) => {
        console.log('🔍 예보 데이터 매핑:', forecast);
        const mappedForecast = {
          id: forecast.id,
          date: forecast.date,
          timeZone: forecast.timeZone,
          childId: forecast.childId,
          emotionTypeId: forecast.emotionTypeId,
          emotionName: forecast.emotionName || forecast.emotionTypeName,
          emotionImage: forecast.emotionImage || forecast.emotionTypeImage || forecast.image,
          memo: forecast.memo
        };
        console.log('✅ 매핑된 예보 데이터:', mappedForecast);
        return mappedForecast;
      });
    } else if (Array.isArray(data)) {
      console.log('📊 예보 데이터 (배열):', data);
      return data.map((forecast: any) => {
        console.log('🔍 예보 데이터 매핑 (배열):', forecast);
        const mappedForecast = {
          id: forecast.id,
          date: forecast.date,
          timeZone: forecast.timeZone,
          childId: forecast.childId,
          emotionTypeId: forecast.emotionTypeId,
          emotionName: forecast.emotionName || forecast.emotionTypeName,
          emotionImage: forecast.emotionImage || forecast.emotionTypeImage || forecast.image,
          memo: forecast.memo
        };
        console.log('✅ 매핑된 예보 데이터 (배열):', mappedForecast);
        return mappedForecast;
      });
    }
    
    return [];
  } catch (error) {
    console.error('예보 데이터 가져오기 실패:', error);
    throw error;
  }
}

// 시간대별 기록 데이터 가져오기
export async function getRecordsByDate(date: string, childId: number): Promise<RecordData[]> {
  try {
    const url = `${apiBaseUrl}/api/forecastRecords/${childId}/${date}`;
    console.log(`📡 기록 API 호출: ${url}`);
    
    const response = await fetch(url, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include'
    });

    console.log(`📡 기록 API 응답 상태: ${response.status} ${response.statusText}`);

    if (!response.ok) {
      const errorText = await response.text();
      console.log(`❌ 기록 API 에러 응답: ${errorText}`);
      throw new Error('기록 데이터를 가져올 수 없습니다.');
    }

    const data = await response.json();
    
    // API 응답 구조에 따라 데이터 매핑
    console.log('기록 API 응답 데이터:', data);
    
    if (data.success && data.data) {
      console.log('📊 기록 데이터 (success):', data.data);
      return data.data.map((record: any) => {
        console.log('🔍 기록 데이터 매핑:', record);
        const mappedRecord = {
          id: record.id,
          forecastId: record.forecastId,
          date: record.date,
          timeZone: record.timeZone,
          childId: record.childId,
          emotionTypeId: record.emotionTypeId,
          emotionName: record.emotionName || record.emotionTypeName,
          emotionImage: record.emotionImage || record.emotionTypeImage || record.image,
          memo: record.memo
        };
        console.log('✅ 매핑된 기록 데이터:', mappedRecord);
        return mappedRecord;
      });
    } else if (Array.isArray(data)) {
      console.log('📊 기록 데이터 (배열):', data);
      return data.map((record: any) => {
        console.log('🔍 기록 데이터 매핑 (배열):', record);
        const mappedRecord = {
          id: record.id,
          forecastId: record.forecastId,
          date: record.date,
          timeZone: record.timeZone,
          childId: record.childId,
          emotionTypeId: record.emotionTypeId,
          emotionName: record.emotionName || record.emotionTypeName,
          emotionImage: record.emotionImage || record.emotionTypeImage || record.image,
          memo: record.memo
        };
        console.log('✅ 매핑된 기록 데이터 (배열):', mappedRecord);
        return mappedRecord;
      });
    }
    
    return [];
  } catch (error) {
    console.error('기록 데이터 가져오기 실패:', error);
    throw error;
  }
}

// 시간대별 매핑
export const timeZoneMapping: Record<string, string> = {
  'morning': '아침',
  'afternoon': '점심', 
  'evening': '저녁'
};

// 시간대별 매핑 (역방향)
export const timeZoneReverseMapping: Record<string, string> = {
  '아침': 'morning',
  '점심': 'afternoon', 
  '저녁': 'evening'
};

// AI 피드백 API 요청 타입
export interface AIFeedbackRequest {
  childHealthInfo: string;
  morningForecast: {
    emotion: string;
    memo: string;
  };
  lunchForecast: {
    emotion: string;
    memo: string;
  };
  eveningForecast: {
    emotion: string;
    memo: string;
  };
  morningForecastRecord: {
    emotion: string;
    memo: string;
  };
  lunchForecastRecord: {
    emotion: string;
    memo: string;
  };
  eveningForecastRecord: {
    emotion: string;
    memo: string;
  };
}

// AI 피드백 API 호출
export async function getAIFeedback(requestData: AIFeedbackRequest): Promise<string> {
  try {
    console.log('🤖 AI 피드백 API 요청 데이터:', requestData);
    
    const response = await fetch(`${apiBaseUrl}/api/feedback`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(requestData)
    });

    console.log('🤖 AI 피드백 API 응답 상태:', response.status, response.statusText);

    if (!response.ok) {
      const errorText = await response.text();
      console.log('❌ AI 피드백 API 에러 응답:', errorText);
      throw new Error('AI 피드백을 가져올 수 없습니다.');
    }

    // 응답이 JSON인지 텍스트인지 확인
    const contentType = response.headers.get('content-type');
    console.log('🤖 AI 피드백 API 응답 타입:', contentType);

    if (contentType && contentType.includes('application/json')) {
      const data = await response.json();
      console.log('🤖 AI 피드백 API JSON 응답:', data);
      return data.feedback || '';
    } else {
      // JSON이 아닌 경우 텍스트로 처리
      const text = await response.text();
      console.log('🤖 AI 피드백 API 텍스트 응답:', text);
      return text;
    }
  } catch (error) {
    console.error('❌ AI 피드백 API 호출 실패:', error);
    throw error;
  }
}

// AI 피드백 데이터 생성
export async function generateAIFeedbackData(
  forecasts: ForecastData[], 
  records: RecordData[],
  childHealthInfo: string = ""
): Promise<{
  emotionData: Array<{
    timeSlot: 'morning' | 'lunch' | 'dinner';
    forecastEmotion: string;
    actualEmotion: string;
    memo?: string;
  }>;
  aiFeedback: {
    morning: string;
    lunch: string;
    dinner: string;
  };
}> {
  const emotionData: Array<{
    timeSlot: 'morning' | 'lunch' | 'dinner';
    forecastEmotion: string;
    actualEmotion: string;
    actualEmotionImage?: string;
    memo?: string;
  }> = [];

  // 각 시간대별로 예보와 기록 데이터 매칭
  const timeSlots = ['morning', 'afternoon', 'evening'] as const;
  
  for (const timeSlot of timeSlots) {
    const timeZone = timeZoneMapping[timeSlot];
    console.log(`🔍 ${timeSlot} 시간대 처리 시작`);
    console.log(`🔍 찾는 timeZone: ${timeZone}`);
    
    const forecast = forecasts.find(f => f.timeZone === timeZone);
    const record = records.find(r => r.timeZone === timeZone);
    
    console.log(`🔍 찾은 예보 데이터:`, forecast);
    console.log(`🔍 찾은 기록 데이터:`, record);
    
    if (forecast && record) {
      console.log(`✅ ${timeSlot} 시간대 데이터 매칭 성공`);
      
      // 감정 타입 정보 가져오기
      console.log(`📡 예보 감정 타입 API 호출: emotionTypeId = ${forecast.emotionTypeId}`);
      const forecastEmotionType = await fetchEmotionType(forecast.emotionTypeId);
      console.log(`📡 예보 감정 타입 결과:`, forecastEmotionType);
      
      console.log(`📡 기록 감정 타입 API 호출: emotionTypeId = ${record.emotionTypeId}`);
      const recordEmotionType = await fetchEmotionType(record.emotionTypeId);
      console.log(`📡 기록 감정 타입 결과:`, recordEmotionType);
      
      // 기본 이미지 매핑 (임시)
      const getDefaultImage = (emotionName: string) => {
        const emotionToImage: { [key: string]: string } = {
          '기쁜': '/icon/기쁜 - big.svg',
          '행복한': '/icon/행복한 - big.svg',
          '즐거운': '/icon/즐거운 - big.svg',
          '설레는': '/icon/설레는 - big.svg',
          '기대되는': '/icon/기대되는 - big.svg',
          '감사한': '/icon/감사한 - big.svg',
          '만족스러운': '/icon/만족스러운 - big.svg',
          '평온한': '/icon/평온한 - big.svg',
          '그저 그런': '/icon/그저 그런 - big.svg',
          '외로운': '/icon/외로운 - big.svg',
          '슬픈': '/icon/슬픈 - big.svg',
          '짜증나는': '/icon/짜증나는 - big.svg',
          '고민되는': '/icon/고민되는 - big.svg',
          '두려운': '/icon/두려운 - big.svg',
          '무서운': '/icon/두려운 - big.svg',
          '놀란': '/icon/놀란 - big.svg',
          '피곤한': '/icon/그저 그런 - big.svg',
          '지루한': '/icon/그저 그런 - big.svg',
          '화난': '/icon/짜증나는 - big.svg',
          '불안한': '/icon/두려운 - big.svg',
          '걱정되는': '/icon/고민되는 - big.svg'
        };
        return emotionToImage[emotionName] || '/icon/기쁜 - big.svg';
      };

      const actualEmotionName = recordEmotionType?.name || record.emotionName || '기쁜';
      const actualEmotionImage = recordEmotionType?.image || record.emotionImage || getDefaultImage(actualEmotionName);
      
      const emotionItem = {
        timeSlot: (timeSlot === 'afternoon' ? 'lunch' : timeSlot === 'evening' ? 'dinner' : 'morning') as 'morning' | 'lunch' | 'dinner',
        forecastEmotion: forecastEmotionType?.name || forecast.emotionName || '알 수 없음',
        actualEmotion: actualEmotionName,
        actualEmotionImage: actualEmotionImage,
        memo: record.memo
      };
      console.log(`✅ ${timeSlot} 감정 데이터 매핑 완료:`, emotionItem);
      emotionData.push(emotionItem);
    } else {
      console.log(`❌ ${timeSlot} 시간대 데이터 매칭 실패`);
      console.log(`❌ 예보 데이터 있음: ${!!forecast}, 기록 데이터 있음: ${!!record}`);
    }
  }

  // AI API 요청 데이터 구성
  const requestData: AIFeedbackRequest = {
    childHealthInfo,
    morningForecast: {
      emotion: emotionData.find(d => d.timeSlot === 'morning')?.forecastEmotion || '',
      memo: '' // 예보 메모는 현재 구조에서 별도로 저장되지 않음
    },
    lunchForecast: {
      emotion: emotionData.find(d => d.timeSlot === 'lunch')?.forecastEmotion || '',
      memo: '' // 예보 메모는 현재 구조에서 별도로 저장되지 않음
    },
    eveningForecast: {
      emotion: emotionData.find(d => d.timeSlot === 'dinner')?.forecastEmotion || '',
      memo: '' // 예보 메모는 현재 구조에서 별도로 저장되지 않음
    },
    morningForecastRecord: {
      emotion: emotionData.find(d => d.timeSlot === 'morning')?.actualEmotion || '',
      memo: emotionData.find(d => d.timeSlot === 'morning')?.memo || ''
    },
    lunchForecastRecord: {
      emotion: emotionData.find(d => d.timeSlot === 'lunch')?.actualEmotion || '',
      memo: emotionData.find(d => d.timeSlot === 'lunch')?.memo || ''
    },
    eveningForecastRecord: {
      emotion: emotionData.find(d => d.timeSlot === 'dinner')?.actualEmotion || '',
      memo: emotionData.find(d => d.timeSlot === 'dinner')?.memo || ''
    }
  };

  try {
    // AI API 호출
    const aiFeedbackText = await getAIFeedback(requestData);
    console.log('🤖 AI 피드백 원본 텍스트:', aiFeedbackText);
    
    // AI 응답을 시간대별로 파싱
    let aiFeedback;
    
    if (aiFeedbackText.includes('[아침]') || aiFeedbackText.includes('[점심]') || aiFeedbackText.includes('[저녁]')) {
      // 시간대별로 구분된 피드백인 경우
      const feedbackParts = aiFeedbackText.split('\n\n');
      console.log('🤖 피드백 파트:', feedbackParts);
      
      aiFeedback = {
        morning: feedbackParts.find(part => part.startsWith('[아침]')) || `[아침]\n${aiFeedbackText}`,
        lunch: feedbackParts.find(part => part.startsWith('[점심]')) || `[점심]\n${aiFeedbackText}`,
        dinner: feedbackParts.find(part => part.startsWith('[저녁]')) || `[저녁]\n${aiFeedbackText}`
      };
    } else {
      // 단일 피드백인 경우 각 시간대에 동일하게 적용
      aiFeedback = {
        morning: `[아침]\n${aiFeedbackText}`,
        lunch: `[점심]\n${aiFeedbackText}`,
        dinner: `[저녁]\n${aiFeedbackText}`
      };
    }
    
    console.log('🤖 파싱된 AI 피드백:', aiFeedback);
    return { emotionData, aiFeedback };
  } catch (error) {
    console.error('AI 피드백 생성 실패:', error);
    
    // AI API 실패 시 기본 피드백 생성
    const aiFeedback = {
      morning: `[아침]\n아침에는 ${emotionData.find(d => d.timeSlot === 'morning')?.forecastEmotion || '걱정'}될 거라고 생각했는데, 실제로는 ${emotionData.find(d => d.timeSlot === 'morning')?.actualEmotion || '무서움'}을 느꼈구나. ${emotionData.find(d => d.timeSlot === 'morning')?.memo ? emotionData.find(d => d.timeSlot === 'morning')?.memo + ' 때문에 ' : ''}${emotionData.find(d => d.timeSlot === 'morning')?.actualEmotion || '무서움'}을 느끼는 건 정말 당연한 일이야. ${emotionData.find(d => d.timeSlot === 'morning')?.actualEmotion || '무서웠을'} 텐데도 잘 견뎌줘서 정말 대단해! 괜찮아, 용감하게 잘 해냈어.`,
      lunch: `[점심]\n점심에는 ${emotionData.find(d => d.timeSlot === 'lunch')?.forecastEmotion || '피곤'}할 거라고 예보했지만, ${emotionData.find(d => d.timeSlot === 'lunch')?.memo ? emotionData.find(d => d.timeSlot === 'lunch')?.memo + ' 때문에 ' : ''}${emotionData.find(d => d.timeSlot === 'lunch')?.actualEmotion || '짜증'}이 났구나. ${emotionData.find(d => d.timeSlot === 'lunch')?.memo ? emotionData.find(d => d.timeSlot === 'lunch')?.memo + '는 ' : '오래 기다리는 건'} 정말 지루하고 힘들 수 있어서 ${emotionData.find(d => d.timeSlot === 'lunch')?.actualEmotion || '짜증'}이 나는 건 당연한 마음이야. 힘들었을 텐데도 잘 참아줘서 고마워! 다음번에는 기다리는 동안 작은 그림을 그리거나 숨 고르기를 해보는 건 어떨까?`,
      dinner: `[저녁]\n저녁에는 ${emotionData.find(d => d.timeSlot === 'dinner')?.forecastEmotion || '기쁨'}을 느낄 거라고 예보했는데, ${emotionData.find(d => d.timeSlot === 'dinner')?.memo ? emotionData.find(d => d.timeSlot === 'dinner')?.memo + '면서 ' : ''}정말 ${emotionData.find(d => d.timeSlot === 'dinner')?.actualEmotion || '행복'}했다고 하니 마음예보가 딱 맞았네! 와, 정말 축하해! 하루를 ${emotionData.find(d => d.timeSlot === 'dinner')?.actualEmotion || '행복'}하게 마무리해서 정말 뿌듯하겠다! 칭찬해!`
    };

    return { emotionData, aiFeedback };
  }
} 