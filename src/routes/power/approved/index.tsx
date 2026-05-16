import { SiteHeader } from '@/components/site-header'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/power/approved/')({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <>
      <SiteHeader title="Combo Management" />

      <main>

      </main>
    </>
  )
}
