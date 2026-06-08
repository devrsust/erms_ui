import { SiteHeader } from "@/components/site-header";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Card, CardContent } from "@/components/ui/card";
import { ActivityCard } from "@/components/activity";
import { BanknoteArrowDown, Calendar, Eye, FileText, Mail, MoreHorizontal, ShieldUser, TrendingUp, Users } from "lucide-react";
import { useAppSelector } from "@/store/hooks";
import { useQueries } from "@tanstack/react-query";
import { adminStats, getPendingRequests, AdminActivityLog, type Request } from "@/service";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import type { ColumnDef } from "@tanstack/react-table";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { DataTable } from "@/components/table";

export const Route = createFileRoute("/records/")({
  component: Dashboard,
});

function Dashboard() {
  const { user } = useAppSelector((state) => state.auth);
  const navigate = useNavigate();

  const results = useQueries({
    queries: [
      {
        queryKey: ["dashboard-stats", user?.id],
        queryFn: () => adminStats(user!.id),
        enabled: !!user?.id,
        staleTime: 30_000,
      },
      {
        queryKey: ["activity", user?.id],
        queryFn: () => AdminActivityLog(user!.id),
        enabled: !!user?.id,
        staleTime: 30_000,
      },
      {
        queryKey: ["pending", user?.id],
        queryFn: () => getPendingRequests(Number(user?.id)),
        enabled: !!user?.id,
        staleTime: 30_000,
      },
    ],
  });

  const [statsQuery, activityQuery, pendingQuery] = results;

  if (statsQuery.isLoading || activityQuery.isLoading || pendingQuery.isLoading) {
    return <div>Loading...</div>;
  }


  const stats = statsQuery.data;
  const activity = activityQuery.data;
  const pending = pendingQuery.data?.data;

  const columns: ColumnDef<Request>[] = [
    {
      id: 'select',
      header: ({ table }) => (
        <Checkbox
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && 'indeterminate')
          }
          onCheckedChange={(value) =>
            table.toggleAllPageRowsSelected(!!value)
          }
          aria-label="Select all"
          className="border-gray-300"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Select row"
          className="border-gray-300"
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      id: "request",
      header: () => (
        <Button
          variant="ghost"
          className="font-semibold hover:bg-gray-50"
        >
          <FileText className="mr-2 h-4 w-4" />
          Request
        </Button>
      ),
      accessorFn: (row) => row.document?.title ?? "—",
      cell: ({ getValue }) => (
        <div className="font-medium">
          {getValue<string>()}
        </div>
      ),
    },
    {
      accessorKey: "status",
      header: ({ column }) => (
        <div
          className="flex items-center cursor-pointer select-none text-sm font-semibold text-gray-700 hover:text-gray-900"
          onClick={() =>
            column.toggleSorting(column.getIsSorted() === "asc")
          }
        >
          Status
        </div>
      ),
      cell: ({ getValue }) => {
        const status = getValue<string>()

        const styles: Record<string, string> = {
          PENDING:
            "bg-amber-50 text-amber-700 border border-amber-200",
          SUCCESSFUL:
            "bg-emerald-50 text-emerald-700 border border-emerald-200",
          FAILED:
            "bg-red-50 text-red-700 border border-red-200",
        }

        return (
          <span
            className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold tracking-wide ${styles[status] ??
              "bg-gray-50 text-gray-700 border border-gray-200"
              }`}
          >
            {status}
          </span>
        )
      },
    },
    {
      id: "email",
      header: () => (
        <Button
          variant="ghost"
          className="font-semibold hover:bg-gray-50"
        >
          <Mail className="mr-2 h-4 w-4" />
          Email
        </Button>
      ),
      accessorFn: (row) => row.user?.email ?? "—",
      cell: ({ getValue }) => (
        <div className="font-medium">
          {getValue<string>()}
        </div>
      ),
    },
    {
      id: "amount",
      header: () => (
        <Button
          variant="ghost"
          className="font-semibold hover:bg-gray-50"
        >
          Type
        </Button>
      ),
      accessorFn: (row) => row.type ?? "—",
      cell: ({ getValue }) => (
        <div className="font-medium">
          {getValue<string>()}
        </div>
      ),
    },
    {
      accessorKey: 'createdAt',
      header: () => (
        <Button
          variant="ghost"
          className="font-semibold hover:bg-gray-50"
        >
          <Calendar className="mr-2 h-4 w-4" />
          Created
        </Button>
      ),
      cell: ({ row }) => {
        const dateString = row.getValue('createdAt') as string;
        const date = new Date(dateString);

        return (
          <div className="space-y-0.5">
            <div className="text-sm font-medium">
              {new Intl.DateTimeFormat('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
              }).format(date)}
            </div>
            <div className="text-xs text-gray-500">
              {new Intl.DateTimeFormat('en-US', {
                hour: '2-digit',
                minute: '2-digit',
                hour12: true,
              }).format(date)}
            </div>
          </div>
        );
      },
    },
    {
      id: 'actions',
      enableHiding: false,
      cell: ({ row }) => {
        const request = row.original

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="h-8 w-8 p-0 hover:bg-gray-100 transition-colors"
                size="icon"
              >
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuLabel className="text-xs font-semibold text-gray-600">
                Request Actions
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() =>
                  navigator.clipboard.writeText(String(request.id))
                }
                className="cursor-pointer gap-2"
              >
                Copy Request ID
              </DropdownMenuItem>
              <DropdownMenuItem className="cursor-pointer gap-2"
                onClick={() => navigate({ to: `/records/vet/${request.id}` })}
              >
                <Eye className="h-4 w-4" />
                View Details
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )
      },
    },
  ]


  return (
    <>
      <SiteHeader title="Dashboard" />

      <div className="flex flex-1 flex-col">
        <div className="flex flex-1 flex-col gap-2">

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4 p-4">
            <section className="col-span-1 md:col-span-2 lg:col-span-4 space-y-4">
              {/* Top Stats */}
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-2 gap-4">
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
                  <p className="text-sm font-medium text-gray-600">Total Admins</p>
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 bg-amber-100 rounded-full flex items-center justify-center">
                      <ShieldUser className="h-6 w-6 text-amber-600" />
                    </div>
                    <h3 className="text-2xl font-bold">{stats?.totalAdmins}</h3>
                  </div>
                  <p className="text-xs text-gray-500">Total number of admins</p>
                </Card>

                <Card className="grid gap-4 p-4">
                  <p className="text-sm font-medium text-gray-600">Total Users</p>
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 bg-green-100 rounded-full flex items-center justify-center">
                      <Users className="h-6 w-6 text-green-600" />
                    </div>
                    <h3 className="text-2xl font-bold">{stats?.totalAlumnis}</h3>
                  </div>
                  <p className="text-xs text-gray-500">Total number of users</p>
                </Card>

                <Card className="grid gap-4 p-4">
                  <p className="text-sm font-medium text-gray-600">Total Transactions</p>
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 bg-purple-100 rounded-full flex items-center justify-center">
                      <BanknoteArrowDown className="h-6 w-6 text-purple-600" />
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
              <div>
                <Card>
                  <CardContent>
                    {
                      pendingQuery.isPending ? (
                        <div className="space-y-6 p-6">
                          <div className="space-y-2">
                            <Skeleton className="h-8 w-64" />
                            <Skeleton className="h-4 w-96" />
                          </div>
                          <Separator />
                          <div className="grid gap-4 md:grid-cols-3">
                            {Array.from({ length: 3 }).map((_, i) => (
                              <Skeleton key={i} className="h-24" />
                            ))}
                          </div>
                          <div className="space-y-3">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <Skeleton key={i} className="h-12 w-full" />
                            ))}
                          </div>
                        </div>
                      ) : pendingQuery.isError ? (
                        <div>Error: {pendingQuery.error.message}</div>
                      ) : (
                        <DataTable
                          columns={columns}
                          data={pending!}
                          filterColumn="email"
                          filterPlaceholder="Search pending requests…"
                          recordName='REQUEST'
                          recordIcon={<FileText className="h-20 w-20" />}
                        />
                      )
                    }
                  </CardContent>
                </Card>
              </div>
            </section>
            <section className="col-span-1 md:col-span-2 lg:col-span-2 grid md:grid-cols-2 lg:grid-cols-1 gap-4">
              <div className="w-full overflow-hidden">
                <ActivityCard activities={activity} maxDisplay={5} />
              </div>
            </section>
          </div>
        </div>
      </div>
    </>
  );
}
