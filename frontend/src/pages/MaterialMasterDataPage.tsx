import { Eye, Package } from 'lucide-react'
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
import { mockMaterials } from '../data/mockMasterData'
import type { MaterialResponse } from '../types'

export function MaterialMasterDataPage() {
  const [searchTerm, setSearchTerm] = useState('')

  const filteredMaterials = useMemo(
    () =>
      mockMaterials.filter((material) =>
        matchesMaterialSearch(material, searchTerm),
      ),
    [searchTerm],
  )

  const {
    currentPage,
    totalPages,
    pagedItems: pagedMaterials,
    visibleStart,
    visibleEnd,
    goToPage,
    resetToFirstPage,
  } = useMasterDataPagination(filteredMaterials)

  function updateSearch(value: string) {
    setSearchTerm(value)
    resetToFirstPage()
  }

  function handleCreateMaterial() {
    // TODO: Navigate to material creation route when it is available.
  }

  function handleModifyMaterial(materialId: number) {
    void materialId
    // TODO: Navigate to material detail route when it is available.
  }

  return (
    <MasterDataPageLayout
      activeChild="Vật tư"
      title="Quản lý vật tư"
      description="Theo dõi danh mục vật tư dùng cho yêu cầu chuẩn bị seminar"
      icon={<Package className="h-10 w-10" strokeWidth={2.4} />}
    >
      <MasterDataTableCard
        title="Danh mục vật tư"
        visibleStart={visibleStart}
        visibleEnd={visibleEnd}
        totalItems={filteredMaterials.length}
        searchLabel="Tìm kiếm vật tư"
        searchPlaceholder="Tìm vật tư"
        searchTerm={searchTerm}
        createLabel="Thêm vật tư"
        minTableWidthClass="min-w-[940px]"
        currentPage={currentPage}
        totalPages={totalPages}
        onSearchChange={updateSearch}
        onCreate={handleCreateMaterial}
        onPageChange={goToPage}
      >
        <thead className="bg-[#F5FAFF] text-xs font-extrabold uppercase tracking-wide text-slate-500">
          <tr>
            <MasterDataSortableHeader label="Tên vật tư" />
            <th className={masterDataTableCellClass}>Loại vật tư</th>
            <th className={masterDataTableCellClass}>Mô tả</th>
            <th className={masterDataTableCellClass}>Đơn vị</th>
            <th className={`${masterDataTableCellClass} text-right`}>
              Thao tác
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {pagedMaterials.length > 0 ? (
            pagedMaterials.map((material) => (
              <MaterialRow
                key={material.id}
                material={material}
                onModify={handleModifyMaterial}
              />
            ))
          ) : (
            <tr>
              <td colSpan={5}>
                <MasterDataEmptyState resourceName="vật tư" />
              </td>
            </tr>
          )}
        </tbody>
      </MasterDataTableCard>
    </MasterDataPageLayout>
  )
}

type MaterialRowProps = {
  material: MaterialResponse
  onModify: (materialId: number) => void
}

function MaterialRow({ material, onModify }: MaterialRowProps) {
  return (
    <tr className="transition hover:bg-[#F0FFFC]">
      <td className={masterDataTableCellClass}>
        <p className="max-w-[260px] font-extrabold leading-6 text-[#0B3970]">
          {material.materialName}
        </p>
      </td>
      <td className={masterDataTableCellClass}>
        <MasterDataTypeBadge label={material.materialType} />
      </td>
      <td
        className={`${masterDataTableCellClass} text-sm font-semibold text-slate-600`}
      >
        {material.description || 'Chưa có mô tả'}
      </td>
      <td
        className={`${masterDataTableCellClass} text-sm font-extrabold text-[#0B3970]`}
      >
        {material.unit}
      </td>
      <td className={`${masterDataTableCellClass} text-right`}>
        <button
          type="button"
          onClick={() => onModify(material.id)}
          className={masterDataModifyButtonClass}
        >
          <Eye className="h-4 w-4" />
          Xem
        </button>
      </td>
    </tr>
  )
}

function matchesMaterialSearch(
  material: MaterialResponse,
  searchTerm: string,
) {
  const normalizedSearchTerm = normalizeText(searchTerm)

  if (!normalizedSearchTerm) {
    return true
  }

  return [
    material.materialName,
    material.materialType,
    material.description ?? '',
    material.unit,
  ].some((value) => normalizeText(value).includes(normalizedSearchTerm))
}

function normalizeText(value: string) {
  return value.trim().toLocaleLowerCase('vi-VN')
}
