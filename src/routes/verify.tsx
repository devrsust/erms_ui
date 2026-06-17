import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import {
    ArrowRightIcon,
    ChevronDown,
    CircleCheck,
    Home,
    LogOut,
    Search,
    Shield,
    FileCheck,
    Clock,
    CreditCard,
    GraduationCap,
    Award,
    CheckCircle2,
    Loader2
} from 'lucide-react'
import { useState } from 'react'
import { Separator } from '@/components/ui/separator'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'

export const Route = createFileRoute('/verify')({
    component: RouteComponent,
})

function RouteComponent() {
    const navigate = useNavigate();
    const [matricNumber, setMatricNumber] = useState('');
    const [loading, setLoading] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);
    const [verificationResult, setVerificationResult] = useState<any>(null);

    const handleVerify = async () => {
        if (!matricNumber) return;
        setLoading(true);
        // Simulate verification
        setTimeout(() => {
            setLoading(false);
            setShowSuccess(true);
            setVerificationResult({
                name: "John Adebayo Ogunlesi",
                matric: "U19/SSCE/1234",
                certificateNo: "DE/2024/123456",
                printDate: "December 15, 2024"
            });
        }, 2000);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-green-50 to-blue-50">
            {/* Header */}
            <header className="fixed top-0 left-0 right-0 z-50">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        {/* Logo/Brand - Optional but adds balance */}
                        <div className="flex items-center space-x-2">
                            <div className="w-10 h-10 bg-gradient-to-br from-green-600 to-blue-600 rounded-lg flex items-center justify-center">
                                <img src="/rsu-logo.png" alt="" />
                            </div>
                        </div>

                        {/* Right side with home button and login */}
                        <div className="flex items-center gap-4">
                            {/* Home Button - Linked to / route */}
                            <button
                                onClick={() => navigate({ to: '/' })}
                                className='bg-green-800 hover:bg-green-700 text-white p-2 rounded-xl transition-all duration-300 hover:scale-105 bg-'
                            >
                                <Home className="w-4 h-4" />
                            </button>

                            {/* Login Dropdown */}
                            <div className="flex items-center shadow-sm rounded-lg overflow-hidden">
                                <Button className="rounded-r-none bg-green-700 hover:bg-green-800 text-white px-6">
                                    Login
                                </Button>
                                <Separator orientation="vertical" className="h-8 bg-green-600" />
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button className="rounded-l-none border-l-0 px-3 bg-green-700  hover:bg-green-800 ">
                                            <ChevronDown className="w-4 h-4" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end" className="w-40">
                                        <DropdownMenuItem onSelect={() => navigate({ to: "/auth/login", search: { role: "admin" } })}>
                                            Admin Portal
                                        </DropdownMenuItem>
                                        <DropdownMenuItem onSelect={() => navigate({ to: "/auth/login", search: { role: "alumni" } })}>
                                            Alumni Portal
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            {/* Hero Section */}
            <div className="pt-24 pb-12 px-4 sm:px-6 lg:px-8">
                <div className="container mx-auto">
                    <div className="max-w-4xl mx-auto text-center">
                        {/* Badge */}
                        <div className="inline-flex items-center gap-2 bg-green-100 text-green-700 px-4 py-2 rounded-full mb-6">
                            <Shield className="w-4 h-4" />
                            <span className="text-sm font-medium">Official Verification Platform</span>
                        </div>

                        {/* Title */}
                        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-4">
                            Document Verification
                            <span className="bg-gradient-to-r from-green-600 to-green-800 bg-clip-text text-transparent"> Portal</span>
                        </h1>

                        <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
                            Instantly verify the authenticity of academic certificates and documents issued by our institution.
                        </p>

                        {/* Stats */}
                        <div className="flex flex-wrap justify-center gap-8 mb-12">
                            <div className="text-center">
                                <div className="text-2xl font-bold text-gray-900">99.9%</div>
                                <div className="text-sm text-gray-500">Accuracy Rate</div>
                            </div>
                            <div className="text-center">
                                <div className="text-2xl font-bold text-gray-900">24/7</div>
                                <div className="text-sm text-gray-500">Instant Access</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 pb-20">
                <div className="grid lg:grid-cols-2 gap-12 items-center">
                    {/* Left Column - Form */}
                    <div className="space-y-8">
                        {/* Verification Card */}
                        <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
                            <div className="text-center mb-6">
                                <div className="w-16 h-16 bg-gradient-to-br from-green-100 to-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                    <GraduationCap className="w-8 h-8 text-green-600" />
                                </div>
                                <h2 className="text-2xl font-bold text-gray-900">Verify Certificate</h2>
                                <p className="text-gray-500 mt-1">Enter the document reference number to begin verification</p>
                            </div>

                            <div className="space-y-4">
                                <div className="relative">
                                    <Input
                                        placeholder="Enter Reference Number (e.g., U19/SSCE/1234)"
                                        value={matricNumber}
                                        onChange={(e) => setMatricNumber(e.target.value)}
                                        className="h-12 pl-12 text-base border-gray-200 focus:border-green-400 focus:ring-green-400 rounded-xl"
                                    />
                                    <GraduationCap className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                </div>

                                <Button
                                    onClick={handleVerify}
                                    disabled={!matricNumber || loading}
                                    className="w-full h-12 bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50"
                                >
                                    {loading ? (
                                        <>
                                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                            Verifying...
                                        </>
                                    ) : (
                                        <>
                                            <Search className="w-4 h-4 mr-2" />
                                            Verify Document
                                        </>
                                    )}
                                </Button>
                            </div>

                            <div className="mt-6 pt-6 border-t border-gray-100">
                                <div className="flex items-center justify-center gap-4 text-xs text-gray-400">
                                    <span className="flex items-center gap-1">
                                        <Clock className="w-3 h-3" />
                                        Instant Results
                                    </span>
                                    <span className="flex items-center gap-1">
                                        <Shield className="w-3 h-3" />
                                        Secure & Private
                                    </span>
                                    <span className="flex items-center gap-1">
                                        <CreditCard className="w-3 h-3" />
                                        ₦2,500 Fee
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Reprint Card */}
                        <div className="bg-gradient-to-r from-gray-50 to-white rounded-xl p-6 border border-gray-200 hover:shadow-md transition-all duration-300 cursor-pointer group">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                                        <Award className="w-6 h-6 text-green-600" />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-gray-900">Need a Reprint?</h3>
                                        <p className="text-sm text-gray-500">Request a replacement certificate</p>
                                    </div>
                                </div>
                                <ArrowRightIcon className="w-5 h-5 text-gray-400 group-hover:text-green-600 group-hover:translate-x-1 transition-all" />
                            </div>
                        </div>

                        {/* Features */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                                <CheckCircle2 className="w-4 h-4 text-green-500" />
                                <span>Bank-level Security</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                                <CheckCircle2 className="w-4 h-4 text-green-500" />
                                <span>Real-time Verification</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                                <CheckCircle2 className="w-4 h-4 text-green-500" />
                                <span>Official Records</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                                <CheckCircle2 className="w-4 h-4 text-green-500" />
                                <span>Blockchain Secured</span>
                            </div>
                        </div>
                    </div>

                    {/* Right Column - Illustration */}
                    <div className="hidden lg:flex items-center justify-center">
                        <div className="relative">
                            {/* Background decoration */}
                            <div className="absolute inset-0 bg-gradient-to-tr from-green-400 to-blue-400 rounded-full filter blur-3xl opacity-20 animate-pulse"></div>

                            {/* Main Image */}
                            <div className="relative">
                                <img
                                    src="/certificate.png"
                                    alt="Certificate Verification"
                                    className="max-w-md w-full h-auto relative z-10 drop-shadow-2xl hover:scale-105 transition-transform duration-500"
                                />

                                {/* Floating badges */}
                                <div className="absolute -top-6 -right-6 bg-white rounded-xl shadow-lg p-4 max-w-[180px]">
                                    <div className="flex items-center gap-2">
                                        <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                                            <CircleCheck className="w-5 h-5 text-green-600" />
                                        </div>
                                        <span className="font-semibold text-sm">Verified Secure</span>
                                    </div>
                                </div>
                            </div>


                        </div>
                    </div>
                </div>
            </div>

            {/* Success Modal */}
            {showSuccess && verificationResult && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-in fade-in duration-300">
                    <div
                        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                        onClick={() => setShowSuccess(false)}
                    />
                    <div className="relative w-full max-w-md animate-in zoom-in-95 fade-in duration-300">
                        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
                            <div className="p-8">
                                {/* Success Icon */}
                                <div className="flex justify-center mb-6">
                                    <div className="relative">
                                        <div className="absolute inset-0 bg-green-100 rounded-full animate-ping opacity-75"></div>
                                        <div className="relative p-4 bg-green-50 rounded-full">
                                            <CircleCheck className="stroke-green-600 size-16" />
                                        </div>
                                    </div>
                                </div>

                                {/* Title */}
                                <div className="text-center mb-6">
                                    <h3 className="text-2xl font-bold text-gray-900">Certificate Verified!</h3>
                                    <div className="mt-2 h-1 w-12 bg-gradient-to-r from-green-500 to-green-500 rounded-full mx-auto"></div>
                                </div>

                                {/* Certificate Details */}
                                <div className="space-y-4 bg-gray-50 rounded-xl p-6 mb-6">
                                    <div className="border-b border-gray-200 pb-3">
                                        <p className="text-xs text-gray-500 uppercase tracking-wide">Full Name</p>
                                        <p className="font-semibold text-gray-900 text-lg">{verificationResult.name}</p>
                                    </div>
                                    <div className="border-b border-gray-200 pb-3">
                                        <p className="text-xs text-gray-500 uppercase tracking-wide">Matric Number</p>
                                        <p className="font-mono font-medium text-gray-900">{verificationResult.matric}</p>
                                    </div>
                                    <div className="border-b border-gray-200 pb-3">
                                        <p className="text-xs text-gray-500 uppercase tracking-wide">Certificate Number</p>
                                        <p className="font-mono font-bold text-green-900 text-lg">{verificationResult.certificateNo}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500 uppercase tracking-wide">Date Issued</p>
                                        <p className="font-medium text-gray-900">{verificationResult.printDate}</p>
                                    </div>
                                </div>

                                {/* Collection Instructions */}
                                <div className="mb-6 p-4 bg-green-50 rounded-xl border border-green-200">
                                    <p className="text-sm text-green-800 text-center">
                                        📋 Visit the <span className="font-bold">Exams and Records Office</span> with these details to collect your original certificate.
                                    </p>
                                </div>

                                {/* Actions */}
                                <div className="flex gap-3">
                                    <Button
                                        className="flex-1 bg-green-600 hover:bg-green-700 text-white font-semibold py-3 rounded-xl"
                                        onClick={() => {
                                            navigator.clipboard.writeText(verificationResult.certificateNo);
                                            // toast would go here if you want to re-add
                                        }}
                                    >
                                        Copy Certificate Number
                                    </Button>
                                    <Button
                                        variant="outline"
                                        className="flex-1 font-semibold py-3 rounded-xl"
                                        onClick={() => setShowSuccess(false)}
                                    >
                                        Close
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Add custom animation delays */}
            <style>{`
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        @keyframes blob {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
      `}</style>
        </div>
    )
}