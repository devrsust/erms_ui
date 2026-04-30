import LogoutButton from '@/components/logout-button';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useAppSelector } from '@/store/hooks';
import { Separator } from '@radix-ui/react-separator';
import { createFileRoute, Link, useNavigate } from '@tanstack/react-router';
import { ArrowRightIcon, ChevronDown, Star, FileText, CheckCircle, Users, CreditCard, Settings, Eye, Send, UserCog, FileCheck, Calendar, Wallet } from 'lucide-react';
import { Fragment, useState, useRef } from 'react';
import { motion, useScroll, useTransform, useSpring } from 'framer-motion';
import CountUp from '@/components/motion/CountUp';

export const Route = createFileRoute('/')({
    component: Home,
});

const featureFlags = ["Request", "Verify", "Anytime", "Anywhere"];

// Branch nodes representing the application process flow
const branchNodes = [
    {
        id: 1,
        name: "Alumni Signs In",
        description: "Alumni securely authenticates into the portal using their credentials. Multi-factor authentication ensures account security.",
        position: "top-[2%] left-[19%]",
        icon: <Users className="w-10 h-10" />,
        color: "bg-emerald-500",
        step: 1,
        status: "active",
    },
    {
        id: 2,
        name: "Request Document",
        description: "Browse and select the required academic documents (Transcripts, Certificates, Statement of Results). Fill out the request form with necessary details.",
        position: "top-[60%] left-[8%]",
        icon: <FileText className="w-5 h-5" />,
        color: "bg-teal-500",
        step: 2,
        status: "pending",
    },
    {
        id: 3,
        name: "Make Payment",
        description: "Secure online payment for document processing fees. Multiple payment options available including card, bank transfer, and USSD.",
        position: "top-[95%] left-[22%]",
        icon: <CreditCard className="w-5 h-5" />,
        color: "bg-indigo-500",
        step: 3,
        status: "pending",
    },
    {
        id: 4,
        name: "Request Processing",
        description: "Your request enters the processing queue. Administrative staff reviews and prepares your documents for verification.",
        position: "top-[2%] right-[5%]",
        icon: <Settings className="w-5 h-5" />,
        color: "bg-blue-500",
        step: 4,
        status: "pending",
    },
    {
        id: 5,
        name: "Vetting Process",
        description: "Academic records are thoroughly vetted against university database. Document authenticity is verified through proper channels.",
        position: "top-[58%] -right-[1%]",
        icon: <Eye className="w-5 h-5" />,
        color: "bg-purple-500",
        step: 5,
        status: "pending",
    },
    {
        id: 6,
        name: "Approved & Sent Out",
        description: "Documents are digitally signed, approved by the registrar, and sent out to the recipient via secure delivery method.",
        position: "top-[95%] right-[8%]",
        icon: <Send className="w-5 h-5" />,
        color: "bg-rose-500",
        step: 6,
        status: "pending",
    },
];

const stackCards = [
    {
        id: 1,
        title: "Alumni Signs In",
        description: "Secure authentication with multi-factor verification. Alumni access their personalized dashboard with request history and document status.",
        icon: <Users className="w-8 h-8" />,
        color: "from-emerald-500 to-teal-500",
        bgColor: "bg-emerald-50",
        borderColor: "border-emerald-200",
        details: ["Multi-factor authentication", "Personalized dashboard", "Request history", "Profile management"]
    },
    {
        id: 2,
        title: "Request Document",
        description: "Browse and select required academic documents including transcripts, certificates, and statements of results.",
        icon: <FileText className="w-8 h-8" />,
        color: "from-teal-500 to-cyan-500",
        bgColor: "bg-teal-50",
        borderColor: "border-teal-200",
        details: ["Transcripts", "Certificates", "Statement of Results", "Verification letters"]
    },
    {
        id: 3,
        title: "Make Payment",
        description: "Secure online payment processing with multiple payment options for document processing fees.",
        icon: <CreditCard className="w-8 h-8" />,
        color: "from-indigo-500 to-purple-500",
        bgColor: "bg-indigo-50",
        borderColor: "border-indigo-200",
        details: ["Card payments", "Bank transfer", "USSD options", "Payment receipts"]
    },
    {
        id: 4,
        title: "Request Processing",
        description: "Your request enters the processing queue where administrative staff reviews and prepares your documents.",
        icon: <Settings className="w-8 h-8" />,
        color: "from-blue-500 to-indigo-500",
        bgColor: "bg-blue-50",
        borderColor: "border-blue-200",
        details: ["Queue management", "Staff review", "Document preparation", "Quality check"]
    },
    {
        id: 5,
        title: "Vetting Process",
        description: "Thorough verification of academic records against university database for authenticity.",
        icon: <Eye className="w-8 h-8" />,
        color: "from-purple-500 to-pink-500",
        bgColor: "bg-purple-50",
        borderColor: "border-purple-200",
        details: ["Database verification", "Record authentication", "Compliance check", "Final approval"]
    },
    {
        id: 6,
        title: "Approved & Sent Out",
        description: "Documents are digitally signed, approved by registrar, and delivered via secure methods.",
        icon: <Send className="w-8 h-8" />,
        color: "from-rose-500 to-orange-500",
        bgColor: "bg-rose-50",
        borderColor: "border-rose-200",
        details: ["Digital signing", "Registrar approval", "Secure delivery", "Tracking number"]
    }
];

