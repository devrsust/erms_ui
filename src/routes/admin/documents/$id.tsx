import IsPending from '@/components/Illustrations/isPending'
import { SiteHeader } from '@/components/site-header'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { getDocument } from '@/service'
import { useQuery } from '@tanstack/react-query'
import { createFileRoute, Link } from '@tanstack/react-router'
import { ArrowLeft, Edit, FileText, User, Calendar, DollarSign } from 'lucide-react'

export const Route = createFileRoute('/admin/documents/$id')({
    component: RouteComponent,
})

function RouteComponent() {
    const { id } = Route.useParams()

    const { data, isPending, isError, error } = useQuery({
        queryKey: ['document', id],
        queryFn: () => getDocument(Number(id)),
        staleTime: 30_000,
    })

    if (isPending) {
        return <IsPending page="Document" />
    }


    if (isError) {
        return (
            <>
                <SiteHeader title="Document" />
                <main className="min-h-screen bg-gray-50 p-4 lg:p-6">
                    <div className="mx-auto max-w-7xl">
                        <Card className="border-destructive">
                            <CardHeader>
                                <CardTitle className="text-destructive">Error loading document</CardTitle>
                                <CardDescription>
                                    {error instanceof Error ? error.message : 'An unexpected error occurred'}
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <Button asChild variant="outline">
                                    <Link to="/power/documents">Go back</Link>
                                </Button>
                            </CardContent>
                        </Card>
                    </div>
                </main>
            </>
        )
    }

    const document = data

    if (!document) {
        return (
            <>
                <SiteHeader title="Document" />
                <main className="min-h-screen bg-gray-50 p-4 lg:p-6">
                    <div className="mx-auto max-w-7xl">
                        <Card>
                            <CardHeader>
                                <CardTitle>Document not found</CardTitle>
                                <CardDescription>The requested document could not be found.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <Button asChild variant="outline">
                                    <Link to="/power/documents">Back to documents</Link>
                                </Button>
                            </CardContent>
                        </Card>
                    </div>
                </main>
            </>
        )
    }

    const formatCurrency = (amount: number) =>
        new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN' }).format(amount)

    const formatDate = (dateString: string) =>
        new Intl.DateTimeFormat('en-US', {
            dateStyle: 'medium',
            timeStyle: 'short',
        }).format(new Date(dateString))

    return (
        <>
            <SiteHeader title={`Document: ${document.title}`} />

            <main className="min-h-screen bg-gray-50 p-4 lg:p-6">
                <div className="mx-auto max-w-7xl space-y-6">
                    {/* Back button and actions */}
                    <div className="flex items-center justify-between">
                        <Button asChild variant="ghost" size="sm" className="gap-2">
                            <Link to="/power/documents">
                                <ArrowLeft className="h-4 w-4" />
                                Back to documents
                            </Link>
                        </Button>
                        <Button size="sm" className="gap-2 bg-green-600 hover:bg-green-700">
                            <Edit className="h-4 w-4" />
                            Edit document
                        </Button>
                    </div>

                    {/* Document details card */}
                    <Card>
                        <CardHeader>
                            <div className="flex items-start justify-between">
                                <div>
                                    <CardTitle className="text-2xl">{document.title}</CardTitle>
                                    <CardDescription className="flex items-center gap-2 mt-1">
                                        <Badge variant={document.status === 'DRAFT' ? 'secondary' : 'default'}>
                                            {document.status}
                                        </Badge>
                                        <span className="text-xs text-gray-400">•</span>
                                        <span className="text-xs text-gray-500">
                                            ID: #{document.id}
                                        </span>
                                    </CardDescription>
                                </div>
                                <FileText className="h-8 w-8 text-gray-400" />
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                {/* Created by */}
                                <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                                    <User className="h-5 w-5 text-gray-500 mt-0.5" />
                                    <div>
                                        <p className="text-sm text-gray-500">Created by</p>
                                        <p className="font-medium">{document.createdBy?.email}</p>
                                    </div>
                                </div>

                                {/* Created at */}
                                <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                                    <Calendar className="h-5 w-5 text-gray-500 mt-0.5" />
                                    <div>
                                        <p className="text-sm text-gray-500">Created</p>
                                        <p className="font-medium">{formatDate(document.createdAt)}</p>
                                    </div>
                                </div>

                                {/* Price */}
                                <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                                    <DollarSign className="h-5 w-5 text-gray-500 mt-0.5" />
                                    <div>
                                        <p className="text-sm text-gray-500">Price</p>
                                        <p className="font-medium">{formatCurrency(document.price)}</p>
                                    </div>
                                </div>

                                {/* Processing fee */}
                                <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                                    <DollarSign className="h-5 w-5 text-gray-500 mt-0.5" />
                                    <div>
                                        <p className="text-sm text-gray-500">Processing fee</p>
                                        <p className="font-medium">{formatCurrency(document.processingFee)}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Total amount */}
                            <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg border border-green-100">
                                <span className="font-medium text-gray-700">Total amount</span>
                                <span className="text-2xl font-bold text-green-700">
                                    {formatCurrency(document.totalAmount)}
                                </span>
                            </div>

                            {document.description && (
                                <>
                                    <Separator />
                                    <div>
                                        <h3 className="font-medium mb-2">Description</h3>
                                        <p className="text-gray-700">{document.description}</p>
                                    </div>
                                </>
                            )}
                        </CardContent>
                    </Card>

                    {/* Approval chain card */}
                    {document.approvalChain && (
                        <Card>
                            <CardHeader>
                                <CardTitle>Approval Chain</CardTitle>
                                <CardDescription>
                                    {document.approvalChain.name} – {document.approvalChain.steps?.length || 0} steps
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {document.approvalChain.steps?.map((step: any, index: number) => (
                                        <div key={step.id} className="relative pl-8 pb-4 border-l-2 border-gray-200 last:pb-0 last:border-l-0">
                                            <div className="absolute left-0 -translate-x-1/2 w-4 h-4 rounded-full bg-white border-2 border-green-600 flex items-center justify-center">
                                                <span className="text-xs font-bold text-green-600">{index + 1}</span>
                                            </div>
                                            <div className="bg-gray-50 p-4 rounded-lg">
                                                <div className="flex items-start justify-between">
                                                    <div>
                                                        <h4 className="font-medium">{step.name}</h4>
                                                        {step.description && (
                                                            <p className="text-sm text-gray-500">{step.description}</p>
                                                        )}
                                                    </div>
                                                    <Badge variant="outline" className="ml-2">
                                                        {step.userId ? 'Assigned to user' : step.roleId ? 'Assigned to role' : 'Unassigned'}
                                                    </Badge>
                                                </div>
                                                <div className="mt-2 text-sm text-gray-600">
                                                    {step.userId && (
                                                        <p>User ID: {step.userId}</p>
                                                    )}
                                                    {step.roleId && (
                                                        <p>Role ID: {step.roleId}</p>
                                                    )}
                                                    {step.canReject !== undefined && (
                                                        <p className="mt-1">
                                                            <span className={`inline-flex items-center gap-1 ${step.canReject ? 'text-amber-600' : 'text-gray-400'}`}>
                                                                {step.canReject ? 'Can reject' : 'Cannot reject'}
                                                            </span>
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </div>
            </main>
        </>
    )
}