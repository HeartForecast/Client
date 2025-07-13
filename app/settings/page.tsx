'use client'

import { useState } from "react"
import { useRouter } from "next/navigation"
import Container from "../components/Container"
import NavigationBar from "../components/NavigationBar"

export default function ChildrenListPage() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState('설정')
  const [openMenuId, setOpenMenuId] = useState<number | null>(null)

  const childrenData = [
    {
      id: 1,
      name: '김민수',
      age: 12,
      registeredDate: '2024.03.15'
    },
    {
      id: 2,
      name: '김지은',
      age: 15,
      registeredDate: '2024.01.20'
    },
    {
      id: 3,
      name: '이준호',
      age: 8,
      registeredDate: '2024.05.10'
    }
  ]

  const handleBack = () => {
    window.history.back();
  }

  const handleChildClick = (childId: number) => {
    console.log('Child clicked:', childId)
  }

  const handleEdit = (childId: number, childName: string) => {
    console.log('Edit child:', childId, childName)
    setOpenMenuId(null)
    router.push(`/settings/edit-child?id=${childId}`)
  }

  const handleDelete = (childId: number, childName: string) => {
    console.log('Delete child:', childId, childName)
    setOpenMenuId(null)
  }

  const handleSwitchAccount = (childId: number, childName: string) => {
    console.log('Switch to child account:', childId, childName)
    setOpenMenuId(null)
  }

  const toggleMenu = (childId: number) => {
    setOpenMenuId(openMenuId === childId ? null : childId)
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
          <span className="text-gray-500 font-medium text-sm">설정</span>
          <h1 className="text-2xl font-semibold mb-1">등록된 자녀 목록</h1>
          <p className="text-sm text-gray-600">총 {childrenData.length}명의 자녀가 등록되어 있습니다</p>
        </div>

        <div className="w-full space-y-4">
          {childrenData.map((child) => (
            <div
              key={child.id}
              className="bg-white rounded-2xl p-5 border border-gray-100 relative"
            >
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">{child.name}</h3>
                  <p className="text-sm text-gray-600 mb-1">{child.age}세</p>
                  <p className="text-xs text-gray-500">등록일: {child.registeredDate}</p>
                </div>
                
                <div className="relative">
                  <button
                    onClick={() => toggleMenu(child.id)}
                    className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-gray-100 transition-colors"
                  >
                    <svg className="w-5 h-5 text-gray-500" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/>
                    </svg>
                  </button>
                  
                  {openMenuId === child.id && (
                    <div className="absolute right-0 top-10 w-36 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-10">
                      <button
                        onClick={() => handleSwitchAccount(child.id, child.name)}
                        className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                        </svg>
                        계정 전환
                      </button>
                      <button
                        onClick={() => handleEdit(child.id, child.name)}
                        className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                        수정
                      </button>
                      <button
                        onClick={() => handleDelete(child.id, child.name)}
                        className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                        삭제
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {childrenData.length === 0 && (
          <div className="w-full flex flex-col items-center justify-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">등록된 자녀가 없습니다</h3>
            <p className="text-sm text-gray-500 text-center">자녀를 등록하여 관리를 시작해보세요</p>
          </div>
        )}
      </div>
      
      <NavigationBar activeTab={activeTab} onTabChange={setActiveTab} />
    </Container>
  )
} 