import {
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Inbox,
  ListChecks,
} from 'lucide-react'
import { useMemo, useState, type FormEvent, type ReactNode } from 'react'
import {
  FilterDateRange,
  FilterPanel,
  FilterSelect,
  FilterTextInput,
} from '../components/filter/FilterPanel'
import { PageHeader } from '../components/layout/PageHeader'
import { Sidebar } from '../components/layout/Sidebar'
import { TopNavbar } from '../components/layout/TopNavbar'
import { mockSeminars } from '../data/mockSeminars'
import type { SelectOption, SeminarResponse } from '../types'

const PAGE_SIZE = 5

// TODO: Replace mock data with GET /api/seminars when backend endpoint is ready.
const seminarRows = mockSeminars

const cardClass =
  'rounded-2xl border border-slate-200 bg-white shadow-xl shadow-slate-200/70'
const tableCellClass = 'px-4 py-4 lg:px-5'
const iconButtonClass =
  'grid h-9 w-9 place-items-center rounded-lg border border-slate-200 bg-white text-slate-600 transition hover:border-[#5DF8D8] hover:text-[#3B7597] disabled:cursor-not-allowed disabled:border-slate-100 disabled:bg-slate-50 disabled:text-slate-300'

type FilterState = {
  searchTerm: string
  seminarTypeId: string
  consultantId: string
  employeeId: string
  city: string
  seminarDateFrom: string
  seminarDateTo: string
  bookingDateFrom: string
  bookingDateTo: string
}

const defaultFilters: FilterState = {
  searchTerm: '',
  seminarTypeId: '',
  consultantId: '',
  employeeId: '',
  city: '',
  seminarDateFrom: '',
  seminarDateTo: '',
  bookingDateFrom: '',
  bookingDateTo: '',
}

