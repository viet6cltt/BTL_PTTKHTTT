import {
  Camera,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Lock,
  KeyRound,
  Mail,
  Pencil,
  Phone,
  RotateCcw,
  ShieldCheck,
  Search,
  ShieldAlert,
  UserPlus,
  User,
} from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react'
import {
  api,
  type CreateUserRequest,
  type ConsultantResponse,
  type UpdateUserRequest,
  type UserResponse,
  type UserRole,
  type UserStatus,
} from '../api'
import { PageHeader } from '../components/layout/PageHeader'

const roleOptions: { value: UserRole; label: string; description: string }[] = [
  { value: 'BOOKING_STAFF', label: 'Booking Staff', description: 'Tạo seminar và theo dõi kế hoạch đào tạo.' },
  { value: 'LOGISTICS_COORDINATOR', label: 'Logistics Coordinator', description: 'Claim seminar, đặt phòng, thiết bị và lịch di chuyển.' },
  { value: 'CONSULTANT', label: 'Consultant', description: 'Xem lịch trình cá nhân và xác nhận chuyến đi.' },
  { value: 'MATERIALS_STAFF', label: 'Materials Staff', description: 'Theo dõi đóng gói và vận chuyển vật tư.' },
  { value: 'ADMIN', label: 'System Admin', description: 'Quản trị dữ liệu hệ thống và tài khoản.' },
]

const statusOptions: { value: UserStatus; label: string }[] = [
  { value: 'ACTIVE', label: 'Active' },
  { value: 'DISABLED', label: 'Disabled' },
]

const pageSize = 8

const initialCreateForm: CreateUserRequest = {
  fullName: '',
  email: '',
  password: '',
  phone: '',
  role: 'BOOKING_STAFF',
  status: 'ACTIVE',
}

type UserFormState = CreateUserRequest

