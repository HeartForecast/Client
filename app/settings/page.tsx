'use client'

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Container from "../components/Container"
import NavigationBar from "../components/NavigationBar"
import Toast from "../components/Toast"
import { useChild } from "../contexts/ChildContext"

const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL

interface ChildData {
  id: number
  name: string
  age: number
  registeredDate: string
}

interface ApiChildData {
  id: number
  username: string
  birthdate: string
  gender: string
  healthInfo: string
  createdAt: string
  point: number
  inviteCode: string
}

interface DeleteModalProps {
  isOpen: boolean
  childId: number
  childName: string
  onClose: () => void
  onDeleteRelation: (childId: number) => void
  onDeleteChild: (childId: number) => void
}

function DeleteModal({ isOpen, childId, childName, onClose, onDeleteRelation, onDeleteChild }: DeleteModalProps) {
  const [isDeleting, setIsDeleting] = useState(false)
  const [deleteType, setDeleteType] = useState<'relation' | 'child' | null>(null)

  const handleDelete = async (type: 'relation' | 'child') => {
    setIsDeleting(true)
    setDeleteType(type)
    
    try {
      if (type === 'relation') {
        await onDeleteRelation(childId)
      } else {
        await onDeleteChild(childId)
      }
    } finally {
      setIsDeleting(false)
      setDeleteType(null)
      onClose()
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-6 mx-4 max-w-sm w-full">
        <h3 className="text-lg font-semibold mb-4">삭제 옵션 선택</h3>
        <p className="text-sm text-gray-600 mb-6">
          <strong>{childName}</strong>에 대한 삭제 옵션을 선택해주세요.
        </p>
        
        <div className="space-y-3 mb-6">
          <button
            onClick={() => handleDelete('relation')}
            disabled={isDeleting}
            className="w-full p-4 border border-gray-200 rounded-lg text-left hover:bg-gray-50 disabled:opacity-50"
          >
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium text-gray-900">돌봄관계 삭제</h4>
                <p className="text-sm text-gray-500">아이 정보는 유지하고 돌봄관계만 삭제합니다</p>
              </div>
              {isDeleting && deleteType === 'relation' && (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-[#FF6F71]"></div>
              )}
            </div>
          </button>
          
          <button
            onClick={() => handleDelete('child')}
            disabled={isDeleting}
            className="w-full p-4 border border-red-200 rounded-lg text-left hover:bg-red-50 disabled:opacity-50"
          >
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium text-red-600">아이 완전 삭제</h4>
                <p className="text-sm text-red-500">아이 정보와 모든 관련 데이터를 완전히 삭제합니다</p>
              </div>
              {isDeleting && deleteType === 'child' && (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-500"></div>
              )}
            </div>
          </button>
        </div>
        
        <button
          onClick={onClose}
          disabled={isDeleting}
          className="w-full py-3 text-gray-600 hover:text-gray-800 disabled:opacity-50"
        >
          취소
        </button>
      </div>
    </div>
  )
}

export default function SettingsPage() {
  const router = useRouter()
  const { selectedChild, setSelectedChild, isChildMode, autoSelectFirstChild } = useChild();
  const [activeTab, setActiveTab] = useState('아이 목록')
  const [openMenuId, setOpenMenuId] = useState<number | null>(null)
  const [childrenData, setChildrenData] = useState<ChildData[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [toast, setToast] = useState<{
    message: string;
    type: 'success' | 'error';
    isVisible: boolean;
  }>({
    message: '',
    type: 'success',
    isVisible: false
  })
  const [deleteModal, setDeleteModal] = useState<{
    isOpen: boolean
    childId: number
    childName: string
  }>({
    isOpen: false,
    childId: 0,
    childName: ''
  })

  useEffect(() => {
    const fetchChildRelations = async () => {
      try {
        setIsLoading(true)
        setError(null)
        
        const response = await fetch(`${apiBaseUrl}/api/childRelations`, {
          method: 'GET',
          credentials: 'include',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          }
        })

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }

        const data: ApiChildData[] = await response.json()

        const processed = data.map((item) => {
          const birthYear = new Date(item.birthdate).getFullYear()
          const thisYear = new Date().getFullYear()
          const age = thisYear - birthYear

          const date = new Date(item.createdAt)
          const formattedDate = `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, '0')}.${String(date.getDate()).padStart(2, '0')}`

          return {
            id: item.id,
            name: item.username,
            age,
            registeredDate: formattedDate
          }
        })

        setChildrenData(processed)
      } catch (err) {
        console.error('아이 목록 불러오기 실패:', err)
        setError(err instanceof Error ? err.message : '아이 목록을 불러오는데 실패했습니다.')
      } finally {
        setIsLoading(false)
      }
    }

    fetchChildRelations()
  }, [])

  const showToast = (message: string, type: 'success' | 'error' | 'warning') => {
    setToast({
      message,
      type: type === 'warning' ? 'error' : type,
      isVisible: true
    });
  };

  const hideToast = () => {
    setToast(prev => ({ ...prev, isVisible: false }));
  };

  const handleBack = () => {
    window.history.back()
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
    setDeleteModal({
      isOpen: true,
      childId,
      childName
    })
  }

  const handleDeleteRelation = async (childId: number) => {
    try {
      const response = await fetch(`${apiBaseUrl}/api/childRelations/${childId}`, {
        method: 'DELETE',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        throw new Error(`관계 삭제 실패: ${response.status}`)
      }

      // 삭제된 아이가 현재 선택된 아이인지 확인
      if (selectedChild?.id === childId) {
        setSelectedChild(null);
        if (typeof window !== 'undefined') {
          localStorage.removeItem('selectedChild');
        }
      }

      setChildrenData(prev => prev.filter(child => child.id !== childId))
      showToast('돌봄관계가 삭제되었습니다.', 'success')
      
      // 삭제 후 자동으로 첫 번째 아이 선택
      setTimeout(() => {
        autoSelectFirstChild();
      }, 100);
    } catch (error) {
      console.error('관계 삭제 실패:', error)
      showToast('돌봄관계 삭제에 실패했습니다.', 'error')
    }
  }

  const handleDeleteChild = async (childId: number) => {
    try {
      const response = await fetch(`${apiBaseUrl}/api/children/${childId}`, {
        method: 'DELETE',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        throw new Error(`아이 삭제 실패: ${response.status}`)
      }

      // 삭제된 아이가 현재 선택된 아이인지 확인
      if (selectedChild?.id === childId) {
        setSelectedChild(null);
        if (typeof window !== 'undefined') {
          localStorage.removeItem('selectedChild');
        }
      }

      setChildrenData(prev => prev.filter(child => child.id !== childId))
      showToast('아이가 완전히 삭제되었습니다.', 'success')
      
      // 삭제 후 자동으로 첫 번째 아이 선택
      setTimeout(() => {
        autoSelectFirstChild();
      }, 100);
    } catch (error) {
      console.error('아이 삭제 실패:', error)
      showToast('아이 삭제에 실패했습니다.', 'error')
    }
  }

  const handleSwitchAccount = (childId: number, childName: string) => {
    const child = childrenData.find(c => c.id === childId);
    if (child) {
      setSelectedChild(child);
      setOpenMenuId(null);
      router.push('/home');
    }
  }

  const toggleMenu = (childId: number) => {
    setOpenMenuId(openMenuId === childId ? null : childId)
  }

  const closeDeleteModal = () => {
    setDeleteModal({
      isOpen: false,
      childId: 0,
      childName: ''
    })
  }

  // 아이 모드일 때 접근 차단
  if (isChildMode) {
    if (typeof window !== 'undefined') {
      router.replace('/home');
    }
    return null;
  }

  // 로딩 상태 렌더링
  if (isLoading) {
    return (
      <Container>
        <div className="w-full max-w-sm mx-auto">
          <button className="mb-4 cursor-pointer" onClick={handleBack}>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
        </div>
        
        <div className="flex flex-col items-center justify-center min-h-[60vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#FF6F71] mx-auto mb-4"></div>
          <p className="text-gray-600">아이 목록을 불러오는 중...</p>
        </div>
        
        <NavigationBar activeTab={activeTab} onTabChange={setActiveTab} showToast={showToast} />
      </Container>
    )
  }

  // 에러 상태 렌더링
  if (error) {
    return (
      <Container>
        <div className="w-full max-w-sm mx-auto">
          <button className="mb-4 cursor-pointer" onClick={handleBack}>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
        </div>
        
        <div className="flex flex-col items-center justify-center min-h-[60vh]">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
            <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">오류가 발생했습니다</h3>
          <p className="text-sm text-gray-500 text-center mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-[#FF6F71] text-white rounded-lg hover:bg-[#e55a5c] transition-colors"
          >
            다시 시도
          </button>
        </div>
        
        <NavigationBar activeTab={activeTab} onTabChange={setActiveTab} showToast={showToast} />
      </Container>
    )
  }

  return (
    <Container className="bg-white">
      <Toast
        message={toast.message}
        type={toast.type}
        isVisible={toast.isVisible}
        onClose={hideToast}
      />
      
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
          <h1 className="text-2xl font-semibold mb-1">등록된 아이 목록</h1>
          <p className="text-sm text-gray-600">
            총 {childrenData.length}명의 아이가 등록되어 있습니다.
          </p>
        </div>

        <div className="w-full space-y-4">
          {childrenData.map((child) => (
            <div
              key={child.id}
              className="bg-white rounded-2xl p-5 border border-gray-100 relative shadow-sm"
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
                        아이 선택
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
          <div className="w-full flex flex-col items-center justify-center py-8">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">등록된 아이가 없습니다.</h3>
            <p className="text-sm text-gray-500 text-center mb-10">아이를 등록하여 관리를 시작해보세요.</p>
          </div>
        )}

        <div className="w-full mt-10 mb-40 flex gap-3">
          <button
            onClick={() => router.push('/insert-children')}
            className="flex-1 bg-white border-2 border-[#FF6F71] text-[#FF6F71] py-4 px-4 rounded-2xl font-medium hover:bg-[#FF6F71] hover:text-white transition-colors flex items-center justify-center"
          >아이 추가</button>
          
          <button
            onClick={() => router.push('/insert-code')}
            className="flex-1 bg-white border-2 border-[#FF6F71] text-[#FF6F71] py-4 px-4 rounded-2xl font-medium hover:bg-[#FF6F71] hover:text-white transition-colors flex items-center justify-center"
          >아이 등록</button>
        </div>
      </div>
      
      <NavigationBar activeTab={activeTab} onTabChange={setActiveTab} showToast={showToast} />
      
      <DeleteModal
        isOpen={deleteModal.isOpen}
        childId={deleteModal.childId}
        childName={deleteModal.childName}
        onClose={closeDeleteModal}
        onDeleteRelation={handleDeleteRelation}
        onDeleteChild={handleDeleteChild}
      />
    </Container>
  )
} 