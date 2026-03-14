'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export type ActionResult = { error?: string; success?: string }

export async function updateProfile(
  _prev: ActionResult | null,
  formData: FormData
): Promise<ActionResult> {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return { error: 'Not authenticated' }

  const name = (formData.get('name') as string)?.trim()
  const location = (formData.get('location') as string)?.trim()
  const linkedin_url = (formData.get('linkedin_url') as string)?.trim()

  if (!name) return { error: 'Name is required' }

  const { error } = await supabase
    .from('profiles')
    .update({ name, location: location || null, linkedin_url: linkedin_url || null })
    .eq('id', user.id)

  if (error) return { error: error.message }

  revalidatePath('/settings')
  return { success: 'Profile updated' }
}

export async function updatePeopleSearchTemplate(
  _prev: ActionResult | null,
  formData: FormData
): Promise<ActionResult> {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return { error: 'Not authenticated' }

  const template = (formData.get('people_search_template') as string)?.trim()

  if (!template) return { error: 'Template cannot be empty' }
  if (!template.includes('{title}') || !template.includes('{company}')) {
    return { error: 'Template must include {title} and {company} placeholders' }
  }

  const { error } = await supabase
    .from('profiles')
    .update({ people_search_template: template })
    .eq('id', user.id)

  if (error) return { error: error.message }

  revalidatePath('/settings')
  return { success: 'Search template updated' }
}

export async function changePassword(
  _prev: ActionResult | null,
  formData: FormData
): Promise<ActionResult> {
  const newPassword = (formData.get('newPassword') as string)?.trim()
  const confirmPassword = (formData.get('confirmPassword') as string)?.trim()

  if (!newPassword) return { error: 'New password is required' }
  if (newPassword.length < 6) return { error: 'Password must be at least 6 characters' }
  if (newPassword !== confirmPassword) return { error: 'Passwords do not match' }

  const supabase = await createClient()

  const { error } = await supabase.auth.updateUser({ password: newPassword })
  if (error) return { error: error.message }

  return { success: 'Password updated' }
}
