import { useState } from 'react'
import { AuthProvider, useAuth } from './context/AuthContext'
import { LoginPage } from './pages/LoginPage'
import { SeminarListPage } from './pages/SeminarListPage'
import { CreateSeminarPage } from './pages/CreateSeminarPage'
import { SeminarDetailPage } from './pages/SeminarDetailPage'
import { MyTravelPage } from './pages/MyTravelPage'
import { AllMaterialsPage } from './pages/AllMaterialsPage'
import { MasterDataManagementPage } from './pages/MasterDataManagementPage'
import { Sidebar } from './components/layout/Sidebar'
import { TopNavbar } from './components/layout/TopNavbar'

export type TabType =
  | 'LIST'
  | 'CREATE'
  | 'DETAIL'
  | 'MY_TRAVEL'
  | 'ALL_MATERIALS'
  | 'MASTER_DATA'

function AppContent() {
  const { user, isLoading } = useAuth()
  const [currentTab, setCurrentTab] = useState<TabType>('LIST')
  const [selectedSeminarId, setSelectedSeminarId] = useState<number | null>(null)

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F5FAFF]">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-[#0B3970] border-t-transparent" />
          <p className="text-sm font-bold text-[#0B3970]">Đang tải thông tin hệ thống...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return <LoginPage />
  }

  return (
    <div className="min-h-screen bg-[#F5FAFF] font-sans text-[#18395F]">
      <Sidebar
        currentTab={currentTab}
        onChangeTab={(tab) => {
          if (tab === 'LIST') setSelectedSeminarId(null)
          setCurrentTab(tab)
        }}
      />
      <div className="lg:pl-[270px]">
        <TopNavbar />
        <main className="relative overflow-hidden px-6 py-8 md:px-8 lg:px-6 xl:px-8">
          <div className="pointer-events-none absolute -right-36 top-11 h-100 w-100 rounded-full bg-[#5DF8D8]/20 blur-3xl" />
          <div className="relative mx-auto max-w-[1220px]">
            {currentTab === 'LIST' && (
              <SeminarListPage
                onSelectSeminar={(id) => {
                  setSelectedSeminarId(id)
                  setCurrentTab('DETAIL')
                }}
                onCreateSeminarClick={() => {
                  setCurrentTab('CREATE')
                }}
              />
            )}
            {currentTab === 'CREATE' && (
              <CreateSeminarPage
                onSaveSuccess={() => {
                  setCurrentTab('LIST')
                }}
                onCancel={() => {
                  setCurrentTab('LIST')
                }}
              />
            )}
            {currentTab === 'DETAIL' && selectedSeminarId !== null && (
              <SeminarDetailPage
                seminarId={selectedSeminarId}
                onBack={() => {
                  setSelectedSeminarId(null)
                  setCurrentTab('LIST')
                }}
              />
            )}
            {currentTab === 'MY_TRAVEL' && <MyTravelPage />}
            {currentTab === 'ALL_MATERIALS' && <AllMaterialsPage />}
            {currentTab === 'MASTER_DATA' && <MasterDataManagementPage />}
          </div>
        </main>
      </div>
    </div>
  )
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  )
}

export default App
