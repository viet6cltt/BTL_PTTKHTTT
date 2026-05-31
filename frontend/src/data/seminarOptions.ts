import type { SelectOption } from '../types'

export type SeminarType = {
  id: number
  typeName: string
  description: string
  durationHours: number
  arrangementNotes: string
}

export const seminarTypeData: SeminarType[] = [
  {
    id: 1,
    typeName: 'Quản lý dự án cơ bản',
    description:
      'Khóa đào tạo giới thiệu về lập kế hoạch dự án, quản lý tiến độ, rủi ro và giao tiếp với các bên liên quan.',
    durationHours: 16,
    arrangementNotes:
      'Bố trí lớp học truyền thống. Cần máy chiếu, màn chiếu, bàn giảng viên và không gian thảo luận nhóm.',
  },
  {
    id: 2,
    typeName: 'Kỹ năng lãnh đạo cho quản lý cấp trung',
    description:
      'Hội thảo thực hành dành cho quản lý cấp trung về lãnh đạo nhóm, giao tiếp, ra quyết định và xử lý xung đột.',
    durationHours: 12,
    arrangementNotes:
      'Ưu tiên bố trí bàn tròn hoặc nhóm nhỏ. Cần không gian cho hoạt động thảo luận và bài tập tình huống.',
  },
  {
    id: 3,
    typeName: 'Đào tạo kỹ thuật phần mềm thực hành',
    description:
      'Khóa đào tạo thực hành về quy trình phát triển phần mềm, công cụ lập trình, kiểm thử và triển khai ứng dụng.',
    durationHours: 24,
    arrangementNotes:
      'Cần phòng có ổ điện đầy đủ, Internet ổn định, máy chiếu và bàn cho học viên sử dụng laptop.',
  },
  {
    id: 4,
    typeName: 'Kỹ năng bán hàng và đàm phán',
    description:
      'Khóa đào tạo về quy trình bán hàng, chăm sóc khách hàng, xử lý phản đối và kỹ năng đàm phán thương mại.',
    durationHours: 8,
    arrangementNotes:
      'Bố trí lớp học hoặc rạp hát. Cần micro không dây, máy chiếu và khu vực thực hành đóng vai.',
  },
  {
    id: 5,
    typeName: 'An toàn lao động và tuân thủ nội bộ',
    description:
      'Khóa đào tạo về quy định an toàn lao động, chính sách nội bộ, quy trình báo cáo sự cố và tuân thủ doanh nghiệp.',
    durationHours: 6,
    arrangementNotes:
      'Bố trí lớp học đơn giản. Cần máy chiếu, màn chiếu và hệ thống âm thanh cơ bản.',
  },
]

export const seminarTypes: SelectOption[] = [
  { value: '', label: 'Chọn loại seminar' },
  ...seminarTypeData.map((seminarType) => ({
    value: String(seminarType.id),
    label: seminarType.typeName,
  })),
]

export const seminarTypeById: Record<string, SeminarType> =
  Object.fromEntries(
    seminarTypeData.map((seminarType) => [String(seminarType.id), seminarType]),
  )

export type Consultant = {
  id: number
  fullName: string
  phone: string
  email: string
  address: string
  city: string
  country: string
  work: string
}

export const consultantData: Consultant[] = [
  {
    id: 1,
    fullName: 'Lê Minh Tuấn',
    phone: '0987 654 321',
    email: 'leminhtuan@gmail.com',
    address: '12 Nguyễn Trãi',
    city: 'Hà Nội',
    country: 'Việt Nam',
    work: 'Quản lý dự án và vận hành',
  },
  {
    id: 2,
    fullName: 'Trần Thu Hà',
    phone: '0912 345 678',
    email: 'tranthuha@gmail.com',
    address: '25 Bạch Đằng',
    city: 'Đà Nẵng',
    country: 'Việt Nam',
    work: 'Lãnh đạo và truyền thông nội bộ',
  },
  {
    id: 3,
    fullName: 'Phạm Quốc Huy',
    phone: '0903 222 111',
    email: 'phamquochuy@gmail.com',
    address: '88 Võ Văn Tần',
    city: 'TP. Hồ Chí Minh',
    country: 'Việt Nam',
    work: 'Kỹ thuật phần mềm và đào tạo thực hành',
  },
]

export const consultants: SelectOption[] = [
  { value: '', label: 'Chọn chuyên gia đào tạo' },
  ...consultantData.map((consultant) => ({
    value: String(consultant.id),
    label: consultant.fullName,
  })),
]

export const consultantById: Record<string, Consultant> = Object.fromEntries(
  consultantData.map((consultant) => [String(consultant.id), consultant]),
)

export type UserSummary = {
  id: number
  fullName: string
  email: string
}

export const bookingDepartmentUsers: SelectOption[] = [
  { value: '', label: 'Chọn nhân viên booking' },
  { value: '1', label: 'Nguyễn Minh Booking' },
  { value: '2', label: 'Phạm Lan Booking' },
]
