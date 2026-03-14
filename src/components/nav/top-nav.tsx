'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { UserMenu } from './user-menu'
import { cn } from '@/lib/utils'

interface TopNavProps {
  userName: string
  userEmail: string
  isAdmin: boolean
}

const NAV_LINKS = [{ href: '/', label: 'Jobs' }]

export function TopNav({ userName, userEmail, isAdmin }: TopNavProps) {
  const pathname = usePathname()

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-border bg-card">
      <div className="container mx-auto flex h-14 items-center px-4">
        <div className="flex items-center gap-6">
          <Link href="/" className="text-lg font-bold text-foreground">
            Job Catchr
          </Link>
          <div className="flex items-center gap-4">
            {NAV_LINKS.map(({ href, label }) => {
              const isActive = pathname === href
              return (
                <Link
                  key={href}
                  href={href}
                  className={cn(
                    'text-sm font-medium transition-colors hover:text-foreground',
                    isActive ? 'text-foreground' : 'text-muted-foreground'
                  )}
                  aria-current={isActive ? 'page' : undefined}
                >
                  {label}
                </Link>
              )
            })}
          </div>
        </div>
        <div className="ml-auto">
          <UserMenu name={userName} email={userEmail} isAdmin={isAdmin} />
        </div>
      </div>
    </nav>
  )
}
