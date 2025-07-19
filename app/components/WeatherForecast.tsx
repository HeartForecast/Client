'use client';

import React from 'react';

interface WeatherForecastProps {
  temperature: number;
  emotion: string;
  timeSlot: string;
  className?: string;
}

const WeatherForecast: React.FC<WeatherForecastProps> = ({
  temperature,
  emotion,
  timeSlot,
  className = ''
}) => {
  return (
    <div 
      className={`
        relative
        w-full
        h-48
        bg-sky-100
        border
        border-gray-400
        rounded-lg
        p-6
        flex
        flex-col
        justify-between
        ${className}
      `}
    >
      {/* 온도 표시 - 왼쪽 상단 */}
      <div className="text-white text-4xl font-sans font-bold">
        {temperature}°
      </div>
      
      {/* 하단 텍스트 - 왼쪽 하단 */}
      <div className="text-white text-lg leading-relaxed">
        {timeSlot}의 감정은 {emotion}으로 {temperature}° 예정이에요.
      </div>
    </div>
  );
};

export default WeatherForecast; 