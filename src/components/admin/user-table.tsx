"use client"

import { useState } from "react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { RefreshCwIcon, PencilIcon } from "lucide-react"
import { formatDate, formatDateTime } from "@/lib/utils"

interface User {
  id: string
  name: string
  email: string
  location: string | null
  role: string
  linkedin_url: string | null
  profile_synced_at: string | null
  created_at: string
}

interface UserTableProps {
  users: User[]
  onRefresh: () => void
}

export function UserTable({ users, onRefresh }: UserTableProps) {
  const [syncingId, setSyncingId] = useState<string | null>(null)
  const [editUser, setEditUser] = useState<User | null>(null)
  const [editForm, setEditForm] = useState({ name: "", location: "" })
  const [saving, setSaving] = useState(false)

  async function handleSync(userId: string) {
    setSyncingId(userId)
    try {
      const res = await fetch(`/api/admin/users/${userId}/sync-profile`, {
        method: "POST",
      })
      const data = await res.json()
      if (!res.ok) {
        toast.error(data.error ?? "Sync failed")
      } else {
        toast.success("LinkedIn profile synced")
        onRefresh()
      }
    } catch {
      toast.error("Network error during sync")
    } finally {
      setSyncingId(null)
    }
  }

  function openEdit(user: User) {
    setEditUser(user)
    setEditForm({ name: user.name, location: user.location ?? "" })
  }

  async function handleEditSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!editUser) return
    setSaving(true)
    try {
      const res = await fetch(`/api/admin/users/${editUser.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editForm),
      })
      const data = await res.json()
      if (!res.ok) {
        toast.error(data.error ?? "Failed to save")
      } else {
        toast.success("User updated")
        setEditUser(null)
        onRefresh()
      }
    } catch {
      toast.error("Network error")
    } finally {
      setSaving(false)
    }
  }

  function formatDateOrDash(dateStr: string | null): string {
    if (!dateStr) return "—"
    return formatDate(dateStr)
  }

  function formatDateTimeOrDash(dateStr: string | null): string {
    if (!dateStr) return "—"
    return formatDateTime(dateStr)
  }

  return (
    <>
      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>Profile</TableHead>
              <TableHead>Joined</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                  No users yet. Create the first one.
                </TableCell>
              </TableRow>
            ) : (
              users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">{user.name}</TableCell>
                  <TableCell className="text-muted-foreground">{user.email}</TableCell>
                  <TableCell className="text-muted-foreground">{user.location ?? "—"}</TableCell>
                  <TableCell>
                    {user.profile_synced_at ? (
                      <Badge variant="secondary">
                        Synced {formatDateTimeOrDash(user.profile_synced_at)}
                      </Badge>
                    ) : (
                      <Badge variant="outline">Pending</Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {formatDateOrDash(user.created_at)}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => openEdit(user)}
                        title="Edit user"
                      >
                        <PencilIcon className="size-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        disabled={syncingId === user.id || !user.linkedin_url}
                        onClick={() => handleSync(user.id)}
                        title="Re-sync LinkedIn profile"
                      >
                        <RefreshCwIcon
                          className={`size-4 ${syncingId === user.id ? "animate-spin" : ""}`}
                        />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Edit dialog */}
      <Dialog open={!!editUser} onOpenChange={(open) => !open && setEditUser(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleEditSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="edit-name">Full Name</Label>
              <Input
                id="edit-name"
                value={editForm.name}
                onChange={(e) => setEditForm((p) => ({ ...p, name: e.target.value }))}
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="edit-location">Location</Label>
              <Input
                id="edit-location"
                value={editForm.location}
                onChange={(e) => setEditForm((p) => ({ ...p, location: e.target.value }))}
                placeholder="Dubai, UAE"
              />
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setEditUser(null)}
                disabled={saving}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={saving}>
                {saving ? "Saving..." : "Save"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  )
}
