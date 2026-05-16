import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/power/approved/')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/dashboard/approved/"!</div>
}
