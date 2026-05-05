import IsPending from '@/components/Illustrations/isPending'
import { SiteHeader } from '@/components/site-header'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'
import { getRequestByAdmin } from '@/service' // adjust import as needed
import { useQuery } from '@tanstack/react-query'
import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { ArrowLeft, Calendar, CheckCircle, FileText, Mail, MapPin, User, XCircle } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'
import { createApproval } from '@/service'
import { useAppSelector } from '@/store/hooks'

export const Route = createFileRoute('/dashboard/vet/$id')({
    component: RouteComponent,
})

// type Course = {
//     course: string;
//     title: string;
//     units: number;
//     grade: string;
//     session: string;
//     semester: string;
// };

// type GroupedCourses = Record<string, Record<string, Course[]>>;

function RouteComponent() {
    const { id } = Route.useParams()
    const navigate = useNavigate()
    const { user: currentUser } = useAppSelector((state) => state.auth);
    const [comment, setComment] = useState('')
    const [isSubmitting, setIsSubmitting] = useState(false)

    const { data, isPending, isError, error } = useQuery({
        queryKey: ['request', id],
        queryFn: () => getRequestByAdmin(Number(id)),
        staleTime: 30_000,
    })

    if (isPending) {
        return <IsPending page="Vetting Request" />
    }

    if (isError) {
        return (
            <>
                <SiteHeader title="Vetting Request" />
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
                                    <Link to="/dashboard/vet">Go back</Link>
                                </Button>
                            </CardContent>
                        </Card>
                    </div>
                </main>
            </>
        )
    }

    const request = data?.data
    if (!request) {
        return (
            <>
                <SiteHeader title="Vetting Request" />
                <main className="min-h-screen bg-gray-50 p-4 lg:p-6">
                    <div className="mx-auto max-w-7xl">
                        <Card>
                            <CardHeader>
                                <CardTitle>Request not found</CardTitle>
                                <CardDescription>The requested request could not be found.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <Button asChild variant="outline">
                                    <Link to="/dashboard/vet">Back to vetting</Link>
                                </Button>
                            </CardContent>
                        </Card>
                    </div>
                </main>
            </>
        )
    }

    console.log(request);

    const user = request.user
    const academicData = user?.data?.acaddata
    const courses = academicData?.results?.courses || []
    const finalClassification = academicData?.finalclassification || {}
    const currentStep = request.currentStep

    const formatDate = (dateString?: string) =>
        dateString
            ? new Intl.DateTimeFormat('en-US', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(dateString))
            : 'N/A'


    const handleAction = async (action: 'APPROVE' | 'REJECT') => {
        if (!comment.trim() && action === 'REJECT') {
            toast.error('Please provide a reason for rejection')
            return
        }
        if (!currentUser?.id) {
            toast.error('You must be logged in')
            return
        }
        setIsSubmitting(true)
        try {
            const payload: any = {
                adminId: currentUser.id,
                requestId: request.id,
                stepId: currentStep.id,
                action,
            };
            if (comment.trim()) {
                payload.comment = comment.trim();
            }
            await createApproval(payload);
            
            toast.success(`Request ${action === 'APPROVE' ? 'approved' : 'rejected'} successfully`)
            navigate({ to: '/dashboard/vet' })
        } catch (err: any) {
            toast.error(err?.message || 'Action failed')
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <>
            <SiteHeader title={`Vetting: ${request.reference_number}`} />

            <main className="min-h-screen bg-gray-50 p-4 lg:p-6">
                <div className="mx-auto max-w-7xl space-y-6">
                    {/* Back button */}
                    <div className="flex items-center justify-between">
                        <Button asChild variant="ghost" size="sm" className="gap-2">
                            <Link to="/dashboard/vet">
                                <ArrowLeft className="h-4 w-4" />
                                Back to vetting list
                            </Link>
                        </Button>
                        <Badge variant={request.status === 'PENDING' ? 'secondary' : 'default'}>
                            {request.status}
                        </Badge>
                    </div>

                    {/* Request details */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-xl">Request Details</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                                    <FileText className="h-5 w-5 text-gray-500 mt-0.5" />
                                    <div>
                                        <p className="text-sm text-gray-500">Reference</p>
                                        <p className="font-mono text-sm">{request.reference_number}</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                                    <User className="h-5 w-5 text-gray-500 mt-0.5" />
                                    <div>
                                        <p className="text-sm text-gray-500">Type</p>
                                        <p className="font-medium capitalize">{request.type}</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                                    <MapPin className="h-5 w-5 text-gray-500 mt-0.5" />
                                    <div>
                                        <p className="text-sm text-gray-500">Faculty</p>
                                        <p className="font-medium">{request.faculty?.name || '—'}</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                                    <Mail className="h-5 w-5 text-gray-500 mt-0.5" />
                                    <div>
                                        <p className="text-sm text-gray-500">Email (if external)</p>
                                        <p className="font-medium">{request.email || '—'}</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                                    <MapPin className="h-5 w-5 text-gray-500 mt-0.5" />
                                    <div>
                                        <p className="text-sm text-gray-500">Address</p>
                                        <p className="font-medium">{request.address || '—'}</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                                    <Calendar className="h-5 w-5 text-gray-500 mt-0.5" />
                                    <div>
                                        <p className="text-sm text-gray-500">Created</p>
                                        <p className="font-medium">{formatDate(request.createdAt)}</p>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* User bio */}
                    {user && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-xl">Applicant Bio</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                    <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                                        <User className="h-5 w-5 text-gray-500 mt-0.5" />
                                        <div>
                                            <p className="text-sm text-gray-500">Full Name</p>
                                            <p className="font-medium">{`${user.firstname} ${user.middlename || ''} ${user.lastname}`}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                                        <Mail className="h-5 w-5 text-gray-500 mt-0.5" />
                                        <div>
                                            <p className="text-sm text-gray-500">Email</p>
                                            <p className="font-medium">{user.email}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                                        <FileText className="h-5 w-5 text-gray-500 mt-0.5" />
                                        <div>
                                            <p className="text-sm text-gray-500">Matric Number</p>
                                            <p className="font-medium">{user.matric_number}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                                        <User className="h-5 w-5 text-gray-500 mt-0.5" />
                                        <div>
                                            <p className="text-sm text-gray-500">Gender</p>
                                            <p className="font-medium">{user.gender}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                                        <Calendar className="h-5 w-5 text-gray-500 mt-0.5" />
                                        <div>
                                            <p className="text-sm text-gray-500">Date of Birth</p>
                                            <p className="font-medium">{new Date(user.date_of_birth).toLocaleDateString()}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                                        <Mail className="h-5 w-5 text-gray-500 mt-0.5" />
                                        <div>
                                            <p className="text-sm text-gray-500">Phone</p>
                                            <p className="font-medium">{user.phone_number}</p>
                                        </div>
                                    </div>
                                    {user.address && (
                                        <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                                            <MapPin className="h-5 w-5 text-gray-500 mt-0.5" />
                                            <div>
                                                <p className="text-sm text-gray-500">Address</p>
                                                <p className="font-medium">{user.address}</p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* Academic data - grouped by session and semester */}
                    {courses.length > 0 && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-xl">Academic Records</CardTitle>
                                <CardDescription>
                                    CGPA: {academicData?.cgpa || 'N/A'} | Graduation: {academicData?.graduation_date || 'N/A'}
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                {(() => {
                                    // Define types for better inference
                                    type Course = any; // Replace with actual type if available
                                    type GroupedCourses = Record<string, Record<string, Course[]>>;

                                    // Group courses by session, then by semester
                                    const grouped: GroupedCourses = courses.reduce((acc: GroupedCourses, course: Course) => {
                                        const { session, semester } = course;

                                        if (!acc[session]) acc[session] = {};
                                        if (!acc[session][semester]) acc[session][semester] = [];

                                        acc[session][semester].push(course);
                                        return acc;
                                    }, {} as GroupedCourses);

                                    return Object.entries(grouped).map(([session, semesters]) => (
                                        <div key={session} className="mb-8 last:mb-0">
                                            <h3 className="text-lg font-semibold mb-3 border-b pb-1">{session}</h3>
                                            {Object.entries(semesters).map(([semester, courses]) => (
                                                <div key={`${session}-${semester}`} className="mb-6 last:mb-0">
                                                    <h4 className="font-medium text-gray-700 mb-2">Semester {semester}</h4>
                                                    <div className="overflow-x-auto">
                                                        <Table>
                                                            <TableHeader>
                                                                <TableRow>
                                                                    <TableHead>Course Code</TableHead>
                                                                    <TableHead>Title</TableHead>
                                                                    <TableHead>Units</TableHead>
                                                                    <TableHead>Grade</TableHead>
                                                                </TableRow>
                                                            </TableHeader>
                                                            <TableBody>
                                                                {courses.map((course, idx) => (
                                                                    <TableRow key={idx}>
                                                                        <TableCell>{course.course}</TableCell>
                                                                        <TableCell className="max-w-xs truncate">{course.title}</TableCell>
                                                                        <TableCell>{course.units}</TableCell>
                                                                        <TableCell>
                                                                            <Badge variant={course.grade === 'F' ? 'destructive' : 'outline'}>
                                                                                {course.grade}
                                                                            </Badge>
                                                                        </TableCell>
                                                                    </TableRow>
                                                                ))}
                                                            </TableBody>
                                                        </Table>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ));
                                })()}

                                {/* Yearly CGPA breakdown */}
                                {Object.keys(finalClassification).length > 0 && (
                                    <div className="mt-6 pt-4 border-t">
                                        <h3 className="text-lg font-semibold mb-3">Year‑by‑Year GPA</h3>
                                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2">
                                            {Object.entries(finalClassification).map(([year, semesters]: [string, any]) => (
                                                <div key={year} className="bg-gray-50 p-3 rounded text-sm">
                                                    <p className="font-semibold">{year}</p>
                                                    {Object.entries(semesters).map(([sem, data]: [string, any]) => (
                                                        <p key={sem} className="text-gray-600">
                                                            Sem {sem}: GPA {data.gpa} (Units {data.units})
                                                        </p>
                                                    ))}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    )}

                    {/* Current step info */}
                    {currentStep && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-xl">Current Approval Step</CardTitle>
                                <CardDescription>
                                    {currentStep.name} – {currentStep.description}
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                                    <p className="text-sm text-blue-800">
                                        This request is waiting for your action. Please review the applicant's details and
                                        academic records before approving or rejecting.
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* Comment and actions */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-xl">Your Decision</CardTitle>
                            <CardDescription>
                                Add a comment (required for rejection) and choose an action.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="comment">Comment</Label>
                                <Textarea
                                    id="comment"
                                    placeholder="Enter your comment here..."
                                    value={comment}
                                    onChange={(e) => setComment(e.target.value)}
                                    rows={4}
                                />
                            </div>
                            <div className="flex flex-col sm:flex-row gap-3 justify-end">
                                <Button
                                    variant="outline"
                                    className="gap-2 border-red-300 hover:bg-red-50 text-red-600"
                                    onClick={() => handleAction('REJECT')}
                                    disabled={isSubmitting}
                                >
                                    <XCircle className="h-4 w-4" />
                                    Reject
                                </Button>
                                <Button
                                    className="gap-2 bg-green-600 hover:bg-green-700"
                                    onClick={() => handleAction('APPROVE')}
                                    disabled={isSubmitting}
                                >
                                    <CheckCircle className="h-4 w-4" />
                                    Approve
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </main>
        </>
    )
}