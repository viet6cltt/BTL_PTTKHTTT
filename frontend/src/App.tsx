import { useEffect, useState } from 'react'
import { AuthProvider, useAuth } from './context/AuthContext'
import { LoginPage } from './pages/LoginPage'
import { SeminarListPage } from './pages/SeminarListPage'
import { CreateSeminarPage } from './pages/CreateSeminarPage'
import { SeminarDetailPage } from './pages/SeminarDetailPage'
import { MyTravelPage } from './pages/MyTravelPage'
import { AllMaterialsPage } from './pages/AllMaterialsPage'
import { MasterDataManagementPage } from './pages/MasterDataManagementPage'
import { SeminarTypeDetailPage } from './pages/SeminarTypeDetailPage'
import { CreateUserPage } from './pages/CreateUserPage'
import { Sidebar } from './components/layout/Sidebar'
import { TopNavbar } from './components/layout/TopNavbar'

export type TabType =
  | 'LIST'
  | 'CREATE'
  | 'DETAIL'
  | 'MY_TRAVEL'
  | 'ALL_MATERIALS'
  | 'MASTER_DATA'
  | 'SEMINAR_TYPE_DETAIL'
  | 'CREATE_USER'

type AppRoute = {
  tab: TabType
  seminarId: number | null
  seminarTypeId: number | null
}

function parseRoute(pathname: string): AppRoute {
  if (pathname === '/seminars/new') {
    return { tab: 'CREATE', seminarId: null, seminarTypeId: null }
  }

  const seminarDetailMatch = pathname.match(/^\/seminars\/(\d+)$/)
  if (seminarDetailMatch) {
    return { tab: 'DETAIL', seminarId: Number(seminarDetailMatch[1]), seminarTypeId: null }
  }

  if (pathname === '/my-travel') {
    return { tab: 'MY_TRAVEL', seminarId: null, seminarTypeId: null }
  }

  if (pathname === '/materials') {
    return { tab: 'ALL_MATERIALS', seminarId: null, seminarTypeId: null }
  }

  if (pathname === '/users/new') {
    return { tab: 'CREATE_USER', seminarId: null, seminarTypeId: null }
  }

  const seminarTypeDetailMatch = pathname.match(/^\/master-data\/seminar-types\/(\d+)$/)
  if (seminarTypeDetailMatch) {
    return {
      tab: 'SEMINAR_TYPE_DETAIL',
      seminarId: null,
      seminarTypeId: Number(seminarTypeDetailMatch[1]),
    }
  }

  if (pathname === '/master-data') {
    return { tab: 'MASTER_DATA', seminarId: null, seminarTypeId: null }
  }

  return { tab: 'LIST', seminarId: null, seminarTypeId: null }
}

function pathForRoute(route: AppRoute) {
  if (route.tab === 'CREATE') return '/seminars/new'
  if (route.tab === 'DETAIL' && route.seminarId !== null) return `/seminars/${route.seminarId}`
  if (route.tab === 'SEMINAR_TYPE_DETAIL' && route.seminarTypeId !== null) {
    return `/master-data/seminar-types/${route.seminarTypeId}`
  }
  if (route.tab === 'MY_TRAVEL') return '/my-travel'
  if (route.tab === 'ALL_MATERIALS') return '/materials'
  if (route.tab === 'CREATE_USER') return '/users/new'
  if (route.tab === 'MASTER_DATA') return '/master-data'
  return '/seminars'
}

