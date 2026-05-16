import { SiteHeader } from "@/components/site-header";
import { createFileRoute } from "@tanstack/react-router";
import { Card } from "@/components/ui/card";
import { ActivityCard } from "@/components/activity";
import RequestSummary from "@/components/charts/request_summary";
import { BanknoteArrowDown, ShieldUser, TrendingUp, Users } from "lucide-react";
import VisitorsSummary from "@/components/charts/visitors_summry";
import { DateFilterBar } from "@/components/date_range";
import { useAppSelector } from "@/store/hooks";
import { useQueries } from "@tanstack/react-query";
import { AdminActivityLog, adminStats } from "@/service";

export const Route = createFileRoute("/admin/")({
  component: Dashboard,
});

function Dashboard() {
  const { user } = useAppSelector((state) => state.auth);

  const results = useQueries({
    queries: [
      {
        queryKey: ["dashboard-stats", user?.id],
        queryFn: () => adminStats(Number(user?.id)),
        enabled: !!user?.id,
        staleTime: 30_000,
      },
      {
        queryKey: ["activity", user?.id],
        queryFn: () => AdminActivityLog(Number(user?.id)),
        enabled: !!user?.id,
        staleTime: 30_000,
      },
    ],
  });

  const [statsQuery, activityQuery] = results;

  if (statsQuery.isLoading || activityQuery.isLoading) {
    return <div>Loading...</div>;
  }

  const stats = statsQuery.data;
  const activity = activityQuery.data;

  console.log(activity);

  return (
    <>
      <SiteHeader title="Dashboard" />

      <div className="flex flex-1 flex-col">
        <div className="flex flex-1 flex-col gap-2">
          <div>
            <DateFilterBar />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4 p-4">
            <section className="col-span-1 md:col-span-2 lg:col-span-4 space-y-4">
              {/* Top Stats */}
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
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
                <VisitorsSummary />
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
