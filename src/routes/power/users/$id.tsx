import { SiteHeader } from '@/components/site-header'
import { getUserProfile } from '@/service'
import { useQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { CalendarIcon, Mail, User as UserIcon, Clock, Phone } from 'lucide-react'
import { toast } from 'sonner'

export const Route = createFileRoute('/power/users/$id')({
    component: RouteComponent,
})

function RouteComponent() {
    const { id } = Route.useParams()

    const { data, isPending, isError, error } = useQuery({
        queryKey: ['user', id],
        queryFn: () => getUserProfile(Number(id)),
        staleTime: 30_000,
    })

    if (isPending) {
        return (
            <>
                <SiteHeader title="User Profile" />
                <main className="min-h-screen p-4 lg:p-6 bg-gray-50 flex items-center justify-center">
                    <div className="text-center space-y-4">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto" />
                        <p className="text-gray-600">Loading profile…</p>
                    </div>
                </main>
            </>
        )
    }

    if (isError) {
        toast.error((error as any)?.response?.data?.message ?? 'Failed to load user profile')
        return null
    }

    const user = data?.data;

    console.log(data, isPending, isError, error)

    if (!user) return null

    // Format helpers (no date-fns)
    const fullName = [user.firstname, user.middlename, user.lastname].filter(Boolean).join(' ')
    const initials = (user.firstname?.[0] ?? '') + (user.lastname?.[0] ?? '')

    const formatDate = (dateString: string | undefined, options: Intl.DateTimeFormatOptions) => {
        if (!dateString) return '—'
        return new Date(dateString).toLocaleDateString('en-US', options)
    }

    const formatDateTime = (dateString: string | undefined) => {
        if (!dateString) return '—'
        return new Date(dateString).toLocaleString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        })
    }

    const formattedDOB = formatDate(user.date_of_birth, {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    })
    const formattedLastLogin = formatDateTime(user.last_login)
    const formattedCreated = formatDate(user.createdAt, {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    })

    return (
        <>
            <SiteHeader title="User Profile" />

            <main className="min-h-screen p-4 lg:p-6 bg-gray-50">
                {/* Header */}
                <div className="border-b-2 border-dashed border-gray-200 pb-4 mb-6">
                    <h2 className="text-3xl font-bold tracking-tight text-gray-900">Profile</h2>
                    <p className="text-gray-600 mt-1">View user profile details here</p>
                </div>

                {/* Two‑column layout */}
                <div className="flex flex-col lg:flex-row gap-6">
                    {/* Left column – Profile summary */}
                    <Card className="w-full lg:w-4/12 shadow-sm border-0">
                        <CardContent className="p-6 flex flex-col items-center text-center">
                            <Avatar className="h-34 w-34 mb-4 border-2 border-green-600">
                                <AvatarFallback className="bg-green-100 text-green-800 text-3xl font-semibold">
                                    {initials || <UserIcon className="h-12 w-12" />}
                                </AvatarFallback>
                            </Avatar>
                            <h3 className="text-xl font-bold text-gray-900">{fullName}</h3>
                            <p className="text-gray-500 mt-1">{user.email}</p>
                            <div className="mt-4 flex gap-2">
                                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                                    {user.gender}
                                </Badge>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Right column – Bio Data */}
                    <Card className="w-full lg:w-8/12 shadow-sm border-0">
                        <CardHeader>
                            <CardTitle className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                                <UserIcon className="h-5 w-5 text-green-600" />
                                Bio Data
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-1">
                                <p className="text-sm font-medium text-gray-500">Full Name</p>
                                <p className="text-gray-900">{fullName}</p>
                            </div>
                            <div className="space-y-1">
                                <p className="text-sm font-medium text-gray-500 flex items-center gap-1">
                                    <Mail className="h-4 w-4" /> Email
                                </p>
                                <p className="text-gray-900">{user?.email}</p>
                            </div>
                            <div className="space-y-1">
                                <p className="text-sm font-medium text-gray-500">Gender</p>
                                <p className="text-gray-900">{user?.gender}</p>
                            </div>
                            <div className="space-y-1">
                                <p className="text-sm font-medium text-gray-500 flex items-center gap-1">
                                    <CalendarIcon className="h-4 w-4" /> Date of Birth
                                </p>
                                <p className="text-gray-900">{formattedDOB}</p>
                            </div>
                            <div className="space-y-1">
                                <p className="text-sm font-medium text-gray-500 flex items-center gap-1">
                                    <CalendarIcon className="h-4 w-4" /> Matric Number
                                </p>
                                <p className="text-gray-900">{user?.matric_number}</p>
                            </div>
                            <div className="space-y-1">
                                <p className="text-sm font-medium text-gray-500 flex items-center gap-1">
                                    <Phone className="h-4 w-4" /> Phone Number
                                </p>
                                <p className="text-gray-900">{user?.phone_number}</p>
                            </div>
                            <div className="space-y-1">
                                <p className="text-sm font-medium text-gray-500 flex items-center gap-1">
                                    <Clock className="h-4 w-4" /> Last Login
                                </p>
                                <p className="text-gray-900">{formattedLastLogin}</p>
                            </div>
                            <div className="space-y-1">
                                <p className="text-sm font-medium text-gray-500 flex items-center gap-1">
                                    <CalendarIcon className="h-4 w-4" /> Member Since
                                </p>
                                <p className="text-gray-900">{formattedCreated}</p>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </main>
        </>
    )
}