function Home() {
    const navigate = useNavigate();
    const { user } = useAppSelector((state) => state.auth);
    const [activeTooltip, setActiveTooltip] = useState<number | null>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const [hoveredCard, setHoveredCard] = useState<number | null>(null);

    // Track scroll progress through the section
    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ["start start", "end end"]
    });

    // Smooth spring animation for scroll progress
    const smoothProgress = useSpring(scrollYProgress, {
        stiffness: 100,
        damping: 30,
        restDelta: 0.001
    });

    return (
        <div className="min-h-screen flex flex-col relative bg-gradient-to-b from-white via-green-50/30 to-white">

            {/* Animated Background Elements */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-40 -right-40 w-80 h-80 bg-green-200/20 rounded-full blur-3xl animate-pulse" />
                <div className="absolute top-1/3 -left-40 w-80 h-80 bg-emerald-200/20 rounded-full blur-3xl animate-pulse delay-1000" />
                <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-teal-200/20 rounded-full blur-3xl animate-pulse delay-700" />
            </div>

            {/* Navigation */}
            <nav className="relative z-20 flex justify-end p-4 md:p-6 md:py-10 sticky top-0">
                <div className="flex justify-end absolute right-5 md:top-5 md:right-5">
                    {user && user?.role ? (
                        <div className='flex items-center gap-4'>
                            <Button
                                className="bg-gradient-to-r from-emerald-700 to-green-700 hover:from-emerald-800 hover:to-green-800 shadow-lg hover:shadow-xl transition-all duration-300"
                                onClick={() => {
                                    if (user?.role?.name === "ALUMNI") {
                                        navigate({ to: "/user" });
                                    } else if (user?.role?.name === "Super Admin") {
                                        navigate({ to: "/dashboard" });
                                    } else if (user?.role?.name === "Admin") {
                                        navigate({ to: "/dashboard" });
                                    } else {
                                        navigate({ to: "/faculty" });
                                    }
                                }}
                            >
                                Dashboard
                            </Button>
                            <LogoutButton />
                        </div>
                    ) : (
                        <div className="flex items-center">
                            <Button
                                className="rounded-r-none bg-gradient-to-r from-emerald-700 to-green-700 hover:from-emerald-800 hover:to-green-800 text-white shadow-lg hover:shadow-xl transition-all duration-300"
                            >
                                Login
                            </Button>
                            <Separator orientation="vertical" className="h-8 w-px bg-emerald-600" />
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button className="rounded-l-none border-l-0 px-2 bg-gradient-to-r from-emerald-700 to-green-700 hover:from-emerald-800 hover:to-green-800 text-white shadow-lg hover:shadow-xl transition-all duration-300">
                                        <ChevronDown />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent className="bg-white/95 backdrop-blur-xl border-emerald-100 shadow-xl">
                                    <DropdownMenuItem onSelect={() => navigate({
                                        to: "/auth/login",
                                        search: { role: "admin" }
                                    })} className="hover:bg-emerald-50 focus:bg-emerald-50 cursor-pointer">
                                        Admin
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onSelect={() => navigate({
                                        to: "/auth/login",
                                        search: { role: "alumni" }
                                    })} className="hover:bg-emerald-50 focus:bg-emerald-50 cursor-pointer">
                                        Alumni
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                    )}
                </div>
            </nav>

            {/* Hero Section */}
            <section className="relative z-10 flex flex-col justify-center grow mt-8 py-12 md:py-20">
                {/* Logo */}
                <div className="hidden lg:block absolute top-28 left-1/2 -translate-x-1/2 shadow-xl p-4 w-fit rounded-2xl bg-white/90 backdrop-blur-sm z-20 border border-emerald-100">
                    <img
                        src="/rsu-logo.png"
                        alt="Rivers State University Logo"
                        className="mx-auto size-28 md:size-38 animate-in fade-in duration-1000"
                    />
                </div>

                {/* Branch Image Container with Floating Divs */}
                <div className="hidden lg:block relative w-full max-w-6xl mx-auto px-4">
                    <div className="relative">
                        <img
                            src="/branch.png"
                            alt="University Branch Structure"
                            className="mx-auto w-[88%] animate-in fade-in duration-1000"
                        />

                        {/* Floating Divs on Branch Ends */}
                        {branchNodes.map((node) => (
                            <div
                                key={node.id}
                                className={`absolute ${node.position} transform -translate-x-1/2 -translate-y-1/2 z-30`}
                                onMouseEnter={() => setActiveTooltip(node.id)}
                                onMouseLeave={() => setActiveTooltip(null)}
                            >
                                {/* Pulsing Dot Indicator */}
                                <div className={`relative ${node.color} w-20 h-20 rounded-xl shadow-lg cursor-pointer group transition-all duration-300 hover:scale-125`}>
                                    <div className={`absolute inset-0 ${node.color} rounded-full animate-ping opacity-75`} />
                                    <div className="absolute inset-0 flex items-center justify-center text-white">
                                        {node.icon}
                                    </div>
                                </div>

                                {/* Tooltip */}
                                {activeTooltip === node.id && (
                                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-3 w-64 animate-in fade-in slide-in-from-bottom-2 duration-200 z-40">
                                        <div className="bg-gray-900 text-white rounded-xl shadow-2xl overflow-hidden">
                                            <div className={`${node.color} px-4 py-2 flex items-center gap-2`}>
                                                {node.icon}
                                                <h4 className="font-semibold text-sm">{node.name}</h4>
                                            </div>
                                            <div className="px-4 py-3">
                                                <p className="text-xs text-gray-200 leading-relaxed">{node.description}</p>
                                            </div>
                                            <div className={`absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-2 h-2 ${node.color} rotate-45`} />
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>

                    {/* Interactive Hint */}
                    <div className="text-center mt-22 text-sm text-gray-500 animate-pulse">
                        ✨ Hover over the colored dots to explore the document request process
                    </div>
                </div>

                <div className="container mx-auto px-4 ">
                    <img
                        src="/rsu-logo.png"
                        alt="Rivers State University Logo"
                        className="mx-auto size-28 md:size-38 animate-in fade-in duration-1000 lg:hidden"
                    />
                    <h1 className="text-center text-3xl md:text-5xl font-extrabold text-gray-900 max-w-4xl mx-auto my-8 leading-tight">
                        RIVERS STATE UNIVERSITY
                        <span className="block bg-gradient-to-r from-emerald-700 to-green-600 bg-clip-text text-transparent text-4xl md:text-6xl mt-2">
                            ACADEMIC RECORDS PORTAL
                        </span>
                    </h1>

                    {/* Feature Flags */}
                    <div className="flex flex-wrap justify-center items-center gap-4 md:gap-8 my-8 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-150">
                        {featureFlags.map((flag, index) => (
                            <Fragment key={flag}>
                                {index > 0 && <div className="w-1 h-1 rounded-full bg-emerald-300" />}
                                <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-50 rounded-full">
                                    <Star className="fill-emerald-600 stroke-emerald-600 w-4 h-4" />
                                    <span className="font-semibold text-gray-700 text-sm">{flag}</span>
                                </div>
                            </Fragment>
                        ))}
                    </div>

                    {/* CTA Buttons */}
                    <div className="flex flex-col sm:flex-row justify-center items-center gap-4 mt-12 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-300">
                        <Button
                            size="lg"
                            className='bg-gradient-to-r from-emerald-700 to-green-600 hover:from-emerald-800 hover:to-green-700 text-white px-8 py-6 text-lg shadow-xl hover:shadow-2xl transition-all duration-300 w-full sm:w-auto rounded-full'
                        >
                            Request Document
                        </Button>
                        <Button
                            size="lg"
                            variant="outline"
                            className="border-2 border-emerald-600 text-emerald-700 hover:bg-emerald-50 px-8 py-6 text-lg shadow-lg hover:shadow-xl transition-all duration-300 w-full sm:w-auto rounded-full"
                        >
                            <Link to="/verify" className="flex items-center gap-2">
                                Verify Document
                                <ArrowRightIcon className="w-4 h-4" />
                            </Link>
                        </Button>
                    </div>

                    {/* Certificate Status Link */}
                    <div className="flex justify-center items-center mt-8 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-500">
                        <button
                            className="flex items-center gap-3 group hover:bg-emerald-50 transition-all duration-300 p-4 rounded-xl"
                            onClick={() => navigate({ to: "/certificate" })}
                        >
                            <span className="text-gray-600 group-hover:text-emerald-700 transition-colors">
                                Check certificate status
                            </span>
                            <span className="p-2 bg-gradient-to-r from-emerald-700 to-green-600 rounded-full group-hover:scale-110 transition-all duration-300">
                                <ArrowRightIcon className="text-white w-4 h-4" />
                            </span>
                        </button>
                    </div>
                </div>
            </section>

            {/* Features Section - Updated with new features */}
            <section className="relative z-10 py-20 bg-white">
                <div className="absolute inset-x-0 top-0 h-32 bg-[radial-gradient(#22c55e_0.5px,transparent_0.5px)] bg-size[16px_16px] opacity-20" />

                <div className="container mx-auto px-4">
                    <div className="text-center mb-16 animate-in fade-in slide-in-from-bottom-4 duration-700">
                        <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                            Everything You Need
                        </h2>
                        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                            Streamlined academic record management at your fingertips
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {/* Feature 1 - User Management */}
                        <div className="group relative bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all border border-gray-100 hover:border-emerald-200 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-150">
                            <div className="absolute inset-0 bg-linear-to-br from-emerald-50/50 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                            <div className="relative">
                                <div className="w-16 h-16 bg-emerald-100 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                                    <UserCog className="w-8 h-8 text-emerald-700" />
                                </div>
                                <h3 className="text-2xl font-bold text-gray-900 mb-3">User Management</h3>
                                <p className="text-gray-600 leading-relaxed">
                                    Role-based access control for alumni, faculty, and administrators. Secure authentication and profile management for all users.
                                </p>
                                <div className="mt-6 flex items-center text-emerald-700 font-semibold">
                                    <span>Learn more</span>
                                    <ArrowRightIcon className="w-4 h-4 ml-2 group-hover:translate-x-2 transition-transform" />
                                </div>
                            </div>
                        </div>

                        {/* Feature 2 - Document Request & Vetting */}
                        <div className="group relative bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all border border-gray-100 hover:border-emerald-200 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-300">
                            <div className="absolute inset-0 bg-linear-to-br from-emerald-50/50 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                            <div className="relative">
                                <div className="w-16 h-16 bg-emerald-100 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                                    <FileCheck className="w-8 h-8 text-emerald-700" />
                                </div>
                                <h3 className="text-2xl font-bold text-gray-900 mb-3">Document Request & Vetting</h3>
                                <p className="text-gray-600 leading-relaxed">
                                    Seamless document request submission with thorough vetting process to ensure authenticity and compliance with university standards.
                                </p>
                                <div className="mt-6 flex items-center text-emerald-700 font-semibold">
                                    <span>Learn more</span>
                                    <ArrowRightIcon className="w-4 h-4 ml-2 group-hover:translate-x-2 transition-transform" />
                                </div>
                            </div>
                        </div>

                        {/* Feature 3 - Tracking & Timeline Management */}
                        <div className="group relative bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all border border-gray-100 hover:border-emerald-200 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-450">
                            <div className="absolute inset-0 bg-linear-to-br from-emerald-50/50 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                            <div className="relative">
                                <div className="w-16 h-16 bg-emerald-100 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                                    <Calendar className="w-8 h-8 text-emerald-700" />
                                </div>
                                <h3 className="text-2xl font-bold text-gray-900 mb-3">Tracking & Timeline</h3>
                                <p className="text-gray-600 leading-relaxed">
                                    Real-time tracking of document requests with detailed timeline views. Stay updated on every stage of your request journey.
                                </p>
                                <div className="mt-6 flex items-center text-emerald-700 font-semibold">
                                    <span>Learn more</span>
                                    <ArrowRightIcon className="w-4 h-4 ml-2 group-hover:translate-x-2 transition-transform" />
                                </div>
                            </div>
                        </div>

                        {/* Feature 4 - Secure Payments */}
                        <div className="group relative bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all border border-gray-100 hover:border-emerald-200 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-600">
                            <div className="absolute inset-0 bg-linear-to-br from-emerald-50/50 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                            <div className="relative">
                                <div className="w-16 h-16 bg-emerald-100 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                                    <Wallet className="w-8 h-8 text-emerald-700" />
                                </div>
                                <h3 className="text-2xl font-bold text-gray-900 mb-3">Secure Payments</h3>
                                <p className="text-gray-600 leading-relaxed">
                                    Integrated payment gateway for institutions and alumni. Secure transactions for document processing fees and other services.
                                </p>
                                <div className="mt-6 flex items-center text-emerald-700 font-semibold">
                                    <span>Learn more</span>
                                    <ArrowRightIcon className="w-4 h-4 ml-2 group-hover:translate-x-2 transition-transform" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Stats Section */}
            <section className="relative z-10 py-20 bg-linear-to-b from-white to-emerald-50/30">
                <div className="absolute inset-x-0 top-0 h-32 bg-[radial-gradient(#22c55e_0.5px,transparent_0.5px)] bg-size-[16px_16px] opacity-10" />

                <div className="container mx-auto px-4">
                    <div className="grid md:grid-cols-4 gap-8">
                        {[
                            { value: 100, suffix: "+", label: "Active Users" },
                            { value: 50, suffix: "+", label: "Documents Processed" },
                            { value: 99.9, suffix: "%", label: "Request Accuracy" },
                            { value: 24, suffix: "/7", label: "Support Available" },
                        ].map((stat, idx) => (
                            <div key={idx} className="text-center group">
                                <div className="text-5xl font-bold bg-gradient-to-r from-emerald-700 to-green-600 bg-clip-text text-transparent mb-2">
                                    <CountUp value={stat.value} />
                                    {stat.suffix}
                                </div>
                                <div className="text-gray-600">{stat.label}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* How It Works Section - Fixed Stacking Order */}
            <section ref={containerRef} className="relative min-h-[200vh]">
                <div className="text-center mb-16 animate-in fade-in slide-in-from-bottom-4 duration-700">
                    <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                        How It Works
                    </h2>
                    <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                        Get started in three simple steps
                    </p>
                </div>

                <div className="sticky top-0 h-screen flex items-center justify-center overflow-visible">
                    <div className="relative w-full max-w-4xl mx-auto px-4">
                        <div className="relative flex flex-col items-center justify-center min-h-[600px]">
                            {stackCards.map((card, index) => {
                                // Reverse the order for proper stacking (card 1 at bottom, card 6 on top)
                                const reversedIndex = index;
                                const isActive = smoothProgress.get() >= (reversedIndex / stackCards.length);

                                // Calculate scroll thresholds - each card appears at different scroll points
                                const startThreshold = reversedIndex / stackCards.length;
                                const endThreshold = (reversedIndex + 0.6) / stackCards.length;

                                // Card slides up from bottom
                                const y = useTransform(
                                    smoothProgress,
                                    [startThreshold, endThreshold],
                                    [200, 0]
                                );

                                // Scale - cards scale up as they come in
                                const scale = useTransform(
                                    smoothProgress,
                                    [startThreshold, endThreshold],
                                    [0.8, 1]
                                );

                                // Opacity - fade in smoothly
                                const opacity = useTransform(
                                    smoothProgress,
                                    [startThreshold, startThreshold + 0.1],
                                    [0, 1]
                                );

                                // Higher z-index for cards that come later (stack on top)
                                // Card 6 has highest z-index, Card 1 has lowest
                                const zIndex = index + 1;

                                // Rotate slightly for a more dynamic effect
                                const rotate = useTransform(
                                    smoothProgress,
                                    [startThreshold, endThreshold],
                                    [5, 0]
                                );

                                return (
                                    <motion.div
                                        key={card.id}
                                        style={{
                                            position: 'absolute',
                                            top: 0,
                                            left: 0,
                                            right: 0,
                                            margin: '0 auto',
                                            y,
                                            scale,
                                            opacity,
                                            rotate,
                                            zIndex,
                                        }}
                                        onMouseEnter={() => setHoveredCard(card.id)}
                                        onMouseLeave={() => setHoveredCard(null)}
                                    >
                                        <div className={`bg-white rounded-2xl overflow-hidden border ${card.borderColor} transition-all duration-300 cursor-pointer shadow-2xl`}>
                                            {/* Card Header */}
                                            <div className={`bg-gradient-to-r ${card.color} p-6 text-white`}>
                                                <div className="flex items-center gap-4">
                                                    <div className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                                                        {card.icon}
                                                    </div>
                                                    <div className="flex-1">
                                                        <div className="text-sm opacity-90 flex items-center gap-2">
                                                            <span>Step {card.id} of {stackCards.length}</span>
                                                            {isActive && (
                                                                <span className="px-2 py-0.5 bg-white/20 rounded-full text-xs">
                                                                    Current
                                                                </span>
                                                            )}
                                                        </div>
                                                        <h2 className="text-2xl font-bold">{card.title}</h2>
                                                    </div>
                                                    {/* Step Indicator Badge */}
                                                    <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center text-xl font-bold">
                                                        {card.id}
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Card Body */}
                                            <div className="p-8">
                                                <p className="text-gray-600 text-lg mb-6 leading-relaxed">
                                                    {card.description}
                                                </p>

                                                {/* Details Grid */}
                                                <div className="grid grid-cols-2 gap-3 mb-6">
                                                    {card.details.map((detail, idx) => (
                                                        <motion.div
                                                            key={idx}
                                                            initial={{ opacity: 0, x: -20 }}
                                                            animate={{ opacity: 1, x: 0 }}
                                                            transition={{ delay: idx * 0.1 }}
                                                            className="flex items-center gap-2 text-sm text-gray-700 bg-gray-50 rounded-lg px-3 py-2"
                                                        >
                                                            <div className={`w-1.5 h-1.5 rounded-full bg-gradient-to-r ${card.color}`} />
                                                            {detail}
                                                        </motion.div>
                                                    ))}
                                                </div>

                                                {/* Progress Indicator */}
                                                <div className="mt-4 pt-4 border-t border-gray-100">
                                                    <div className="flex justify-between items-center text-sm">
                                                        <span className="text-gray-500">Process Progress</span>
                                                        <span className={`font-semibold bg-gradient-to-r ${card.color} bg-clip-text text-transparent`}>
                                                            {Math.round((card.id / stackCards.length) * 100)}% Complete
                                                        </span>
                                                    </div>
                                                    <div className="mt-2 h-2 bg-gray-100 rounded-full overflow-hidden">
                                                        <motion.div
                                                            initial={{ width: 0 }}
                                                            animate={{ width: `${(card.id / stackCards.length) * 100}%` }}
                                                            transition={{ duration: 0.5, delay: index * 0.1 }}
                                                            className={`h-full rounded-full bg-gradient-to-r ${card.color}`}
                                                        />
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Hover Effect Indicator */}
                                            {hoveredCard === card.id && (
                                                <motion.div
                                                    initial={{ opacity: 0, scale: 0 }}
                                                    animate={{ opacity: 1, scale: 1 }}
                                                    className="absolute -right-3 -top-3 bg-white rounded-full shadow-lg p-2"
                                                >
                                                    <div className={`w-8 h-8 rounded-full bg-gradient-to-r ${card.color} flex items-center justify-center`}>
                                                        <Eye className="w-4 h-4 text-white" />
                                                    </div>
                                                </motion.div>
                                            )}
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </div>

                        {/* Scroll Progress Indicator */}
                        <motion.div
                            className="absolute bottom-8 left-1/2 transform -translate-x-1/2 w-64 bg-white/80 backdrop-blur-sm rounded-full py-2 px-4 shadow-lg z-50"
                            style={{ opacity: useTransform(smoothProgress, [0, 0.9], [1, 0]) }}
                        >
                            <div className="flex justify-between text-xs text-gray-600 mb-1">
                                <span>Scroll Progress</span>
                                <span>{Math.round(smoothProgress.get() * 100)}%</span>
                            </div>
                            <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                                <motion.div
                                    className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full"
                                    style={{ width: useTransform(smoothProgress, [0, 1], [0, 100]) + '%' }}
                                />
                            </div>
                        </motion.div>

                        {/* Step Labels */}
                        <motion.div
                            className="absolute left-4 top-1/2 transform -translate-y-1/2 hidden lg:block"
                            style={{ opacity: useTransform(smoothProgress, [0, 0.9], [1, 0]) }}
                        >
                            <div className="space-y-2">
                                {stackCards.map((card, idx) => (
                                    <motion.div
                                        key={card.id}
                                        className={`text-xs font-medium px-2 py-1 rounded ${smoothProgress.get() >= (idx / stackCards.length) ? 'bg-emerald-500 text-white' : 'bg-gray-200 text-gray-500'}`}
                                        style={{
                                            opacity: useTransform(smoothProgress, [(idx - 0.5) / stackCards.length, idx / stackCards.length], [0, 1])
                                        }}
                                    >
                                        Step {card.id}
                                    </motion.div>
                                ))}
                            </div>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* Completion Section */}
            <motion.section
                className="relative min-h-[60vh] py-20 bg-gradient-to-r from-green-950 to-green-800 flex items-center"
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                transition={{ duration: 0.8 }}
                viewport={{ once: true }}
            >
                <div className="absolute inset-0 bg-[radial-gradient(#ffffff20_1px,transparent_1px)] bg-size-[20px_20px]" />
                <div className="relative container mx-auto px-4 text-center">
                    <motion.div
                        initial={{ scale: 0, rotate: -180 }}
                        whileInView={{ scale: 1, rotate: 0 }}
                        transition={{ duration: 0.6, type: "spring" }}
                        className="w-24 h-24 bg-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl"
                    >
                        <CheckCircle className="w-12 h-12 text-emerald-600" />
                    </motion.div>
                    <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
                        Ready to Get Started?
                    </h2>
                    <p className="text-xl text-emerald-100 max-w-2xl mx-auto mb-8">
                        Join thousands of alumni who have successfully requested their academic documents
                    </p>
                    <div className="flex gap-4 justify-center flex-wrap">
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="px-8 py-3 bg-white text-emerald-600 rounded-full font-semibold shadow-lg hover:shadow-xl transition-all"
                        >
                            Request Document
                        </motion.button>
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="px-8 py-3 border-2 border-white text-white rounded-full font-semibold hover:bg-white/10 transition-all"
                        >
                            Learn More
                        </motion.button>
                    </div>
                </div>
            </motion.section>

            {/* Footer */}
            <footer className="relative z-10 bg-gray-900 text-white py-12">
                <div className="container mx-auto px-4">
                    <div className="grid md:grid-cols-4 gap-8">
                        <div>
                            <h4 className="text-lg font-bold mb-4 bg-gradient-to-r from-emerald-400 to-green-400 bg-clip-text text-transparent">RSU ARP</h4>
                            <p className="text-gray-400 text-sm">
                                Rivers State University Academic Records Portal
                            </p>
                        </div>
                        <div>
                            <h4 className="text-lg font-bold mb-4">Quick Links</h4>
                            <ul className="space-y-2 text-sm text-gray-400">
                                <li><Link to="/" className="hover:text-emerald-400 transition-colors">Home</Link></li>
                                <li><Link to="/verify" className="hover:text-emerald-400 transition-colors">Verify</Link></li>
                                <li><Link to="/certificate" className="hover:text-emerald-400 transition-colors">Certificate Status</Link></li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="text-lg font-bold mb-4">Support</h4>
                            <ul className="space-y-2 text-sm text-gray-400">
                                <li className="hover:text-emerald-400 transition-colors cursor-pointer">Help Center</li>
                                <li className="hover:text-emerald-400 transition-colors cursor-pointer">Contact Us</li>
                                <li className="hover:text-emerald-400 transition-colors cursor-pointer">FAQs</li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="text-lg font-bold mb-4">Legal</h4>
                            <ul className="space-y-2 text-sm text-gray-400">
                                <li className="hover:text-emerald-400 transition-colors cursor-pointer">Privacy Policy</li>
                                <li className="hover:text-emerald-400 transition-colors cursor-pointer">Terms of Service</li>
                            </ul>
                        </div>
                    </div>
                    <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm text-gray-400">
                        © 2024 Rivers State University. All rights reserved.
                    </div>
                </div>
            </footer>
        </div>
    );
}