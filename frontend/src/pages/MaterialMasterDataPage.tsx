import { Package, Pencil, Trash2, X } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import {
  api,
  type MaterialRequest,
  type MaterialResponse,
} from '../api'
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

type MaterialMasterDataPageProps = {
  canModifyMasterData: boolean
}

type MaterialFormState = {
  materialName: string
  materialType: string
  description: string
  unit: string
}

const emptyMaterialForm: MaterialFormState = {
  materialName: '',
  materialType: '',
  description: '',
  unit: '',
}

export function MaterialMasterDataPage({ canModifyMasterData }: MaterialMasterDataPageProps) {
  const [materials, setMaterials] = useState<MaterialResponse[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [pageError, setPageError] = useState<string | null>(null)
  const [formError, setFormError] = useState<string | null>(null)
  const [deleteError, setDeleteError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formState, setFormState] = useState<MaterialFormState>(emptyMaterialForm)
  const [editingMaterial, setEditingMaterial] = useState<MaterialResponse | null>(null)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [deletingMaterial, setDeletingMaterial] = useState<MaterialResponse | null>(null)

  async function loadMaterials() {
    setIsLoading(true)
    setPageError(null)
    try {
      setMaterials(await api.getMaterials())
    } catch (error) {
      setPageError(getErrorMessage(error))
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    void loadMaterials()
  }, [])

  const filteredMaterials = useMemo(
    () =>
      materials.filter((material) =>
        matchesMaterialSearch(material, searchTerm),
      ),
    [materials, searchTerm],
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

  function openCreateModal() {
    setEditingMaterial(null)
    setFormState(emptyMaterialForm)
    setFormError(null)
    setIsFormOpen(true)
  }

  function openEditModal(material: MaterialResponse) {
    setEditingMaterial(material)
    setFormState({
      materialName: material.materialName,
      materialType: material.materialType,
      description: material.description ?? '',
      unit: material.unit,
    })
    setFormError(null)
    setIsFormOpen(true)
  }

  function closeFormModal() {
    if (isSubmitting) return
    setIsFormOpen(false)
    setEditingMaterial(null)
    setFormError(null)
  }

  async function handleSubmitMaterial(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const payload: MaterialRequest = {
      materialName: formState.materialName.trim(),
      materialType: formState.materialType.trim(),
      description: formState.description.trim() || null,
      unit: formState.unit.trim(),
    }

    if (!payload.materialName || !payload.materialType || !payload.unit) {
      setFormError('Vui lòng nhập đầy đủ tên vật tư, loại vật tư và đơn vị.')
      return
    }

    setIsSubmitting(true)
    setFormError(null)
    try {
      if (editingMaterial) {
        await api.updateMaterial(editingMaterial.id, payload)
      } else {
        await api.createMaterial(payload)
      }
      await loadMaterials()
      setIsFormOpen(false)
      setEditingMaterial(null)
    } catch (error) {
      setFormError(getErrorMessage(error))
    } finally {
      setIsSubmitting(false)
    }
  }

  async function handleDeleteMaterial() {
    if (!deletingMaterial) return

    setIsSubmitting(true)
    setDeleteError(null)
    try {
      await api.deleteMaterial(deletingMaterial.id)
      await loadMaterials()
      setDeletingMaterial(null)
    } catch (error) {
      setDeleteError(getErrorMessage(error))
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <MasterDataPageLayout
      title="Quản lý vật tư"
      description="Theo dõi danh mục vật tư dùng cho yêu cầu chuẩn bị seminar"
      icon={<Package className="h-10 w-10" strokeWidth={2.4} />}
    >
      {pageError && <InlineAlert message={pageError} />}
      {isLoading && <StatusPanel message="Đang tải danh mục vật tư..." />}

      {!isLoading && (
        <MasterDataTableCard
          title="Danh mục vật tư"
          visibleStart={visibleStart}
          visibleEnd={visibleEnd}
          totalItems={filteredMaterials.length}
          searchLabel="Tìm kiếm vật tư"
          searchPlaceholder="Tìm vật tư"
          searchTerm={searchTerm}
          createLabel="Thêm vật tư"
          showCreate={canModifyMasterData}
          minTableWidthClass="min-w-[940px]"
          currentPage={currentPage}
          totalPages={totalPages}
          onSearchChange={updateSearch}
          onCreate={openCreateModal}
          onPageChange={goToPage}
        >
          <thead className="bg-[#F5FAFF] text-xs font-extrabold uppercase tracking-wide text-slate-500">
            <tr>
              <MasterDataSortableHeader label="Tên vật tư" />
              <th className={masterDataTableCellClass}>Loại vật tư</th>
              <th className={masterDataTableCellClass}>Mô tả</th>
              <th className={masterDataTableCellClass}>Đơn vị</th>
              {canModifyMasterData && (
                <th className={`${masterDataTableCellClass} text-right`}>
                  Thao tác
                </th>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {pagedMaterials.length > 0 ? (
              pagedMaterials.map((material) => (
                <MaterialRow
                  key={material.id}
                  material={material}
                  canModifyMasterData={canModifyMasterData}
                  onEdit={openEditModal}
                  onDelete={setDeletingMaterial}
                />
              ))
            ) : (
              <tr>
                <td colSpan={canModifyMasterData ? 5 : 4}>
                  <MasterDataEmptyState resourceName="vật tư" />
                </td>
              </tr>
            )}
          </tbody>
        </MasterDataTableCard>
      )}

      {isFormOpen && (
        <MaterialFormModal
          formState={formState}
          error={formError}
          isSubmitting={isSubmitting}
          mode={editingMaterial ? 'edit' : 'create'}
          onChange={setFormState}
          onClose={closeFormModal}
          onSubmit={handleSubmitMaterial}
        />
      )}

      {deletingMaterial && (
        <DeleteMaterialModal
          material={deletingMaterial}
          error={deleteError}
          isSubmitting={isSubmitting}
          onCancel={() => {
            if (!isSubmitting) {
              setDeletingMaterial(null)
              setDeleteError(null)
            }
          }}
          onConfirm={handleDeleteMaterial}
        />
      )}
    </MasterDataPageLayout>
  )
}

type MaterialRowProps = {
  material: MaterialResponse
  canModifyMasterData: boolean
  onEdit: (material: MaterialResponse) => void
  onDelete: (material: MaterialResponse) => void
}

function MaterialRow({
  material,
  canModifyMasterData,
  onEdit,
  onDelete,
}: MaterialRowProps) {
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
      {canModifyMasterData && (
        <td className={`${masterDataTableCellClass} text-right`}>
          <div className="inline-flex items-center gap-2">
            <button
              type="button"
              onClick={() => onEdit(material)}
              className={masterDataModifyButtonClass}
            >
              <Pencil className="h-4 w-4" />
              Sửa
            </button>
            <button
              type="button"
              onClick={() => onDelete(material)}
              className={`${masterDataModifyButtonClass} text-red-600 hover:border-red-200 hover:bg-red-50`}
            >
              <Trash2 className="h-4 w-4" />
              Xóa
            </button>
          </div>
        </td>
      )}
    </tr>
  )
}

type MaterialFormModalProps = {
  formState: MaterialFormState
  error: string | null
  isSubmitting: boolean
  mode: 'create' | 'edit'
  onChange: (nextState: MaterialFormState) => void
  onClose: () => void
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void
}

function MaterialFormModal({
  formState,
  error,
  isSubmitting,
  mode,
  onChange,
  onClose,
  onSubmit,
}: MaterialFormModalProps) {
  return (
    <ModalFrame
      title={mode === 'create' ? 'Thêm vật tư' : 'Sửa vật tư'}
      onClose={onClose}
    >
      <form onSubmit={onSubmit} className="space-y-4">
        <TextField
          label="Tên vật tư"
          value={formState.materialName}
          required
          onChange={(value) => onChange({ ...formState, materialName: value })}
        />
        <TextField
          label="Loại vật tư"
          value={formState.materialType}
          required
          onChange={(value) => onChange({ ...formState, materialType: value })}
        />
        <TextAreaField
          label="Mô tả"
          value={formState.description}
          onChange={(value) => onChange({ ...formState, description: value })}
        />
        <TextField
          label="Đơn vị"
          value={formState.unit}
          required
          onChange={(value) => onChange({ ...formState, unit: value })}
        />
        {error && <InlineAlert message={error} />}
        <ModalActions
          isSubmitting={isSubmitting}
          submitLabel={mode === 'create' ? 'Thêm vật tư' : 'Lưu thay đổi'}
          onCancel={onClose}
        />
      </form>
    </ModalFrame>
  )
}

type DeleteMaterialModalProps = {
  material: MaterialResponse
  error: string | null
  isSubmitting: boolean
  onCancel: () => void
  onConfirm: () => void
}

function DeleteMaterialModal({
  material,
  error,
  isSubmitting,
  onCancel,
  onConfirm,
}: DeleteMaterialModalProps) {
  return (
    <ModalFrame title="Xóa vật tư" onClose={onCancel}>
      <p className="text-sm font-semibold leading-6 text-slate-600">
        Bạn có chắc muốn xóa vật tư <span className="font-extrabold text-[#0B3970]">{material.materialName}</span>?
      </p>
      {error && <InlineAlert message={error} />}
      <div className="mt-6 flex justify-end gap-3">
        <button type="button" onClick={onCancel} disabled={isSubmitting} className={secondaryButtonClass}>
          Hủy
        </button>
        <button type="button" onClick={onConfirm} disabled={isSubmitting} className={dangerButtonClass}>
          {isSubmitting ? 'Đang xóa...' : 'Xóa'}
        </button>
      </div>
    </ModalFrame>
  )
}

function ModalFrame({
  title,
  children,
  onClose,
}: {
  title: string
  children: React.ReactNode
  onClose: () => void
}) {
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-slate-900/40 px-4 py-6">
      <div className="w-full max-w-lg rounded-2xl bg-white shadow-2xl shadow-slate-900/20">
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
          <h2 className="text-lg font-extrabold text-[#092F5A]">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            className="grid h-9 w-9 place-items-center rounded-lg text-slate-500 transition hover:bg-slate-100"
            aria-label="Đóng"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="px-6 py-5">{children}</div>
      </div>
    </div>
  )
}

function TextField({
  label,
  value,
  required = false,
  onChange,
}: {
  label: string
  value: string
  required?: boolean
  onChange: (value: string) => void
}) {
  return (
    <label className="block">
      <span className="text-sm font-extrabold text-[#0B3970]">{label}</span>
      <input
        value={value}
        required={required}
        onChange={(event) => onChange(event.target.value)}
        className={fieldClass}
      />
    </label>
  )
}

function TextAreaField({
  label,
  value,
  onChange,
}: {
  label: string
  value: string
  onChange: (value: string) => void
}) {
  return (
    <label className="block">
      <span className="text-sm font-extrabold text-[#0B3970]">{label}</span>
      <textarea
        value={value}
        rows={3}
        onChange={(event) => onChange(event.target.value)}
        className={`${fieldClass} min-h-24 resize-y py-3`}
      />
    </label>
  )
}

function ModalActions({
  isSubmitting,
  submitLabel,
  onCancel,
}: {
  isSubmitting: boolean
  submitLabel: string
  onCancel: () => void
}) {
  return (
    <div className="flex justify-end gap-3 pt-2">
      <button type="button" onClick={onCancel} disabled={isSubmitting} className={secondaryButtonClass}>
        Hủy
      </button>
      <button type="submit" disabled={isSubmitting} className={primaryButtonClass}>
        {isSubmitting ? 'Đang lưu...' : submitLabel}
      </button>
    </div>
  )
}

function StatusPanel({ message }: { message: string }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white px-6 py-10 text-center text-sm font-extrabold text-[#0B3970] shadow-xl shadow-slate-200/70">
      {message}
    </div>
  )
}

function InlineAlert({ message }: { message: string }) {
  return (
    <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-bold text-red-700">
      {message}
    </div>
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

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : 'Không thể thực hiện thao tác.'
}

function normalizeText(value: string) {
  return value.trim().toLocaleLowerCase('vi-VN')
}

const fieldClass =
  'mt-2 h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm font-semibold text-[#18395F] outline-none transition focus:border-[#5DF8D8] focus:ring-4 focus:ring-[#5DF8D8]/20'

const primaryButtonClass =
  'inline-flex h-11 items-center justify-center rounded-xl bg-[#5DF8D8] px-5 text-sm font-extrabold text-[#093C5D] transition hover:bg-[#4eeac9] disabled:cursor-not-allowed disabled:opacity-60'

const secondaryButtonClass =
  'inline-flex h-11 items-center justify-center rounded-xl border border-slate-200 bg-white px-5 text-sm font-extrabold text-[#0B3970] transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60'

const dangerButtonClass =
  'inline-flex h-11 items-center justify-center rounded-xl bg-red-600 px-5 text-sm font-extrabold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60'
