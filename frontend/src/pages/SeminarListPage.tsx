import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Inbox,
  ListChecks,
  PlusCircle,
  AlertTriangle,
  Clock,
  CheckCircle,
  TrendingUp,
  ChevronDown,
  SlidersHorizontal,
} from 'lucide-react'
import { useMemo, useState, useEffect, type FormEvent } from 'react'
import {
  FilterDateRange,
  FilterPanel,
  FilterSelect,
  FilterTextInput,
} from '../components/filter/FilterPanel'
import { PageHeader } from '../components/layout/PageHeader'
import { api, SeminarResponse, type SeminarStatus, type UserRole } from '../api'
import { useAuth } from '../context/AuthContext'

const PAGE_SIZE = 10
const FINAL_SEMINAR_STATUSES: SeminarStatus[] = [
  'PENDING_LOGISTICS',
  'FACILITY_SECURED',
  'TRAVEL_CONFIRMED',
  'READY_FOR_SEMINAR',
  'OVERDUE',
]

const cardClass = 'rounded-2xl border border-slate-200 bg-white shadow-xl shadow-slate-200/70'
const tableCellClass = 'px-4 py-4 lg:px-5'
const iconButtonClass =
  'grid h-9 w-9 place-items-center rounded-lg border border-slate-200 bg-white text-slate-600 transition hover:border-[#5DF8D8] hover:text-[#3B7597] disabled:cursor-not-allowed disabled:border-slate-100 disabled:bg-slate-50 disabled:text-slate-300'

type FilterState = {
  searchTerm: string
  seminarTypeId: string
  consultantId: string
  status: string
  city: string
  seminarDateFrom: string
  seminarDateTo: string
}

type CoordinatorScope = 'ALL' | 'MINE' | 'UNASSIGNED'

const defaultFilters: FilterState = {
  searchTerm: '',
  seminarTypeId: '',
  consultantId: '',
  status: '',
  city: '',
  seminarDateFrom: '',
  seminarDateTo: '',
}

function isSeminarOverdueLocked(seminar: SeminarResponse) {
  return seminar.status === 'OVERDUE' ||
    (seminar.startDate < getTodayInputValue() && seminar.status !== 'READY_FOR_SEMINAR' && seminar.status !== 'CANCELLED')
}

