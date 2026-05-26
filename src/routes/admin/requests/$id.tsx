import ApprovalTimeline from '@/components/approval-timeline'
import IsPending from '@/components/Illustrations/isPending'
import { CommentComponent } from '@/components/request-comments'
import { SiteHeader } from '@/components/site-header'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { getRequestById } from '@/service'
import { useQuery } from '@tanstack/react-query'
import { createFileRoute, Link } from '@tanstack/react-router'
import {
  ArrowLeft,
  Copy,
  Calendar,
  Building2,
  Mail,
  MapPin,
} from 'lucide-react'
import { toast } from 'sonner'

export const Route = createFileRoute('/admin/requests/$id')({
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
          {/* Back button */}
          <div className="flex items-center justify-between">
            <Button asChild variant="ghost" size="sm" className="gap-2">
              <Link to="/power/requests">
                <ArrowLeft className="h-4 w-4" />
                Back to requests
              </Link>
            </Button>
          </div>

          {/* Request details card */}
          <Card>
            <CardHeader>
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <CardTitle className="text-2xl">Request Details</CardTitle>
                    <Badge variant={request.status === 'PENDING' ? 'secondary' : 'default'}>
                      {request.status}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <span className="font-mono">{request.reference_number}</span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      onClick={copyReference}
                    >
                      <Copy className="h-3 w-3" />
                    </Button>
                  </div>
                </div>


                <div>
                  <h3 className="font-medium">Document</h3>
                  <p className="text-sm text-gray-600">{request.document?.title || '—'}</p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Type */}
                <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                  {request.type === 'internal' ? (
                    <Building2 className="h-5 w-5 text-gray-500 mt-0.5" />
                  ) : (
                    <Mail className="h-5 w-5 text-gray-500 mt-0.5" />
                  )}
                  <div>
                    <p className="text-sm text-gray-500">Type</p>
                    <p className="font-medium capitalize">{request.type}</p>
                  </div>
                </div>

                {/* Destination */}
                <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                  {request.type === 'internal' ? (
                    <Building2 className="h-5 w-5 text-gray-500 mt-0.5" />
                  ) : (
                    <Mail className="h-5 w-5 text-gray-500 mt-0.5" />
                  )}
                  <div>
                    <p className="text-sm text-gray-500">Destination</p>
                    <p className="font-medium">
                      {request.type === 'internal'
                        ? request.faculty?.name || `Faculty #${request.facultyId}`
                        : request.email || '—'}
                    </p>
                  </div>
                </div>

                {/* Address */}
                <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                  <MapPin className="h-5 w-5 text-gray-500 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-500">Address</p>
                    <p className="font-medium">{request.address || '—'}</p>
                  </div>
                </div>

                {/* Created at */}
                <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                  <Calendar className="h-5 w-5 text-gray-500 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-500">Requested onn</p>
                    <p className="font-medium">{formatDate(request.createdAt)}</p>
                  </div>
                </div>
              </div>

            </CardContent>
          </Card>


          <ApprovalTimeline request={request} />

          <CommentComponent comments={request.comments} />
        </div>
      </main>
    </>
  )
}