import { SiteHeader } from '@/components/site-header'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/director/stamp/')({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <>
      <SiteHeader title='Signature / Stamp' />

      
    </>
  )
}
