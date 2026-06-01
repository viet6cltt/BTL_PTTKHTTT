import {
  ArrowLeft,
  ClipboardList,
  ListChecks,
  MonitorCog,
  Package,
  Pencil,
  Trash2,
  X,
} from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import {
  api,
  type AudioVisualEquipmentResponse,
  type AvEquipmentRequirementRequest,
  type AvEquipmentRequirementResponse,
  type MaterialRequirementRequest,
  type MaterialRequirementResponse,
  type MaterialResponse,
  type SeminarTypeRequest,
  type SeminarTypeResponse,
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

type SeminarTypeDetailPageProps = {
  seminarTypeId: number
  canModifyMasterData?: boolean
  onBack: () => void
}

type SeminarTypeFormState = {
  typeName: string
  description: string
  durationHours: string
  arrangementNotes: string
}

type MaterialRequirementFormState = {
  materialId: string
  defaultQuantity: string
  dependOnNumParticipant: boolean
  participantPerQuantity: string
  notes: string
}

type EquipmentRequirementFormState = {
  equipmentId: string
  quantityRequired: string
  dependOnNumParticipant: boolean
  participantPerQuantity: string
}

const emptyMaterialRequirementForm: MaterialRequirementFormState = {
  materialId: '',
  defaultQuantity: '1',
  dependOnNumParticipant: false,
  participantPerQuantity: '',
  notes: '',
}

const emptyEquipmentRequirementForm: EquipmentRequirementFormState = {
  equipmentId: '',
  quantityRequired: '1',
  dependOnNumParticipant: false,
  participantPerQuantity: '',
}

export function SeminarTypeDetailPage({
  seminarTypeId,
  canModifyMasterData = true,
  onBack,
}: SeminarTypeDetailPageProps) {
  const [seminarType, setSeminarType] = useState<SeminarTypeResponse | null>(null)
  const [materials, setMaterials] = useState<MaterialResponse[]>([])
  const [equipments, setEquipments] = useState<AudioVisualEquipmentResponse[]>([])
  const [materialRequirements, setMaterialRequirements] = useState<MaterialRequirementResponse[]>([])
  const [equipmentRequirements, setEquipmentRequirements] = useState<AvEquipmentRequirementResponse[]>([])
  const [materialSearchTerm, setMaterialSearchTerm] = useState('')
  const [equipmentSearchTerm, setEquipmentSearchTerm] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [pageError, setPageError] = useState<string | null>(null)
  const [formError, setFormError] = useState<string | null>(null)
  const [deleteError, setDeleteError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [seminarTypeForm, setSeminarTypeForm] = useState<SeminarTypeFormState | null>(null)
  const [materialForm, setMaterialForm] = useState<MaterialRequirementFormState | null>(null)
  const [editingMaterialRequirement, setEditingMaterialRequirement] =
    useState<MaterialRequirementResponse | null>(null)
  const [equipmentForm, setEquipmentForm] = useState<EquipmentRequirementFormState | null>(null)
  const [editingEquipmentRequirement, setEditingEquipmentRequirement] =
    useState<AvEquipmentRequirementResponse | null>(null)
  const [deletingMaterialRequirement, setDeletingMaterialRequirement] =
    useState<MaterialRequirementResponse | null>(null)
  const [deletingEquipmentRequirement, setDeletingEquipmentRequirement] =
    useState<AvEquipmentRequirementResponse | null>(null)

  async function loadDetail() {
    setIsLoading(true)
    setPageError(null)
    try {
      const [
        seminarTypeResponse,
        materialRequirementResponse,
        equipmentRequirementResponse,
        materialResponse,
        equipmentResponse,
      ] = await Promise.all([
        api.getSeminarTypeById(seminarTypeId),
        api.getMaterialRequirements(seminarTypeId),
        api.getAvEquipmentRequirements(seminarTypeId),
        api.getMaterials(),
        api.getAudioVisualEquipments(),
      ])
      setSeminarType(seminarTypeResponse)
      setMaterialRequirements(materialRequirementResponse)
      setEquipmentRequirements(equipmentRequirementResponse)
      setMaterials(materialResponse)
      setEquipments(equipmentResponse)
    } catch (error) {
      setPageError(getErrorMessage(error))
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    void loadDetail()
  }, [seminarTypeId])

  const filteredMaterialRequirements = useMemo(
    () =>
      materialRequirements.filter((requirement) =>
        matchesMaterialRequirementSearch(requirement, materialSearchTerm),
      ),
    [materialRequirements, materialSearchTerm],
  )
  const filteredEquipmentRequirements = useMemo(
    () =>
      equipmentRequirements.filter((requirement) =>
        matchesEquipmentRequirementSearch(requirement, equipmentSearchTerm),
      ),
    [equipmentRequirements, equipmentSearchTerm],
  )

  const materialPagination = useMasterDataPagination(filteredMaterialRequirements)
  const equipmentPagination = useMasterDataPagination(filteredEquipmentRequirements)

  function updateMaterialSearch(value: string) {
    setMaterialSearchTerm(value)
    materialPagination.resetToFirstPage()
  }

  function updateEquipmentSearch(value: string) {
    setEquipmentSearchTerm(value)
    equipmentPagination.resetToFirstPage()
  }

  function openSeminarTypeEdit() {
    if (!seminarType) return
    setSeminarTypeForm({
      typeName: seminarType.typeName,
      description: seminarType.description ?? '',
      durationHours: String(seminarType.durationHours),
      arrangementNotes: seminarType.arrangementNotes ?? '',
    })
    setFormError(null)
  }

  function openCreateMaterialRequirement() {
    setEditingMaterialRequirement(null)
    setMaterialForm({
      ...emptyMaterialRequirementForm,
      materialId: String(materials[0]?.id ?? ''),
    })
    setFormError(null)
  }

  function openEditMaterialRequirement(requirement: MaterialRequirementResponse) {
    setEditingMaterialRequirement(requirement)
    setMaterialForm({
      materialId: String(requirement.materialId),
      defaultQuantity: String(requirement.defaultQuantity),
      dependOnNumParticipant: requirement.dependOnNumParticipant,
      participantPerQuantity: requirement.participantPerQuantity === null
        ? ''
        : String(requirement.participantPerQuantity),
      notes: requirement.notes ?? '',
    })
    setFormError(null)
  }

  function openCreateEquipmentRequirement() {
    setEditingEquipmentRequirement(null)
    setEquipmentForm({
      ...emptyEquipmentRequirementForm,
      equipmentId: String(equipments[0]?.id ?? ''),
    })
    setFormError(null)
  }

  function openEditEquipmentRequirement(requirement: AvEquipmentRequirementResponse) {
    setEditingEquipmentRequirement(requirement)
    setEquipmentForm({
      equipmentId: String(requirement.equipmentId),
      quantityRequired: String(requirement.quantityRequired),
      dependOnNumParticipant: requirement.dependOnNumParticipant,
      participantPerQuantity: requirement.participantPerQuantity === null
        ? ''
        : String(requirement.participantPerQuantity),
    })
    setFormError(null)
  }

  function closeModal() {
    if (isSubmitting) return
    setSeminarTypeForm(null)
    setMaterialForm(null)
    setEquipmentForm(null)
    setEditingMaterialRequirement(null)
    setEditingEquipmentRequirement(null)
    setDeletingMaterialRequirement(null)
    setDeletingEquipmentRequirement(null)
    setFormError(null)
    setDeleteError(null)
  }

  async function handleSubmitSeminarType(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!seminarType || !seminarTypeForm) return

    const durationHours = Number(seminarTypeForm.durationHours)
    const payload: SeminarTypeRequest = {
      typeName: seminarTypeForm.typeName.trim(),
      description: seminarTypeForm.description.trim() || null,
      durationHours,
      arrangementNotes: seminarTypeForm.arrangementNotes.trim() || null,
    }

    if (!payload.typeName || !Number.isInteger(durationHours) || durationHours <= 0) {
      setFormError('Vui lòng nhập tên loại seminar và thời lượng là số nguyên dương.')
      return
    }

    setIsSubmitting(true)
    setFormError(null)
    try {
      await api.updateSeminarType(seminarType.id, payload)
      await loadDetail()
      setSeminarTypeForm(null)
    } catch (error) {
      setFormError(getErrorMessage(error))
    } finally {
      setIsSubmitting(false)
    }
  }

  async function handleSubmitMaterialRequirement(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!materialForm) return

    const materialId = Number(materialForm.materialId)
    const defaultQuantity = Number(materialForm.defaultQuantity)
    const participantCount = Number(materialForm.participantPerQuantity)

    if (!Number.isInteger(materialId) || materialId <= 0 || !Number.isInteger(defaultQuantity) || defaultQuantity <= 0) {
      setFormError('Vui lòng chọn vật tư và nhập số lượng mặc định là số nguyên dương.')
      return
    }

    if (
      materialForm.dependOnNumParticipant &&
      (!Number.isInteger(participantCount) || participantCount <= 0)
    ) {
      setFormError('Vui lòng nhập số học viên trên mỗi đơn vị là số nguyên dương.')
      return
    }

    const payload: MaterialRequirementRequest = {
      materialId: editingMaterialRequirement?.materialId ?? materialId,
      defaultQuantity,
      dependOnNumParticipant: materialForm.dependOnNumParticipant,
      participantPerQuantity: materialForm.dependOnNumParticipant ? participantCount : null,
      notes: materialForm.notes.trim() || null,
    }

    setIsSubmitting(true)
    setFormError(null)
    try {
      if (editingMaterialRequirement) {
        await api.updateMaterialRequirement(
          seminarTypeId,
          editingMaterialRequirement.materialId,
          payload,
        )
      } else {
        await api.createMaterialRequirement(seminarTypeId, payload)
      }
      await loadDetail()
      setMaterialForm(null)
      setEditingMaterialRequirement(null)
    } catch (error) {
      setFormError(getErrorMessage(error))
    } finally {
      setIsSubmitting(false)
    }
  }

  async function handleSubmitEquipmentRequirement(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!equipmentForm) return

    const equipmentId = Number(equipmentForm.equipmentId)
    const quantityRequired = Number(equipmentForm.quantityRequired)
    const participantCount = Number(equipmentForm.participantPerQuantity)

    if (!Number.isInteger(equipmentId) || equipmentId <= 0 || !Number.isInteger(quantityRequired) || quantityRequired <= 0) {
      setFormError('Vui lòng chọn thiết bị và nhập số lượng là số nguyên dương.')
      return
    }

    if (
      equipmentForm.dependOnNumParticipant &&
      (!Number.isInteger(participantCount) || participantCount <= 0)
    ) {
      setFormError('Vui lòng nhập số học viên trên mỗi đơn vị là số nguyên dương.')
      return
    }

    const payload: AvEquipmentRequirementRequest = {
      equipmentId: editingEquipmentRequirement?.equipmentId ?? equipmentId,
      quantityRequired,
      dependOnNumParticipant: equipmentForm.dependOnNumParticipant,
      participantPerQuantity: equipmentForm.dependOnNumParticipant ? participantCount : null,
    }

    setIsSubmitting(true)
    setFormError(null)
    try {
      if (editingEquipmentRequirement) {
        await api.updateAvEquipmentRequirement(
          seminarTypeId,
          editingEquipmentRequirement.equipmentId,
          payload,
        )
      } else {
        await api.createAvEquipmentRequirement(seminarTypeId, payload)
      }
      await loadDetail()
      setEquipmentForm(null)
      setEditingEquipmentRequirement(null)
    } catch (error) {
      setFormError(getErrorMessage(error))
    } finally {
      setIsSubmitting(false)
    }
  }

  async function handleDeleteMaterialRequirement() {
    if (!deletingMaterialRequirement) return
    setIsSubmitting(true)
    setDeleteError(null)
    try {
      await api.deleteMaterialRequirement(seminarTypeId, deletingMaterialRequirement.materialId)
      await loadDetail()
      setDeletingMaterialRequirement(null)
    } catch (error) {
      setDeleteError(getErrorMessage(error))
    } finally {
      setIsSubmitting(false)
    }
  }

  async function handleDeleteEquipmentRequirement() {
    if (!deletingEquipmentRequirement) return
    setIsSubmitting(true)
    setDeleteError(null)
    try {
      await api.deleteAvEquipmentRequirement(seminarTypeId, deletingEquipmentRequirement.equipmentId)
      await loadDetail()
      setDeletingEquipmentRequirement(null)
    } catch (error) {
      setDeleteError(getErrorMessage(error))
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <MasterDataPageLayout
      title="Chi tiết loại seminar"
      description="Theo dõi cấu hình vật tư và thiết bị nghe nhìn cần chuẩn bị"
      icon={<ListChecks className="h-10 w-10" strokeWidth={2.4} />}
    >
      <button
        type="button"
        onClick={onBack}
        className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-extrabold text-[#0B3970] shadow-sm transition hover:border-[#5DF8D8]"
      >
        <ArrowLeft className="h-4 w-4" />
        Quay lại danh sách loại seminar
      </button>

      {pageError && <InlineAlert message={pageError} />}
      {isLoading && <StatusPanel message="Đang tải chi tiết loại seminar..." />}

      {!isLoading && seminarType && (
        <>
          <SeminarTypeSummaryCard
            seminarType={seminarType}
            materialRequirementCount={materialRequirements.length}
            equipmentRequirementCount={equipmentRequirements.length}
            canModifyMasterData={canModifyMasterData}
            onEdit={openSeminarTypeEdit}
          />

          <MasterDataTableCard
            title="Yêu cầu vật tư"
            visibleStart={materialPagination.visibleStart}
            visibleEnd={materialPagination.visibleEnd}
            totalItems={filteredMaterialRequirements.length}
            searchLabel="Tìm kiếm yêu cầu vật tư"
            searchPlaceholder="Tìm vật tư"
            searchTerm={materialSearchTerm}
            createLabel="Thêm vật tư"
            showCreate={canModifyMasterData}
            minTableWidthClass="min-w-[1180px]"
            currentPage={materialPagination.currentPage}
            totalPages={materialPagination.totalPages}
            onSearchChange={updateMaterialSearch}
            onCreate={openCreateMaterialRequirement}
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
                {canModifyMasterData && (
                  <th className={`${masterDataTableCellClass} text-right`}>
                    Thao tác
                  </th>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {materialPagination.pagedItems.length > 0 ? (
                materialPagination.pagedItems.map((requirement) => (
                  <MaterialRequirementRow
                    key={requirement.materialId}
                    requirement={requirement}
                    canModifyMasterData={canModifyMasterData}
                    onEdit={openEditMaterialRequirement}
                    onDelete={setDeletingMaterialRequirement}
                  />
                ))
              ) : (
                <tr>
                  <td colSpan={canModifyMasterData ? 7 : 6}>
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
            totalItems={filteredEquipmentRequirements.length}
            searchLabel="Tìm kiếm yêu cầu thiết bị"
            searchPlaceholder="Tìm thiết bị"
            searchTerm={equipmentSearchTerm}
            createLabel="Thêm thiết bị"
            showCreate={canModifyMasterData}
            minTableWidthClass="min-w-[1040px]"
            currentPage={equipmentPagination.currentPage}
            totalPages={equipmentPagination.totalPages}
            onSearchChange={updateEquipmentSearch}
            onCreate={openCreateEquipmentRequirement}
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
                {canModifyMasterData && (
                  <th className={`${masterDataTableCellClass} text-right`}>
                    Thao tác
                  </th>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {equipmentPagination.pagedItems.length > 0 ? (
                equipmentPagination.pagedItems.map((requirement) => (
                  <EquipmentRequirementRow
                    key={requirement.equipmentId}
                    requirement={requirement}
                    canModifyMasterData={canModifyMasterData}
                    onEdit={openEditEquipmentRequirement}
                    onDelete={setDeletingEquipmentRequirement}
                  />
                ))
              ) : (
                <tr>
                  <td colSpan={canModifyMasterData ? 6 : 5}>
                    <MasterDataEmptyState resourceName="yêu cầu thiết bị" />
                  </td>
                </tr>
              )}
            </tbody>
          </MasterDataTableCard>
        </>
      )}

      {seminarTypeForm && (
        <SeminarTypeFormModal
          formState={seminarTypeForm}
          error={formError}
          isSubmitting={isSubmitting}
          onChange={setSeminarTypeForm}
          onClose={closeModal}
          onSubmit={handleSubmitSeminarType}
        />
      )}

      {materialForm && (
        <MaterialRequirementFormModal
          formState={materialForm}
          materials={materials}
          error={formError}
          isEdit={editingMaterialRequirement !== null}
          isSubmitting={isSubmitting}
          onChange={setMaterialForm}
          onClose={closeModal}
          onSubmit={handleSubmitMaterialRequirement}
        />
      )}

      {equipmentForm && (
        <EquipmentRequirementFormModal
          formState={equipmentForm}
          equipments={equipments}
          error={formError}
          isEdit={editingEquipmentRequirement !== null}
          isSubmitting={isSubmitting}
          onChange={setEquipmentForm}
          onClose={closeModal}
          onSubmit={handleSubmitEquipmentRequirement}
        />
      )}

      {deletingMaterialRequirement && (
        <DeleteRequirementModal
          title="Xóa yêu cầu vật tư"
          resourceName={deletingMaterialRequirement.materialName}
          error={deleteError}
          isSubmitting={isSubmitting}
          onCancel={closeModal}
          onConfirm={handleDeleteMaterialRequirement}
        />
      )}

      {deletingEquipmentRequirement && (
        <DeleteRequirementModal
          title="Xóa yêu cầu thiết bị"
          resourceName={deletingEquipmentRequirement.equipmentName}
          error={deleteError}
          isSubmitting={isSubmitting}
          onCancel={closeModal}
          onConfirm={handleDeleteEquipmentRequirement}
        />
      )}
    </MasterDataPageLayout>
  )
}

function SeminarTypeSummaryCard({
  seminarType,
  materialRequirementCount,
  equipmentRequirementCount,
  canModifyMasterData,
  onEdit,
}: {
  seminarType: SeminarTypeResponse
  materialRequirementCount: number
  equipmentRequirementCount: number
  canModifyMasterData: boolean
  onEdit: () => void
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
        {canModifyMasterData && (
          <button
            type="button"
            onClick={onEdit}
            className={`${masterDataModifyButtonClass} shrink-0`}
          >
            <Pencil className="h-4 w-4" />
            Cập nhật thông tin
          </button>
        )}
      </div>
      <div className="grid gap-4 border-t border-slate-100 px-6 py-5 md:grid-cols-3">
        <SummaryMetric
          label="Thời lượng"
          value={`${seminarType.durationHours} giờ`}
        />
        <SummaryMetric
          label="Yêu cầu vật tư"
          value={`${materialRequirementCount} mục`}
          icon={<Package className="h-5 w-5" />}
        />
        <SummaryMetric
          label="Yêu cầu thiết bị"
          value={`${equipmentRequirementCount} mục`}
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
  canModifyMasterData,
  onEdit,
  onDelete,
}: {
  requirement: MaterialRequirementResponse
  canModifyMasterData: boolean
  onEdit: (requirement: MaterialRequirementResponse) => void
  onDelete: (requirement: MaterialRequirementResponse) => void
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
      {canModifyMasterData && (
        <td className={`${masterDataTableCellClass} text-right`}>
          <RowActions onEdit={() => onEdit(requirement)} onDelete={() => onDelete(requirement)} />
        </td>
      )}
    </tr>
  )
}

function EquipmentRequirementRow({
  requirement,
  canModifyMasterData,
  onEdit,
  onDelete,
}: {
  requirement: AvEquipmentRequirementResponse
  canModifyMasterData: boolean
  onEdit: (requirement: AvEquipmentRequirementResponse) => void
  onDelete: (requirement: AvEquipmentRequirementResponse) => void
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
      {canModifyMasterData && (
        <td className={`${masterDataTableCellClass} text-right`}>
          <RowActions onEdit={() => onEdit(requirement)} onDelete={() => onDelete(requirement)} />
        </td>
      )}
    </tr>
  )
}

function RowActions({
  onEdit,
  onDelete,
}: {
  onEdit: () => void
  onDelete: () => void
}) {
  return (
    <div className="inline-flex items-center gap-2">
      <button type="button" onClick={onEdit} className={masterDataModifyButtonClass}>
        <Pencil className="h-4 w-4" />
        Sửa
      </button>
      <button
        type="button"
        onClick={onDelete}
        className={`${masterDataModifyButtonClass} text-red-600 hover:border-red-200 hover:bg-red-50`}
      >
        <Trash2 className="h-4 w-4" />
        Xóa
      </button>
    </div>
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

function SeminarTypeFormModal({
  formState,
  error,
  isSubmitting,
  onChange,
  onClose,
  onSubmit,
}: {
  formState: SeminarTypeFormState
  error: string | null
  isSubmitting: boolean
  onChange: (nextState: SeminarTypeFormState) => void
  onClose: () => void
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void
}) {
  return (
    <ModalFrame title="Cập nhật loại seminar" onClose={onClose}>
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
        <ModalActions isSubmitting={isSubmitting} submitLabel="Lưu thay đổi" onCancel={onClose} />
      </form>
    </ModalFrame>
  )
}

function MaterialRequirementFormModal({
  formState,
  materials,
  error,
  isEdit,
  isSubmitting,
  onChange,
  onClose,
  onSubmit,
}: {
  formState: MaterialRequirementFormState
  materials: MaterialResponse[]
  error: string | null
  isEdit: boolean
  isSubmitting: boolean
  onChange: (nextState: MaterialRequirementFormState) => void
  onClose: () => void
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void
}) {
  return (
    <ModalFrame title={isEdit ? 'Sửa yêu cầu vật tư' : 'Thêm yêu cầu vật tư'} onClose={onClose}>
      <form onSubmit={onSubmit} className="space-y-4">
        <SelectField
          label="Vật tư"
          value={formState.materialId}
          disabled={isEdit}
          options={materials.map((material) => ({
            value: String(material.id),
            label: `${material.materialName} (${material.unit})`,
          }))}
          onChange={(value) => onChange({ ...formState, materialId: value })}
        />
        <TextField
          label="Số lượng mặc định"
          value={formState.defaultQuantity}
          required
          type="number"
          min={1}
          onChange={(value) => onChange({ ...formState, defaultQuantity: value })}
        />
        <DependencyFields
          dependOnNumParticipant={formState.dependOnNumParticipant}
          participantPerQuantity={formState.participantPerQuantity}
          onToggle={(checked) =>
            onChange({
              ...formState,
              dependOnNumParticipant: checked,
              participantPerQuantity: checked ? formState.participantPerQuantity : '',
            })
          }
          onParticipantChange={(value) => onChange({ ...formState, participantPerQuantity: value })}
        />
        <TextAreaField
          label="Ghi chú"
          value={formState.notes}
          onChange={(value) => onChange({ ...formState, notes: value })}
        />
        {error && <InlineAlert message={error} />}
        <ModalActions
          isSubmitting={isSubmitting}
          submitLabel={isEdit ? 'Lưu thay đổi' : 'Thêm yêu cầu'}
          onCancel={onClose}
        />
      </form>
    </ModalFrame>
  )
}

function EquipmentRequirementFormModal({
  formState,
  equipments,
  error,
  isEdit,
  isSubmitting,
  onChange,
  onClose,
  onSubmit,
}: {
  formState: EquipmentRequirementFormState
  equipments: AudioVisualEquipmentResponse[]
  error: string | null
  isEdit: boolean
  isSubmitting: boolean
  onChange: (nextState: EquipmentRequirementFormState) => void
  onClose: () => void
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void
}) {
  return (
    <ModalFrame title={isEdit ? 'Sửa yêu cầu thiết bị' : 'Thêm yêu cầu thiết bị'} onClose={onClose}>
      <form onSubmit={onSubmit} className="space-y-4">
        <SelectField
          label="Thiết bị"
          value={formState.equipmentId}
          disabled={isEdit}
          options={equipments.map((equipment) => ({
            value: String(equipment.id),
            label: `${equipment.equipmentName} (${equipment.unit})`,
          }))}
          onChange={(value) => onChange({ ...formState, equipmentId: value })}
        />
        <TextField
          label="Số lượng"
          value={formState.quantityRequired}
          required
          type="number"
          min={1}
          onChange={(value) => onChange({ ...formState, quantityRequired: value })}
        />
        <DependencyFields
          dependOnNumParticipant={formState.dependOnNumParticipant}
          participantPerQuantity={formState.participantPerQuantity}
          onToggle={(checked) =>
            onChange({
              ...formState,
              dependOnNumParticipant: checked,
              participantPerQuantity: checked ? formState.participantPerQuantity : '',
            })
          }
          onParticipantChange={(value) => onChange({ ...formState, participantPerQuantity: value })}
        />
        {error && <InlineAlert message={error} />}
        <ModalActions
          isSubmitting={isSubmitting}
          submitLabel={isEdit ? 'Lưu thay đổi' : 'Thêm yêu cầu'}
          onCancel={onClose}
        />
      </form>
    </ModalFrame>
  )
}

function DeleteRequirementModal({
  title,
  resourceName,
  error,
  isSubmitting,
  onCancel,
  onConfirm,
}: {
  title: string
  resourceName: string
  error: string | null
  isSubmitting: boolean
  onCancel: () => void
  onConfirm: () => void
}) {
  return (
    <ModalFrame title={title} onClose={onCancel}>
      <p className="text-sm font-semibold leading-6 text-slate-600">
        Bạn có chắc muốn xóa yêu cầu cho <span className="font-extrabold text-[#0B3970]">{resourceName}</span>?
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

function DependencyFields({
  dependOnNumParticipant,
  participantPerQuantity,
  onToggle,
  onParticipantChange,
}: {
  dependOnNumParticipant: boolean
  participantPerQuantity: string
  onToggle: (checked: boolean) => void
  onParticipantChange: (value: string) => void
}) {
  return (
    <div className="space-y-3 rounded-xl border border-slate-200 bg-[#F8FBFF] px-4 py-4">
      <label className="flex items-center gap-3 text-sm font-extrabold text-[#0B3970]">
        <input
          type="checkbox"
          checked={dependOnNumParticipant}
          onChange={(event) => onToggle(event.target.checked)}
          className="h-4 w-4 rounded border-slate-300 text-[#0B3970]"
        />
        Tính theo số học viên
      </label>
      {dependOnNumParticipant && (
        <TextField
          label="Số học viên trên mỗi đơn vị"
          value={participantPerQuantity}
          required
          type="number"
          min={1}
          onChange={onParticipantChange}
        />
      )}
    </div>
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
      <div className="max-h-[92vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white shadow-2xl shadow-slate-900/20">
        <div className="sticky top-0 flex items-center justify-between border-b border-slate-100 bg-white px-6 py-4">
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

function SelectField({
  label,
  value,
  options,
  disabled = false,
  onChange,
}: {
  label: string
  value: string
  options: { value: string; label: string }[]
  disabled?: boolean
  onChange: (value: string) => void
}) {
  return (
    <label className="block">
      <span className="text-sm font-extrabold text-[#0B3970]">{label}</span>
      <select
        value={value}
        required
        disabled={disabled}
        onChange={(event) => onChange(event.target.value)}
        className={fieldClass}
      >
        <option value="">Chọn {label.toLocaleLowerCase('vi-VN')}</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
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

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : 'Không thể thực hiện thao tác.'
}

function normalizeText(value: string) {
  return value.trim().toLocaleLowerCase('vi-VN')
}

const fieldClass =
  'mt-2 h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm font-semibold text-[#18395F] outline-none transition focus:border-[#5DF8D8] focus:ring-4 focus:ring-[#5DF8D8]/20 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-500'

const primaryButtonClass =
  'inline-flex h-11 items-center justify-center rounded-xl bg-[#5DF8D8] px-5 text-sm font-extrabold text-[#093C5D] transition hover:bg-[#4eeac9] disabled:cursor-not-allowed disabled:opacity-60'

const secondaryButtonClass =
  'inline-flex h-11 items-center justify-center rounded-xl border border-slate-200 bg-white px-5 text-sm font-extrabold text-[#0B3970] transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60'

const dangerButtonClass =
  'inline-flex h-11 items-center justify-center rounded-xl bg-red-600 px-5 text-sm font-extrabold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60'
