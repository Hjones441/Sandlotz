import AppNav from '@/components/layout/AppNav'

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col min-h-screen bg-[#0e0825]">
      {/* Scrollable content area — leaves room for fixed bottom nav */}
      <main id="main-content" className="flex-1 pb-24">
        {children}
      </main>
      <AppNav />
    </div>
  )
}
