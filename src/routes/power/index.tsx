import { SiteHeader } from "@/components/site-header";
import { createFileRoute } from "@tanstack/react-router";
import { Card } from "@/components/ui/card";
import { ActivityCard } from "@/components/activity";
import RequestSummary from "@/components/charts/request_summary";
import { BanknoteArrowDown, CalendarDays, FileText, Mail, ShieldUser, TrendingUp, User, Users } from "lucide-react";
import { useAppSelector } from "@/store/hooks";
import { useQueries } from "@tanstack/react-query";
import { AdminActivityLog, adminStats, getRequests, type Request } from "@/service";
import IsPending from "@/components/Illustrations/isPending";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import type { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/table";

export const Route = createFileRoute("/power/")({
  component: Dashboard,
});

function Dashboard() {
  const { user } = useAppSelector((state) => state.auth);

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
        queryKey: ["requests"],
        queryFn: () => getRequests({ limit: 8 }),
        staleTime: 30_000,
      },
    ],
  });

  const [statsQuery, activityQuery, requestQuery] = results;

  if (statsQuery.isLoading || activityQuery.isLoading || requestQuery.isLoading) {
    return <IsPending page="Dashboard" />
  }


  if (statsQuery.isPending || activityQuery.isPending || requestQuery.isPending) {
    return <IsPending page="Dashboard" />
  }

  const stats = statsQuery.data;
  const activity = activityQuery.data;
  const requests = requestQuery?.data?.data;



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
      id: "user",
      header: () => (
        <Button
          variant="ghost"
          className="font-semibold hover:bg-gray-50"
        >
          <User className="mr-2 h-4 w-4" />
          User
        </Button>
      ),
      accessorFn: (row) => row.user?.matric_number ?? "—",
      cell: ({ getValue }) => (
        <div className="font-medium">
          {getValue<string>()}
        </div>
      ),
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
                <DataTable
                  columns={columns}
                  data={requests!}
                  filterColumn="email"
                  filterPlaceholder="Search by email, user, or document…"
                />
              </div>
            </section>
            <section className="col-span-1 md:col-span-2 lg:col-span-2 grid md:grid-cols-2 lg:grid-cols-1 gap-4">
              <div className="w-full overflow-hidden">
                <RequestSummary />
              </div>
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
