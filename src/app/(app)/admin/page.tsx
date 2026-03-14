"use client"

import { useCallback, useEffect, useState } from "react"
import { UserTable } from "@/components/admin/user-table"
import { CreateUserDialog } from "@/components/admin/create-user-dialog"
import { toast } from "sonner"

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

export default function AdminPage() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)

  const fetchUsers = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch("/api/admin/users")
      const data = await res.json()
      if (!res.ok) {
        toast.error(data.error ?? "Failed to load users")
      } else {
        setUsers(data.users ?? [])
      }
    } catch {
      toast.error("Network error loading users")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchUsers()
  }, [fetchUsers])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Users</h1>
          <p className="text-muted-foreground text-sm mt-1">
            {users.length} {users.length === 1 ? "user" : "users"} total
          </p>
        </div>
        <CreateUserDialog onUserCreated={fetchUsers} />
      </div>

      {loading ? (
        <div className="text-muted-foreground text-sm py-8 text-center">Loading users...</div>
      ) : (
        <UserTable users={users} onRefresh={fetchUsers} />
      )}
    </div>
  )
}
