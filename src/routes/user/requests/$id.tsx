import IsPending from '@/components/Illustrations/isPending'
import { SiteHeader } from '@/components/site-header'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { getRequestById } from '@/service'
import { useQuery } from '@tanstack/react-query'
import { createFileRoute, Link } from '@tanstack/react-router'
import {
  ArrowLeft,
  Copy,
  FileText,
  User,
  Calendar,
  Building2,
  Mail,
  MapPin,
  CheckCircle2,
  Circle,
  Clock,
} from 'lucide-react'
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

  const isCurrentStep = (stepId: number) => request.currentStep?.id === stepId

  return (
    <>
      <SiteHeader title={`Request #${request.reference_number.slice(0, 8)}`} />

      <main className="min-h-screen bg-gray-50 p-4 lg:p-6">
        <div className="mx-auto max-w-7xl space-y-6">
          {/* Back button */}
          <div className="flex items-center justify-between">
            <Button asChild variant="ghost" size="sm" className="gap-2">
              <Link to="/user/requests">
                <ArrowLeft className="h-4 w-4" />
                Back to requests
              </Link>
            </Button>
            <Button size="sm" variant="outline" className="gap-2">
              <Clock className="h-4 w-4" />
              Track Progress
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
                <FileText className="h-8 w-8 text-gray-400" />
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
                    <p className="text-sm text-gray-500">Requested on</p>
                    <p className="font-medium">{formatDate(request.createdAt)}</p>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Document summary */}
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium">Document</h3>
                  <p className="text-sm text-gray-600">{request.document?.title || '—'}</p>
                </div>
                {request.document?.id && (
                  <Button asChild variant="outline" size="sm" className="gap-2">
                    {/* <Link to={`/user/documents/${request.document.id}`}>
                      <FileText className="h-4 w-4" />
                    </Link> */}
                      View Document
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Approval timeline card */}
          {request.document?.approvalChain?.steps?.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Approval Timeline</CardTitle>
                <CardDescription>
                  {request.document.approvalChain.name} • {request.document.approvalChain.steps.length} steps
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {request.document.approvalChain.steps.map((step: any, index: number) => {
                    const isCurrent = isCurrentStep(step.id)
                    const isPast = false // we don't have approval history yet, so all steps before current are unknown

                    return (
                      <div
                        key={step.id}
                        className={`relative pl-8 pb-4 last:pb-0 ${index < request.document.approvalChain.steps.length - 1
                            ? 'border-l-2 border-gray-200'
                            : ''
                          }`}
                      >
                        {/* Step indicator */}
                        <div
                          className={`absolute left-0 -translate-x-1/2 w-5 h-5 rounded-full flex items-center justify-center ${isCurrent
                              ? 'bg-green-100 border-2 border-green-600'
                              : isPast
                                ? 'bg-green-600 text-white'
                                : 'bg-white border-2 border-gray-300'
                            }`}
                        >
                          {isPast ? (
                            <CheckCircle2 className="h-3 w-3 text-white" />
                          ) : isCurrent ? (
                            <div className="h-2 w-2 rounded-full bg-green-600 animate-pulse" />
                          ) : (
                            <Circle className="h-3 w-3 text-gray-400" />
                          )}
                        </div>

                        {/* Step content */}
                        <div
                          className={`p-4 rounded-lg ${isCurrent ? 'bg-green-50 border border-green-200' : 'bg-gray-50'
                            }`}
                        >
                          <div className="flex flex-wrap items-start justify-between gap-2">
                            <div>
                              <h4 className="font-medium flex items-center gap-2">
                                {step.name}
                                {isCurrent && (
                                  <Badge variant="outline" className="bg-green-100 text-green-700 border-green-200">
                                    Current Step
                                  </Badge>
                                )}
                              </h4>
                              {step.description && (
                                <p className="text-sm text-gray-500">{step.description}</p>
                              )}
                            </div>
                            <Badge variant="outline">
                              {step.userId
                                ? `Assigned to User #${step.userId}`
                                : step.roleId
                                  ? `Assigned to Role #${step.roleId}`
                                  : 'Unassigned'}
                            </Badge>
                          </div>
                          <div className="mt-2 text-sm text-gray-600 space-y-1">
                            {step.userId && (
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <div className="flex items-center gap-1 cursor-help">
                                      <User className="h-3 w-3" />
                                      <span>User ID: {step.userId}</span>
                                    </div>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p>Assigned to a specific user</p>
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            )}
                            {step.roleId && (
                              <div className="flex items-center gap-1">
                                <Building2 className="h-3 w-3" />
                                <span>Role ID: {step.roleId}</span>
                              </div>
                            )}
                            {step.canReject !== undefined && (
                              <div className="flex items-center gap-1">
                                <span
                                  className={step.canReject ? 'text-amber-600' : 'text-gray-400'}
                                >
                                  {step.canReject ? 'Can reject' : 'Cannot reject'}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </>
  )
}