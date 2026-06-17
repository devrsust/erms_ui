import { Rocket, CircleCheckBig, Flag, XCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";

type Step = {
    id: number;
    chainId: number;
    stepOrder: number;
    name: string;
    description: string | null;
    roleId: number | null;
    userId: number | null;
    canReject: boolean;
    createdAt: string;
};

type ApprovalChain = {
    id: number;
    steps: Step[];
};

type DocumentType = {
    id: number;
    title: string;
    approvalChain: ApprovalChain;
};

type RequestType = {
    id: number;
    status: string;
    document: DocumentType;
    currentStep: Step | null; // Made nullable to support actual production responses
};

type Props = {
    request: RequestType;
};

const ApprovalTimeline = ({ request }: Props) => {
    // ✅ ISSUE 2 FIX: Ensure steps are strictly ordered by stepOrder asc
    const steps = [...(request?.document?.approvalChain?.steps || [])].sort(
        (a, b) => a.stepOrder - b.stepOrder
    );

    const isApproved = request?.status === "APPROVED";
    const isRejected = request?.status === "REJECTED";
    const isFinalized = isApproved || isRejected;

    // ✅ ISSUE 1 FIX: If finalized, handle step states safely without relying on currentStep
    const currentStepOrder = request?.currentStep?.stepOrder ?? 0;

    const getStepState = (order: number) => {
        if (isApproved) return "completed";
        if (isRejected) return "rejected"; // Custom style case for broken timelines
        if (order < currentStepOrder) return "completed";
        if (order === currentStepOrder) return "current";
        return "pending";
    };

    const base =
        "h-10 w-10 rounded-full flex items-center justify-center border-2 z-10 transition-colors duration-300";

    const styles = {
        completed: "bg-green-700 border-green-700 text-white",
        current: "bg-white border-green-700 text-green-700",
        pending: "bg-white border-gray-300 text-gray-400",
        rejected: "bg-red-600 border-red-600 text-white",
    };

    const iconStyles = {
        completed: "stroke-white",
        current: "stroke-green-700",
        pending: "stroke-gray-400",
        rejected: "stroke-white",
    };

    // Calculate dynamic line progress width
    const totalNodes = steps.length + 2;
    let progressWidth = 0;

    if (isApproved) {
        progressWidth = 100;
    } else if (isRejected) {
        // Find index where timeline broke, or fallback to start
        const failedIndex = steps.findIndex(s => s.id === request?.currentStep?.id);
        const nodeIndex = failedIndex !== -1 ? failedIndex + 1 : 1;
        progressWidth = (nodeIndex / (totalNodes - 1)) * 100;
    } else {
        const currentActiveIndex = steps.findIndex(s => s.stepOrder === currentStepOrder);
        const progressIndex = currentActiveIndex !== -1 ? currentActiveIndex + 1 : 0;
        progressWidth = (progressIndex / (totalNodes - 1)) * 100;
    }

    return (
        <Card className="border shadow-sm w-full">
            <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                    <span
                        className={`px-2 py-0.5 text-[10px] uppercase font-bold rounded ${isApproved ? "bg-green-100 text-green-700" :
                                isRejected ? "bg-red-100 text-red-700" : "bg-blue-100 text-blue-700"
                            }`}
                    >
                        {request?.status}
                    </span>
                    {request?.document?.title} Approval Timeline
                </CardTitle>
            </CardHeader>

            <CardContent className="px-6 py-6 flex justify-center items-center">
                <div className="relative w-full max-w-3xl px-4">

                    {/* Background Progress Line Tracks */}
                    <div className="absolute top-5 left-4 right-4 h-[2px] bg-gray-200 -z-0" />
                    <div
                        className={`absolute top-5 left-4 h-[2px] transition-all duration-500 ease-in-out ${isRejected ? "bg-red-500" : "bg-green-700"
                            }`}
                        style={{ width: `calc(${progressWidth}% - 2rem)` }}
                    />

                    {/* Nodes Container */}
                    <div className="relative flex items-center justify-between w-full">

                        {/* START NODE */}
                        <div className="flex flex-col items-center gap-2">
                            <div className={`${base} bg-green-700 border-green-700`}>
                                <Rocket className="h-4 w-4 stroke-white" />
                            </div>
                            <span className="text-[11px] font-medium text-gray-500">Start</span>
                        </div>

                        {/* INTERMEDIATE WORKFLOW STEPS */}
                        {steps.map((step) => {
                            const state = getStepState(step.stepOrder);

                            return (
                                <div
                                    key={step.id}
                                    className="flex flex-col items-center gap-2 flex-1 min-w-[60px]"
                                >
                                    <div className={`${base} ${styles[state]}`}>
                                        {state === "rejected" ? (
                                            <XCircle className={`h-4 w-4 ${iconStyles[state]}`} />
                                        ) : (
                                            <CircleCheckBig className={`h-4 w-4 ${iconStyles[state]}`} />
                                        )}
                                    </div>

                                    <span className="text-[11px] font-medium text-center truncate max-w-[90px] text-gray-600">
                                        {step.name}
                                    </span>
                                </div>
                            );
                        })}

                        {/* END FLAG NODE */}
                        <div className="flex flex-col items-center gap-2">
                            <div
                                className={`${base} ${isApproved
                                        ? "bg-green-700 border-green-700 text-white"
                                        : "bg-white border-gray-300 text-gray-400"
                                    }`}
                            >
                                <Flag className={`h-4 w-4 ${isApproved ? "stroke-white" : "stroke-gray-400"}`} />
                            </div>
                            <span className="text-[11px] font-medium text-gray-500">End</span>
                        </div>

                    </div>
                </div>
            </CardContent>
        </Card>
    );
};

export default ApprovalTimeline;