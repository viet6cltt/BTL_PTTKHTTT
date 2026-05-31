import type { ReactNode } from 'react'
import { PageHeader } from '../layout/PageHeader'
import { Sidebar } from '../layout/Sidebar'
import { TopNavbar } from '../layout/TopNavbar'

type MasterDataPageLayoutProps = {
  activeChild: string
  title: string
  description: string
  icon: ReactNode
  children: ReactNode
}

export function MasterDataPageLayout({
  activeChild,
  title,
  description,
  icon,
  children,
}: MasterDataPageLayoutProps) {
  return (
    <div className="min-h-screen bg-[#F5FAFF] font-sans text-[#18395F]">
      <Sidebar activeSection="Master data" activeChild={activeChild} />
      <div className="lg:pl-[270px]">
        <TopNavbar />
        <main className="relative overflow-hidden px-6 py-8 md:px-8 lg:px-6 xl:px-8">
          <div className="pointer-events-none absolute -right-36 top-11 h-100 w-100 rounded-full bg-[#5DF8D8]/35 blur-sm" />
          <div className="relative mx-auto max-w-[1220px] space-y-7">
            <PageHeader title={title} description={description} icon={icon} />
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}

