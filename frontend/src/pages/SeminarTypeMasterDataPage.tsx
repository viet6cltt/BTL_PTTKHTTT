import { Eye, ListChecks } from 'lucide-react'
import { useMemo, useState } from 'react'
import { MasterDataEmptyState } from '../components/masterdata/MasterDataEmptyState'
import { MasterDataPageLayout } from '../components/masterdata/MasterDataPageLayout'
import { MasterDataSortableHeader } from '../components/masterdata/MasterDataSortableHeader'
import { MasterDataTableCard } from '../components/masterdata/MasterDataTableCard'
import {
  masterDataModifyButtonClass,
  masterDataTableCellClass,
} from '../components/masterdata/masterDataStyles'
import { useMasterDataPagination } from '../components/masterdata/useMasterDataPagination'
import { mockSeminarTypes } from '../data/mockMasterData'
import type { SeminarTypeResponse } from '../types'

export function SeminarTypeMasterDataPage() {
  const [searchTerm, setSearchTerm] = useState('')

  const filteredSeminarTypes = useMemo(
    () =>
      mockSeminarTypes.filter((seminarType) =>
        matchesSeminarTypeSearch(seminarType, searchTerm),
      ),
    [searchTerm],
  )

  const {
    currentPage,
    totalPages,
    pagedItems: pagedSeminarTypes,
    visibleStart,
    visibleEnd,
    goToPage,
    resetToFirstPage,
  } = useMasterDataPagination(filteredSeminarTypes)

  function updateSearch(value: string) {
    setSearchTerm(value)
    resetToFirstPage()
  }

  function handleCreateSeminarType() {
    // TODO: Navigate to seminar type creation route when it is available.
  }

  function handleModifySeminarType(seminarTypeId: number) {
    void seminarTypeId
    // TODO: Navigate to seminar type detail route when it is available.
  }

  return (
    <MasterDataPageLayout
      title="Quản lý loại seminar"
      description="Theo dõi danh mục loại seminar, thời lượng và ghi chú sắp xếp"
      icon={<ListChecks className="h-10 w-10" strokeWidth={2.4} />}
    >
      <MasterDataTableCard
        title="Danh mục loại seminar"
        visibleStart={visibleStart}
        visibleEnd={visibleEnd}
        totalItems={filteredSeminarTypes.length}
        searchLabel="Tìm kiếm loại seminar"
        searchPlaceholder="Tìm loại seminar"
        searchTerm={searchTerm}
        createLabel="Thêm loại seminar"
        minTableWidthClass="min-w-[1040px]"
        currentPage={currentPage}
        totalPages={totalPages}
        onSearchChange={updateSearch}
        onCreate={handleCreateSeminarType}
        onPageChange={goToPage}
      >
        <thead className="bg-[#F5FAFF] text-xs font-extrabold uppercase tracking-wide text-slate-500">
          <tr>
            <MasterDataSortableHeader label="Tên loại seminar" />
            <th className={masterDataTableCellClass}>Mô tả</th>
            <th className={`${masterDataTableCellClass} text-right`}>
              Thời lượng
            </th>
            <th className={masterDataTableCellClass}>Ghi chú sắp xếp</th>
            <th className={`${masterDataTableCellClass} text-right`}>
              Thao tác
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {pagedSeminarTypes.length > 0 ? (
            pagedSeminarTypes.map((seminarType) => (
              <SeminarTypeRow
                key={seminarType.id}
                seminarType={seminarType}
                onModify={handleModifySeminarType}
              />
            ))
          ) : (
            <tr>
              <td colSpan={5}>
                <MasterDataEmptyState resourceName="loại seminar" />
              </td>
            </tr>
          )}
        </tbody>
      </MasterDataTableCard>
    </MasterDataPageLayout>
  )
}

type SeminarTypeRowProps = {
  seminarType: SeminarTypeResponse
  onModify: (seminarTypeId: number) => void
}

function SeminarTypeRow({ seminarType, onModify }: SeminarTypeRowProps) {
  return (
    <tr className="transition hover:bg-[#F0FFFC]">
      <td className={masterDataTableCellClass}>
        <p className="max-w-[240px] font-extrabold leading-6 text-[#0B3970]">
          {seminarType.typeName}
        </p>
      </td>
      <td
        className={`${masterDataTableCellClass} text-sm font-semibold text-slate-600`}
      >
        {seminarType.description || 'Chưa có mô tả'}
      </td>
      <td
        className={`${masterDataTableCellClass} text-right text-sm font-extrabold text-[#0B3970]`}
      >
        {seminarType.durationHours} giờ
      </td>
      <td
        className={`${masterDataTableCellClass} text-sm font-semibold text-slate-600`}
      >
        {seminarType.arrangementNotes || 'Chưa có ghi chú'}
      </td>
      <td className={`${masterDataTableCellClass} text-right`}>
        <button
          type="button"
          onClick={() => onModify(seminarType.id)}
          className={masterDataModifyButtonClass}
        >
          <Eye className="h-4 w-4" />
          Xem
        </button>
      </td>
    </tr>
  )
}

function matchesSeminarTypeSearch(
  seminarType: SeminarTypeResponse,
  searchTerm: string,
) {
  const normalizedSearchTerm = normalizeText(searchTerm)

  if (!normalizedSearchTerm) {
    return true
  }

  return [
    seminarType.typeName,
    seminarType.description ?? '',
    String(seminarType.durationHours),
    seminarType.arrangementNotes ?? '',
  ].some((value) => normalizeText(value).includes(normalizedSearchTerm))
}

function normalizeText(value: string) {
  return value.trim().toLocaleLowerCase('vi-VN')
}
