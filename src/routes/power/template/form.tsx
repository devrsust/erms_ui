import { SiteHeader } from '@/components/site-header'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { createTemplate } from '@/service'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import { createFileRoute } from '@tanstack/react-router'
import {
    ChevronLeft,
    FileText,
    Save,
    Upload,
    X,
} from 'lucide-react'
import { useRef, useState } from 'react'
import { toast } from 'sonner'

export const Route = createFileRoute('/power/template/form')({
    component: RouteComponent,
})

function RouteComponent() {
    // const { id } = Route.useSearch()
    const navigate = useNavigate()
    const queryClient = useQueryClient()
    // const isEditMode = !!id

    const [logo, setLogo] = useState<string | null>("/rsu-logo.png")
    const inputRef = useRef<HTMLInputElement | null>(null)

    // Fetch template if editing
    // const { data: template, isLoading } = useQuery({
    //     queryKey: ['template', id],
    //     queryFn: () => getTemplate(Number(id)),
    //     enabled: isEditMode,
    // })

    const createMutation = useMutation({
        mutationFn: createTemplate,
        onSuccess: () => {
            toast.success('Template created successfully')
            queryClient.invalidateQueries({ queryKey: ['templates'] })
            navigate({ to: '/power/template' })
        },
        onError: (error: any) => {
            toast.error(error?.response?.data?.message || 'Failed to create template')
        },
    })

    // const updateMutation = useMutation({
    //     mutationFn: ({ id, data }: { id: number; data: any }) => updateTemplate(id, data),
    //     onSuccess: () => {
    //         toast.success('Template updated successfully')
    //         queryClient.invalidateQueries({ queryKey: ['templates'] })
    //         navigate({ to: '/power/template' })
    //     },
    //     onError: (error: any) => {
    //         toast.error(error?.response?.data?.message || 'Failed to update template')
    //     },
    // })

    // if (isEditMode ) {
    //     return <div>Loading...</div>
    // }

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        const overlay = document.getElementById('overlay')
        const removeBtn = document.getElementById('remove_btn')
        if (overlay) overlay.style.display = 'none'
        if (removeBtn) removeBtn.style.display = 'none'

        // if (isEditMode) {

        // } else {
            const templateName = (
                document.getElementById('template_name') as HTMLInputElement
            )?.value

            const templateContent = document.getElementById(
                'template_content_to_save'
            ) as HTMLElement

            const contentClone = templateContent.cloneNode(true) as HTMLElement

            const styleTag = document.getElementById('template_styles') as HTMLStyleElement

            const contentHtml = `
                ${styleTag ? styleTag.outerHTML : ''}
                ${contentClone.outerHTML}
            `

            const payload = {
                name: templateName,
                content: contentHtml,
                logo: logo ?? '/rsu-logo.png',
                createdBy: 1, // replace with auth user id
            }

            createMutation.mutate(payload)
        // }
    }

    const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]

        if (!file) return

        // Validate file type
        if (!file.type.startsWith('image/')) {
            alert('Please upload an image file')
            return
        }

        // Validate file size (max 2MB)
        if (file.size > 2 * 1024 * 1024) {
            alert('Image size should be less than 2MB')
            return
        }

        const imageUrl = URL.createObjectURL(file)
        setLogo(imageUrl)

        // Save to localStorage
        const savedData = localStorage.getItem('pdfTemplateData')
        if (savedData) {
            const content = JSON.parse(savedData)
            content.logoData = imageUrl
            localStorage.setItem('pdfTemplateData', JSON.stringify(content))
        }
    }

    const handleRemoveLogo = () => {
        if (logo) {
            URL.revokeObjectURL(logo)
            setLogo(null)

            // Remove from localStorage
            const savedData = localStorage.getItem('pdfTemplateData')
            if (savedData) {
                const content = JSON.parse(savedData)
                delete content.logoData
                localStorage.setItem('pdfTemplateData', JSON.stringify(content))
            }
        }
    }
    return (
        <>
            <SiteHeader title="Template Builder" />

            <style id="template_styles">{`
                .template-builder {
                    --a4-width: 794px;
                    --a4-height: 1123px;

                    --primary: #1e3a8a;
                    --border: #e5e7eb;
                    --muted: #6b7280;
                    --bg: #f9fafb;

                    --space-sm: 8px;
                    --space-md: 16px;
                    --space-lg: 24px;
                    --space-xl: 32px;

                    --text-sm: 12px;
                    --text-base: 14px;
                    --text-lg: 18px;
                    --text-xl: 24px;
                    --text-2xl: 28px;
                }

                .template-builder * {
                    box-sizing: border-box;
                }

                

                .template-builder .pdf-container {
                    width: var(--a4-width);
                    min-height: var(--a4-height);
                    background: white;
                    border-radius: 6px;
                    box-shadow:
                    0 10px 25px rgba(0, 0, 0, 0.08),
                    0 4px 10px rgba(0, 0, 0, 0.04);
                }

                .template-builder .pdf-section {
                    min-height: var(--a4-height);
                    padding: 48px;
                    position: relative;
                }

                .template-builder .form-header {
                    border-bottom: 2px solid var(--primary);
                    padding-bottom: var(--space-lg);
                    margin-bottom: var(--space-xl);
                }

                .template-builder .head {
                    text-align: center;
                    margin-bottom: var(--space-lg);
                }

                .template-builder .title {
                    font-size: var(--text-2xl);
                    font-weight: 700;
                    color: var(--primary);
                    margin: 0;
                }

                .template-builder .subtitle {
                    font-size: var(--text-lg);
                    font-weight: 600;
                    margin-top: var(--space-sm);
                }

                .template-builder .university-details {
                    display: grid;
                    grid-template-columns: 1fr auto 1fr;
                    gap: var(--space-lg);
                    align-items: start;
                }

                .template-builder .registrar-info,
                .template-builder .address {
                    font-size: var(--text-sm);
                    line-height: 1.6;
                }

                .template-builder .registrar-info strong {
                    display: block;
                    margin-bottom: var(--space-sm);
                    color: var(--primary);
                }

                .template-builder .logo-wrapper {
                    position: relative;
                    display: inline-block;
                }

                .template-builder .logo {
                    width: 150px;
                    height: 150px;
                    border-radius: 12px;
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    cursor: pointer;
                    transition: all 0.3s ease;
                    position: relative;
                    overflow: hidden;
                    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
                }

                .template-builder .logo:hover {
                    transform: scale(1.02);
                    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
                }

                .template-builder .logo img {
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                }

                .template-builder .default-logo {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    gap: 8px;
                    color: white;
                }

                .template-builder .default-logo span {
                    font-size: 10px;
                    font-weight: 500;
                    text-transform: uppercase;
                    letter-spacing: 1px;
                }

                .template-builder .upload-overlay {
                    position: absolute;
                    bottom: 0;
                    left: 0;
                    right: 0;
                    background: rgba(0, 0, 0, 0.7);
                    color: white;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 4px;
                    padding: 6px;
                    font-size: 10px;
                    transform: translateY(100%);
                    transition: transform 0.3s ease;
                    backdrop-filter: blur(4px);
                }

                .template-builder .logo:hover .upload-overlay {
                    transform: translateY(0);
                }

                .template-builder .remove-logo {
                    position: absolute;
                    top: -8px;
                    right: -8px;
                    width: 24px;
                    height: 24px;
                    background: #ef4444;
                    color: white;
                    border: none;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    cursor: pointer;
                    transition: all 0.2s ease;
                    z-index: 10;
                    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
                }

                .template-builder .remove-logo:hover {
                    background: #dc2626;
                    transform: scale(1.1);
                }

                /* Optional: Add loading animation */
                @keyframes pulse {
                    0%, 100% {
                        opacity: 1;
                    }
                    50% {
                        opacity: 0.5;
                    }
                }

                .template-builder .logo-loading {
                    animation: pulse 1.5s ease-in-out infinite;
                }

                .template-builder .meta-row {
                    display: flex;
                    justify-content: space-between;
                    margin-top: var(--space-lg);
                    font-size: var(--text-sm);
                    gap: var(--space-lg);
                }

                .template-builder .meta-box {
                    flex: 1;
                    border-bottom: 1px dashed var(--border);
                    padding-bottom: var(--space-sm);
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    gap: var(--space-sm);
                }

                .date-meta {
                    width: 100%;
                    display: flex;
                    align-items: center;
                    justify-content: flex-end;
                    text-align: right;
                    gap: 4px;
                }

                .template-builder .meta-box strong {
                    color: var(--primary);
                }

                .template-builder {
                    display: flex;
                    align-items: center;
                    gap: 4px;
                }

                .template-builder .icon-btn {
                    border: none;
                    background: transparent;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    padding: 2px;
                    color: var(--muted);
                }

                .template-builder .icon-btn:hover {
                    color: var(--primary);
                }

                .template-builder .address-to {
                    margin-top: var(--space-lg);
                    padding: var(--space-md);
                    background: #fef3c7;
                    border-left: 4px solid #d97706;
                    border-radius: 4px;
                    font-size: var(--text-sm);
                }

                .template-builder .address-to strong {
                    display: block;
                    margin-bottom: var(--space-sm);
                }

                .template-builder .letter-section {
                    margin-bottom: var(--space-xl);
                }

                .template-builder .salutation {
                    margin-bottom: var(--space-lg);
                    font-size: var(--text-base);
                }

                .template-builder .transcript-title {
                    text-align: center;
                    font-size: var(--text-xl);
                    font-weight: 700;
                    color: var(--primary);
                    margin-bottom: var(--space-xl);
                }

                .template-builder .letter-content {
                    font-size: var(--text-base);
                    line-height: 1.8;
                    text-align: justify;
                }

                .template-builder .letter-content p {
                    margin-bottom: var(--space-md);
                }

                .template-builder [contenteditable="true"] {
                    outline: none;
                    border-radius: 4px;
                    transition: background 0.2s;
                }

                .template-builder [contenteditable="true"]:hover {
                    background: rgba(59, 130, 246, 0.06);
                }

                .template-builder [contenteditable="true"]:focus {
                    background: rgba(59, 130, 246, 0.1);
                }

                .template-builder .footer {
                    margin-top: 80px;
                    border-top: 1px solid var(--border);
                    padding-top: var(--space-lg);
                }

                .template-builder .signature-section {
                    display: flex;
                    justify-content: space-between;
                    gap: var(--space-lg);
                    margin-bottom: var(--space-xl);
                }

                .template-builder .signature-line {
                    flex: 1;
                    height: 90px;
                    text-align: center;
                    border-top: 1px solid #111827;
                    padding-top: var(--space-sm);
                    font-size: var(--text-sm);
                }

                .template-builder .footer-note {
                    text-align: center;
                    font-size: 10px;
                    color: var(--muted);
                }

                .template-builder .control-panel {
                    position: fixed;
                    bottom: 20px;
                    right: 20px;
                    display: flex;
                    gap: 10px;
                    z-index: 1000;
                }

                .template-builder .control-btn {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    border: none;
                    padding: 10px 16px;
                    border-radius: 6px;
                    cursor: pointer;
                    color: white;
                    font-size: 14px;
                }

                .template-builder .control-btn.primary {
                    background: #1e3a8a;
                }

                .template-builder .control-btn.secondary {
                    background: #059669;
                }

                .address {
                    display: flex;
                    flex-direction: column;
                    align-items: flex-end;
                    text-align: left;
                }

                @media (max-width: 860px) {
                    .template-builder main {
                    padding: 16px;
                    }

                    .template-builder .pdf-container {
                    width: 100%;
                    }

                    .template-builder .pdf-section {
                    padding: 24px;
                    }

                    .template-builder .university-details {
                    grid-template-columns: 1fr;
                    text-align: center;
                    }

                    .template-builder .meta-row {
                    flex-direction: column;
                    }

                    .template-builder .signature-section {
                    flex-direction: column;
                    }
                }
                `}
            </style>

            <main className="relative min-h-screen p-4 lg:p-6 lg:py-15 bg-gray-50 flex items-center justify-center">

                <Button
                    className="absolute top-4 left-4 z-50 shadow-md"
                    onClick={() => navigate({ to: '/power/template' })} // Add this
                    type="button" // Add this to prevent form submission
                >
                    <ChevronLeft />
                    Back
                </Button>

                <form className='grid gap-3' onSubmit={handleSubmit}>
                    <Card className='grid gap-2 p-4'>
                        <Label>Template Name</Label>
                        <Input type="text" placeholder="Enter Template Name" id="template_name" />
                    </Card>

                    <div className="template-builder">
                        <div className="pdf-container">
                            <div className="pdf-section">
                                <div id="template_content_to_save" className="template-content">
                                    <section className="form-header">
                                        <div className="head">
                                            <h1 className="title" contentEditable>
                                                RIVERS STATE UNIVERSITY
                                            </h1>

                                            <h3 className="subtitle" contentEditable>
                                                OFFICE OF THE REGISTRAR
                                            </h3>
                                        </div>

                                        <div className="university-details">
                                            <div
                                                className="registrar-info"
                                                contentEditable
                                            >
                                                <strong>Registrar's Office</strong>
                                                <p>Prof. John Smith, PhD</p>
                                                <p>Registrar</p>
                                                <p>registrar@ust.edu.ng</p>
                                                <p>+234 123 456 7890</p>
                                            </div>

                                            <div className="logo-wrapper">
                                                <input
                                                    ref={inputRef}
                                                    type="file"
                                                    accept="image/*"
                                                    onChange={handleUpload}
                                                    hidden
                                                />

                                                <div
                                                    className="logo"
                                                    onClick={() => inputRef.current?.click()}
                                                    title="Click to upload logo"
                                                >
                                                    {logo ? (
                                                        <img src={logo} alt="University Logo" />
                                                    ) : (
                                                        <div className="default-logo">
                                                            <FileText size={32} />
                                                            <span>Logo</span>
                                                        </div>
                                                    )}

                                                    <div className="upload-overlay" id='overlay'>
                                                        <Upload size={14} />
                                                        <span>Upload</span>
                                                    </div>
                                                </div>

                                                {logo && (
                                                    <button
                                                        className="remove-logo"
                                                        id='remove_btn'
                                                        onClick={(e) => {
                                                            e.stopPropagation()
                                                            handleRemoveLogo()
                                                        }}
                                                        title="Remove logo"
                                                    >
                                                        <X size={14} />
                                                    </button>
                                                )}
                                            </div>

                                            <div className="address" contentEditable>
                                                <p>P.M.B. 5080</p>
                                                <p>Port Harcourt</p>
                                                <p>Rivers State, Nigeria</p>
                                                <p>info@ust.edu.ng</p>
                                            </div>
                                        </div>

                                        <div className="meta-row">
                                            <div className="meta-box">
                                                <div>
                                                    <strong>Ref No:</strong>{' '}
                                                    <span contentEditable>
                                                        RSU/REG/VOL.1/2025
                                                    </span>
                                                </div>
                                            </div>

                                            <div className="meta-box">
                                                <div className='date-meta'>
                                                    <strong>Date:</strong>{' '}
                                                    <span contentEditable>
                                                        January 15, 2025
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="address-to" contentEditable>
                                            <strong>TO:</strong>

                                            <p>University of Lagos</p>
                                            <p>Admissions Office</p>
                                            <p>Akoka, Yaba</p>
                                            <p>Lagos State, Nigeria</p>
                                        </div>
                                    </section>

                                    <section className="letter-section">
                                        <div className="salutation" contentEditable>
                                            Dear Sir / Madam,
                                        </div>

                                        <div className="transcript-title" contentEditable>
                                            ACADEMIC TRANSCRIPT
                                        </div>

                                        <div
                                            className="letter-content"
                                            contentEditable
                                        >
                                            <p>
                                                I forward herewith the transcript of{' '}
                                                <b id="student_name">[Student Name]</b> on{' '}
                                                <b id="student_gender">[Gender]</b> request that we do so
                                                for the purpose of enabling{' '}
                                                <b>him/her</b> gain admission into
                                                your institution.
                                            </p>

                                            <p>
                                                I wish to inform you that transcripts
                                                are not normally forwarded directly to
                                                students or graduands, but to
                                                institutions or similar establishments
                                                that require them.
                                            </p>

                                            <p>
                                                In the circumstance therefore, please
                                                regard this transcript as a classified
                                                University document that should not be
                                                released to the student/graduand.
                                            </p>
                                        </div>
                                    </section>

                                    <section className='form-content' id='content'>
                                        [Additional content will appear here]
                                    </section>

                                    <section className="footer">
                                        <div className="signature-section">
                                            <div>
                                                <div
                                                    className="signature-line"
                                                    contentEditable
                                                    id='signature'
                                                >

                                                </div>
                                                <p>Registrar's Signature</p>
                                            </div>

                                            <div>
                                                <div
                                                    className="signature-line"
                                                    contentEditable
                                                    id='stamp'
                                                >

                                                </div>
                                                <p>Registrar's Stamp</p>
                                            </div>


                                        </div>

                                        <p
                                            className="footer-note"
                                            contentEditable
                                        >
                                            Generated document | Official University
                                            Transcript

                                        </p>
                                    </section>
                                </div>
                            </div>
                        </div>

                        <div className="control-panel">
                            <button type='submit' className='control-btn secondary'>
                                <Save size={16} />
                                Save
                            </button>
                        </div>
                    </div>

                </form>
            </main>
        </>
    )
}