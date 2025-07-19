'use client'

import React, { useState } from 'react';

interface CalendarProps {
  selectedDate: string | null;
  onDateSelect: (date: Date) => void;
  hasDiary: (date: Date) => boolean;
  isToday: (date: Date) => boolean;
  isPastDate: (date: Date) => boolean;
  isCurrentMonth: (date: Date, currentMonth: Date) => boolean;
  formatDate: (date: Date) => string;
  readOnly?: boolean; // 읽기 전용 모드 (home 페이지용)
  showEmptyIcon?: boolean; // 빈 상태 아이콘 표시 여부
  emptyMessage?: string; // 빈 상태 메시지
}

export default function Calendar({
  selectedDate,
  onDateSelect,
  hasDiary,
  isToday,
  isPastDate,
  isCurrentMonth,
  formatDate,
  readOnly = false,
  showEmptyIcon = false,
  emptyMessage = "날짜를 클릭해서 일기를 확인해보세요"
}: CalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());

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

  const handlePrevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1));
  };

  const handleDateClick = (date: Date) => {
    // 과거 날짜와 오늘만 선택 가능
    if (isPastDate(date) || isToday(date)) {
      onDateSelect(date);
    }
  };

  const calendarDays = generateCalendarDays();

  return (
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
        {calendarDays.map(date => {
          const isClickable = isPastDate(date) || isToday(date);
          
          return (
            <button
              key={date.toISOString()}
              onClick={() => handleDateClick(date)}
              disabled={!isClickable}
              className={`
                relative h-10 text-sm rounded-lg transition-colors
                ${isCurrentMonth(date, currentMonth) ? 'text-gray-900' : 'text-gray-300'}
                ${isToday(date) ? 'bg-blue-100 text-blue-600 font-semibold' : ''}
                ${selectedDate === formatDate(date) ? 'bg-[#FF6F71] text-white' : ''}
                ${isClickable ? 'hover:bg-gray-100 cursor-pointer' : 'cursor-not-allowed opacity-50'}
              `}
            >
              {date.getDate()}
              {hasDiary(date) && (
                <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-[#FF6F71] rounded-full"></div>
              )}
            </button>
          );
        })}
      </div>
      
      {/* 빈 상태 아이콘 */}
      {showEmptyIcon && (
        <div className="w-full text-center py-8">
          <div className="text-gray-400 mb-2 px-4">
            <svg className="w-12 h-12 mx-auto mb-2" fill="none" viewBox="0 0 24 26">
              <path d="M22 2H19V1C19 0.734784 18.8946 0.48043 18.7071 0.292893C18.5196 0.105357 18.2652 0 18 0C17.7348 0 17.4804 0.105357 17.2929 0.292893C17.1054 0.48043 17 0.734784 17 1V2H7V1C7 0.734784 6.89464 0.48043 6.70711 0.292893C6.51957 0.105357 6.26522 0 6 0C5.73478 0 5.48043 0.105357 5.29289 0.292893C5.10536 0.48043 5 0.734784 5 1V2H2C1.46957 2 0.960859 2.21071 0.585786 2.58579C0.210714 2.96086 0 3.46957 0 4V24C0 24.5304 0.210714 25.0391 0.585786 25.4142C0.960859 25.7893 1.46957 26 2 26H22C22.5304 26 23.0391 25.7893 23.4142 25.4142C23.7893 25.0391 24 24.5304 24 24V4C24 3.46957 23.7893 2.96086 23.4142 2.58579C23.0391 2.21071 22.5304 2 22 2ZM5 4V5C5 5.26522 5.10536 5.51957 5.29289 5.70711C5.48043 5.89464 5.73478 6 6 6C6.26522 6 6.51957 5.89464 6.70711 5.70711C6.89464 5.51957 7 5.26522 7 5V4H17V5C17 5.26522 17.1054 5.51957 17.2929 5.70711C17.4804 5.89464 17.7348 6 18 6C18.2652 6 18.5196 5.89464 18.7071 5.70711C18.8946 5.51957 19 5.26522 19 5V4H22V8H2V4H5ZM22 24H2V10H22V24ZM16 17C16 17.2652 15.8946 17.5196 15.7071 17.7071C15.5196 17.8946 15.2652 18 15 18H9C8.73478 18 8.48043 17.8946 8.29289 17.7071C8.10536 17.5196 8 17.2652 8 17C8 16.7348 8.10536 16.4804 8.29289 16.2929C8.48043 16.1054 8.73478 16 9 16H15C15.2652 16 15.5196 16.1054 15.7071 16.2929C15.8946 16.4804 16 16.7348 16 17Z" fill="currentColor"/>
            </svg>
          </div>
          <p className="text-gray-500 text-sm">
            {emptyMessage}
          </p>
        </div>
      )}
    </div>
  );
} 