import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { TopNav } from '@/components/nav/top-nav'

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('name, email, role')
    .eq('id', user.id)
    .single()

  return (
    <div className="min-h-screen bg-background">
      <TopNav
        userName={profile?.name ?? user.email ?? 'User'}
        userEmail={profile?.email ?? user.email ?? ''}
        isAdmin={profile?.role === 'admin'}
      />
      <main className="container mx-auto px-4 py-6">{children}</main>
    </div>
  )
}
