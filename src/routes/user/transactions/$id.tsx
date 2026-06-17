import { SiteHeader } from '@/components/site-header'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/user/transactions/$id')({
  component: RouteComponent,
})

function RouteComponent() {
  const { id } = Route.useParams()


  return (
    <>
      <SiteHeader title={`Transaction Receipt `} />

      <main className="min-h-screen bg-gray-50 p-4 lg:p-6">
        <div>

        </div>
      </main>
    </>
  )
}
