import IsPending from '@/components/Illustrations/isPending'
import { SiteHeader } from '@/components/site-header'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { getTemplate } from '@/service'
import { useQuery } from '@tanstack/react-query'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import {
    ChevronLeft,
    Calendar,
    FileText,
} from 'lucide-react'
import { toast } from 'sonner'

export const Route = createFileRoute('/power/template/$id')({
    component: RouteComponent,
})

function RouteComponent() {
    const { id } = Route.useParams()
    const navigate = useNavigate()

    const { data, isPending, isError, error } = useQuery({
        queryKey: ['template'],
        queryFn: () => getTemplate(Number(id)),
        staleTime: 30_000,
    })

    if (isPending) return <IsPending page='Template' />

    if (isError) {
        toast.error(
            (error as any)?.response?.data?.message ?? 'Failed to load templates'
        )
        return null
    }

    const template = data?.data;
    console.log(template);

    const formatDate = (dateString: string) => {
        if (!dateString) return 'N/A'
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        })
    }

    return (
        <>
            <SiteHeader title="Template Builder" />

            <main className="relative min-h-screen p-4 lg:p-6 lg:py-15 bg-gradient-to-br from-gray-50 to-gray-100 flex flex-col gap-5 items-center justify-center">

                <Button
                    className="absolute top-4 left-4 z-50 bg-green-700 hover:bg-green-800 text-white shadow-md transition-all duration-200 hover:shadow-lg gap-2"
                    onClick={() => navigate({ to: '/power/template' })}
                >
                    <ChevronLeft className="h-4 w-4" />
                    Back
                </Button>

                {/* Template Info Card */}
                <Card className="w-full max-w-4xl shadow-lg border-0 rounded-xl overflow-hidden">
                    <CardContent className="p-0">
                        <div className="bg-gradient-to-r from-green-700 to-green-800 px-6 py-4">
                            <div className="flex items-center gap-2 text-white">
                                <FileText className="h-5 w-5" />
                                <h2 className="text-lg font-semibold">Template Information</h2>
                            </div>
                        </div>
                        <div className="p-6 bg-white">
                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="space-y-1">
                                    <p className="text-sm font-medium text-gray-500">Template Name</p>
                                    <p className="text-lg font-semibold text-gray-900">{template?.name || 'Untitled'}</p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-sm font-medium text-gray-500 flex items-center gap-1">
                                        <Calendar className="h-3.5 w-3.5" />
                                        Created Date
                                    </p>
                                    <p className="text-lg font-semibold text-gray-900">{formatDate(template?.createdAt)}</p>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Template Content */}
                <div className="template-builder w-full flex item-center justify-center rounded-xl">
                    <div
                        className="pdf-container p-10"
                        dangerouslySetInnerHTML={{ __html: template?.content || '<div class="text-center text-gray-400 py-20">No content available</div>' }}
                    />
                </div>
            </main>
        </>
    )
}