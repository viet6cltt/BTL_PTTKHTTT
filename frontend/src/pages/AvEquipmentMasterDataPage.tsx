import { MonitorCog, Pencil, Trash2, X } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import {
  api,
  type AudioVisualEquipmentRequest,
  type AudioVisualEquipmentResponse,
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

type AvEquipmentMasterDataPageProps = {
  canModifyMasterData: boolean
}

type EquipmentFormState = {
  equipmentName: string
  equipmentType: string
  unit: string
}

const emptyEquipmentForm: EquipmentFormState = {
  equipmentName: '',
  equipmentType: '',
  unit: '',
}

export function AvEquipmentMasterDataPage({ canModifyMasterData }: AvEquipmentMasterDataPageProps) {
  const [equipments, setEquipments] = useState<AudioVisualEquipmentResponse[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [pageError, setPageError] = useState<string | null>(null)
  const [formError, setFormError] = useState<string | null>(null)
  const [deleteError, setDeleteError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formState, setFormState] = useState<EquipmentFormState>(emptyEquipmentForm)
  const [editingEquipment, setEditingEquipment] = useState<AudioVisualEquipmentResponse | null>(null)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [deletingEquipment, setDeletingEquipment] = useState<AudioVisualEquipmentResponse | null>(null)

  async function loadEquipments() {
    setIsLoading(true)
    setPageError(null)
    try {
      setEquipments(await api.getAudioVisualEquipments())
    } catch (error) {
      setPageError(getErrorMessage(error))
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    void loadEquipments()
  }, [])

  const filteredEquipments = useMemo(
    () =>
      equipments.filter((equipment) =>
        matchesEquipmentSearch(equipment, searchTerm),
      ),
    [equipments, searchTerm],
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

  function openCreateModal() {
    setEditingEquipment(null)
    setFormState(emptyEquipmentForm)
    setFormError(null)
    setIsFormOpen(true)
  }

  function openEditModal(equipment: AudioVisualEquipmentResponse) {
    setEditingEquipment(equipment)
    setFormState({
      equipmentName: equipment.equipmentName,
      equipmentType: equipment.equipmentType,
      unit: equipment.unit,
    })
    setFormError(null)
    setIsFormOpen(true)
  }

  function closeFormModal() {
    if (isSubmitting) return
    setIsFormOpen(false)
    setEditingEquipment(null)
    setFormError(null)
  }

  async function handleSubmitEquipment(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const payload: AudioVisualEquipmentRequest = {
      equipmentName: formState.equipmentName.trim(),
      equipmentType: formState.equipmentType.trim(),
      unit: formState.unit.trim(),
    }

    if (!payload.equipmentName || !payload.equipmentType || !payload.unit) {
      setFormError('Vui lòng nhập đầy đủ tên thiết bị, loại thiết bị và đơn vị.')
      return
    }

    setIsSubmitting(true)
    setFormError(null)
    try {
      if (editingEquipment) {
        await api.updateAudioVisualEquipment(editingEquipment.id, payload)
      } else {
        await api.createAudioVisualEquipment(payload)
      }
      await loadEquipments()
      setIsFormOpen(false)
      setEditingEquipment(null)
    } catch (error) {
      setFormError(getErrorMessage(error))
    } finally {
      setIsSubmitting(false)
    }
  }

  async function handleDeleteEquipment() {
    if (!deletingEquipment) return

    setIsSubmitting(true)
    setDeleteError(null)
    try {
      await api.deleteAudioVisualEquipment(deletingEquipment.id)
      await loadEquipments()
      setDeletingEquipment(null)
    } catch (error) {
      setDeleteError(getErrorMessage(error))
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <MasterDataPageLayout
      title="Quản lý thiết bị nghe nhìn"
      description="Theo dõi danh mục thiết bị phục vụ phòng seminar"
      icon={<MonitorCog className="h-10 w-10" strokeWidth={2.4} />}
    >
      {pageError && <InlineAlert message={pageError} />}
      {isLoading && <StatusPanel message="Đang tải danh mục thiết bị..." />}

      {!isLoading && (
        <MasterDataTableCard
          title="Danh mục thiết bị nghe nhìn"
          visibleStart={visibleStart}
          visibleEnd={visibleEnd}
          totalItems={filteredEquipments.length}
          searchLabel="Tìm kiếm thiết bị"
          searchPlaceholder="Tìm thiết bị"
          searchTerm={searchTerm}
          createLabel="Thêm thiết bị"
          showCreate={canModifyMasterData}
          minTableWidthClass="min-w-[820px]"
          currentPage={currentPage}
          totalPages={totalPages}
          onSearchChange={updateSearch}
          onCreate={openCreateModal}
          onPageChange={goToPage}
        >
          <thead className="bg-[#F5FAFF] text-xs font-extrabold uppercase tracking-wide text-slate-500">
            <tr>
              <MasterDataSortableHeader label="Tên thiết bị" />
              <th className={masterDataTableCellClass}>Loại thiết bị</th>
              <th className={masterDataTableCellClass}>Đơn vị</th>
              {canModifyMasterData && (
                <th className={`${masterDataTableCellClass} text-right`}>
                  Thao tác
                </th>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {pagedEquipments.length > 0 ? (
              pagedEquipments.map((equipment) => (
                <EquipmentRow
                  key={equipment.id}
                  equipment={equipment}
                  canModifyMasterData={canModifyMasterData}
                  onEdit={openEditModal}
                  onDelete={setDeletingEquipment}
                />
              ))
            ) : (
              <tr>
                <td colSpan={canModifyMasterData ? 4 : 3}>
                  <MasterDataEmptyState resourceName="thiết bị" />
                </td>
              </tr>
            )}
          </tbody>
        </MasterDataTableCard>
      )}

      {isFormOpen && (
        <EquipmentFormModal
          formState={formState}
          error={formError}
          isSubmitting={isSubmitting}
          mode={editingEquipment ? 'edit' : 'create'}
          onChange={setFormState}
          onClose={closeFormModal}
          onSubmit={handleSubmitEquipment}
        />
      )}

      {deletingEquipment && (
        <DeleteEquipmentModal
          equipment={deletingEquipment}
          error={deleteError}
          isSubmitting={isSubmitting}
          onCancel={() => {
            if (!isSubmitting) {
              setDeletingEquipment(null)
              setDeleteError(null)
            }
          }}
          onConfirm={handleDeleteEquipment}
        />
      )}
    </MasterDataPageLayout>
  )
}

type EquipmentRowProps = {
  equipment: AudioVisualEquipmentResponse
  canModifyMasterData: boolean
  onEdit: (equipment: AudioVisualEquipmentResponse) => void
  onDelete: (equipment: AudioVisualEquipmentResponse) => void
}

function EquipmentRow({
  equipment,
  canModifyMasterData,
  onEdit,
  onDelete,
}: EquipmentRowProps) {
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
      {canModifyMasterData && (
        <td className={`${masterDataTableCellClass} text-right`}>
          <div className="inline-flex items-center gap-2">
            <button
              type="button"
              onClick={() => onEdit(equipment)}
              className={masterDataModifyButtonClass}
            >
              <Pencil className="h-4 w-4" />
              Sửa
            </button>
            <button
              type="button"
              onClick={() => onDelete(equipment)}
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

type EquipmentFormModalProps = {
  formState: EquipmentFormState
  error: string | null
  isSubmitting: boolean
  mode: 'create' | 'edit'
  onChange: (nextState: EquipmentFormState) => void
  onClose: () => void
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void
}

function EquipmentFormModal({
  formState,
  error,
  isSubmitting,
  mode,
  onChange,
  onClose,
  onSubmit,
}: EquipmentFormModalProps) {
  return (
    <ModalFrame
      title={mode === 'create' ? 'Thêm thiết bị' : 'Sửa thiết bị'}
      onClose={onClose}
    >
      <form onSubmit={onSubmit} className="space-y-4">
        <TextField
          label="Tên thiết bị"
          value={formState.equipmentName}
          required
          onChange={(value) => onChange({ ...formState, equipmentName: value })}
        />
        <TextField
          label="Loại thiết bị"
          value={formState.equipmentType}
          required
          onChange={(value) => onChange({ ...formState, equipmentType: value })}
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
          submitLabel={mode === 'create' ? 'Thêm thiết bị' : 'Lưu thay đổi'}
          onCancel={onClose}
        />
      </form>
    </ModalFrame>
  )
}

type DeleteEquipmentModalProps = {
  equipment: AudioVisualEquipmentResponse
  error: string | null
  isSubmitting: boolean
  onCancel: () => void
  onConfirm: () => void
}

function DeleteEquipmentModal({
  equipment,
  error,
  isSubmitting,
  onCancel,
  onConfirm,
}: DeleteEquipmentModalProps) {
  return (
    <ModalFrame title="Xóa thiết bị" onClose={onCancel}>
      <p className="text-sm font-semibold leading-6 text-slate-600">
        Bạn có chắc muốn xóa thiết bị <span className="font-extrabold text-[#0B3970]">{equipment.equipmentName}</span>?
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
