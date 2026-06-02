import { Rocket, CircleCheckBig, Flag } from "lucide-react";
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
    currentStep: Step;
};

type Props = {
    request: RequestType;
};

const ApprovalTimeline = ({ request }: Props) => {
    const steps = request?.document?.approvalChain.steps || [];
    const currentStepOrder = request?.currentStep?.stepOrder ?? 0;

    const getStepState = (order: number) => {
        if (order < currentStepOrder) return "completed";
        if (order === currentStepOrder) return "current";
        return "pending";
    };

    const base =
        "h-10 w-10 rounded-full flex items-center justify-center border-2";

    const styles = {
        completed: "bg-green-700 border-green-700",
        current: "bg-white border-green-700",
        pending: "bg-white border-gray-300",
    };

    const icon = {
        completed: "stroke-white",
        current: "stroke-green-700",
        pending: "stroke-gray-400",
    };

    // total nodes = start + steps + end
    const total = steps.length + 2;
    const progressIndex = currentStepOrder; // aligns with steps
    const progressWidth = (progressIndex / (total - 1)) * 100;

    return (
        <Card className="border shadow-sm">
            <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                    <span className="px-2 py-0.5 text-[10px] rounded bg-gray-100 text-gray-600">
                        {request?.status}
                    </span>
                    {request?.document.title} Approval Timeline
                </CardTitle>
            </CardHeader>

            <CardContent className="px-10 flex justify-center items-center">
                <div className="relative w-[80%]">
                    {/* line */}
                    <div className="absolute top-5 left-0 w-full h-[2px] bg-gray-200" />
                    <div
                        className="absolute top-5 left-0 h-[2px] bg-green-700 transition-all"
                        style={{ width: `${progressWidth}%` }}
                    />

                    {/* nodes */}
                    <div className="relative flex items-center justify-between">
                        {/* START */}
                        <div className="flex flex-col items-center gap-1">
                            <div className={`${base} bg-green-700 border-green-700`}>
                                <Rocket className="h-4 w-4 stroke-white" />
                            </div>
                            <span className="text-[10px] text-gray-500">Start</span>
                        </div>

                        {/* STEPS */}
                        {steps.map((step) => {
                            const state = getStepState(step.stepOrder);

                            return (
                                <div
                                    key={step.id}
                                    className="flex flex-col items-center gap-1 flex-1"
                                >
                                    <div className={`${base} ${styles[state]}`}>
                                        <CircleCheckBig
                                            className={`h-4 w-4 ${icon[state]}`}
                                        />
                                    </div>

                                    <span className="text-[10px] text-center truncate max-w-[80px] text-gray-600">
                                        {step.name}
                                    </span>
                                </div>
                            );
                        })}

                        {/* END */}
                        <div className="flex flex-col items-center gap-1">
                            <div className={`${base} bg-white border-gray-300`}>
                                <Flag className="h-4 w-4 stroke-gray-400" />
                            </div>
                            <span className="text-[10px] text-gray-500">End</span>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};

export default ApprovalTimeline;