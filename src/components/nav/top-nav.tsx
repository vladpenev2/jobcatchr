import Link from 'next/link'
import { UserMenu } from './user-menu'

interface TopNavProps {
  userName: string
  userEmail: string
  isAdmin: boolean
}

export function TopNav({ userName, userEmail, isAdmin }: TopNavProps) {
  return (
    <nav className="sticky top-0 z-50 w-full border-b border-border bg-card">
      <div className="container mx-auto flex h-14 items-center px-4">
        <div className="flex items-center gap-6">
          <Link href="/" className="text-lg font-bold text-foreground">
            Job Catchr
          </Link>
          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              Jobs
            </Link>
          </div>
        </div>
        <div className="ml-auto">
          <UserMenu name={userName} email={userEmail} isAdmin={isAdmin} />
        </div>
      </div>
    </nav>
  )
}
