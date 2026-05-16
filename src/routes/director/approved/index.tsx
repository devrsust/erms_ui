import { SiteHeader } from '@/components/site-header'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/director/approved/')({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <>
      <SiteHeader title="APproved Documents" />

      <main>

      </main>
    </>
  )
}
