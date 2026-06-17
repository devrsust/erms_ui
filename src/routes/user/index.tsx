import { SiteHeader } from "@/components/site-header";
import { createFileRoute } from "@tanstack/react-router";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { CheckCircle, Clock, TrendingUp } from "lucide-react";

import { useQueries } from "@tanstack/react-query";
import axios from "axios";
import { AlumniActivityLog, alumniStats } from "@/service";
import { useAppSelector } from "@/store/hooks";
import { ActivityCard } from "@/components/activity";
import IsPending from "@/components/Illustrations/isPending";



export const Route = createFileRoute("/user/")({
  component: Dashboard,
});

function Dashboard() {
  const { user } = useAppSelector((state) => state.auth);

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
        queryKey: ["recent-requests"],
        queryFn: async () => {
          const { data } = await axios.get("/api/requests/recent");
          return data;
        },
      }
    ],
  });

  const [statsQuery, activityQuery, recentQuery] = results;

  if (statsQuery.isLoading || activityQuery.isLoading || recentQuery.isLoading) {
    return <IsPending page="Dashboard"/>;
  }

  const stats = statsQuery.data;
  const activity = activityQuery.data;

  console.log(stats);
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
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Recent Requests</CardTitle>
            </CardHeader>

            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Request ID</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date</TableHead>
                  </TableRow>
                </TableHeader>

                <TableBody>
                  <TableRow>
                    <TableCell>#REQ-1021</TableCell>
                    <TableCell>ID Verification</TableCell>
                    <TableCell>
                      <Badge>Pending</Badge>
                    </TableCell>
                    <TableCell>12 Mar 2026</TableCell>
                  </TableRow>

                  <TableRow>
                    <TableCell>#REQ-1020</TableCell>
                    <TableCell>Document Request</TableCell>
                    <TableCell>
                      <Badge variant="secondary">Completed</Badge>
                    </TableCell>
                    <TableCell>10 Mar 2026</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <div className="w-full overflow-hidden">
            <ActivityCard activities={activity} maxDisplay={5} />
          </div>
        </div>
      </div>
    </>
  );
}
