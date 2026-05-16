import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { checkPrintStatus, initPayment, logout, updatePayment } from '@/service'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { ArrowRightIcon, ChevronDown, CircleCheck, Clipboard, Home, LogOut, OctagonX } from 'lucide-react'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import PaystackPop from "@paystack/inline-js"
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { logout as logoutAction } from '@/store/slices/auth.slice';
import { toast } from 'sonner'
import { Separator } from '@/components/ui/separator'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'

type CheckStatusForm = {
    matric: string
}

interface PrintStatus {
    status: number;
    data?: {
        id: number;
        name: string;
        matric_number: string;
        certNo: string;
        print_date: string;
        // add any other fields you want to display
    };
}

export const Route = createFileRoute('/certificate')({
    component: RouteComponent,
})

function RouteComponent() {
    const { user, accessToken } = useAppSelector((state) => state.auth)
    const navigate = useNavigate();
    const dispatch = useAppDispatch();
    const [result, setResult] = useState<PrintStatus | null>(null);
    const [loading, setLoading] = useState(false);
    const [showPopup, setShowPopup] = useState(false);

    const handleLogout = async () => {
        try {
            const res = await logout(accessToken!, user);
            console.log(res);
            dispatch(logoutAction())
            navigate({ to: "/" });
        } catch (error) {
            console.error("Logout failed:", error);
            dispatch(logoutAction());
            navigate({ to: "/" });
        }
    }

    const createForm = useForm<CheckStatusForm>({
        defaultValues: {
            matric: ''
        }
    })

    const onCreate = async (values: CheckStatusForm) => {
        if (!user) {
            toast.error('Please login to proceed');
            return;
        }

        setLoading(true);
        try {
            // 1. Initiate payment
            const payload = {
                user,
                type: 'CERTIFICATE STATUS CHECK',
                request: 'CERTIFICATE_PRINT_STATUS',
                price: 2000,
                processing_fee: 500,
            };
            const paymentResponse = await initPayment(payload);

            // 2. Immediately show Paystack popup
            const paystack = new PaystackPop();
            paystack.resumeTransaction(paymentResponse.access_code, {
                onSuccess: async () => {
                    try {
                        // 3. Update payment status to SUCCESSFUL
                        await updatePayment(paymentResponse.payment_id, {
                            status: "SUCCESSFUL",
                            transaction_id: paymentResponse.reference,
                            reference: paymentResponse.reference,
                            access_code: paymentResponse.access_code,
                        });

                        // 4. Check print status
                        const statusRes = await checkPrintStatus(values.matric);
                        if (statusRes.status === 200) {
                            setResult({
                                status: 200,
                                data: statusRes.data,
                            });
                        } else {
                            setResult({ status: statusRes.status });
                        }
                        setShowPopup(true);
                    } catch (err) {
                        console.error(err);
                        toast.error('Payment verification failed');
                    } finally {
                        setLoading(false);
                    }
                },
                onError: async () => {
                    // Payment encountered an error (e.g., network issue, payment failed)
                    await updatePayment(paymentResponse.payment_id, {
                        status: "FAILED",
                        transaction_id: paymentResponse.reference,
                        reference: paymentResponse.reference,
                        access_code: paymentResponse.access_code,
                    });
                    setLoading(false);
                    toast.error('Payment failed. Please try again.');
                },
            });
        } catch (err) {
            console.error(err);
            toast.error('Failed to initiate payment');
            setLoading(false);
        }
    }
    return (
        <div className="relative grid lg:grid-cols-2 min-h-screen px-4 sm:px-8 py-6 lg:py-12 overflow-x-hidden">
            {/* Header – unchanged */}
            <div className="absolute top-4 right-4 sm:top-6 sm:right-6 flex flex-wrap gap-2 justify-end z-10">
                {user && user?.role ? (
                    <div className='flex items-center gap-4'>
                        <Button
                            className='bg-blue-900 hover:bg-blue-800'
                            size='icon'
                            onClick={() => navigate({ to: '/' })}
                        >
                            <Home />
                        </Button>
                        <Button
                            className="bg-green-800"
                            onClick={() => {
                                if (user?.role?.name === "ALUMNI") {
                                    navigate({ to: "/user" });
                                } else if (user?.role?.name === "SUPER ADMIN") {
                                    navigate({ to: "/power" });
                                } else if (user?.role?.name === "DIRECTOR") {
                                    navigate({ to: "/director" });
                                } else if (user?.role?.name === "ADMIN") {
                                    navigate({ to: "/admin" });
                                } else if (user?.role?.name === "RECORDS OFFICER") {
                                    navigate({ to: "/records" });
                                } else {
                                    navigate({ to: "/" });
                                }
                            }}
                        >
                            Dashboard
                        </Button>
                        <Button
                            variant='destructive'
                            size='icon'
                            onClick={handleLogout}
                        >
                            <LogOut />
                        </Button>
                    </div>
                ) : (
                    <div className="flex items-center">
                        <Button
                            className="rounded-r-none bg-green-800"
                        >
                            Login
                        </Button>
                        <Separator orientation="vertical" />
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button className="rounded-l-none border-l-0 px-2 bg-green-800">
                                    <ChevronDown />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent>
                                <DropdownMenuItem onSelect={() => navigate({
                                    to: "/auth/login",
                                    search: { role: "admin" }
                                })}>
                                    Admin
                                </DropdownMenuItem>
                                <DropdownMenuItem onSelect={() => navigate({
                                    to: "/auth/login",
                                    search: { role: "alumni" }
                                })}>
                                    Alumni
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                )}
            </div>

            {/* Left column (form) */}
            <div className="flex flex-col justify-center gap-8 max-w-xl mx-auto text-center lg:text-left">
                <div className='grid gap-3'>
                    <h1 className="text-blue-900 font-extrabold text-4xl sm:text-5xl lg:text-6xl leading-tight">
                        Certificate Print Status
                    </h1>
                    <p>Want to know if your certificate has been printed?</p>
                </div>

                <form
                    className="flex w-full max-w-md mx-auto lg:mx-0 gap-0"
                    onSubmit={createForm.handleSubmit(onCreate)}
                >
                    <Input
                        placeholder='Enter Matric Number'
                        id='matric'
                        className="rounded-r-none h-12 text-base"
                        {...createForm.register('matric', {
                            required: 'Matric Number is required',
                        })}
                    />
                    <Button
                        type="submit"
                        className="rounded-l-none bg-blue-900 font-bold uppercase h-12 px-6 transition-colors disabled:opacity-60"
                        disabled={loading}
                    >
                        Check
                    </Button>
                </form>

                <button
                    className="flex items-center justify-between gap-3 p-4 rounded-lg border border-transparent hover:border-accent hover:bg-accent/40 transition-all cursor-pointer max-w-md mx-auto lg:mx-0"
                >
                    <span className="group-hover:underline">
                        Apply for Reprint of Certificate
                    </span>
                    <span className="p-2 bg-green-700 rounded-full shrink-0">
                        <ArrowRightIcon className="text-primary-foreground w-4 h-4" />
                    </span>
                </button>
            </div>

            {/* Right column (image) */}
            <div className="hidden lg:flex items-center justify-center">
                <img
                    src="/certificate.png"
                    alt="Description"
                    className="max-w-sm xl:max-w-md w-full h-auto"
                />
            </div>

            {/* Result popup – updated */}
            {showPopup && result && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    {/* Backdrop */}
                    <div
                        className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity duration-300"
                        onClick={() => setShowPopup(false)}
                    />
                    <div className="relative w-full max-w-md transform transition-all duration-300 ease-out scale-100 opacity-100">
                        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
                            <div className="p-8">
                                {/* Icon */}
                                <div className="flex justify-center mb-6">
                                    {result.status === 404 && (
                                        <div className="relative">
                                            <div className="absolute inset-0 bg-red-100 rounded-full animate-pulse-slow" />
                                            <div className="relative p-4">
                                                <OctagonX className="stroke-red-600 size-16" />
                                            </div>
                                        </div>
                                    )}
                                    {result.status === 200 && (
                                        <div className="relative">
                                            <div className="absolute inset-0 bg-green-100 rounded-full animate-pulse-slow" />
                                            <div className="relative p-4">
                                                <CircleCheck className="stroke-green-600 size-16" />
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Title */}
                                <div className="text-center mb-2">
                                    <h3 className="text-2xl font-bold text-gray-900">
                                        {result.status === 404 && 'Certificate Details'}
                                        {result.status === 200 && 'Certificate Details'}
                                    </h3>
                                </div>

                                {/* Message / Details */}
                                <div className="text-center text-gray-600 mb-6 text-lg">
                                    {result.status === 404 && (
                                        <span>
                                            Certificate not ready.
                                            <span className="font-semibold text-blue-300">
                                                Please check back next week.
                                            </span>
                                        </span>
                                    )}

                                    {result.status === 200 && result.data && (
                                        <>
                                            <div className="text-left space-y-3 bg-gray-50 p-4 rounded-lg">
                                                <div>
                                                    <span className="text-sm text-gray-500">Full Name</span>
                                                    <p className="font-medium text-gray-900">{result.data.name}</p>
                                                </div>
                                                <div>
                                                    <span className="text-sm text-gray-500">Matric Number</span>
                                                    <p className="font-medium text-gray-900">{result.data.matric_number}</p>
                                                </div>
                                                <div>
                                                    <span className="text-sm text-gray-500">Certificate Number</span>
                                                    <p className="font-medium text-gray-900">{result.data.certNo}</p>
                                                </div>
                                                <div>
                                                    <span className="text-sm text-gray-500">Print Date</span>
                                                    <p className="font-medium text-gray-900">{result.data.print_date}</p>
                                                </div>
                                            </div>

                                            {/* Follow-up instructions based on certificate number prefix */}
                                            {result.data.certNo && (
                                                <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                                                    <p className="text-sm text-blue-800">
                                                        {result.data.certNo.toUpperCase().startsWith('DE') && (
                                                            <>Visit the <span className='font-bold'>Exams and Records Office</span> with these details to collect your certificate.</>
                                                        )}
                                                        {result.data.certNo.toUpperCase().startsWith('PG') && (
                                                            <>Visit the <span className='font-bold'>College of Postgraduate Studies</span> with these details to collect your certificate.</>
                                                        )}
                                                        {result.data.certNo.toUpperCase().startsWith('PD') && (
                                                            <>Visit the <span className='font-bold'>College of Postgraduate Studies</span> with these details to collect your certificate.</>
                                                        )}
                                                        {result.data.certNo.toUpperCase().startsWith('PM') && (
                                                            <>Visit the <span className='font-bold'>College of Postgraduate Studies</span> with these details to collect your certificate.</>
                                                        )}
                                                        {!result.data.certNo.toUpperCase().startsWith('DE') &&
                                                            !result.data.certNo.toUpperCase().startsWith('PG') && (
                                                                <>Please contact the <strong>Academic Affairs</strong> for further guidance.</>
                                                            )}
                                                    </p>
                                                </div>
                                            )}
                                        </>
                                    )}
                                </div>

                                {/* Actions */}
                                <div className="flex flex-col sm:flex-row gap-3">
                                    {result.status === 200 && (
                                        <Button
                                            className="flex-1 bg-green-600 hover:bg-green-700 text-white font-semibold py-3 rounded-lg transition-colors duration-200 shadow-md hover:shadow-lg"
                                            onClick={() => {
                                                navigator.clipboard.writeText(result.data?.certNo || '');
                                                toast.success('Certificate number copied');
                                            }}
                                        >
                                            <Clipboard className="w-4 h-4 mr-2 inline" />
                                            Copy Cert No.
                                        </Button>
                                    )}
                                    <Button
                                        variant={result.status === 200 ? "outline" : "default"}
                                        className={`flex-1 font-semibold py-3 rounded-lg transition-all duration-200 ${result.status === 200
                                            ? 'border-gray-300 text-gray-700 hover:bg-gray-50'
                                            : 'bg-red-600 hover:bg-red-700 text-white shadow-md hover:shadow-lg'
                                            }`}
                                        onClick={() => setShowPopup(false)}
                                    >
                                        {result.status === 404 ? 'Close' : 'Close'}
                                    </Button>
                                </div>

                                {/* Additional contact info for 404 */}
                                {result.status === 404 && (
                                    <div className="mt-6 pt-6 border-t border-gray-200">
                                        <p className="text-sm text-gray-500 text-center">
                                            Faculty Admin Office<br />
                                            <span className="font-medium">Visit your faculty administration desk</span>
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}