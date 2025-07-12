'use client'

import { useState } from "react"
import Container from "../components/Container"
import NavigationBar from "../components/NavigationBar"

export default function Register() {
  const [currentName, setCurrentName] = useState('신희성')
  const [currentId, setCurrentId] = useState('#342944')
  const [activeTab, setActiveTab] = useState('홈')

  return (
    <Container>
      <div className="flex flex-col items-start justify-start flex-grow w-full max-w-sm mx-auto mt-4">
        <div className="flex items-end gap-1 rounded-lg px-2">
          <span className="text-gray-900 font-semibold text-2xl">{currentName}</span>
          <div className="flex items-center gap-1">
            <span className="text-sm text-gray-500 font-medium mr-1">{currentId}</span>
          </div>
        </div>
      </div>
      <NavigationBar activeTab={activeTab} onTabChange={setActiveTab} />
    </Container>
  )
}