export function SeminarListPage() {
  const [filters, setFilters] = useState<FilterState>(defaultFilters)
  const [page, setPage] = useState(1)

  const seminarTypeOptions = useMemo(
    () =>
      makeUniqueOptions(seminarRows, 'seminarTypeId', 'seminarTypeName', {
        value: '',
        label: 'Tất cả loại seminar',
      }),
    [],
  )
  const consultantOptions = useMemo(
    () =>
      makeUniqueOptions(seminarRows, 'consultantId', 'consultantFullName', {
        value: '',
        label: 'Tất cả chuyên gia',
      }),
    [],
  )
  const employeeOptions = useMemo(
    () =>
      makeEmployeeOptions(seminarRows, {
        value: '',
        label: 'Tất cả nhân viên',
      }),
    [],
  )
  const cityOptions = useMemo(
    () => makeCityOptions(seminarRows, { value: '', label: 'Tất cả thành phố' }),
    [],
  )

  const filteredSeminars = useMemo(
    () => seminarRows.filter((seminar) => matchesFilters(seminar, filters)),
    [filters],
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

  return (
    <div className="min-h-screen bg-[#F5FAFF] font-sans text-[#18395F]">
      <Sidebar activeChild="Danh sách seminar" />
      <div className="lg:pl-[270px]">
        <TopNavbar />
        <main className="relative overflow-hidden px-6 py-8 md:px-8 lg:px-6 xl:px-8">
          <div className="pointer-events-none absolute -right-36 top-11 h-100 w-100 rounded-full bg-[#5DF8D8]/35 blur-sm" />
          <div className="relative mx-auto max-w-[1220px] space-y-7">
            <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
              <PageHeader
                title="Danh sách seminar"
                description="Theo dõi, tìm kiếm và quản lý các seminar đã tạo"
                icon={<ListChecks className="h-10 w-10" strokeWidth={2.4} />}
              />
            </div>

            <FilterPanel
              title="Bộ lọc seminar"
              onSubmit={handleSearch}
              onReset={resetFilters}
            >
              <FilterTextInput
                id="searchTerm"
                label="Tên seminar"
                placeholder="Tìm theo tên seminar"
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
                id="consultantId"
                label="Chuyên gia đào tạo"
                options={consultantOptions}
                value={filters.consultantId}
                onChange={(value) => updateFilter('consultantId', value)}
              />
              <FilterSelect
                id="employeeId"
                label="Nhân viên phụ trách"
                options={employeeOptions}
                value={filters.employeeId}
                onChange={(value) => updateFilter('employeeId', value)}
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
                  label="Ngày tổ chức seminar"
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
                <FilterDateRange
                  label="Ngày tạo booking"
                  start={{
                    id: 'bookingDateFrom',
                    label: 'Từ ngày',
                    value: filters.bookingDateFrom,
                    onChange: (value) => updateFilter('bookingDateFrom', value),
                  }}
                  end={{
                    id: 'bookingDateTo',
                    label: 'Đến ngày',
                    value: filters.bookingDateTo,
                    onChange: (value) => updateFilter('bookingDateTo', value),
                  }}
                />
              </div>
            </FilterPanel>

            <section className={`${cardClass} overflow-hidden`}>
              <div className="flex flex-col gap-3 border-b border-slate-200 px-5 py-5 md:flex-row md:items-center md:justify-between">
                <div>
                  <h2 className="text-lg font-extrabold text-[#092F5A]">
                    Danh sách booking seminar
                  </h2>
                  <p className="mt-1 text-sm text-slate-500">
                    Hiển thị {visibleStart} đến {visibleEnd} trong{' '}
                    {filteredSeminars.length} kết quả
                  </p>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full min-w-[1040px] border-collapse text-left">
                  <thead className="bg-[#F5FAFF] text-xs font-extrabold uppercase tracking-wide text-slate-500">
                    <tr>
                      <SortableHeader label="Tên seminar" />
                      <th className={tableCellClass}>Loại seminar</th>
                      <th className={tableCellClass}>Chuyên gia đào tạo</th>
                      <th className={tableCellClass}>Nhân viên phụ trách</th>
                      <th className={tableCellClass}>Thành phố</th>
                      <th className={tableCellClass}>Thời gian tổ chức</th>
                      <th className={`${tableCellClass} text-right`}>
                        Số HV dự kiến
                      </th>
                      <SortableHeader label="Ngày tạo booking" align="right" />
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {pagedSeminars.length > 0 ? (
                      pagedSeminars.map((seminar) => (
                        <SeminarRow key={seminar.id} seminar={seminar} />
                      ))
                    ) : (
                      <tr>
                        <td colSpan={8}>
                          <EmptyState />
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              <Pagination
                currentPage={currentPage}
                onPageChange={goToPage}
                totalPages={totalPages}
              />
            </section>
          </div>
        </main>
      </div>
    </div>
  )
}

type SortableHeaderProps = {
  label: string
  align?: 'left' | 'right'
}

function SortableHeader({ label, align = 'left' }: SortableHeaderProps) {
  return (
    <th className={`${tableCellClass} ${align === 'right' ? 'text-right' : ''}`}>
      <span
        className={`inline-flex items-center gap-1.5 ${
          align === 'right' ? 'justify-end' : ''
        }`}
      >
        {label}
        <ArrowUpDown className="h-3.5 w-3.5 text-slate-400" />
      </span>
    </th>
  )
}

type SeminarRowProps = {
  seminar: SeminarResponse
}

function SeminarRow({ seminar }: SeminarRowProps) {
  return (
    <tr className="cursor-pointer transition hover:bg-[#F0FFFC]">
      <td className={tableCellClass}>
        <p className="max-w-[260px] font-extrabold leading-6 text-[#0B3970]">
          {seminar.seminarName}
        </p>
      </td>
      <td className={tableCellClass}>
        <SeminarTypeBadge seminar={seminar} />
      </td>
      <td className={`${tableCellClass} text-sm font-semibold text-slate-600`}>
        {seminar.consultantFullName}
      </td>
      <td className={tableCellClass}>
        {seminar.employeeFullName ? (
          <span className="text-sm font-semibold text-slate-600">
            {seminar.employeeFullName}
          </span>
        ) : (
          <span className="inline-flex rounded-full bg-slate-100 px-3 py-1.5 text-xs font-bold text-slate-500">
            Chưa có người phụ trách
          </span>
        )}
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
      <td className={`${tableCellClass} text-right text-sm font-semibold text-slate-600`}>
        {formatDate(seminar.bookingCreatedDate)}
      </td>
    </tr>
  )
}

function SeminarTypeBadge({ seminar }: SeminarRowProps) {
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
        Không tìm thấy seminar
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
  children: ReactNode
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
    (!filters.consultantId ||
      String(seminar.consultantId) === filters.consultantId) &&
    (!filters.employeeId || String(seminar.employeeId) === filters.employeeId) &&
    (!filters.city || seminar.city === filters.city) &&
    (!filters.seminarDateFrom ||
      seminar.startDate >= filters.seminarDateFrom) &&
    (!filters.seminarDateTo || seminar.endDate <= filters.seminarDateTo) &&
    (!filters.bookingDateFrom ||
      seminar.bookingCreatedDate >= filters.bookingDateFrom) &&
    (!filters.bookingDateTo ||
      seminar.bookingCreatedDate <= filters.bookingDateTo)
  )
}

function normalizeText(value: string) {
  return value.trim().toLocaleLowerCase('vi-VN')
}

function formatDateRange(startDate: string, endDate: string) {
  return `${formatDate(startDate)} - ${formatDate(endDate)}`
}

function formatDate(isoDate: string) {
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
  defaultOption: SelectOption,
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

function makeEmployeeOptions(
  rows: SeminarResponse[],
  defaultOption: SelectOption,
) {
  const options = new Map<string, string>()

  rows.forEach((row) => {
    if (row.employeeId && row.employeeFullName) {
      options.set(String(row.employeeId), row.employeeFullName)
    }
  })

  return [
    defaultOption,
    ...Array.from(options, ([value, label]) => ({ value, label })),
  ]
}

function makeCityOptions(rows: SeminarResponse[], defaultOption: SelectOption) {
  const cities = Array.from(new Set(rows.map((seminar) => seminar.city)))

  return [
    defaultOption,
    ...cities.map((city) => ({
      value: city,
      label: city,
    })),
  ]
}
