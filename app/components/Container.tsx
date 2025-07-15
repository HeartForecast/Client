import React from "react";

interface ContainerProps {
  children: React.ReactNode;
  className?: string;
}

export default function Container({ children, className = "" }: ContainerProps) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <div className={`w-full max-w-sm mx-auto bg-white min-h-screen flex flex-col ${className}`}>
        {children}
      </div>
    </div>
  );
} 