'use client'

import React from 'react';
import { TimeSlot, TIME_PERIODS } from '../types/common';

interface TimeSlotSelectorProps {
  selectedTimeSlot: TimeSlot;
  onTimeSlotChange: (timeSlot: TimeSlot) => void;
  className?: string;
}

export default function TimeSlotSelector({ 
  selectedTimeSlot, 
  onTimeSlotChange,
  className = ""
}: TimeSlotSelectorProps) {
  return (
    <div className={`w-full mb-4 ${className}`}>
      <div className="flex bg-gray-100 rounded-xl p-1">
        {Object.entries(TIME_PERIODS).map(([key, period]) => (
          <button
            key={key}
            onClick={() => onTimeSlotChange(key as TimeSlot)}
            className={`
              flex-1 py-2 px-4 text-sm font-medium rounded-lg transition-all
              ${selectedTimeSlot === key 
                ? 'bg-white text-gray-900 shadow-sm' 
                : 'text-gray-500 hover:text-gray-700'
              }
            `}
          >
            {period.label}
          </button>
        ))}
      </div>
    </div>
  );
} 