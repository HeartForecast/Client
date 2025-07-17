'use client'

import { useChild } from "../contexts/ChildContext"
import { useRouter } from "next/navigation"

interface ModeToggleButtonProps {
  className?: string
}

export default function ModeToggleButton({ className = "" }: ModeToggleButtonProps) {
  const { isChildMode, selectedChild, exitChildMode, enterChildMode } = useChild()
  const router = useRouter()

  const handleModeToggle = () => {
    if (isChildMode) {
      // 아이 모드에서 보호자 모드로 전환
      exitChildMode()
      router.push('/home')
    } else {
      // 보호자 모드에서 아이 모드로 전환
      if (selectedChild) {
        enterChildMode(selectedChild)
        router.push('/baby')
      }
    }
  }

  // 아이 모드일 때: 현재 모드 표시
  if (isChildMode) {
    return (
      <button
        onClick={handleModeToggle}
        className={`px-3 py-1 bg-[#FF7B6F] text-white rounded-lg text-xs font-medium hover:bg-[#FF6B5F] transition-colors ${className}`}
      >
        아이 모드
      </button>
    )
  }

  // 보호자 모드일 때: 현재 모드 표시 (선택된 아이가 있을 때만)
  if (selectedChild) {
    return (
      <button
        onClick={handleModeToggle}
        className={`px-3 py-1 bg-[#FF7B6F] text-white rounded-lg text-xs font-medium hover:bg-[#FF6B5F] transition-colors ${className}`}
      >
        보호자 모드
      </button>
    )
  }

  // 선택된 아이가 없으면 버튼을 표시하지 않음
  return null
} 