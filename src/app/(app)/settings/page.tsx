import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { SettingsForm } from './settings-form'

export default async function SettingsPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: profile, error } = await supabase
    .from('profiles')
    .select('name, email, linkedin_url, location, profile_synced_at, people_search_template')
    .eq('id', user.id)
    .single()

  if (error || !profile) {
    return (
      <div>
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="mt-2 text-destructive">Failed to load profile</p>
      </div>
    )
  }

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-muted-foreground mt-1">Manage your profile and account settings</p>
      </div>
      <SettingsForm profile={profile} />
    </div>
  )
}
