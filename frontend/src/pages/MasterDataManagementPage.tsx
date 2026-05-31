import { ListChecks, MonitorCog, Package } from 'lucide-react'
import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { AvEquipmentMasterDataPage } from './AvEquipmentMasterDataPage'
import { MaterialMasterDataPage } from './MaterialMasterDataPage'
import { SeminarTypeMasterDataPage } from './SeminarTypeMasterDataPage'

type MasterDataTab = 'seminarTypes' | 'materials' | 'avEquipments'

type MasterDataManagementPageProps = {
  onSelectSeminarType: (id: number) => void
}

export function MasterDataManagementPage({ onSelectSeminarType }: MasterDataManagementPageProps) {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState<MasterDataTab>('seminarTypes')
  const canModifyMasterData = user?.role === 'ADMIN'

  if (activeTab === 'avEquipments') {
    return (
      <div>
        <MasterDataTabs activeTab={activeTab} onChange={setActiveTab} />
        <AvEquipmentMasterDataPage canModifyMasterData={canModifyMasterData} />
      </div>
    )
  }

  if (activeTab === 'materials') {
    return (
      <div>
        <MasterDataTabs activeTab={activeTab} onChange={setActiveTab} />
        <MaterialMasterDataPage canModifyMasterData={canModifyMasterData} />
      </div>
    )
  }

  return (
    <div>
      <MasterDataTabs activeTab={activeTab} onChange={setActiveTab} />
      <SeminarTypeMasterDataPage
        canModifyMasterData={canModifyMasterData}
        onSelectSeminarType={onSelectSeminarType}
      />
    </div>
  )
}

type MasterDataTabsProps = {
  activeTab: MasterDataTab
  onChange: (tab: MasterDataTab) => void
}

function MasterDataTabs({ activeTab, onChange }: MasterDataTabsProps) {
  return (
    <div className="fixed right-6 top-24 z-40 flex rounded-2xl border border-slate-200 bg-white p-1 shadow-xl shadow-slate-200/70 lg:right-8">
      <button
        type="button"
        onClick={() => onChange('seminarTypes')}
        className={`inline-flex h-10 items-center gap-2 rounded-xl px-4 text-sm font-extrabold transition ${
          activeTab === 'seminarTypes'
            ? 'bg-[#5DF8D8] text-[#093C5D] shadow-md shadow-teal-200/60'
            : 'text-slate-500 hover:bg-[#F0FFFC] hover:text-[#0B3970]'
        }`}
      >
        <ListChecks className="h-4 w-4" />
        Loại seminar
      </button>
      <button
        type="button"
        onClick={() => onChange('materials')}
        className={`inline-flex h-10 items-center gap-2 rounded-xl px-4 text-sm font-extrabold transition ${
          activeTab === 'materials'
            ? 'bg-[#5DF8D8] text-[#093C5D] shadow-md shadow-teal-200/60'
            : 'text-slate-500 hover:bg-[#F0FFFC] hover:text-[#0B3970]'
        }`}
      >
        <Package className="h-4 w-4" />
        Vật tư
      </button>
      <button
        type="button"
        onClick={() => onChange('avEquipments')}
        className={`inline-flex h-10 items-center gap-2 rounded-xl px-4 text-sm font-extrabold transition ${
          activeTab === 'avEquipments'
            ? 'bg-[#5DF8D8] text-[#093C5D] shadow-md shadow-teal-200/60'
            : 'text-slate-500 hover:bg-[#F0FFFC] hover:text-[#0B3970]'
        }`}
      >
        <MonitorCog className="h-4 w-4" />
        Thiết bị
      </button>
    </div>
  )
}
