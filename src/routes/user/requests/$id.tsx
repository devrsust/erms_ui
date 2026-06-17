import ApprovalTimeline from '@/components/approval-timeline'
import IsPending from '@/components/Illustrations/isPending'
import RequestDetailsCard from '@/components/RequestDetailsCard'
import { SiteHeader } from '@/components/site-header'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { getRequestById } from '@/service'
import { useQuery } from '@tanstack/react-query'
import { createFileRoute, Link } from '@tanstack/react-router'
import { ArrowLeft } from 'lucide-react'
import { toast } from 'sonner'

export const Route = createFileRoute('/user/requests/$id')({
  component: RouteComponent,
})

function RouteComponent() {
  const { id } = Route.useParams()

  const { data, isPending, isError, error } = useQuery({
    queryKey: ['request', id],
    queryFn: () => getRequestById(Number(id)),
    staleTime: 30_000,
  })

  if (isPending) {
    return <IsPending page="Request" />
  }

  if (isError) {
    return (
      <>
        <SiteHeader title="Request" />
        <main className="min-h-screen bg-gray-50 p-4 lg:p-6">
          <div className="mx-auto max-w-7xl">
            <Card className="border-destructive">
              <CardHeader>
                <CardTitle className="text-destructive">Error loading request</CardTitle>
                <CardDescription>
                  {error instanceof Error ? error.message : 'An unexpected error occurred'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button asChild variant="outline">
                  <Link to="/user/requests">Go back</Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </main>
      </>
    )
  }

  const request = data?.data || data // adjust if your API returns { data: ... }

  if (!request) {
    return (
      <>
        <SiteHeader title="Request" />
        <main className="min-h-screen bg-gray-50 p-4 lg:p-6">
          <div className="mx-auto max-w-7xl">
            <Card>
              <CardHeader>
                <CardTitle>Request not found</CardTitle>
                <CardDescription>The requested request could not be found.</CardDescription>
              </CardHeader>
              <CardContent>
                <Button asChild variant="outline">
                  <Link to="/user/requests">Back to requests</Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </main>
      </>
    )
  }

  const formatDate = (dateString?: string) =>
    dateString
      ? new Intl.DateTimeFormat('en-US', {
        dateStyle: 'medium',
        timeStyle: 'short',
      }).format(new Date(dateString))
      : 'N/A'

  const copyReference = () => {
    navigator.clipboard.writeText(request.reference_number)
    toast.success('Reference number copied')
  }

  console.log(request);
  

  return (
    <>
      <SiteHeader title={`Request #${request.reference_number.slice(0, 8)}`} />

      <main className="min-h-screen bg-gray-50 p-4 lg:p-6">
        <div className="mx-auto max-w-7xl space-y-6">
          {/* Back button action link */}
          <div className="flex items-center justify-between">
            <Button asChild variant="ghost" size="sm" className="gap-2 text-slate-600 hover:text-slate-900">
              <Link to="/user/requests">
                <ArrowLeft className="h-4 w-4" />
                Back to requests
              </Link>
            </Button>
          </div>

          {/* Redesigned Request details component card */}
          <RequestDetailsCard
            request={request}
            copyReference={copyReference}
            formatDate={formatDate}
          />

          {/* Fixed & Sorted Approval workflow timeline element */}
          <ApprovalTimeline request={request} />
        </div>
      </main>
    </>
  )
}