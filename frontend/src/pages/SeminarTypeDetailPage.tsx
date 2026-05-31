import { ClipboardList, ListChecks, MonitorCog, Package, Plus } from 'lucide-react'
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
import {
  mockAvEquipmentRequirements,
  mockMaterialRequirements,
  mockSeminarTypes,
} from '../data/mockMasterData'
import type {
  AvEquipmentRequirementResponse,
  MaterialRequirementResponse,
  SeminarTypeResponse,
} from '../types'

// TODO: Replace mockSeminarTypeDetail with GET /api/master-data/seminar-types/{seminarTypeId}
const mockSeminarTypeDetail = mockSeminarTypes[0]

export function SeminarTypeDetailPage() {
  const seminarType = mockSeminarTypeDetail
  const [materialSearchTerm, setMaterialSearchTerm] = useState('')
  const [equipmentSearchTerm, setEquipmentSearchTerm] = useState('')

  const materialRequirements = useMemo(
    () =>
      mockMaterialRequirements.filter(
        (requirement) =>
          requirement.seminarTypeId === seminarType.id &&
          matchesMaterialRequirementSearch(requirement, materialSearchTerm),
      ),
    [materialSearchTerm, seminarType.id],
  )
  const equipmentRequirements = useMemo(
    () =>
      mockAvEquipmentRequirements.filter(
        (requirement) =>
          requirement.seminarTypeId === seminarType.id &&
          matchesEquipmentRequirementSearch(requirement, equipmentSearchTerm),
      ),
    [equipmentSearchTerm, seminarType.id],
  )

  const materialPagination = useMasterDataPagination(materialRequirements)
  const equipmentPagination = useMasterDataPagination(equipmentRequirements)

  function updateMaterialSearch(value: string) {
    setMaterialSearchTerm(value)
    materialPagination.resetToFirstPage()
  }

  function updateEquipmentSearch(value: string) {
    setEquipmentSearchTerm(value)
    equipmentPagination.resetToFirstPage()
  }

  function handleCreateMaterialRequirement() {
    // TODO: Navigate to material requirement creation route when it is available.
  }

  function handleCreateEquipmentRequirement() {
    // TODO: Navigate to AV equipment requirement creation route when it is available.
  }

  return (
    <MasterDataPageLayout
      title="Chi tiết loại seminar"
      description="Theo dõi cấu hình vật tư và thiết bị nghe nhìn cần chuẩn bị"
      icon={<ListChecks className="h-10 w-10" strokeWidth={2.4} />}
    >
      <SeminarTypeSummaryCard seminarType={seminarType} />

      <MasterDataTableCard
        title="Yêu cầu vật tư"
        visibleStart={materialPagination.visibleStart}
        visibleEnd={materialPagination.visibleEnd}
        totalItems={materialRequirements.length}
        searchLabel="Tìm kiếm yêu cầu vật tư"
        searchPlaceholder="Tìm vật tư"
        searchTerm={materialSearchTerm}
        createLabel="Thêm vật tư"
        minTableWidthClass="min-w-[1120px]"
        currentPage={materialPagination.currentPage}
        totalPages={materialPagination.totalPages}
        onSearchChange={updateMaterialSearch}
        onCreate={handleCreateMaterialRequirement}
        onPageChange={materialPagination.goToPage}
      >
        <thead className="bg-[#F5FAFF] text-xs font-extrabold uppercase tracking-wide text-slate-500">
          <tr>
            <MasterDataSortableHeader label="Tên vật tư" />
            <th className={masterDataTableCellClass}>Loại</th>
            <th className={`${masterDataTableCellClass} text-right`}>
              SL mặc định
            </th>
            <th className={masterDataTableCellClass}>Theo học viên</th>
            <th className={masterDataTableCellClass}>Đơn vị</th>
            <th className={masterDataTableCellClass}>Ghi chú</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {materialPagination.pagedItems.length > 0 ? (
            materialPagination.pagedItems.map((requirement) => (
              <MaterialRequirementRow
                key={requirement.materialId}
                requirement={requirement}
              />
            ))
          ) : (
            <tr>
              <td colSpan={6}>
                <MasterDataEmptyState resourceName="yêu cầu vật tư" />
              </td>
            </tr>
          )}
        </tbody>
      </MasterDataTableCard>

      <MasterDataTableCard
        title="Yêu cầu thiết bị nghe nhìn"
        visibleStart={equipmentPagination.visibleStart}
        visibleEnd={equipmentPagination.visibleEnd}
        totalItems={equipmentRequirements.length}
        searchLabel="Tìm kiếm yêu cầu thiết bị"
        searchPlaceholder="Tìm thiết bị"
        searchTerm={equipmentSearchTerm}
        createLabel="Thêm thiết bị"
        minTableWidthClass="min-w-[980px]"
        currentPage={equipmentPagination.currentPage}
        totalPages={equipmentPagination.totalPages}
        onSearchChange={updateEquipmentSearch}
        onCreate={handleCreateEquipmentRequirement}
        onPageChange={equipmentPagination.goToPage}
      >
        <thead className="bg-[#F5FAFF] text-xs font-extrabold uppercase tracking-wide text-slate-500">
          <tr>
            <MasterDataSortableHeader label="Tên thiết bị" />
            <th className={masterDataTableCellClass}>Loại</th>
            <th className={`${masterDataTableCellClass} text-right`}>
              Số lượng
            </th>
            <th className={masterDataTableCellClass}>Theo học viên</th>
            <th className={masterDataTableCellClass}>Đơn vị</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {equipmentPagination.pagedItems.length > 0 ? (
            equipmentPagination.pagedItems.map((requirement) => (
              <EquipmentRequirementRow
                key={requirement.equipmentId}
                requirement={requirement}
              />
            ))
          ) : (
            <tr>
              <td colSpan={5}>
                <MasterDataEmptyState resourceName="yêu cầu thiết bị" />
              </td>
            </tr>
          )}
        </tbody>
      </MasterDataTableCard>
    </MasterDataPageLayout>
  )
}

