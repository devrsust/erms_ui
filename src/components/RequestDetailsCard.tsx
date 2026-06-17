import {
    Building2,
    Mail,
    MapPin,
    Calendar,
    Copy,
    Globe,
    GraduationCap,
    Download,
    School
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Separator } from "./ui/separator";

const statusStyles: Record<string, string> = {
    APPROVED: "bg-green-50 text-green-700 border-green-200 hover:bg-green-50",
    REJECTED: "bg-red-50 text-red-700 border-red-200 hover:bg-red-50",
    PENDING: "bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-100",
    PROCESSING: "bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-50",
    RETURNED: "bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-50",
};

type Props = {
    request: {
        id: number;
        type: 'internal' | 'external' | string;
        reference_number: string;
        status: string;
        address?: string;
        email?: string;
        createdAt: string;
        facultyId?: number;
        pdfUrl?: string; // Appears when status is APPROVED
        faculty?: {
            id: number;
            name: string;
        };
        document?: {
            id: number;
            title: string;
        };
    };
    copyReference: () => void;
    formatDate: (dateStr: string) => string;
};

const RequestDetailsCard = ({ request, copyReference, formatDate }: Props) => {
    const isInternal = request.type === 'internal';
    const isApproved = request.status === 'APPROVED';

    // ✅ Force Cloudinary to treat the file path as a direct download attachment
    const getCloudinaryDownloadUrl = (url?: string) => {
        if (!url) return '';
        if (url.includes('/image/upload/')) {
            return url.replace('/image/upload/', '/image/upload/fl_attachment/');
        }
        return url;
    };

    return (
        <Card className="border shadow-sm overflow-hidden bg-white">
            {/* Header Container */}
            <CardHeader className="border-b bg-slate-50/50 pb-4">
                <div className="flex flex-wrap items-center justify-between gap-4">
                    <div className="space-y-1.5">
                        <div className="flex items-center gap-2.5">
                            <CardTitle className="text-xl font-bold tracking-tight text-slate-900">
                                Request Details
                            </CardTitle>
                            <Badge
                                variant="outline"
                                className={`font-semibold tracking-wide px-2.5 py-0.5 text-xs rounded-md ${statusStyles[request.status] || statusStyles.PENDING
                                    }`}
                            >
                                {request.status}
                            </Badge>
                        </div>

                        <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
                            <span className="bg-slate-100 px-2 py-1 rounded font-mono text-slate-700">
                                {request.reference_number}
                            </span>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7 text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 rounded"
                                onClick={copyReference}
                                title="Copy reference number"
                            >
                                <Copy className="h-3.5 w-3.5" />
                            </Button>
                        </div>
                    </div>

                    <div className="flex items-start gap-3.5 p-3.5">
                        <div className="p-2 rounded-lg bg-rose-50 text-rose-600">
                            <Calendar className="h-4 w-4" />
                        </div>
                        <div>
                            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Requested On</p>
                            <p className="font-semibold text-slate-800 mt-0.5">
                                {formatDate(request.createdAt)}
                            </p>
                        </div>
                    </div>
                </div>
            </CardHeader>

            {/* Main Grid Content */}
            <CardContent className="p-6 space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">

                    {/* Card Meta Field: Type */}
                    <div className="flex items-start gap-3 p-3 bg-slate-50/70 border border-slate-100 rounded-xl">
                        <div className={`p-2 rounded-lg mt-0.5 ${isInternal ? 'bg-indigo-50 text-indigo-600' : 'bg-sky-50 text-sky-600'}`}>
                            {isInternal ? <Building2 className="h-4 w-4" /> : <Globe className="h-4 w-4" />}
                        </div>
                        <div className="min-w-0 flex-1">
                            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Type</p>
                            <p className="font-semibold text-slate-800 capitalize mt-0.5 text-sm truncate">
                                {request.type}
                            </p>
                        </div>
                    </div>

                    {/* Card Meta Field: Created At */}
                    <div className="flex items-start gap-3 p-3 bg-slate-50/70 border border-slate-100 rounded-xl">
                        <div className="p-2 rounded-lg mt-0.5 bg-rose-50 text-rose-600">
                            <School className="h-4 w-4" />
                        </div>
                        <div className="min-w-0 flex-1">
                            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Request From</p>
                            <p className="font-semibold text-slate-800 mt-0.5 text-sm truncate">
                                {request.faculty?.name}
                            </p>
                        </div>
                    </div>

                    {/* Card Meta Field: Destination Email / Target */}
                    <div className="flex items-start gap-3 p-3 bg-slate-50/70 border border-slate-100 rounded-xl">
                        <div className={`p-2 rounded-lg mt-0.5 ${isInternal ? 'bg-emerald-50 text-emerald-600' : 'bg-violet-50 text-violet-600'}`}>
                            {isInternal ? <GraduationCap className="h-4 w-4" /> : <Mail className="h-4 w-4" />}
                        </div>
                        <div className="min-w-0 flex-1">
                            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Destination Email</p>
                            <p className="font-semibold text-slate-800 mt-0.5 text-sm truncate" title={isInternal ? request.faculty?.name : request.email}>
                                {isInternal
                                    ? request.faculty?.name || `Faculty #${request.facultyId}`
                                    : request.email || '—'}
                            </p>
                        </div>
                    </div>

                    {/* Card Meta Field: Destination Address */}
                    <div className="flex items-start gap-3 p-3 bg-slate-50/70 border border-slate-100 rounded-xl">
                        <div className="p-2 rounded-lg mt-0.5 bg-amber-50 text-amber-600">
                            <MapPin className="h-4 w-4" />
                        </div>
                        <div className="min-w-0 flex-1">
                            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Destination Address</p>
                            <p className="font-semibold text-slate-800 mt-0.5 text-sm truncate" title={request.address}>
                                {request.address || '—'}
                            </p>
                        </div>
                    </div>


                </div>

                <Separator className="bg-slate-100" />

                {/* Dynamic Document Summary Footer Block */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-slate-900 text-white rounded-xl shadow-inner">
                    <div className="space-y-0.5">
                        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                            Associated Document
                        </p>
                        <h3 className="text-base font-semibold tracking-tight text-white">
                            {request.document?.title || '—'}
                        </h3>
                    </div>

                    {/* ✅ Render logic updated to verify APPROVED status and view layout targets */}
                    {isApproved && request.pdfUrl && (
                        <Button
                            asChild
                            variant="secondary"
                            size="sm"
                            className="w-full sm:w-auto font-semibold bg-white text-slate-900 hover:bg-slate-100 transition-colors"
                        >
                            <a
                                href={getCloudinaryDownloadUrl(request.pdfUrl)}
                                download={`${request.document?.title || 'document'}.pdf`}
                                className="flex items-center justify-center gap-2"
                            >
                                <Download className="h-4 w-4 text-slate-700" />
                                Download Document
                            </a>
                        </Button>
                    )}
                </div>
            </CardContent>
        </Card>
    );
};

export default RequestDetailsCard;