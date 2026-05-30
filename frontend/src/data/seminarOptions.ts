import type { SelectOption } from '../types'

export const seminarTypes: SelectOption[] = [
  { value: '', label: 'Chọn loại seminar' },
  { value: 'soft-skills', label: 'Kỹ năng mềm' },
  { value: 'professional', label: 'Chuyên môn' },
  { value: 'management', label: 'Quản lý' },
  { value: 'compliance', label: 'Tuân thủ nội bộ' },
]

export const consultants: SelectOption[] = [
  { value: '', label: 'Chọn chuyên gia đào tạo' },
  { value: 'le-minh-tuan', label: 'Lê Minh Tuấn' },
  { value: 'tran-thu-ha', label: 'Trần Thu Hà' },
  { value: 'pham-quoc-huy', label: 'Phạm Quốc Huy' },
]

export const employees: SelectOption[] = [
  { value: '', label: 'Chọn nhân viên phụ trách' },
  { value: 'nguyen-van-a', label: 'Nguyễn Văn A' },
  { value: 'le-thanh-binh', label: 'Lê Thanh Bình' },
  { value: 'do-minh-anh', label: 'Đỗ Minh Anh' },
]
