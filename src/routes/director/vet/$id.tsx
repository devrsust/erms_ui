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
import { useState } from 'react'
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
            // Clone the entire template-builder element
            const originalElement = element;
            const clone = originalElement.cloneNode(true) as HTMLElement;

            // Find the style tag in the clone and remove the problematic CSS
            const styleTag = clone.querySelector('style');
            if (styleTag) {
                let styleContent = styleTag.innerHTML;
                styleContent = styleContent.replace(/\.no-tailwind\s*\{[^}]*\}/g, '');
                styleTag.innerHTML = styleContent;
            }

            // === ENHANCEMENT: Clean shadows, center content, & preserve academic spacing ===
            const cleanUpStyles = document.createElement('style');
            cleanUpStyles.innerHTML = `
                /* Remove all box and text shadows */
                * { 
                    box-shadow: none !important; 
                    text-shadow: none !important; 
                }
                
                /* Target non-table elements and strip their borders (gray lines) */
                :not(table):not(thead):not(tbody):not(tfoot):not(tr):not(th):not(td) {
                    border-color: transparent !important;
                }
                
                /* Hide standalone horizontal dividers outside of tables */
                hr { 
                    display: none !important; 
                }

                /* REMOVE BLUE BORDER/OUTLINE AROUND LOGO AND LINKS */
                img, a, .logo, [class*="logo"], [id*="logo"] {
                    border: none !important;
                    outline: none !important;
                    box-shadow: none !important;
                    text-decoration: none !important;
                }

                /* MOVE THINGS CLOSER TO THE CENTER */
                #template_content_to_save {
                    max-width: 100% !important; 
                    margin: 0 auto !important;  
                    padding: 20px 30px !important; 
                    box-sizing: border-box !important;
                }

                /* ========================================================== */
                /* FORCE & MAINTAIN ACADEMIC RECORD SPACING IN GENERATED PDF  */
                /* ========================================================== */
                
                /* Prevent layout collapsing on session wrappers */
                .session-group {
                    display: block !important;
                    margin-top: 25px !important;
                }

                /* Force distinct visual spacing between semesters */
                .semester-group {
                    display: block !important;
                    padding-top: 25px !important; /* Using padding guarantees domtoimage honors the gap */
                    margin-bottom: 5px !important;
                }

                /* Ensure the semester heading never overlaps its table */
                .semester-group h4 {
                    display: block !important;
                    margin: 0 0 12px 0 !important;
                    padding: 0 !important;
                }

                /* Ensure tables don't collapse into headers */
                .semester-group table {
                    margin-top: 0px !important;
                    display: table !important;
                }

                /* HELP WITH PAGE BREAKS */
                #template_content_to_save > div, 
                #template_content_to_save section {
                    page-break-inside: avoid !important;
                    margin-bottom: 25px !important;
                }
            `;
            clone.appendChild(cleanUpStyles);

            // Ensure the clone has proper dimensions and visibility
            clone.style.position = 'absolute';
            clone.style.left = '-9999px';
            clone.style.top = '0';
            clone.style.width = '794px'; // A4 width
            clone.style.backgroundColor = 'white';

            // Append clone to body temporarily
            document.body.appendChild(clone);

            // Find the content to capture
            const targetElement = clone.querySelector('#template_content_to_save') as HTMLElement || clone;

            // Get dimensions
            const width = targetElement.scrollWidth;
            const height = targetElement.scrollHeight;

            // Convert to JPEG & Compress
            const dataUrl = await domtoimage.toJpeg(targetElement, {
                quality: 0.92,
                scale: 1,
                bgcolor: '#ffffff',
                width: width,
                height: height,
            });

            // Clean up the clone
            document.body.removeChild(clone);

            // Create PDF
            const pdf = new jsPDF({
                orientation: 'portrait',
                unit: 'mm',
                format: 'a4'
            });

            // === ENHANCEMENT: PAGE MARGINS & CALCULATIONS ===
            const MARGIN = 15;
            const pageWidth = pdf.internal.pageSize.getWidth();
            const pageHeight = pdf.internal.pageSize.getHeight();

            // Calculate the actual target printable dimensions inside the margins
            const printableWidth = pageWidth - (MARGIN * 2);
            const printableHeight = pageHeight - (MARGIN * 2);

            const imgProps = pdf.getImageProperties(dataUrl);
            const pdfHeight = (imgProps.height * printableWidth) / imgProps.width;

            let heightLeft = pdfHeight;
            let imageYPosition = MARGIN;

            while (heightLeft > 0) {
                // 1. Render the image section within the page's horizontal margins
                pdf.addImage(dataUrl, 'JPEG', MARGIN, imageYPosition, printableWidth, pdfHeight, undefined, 'FAST');

                // 2. MASKING GUARANTEE: Draw solid white rectangles over the header/footer margins.
                pdf.setFillColor(255, 255, 255);
                pdf.rect(0, 0, pageWidth, MARGIN, 'F'); // Top Margin Mask
                pdf.rect(0, pageHeight - MARGIN, pageWidth, MARGIN, 'F'); // Bottom Margin Mask

                heightLeft -= printableHeight;

                // If there's still content left, prepare the next page
                if (heightLeft > 0) {
                    pdf.addPage();
                    imageYPosition -= printableHeight;
                }
            }

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

            if (templateElement) {
                const pdfBlob = await generatePDF(templateElement)
                showPdfPreview(pdfBlob)
                const pdfUrl = await uploadToCloudinary(pdfBlob)
                console.log(pdfUrl);
            }

            setIsProcessing(false)
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
            <div class="session-group" style="margin-bottom: 10px;">
                <h3 style="margin-top: 25px; margin-bottom: 12px; font-weight: bold; font-size: 24px; color: #111827; letter-spacing: -0.5px;">
                    ${session}
                </h3>
        `;

                for (const [semester, semesterCourses] of Object.entries(semesters)) {
                    html += `
                <div class="semester-group" style="margin-top: 25px; margin-bottom: 10px;">
                    
                    <h4 style="margin: 0 0 10px 0; padding: 0; font-size: 16px; font-weight: 600; color: #4b5563; text-transform: uppercase; letter-spacing: 0.5px;">
                        Semester ${semester}
                    </h4>
                    
                    <table border="1" cellpadding="8" cellspacing="0" style="border-collapse: collapse; width: 100%; margin-top: 0px;">
                        <thead>
                            <tr style="background-color: #f3f4f6;">
                                <th style="text-align: left; padding: 10px 8px; font-size: 13px; font-weight: 600; color: #374151;">Course Code</th>
                                <th style="text-align: left; padding: 10px 8px; font-size: 13px; font-weight: 600; color: #374151;">Title</th>
                                <th style="text-align: left; padding: 10px 8px; font-size: 13px; font-weight: 600; color: #374151; text-align: center;">Units</th>
                                <th style="text-align: left; padding: 10px 8px; font-size: 13px; font-weight: 600; color: #374151; text-align: center;">Grade</th>
                            </tr>
                        </thead>
                        <tbody>
            `;

                    semesterCourses.forEach((course: any) => {
                        html += `
                    <tr>
                        <td style="padding: 10px 8px; border-top: 1px solid #e5e7eb; font-size: 13px; color: #1f2937;">${course.course}</td>
                        <td style="padding: 10px 8px; border-top: 1px solid #e5e7eb; font-size: 13px; color: #1f2937;">${course.title}</td>
                        <td style="padding: 10px 8px; border-top: 1px solid #e5e7eb; font-size: 13px; text-align: center; color: #1f2937;">${course.units}</td>
                        <td style="padding: 10px 8px; border-top: 1px solid #e5e7eb; font-size: 13px; text-align: center;">
                            <span style="${course.grade === 'F' ? 'color: #dc2626; font-weight: bold;' : 'color: #1f2937;'}">${course.grade}</span>
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


        const elements = tempDiv.querySelectorAll('.address, .meta-box');

        elements.forEach((el: any) => {
            if (el.classList.contains('address')) {
                el.style.setProperty('max-width', '95%', 'important');
                el.style.setProperty('white-space', 'nowrap', 'important');
                el.style.setProperty('word-break', 'keep-all', 'important');
            } else if (el.classList.contains('meta-box')) {
                // Apply date-specific styles
                el.style.setProperty('max-width', '95%', 'important');
                el.style.setProperty('white-space', 'nowrap', 'important');
                el.style.setProperty('word-break', 'keep-all', 'important');
            }
        });
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
                        <CardContent className='flex justify-center p-6 overflow-auto'>
                            {selectedTemplate ? (
                                <div className="template-builder w-full max-w-[800px] bg-white">
                                    <div
                                        className="no-tailwind"
                                        style={{
                                            all: 'initial',
                                            display: 'block',
                                            width: '100%',
                                            fontFamily: 'inherit'
                                        }}
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
                            <div className='grid gap-2'>
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