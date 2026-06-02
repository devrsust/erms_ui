import ApprovalTimeline from '@/components/approval-timeline'
import { SiteHeader } from '@/components/site-header'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { getRequestByAdmin, getSignature, getStamp, getTemplates, createApproval, uploadTranscript } from '@/service'
import { useAppSelector } from '@/store/hooks'
import { useQueries } from '@tanstack/react-query'
import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { ArrowLeft, Calendar, FileText, Mail, MapPin, User, Download, X } from 'lucide-react'
import { useState, useRef } from 'react'
import { toast } from 'sonner'
import domtoimage from 'dom-to-image-more';
import jsPDF from 'jspdf';

export const Route = createFileRoute('/director/vet/$id')({
    component: RouteComponent,
})

function RouteComponent() {
    const { id } = Route.useParams()
    const navigate = useNavigate()
    const { user: currentUser } = useAppSelector((state) => state.auth)
    const [selectedTemplateId, setSelectedTemplateId] = useState<string>("");
    const [action, setAction] = useState<'approve' | 'reject' | 'return' | null>(null)
    const [comment, setComment] = useState('')
    const [isProcessing, setIsProcessing] = useState(false)
    const [showPreview, setShowPreview] = useState(false)
    const [pdfPreviewUrl, setPdfPreviewUrl] = useState<string | null>(null)
    const previewRef = useRef<HTMLDivElement>(null)

    const results = useQueries({
        queries: [
            {
                queryKey: ['request', id],
                queryFn: () => getRequestByAdmin(Number(id)),
                enabled: !!id,
                staleTime: 30_000,
            },
            {
                queryKey: ['template'],
                queryFn: () => getTemplates(),
                enabled: !!id,
                staleTime: 30_000,
            },
            {
                queryKey: ['signature', currentUser?.id],
                queryFn: () => getSignature(currentUser!.id),
                enabled: !!currentUser?.id,
            },
            {
                queryKey: ['stamp', currentUser?.id],
                queryFn: () => getStamp(currentUser!.id),
                enabled: !!currentUser?.id,
            },
        ],
    })

    const [requestResult, templateResult, signatureResult, stampResult] = results;
    const request = requestResult?.data?.data;
    const template = templateResult?.data?.data;

    const selectedTemplate = template?.find(
        (t: any) => String(t.id) === selectedTemplateId
    );

    const academicData = request?.user?.data?.acaddata
    const courses = academicData?.results?.courses || []

    const generatePDF = async (element: HTMLElement | null): Promise<Blob> => {
        if (!element) throw new Error('No element to generate PDF from');

        try {
            // Find the actual content container you want to print
            const targetElement = element.querySelector('#template_content_to_save') as HTMLElement || element;

            // 1. Convert the DOM node to a high-quality PNG using the browser's native engine
            const dataUrl = await domtoimage.toPng(targetElement, {
                quality: 1,
                scale: 2, // Higher scale for better text resolution in the PDF
                bgcolor: '#ffffff',
                style: {
                    margin: '0',
                    padding: '20px', // Add some padding if needed
                }
            });

            // 2. Initialize jsPDF
            const pdf = new jsPDF({
                orientation: 'portrait',
                unit: 'mm',
                format: 'a4'
            });

            // 3. Calculate dimensions to fit A4 page
            const imgProps = pdf.getImageProperties(dataUrl);
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

            // 4. Add image to PDF and export
            pdf.addImage(dataUrl, 'PNG', 0, 0, pdfWidth, pdfHeight);

            return pdf.output('blob');
        } catch (error) {
            console.error('PDF generation error:', error);
            throw new Error('Failed to generate PDF');
        }
    };

    const uploadToCloudinary = async (pdfBlob: Blob): Promise<string> => {
        const pdfFile = new File([pdfBlob], 'document.pdf', { type: 'application/pdf' });

        const response = await uploadTranscript(pdfFile);
        return response.data.url;
    }

    const showPdfPreview = (pdfBlob: Blob) => {
        const url = URL.createObjectURL(pdfBlob);
        setPdfPreviewUrl(url);
        setShowPreview(true);
    }

    const getStepId = () => {
        // Find the current step from approval timeline
        const currentStep = request?.approvalSteps?.find((step: any) => step.adminId === currentUser?.id)
        return currentStep?.id || null
    }

    const handleApprove = async () => {
        setIsProcessing(true)
        try {
            const templateElement = document.querySelector('.template-builder') as HTMLElement
            let pdfUrl = ''

            if (templateElement) {
                const pdfBlob = await generatePDF(templateElement)
                showPdfPreview(pdfBlob)
                pdfUrl = await uploadToCloudinary(pdfBlob)
            }

            setPdfPreviewUrl(pdfUrl)
        } catch (error: any) {
            toast.error(error?.response?.data?.message || 'Failed to generate PDF')
            setIsProcessing(false)
        }
    }

    const handleConfirmApprove = async () => {
        try {
            await createApproval({
                adminId: currentUser!.id,
                requestId: Number(id),
                stepId: getStepId(),
                action: 'APPROVED',
                comment: comment
            })
            toast.success('Request approved successfully')
            navigate({ to: '/director/vet' })
        } catch (error: any) {
            toast.error(error?.response?.data?.message || 'Failed to approve request')
        } finally {
            setIsProcessing(false)
            setShowPreview(false)
            if (pdfPreviewUrl) URL.revokeObjectURL(pdfPreviewUrl)
            setPdfPreviewUrl(null)
        }
    }

    const handleReject = async () => {
        if (!comment) {
            toast.error('Comment required for rejection')
            return
        }
        setIsProcessing(true)
        try {
            await createApproval({
                adminId: currentUser!.id,
                requestId: Number(id),
                stepId: getStepId(),
                action: 'REJECTED',
                comment: comment
            })
            toast.success('Request rejected')
            navigate({ to: '/director/vet' })
        } catch (error: any) {
            toast.error(error?.response?.data?.message || 'Failed to reject request')
        } finally {
            setIsProcessing(false)
        }
    }

    const handleReturn = async () => {
        if (!comment) {
            toast.error('Comment required to return')
            return
        }
        setIsProcessing(true)
        try {
            await createApproval({
                adminId: currentUser!.id,
                requestId: Number(id),
                stepId: getStepId(),
                action: 'RETURNED',
                comment: comment
            })
            toast.success('Request returned')
            navigate({ to: '/director/vet' })
        } catch (error: any) {
            toast.error(error?.response?.data?.message || 'Failed to return request')
        } finally {
            setIsProcessing(false)
        }
    }

    const getProcessedTemplateContent = (content: string) => {
        if (!content) return '';

        const signatureHtml = signatureResult?.data?.url
            ? `<img src="${signatureResult.data.url}" style="width: 120px; height: auto; object-fit: contain;" />`
            : '';
        const stampHtml = stampResult?.data?.url
            ? `<img src="${stampResult.data.url}" style="width: 100px; height: auto; object-fit: contain;" />`
            : '';

        let processedContent = content;

        processedContent = processedContent.replace(
            /<div[^>]*id="signature"[^>]*>.*?<\/div>/,
            `<div id="signature" class="signature-line">${signatureHtml}</div>`
        );

        processedContent = processedContent.replace(
            /<div[^>]*id="stamp"[^>]*>.*?<\/div>/,
            `<div id="stamp" class="signature-line">${stampHtml}</div>`
        );

        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = processedContent;

        const generateAcademicRecords = () => {
            if (!courses.length) return '<p>No academic records available</p>';

            let html = `<div class="academic-records"><div class="records-header"></div>`;

            const grouped: Record<string, Record<string, any[]>> = {};

            courses.forEach((course: any) => {
                const { session, semester } = course;
                if (!grouped[session]) grouped[session] = {};
                if (!grouped[session][semester]) grouped[session][semester] = [];
                grouped[session][semester].push(course);
            });

            for (const [session, semesters] of Object.entries(grouped)) {
                html += `
                    <div class="session-group">
                        <h3 style="margin-top: 20px; font-weight: bold; font-size: 25px;">${session}</h3>
                `;

                for (const [semester, semesterCourses] of Object.entries(semesters)) {
                    html += `
                        <div class="semester-group">
                            <h4>Semester ${semester}</h4>
                            <table border="1" cellpadding="8" cellspacing="0" style="border-collapse: collapse; width: 100%;">
                                <thead>
                                    <tr style="background-color: #f3f4f6;">
                                        <th style="text-align: left; padding: 8px;">Course Code</th>
                                        <th style="text-align: left; padding: 8px;">Title</th>
                                        <th style="text-align: left; padding: 8px;">Units</th>
                                        <th style="text-align: left; padding: 8px;">Grade</th>
                                    </tr>
                                </thead>
                                <tbody>
                    `;

                    semesterCourses.forEach((course: any) => {
                        html += `
                            <tr>
                                <td style="padding: 8px; border-top: 1px solid #e5e7eb;">${course.course}</td>
                                <td style="padding: 8px; border-top: 1px solid #e5e7eb;">${course.title}</td>
                                <td style="padding: 8px; border-top: 1px solid #e5e7eb; text-align: center;">${course.units}</td>
                                <td style="padding: 8px; border-top: 1px solid #e5e7eb; text-align: center;">
                                    <span style="${course.grade === 'F' ? 'color: #dc2626; font-weight: bold;' : 'color: #000;'}">${course.grade}</span>
                                </td>
                            </tr>
                        `;
                    });

                    html += `
                                </tbody>
                            </table>
                        </div>
                    `;
                }

                html += `</div>`;
            }

            html += `</div>`;
            return html;
        };

        const contentElement = tempDiv.querySelector('#content');
        if (contentElement) {
            contentElement.innerHTML = generateAcademicRecords();
        }

        const studentNameElement = tempDiv.querySelector('#student_name');
        if (studentNameElement) {
            studentNameElement.textContent = request?.user?.data?.biodata?.fullname || '[Student Name]';
        }

        const genderElement = tempDiv.querySelector('#student_gender');
        if (genderElement) {
            const gender = request?.user?.gender?.toUpperCase();
            let pronoun = 'his';
            if (gender === 'FEMALE') {
                pronoun = 'her';
            } else if (gender === 'MALE') {
                pronoun = 'his';
            }
            genderElement.textContent = pronoun;
        }

        const pronounElement = tempDiv.querySelector('#pronoun');
        if (pronounElement) {
            pronounElement.textContent = request?.pronoun || 'him/her';
        }

        return tempDiv.innerHTML;
    };

    return (
        <>
            <SiteHeader title={`Vetting: ${request?.document?.title || ''} / ${request?.reference_number || ''}`} />

            <main className="min-h-screen bg-gray-50 p-4 lg:p-6">
                <div className="mx-auto max-w-7xl space-y-6">
                    <div className="flex items-center justify-between">
                        <Button asChild variant="ghost" size="sm" className="gap-2">
                            <Link to="/director/vet">
                                <ArrowLeft className="h-4 w-4" />
                                Back to vetting list
                            </Link>
                        </Button>
                        <Badge variant={request?.status === 'PENDING' ? 'secondary' : 'default'}>
                            {request?.status}
                        </Badge>
                    </div>

                    <ApprovalTimeline request={request} />

                    <Card>
                        <CardHeader>
                            <CardTitle className="text-xl">Request Details</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                                    <FileText className="h-5 w-5 text-gray-500 mt-0.5" />
                                    <div>
                                        <p className="text-sm text-gray-500">Reference</p>
                                        <p className="font-mono text-sm">{request?.reference_number}</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                                    <User className="h-5 w-5 text-gray-500 mt-0.5" />
                                    <div>
                                        <p className="text-sm text-gray-500">Type</p>
                                        <p className="font-medium capitalize">{request?.type}</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                                    <MapPin className="h-5 w-5 text-gray-500 mt-0.5" />
                                    <div>
                                        <p className="text-sm text-gray-500">Faculty</p>
                                        <p className="font-medium">{request?.faculty?.name || '—'}</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                                    <Mail className="h-5 w-5 text-gray-500 mt-0.5" />
                                    <div>
                                        <p className="text-sm text-gray-500">Email</p>
                                        <p className="font-medium">{request?.email || '—'}</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                                    <MapPin className="h-5 w-5 text-gray-500 mt-0.5" />
                                    <div>
                                        <p className="text-sm text-gray-500">Address</p>
                                        <p className="font-medium">{request?.address || '—'}</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                                    <Calendar className="h-5 w-5 text-gray-500 mt-0.5" />
                                    <div>
                                        <p className="text-sm text-gray-500">Created</p>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <div className="grid gap-2">
                                <Label>Select Template</Label>
                                <Select value={selectedTemplateId} onValueChange={setSelectedTemplateId}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Choose a template" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {template?.map((item: any) => (
                                            <SelectItem key={item.id} value={String(item.id)}>
                                                {item.name || `Template ${item.id}`}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </CardHeader>
                        <CardContent className='flex items-center justify-center'>
                            {selectedTemplate ? (
                                <div className="template-builder">
                                    <div
                                        className="no-tailwind"
                                        style={{ all: 'initial' }}
                                        dangerouslySetInnerHTML={{
                                            __html: getProcessedTemplateContent(selectedTemplate?.content || ''),
                                        }}
                                    />
                                </div>
                            ) : (
                                <p className="text-sm text-muted-foreground">
                                    Select a template to preview
                                </p>
                            )}
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="space-y-4">
                            <div>
                                <Label htmlFor="action">Action</Label>
                                <Select
                                    value={action || undefined}
                                    onValueChange={(value) => setAction(value as 'approve' | 'reject' | 'return')}
                                >
                                    <SelectTrigger id="action">
                                        <SelectValue placeholder="Select action..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="approve" className="text-green-600">
                                            ✅ Approve
                                        </SelectItem>
                                        <SelectItem value="reject" className="text-red-600">
                                            ❌ Reject
                                        </SelectItem>
                                        <SelectItem value="return" className="text-yellow-600">
                                            🔄 Send Back
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            {action && (
                                <div className="space-y-2">
                                    <Label htmlFor="comment">
                                        Comment {action !== 'approve' && <span className="text-red-500">*</span>}
                                    </Label>
                                    <Textarea
                                        id="comment"
                                        placeholder={
                                            action === 'approve'
                                                ? "Enter your comment here... (optional)"
                                                : "Please provide reason for this action..."
                                        }
                                        value={comment}
                                        onChange={(e) => setComment(e.target.value)}
                                        rows={4}
                                    />
                                </div>
                            )}

                            {action && (
                                <Button
                                    className="w-full"
                                    variant={
                                        action === 'approve' ? 'default' :
                                            action === 'reject' ? 'destructive' :
                                                'outline'
                                    }
                                    onClick={() => {
                                        if (action === 'approve') handleApprove()
                                        if (action === 'reject') handleReject()
                                        if (action === 'return') handleReturn()
                                    }}
                                    disabled={
                                        (action !== 'approve' && !comment) ||
                                        isProcessing
                                    }
                                >
                                    {isProcessing ? 'Processing...' :
                                        action === 'approve' ? 'Approve & Generate' :
                                            action === 'reject' ? 'Reject Request' :
                                                'Send Back'
                                    }
                                </Button>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </main>

            {/* PDF Preview Modal */}
            {showPreview && pdfPreviewUrl && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
                    <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
                        <div className="flex items-center justify-between p-4 border-b">
                            <h2 className="text-xl font-semibold">PDF Preview</h2>
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => {
                                    setShowPreview(false)
                                    if (pdfPreviewUrl) URL.revokeObjectURL(pdfPreviewUrl)
                                    setPdfPreviewUrl(null)
                                    setIsProcessing(false)
                                }}
                            >
                                <X className="h-4 w-4" />
                            </Button>
                        </div>
                        <div className="p-4 overflow-auto max-h-[70vh]">
                            <iframe
                                src={pdfPreviewUrl}
                                className="w-full h-[60vh] border-0"
                                title="PDF Preview"
                            />
                        </div>
                        <div className="flex justify-end gap-3 p-4 border-t">
                            <Button
                                variant="outline"
                                onClick={() => {
                                    setShowPreview(false)
                                    if (pdfPreviewUrl) URL.revokeObjectURL(pdfPreviewUrl)
                                    setPdfPreviewUrl(null)
                                    setIsProcessing(false)
                                }}
                            >
                                Cancel
                            </Button>
                            <Button
                                onClick={handleConfirmApprove}
                                className="bg-green-600 hover:bg-green-700"
                            >
                                <Download className="h-4 w-4 mr-2" />
                                Confirm & Upload
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </>
    )
}