function getTodayInputValue() {
  const today = new Date()
  const year = today.getFullYear()
  const month = String(today.getMonth() + 1).padStart(2, '0')
  const day = String(today.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function seminarStatusLabel(seminar: SeminarResponse, labels: Record<string, string>) {
  if (isSeminarOverdueLocked(seminar)) {
    return 'Quá hạn xử lý'
  }
  return labels[seminar.status] || seminar.status
}

function seminarStatusStyle(seminar: SeminarResponse, styles: Record<string, string>) {
  if (isSeminarOverdueLocked(seminar)) {
    return 'bg-rose-50 text-rose-700 border-rose-200'
  }
  return styles[seminar.status] || 'bg-slate-100 text-slate-600 border-slate-200'
}

interface SeminarListPageProps {
  onSelectSeminar: (id: number) => void
  onCreateSeminarClick: () => void
}

export function SeminarListPage({ onSelectSeminar, onCreateSeminarClick }: SeminarListPageProps) {
  const { user } = useAuth()
  const [seminarRows, setSeminarRows] = useState<SeminarResponse[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  
  const [filters, setFilters] = useState<FilterState>(defaultFilters)
  const [coordinatorScope, setCoordinatorScope] = useState<CoordinatorScope>('ALL')
  const [page, setPage] = useState(1)
  const [isFilterVisible, setIsFilterVisible] = useState(false)

  // Fetch seminars on mount
  useEffect(() => {
    async function loadSeminars() {
      try {
        setIsLoading(true)
        setErrorMsg(null)
        const response = await api.getSeminars({
          size: 1000,
          coordinatorId:
            user?.role === 'LOGISTICS_COORDINATOR' && coordinatorScope === 'MINE'
              ? user.userId
              : undefined,
        })
        setSeminarRows(scopeSeminarsForRole(response.content || [], user?.role))
      } catch (err: any) {
        setErrorMsg(err.message || 'Không thể tải danh sách seminar. Vui lòng kiểm tra kết nối.')
      } finally {
        setIsLoading(false)
      }
    }
    loadSeminars()
  }, [coordinatorScope, user?.role, user?.userId])

  async function handleClaim(seminarId: number) {
    if (!user) return
    try {
      setErrorMsg(null)
      setIsLoading(true)
      await api.assignCoordinator(seminarId, user.userId)
      const response = await api.getSeminars({
        size: 1000,
        coordinatorId: coordinatorScope === 'MINE' ? user.userId : undefined,
      })
      setSeminarRows(scopeSeminarsForRole(response.content || [], user.role))
    } catch (err: any) {
      setErrorMsg(err.message || 'Lỗi nhận nhiệm vụ.')
    } finally {
      setIsLoading(false)
    }
  }

  const seminarTypeOptions = useMemo(
    () =>
      makeUniqueOptions(seminarRows, 'seminarTypeId', 'seminarTypeName', {
        value: '',
        label: 'Tất cả loại seminar',
      }),
    [seminarRows],
  )

  const cityOptions = useMemo(
    () => makeCityOptions(seminarRows, { value: '', label: 'Tất cả thành phố' }),
    [seminarRows],
  )

  const statusOptions = useMemo(() => {
    const options = [
      { value: '', label: 'Tất cả trạng thái' },
      { value: 'PENDING_LOGISTICS', label: 'Chờ lên lịch Hậu cần' },
      { value: 'FACILITY_SECURED', label: 'Đã thuê Khách sạn' },
      { value: 'TRAVEL_CONFIRMED', label: 'Đã chốt Vé xe/máy bay' },
      { value: 'READY_FOR_SEMINAR', label: 'Sẵn sàng tổ chức' },
      { value: 'OVERDUE', label: 'Quá hạn xử lý' },
    ]

    if (user?.role === 'ADMIN') {
      options.push({ value: 'CANCELLED', label: 'Đã hủy bỏ' })
    }

    return options
  }, [user?.role])

  const filteredSeminars = useMemo(
    () => {
      const filtered = seminarRows.filter(
        (seminar) =>
          matchesCoordinatorScope(seminar, coordinatorScope, user?.userId) &&
          matchesFilters(seminar, filters),
      )
      // Sort OVERDUE to the top
      return [...filtered].sort((a, b) => {
        const aOverdue = isSeminarOverdueLocked(a)
        const bOverdue = isSeminarOverdueLocked(b)
        if (aOverdue && !bOverdue) return -1
        if (!aOverdue && bOverdue) return 1
        return 0
      })
    },
    [seminarRows, filters, coordinatorScope, user?.userId],
  )

  const totalPages = Math.max(1, Math.ceil(filteredSeminars.length / PAGE_SIZE))
  const currentPage = Math.min(page, totalPages)
  const startIndex = (currentPage - 1) * PAGE_SIZE
  const pagedSeminars = filteredSeminars.slice(
    startIndex,
    startIndex + PAGE_SIZE,
  )
  const visibleStart = filteredSeminars.length === 0 ? 0 : startIndex + 1
  const visibleEnd = Math.min(startIndex + PAGE_SIZE, filteredSeminars.length)

  function updateFilter(field: keyof FilterState, value: string) {
    setFilters((current) => ({ ...current, [field]: value }))
    setPage(1)
  }

  function handleSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setPage(1)
  }

  function resetFilters() {
    setFilters(defaultFilters)
    setPage(1)
  }

  function goToPage(nextPage: number) {
    setPage(Math.min(Math.max(nextPage, 1), totalPages))
  }

  const isBookingStaff = user?.role === 'BOOKING_STAFF'
  const listTitle = isBookingStaff ? 'Seminar đã chốt cần Booking xử lý' : 'Tất cả Seminar Booking'
  const listDescription = isBookingStaff
    ? 'Chỉ hiển thị các seminar đã chuyển sang phạm vi hậu cần'
    : 'Theo dõi, tìm kiếm và quản lý các seminar logistics trực tuyến'

  const totalSeminars = seminarRows.length
  const overdueCount = useMemo(() => seminarRows.filter(isSeminarOverdueLocked).length, [seminarRows])
  const pendingCount = useMemo(() => seminarRows.filter(s => s.status === 'PENDING_LOGISTICS' && !isSeminarOverdueLocked(s)).length, [seminarRows])
  const readyCount = useMemo(() => seminarRows.filter(s => s.status === 'READY_FOR_SEMINAR').length, [seminarRows])

  return (
    <div className="space-y-7">
      <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
        <PageHeader
          title="Danh sách seminar"
          description={listDescription}
          icon={<ListChecks className="h-10 w-10" strokeWidth={2.4} />}
        />
        {isBookingStaff && (
          <button
            type="button"
            onClick={onCreateSeminarClick}
            className="flex items-center gap-2 rounded-xl bg-[#0B3970] px-5 py-3 text-sm font-extrabold text-white shadow-lg shadow-blue-900/25 transition hover:bg-[#126CB0] hover:shadow-xl shrink-0"
          >
            <PlusCircle className="h-5 w-5" />
            Tạo seminar mới
          </button>
        )}
      </div>

      {errorMsg && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-bold text-red-600">
          {errorMsg}
        </div>
      )}

      {/* Dashboard Stats */}
      {!isBookingStaff && (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {/* Card 1 */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xl shadow-slate-200/50 transition duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-slate-200/80">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Tổng số Seminar</p>
                <h3 className="mt-2 text-3xl font-black text-[#092F5A]">{totalSeminars}</h3>
              </div>
              <div className="rounded-xl bg-[#E8F5FF] p-3 text-[#126CB0]">
                <ListChecks className="h-6 w-6" />
              </div>
            </div>
            <div className="mt-4 flex items-center gap-1.5 text-xs text-slate-500">
              <TrendingUp className="h-3.5 w-3.5 text-teal-500" />
              <span className="font-semibold text-teal-600">Đầy đủ dữ liệu</span> hệ thống
            </div>
          </div>

          {/* Card 2 */}
          <div className={`rounded-2xl border bg-white p-5 shadow-xl transition duration-300 hover:-translate-y-1 hover:shadow-2xl ${
            overdueCount > 0 
              ? 'border-rose-200 shadow-rose-100/50 hover:shadow-rose-200/60 ring-2 ring-rose-500/10' 
              : 'border-slate-200 shadow-slate-200/50 hover:shadow-slate-200/80'
          }`}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Quá hạn xử lý</p>
                <h3 className="mt-2 text-3xl font-black text-rose-600 flex items-center gap-2">
                  {overdueCount}
                  {overdueCount > 0 && (
                    <span className="flex h-2.5 w-2.5 relative">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-rose-500"></span>
                    </span>
                  )}
                </h3>
              </div>
              <div className={`rounded-xl p-3 ${
                overdueCount > 0 ? 'bg-rose-50 text-rose-600 animate-pulse' : 'bg-slate-100 text-slate-400'
              }`}>
                <AlertTriangle className="h-6 w-6" />
              </div>
            </div>
            <div className="mt-4 flex items-center gap-1.5 text-xs">
              <span className={`font-semibold ${overdueCount > 0 ? 'text-rose-600 animate-pulse' : 'text-slate-500'}`}>
                {overdueCount > 0 ? 'Cần ưu tiên xử lý ngay' : 'Không có quá hạn'}
              </span>
            </div>
          </div>

          {/* Card 3 */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xl shadow-slate-200/50 transition duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-slate-200/80">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Chờ lên lịch Hậu cần</p>
                <h3 className="mt-2 text-3xl font-black text-amber-600">{pendingCount}</h3>
              </div>
              <div className="rounded-xl bg-amber-50 p-3 text-amber-600">
                <Clock className="h-6 w-6" />
              </div>
            </div>
            <div className="mt-4 flex items-center gap-1.5 text-xs text-slate-500">
              <span className="font-semibold text-amber-600">Đang chờ</span> điều phối viên nhận việc
            </div>
          </div>

          {/* Card 4 */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xl shadow-slate-200/50 transition duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-slate-200/80">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Sẵn sàng tổ chức</p>
                <h3 className="mt-2 text-3xl font-black text-teal-600">{readyCount}</h3>
              </div>
              <div className="rounded-xl bg-teal-50 p-3 text-teal-600">
                <CheckCircle className="h-6 w-6" />
              </div>
            </div>
            <div className="mt-4 flex items-center gap-1.5 text-xs text-slate-500">
              <span className="font-semibold text-teal-600">Hoàn thành</span> tất cả các bước chuẩn bị
            </div>
          </div>
        </div>
      )}

      {!isBookingStaff && (
        <div className="space-y-4">
          <div className="flex justify-start">
            <button
              type="button"
              onClick={() => setIsFilterVisible(!isFilterVisible)}
              className="inline-flex items-center gap-2.5 rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-extrabold text-[#0B3970] shadow-md shadow-slate-200/50 transition duration-200 hover:-translate-y-0.5 hover:border-[#5DF8D8] hover:text-[#3B7597] cursor-pointer hover:shadow-lg hover:shadow-slate-200/80"
            >
              <SlidersHorizontal className="h-4.5 w-4.5 text-[#126CB0]" />
              {isFilterVisible ? 'Ẩn bộ lọc nâng cao' : 'Hiện bộ lọc tìm kiếm nâng cao'}
              <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${isFilterVisible ? 'rotate-180' : ''}`} />
            </button>
          </div>

          {isFilterVisible && (
            <FilterPanel
              title="Bộ lọc tìm kiếm nâng cao"
              onSubmit={handleSearch}
              onReset={resetFilters}
            >
              <FilterTextInput
                id="searchTerm"
                label="Tên seminar"
                placeholder="Tìm theo tên seminar..."
                value={filters.searchTerm}
                onChange={(value) => updateFilter('searchTerm', value)}
              />
              <FilterSelect
                id="seminarTypeId"
                label="Loại seminar"
                options={seminarTypeOptions}
                value={filters.seminarTypeId}
                onChange={(value) => updateFilter('seminarTypeId', value)}
              />
              <FilterSelect
                id="status"
                label="Trạng thái xử lý"
                options={statusOptions}
                value={filters.status}
                onChange={(value) => updateFilter('status', value)}
              />
              <FilterSelect
                id="city"
                label="Thành phố"
                options={cityOptions}
                value={filters.city}
                onChange={(value) => updateFilter('city', value)}
              />
              <div className="md:col-span-2 xl:col-span-4 grid gap-4 lg:grid-cols-2">
                <FilterDateRange
                  label="Khoảng thời gian tổ chức seminar"
                  start={{
                    id: 'seminarDateFrom',
                    label: 'Từ ngày',
                    value: filters.seminarDateFrom,
                    onChange: (value) => updateFilter('seminarDateFrom', value),
                  }}
                  end={{
                    id: 'seminarDateTo',
                    label: 'Đến ngày',
                    value: filters.seminarDateTo,
                    onChange: (value) => updateFilter('seminarDateTo', value),
                  }}
                />
              </div>
            </FilterPanel>
          )}
        </div>
      )}

      {user?.role === 'LOGISTICS_COORDINATOR' && (
        <section className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-xl shadow-slate-200/70 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-sm font-black text-[#092F5A]">Góc điều phối seminar</h2>
            <p className="mt-1 text-xs font-semibold text-slate-500">
              Lọc nhanh các seminar đang cần nhận hoặc seminar đã được giao cho bạn.
            </p>
          </div>
          <div className="grid grid-cols-3 gap-2 rounded-xl bg-slate-100 p-1 text-xs font-black">
            {[
              { value: 'ALL', label: 'Tất cả' },
              { value: 'MINE', label: 'Của tôi' },
              { value: 'UNASSIGNED', label: 'Chưa nhận' },
            ].map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => {
                  setCoordinatorScope(option.value as CoordinatorScope)
                  setPage(1)
                }}
                className={`rounded-lg px-3 py-2 transition ${
                  coordinatorScope === option.value
                    ? 'bg-[#0B3970] text-white shadow-sm'
                    : 'text-slate-500 hover:bg-white hover:text-[#0B3970]'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </section>
      )}

      <section className={`${cardClass} overflow-hidden`}>
        <div className="flex flex-col gap-3 border-b border-slate-200 px-5 py-5 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-lg font-extrabold text-[#092F5A]">
              {listTitle}
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Hiển thị {visibleStart} đến {visibleEnd} trong{' '}
              {filteredSeminars.length} kết quả
            </p>
          </div>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#0B3970] border-t-transparent" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1040px] border-collapse text-left">
              <thead className="bg-[#F5FAFF] text-xs font-extrabold uppercase tracking-wide text-slate-500">
                <tr>
                  <th className={tableCellClass}>Tên seminar</th>
                  <th className={tableCellClass}>Loại seminar</th>
                  <th className={tableCellClass}>Chuyên gia đào tạo</th>
                  <th className={tableCellClass}>Thành phố</th>
                  <th className={tableCellClass}>Thời gian tổ chức</th>
                  <th className={`${tableCellClass} text-right`}>Số HV dự kiến</th>
                  <th className={tableCellClass}>Điều phối</th>
                  <th className={`${tableCellClass} text-center`}>Trạng thái</th>
                  {user?.role === 'LOGISTICS_COORDINATOR' && (
                    <th className={`${tableCellClass} text-center`}>Thao tác</th>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {pagedSeminars.length > 0 ? (
                  pagedSeminars.map((seminar) => (
                    <SeminarRow
                      key={seminar.id}
                      seminar={seminar}
                      onClick={() => onSelectSeminar(seminar.id)}
                      onClaim={handleClaim}
                    />
                  ))
                ) : (
                  <tr>
                    <td colSpan={user?.role === 'LOGISTICS_COORDINATOR' ? 9 : 8}>
                      <EmptyState />
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        <Pagination
          currentPage={currentPage}
          onPageChange={goToPage}
          totalPages={totalPages}
        />
      </section>
    </div>
  )
}

type SeminarRowProps = {
  seminar: SeminarResponse
  onClick: () => void
  onClaim: (id: number) => void
}

function SeminarRow({ seminar, onClick, onClaim }: SeminarRowProps) {
  const { user } = useAuth()

  // Format state styling beautifully
  const statusLabels: Record<string, string> = {
    PENDING_LOGISTICS: 'Chờ điều phối',
    FACILITY_SECURED: 'Đã đặt địa điểm',
    TRAVEL_CONFIRMED: 'Đã duyệt di chuyển',
    READY_FOR_SEMINAR: 'Sẵn sàng tổ chức',
    CANCELLED: 'Đã hủy',
    OVERDUE: 'Quá hạn xử lý',
  }

  const statusStyles: Record<string, string> = {
    PENDING_LOGISTICS: 'bg-amber-50 text-amber-700 border-amber-200/60',
    FACILITY_SECURED: 'bg-indigo-50 text-indigo-700 border-indigo-200/60',
    TRAVEL_CONFIRMED: 'bg-purple-50 text-purple-700 border-purple-200/60',
    READY_FOR_SEMINAR: 'bg-teal-50 text-teal-700 border-teal-200/60',
    CANCELLED: 'bg-rose-50 text-rose-700 border-rose-200/60',
    OVERDUE: 'bg-rose-50 text-rose-700 border-rose-200/60',
  }

  const isOverdue = isSeminarOverdueLocked(seminar)

  return (
    <tr
      onClick={onClick}
      className={`cursor-pointer transition border-b border-slate-100 ${
        isOverdue
          ? 'bg-rose-50/40 hover:bg-rose-100/50'
          : 'hover:bg-[#F0FFFC]'
      }`}
    >
      <td className={tableCellClass}>
        <div className="flex items-center gap-2">
          {isOverdue && (
            <AlertTriangle className="h-5 w-5 text-rose-600 shrink-0 animate-pulse" />
          )}
          <p className="max-w-[260px] font-extrabold leading-6 text-[#0B3970]">
            {seminar.seminarName}
          </p>
        </div>
      </td>
      <td className={tableCellClass}>
        <SeminarTypeBadge seminar={seminar} />
      </td>
      <td className={`${tableCellClass} text-sm font-semibold text-slate-600`}>
        {seminar.consultantFullName}
      </td>
      <td className={`${tableCellClass} text-sm font-semibold text-slate-600`}>
        {seminar.city}
      </td>
      <td className={`${tableCellClass} text-sm font-bold text-[#18395F]`}>
        {formatDateRange(seminar.startDate, seminar.endDate)}
      </td>
      <td className={`${tableCellClass} text-right text-sm font-extrabold text-[#0B3970]`}>
        {seminar.anticipatedRegistrants}
      </td>
      <td className={`${tableCellClass} text-sm font-semibold text-slate-600`}>
        <span className={seminar.status === 'OVERDUE' ? 'font-black text-rose-700' : ''}>
          {seminar.coordinatorFullName || (
            <span className="font-bold text-amber-600">Chưa nhận</span>
          )}
        </span>
        {seminar.status === 'OVERDUE' && (
          <p className="mt-1 text-[10px] font-black uppercase tracking-wide text-rose-500">
            Phụ trách quá hạn
          </p>
        )}
      </td>
      <td className={`${tableCellClass} text-center`}>
        <span className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-black tracking-wide uppercase ${seminarStatusStyle(seminar, statusStyles)}`}>
          {seminarStatusLabel(seminar, statusLabels)}
        </span>
      </td>
      {user?.role === 'LOGISTICS_COORDINATOR' && (
        <td className={`${tableCellClass} text-center`} onClick={(e) => e.stopPropagation()}>
          {seminar.coordinatorId === null && seminar.status === 'PENDING_LOGISTICS' && !isSeminarOverdueLocked(seminar) ? (
            <button
              onClick={() => onClaim(seminar.id)}
              className="px-3.5 py-1.5 text-[11px] font-black uppercase text-white bg-[#0B3970] rounded-xl hover:bg-[#18395F] transition shadow-md shadow-slate-900/10 cursor-pointer"
            >
              Nhận việc
            </button>
          ) : (
            <span className="text-[11px] text-slate-400 font-bold">--</span>
          )}
        </td>
      )}
    </tr>
  )
}

function SeminarTypeBadge({ seminar }: { seminar: SeminarResponse }) {
  const className = badgeClassByTypeId[seminar.seminarTypeId] ?? badgeFallbackClass

  return (
    <span
      className={`inline-flex max-w-[220px] rounded-full px-3 py-1.5 text-xs font-extrabold leading-5 ${className}`}
    >
      {seminar.seminarTypeName}
    </span>
  )
}

const badgeFallbackClass = 'bg-slate-100 text-slate-600'

const badgeClassByTypeId: Record<number, string> = {
  1: 'bg-[#E8F5FF] text-[#126CB0]',
  2: 'bg-[#FFF4DE] text-[#B66B00]',
  3: 'bg-[#5DF8D8]/20 text-[#093C5D]',
  4: 'bg-[#F1ECFF] text-[#6A4BC3]',
  5: 'bg-[#FFF0F3] text-[#B83A57]',
}

function EmptyState() {
  return (
    <div className="grid place-items-center px-6 py-16 text-center">
      <div className="grid h-16 w-16 place-items-center rounded-full bg-slate-100 text-slate-400">
        <Inbox className="h-8 w-8" />
      </div>
      <h3 className="mt-4 text-lg font-extrabold text-[#092F5A]">
        Không tìm thấy seminar nào
      </h3>
      <p className="mt-2 text-sm text-slate-500">
        Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm.
      </p>
    </div>
  )
}

type PaginationProps = {
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
}

function Pagination({ currentPage, totalPages, onPageChange }: PaginationProps) {
  const pageNumbers = Array.from({ length: totalPages }, (_, index) => index + 1)
  const isFirstPage = currentPage === 1
  const isLastPage = currentPage === totalPages

  return (
    <div className="flex flex-col gap-3 border-t border-slate-200 px-5 py-4 md:flex-row md:items-center md:justify-end">
      <div className="flex flex-wrap items-center gap-2">
        <PaginationButton
          ariaLabel="Trang đầu"
          disabled={isFirstPage}
          onClick={() => onPageChange(1)}
        >
          <ChevronsLeft className="h-4 w-4" />
        </PaginationButton>
        <PaginationButton
          ariaLabel="Trang trước"
          disabled={isFirstPage}
          onClick={() => onPageChange(currentPage - 1)}
        >
          <ChevronLeft className="h-4 w-4" />
        </PaginationButton>
        {pageNumbers.map((pageNumber) => (
          <button
            key={pageNumber}
            type="button"
            onClick={() => onPageChange(pageNumber)}
            className={`grid h-9 min-w-9 place-items-center rounded-lg px-3 text-sm font-extrabold transition ${
              pageNumber === currentPage
                ? 'bg-[#5DF8D8] text-[#093C5D] shadow-md shadow-teal-200/60'
                : 'border border-slate-200 bg-white text-slate-600 hover:border-[#5DF8D8] hover:text-[#3B7597]'
            }`}
          >
            {pageNumber}
          </button>
        ))}
        <PaginationButton
          ariaLabel="Trang sau"
          disabled={isLastPage}
          onClick={() => onPageChange(currentPage + 1)}
        >
          <ChevronRight className="h-4 w-4" />
        </PaginationButton>
        <PaginationButton
          ariaLabel="Trang cuối"
          disabled={isLastPage}
          onClick={() => onPageChange(totalPages)}
        >
          <ChevronsRight className="h-4 w-4" />
        </PaginationButton>
      </div>
    </div>
  )
}

type PaginationButtonProps = {
  ariaLabel: string
  disabled: boolean
  onClick: () => void
  children: React.ReactNode
}

function PaginationButton({
  ariaLabel,
  disabled,
  onClick,
  children,
}: PaginationButtonProps) {
  return (
    <button
      type="button"
      aria-label={ariaLabel}
      disabled={disabled}
      onClick={onClick}
      className={iconButtonClass}
    >
      {children}
    </button>
  )
}

function matchesFilters(seminar: SeminarResponse, filters: FilterState) {
  const searchTerm = normalizeText(filters.searchTerm)

  return (
    (!searchTerm || normalizeText(seminar.seminarName).includes(searchTerm)) &&
    (!filters.seminarTypeId ||
      String(seminar.seminarTypeId) === filters.seminarTypeId) &&
    (!filters.status || seminar.status === filters.status) &&
    (!filters.city || seminar.city === filters.city) &&
    (!filters.seminarDateFrom ||
      seminar.startDate >= filters.seminarDateFrom) &&
    (!filters.seminarDateTo || seminar.endDate <= filters.seminarDateTo)
  )
}

function scopeSeminarsForRole(rows: SeminarResponse[], role?: UserRole) {
  if (role === 'ADMIN') {
    return rows
  }

  return rows.filter((seminar) => FINAL_SEMINAR_STATUSES.includes(seminar.status))
}

function matchesCoordinatorScope(
  seminar: SeminarResponse,
  scope: CoordinatorScope,
  currentUserId?: number,
) {
  if (scope === 'MINE') {
    return seminar.coordinatorId === currentUserId
  }

  if (scope === 'UNASSIGNED') {
    return seminar.coordinatorId === null && seminar.status === 'PENDING_LOGISTICS'
  }

  return true
}

function normalizeText(value: string) {
  return value.trim().toLocaleLowerCase('vi-VN')
}

function formatDateRange(startDate: string, endDate: string) {
  return `${formatDate(startDate)} - ${formatDate(endDate)}`
}

function formatDate(isoDate: string) {
  if (!isoDate) return ''
  const [year, month, day] = isoDate.split('-')
  return `${day}/${month}/${year}`
}



function makeUniqueOptions<
  ValueKey extends keyof SeminarResponse,
  LabelKey extends keyof SeminarResponse,
>(
  rows: SeminarResponse[],
  valueKey: ValueKey,
  labelKey: LabelKey,
  defaultOption: { value: string; label: string },
) {
  const options = new Map<string, string>()

  rows.forEach((row) => {
    options.set(String(row[valueKey]), String(row[labelKey]))
  })

  return [
    defaultOption,
    ...Array.from(options, ([value, label]) => ({ value, label })),
  ]
}

function makeCityOptions(rows: SeminarResponse[], defaultOption: { value: string; label: string }) {
  const cities = Array.from(new Set(rows.map((seminar) => seminar.city)))

  return [
    defaultOption,
    ...cities.map((city) => ({
      value: city,
      label: city,
    })),
  ]
}