function SeminarTypeSummaryCard({
  seminarType,
}: {
  seminarType: SeminarTypeResponse
}) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white shadow-xl shadow-slate-200/70">
      <div className="flex flex-col gap-5 px-6 py-6 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex gap-4">
          <div className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-[#E8FFFB] text-[#093C5D]">
            <ClipboardList className="h-7 w-7" strokeWidth={2.4} />
          </div>
          <div>
            <p className="text-sm font-extrabold uppercase tracking-wide text-slate-400">
              Loại seminar
            </p>
            <h2 className="mt-1 text-2xl font-extrabold text-[#092F5A]">
              {seminarType.typeName}
            </h2>
            <p className="mt-2 max-w-3xl text-sm font-semibold leading-6 text-slate-600">
              {seminarType.description || 'Chưa có mô tả'}
            </p>
          </div>
        </div>
        <button
          type="button"
          className={`${masterDataModifyButtonClass} shrink-0`}
        >
          <Plus className="h-4 w-4" />
          Cập nhật thông tin
        </button>
      </div>
      <div className="grid gap-4 border-t border-slate-100 px-6 py-5 md:grid-cols-3">
        <SummaryMetric
          label="Thời lượng"
          value={`${seminarType.durationHours} giờ`}
        />
        <SummaryMetric
          label="Yêu cầu vật tư"
          value={`${mockMaterialRequirements.length} mục`}
          icon={<Package className="h-5 w-5" />}
        />
        <SummaryMetric
          label="Yêu cầu thiết bị"
          value={`${mockAvEquipmentRequirements.length} mục`}
          icon={<MonitorCog className="h-5 w-5" />}
        />
      </div>
      <div className="border-t border-slate-100 px-6 py-5">
        <p className="text-xs font-extrabold uppercase tracking-wide text-slate-400">
          Ghi chú sắp xếp
        </p>
        <p className="mt-2 text-sm font-semibold leading-6 text-slate-600">
          {seminarType.arrangementNotes || 'Chưa có ghi chú'}
        </p>
      </div>
    </section>
  )
}

