'use client'

import { useState } from "react"
import Container from "../components/Container"
import NavigationBar from "../components/NavigationBar"
import Button from "../components/Button"

export default function Settings() {
  const [activeTab, setActiveTab] = useState('설정')

  const menuItems = [
    {
      id: 'children-list',
      title: '모든 등록된 자녀 보기',
      subtitle: '등록된 자녀들의 전체 목록을 확인하세요'
    },
    {
      id: 'edit-info',
      title: '자녀 정보 수정',
      subtitle: '자녀의 개인정보를 업데이트하세요'
    },
    {
      id: 'remove-relationship',
      title: '자녀 관계 제거',
      subtitle: '자녀와의 연결을 해제하세요'
    },
    {
      id: 'unregister',
      title: '자녀 등록 해제',
      subtitle: '자녀의 계정을 완전히 삭제하세요'
    }
  ]

  const handleMenuClick = (itemId: string) => {
    console.log('Menu clicked:', itemId)
  }

  const handleBack = () => {
    window.history.back();
  }

  return (
    <Container>
      <div className="w-full max-w-sm mx-auto">
        <button className="mb-4 cursor-pointer" onClick={handleBack}>
          <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
      </div>

      <div className="flex flex-col items-start justify-start flex-grow w-full max-w-sm mx-auto mt-4">
        <div className="w-full mb-8">
          <span className="text-gray-500 font-medium text-sm">마이페이지</span>
          <h1 className="text-2xl font-semibold mb-3">계정 설정 및 관리</h1>
        </div>

        <div className="w-full space-y-9">
          {menuItems.map((item) => (
            <div
              key={item.id}
              onClick={() => handleMenuClick(item.id)}
              className="flex items-center gap-4 cursor-pointer group"
            >
              <div className="flex-1 min-w-0">
                <h3 className="text-black font-medium text-lg group-hover:text-gray-700 transition-colors">{item.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{item.subtitle}</p>
              </div>
              <svg className="w-5 h-5 text-gray-400 group-hover:text-gray-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          ))}
        </div>

        <div className="w-full mt-12">
          <Button
            onClick={() => handleMenuClick('switch-mode-bottom')}
            className="flex w-full items-center justify-center gap-3 rounded-lg bg-[#FF6F71] text-white py-4 text-lg font-medium hover:bg-[#e55a5c] transition-colors mt-20"
          >
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
            </svg>
            보호자 모드로 전환
          </Button>
        </div>

        <div className="w-full mt-6 pb-4">
          <div className="text-center text-xs text-gray-400 space-y-1">
            <p>앱 버전 1.2.3</p>
            <p>마지막 업데이트: 2024.07.12</p>
          </div>
        </div>
      </div>
      
      <NavigationBar activeTab={activeTab} onTabChange={setActiveTab} />
    </Container>
  )
} 