// ATS/source platform metadata: proper names, domains for favicons

const SOURCE_META: Record<string, { name: string; domain: string }> = {
  linkedin: { name: 'LinkedIn', domain: 'linkedin.com' },
  teamtailor: { name: 'Teamtailor', domain: 'teamtailor.com' },
  greenhouse: { name: 'Greenhouse', domain: 'greenhouse.io' },
  workable: { name: 'Workable', domain: 'workable.com' },
  workday: { name: 'Workday', domain: 'workday.com' },
  lever: { name: 'Lever', domain: 'lever.co' },
  ashby: { name: 'Ashby', domain: 'ashbyhq.com' },
  icims: { name: 'iCIMS', domain: 'icims.com' },
  rippling: { name: 'Rippling', domain: 'rippling.com' },
  successfactors: { name: 'SAP SuccessFactors', domain: 'sap.com' },
  bamboohr: { name: 'BambooHR', domain: 'bamboohr.com' },
  jobvite: { name: 'Jobvite', domain: 'jobvite.com' },
  smartrecruiters: { name: 'SmartRecruiters', domain: 'smartrecruiters.com' },
  breezy: { name: 'Breezy HR', domain: 'breezy.hr' },
  recruitee: { name: 'Recruitee', domain: 'recruitee.com' },
  personio: { name: 'Personio', domain: 'personio.com' },
  jazz: { name: 'JazzHR', domain: 'jazzhr.com' },
  taleo: { name: 'Oracle Taleo', domain: 'oracle.com' },
  myworkdayjobs: { name: 'Workday', domain: 'workday.com' },
  applytojob: { name: 'ApplyToJob', domain: 'applytojob.com' },
  pinpointhq: { name: 'Pinpoint', domain: 'pinpointhq.com' },
  dover: { name: 'Dover', domain: 'dover.com' },
  comeet: { name: 'Comeet', domain: 'comeet.com' },
  welcometothejungle: { name: 'Welcome to the Jungle', domain: 'welcometothejungle.com' },
  homerun: { name: 'Homerun', domain: 'homerun.co' },
}

export function getSourceDisplayName(sourceName: string | null, sourceCategory: string): string {
  if (!sourceName) {
    return sourceCategory === 'linkedin' ? 'LinkedIn' : 'Career Site'
  }

  const key = sourceName.toLowerCase().replace(/[^a-z]/g, '')
  const meta = SOURCE_META[key]
  if (meta) return meta.name

  // Capitalize first letter of each word as fallback
  return sourceName
    .split(/[\s_-]+/)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(' ')
}

export function getSourceFaviconUrl(sourceName: string | null, sourceCategory: string): string | null {
  if (!sourceName && sourceCategory === 'linkedin') {
    return 'https://www.google.com/s2/favicons?domain=linkedin.com&sz=32'
  }

  if (!sourceName) return null

  const key = sourceName.toLowerCase().replace(/[^a-z]/g, '')
  const meta = SOURCE_META[key]
  if (meta) {
    return `https://www.google.com/s2/favicons?domain=${meta.domain}&sz=32`
  }

  // Try using the source name as a domain guess
  return `https://www.google.com/s2/favicons?domain=${sourceName.toLowerCase()}.com&sz=32`
}
