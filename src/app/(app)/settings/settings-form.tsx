'use client'

import { useActionState, useState } from 'react'
import { updateProfile, changePassword } from './actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'

interface Profile {
  name: string
  email: string
  linkedin_url: string | null
  location: string | null
  profile_synced_at: string | null
}

interface SettingsFormProps {
  profile: Profile
}

export function SettingsForm({ profile }: SettingsFormProps) {
  const [profileState, profileAction, isProfilePending] = useActionState(updateProfile, null)
  const [passwordState, passwordAction, isPasswordPending] = useActionState(changePassword, null)
  const [isSyncing, setIsSyncing] = useState(false)
  const [syncMessage, setSyncMessage] = useState<string | null>(null)

  async function handleSync() {
    setIsSyncing(true)
    setSyncMessage(null)
    try {
      const res = await fetch('/api/profile/sync', { method: 'POST' })
      const data = await res.json()
      if (!res.ok) {
        setSyncMessage(data.error ?? 'Sync failed')
      } else {
        setSyncMessage('LinkedIn profile synced successfully')
      }
    } catch {
      setSyncMessage('Network error during sync')
    } finally {
      setIsSyncing(false)
    }
  }

  const formattedSyncDate = profile.profile_synced_at
    ? new Date(profile.profile_synced_at).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    : 'Never'

  return (
    <div className="space-y-6">
      {/* Profile Info */}
      <Card>
        <CardHeader>
          <CardTitle>Profile</CardTitle>
          <CardDescription>Update your name and location</CardDescription>
        </CardHeader>
        <CardContent>
          <form action={profileAction} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                name="name"
                type="text"
                defaultValue={profile.name}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                name="location"
                type="text"
                placeholder="e.g. Dubai, UAE"
                defaultValue={profile.location ?? ''}
              />
            </div>
            <div className="space-y-2">
              <Label>LinkedIn URL</Label>
              <Input
                value={profile.linkedin_url ?? 'Not set'}
                readOnly
                className="bg-muted text-muted-foreground"
              />
              <p className="text-xs text-muted-foreground">
                LinkedIn URL is managed by your admin
              </p>
            </div>
            {profileState?.error && (
              <p className="text-sm text-destructive">{profileState.error}</p>
            )}
            {profileState?.success && (
              <p className="text-sm text-green-600">{profileState.success}</p>
            )}
            <Button type="submit" disabled={isProfilePending}>
              {isProfilePending ? 'Saving...' : 'Save Changes'}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* LinkedIn Sync */}
      <Card>
        <CardHeader>
          <CardTitle>LinkedIn Profile</CardTitle>
          <CardDescription>
            Re-sync your LinkedIn data used for job matching
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>Last synced:</span>
            <span className="font-medium text-foreground">{formattedSyncDate}</span>
          </div>
          {syncMessage && (
            <p
              className={`text-sm ${
                syncMessage.includes('success') ? 'text-green-600' : 'text-destructive'
              }`}
            >
              {syncMessage}
            </p>
          )}
          <Button
            variant="outline"
            onClick={handleSync}
            disabled={isSyncing || !profile.linkedin_url}
          >
            {isSyncing ? 'Syncing...' : 'Re-sync LinkedIn Profile'}
          </Button>
          {!profile.linkedin_url && (
            <p className="text-xs text-muted-foreground">
              No LinkedIn URL set. Contact your admin.
            </p>
          )}
        </CardContent>
      </Card>

      <Separator />

      {/* Change Password */}
      <Card>
        <CardHeader>
          <CardTitle>Change Password</CardTitle>
          <CardDescription>Set a new password for your account</CardDescription>
        </CardHeader>
        <CardContent>
          <form action={passwordAction} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="newPassword">New Password</Label>
              <Input
                id="newPassword"
                name="newPassword"
                type="password"
                required
                autoComplete="new-password"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm New Password</Label>
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                required
                autoComplete="new-password"
              />
            </div>
            {passwordState?.error && (
              <p className="text-sm text-destructive">{passwordState.error}</p>
            )}
            {passwordState?.success && (
              <p className="text-sm text-green-600">{passwordState.success}</p>
            )}
            <Button type="submit" disabled={isPasswordPending}>
              {isPasswordPending ? 'Updating...' : 'Update Password'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
