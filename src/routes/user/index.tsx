import { SiteHeader } from "@/components/site-header";
import { createFileRoute, useNavigate } from "@tanstack/react-router";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

import { AlertCircle, ArrowUpDown, CalendarDays, CheckCircle, Clock, CreditCard, Download, Eye, FileText, MoreVertical, Trash2, TrendingUp, XCircle } from "lucide-react";

import { useQueries } from "@tanstack/react-query";
import { AlumniActivityLog, alumniStats, getRequestsByUser, type Request } from "@/service";
import { useAppSelector } from "@/store/hooks";
import { ActivityCard } from "@/components/activity";
import IsPending from "@/components/Illustrations/isPending";
import type { ColumnDef } from "@tanstack/react-table";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { DataTable } from "@/components/table";



export const Route = createFileRoute("/user/")({
  component: Dashboard,
});

function Dashboard() {
  const { user } = useAppSelector((state) => state.auth);
  const navigate = useNavigate();

  const results = useQueries({
    queries: [
      {
        queryKey: ["dashboard-stats", user?.id],
        queryFn: () => alumniStats(user?.id || 0),
        enabled: !!user?.id,
        staleTime: 30_000,
      },
      {
        queryKey: ["activity", user?.id],
        queryFn: () => AlumniActivityLog(user?.id || 0),
        enabled: !!user?.id,
        staleTime: 30_000,
      },
      {
        queryKey: ["requests", user?.id],
        queryFn: () => getRequestsByUser(user!.id),
        enabled: !!user?.id,
        staleTime: 30_000,
      }
    ],
  });

  const [statsQuery, activityQuery, recentQuery] = results;

  if (statsQuery.isLoading || activityQuery.isLoading || recentQuery.isLoading) {
    return <IsPending page="Dashboard" />;
  }

  const stats = statsQuery.data;
  const activity = activityQuery.data;
  const requests = recentQuery?.data?.data;

  

  const columns: ColumnDef<Request>[] = [
    {
      id: "select",
      header: ({ table }) => (
        <Checkbox
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && "indeterminate")
          }
          onCheckedChange={(value) =>
            table.toggleAllPageRowsSelected(!!value)
          }
          className="border-gray-300"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          className="border-gray-300"
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      id: "request",
      header: () => (
        <div className="flex items-center gap-2 font-semibold">
          <FileText className="h-4 w-4 text-blue-500" />
          <span>Request</span>
        </div>
      ),
      accessorFn: (row) => row.document?.title ?? "—",
      cell: ({ row }) => {
        const request = row.original
        return (
          <div className="space-y-1">
            <div className="font-medium text-gray-900">
              {request.document?.title}
            </div>
            <div className="text-xs text-gray-500 flex items-center gap-1">
              <FileText className="h-3 w-3" />
              {request.type}
            </div>
          </div>
        )
      },
    },
    {
      accessorKey: "status",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() =>
            column.toggleSorting(column.getIsSorted() === "asc")
          }
          className="font-semibold hover:bg-gray-50"
        >
          Status
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => {
        const status = row.getValue("status") as string
        // const request = row.original

        type Status = "PENDING" | "SUCCESSFUL" | "FAILED";

        const statusStyles: Record<Status, string> = {
          PENDING: "bg-yellow-100 text-yellow-700",
          SUCCESSFUL: "bg-green-100 text-green-700",
          FAILED: "bg-red-100 text-red-700",
        };



        return (
          <div className="space-y-1.5">
            <Badge
              className={`gap-1.5 ${statusStyles[status as Status] || "bg-gray-100 text-gray-700"
                }`}
            >
              {status === "PENDING" && <Clock className="h-3 w-3" />}
              {status === "SUCCESSFUL" && <CheckCircle className="h-3 w-3" />}
              {status === "FAILED" && <XCircle className="h-3 w-3" />}
              {status}
            </Badge>
            {status === "PENDING" && (
              <div className="flex items-center gap-2">
                <Progress value={50} className="h-1.5 w-20 [&>div]:bg-green-800" />
                <span className="text-xs text-gray-500">Processing</span>
              </div>
            )}
          </div>
        )
      },
    },
    {
      accessorKey: "reference_number",
      header: () => (
        <div className="flex items-center gap-2 font-semibold">
          <CreditCard className="h-4 w-4 text-purple-500" />
          <span>Reference</span>
        </div>
      ),
      cell: ({ getValue }) => (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="font-mono text-sm font-medium bg-gray-50 px-2 py-1 rounded-md hover:bg-gray-100 cursor-pointer">
                {getValue<string>().slice(0, 8)}...
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p className="font-mono">{getValue<string>()}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      ),
    },
    {
      accessorKey: "createdAt",
      header: () => (
        <div className="flex items-center gap-2 font-semibold">
          <CalendarDays className="h-4 w-4" />
          <span>Created</span>
        </div>
      ),
      cell: ({ row }) => {
        const date = new Date(row.getValue("createdAt"));
        return (
          <div className="space-y-0.5">
            <div className="text-sm font-medium">
              {new Intl.DateTimeFormat("en-US", {
                year: "2-digit",
                month: "2-digit",
                day: "2-digit",
                hour: "2-digit",
                minute: "2-digit"
              }).format(date)}
            </div>
          </div>
        )
      },
    }
  ]

  return (
    <>
      <SiteHeader title="Dashboard" />

      <div className="flex flex-1 flex-col bg-gray-50 p-6 gap-6">
        {/* Top Stats */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card className="grid gap-4 p-4">
            <p className="text-sm font-medium text-gray-600">Total Requests</p>
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 bg-purple-100 rounded-full flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-purple-600" />
              </div>
              <h3 className="text-2xl font-bold">{stats?.totalRequests}</h3>
            </div>
            <p className="text-xs text-gray-500">Total number of requests</p>
          </Card>

          <Card className="grid gap-4 p-4">
            <p className="text-sm font-medium text-gray-600">Pending</p>
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 bg-amber-100 rounded-full flex items-center justify-center">
                <Clock className="h-6 w-6 text-amber-600" />
              </div>
              <h3 className="text-2xl font-bold">{stats?.pendingRequests}</h3>
            </div>
            <p className="text-xs text-gray-500">Awaiting processing</p>
          </Card>

          <Card className="grid gap-4 p-4">
            <p className="text-sm font-medium text-gray-600">Completed</p>
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="text-2xl font-bold">{stats?.completedRequests}</h3>
            </div>
            <p className="text-xs text-gray-500">Successfully delivered</p>
          </Card>

          <Card className="grid gap-4 p-4">
            <p className="text-sm font-medium text-gray-600">Total Requests</p>
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 bg-purple-100 rounded-full flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-purple-600" />
              </div>
              <h3 className="text-2xl font-bold">
                {new Intl.NumberFormat("en-US", {
                  style: "currency",
                  currency: "NGN",
                  minimumFractionDigits: 0,
                }).format(stats?.totalSuccessfulTransactionAmount)}
              </h3>
            </div>
            <p className="text-xs text-gray-500">
              {/* {completionRate.toFixed(0)}% completion rate */}
            </p>
          </Card>
        </div>



        {/* Middle Section */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Recent Requests Table */}
          <div className="lg:col-span-2 bg-white p-5 rounded-lg border">
            <div>
              <CardTitle>Recent Requests</CardTitle>
            </div>

              <DataTable
                columns={columns}
                data={requests!}
                filterColumn="reference"
                filterPlaceholder="Search by document name or reference…"
                recordName='REQUEST'
                recordIcon={<FileText className="h-20 w-20" />}
              />
            
          </div>

          <div className="w-full overflow-hidden">
            <ActivityCard activities={activity} maxDisplay={5} />
          </div>
        </div>
      </div>
    </>
  );
}
