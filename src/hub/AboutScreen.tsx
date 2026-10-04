import { PageHeader } from '@/components/PageHeader.tsx'
import { Button } from '@/components/ui/button.tsx'
import { hubCopy } from '@/game/hubCopy.ts'

export function AboutScreen() {
  return (
    <div className="sere-screen flex min-h-[100dvh] flex-col gap-8">
      <PageHeader title={hubCopy.aboutName} line={hubCopy.aboutLine} />
      <div className="space-y-4 text-base leading-relaxed text-navy">
        <p>{hubCopy.aboutWhat}</p>
        <p>{hubCopy.aboutWho}</p>
      </div>
      <div className="sere-stagger flex flex-col gap-3">
        <Button asChild variant="outline" className="w-full">
          <a href={hubCopy.aboutSiteUrl} target="_blank" rel="noopener noreferrer">
            {hubCopy.aboutSite}
          </a>
        </Button>
        <Button asChild variant="outline" className="w-full">
          <a href={hubCopy.aboutFollowUrl} target="_blank" rel="noopener noreferrer">
            {hubCopy.aboutFollow}
          </a>
        </Button>
      </div>
    </div>
  )
}
