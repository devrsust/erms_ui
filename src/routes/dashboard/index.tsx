import { SiteHeader } from "@/components/site-header";
import { createFileRoute } from "@tanstack/react-router";
import { Card, CardContent } from "@/components/ui/card";
import { ActivityCard } from "@/components/activity";
import RequestSummary from "@/components/charts/request_summary";
import { ClipboardList, Eye, ShieldUser, Users } from "lucide-react";
import VisitorsSummary from "@/components/charts/visitors_summry";
import { DateFilterBar } from "@/components/date_range";

export const Route = createFileRoute("/dashboard/")({
  component: Dashboard,
});

function Dashboard() {
  const stats = [
    {
      label: "Admins",
      value: 12,
      icon: ShieldUser,
      color: "bg-blue-400",
      trend: "+2",
    },
    {
      label: "Users",
      value: 243,
      icon: Users,
      color: "bg-green-400",
      trend: "+18",
    },
    {
      label: "Requests",
      value: 47,
      icon: ClipboardList,
      color: "bg-amber-400",
      trend: "+5",
    },
    {
      label: "Visits",
      value: 1523,
      icon: Eye,
      color: "bg-purple-400",
      trend: "+12%",
    },
  ];

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
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
                {stats.map((stat) => (
                  <Card
                    key={stat.label}
                    className="hover:shadow-md transition-shadow p-0"
                  >
                    <CardContent className="p-5 flex flex-col gap-4">
                      {/* Top: Label + Icon */}
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-muted-foreground">
                          {stat.label}
                        </p>

                        <div
                          className={`h-10 w-10 rounded-xl ${stat.color} flex items-center justify-center`}
                        >
                          <stat.icon className="h-5 w-5 text-white" />
                        </div>
                      </div>

                      {/* Middle: Value (Primary focus) */}
                      <div className="flex items-end justify-between">
                        <span className="text-2xl sm:text-3xl font-bold tracking-tight">
                          {stat.value}
                        </span>

                        {/* Trend */}
                        <span
                          className={`
              text-xs font-medium px-2 py-1 rounded-md
              ${
                stat.trend?.includes("+")
                  ? "text-green-700 bg-green-100"
                  : "text-red-700 bg-red-100"
              }
            `}
                        >
                          {stat.trend}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
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
                <ActivityCard />
              </div>
            </section>
          </div>
        </div>
      </div>
    </>
  );
}
