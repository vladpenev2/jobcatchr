'use client'

import { useState, useEffect, useCallback } from 'react'
import { toast } from 'sonner'
import { JobTabs } from './job-tabs'
import { JobFilters, FilterState } from './job-filters'
import { JobTable, Job } from './job-table'
import { JobDetailDrawer } from './job-detail-drawer'

const DEFAULT_FILTERS: FilterState = {
  search: '',
  status: '',
  source: '',
  sort: 'posted',
  order: 'desc',
}

interface JobsPageProps {
  refreshKey?: number
}

export function JobsPage({ refreshKey = 0 }: JobsPageProps) {
  const [tab, setTab] = useState<'all' | 'saved'>('all')
  const [filters, setFilters] = useState<FilterState>(DEFAULT_FILTERS)
  const [page, setPage] = useState(1)

  const [jobs, setJobs] = useState<Job[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)

  const [allCount, setAllCount] = useState(0)
  const [savedCount, setSavedCount] = useState(0)

  const [selectedJob, setSelectedJob] = useState<Job | null>(null)
  const [drawerOpen, setDrawerOpen] = useState(false)

  const fetchJobs = useCallback(
    async (currentTab: 'all' | 'saved', currentFilters: FilterState, currentPage: number) => {
      setLoading(true)
      try {
        const params = new URLSearchParams({
          tab: currentTab,
          page: String(currentPage),
          limit: '25',
          sort: currentFilters.sort,
          order: currentFilters.order,
        })
        if (currentFilters.search) params.set('search', currentFilters.search)
        if (currentFilters.status) params.set('status', currentFilters.status)
        if (currentFilters.source) params.set('source', currentFilters.source)

        const res = await fetch(`/api/jobs?${params}`)
        if (!res.ok) throw new Error('Failed to fetch jobs')
        const data = await res.json()

        setJobs(data.jobs ?? [])
        setTotal(data.total ?? 0)

        if (currentTab === 'all') {
          setAllCount(data.total ?? 0)
        } else {
          setSavedCount(data.total ?? 0)
        }
      } catch (err) {
        console.error('Failed to fetch jobs:', err)
        setJobs([])
        setTotal(0)
      } finally {
        setLoading(false)
      }
    },
    []
  )

  // Fetch tab counts separately (no filters applied)
  const fetchTabCounts = useCallback(async () => {
    const [allRes, savedRes] = await Promise.allSettled([
      fetch('/api/jobs?tab=all&limit=1'),
      fetch('/api/jobs?tab=saved&limit=1'),
    ])
    if (allRes.status === 'fulfilled' && allRes.value.ok) {
      const d = await allRes.value.json()
      setAllCount(d.total ?? 0)
    }
    if (savedRes.status === 'fulfilled' && savedRes.value.ok) {
      const d = await savedRes.value.json()
      setSavedCount(d.total ?? 0)
    }
  }, [])

  useEffect(() => {
    fetchTabCounts()
  }, [fetchTabCounts, refreshKey])

  useEffect(() => {
    fetchJobs(tab, filters, page)
  }, [tab, filters, page, fetchJobs, refreshKey])

  function handleTabChange(newTab: 'all' | 'saved') {
    setTab(newTab)
    setPage(1)
    setFilters(DEFAULT_FILTERS)
  }

  function handleFiltersChange(newFilters: FilterState) {
    setFilters(newFilters)
    setPage(1)
  }

  function handleJobClick(job: Job) {
    setSelectedJob(job)
    setDrawerOpen(true)
  }

  async function handleSaveToggle(jobId: string, currentlySaved: boolean) {
    const res = await fetch(`/api/jobs/${jobId}/save`, { method: 'POST' })
    if (!res.ok) return
    const { saved } = await res.json()

    // Update job in list
    setJobs((prev) => prev.map((j) => (j.id === jobId ? { ...j, saved } : j)))

    // Update selected job if open
    setSelectedJob((prev) => (prev?.id === jobId ? { ...prev, saved } : prev))

    toast.success(saved ? 'Job saved' : 'Job unsaved')

    // Update saved count
    setSavedCount((prev) => (saved ? prev + 1 : Math.max(0, prev - 1)))

    // If on saved tab and we unsaved, refetch
    if (tab === 'saved' && !saved) {
      fetchJobs('saved', filters, page)
    }
  }

  function handleJobUpdate(updatedJob: Job) {
    setJobs((prev) => prev.map((j) => (j.id === updatedJob.id ? updatedJob : j)))
    setSelectedJob(updatedJob)
  }

  function handleJobDelete(jobId: string) {
    setJobs((prev) => prev.filter((j) => j.id !== jobId))
    setTotal((prev) => Math.max(0, prev - 1))
    setAllCount((prev) => Math.max(0, prev - 1))
    setDrawerOpen(false)
    setSelectedJob(null)
  }

  return (
    <div className="space-y-6">
      {/* Search form placeholder - Agent A builds the actual form */}
      <div id="search-form-placeholder" />

      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          <JobTabs
            activeTab={tab}
            allCount={allCount}
            savedCount={savedCount}
            onTabChange={handleTabChange}
          />
        </div>

        <JobFilters filters={filters} onFiltersChange={handleFiltersChange} jobs={jobs} />

        <JobTable
          jobs={jobs}
          total={total}
          page={page}
          limit={25}
          onPageChange={setPage}
          onJobClick={handleJobClick}
          onSaveToggle={handleSaveToggle}
          loading={loading}
        />
      </div>

      {selectedJob && (
        <JobDetailDrawer
          job={selectedJob}
          open={drawerOpen}
          onOpenChange={setDrawerOpen}
          onSaveToggle={handleSaveToggle}
          onJobUpdate={handleJobUpdate}
          onJobDelete={handleJobDelete}
        />
      )}
    </div>
  )
}