function AppContent() {
  const { user, isLoading } = useAuth()
  const [route, setRoute] = useState<AppRoute>(() => parseRoute(window.location.pathname))

  useEffect(() => {
    function handlePopState() {
      setRoute(parseRoute(window.location.pathname))
    }

    function handleCustomNavigate(event: Event) {
      const customEvent = event as CustomEvent<AppRoute>
      if (customEvent.detail) {
        navigate(customEvent.detail)
      }
    }

    window.addEventListener('popstate', handlePopState)
    window.addEventListener('app-navigate', handleCustomNavigate)
    return () => {
      window.removeEventListener('popstate', handlePopState)
      window.removeEventListener('app-navigate', handleCustomNavigate)
    }
  }, [])

  function navigate(nextRoute: AppRoute) {
    const nextPath = pathForRoute(nextRoute)
    if (window.location.pathname !== nextPath) {
      window.history.pushState(null, '', nextPath)
    }
    setRoute(nextRoute)
  }

  const currentTab = route.tab
  const selectedSeminarId = route.seminarId
  const selectedSeminarTypeId = route.seminarTypeId
  const canCreateSeminar = user?.role === 'BOOKING_STAFF'
  const canViewMasterData = user?.role === 'ADMIN'
  const canModifyMasterData = user?.role === 'ADMIN'
  const canViewMaterialRequests = user?.role === 'MATERIALS_STAFF'
  const isMaterialsStaff = user?.role === 'MATERIALS_STAFF'
  const canCreateUsers = user?.role === 'ADMIN'

  useEffect(() => {
    if (user?.role === 'CONSULTANT' && route.tab !== 'MY_TRAVEL') {
      const consultantRoute = { tab: 'MY_TRAVEL' as const, seminarId: null, seminarTypeId: null }
      window.history.replaceState(null, '', pathForRoute(consultantRoute))
      setRoute(consultantRoute)
    }
  }, [route.tab, user?.role])

  useEffect(() => {
    if (isMaterialsStaff && route.tab !== 'ALL_MATERIALS') {
      const materialsRoute = { tab: 'ALL_MATERIALS' as const, seminarId: null, seminarTypeId: null }
      window.history.replaceState(null, '', pathForRoute(materialsRoute))
      setRoute(materialsRoute)
    }
  }, [isMaterialsStaff, route.tab])

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
          navigate({ tab, seminarId: null, seminarTypeId: null })
        }}
      />
      <div className="lg:pl-[270px]">
        <TopNavbar />
        <main className="relative overflow-hidden px-6 py-8 md:px-8 lg:px-6 xl:px-8">
          <div className="pointer-events-none absolute -right-36 top-11 h-100 w-100 rounded-full bg-[#5DF8D8]/20 blur-3xl" />
          <div className="relative mx-auto max-w-[1220px]">
            {user.role !== 'CONSULTANT' && !isMaterialsStaff && currentTab === 'LIST' && (
              <SeminarListPage
                onSelectSeminar={(id) => {
                  navigate({ tab: 'DETAIL', seminarId: id, seminarTypeId: null })
                }}
                onCreateSeminarClick={() => {
                  navigate({ tab: 'CREATE', seminarId: null, seminarTypeId: null })
                }}
              />
            )}
            {currentTab === 'CREATE' && canCreateSeminar && (
              <CreateSeminarPage
                onSaveSuccess={() => {
                  navigate({ tab: 'LIST', seminarId: null, seminarTypeId: null })
                }}
                onCancel={() => {
                  navigate({ tab: 'LIST', seminarId: null, seminarTypeId: null })
                }}
              />
            )}
            {user.role !== 'CONSULTANT' && !isMaterialsStaff && currentTab === 'DETAIL' && selectedSeminarId !== null && (
              <SeminarDetailPage
                seminarId={selectedSeminarId}
                onBack={() => {
                  navigate({ tab: 'LIST', seminarId: null, seminarTypeId: null })
                }}
              />
            )}
            {user.role === 'CONSULTANT' && currentTab === 'MY_TRAVEL' && <MyTravelPage />}
            {currentTab === 'ALL_MATERIALS' && canViewMaterialRequests && <AllMaterialsPage />}
            {currentTab === 'CREATE_USER' && canCreateUsers && <CreateUserPage />}
            {currentTab === 'MASTER_DATA' && canViewMasterData && (
              <MasterDataManagementPage
                onSelectSeminarType={(id) => {
                  navigate({ tab: 'SEMINAR_TYPE_DETAIL', seminarId: null, seminarTypeId: id })
                }}
              />
            )}
            {currentTab === 'SEMINAR_TYPE_DETAIL' &&
              selectedSeminarTypeId !== null &&
              canViewMasterData && (
                <SeminarTypeDetailPage
                  seminarTypeId={selectedSeminarTypeId}
                  canModifyMasterData={canModifyMasterData}
                  onBack={() => {
                    navigate({ tab: 'MASTER_DATA', seminarId: null, seminarTypeId: null })
                  }}
                />
              )}
            {!isMaterialsStaff && ((currentTab === 'CREATE' && !canCreateSeminar) ||
              (currentTab === 'MY_TRAVEL' && user.role !== 'CONSULTANT') ||
              (currentTab === 'ALL_MATERIALS' && !canViewMaterialRequests) ||
              (currentTab === 'CREATE_USER' && !canCreateUsers) ||
              ((currentTab === 'MASTER_DATA' || currentTab === 'SEMINAR_TYPE_DETAIL') &&
                !canViewMasterData)) && (
              <SeminarListPage
                onSelectSeminar={(id) => {
                  navigate({ tab: 'DETAIL', seminarId: id, seminarTypeId: null })
                }}
                onCreateSeminarClick={() => {
                  navigate({ tab: 'CREATE', seminarId: null, seminarTypeId: null })
                }}
              />
            )}
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
