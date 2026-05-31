import { Eye, MonitorCog } from 'lucide-react'
import { useMemo, useState } from 'react'
import { MasterDataEmptyState } from '../components/masterdata/MasterDataEmptyState'
import { MasterDataPageLayout } from '../components/masterdata/MasterDataPageLayout'
import { MasterDataSortableHeader } from '../components/masterdata/MasterDataSortableHeader'
import { MasterDataTableCard } from '../components/masterdata/MasterDataTableCard'
import { MasterDataTypeBadge } from '../components/masterdata/MasterDataTypeBadge'
import {
  masterDataModifyButtonClass,
  masterDataTableCellClass,
} from '../components/masterdata/masterDataStyles'
import { useMasterDataPagination } from '../components/masterdata/useMasterDataPagination'
import { mockAudioVisualEquipments } from '../data/mockMasterData'
import type { AudioVisualEquipmentResponse } from '../types'

export function AvEquipmentMasterDataPage() {
  const [searchTerm, setSearchTerm] = useState('')

  const filteredEquipments = useMemo(
    () =>
      mockAudioVisualEquipments.filter((equipment) =>
        matchesEquipmentSearch(equipment, searchTerm),
      ),
    [searchTerm],
  )

  const {
    currentPage,
    totalPages,
    pagedItems: pagedEquipments,
    visibleStart,
    visibleEnd,
    goToPage,
    resetToFirstPage,
  } = useMasterDataPagination(filteredEquipments)

  function updateSearch(value: string) {
    setSearchTerm(value)
    resetToFirstPage()
  }

  function handleCreateEquipment() {
    // TODO: Navigate to AV equipment creation route when it is available.
  }

  function handleModifyEquipment(equipmentId: number) {
    void equipmentId
    // TODO: Navigate to AV equipment detail route when it is available.
  }

  return (
    <MasterDataPageLayout
      activeChild="Thiết bị nghe nhìn"
      title="Quản lý thiết bị nghe nhìn"
      description="Theo dõi danh mục thiết bị phục vụ phòng seminar"
      icon={<MonitorCog className="h-10 w-10" strokeWidth={2.4} />}
    >
      <MasterDataTableCard
        title="Danh mục thiết bị nghe nhìn"
        visibleStart={visibleStart}
        visibleEnd={visibleEnd}
        totalItems={filteredEquipments.length}
        searchLabel="Tìm kiếm thiết bị"
        searchPlaceholder="Tìm thiết bị"
        searchTerm={searchTerm}
        createLabel="Thêm thiết bị"
        minTableWidthClass="min-w-[820px]"
        currentPage={currentPage}
        totalPages={totalPages}
        onSearchChange={updateSearch}
        onCreate={handleCreateEquipment}
        onPageChange={goToPage}
      >
        <thead className="bg-[#F5FAFF] text-xs font-extrabold uppercase tracking-wide text-slate-500">
          <tr>
            <MasterDataSortableHeader label="Tên thiết bị" />
            <th className={masterDataTableCellClass}>Loại thiết bị</th>
            <th className={masterDataTableCellClass}>Đơn vị</th>
            <th className={`${masterDataTableCellClass} text-right`}>
              Thao tác
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {pagedEquipments.length > 0 ? (
            pagedEquipments.map((equipment) => (
              <EquipmentRow
                key={equipment.id}
                equipment={equipment}
                onModify={handleModifyEquipment}
              />
            ))
          ) : (
            <tr>
              <td colSpan={4}>
                <MasterDataEmptyState resourceName="thiết bị" />
              </td>
            </tr>
          )}
        </tbody>
      </MasterDataTableCard>
    </MasterDataPageLayout>
  )
}

type EquipmentRowProps = {
  equipment: AudioVisualEquipmentResponse
  onModify: (equipmentId: number) => void
}

function EquipmentRow({ equipment, onModify }: EquipmentRowProps) {
  return (
    <tr className="transition hover:bg-[#F0FFFC]">
      <td className={masterDataTableCellClass}>
        <p className="max-w-[260px] font-extrabold leading-6 text-[#0B3970]">
          {equipment.equipmentName}
        </p>
      </td>
      <td className={masterDataTableCellClass}>
        <MasterDataTypeBadge label={equipment.equipmentType} />
      </td>
      <td
        className={`${masterDataTableCellClass} text-sm font-extrabold text-[#0B3970]`}
      >
        {equipment.unit}
      </td>
      <td className={`${masterDataTableCellClass} text-right`}>
        <button
          type="button"
          onClick={() => onModify(equipment.id)}
          className={masterDataModifyButtonClass}
        >
          <Eye className="h-4 w-4" />
          Xem
        </button>
      </td>
    </tr>
  )
}

function matchesEquipmentSearch(
  equipment: AudioVisualEquipmentResponse,
  searchTerm: string,
) {
  const normalizedSearchTerm = normalizeText(searchTerm)

  if (!normalizedSearchTerm) {
    return true
  }

  return [
    equipment.equipmentName,
    equipment.equipmentType,
    equipment.unit,
  ].some((value) => normalizeText(value).includes(normalizedSearchTerm))
}

function normalizeText(value: string) {
  return value.trim().toLocaleLowerCase('vi-VN')
}
