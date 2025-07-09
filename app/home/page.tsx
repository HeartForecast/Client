'use client'

import { useState } from "react"
import Container from "../components/Container"

export default function Register() {
  const [open, setOpen] = useState(false)

  return (
    <Container className={`relative${open ? ' overflow-hidden' : ''}`}>
      <div className="flex flex-col items-start justify-start flex-grow w-full max-w-sm mx-auto mt-4 relative">
        <div className="flex items-end gap-1 cursor-pointer" onClick={() => setOpen(true)}>
          <span className="text-gray-900 font-semibold text-2xl">신희성</span>
          <div className="flex items-center gap-1">
            <span className="text-sm text-gray-500 font-medium mr-1">#342944</span>
            <svg className="w-5 h-5" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M4.5 7.5L9 12L13.5 7.5" stroke="#000" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
        </div>
        <div className="absolute right-0">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-7 h-7">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
          </svg>
        </div>
      </div>
      {open && (
        <div className="absolute inset-0 z-50 flex items-end justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={() => setOpen(false)} />
          <div className="relative w-full max-w-sm mx-auto bg-white rounded-4xl pt-4 pb-8 px-6 animate-slideUp mb-8">
            <div className="flex flex-col items-center">
              <div className="w-16 h-1 bg-gray-200 rounded-full mb-6" />
              <div className="text-xl font-bold text-left w-full mt-2">아래에서 전환할 자녀 계정을 선택해요.</div>
              <span className="text-base font-medium text-left w-full text-gray-500">아이를 선택하면 해당 계정으로 전환해요</span>
            </div>
            <style jsx global>{`
              @keyframes slideUp {
                from {
                  transform: translateY(100%);
                }
                to {
                  transform: translateY(0);
                }
              }
              .animate-slideUp {
                animation: slideUp 0.28s cubic-bezier(0.4, 0, 0.2, 1);
              }
            `}</style>
          </div>
        </div>
      )}
    </Container>
  )
}