import { Eye, ListChecks, Pencil, Trash2, X } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import {
  api,
  type SeminarTypeRequest,
  type SeminarTypeResponse,
} from '../api'
import { MasterDataEmptyState } from '../components/masterdata/MasterDataEmptyState'
import { MasterDataPageLayout } from '../components/masterdata/MasterDataPageLayout'
import { MasterDataSortableHeader } from '../components/masterdata/MasterDataSortableHeader'
import { MasterDataTableCard } from '../components/masterdata/MasterDataTableCard'
import {
  masterDataModifyButtonClass,
  masterDataTableCellClass,
} from '../components/masterdata/masterDataStyles'
import { useMasterDataPagination } from '../components/masterdata/useMasterDataPagination'

type SeminarTypeMasterDataPageProps = {
  canModifyMasterData: boolean
  onSelectSeminarType: (id: number) => void
}

type SeminarTypeFormState = {
  typeName: string
  description: string
  durationHours: string
  arrangementNotes: string
}

const emptySeminarTypeForm: SeminarTypeFormState = {
  typeName: '',
  description: '',
  durationHours: '',
  arrangementNotes: '',
}

export function SeminarTypeMasterDataPage({
  canModifyMasterData,
  onSelectSeminarType,
}: SeminarTypeMasterDataPageProps) {
  const [seminarTypes, setSeminarTypes] = useState<SeminarTypeResponse[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [pageError, setPageError] = useState<string | null>(null)
  const [formError, setFormError] = useState<string | null>(null)
  const [deleteError, setDeleteError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formState, setFormState] = useState<SeminarTypeFormState>(emptySeminarTypeForm)
  const [editingSeminarType, setEditingSeminarType] = useState<SeminarTypeResponse | null>(null)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [deletingSeminarType, setDeletingSeminarType] = useState<SeminarTypeResponse | null>(null)

  async function loadSeminarTypes() {
    setIsLoading(true)
    setPageError(null)
    try {
      setSeminarTypes(await api.getSeminarTypes())
    } catch (error) {
      setPageError(getErrorMessage(error))
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    void loadSeminarTypes()
  }, [])

  const filteredSeminarTypes = useMemo(
    () =>
      seminarTypes.filter((seminarType) =>
        matchesSeminarTypeSearch(seminarType, searchTerm),
      ),
    [seminarTypes, searchTerm],
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

  function openCreateModal() {
    setEditingSeminarType(null)
    setFormState(emptySeminarTypeForm)
    setFormError(null)
    setIsFormOpen(true)
  }

  function openEditModal(seminarType: SeminarTypeResponse) {
    setEditingSeminarType(seminarType)
    setFormState({
      typeName: seminarType.typeName,
      description: seminarType.description ?? '',
      durationHours: String(seminarType.durationHours),
      arrangementNotes: seminarType.arrangementNotes ?? '',
    })
    setFormError(null)
    setIsFormOpen(true)
  }

  function closeFormModal() {
    if (isSubmitting) return
    setIsFormOpen(false)
    setEditingSeminarType(null)
    setFormError(null)
  }

  async function handleSubmitSeminarType(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const durationHours = Number(formState.durationHours)
    const payload: SeminarTypeRequest = {
      typeName: formState.typeName.trim(),
      description: formState.description.trim() || null,
      durationHours,
      arrangementNotes: formState.arrangementNotes.trim() || null,
    }

    if (!payload.typeName || !Number.isInteger(durationHours) || durationHours <= 0) {
      setFormError('Vui lòng nhập tên loại seminar và thời lượng là số nguyên dương.')
      return
    }

    setIsSubmitting(true)
    setFormError(null)
    try {
      if (editingSeminarType) {
        await api.updateSeminarType(editingSeminarType.id, payload)
      } else {
        await api.createSeminarType(payload)
      }
      await loadSeminarTypes()
      setIsFormOpen(false)
      setEditingSeminarType(null)
    } catch (error) {
      setFormError(getErrorMessage(error))
    } finally {
      setIsSubmitting(false)
    }
  }

  async function handleDeleteSeminarType() {
    if (!deletingSeminarType) return

    setIsSubmitting(true)
    setDeleteError(null)
    try {
      await api.deleteSeminarType(deletingSeminarType.id)
      await loadSeminarTypes()
      setDeletingSeminarType(null)
    } catch (error) {
      setDeleteError(getErrorMessage(error))
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <MasterDataPageLayout
      title="Quản lý loại seminar"
      description="Theo dõi danh mục loại seminar, thời lượng và ghi chú sắp xếp"
      icon={<ListChecks className="h-10 w-10" strokeWidth={2.4} />}
    >
      {pageError && <InlineAlert message={pageError} />}
      {isLoading && <StatusPanel message="Đang tải danh mục loại seminar..." />}

      {!isLoading && (
        <MasterDataTableCard
          title="Danh mục loại seminar"
          visibleStart={visibleStart}
          visibleEnd={visibleEnd}
          totalItems={filteredSeminarTypes.length}
          searchLabel="Tìm kiếm loại seminar"
          searchPlaceholder="Tìm loại seminar"
          searchTerm={searchTerm}
          createLabel="Thêm loại seminar"
          showCreate={canModifyMasterData}
          minTableWidthClass="min-w-[1120px]"
          currentPage={currentPage}
          totalPages={totalPages}
          onSearchChange={updateSearch}
          onCreate={openCreateModal}
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
                  canModifyMasterData={canModifyMasterData}
                  onSelect={onSelectSeminarType}
                  onEdit={openEditModal}
                  onDelete={setDeletingSeminarType}
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
      )}

      {isFormOpen && (
        <SeminarTypeFormModal
          formState={formState}
          error={formError}
          isSubmitting={isSubmitting}
          mode={editingSeminarType ? 'edit' : 'create'}
          onChange={setFormState}
          onClose={closeFormModal}
          onSubmit={handleSubmitSeminarType}
        />
      )}

      {deletingSeminarType && (
        <DeleteSeminarTypeModal
          seminarType={deletingSeminarType}
          error={deleteError}
          isSubmitting={isSubmitting}
          onCancel={() => {
            if (!isSubmitting) {
              setDeletingSeminarType(null)
              setDeleteError(null)
            }
          }}
          onConfirm={handleDeleteSeminarType}
        />
      )}
    </MasterDataPageLayout>
  )
}

type SeminarTypeRowProps = {
  seminarType: SeminarTypeResponse
  canModifyMasterData: boolean
  onSelect: (seminarTypeId: number) => void
  onEdit: (seminarType: SeminarTypeResponse) => void
  onDelete: (seminarType: SeminarTypeResponse) => void
}

function SeminarTypeRow({
  seminarType,
  canModifyMasterData,
  onSelect,
  onEdit,
  onDelete,
}: SeminarTypeRowProps) {
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
        <div className="inline-flex items-center gap-2">
          <button
            type="button"
            onClick={() => onSelect(seminarType.id)}
            className={masterDataModifyButtonClass}
          >
            <Eye className="h-4 w-4" />
            Xem
          </button>
          {canModifyMasterData && (
            <>
              <button
                type="button"
                onClick={() => onEdit(seminarType)}
                className={masterDataModifyButtonClass}
              >
                <Pencil className="h-4 w-4" />
                Sửa
              </button>
              <button
                type="button"
                onClick={() => onDelete(seminarType)}
                className={`${masterDataModifyButtonClass} text-red-600 hover:border-red-200 hover:bg-red-50`}
              >
                <Trash2 className="h-4 w-4" />
                Xóa
              </button>
            </>
          )}
        </div>
      </td>
    </tr>
  )
}

type SeminarTypeFormModalProps = {
  formState: SeminarTypeFormState
  error: string | null
  isSubmitting: boolean
  mode: 'create' | 'edit'
  onChange: (nextState: SeminarTypeFormState) => void
  onClose: () => void
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void
}

function SeminarTypeFormModal({
  formState,
  error,
  isSubmitting,
  mode,
  onChange,
  onClose,
  onSubmit,
}: SeminarTypeFormModalProps) {
  return (
    <ModalFrame
      title={mode === 'create' ? 'Thêm loại seminar' : 'Sửa loại seminar'}
      onClose={onClose}
    >
      <form onSubmit={onSubmit} className="space-y-4">
        <TextField
          label="Tên loại seminar"
          value={formState.typeName}
          required
          onChange={(value) => onChange({ ...formState, typeName: value })}
        />
        <TextAreaField
          label="Mô tả"
          value={formState.description}
          onChange={(value) => onChange({ ...formState, description: value })}
        />
        <TextField
          label="Thời lượng"
          value={formState.durationHours}
          required
          type="number"
          min={1}
          onChange={(value) => onChange({ ...formState, durationHours: value })}
        />
        <TextAreaField
          label="Ghi chú sắp xếp"
          value={formState.arrangementNotes}
          onChange={(value) => onChange({ ...formState, arrangementNotes: value })}
        />
        {error && <InlineAlert message={error} />}
        <ModalActions
          isSubmitting={isSubmitting}
          submitLabel={mode === 'create' ? 'Thêm loại seminar' : 'Lưu thay đổi'}
          onCancel={onClose}
        />
      </form>
    </ModalFrame>
  )
}

type DeleteSeminarTypeModalProps = {
  seminarType: SeminarTypeResponse
  error: string | null
  isSubmitting: boolean
  onCancel: () => void
  onConfirm: () => void
}

function DeleteSeminarTypeModal({
  seminarType,
  error,
  isSubmitting,
  onCancel,
  onConfirm,
}: DeleteSeminarTypeModalProps) {
  return (
    <ModalFrame title="Xóa loại seminar" onClose={onCancel}>
      <p className="text-sm font-semibold leading-6 text-slate-600">
        Bạn có chắc muốn xóa loại seminar <span className="font-extrabold text-[#0B3970]">{seminarType.typeName}</span>?
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
  type = 'text',
  min,
  onChange,
}: {
  label: string
  value: string
  required?: boolean
  type?: 'text' | 'number'
  min?: number
  onChange: (value: string) => void
}) {
  return (
    <label className="block">
      <span className="text-sm font-extrabold text-[#0B3970]">{label}</span>
      <input
        value={value}
        required={required}
        type={type}
        min={min}
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
