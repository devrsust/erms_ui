import { SiteHeader } from '@/components/site-header'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/admin/approved/')({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <>
      <SiteHeader title="Approved Documents" />

      <main>

      </main>
    </>
  )
}
