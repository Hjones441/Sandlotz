export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-brand-purple-dark flex flex-col">
      {children}
    </div>
  )
}
