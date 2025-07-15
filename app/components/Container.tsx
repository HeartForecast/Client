import React from "react";

interface ContainerProps {
  children: React.ReactNode;
  className?: string;
}

export default function Container({ children, className = "" }: ContainerProps) {
  return (
    <div className={`flex flex-col items-center justify-center px-4 pt-10 pb-0 text-black ${className}`}>
      {children}
    </div>
  );
} 