function SummaryMetric({
  label,
  value,
  icon,
}: {
  label: string
  value: string
  icon?: React.ReactNode
}) {
  return (
    <div className="rounded-2xl border border-slate-100 bg-[#F8FBFF] px-4 py-4">
      <div className="flex items-center gap-2 text-slate-400">
        {icon}
        <p className="text-xs font-extrabold uppercase tracking-wide">{label}</p>
      </div>
      <p className="mt-2 text-lg font-extrabold text-[#0B3970]">{value}</p>
    </div>
  )
}

function MaterialRequirementRow({
  requirement,
}: {
  requirement: MaterialRequirementResponse
}) {
  return (
    <tr className="transition hover:bg-[#F0FFFC]">
      <td className={masterDataTableCellClass}>
        <p className="max-w-[240px] font-extrabold leading-6 text-[#0B3970]">
          {requirement.materialName}
        </p>
      </td>
      <td className={masterDataTableCellClass}>
        <MasterDataTypeBadge label={requirement.materialType} />
      </td>
      <td
        className={`${masterDataTableCellClass} text-right text-sm font-extrabold text-[#0B3970]`}
      >
        {requirement.defaultQuantity}
      </td>
      <td className={`${masterDataTableCellClass} text-sm font-semibold`}>
        <DependencyBadge
          enabled={requirement.dependOnNumParticipant}
          participantPerQuantity={requirement.participantPerQuantity}
        />
      </td>
      <td
        className={`${masterDataTableCellClass} text-sm font-extrabold text-[#0B3970]`}
      >
        {requirement.unit}
      </td>
      <td className={`${masterDataTableCellClass} text-sm font-semibold text-slate-600`}>
        {requirement.notes || 'Chưa có ghi chú'}
      </td>
    </tr>
  )
}

function EquipmentRequirementRow({
  requirement,
}: {
  requirement: AvEquipmentRequirementResponse
}) {
  return (
    <tr className="transition hover:bg-[#F0FFFC]">
      <td className={masterDataTableCellClass}>
        <p className="max-w-[240px] font-extrabold leading-6 text-[#0B3970]">
          {requirement.equipmentName}
        </p>
      </td>
      <td className={masterDataTableCellClass}>
        <MasterDataTypeBadge label={requirement.equipmentType} />
      </td>
      <td
        className={`${masterDataTableCellClass} text-right text-sm font-extrabold text-[#0B3970]`}
      >
        {requirement.quantityRequired}
      </td>
      <td className={`${masterDataTableCellClass} text-sm font-semibold`}>
        <DependencyBadge
          enabled={requirement.dependOnNumParticipant}
          participantPerQuantity={requirement.participantPerQuantity}
        />
      </td>
      <td
        className={`${masterDataTableCellClass} text-sm font-extrabold text-[#0B3970]`}
      >
        {requirement.unit}
      </td>
    </tr>
  )
}

function DependencyBadge({
  enabled,
  participantPerQuantity,
}: {
  enabled: boolean
  participantPerQuantity: number | null
}) {
  if (!enabled) {
    return (
      <span className="inline-flex rounded-full bg-slate-100 px-3 py-1.5 text-xs font-extrabold text-slate-500">
        Không
      </span>
    )
  }

  return (
    <span className="inline-flex rounded-full bg-[#5DF8D8]/20 px-3 py-1.5 text-xs font-extrabold text-[#093C5D]">
      1 / {participantPerQuantity} học viên
    </span>
  )
}

function matchesMaterialRequirementSearch(
  requirement: MaterialRequirementResponse,
  searchTerm: string,
) {
  const normalizedSearchTerm = normalizeText(searchTerm)

  if (!normalizedSearchTerm) {
    return true
  }

  return [
    requirement.materialName,
    requirement.materialType,
    requirement.unit,
    requirement.notes ?? '',
  ].some((value) => normalizeText(value).includes(normalizedSearchTerm))
}

function matchesEquipmentRequirementSearch(
  requirement: AvEquipmentRequirementResponse,
  searchTerm: string,
) {
  const normalizedSearchTerm = normalizeText(searchTerm)

  if (!normalizedSearchTerm) {
    return true
  }

  return [
    requirement.equipmentName,
    requirement.equipmentType,
    requirement.unit,
  ].some((value) => normalizeText(value).includes(normalizedSearchTerm))
}

function normalizeText(value: string) {
  return value.trim().toLocaleLowerCase('vi-VN')
}
