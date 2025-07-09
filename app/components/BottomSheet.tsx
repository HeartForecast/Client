import React, { useEffect, useRef, useState } from "react"

interface BottomSheetProps {
  open: boolean
  onClose: () => void
  children: React.ReactNode
}

const BottomSheet: React.FC<BottomSheetProps> = ({ open, onClose, children }) => {
  const [show, setShow] = useState(open)
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    if (open) {
      setShow(true)
    } else {
      timeoutRef.current = setTimeout(() => setShow(false), 280)
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

  if (!show) return null

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      <div
        className={`absolute inset-0 bg-black/40 transition-opacity duration-300 ${open ? 'opacity-100' : 'opacity-0'}`}
        onClick={onClose}
      />
      <div
        className={`relative w-full max-w-sm mx-auto bg-white rounded-4xl pt-4 pb-8 px-6 shadow-xl mb-8 transition-transform transition-opacity duration-300 ${open ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0'}`}
        style={{ willChange: 'transform, opacity' }}
      >
        {children}
      </div>
    </div>
  )
}

export default BottomSheet 