export function CreateUserPage() {
  const [users, setUsers] = useState<UserResponse[]>([])
  const [keyword, setKeyword] = useState('')
  const [roleFilter, setRoleFilter] = useState<UserRole | ''>('')
  const [statusFilter, setStatusFilter] = useState<UserStatus | ''>('')
  const [page, setPage] = useState(0)
  const [totalPages, setTotalPages] = useState(1)
  const [totalElements, setTotalElements] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [actionUserId, setActionUserId] = useState<number | null>(null)
  const [formState, setFormState] = useState<UserFormState>(initialCreateForm)
  const [editingUser, setEditingUser] = useState<UserResponse | null>(null)
  const [editingConsultantProfile, setEditingConsultantProfile] = useState<ConsultantResponse | null>(null)
  const [resettingUser, setResettingUser] = useState<UserResponse | null>(null)
  const [resetPassword, setResetPassword] = useState('')
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [successMsg, setSuccessMsg] = useState<string | null>(null)
  const [isLoadingConsultantProfile, setIsLoadingConsultantProfile] = useState(false)
  const [isUploadingConsultantAvatar, setIsUploadingConsultantAvatar] = useState(false)
  const consultantAvatarInputRef = useRef<HTMLInputElement | null>(null)

  const roleStats = useMemo(
    () =>
      roleOptions.map((role) => ({
        ...role,
        count: users.filter((user) => user.role === role.value).length,
      })),
    [users],
  )

  async function loadUsers(nextPage = page) {
    setIsLoading(true)
    setErrorMsg(null)
    try {
      const response = await api.getUsers({
        keyword: keyword.trim(),
        role: roleFilter,
        status: statusFilter,
        page: nextPage,
        size: pageSize,
      })
      setUsers(response.content)
      setTotalPages(Math.max(response.totalPages, 1))
      setTotalElements(response.totalElements)
      setPage(response.number)
    } catch (error: any) {
      setErrorMsg(error.message || 'Không thể tải danh sách tài khoản.')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    void loadUsers(0)
  }, [roleFilter, statusFilter])

  async function handleSearch(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    await loadUsers(0)
  }

  async function handleCreateUser(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const payload = normalizeCreatePayload(formState)
    const validationError = validateUserPayload(payload)
    if (validationError) {
      setErrorMsg(validationError)
      return
    }

    setIsSubmitting(true)
    setErrorMsg(null)
    setSuccessMsg(null)
    try {
      const createdUser = await api.createUser(payload)
      setSuccessMsg(`Đã tạo tài khoản ${createdUser.fullName}.`)
      setFormState(initialCreateForm)
      await loadUsers(0)
    } catch (error: any) {
      setErrorMsg(error.message || 'Không thể tạo tài khoản.')
    } finally {
      setIsSubmitting(false)
    }
  }

  function openEditModal(user: UserResponse) {
    setEditingUser(user)
    setEditingConsultantProfile(null)
    setFormState({
      fullName: user.fullName,
      email: user.email,
      password: '',
      phone: user.phone,
      role: user.role,
      status: user.status,
    })
    setErrorMsg(null)
    setSuccessMsg(null)
    if (user.role === 'CONSULTANT') {
      void loadConsultantProfileForUser(user.userId)
    }
  }

  async function loadConsultantProfileForUser(userId: number) {
    setIsLoadingConsultantProfile(true)
    try {
      const profile = await api.getConsultantByUserId(userId)
      setEditingConsultantProfile(profile)
    } catch (error: any) {
      setErrorMsg(error.message || 'Không thể tải hồ sơ consultant.')
    } finally {
      setIsLoadingConsultantProfile(false)
    }
  }

  async function handleConsultantAvatarChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file || !editingConsultantProfile) return

    setIsUploadingConsultantAvatar(true)
    setErrorMsg(null)
    setSuccessMsg(null)
    try {
      const updated = await api.uploadConsultantAvatar(editingConsultantProfile.consultantId, file)
      setEditingConsultantProfile(updated)
      setSuccessMsg(`Đã cập nhật ảnh đại diện cho ${updated.fullName}.`)
    } catch (error: any) {
      setErrorMsg(error.message || 'Không thể upload ảnh đại diện consultant.')
    } finally {
      setIsUploadingConsultantAvatar(false)
    }
  }

  async function handleUpdateUser(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!editingUser) return

    const payload: UpdateUserRequest = {
      fullName: formState.fullName.trim(),
      email: formState.email.trim().toLowerCase(),
      phone: formState.phone.trim(),
      role: formState.role,
      status: formState.status,
    }
    if (formState.password.trim()) payload.password = formState.password

    const validationError = validateUserPayload({
      ...initialCreateForm,
      ...payload,
      password: payload.password || 'placeholder-password',
    })
    if (validationError) {
      setErrorMsg(validationError)
      return
    }

    setIsSubmitting(true)
    setErrorMsg(null)
    setSuccessMsg(null)
    try {
      const updatedUser = await api.updateUser(editingUser.userId, payload)
      setSuccessMsg(`Đã cập nhật tài khoản ${updatedUser.fullName}.`)
      setEditingUser(null)
      setFormState(initialCreateForm)
      await loadUsers(page)
    } catch (error: any) {
      setErrorMsg(error.message || 'Không thể cập nhật tài khoản.')
    } finally {
      setIsSubmitting(false)
    }
  }

  async function handleToggleStatus(user: UserResponse) {
    const nextStatus: UserStatus = user.status === 'ACTIVE' ? 'DISABLED' : 'ACTIVE'
    setActionUserId(user.userId)
    setErrorMsg(null)
    setSuccessMsg(null)
    try {
      const updatedUser = await api.updateUserStatus(user.userId, nextStatus)
      setSuccessMsg(
        `${updatedUser.fullName} đã được chuyển sang trạng thái ${statusLabel(updatedUser.status)}.`,
      )
      await loadUsers(page)
    } catch (error: any) {
      setErrorMsg(error.message || 'Không thể cập nhật trạng thái tài khoản.')
    } finally {
      setActionUserId(null)
    }
  }

  async function handleResetPassword(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!resettingUser) return
    if (resetPassword.length < 8) {
      setErrorMsg('Mật khẩu reset phải có ít nhất 8 ký tự.')
      return
    }

    setIsSubmitting(true)
    setErrorMsg(null)
    setSuccessMsg(null)
    try {
      await api.resetUserPassword(resettingUser.userId, resetPassword)
      setSuccessMsg(`Đã reset mật khẩu cho ${resettingUser.fullName}.`)
      setResettingUser(null)
      setResetPassword('')
    } catch (error: any) {
      setErrorMsg(error.message || 'Không thể reset mật khẩu.')
    } finally {
      setIsSubmitting(false)
    }
  }

  function closeModal() {
    if (isSubmitting) return
    setEditingUser(null)
    setEditingConsultantProfile(null)
    setResettingUser(null)
    setResetPassword('')
    setFormState(initialCreateForm)
  }

  return (
    <div className="space-y-8">
      <PageHeader
        title="Quản lý tài khoản"
        description="Tạo mới, rà soát, cập nhật thông tin và khóa/mở tài khoản người dùng."
        icon={<UserPlus className="h-10 w-10" strokeWidth={2.3} />}
      />

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        {roleStats.map((role) => (
          <div key={role.value} className="rounded-xl border border-slate-200 bg-white p-4 shadow-lg shadow-slate-200/60">
            <div className="text-[11px] font-black uppercase tracking-wider text-slate-400">{role.label}</div>
            <div className="mt-3 text-3xl font-black text-[#0B3970]">{role.count}</div>
            <p className="mt-2 text-xs leading-5 text-slate-500">{role.description}</p>
          </div>
        ))}
      </section>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_390px]">
        <section className="rounded-xl border border-slate-200 bg-white shadow-xl shadow-slate-200/70">
          <div className="border-b border-slate-100 p-5">
            <form onSubmit={handleSearch} className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_190px_160px_auto]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                <input
                  value={keyword}
                  onChange={(event) => setKeyword(event.target.value)}
                  placeholder="Tìm theo tên, email hoặc số điện thoại"
                  className="h-11 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-4 text-sm font-bold outline-hidden transition focus:border-[#126CB0] focus:ring-2 focus:ring-[#126CB0]/20"
                />
              </div>
              <select
                value={roleFilter}
                onChange={(event) => setRoleFilter(event.target.value as UserRole | '')}
                className="h-11 rounded-xl border border-slate-200 bg-white px-3 text-sm font-bold outline-hidden transition focus:border-[#126CB0] focus:ring-2 focus:ring-[#126CB0]/20"
              >
                <option value="">Tất cả vai trò</option>
                {roleOptions.map((role) => (
                  <option key={role.value} value={role.value}>
                    {role.label}
                  </option>
                ))}
              </select>
              <select
                value={statusFilter}
                onChange={(event) => setStatusFilter(event.target.value as UserStatus | '')}
                className="h-11 rounded-xl border border-slate-200 bg-white px-3 text-sm font-bold outline-hidden transition focus:border-[#126CB0] focus:ring-2 focus:ring-[#126CB0]/20"
              >
                <option value="">Mọi trạng thái</option>
                {statusOptions.map((status) => (
                  <option key={status.value} value={status.value}>
                    {status.label}
                  </option>
                ))}
              </select>
              <button
                type="submit"
                className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-[#0B3970] px-5 text-sm font-extrabold text-white transition hover:bg-[#126CB0]"
              >
                <Search className="h-4.5 w-4.5" />
                Tìm
              </button>
            </form>
          </div>

          <StatusMessage errorMsg={errorMsg} successMsg={successMsg} />

          <div>
            <table className="w-full table-fixed border-separate border-spacing-0">
              <colgroup>
                <col className="w-[24%]" />
                <col className="w-[30%]" />
                <col className="w-[18%]" />
                <col className="w-[18%]" />
                <col className="w-[10%]" />
              </colgroup>
              <thead>
                <tr className="bg-[#F8FBFF] text-left text-[11px] font-black uppercase tracking-wider text-slate-500">
                  <th className="px-5 py-4">Người dùng</th>
                  <th className="px-5 py-4">Liên hệ</th>
                  <th className="px-5 py-4">Vai trò</th>
                  <th className="px-5 py-4">Trạng thái</th>
                  <th className="px-5 py-4 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan={5} className="px-5 py-12 text-center text-sm font-bold text-slate-400">
                      Đang tải danh sách tài khoản...
                    </td>
                  </tr>
                ) : users.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-5 py-12 text-center text-sm font-bold text-slate-400">
                      Không tìm thấy tài khoản phù hợp.
                    </td>
                  </tr>
                ) : (
                  users.map((user) => (
                    <UserRow
                      key={user.userId}
                      user={user}
                      isBusy={actionUserId === user.userId}
                      onEdit={() => openEditModal(user)}
                      onReset={() => {
                        setResettingUser(user)
                        setResetPassword('')
                        setErrorMsg(null)
                        setSuccessMsg(null)
                      }}
                      onToggleStatus={() => void handleToggleStatus(user)}
                    />
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="flex items-center justify-between border-t border-slate-100 px-5 py-4">
            <div className="text-xs font-bold text-slate-500">
              Tổng cộng <span className="text-[#0B3970]">{totalElements}</span> tài khoản
            </div>
            <div className="flex items-center gap-2">
              <IconButton
                label="Trang trước"
                disabled={page === 0}
                onClick={() => void loadUsers(Math.max(page - 1, 0))}
              >
                <ChevronLeft className="h-4.5 w-4.5" />
              </IconButton>
              <span className="min-w-20 text-center text-xs font-black text-[#0B3970]">
                {page + 1} / {totalPages}
              </span>
              <IconButton
                label="Trang sau"
                disabled={page >= totalPages - 1}
                onClick={() => void loadUsers(Math.min(page + 1, totalPages - 1))}
              >
                <ChevronRight className="h-4.5 w-4.5" />
              </IconButton>
            </div>
          </div>
        </section>

        <CreateUserPanel
          formState={formState}
          isSubmitting={isSubmitting}
          onChange={(nextState) => setFormState((current) => ({ ...current, ...nextState }))}
          onSubmit={handleCreateUser}
        />
      </div>

      {editingUser && (
        <Modal title={`Cập nhật ${editingUser.fullName}`} onClose={closeModal}>
          {editingUser.role === 'CONSULTANT' && (
            <ConsultantAvatarAdminPanel
              consultant={editingConsultantProfile}
              inputRef={consultantAvatarInputRef}
              isLoading={isLoadingConsultantProfile}
              isUploading={isUploadingConsultantAvatar}
              onAvatarChange={handleConsultantAvatarChange}
            />
          )}
          <UserForm
            formState={formState}
            isSubmitting={isSubmitting}
            submitLabel="Lưu thay đổi"
            passwordRequired={false}
            onChange={(nextState) => setFormState((current) => ({ ...current, ...nextState }))}
            onSubmit={handleUpdateUser}
          />
        </Modal>
      )}

      {resettingUser && (
        <Modal title={`Reset mật khẩu ${resettingUser.fullName}`} onClose={closeModal}>
          <form onSubmit={handleResetPassword} className="space-y-5">
            <TextInput
              id="resetPassword"
              label="Mật khẩu tạm thời"
              value={resetPassword}
              onChange={setResetPassword}
              placeholder="Tối thiểu 8 ký tự"
              type="password"
              icon={<KeyRound className="h-5 w-5" />}
              required
            />
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-[#0B3970] px-5 text-sm font-extrabold text-white transition hover:bg-[#126CB0] disabled:cursor-not-allowed disabled:bg-slate-300"
            >
              <RotateCcw className="h-4.5 w-4.5" />
              {isSubmitting ? 'Đang reset...' : 'Reset mật khẩu'}
            </button>
          </form>
        </Modal>
      )}
    </div>
  )
}

function CreateUserPanel({
  formState,
  isSubmitting,
  onChange,
  onSubmit,
}: {
  formState: UserFormState
  isSubmitting: boolean
  onChange: (nextState: Partial<UserFormState>) => void
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void
}) {
  return (
    <aside className="rounded-xl border border-slate-200 bg-white p-5 shadow-xl shadow-slate-200/70">
      <div className="flex items-center gap-3">
        <div className="grid h-11 w-11 place-items-center rounded-xl bg-[#E9FFFB] text-[#0B3970]">
          <UserPlus className="h-5.5 w-5.5" />
        </div>
        <div>
          <h2 className="text-base font-black text-[#0B3970]">Tạo tài khoản</h2>
          <p className="text-xs font-semibold text-slate-500">Chỉ admin có quyền thêm người dùng.</p>
        </div>
      </div>
      <UserForm
        formState={formState}
        isSubmitting={isSubmitting}
        submitLabel="Tạo tài khoản"
        passwordRequired
        onChange={onChange}
        onSubmit={onSubmit}
      />
    </aside>
  )
}

function ConsultantAvatarAdminPanel({
  consultant,
  inputRef,
  isLoading,
  isUploading,
  onAvatarChange,
}: {
  consultant: ConsultantResponse | null
  inputRef: React.RefObject<HTMLInputElement | null>
  isLoading: boolean
  isUploading: boolean
  onAvatarChange: (event: React.ChangeEvent<HTMLInputElement>) => void
}) {
  const isDisabled = isLoading || isUploading || !consultant

  return (
    <div className="mb-5 rounded-xl border border-cyan-100 bg-cyan-50/60 p-4">
      <div className="flex items-center gap-4">
        <div className="h-16 w-16 shrink-0 overflow-hidden rounded-full border-2 border-[#38D9CD] bg-white">
          {isLoading || isUploading ? (
            <div className="grid h-full w-full place-items-center text-[#0B3970]">
              <Loader2 className="h-5 w-5 animate-spin" />
            </div>
          ) : consultant?.avatarUrl ? (
            <img
              src={`http://localhost:8080/api/v1/facility-contracts/view-file?path=${encodeURIComponent(consultant.avatarUrl)}`}
              alt="Avatar consultant"
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="grid h-full w-full place-items-center bg-[#B9FFF1] text-[#009C8E]">
              <User className="h-9 w-9" />
            </div>
          )}
        </div>

        <div className="min-w-0 flex-1">
          <p className="text-xs font-black uppercase tracking-wider text-cyan-700">
            Ảnh đại diện consultant
          </p>
          <p className="mt-1 text-xs font-semibold leading-5 text-slate-500">
            Admin quản lý ảnh đại diện cho consultant. Consultant chỉ xem ảnh trong lịch trình cá nhân.
          </p>
        </div>

        <button
          type="button"
          disabled={isDisabled}
          onClick={() => inputRef.current?.click()}
          className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-[#0B3970] px-4 text-xs font-black text-white transition hover:bg-[#126CB0] disabled:cursor-not-allowed disabled:bg-slate-300"
        >
          <Camera className="h-4 w-4" />
          {isLoading ? 'Đang tải...' : isUploading ? 'Đang upload...' : 'Upload ảnh'}
        </button>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          disabled={isDisabled}
          onChange={onAvatarChange}
        />
      </div>
    </div>
  )
}

function UserForm({
  formState,
  isSubmitting,
  submitLabel,
  passwordRequired,
  onChange,
  onSubmit,
}: {
  formState: UserFormState
  isSubmitting: boolean
  submitLabel: string
  passwordRequired: boolean
  onChange: (nextState: Partial<UserFormState>) => void
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void
}) {
  return (
    <form onSubmit={onSubmit} className="mt-5 space-y-4">
      <TextInput
        id="fullName"
        label="Họ và tên"
        value={formState.fullName}
        onChange={(value) => onChange({ fullName: value })}
        placeholder="Nguyễn Văn A"
        required
      />
      <TextInput
        id="email"
        label="Email"
        value={formState.email}
        onChange={(value) => onChange({ email: value })}
        placeholder="name@training.com"
        type="email"
        icon={<Mail className="h-5 w-5" />}
        required
      />
      <TextInput
        id="phone"
        label="Số điện thoại"
        value={formState.phone}
        onChange={(value) => onChange({ phone: value })}
        placeholder="0900000000"
        icon={<Phone className="h-5 w-5" />}
        required
      />
      <TextInput
        id="password"
        label={passwordRequired ? 'Mật khẩu tạm thời' : 'Mật khẩu mới'}
        value={formState.password}
        onChange={(value) => onChange({ password: value })}
        placeholder={passwordRequired ? 'Tối thiểu 6 ký tự' : 'Để trống nếu không đổi'}
        type="password"
        icon={<KeyRound className="h-5 w-5" />}
        required={passwordRequired}
      />
      <SelectInput
        id="role"
        label="Vai trò"
        value={formState.role}
        onChange={(value) => onChange({ role: value as UserRole })}
        options={roleOptions}
      />
      <SelectInput
        id="status"
        label="Trạng thái"
        value={formState.status}
        onChange={(value) => onChange({ status: value as UserStatus })}
        options={statusOptions}
      />
      <button
        type="submit"
        disabled={isSubmitting}
        className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-[#0B3970] px-5 text-sm font-extrabold text-white transition hover:bg-[#126CB0] disabled:cursor-not-allowed disabled:bg-slate-300"
      >
        <UserPlus className="h-4.5 w-4.5" />
        {isSubmitting ? 'Đang xử lý...' : submitLabel}
      </button>
    </form>
  )
}

function UserRow({
  user,
  isBusy,
  onEdit,
  onReset,
  onToggleStatus,
}: {
  user: UserResponse
  isBusy: boolean
  onEdit: () => void
  onReset: () => void
  onToggleStatus: () => void
}) {
  return (
    <tr className="border-t border-slate-100 text-sm">
      <td className="border-t border-slate-100 px-5 py-4 align-top">
        <div className="break-words font-black text-[#0B3970]">{user.fullName}</div>
        <div className="mt-1 text-xs font-bold text-slate-400">ID #{user.userId}</div>
      </td>
      <td className="border-t border-slate-100 px-5 py-4 align-top">
        <div className="break-all font-bold text-slate-700">{user.email}</div>
        <div className="mt-1 text-xs font-bold text-slate-400">{user.phone}</div>
      </td>
      <td className="border-t border-slate-100 px-5 py-4 align-top">
        <span className="inline-flex max-w-full rounded-2xl bg-[#E9F5FF] px-3 py-2 text-xs font-black leading-5 text-[#0B3970] break-words">
          {roleLabel(user.role)}
        </span>
      </td>
      <td className="border-t border-slate-100 px-5 py-4 align-top">
        <div className="flex flex-wrap items-center gap-2">
          <span
            className={`inline-flex h-9 items-center gap-2 rounded-full px-3 text-xs font-black ${
              user.status === 'ACTIVE'
                ? 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200'
                : 'bg-slate-100 text-slate-600 ring-1 ring-slate-200'
            }`}
          >
            {user.status === 'ACTIVE' ? (
              <ShieldCheck className="h-4 w-4" />
            ) : (
              <Lock className="h-4 w-4" />
            )}
            <span>{user.status === 'ACTIVE' ? 'Hoạt động' : 'Đã khóa'}</span>
          </span>
          <button
            type="button"
            disabled={isBusy}
            onClick={onToggleStatus}
            title={user.status === 'ACTIVE' ? 'Khóa tài khoản này' : 'Mở khóa tài khoản này'}
            aria-label={user.status === 'ACTIVE' ? 'Khóa tài khoản này' : 'Mở khóa tài khoản này'}
            className={`inline-flex h-9 items-center gap-1.5 rounded-full border px-3 text-xs font-black transition disabled:cursor-not-allowed disabled:opacity-60 ${
              user.status === 'ACTIVE'
                ? 'border-red-200 bg-red-50 text-red-700 hover:bg-red-100'
                : 'border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
            }`}
          >
            {user.status === 'ACTIVE' ? (
              <Lock className="h-3.5 w-3.5" />
            ) : (
              <ShieldCheck className="h-3.5 w-3.5" />
            )}
            <span>{isBusy ? '...' : user.status === 'ACTIVE' ? 'Khóa' : 'Mở'}</span>
          </button>
        </div>
      </td>
      <td className="border-t border-slate-100 px-5 py-4 align-top">
        <div className="flex justify-end gap-2">
          <IconButton label="Sửa tài khoản" onClick={onEdit}>
            <Pencil className="h-4.5 w-4.5" />
          </IconButton>
          <IconButton label="Reset mật khẩu" onClick={onReset}>
            <RotateCcw className="h-4.5 w-4.5" />
          </IconButton>
        </div>
      </td>
    </tr>
  )
}

function StatusMessage({ errorMsg, successMsg }: { errorMsg: string | null; successMsg: string | null }) {
  if (!errorMsg && !successMsg) return null
  return (
    <div className="px-5 pt-5">
      {errorMsg && (
        <div className="flex items-start gap-3 rounded-xl border border-red-100 bg-red-50 p-4 text-sm font-bold text-red-600">
          <ShieldAlert className="h-5 w-5 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}
      {successMsg && (
        <div className="flex items-start gap-3 rounded-xl border border-emerald-100 bg-emerald-50 p-4 text-sm font-bold text-emerald-700">
          <CheckCircle2 className="h-5 w-5 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}
    </div>
  )
}

function Modal({
  title,
  children,
  onClose,
}: {
  title: string
  children: React.ReactNode
  onClose: () => void
}) {
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/40 p-4 backdrop-blur-sm">
      <div className="w-full max-w-xl rounded-2xl bg-white p-6 shadow-2xl">
        <div className="mb-4 flex items-center justify-between gap-4">
          <h2 className="text-lg font-black text-[#0B3970]">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg px-3 py-2 text-sm font-black text-slate-500 transition hover:bg-slate-100"
          >
            Đóng
          </button>
        </div>
        {children}
      </div>
    </div>
  )
}

type TextInputProps = {
  id: string
  label: string
  value: string
  onChange: (value: string) => void
  placeholder: string
  type?: string
  icon?: React.ReactNode
  required?: boolean
}

function TextInput({
  id,
  label,
  value,
  onChange,
  placeholder,
  type = 'text',
  icon,
  required,
}: TextInputProps) {
  return (
    <label htmlFor={id} className="block">
      <span className="text-xs font-extrabold uppercase tracking-wider text-slate-500">
        {label}
        {required && <span className="text-red-500"> *</span>}
      </span>
      <div className="relative mt-2">
        {icon && (
          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
            {icon}
          </span>
        )}
        <input
          id={id}
          type={type}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          required={required}
          className={`h-11 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm font-bold text-[#18395F] outline-hidden transition placeholder:text-slate-400 focus:border-[#126CB0] focus:ring-2 focus:ring-[#126CB0]/20 ${
            icon ? 'pl-11' : ''
          }`}
        />
      </div>
    </label>
  )
}

type SelectInputProps = {
  id: string
  label: string
  value: string
  onChange: (value: string) => void
  options: { value: string; label: string }[]
}

function SelectInput({ id, label, value, onChange, options }: SelectInputProps) {
  return (
    <label htmlFor={id} className="block">
      <span className="text-xs font-extrabold uppercase tracking-wider text-slate-500">{label}</span>
      <select
        id={id}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="mt-2 h-11 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm font-bold text-[#18395F] outline-hidden transition focus:border-[#126CB0] focus:ring-2 focus:ring-[#126CB0]/20"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  )
}

function IconButton({
  label,
  children,
  disabled,
  onClick,
}: {
  label: string
  children: React.ReactNode
  disabled?: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      disabled={disabled}
      onClick={onClick}
      className="grid h-9 w-9 place-items-center rounded-lg border border-slate-200 bg-white text-slate-600 transition hover:border-[#126CB0] hover:text-[#0B3970] disabled:cursor-not-allowed disabled:opacity-40"
    >
      {children}
    </button>
  )
}

function normalizeCreatePayload(formState: UserFormState): CreateUserRequest {
  return {
    fullName: formState.fullName.trim(),
    email: formState.email.trim().toLowerCase(),
    password: formState.password,
    phone: formState.phone.trim(),
    role: formState.role,
    status: formState.status,
  }
}

function validateUserPayload(payload: CreateUserRequest) {
  if (!payload.fullName || !payload.email || !payload.password || !payload.phone) {
    return 'Vui lòng nhập đầy đủ họ tên, email, mật khẩu và số điện thoại.'
  }
  if (payload.password.length < 6) {
    return 'Mật khẩu phải có ít nhất 6 ký tự.'
  }
  return null
}

function roleLabel(role: UserRole) {
  return roleOptions.find((option) => option.value === role)?.label ?? role
}

function statusLabel(status: UserStatus) {
  return statusOptions.find((option) => option.value === status)?.label ?? status
}
