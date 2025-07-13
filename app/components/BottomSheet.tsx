import React, { useEffect, useRef, useState } from "react"

interface BottomSheetProps {
  open: boolean
  onClose: () => void
  children: React.ReactNode
}

const BottomSheet: React.FC<BottomSheetProps> = ({ open, onClose, children }) => {
  const [show, setShow] = useState(open)
  const [isAnimating, setIsAnimating] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const [dragY, setDragY] = useState(0)
  const [startY, setStartY] = useState(0)
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)
  const sheetRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (open) {
      setShow(true)
      setTimeout(() => setIsAnimating(true), 10)
    } else {
      setIsAnimating(false)
      timeoutRef.current = setTimeout(() => setShow(false), 250)
    }
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
    }
  }, [open])

  useEffect(() => {
    if (show) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = ""
    }
    return () => {
      document.body.style.overflow = ""
    }
  }, [show])

  const handleTouchStart = (e: React.TouchEvent) => {
    setIsDragging(true)
    setStartY(e.touches[0].clientY)
    setDragY(0)
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return
    
    const currentY = e.touches[0].clientY
    const deltaY = currentY - startY
    
    if (deltaY > 0) {
      setDragY(deltaY)
    }
  }

  const handleTouchEnd = () => {
    if (!isDragging) return
    
    setIsDragging(false)
    
    if (dragY > 100) {
      onClose()
    }
    
    setDragY(0)
  }

  const handleMouseStart = (e: React.MouseEvent) => {
    setIsDragging(true)
    setStartY(e.clientY)
    setDragY(0)
  }

  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging) return
    
    const currentY = e.clientY
    const deltaY = currentY - startY
    
    if (deltaY > 0) {
      setDragY(deltaY)
    }
  }

  const handleMouseUp = () => {
    if (!isDragging) return
    
    setIsDragging(false)
    
    if (dragY > 100) {
      onClose()
    }
    
    setDragY(0)
  }

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove)
      document.addEventListener('mouseup', handleMouseUp)
      
      return () => {
        document.removeEventListener('mousemove', handleMouseMove)
        document.removeEventListener('mouseup', handleMouseUp)
      }
    }
  }, [isDragging, startY, dragY])

  if (!show) return null

  return (
    <div className="absolute inset-0 z-50 flex items-end justify-center">
      <div 
        className={`absolute inset-0 bg-black/40 transition-opacity duration-200 ${isAnimating ? 'opacity-100' : 'opacity-0'}`}
        onClick={onClose} 
      />
      <div 
        ref={sheetRef}
        className={`relative w-full max-w-sm md:max-w-md bg-white rounded-4xl pt-4 pb-8 px-4 sm:px-6 mx-4 sm:mx-6 md:mx-auto mb-8 ${isAnimating ? 'animate-slideUp' : 'animate-slideDown'}`}
        style={{
          transform: isDragging ? `translateY(${dragY}px)` : 'translateY(0)',
          transition: isDragging ? 'none' : 'transform 0.3s ease-out'
        }}
      >
        <div 
          className="w-12 h-1 bg-gray-300 rounded-full mx-auto mb-4 cursor-grab active:cursor-grabbing"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          onMouseDown={handleMouseStart}
        />
        
        {children}
        
        <style jsx global>{`
          @keyframes slideUp {
            0% {
              transform: translateY(100%);
              opacity: 0;
            }
            100% {
              transform: translateY(0);
              opacity: 1;
            }
          }
          @keyframes slideDown {
            0% {
              transform: translateY(0);
              opacity: 1;
            }
            100% {
              transform: translateY(100%);
              opacity: 0;
            }
          }
          .animate-slideUp {
            animation: slideUp 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);
          }
          .animate-slideDown {
            animation: slideDown 0.25s cubic-bezier(0.55, 0.055, 0.675, 0.19);
          }
        `}</style>
      </div>
    </div>
  )
}

export default BottomSheet 