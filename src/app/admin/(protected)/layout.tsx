import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = cookies()
  const session = cookieStore.get('admin_session')

  if (!session || session.value !== '1') {
    redirect('/admin/login')
  }

  return (
    <div style={{ minHeight: '100vh', background: '#0f0f0f', color: '#f5f5f5', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' }}>
      {children}
    </div>
  )
}
