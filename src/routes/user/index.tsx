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

export const Route = createFileRoute("/user/")({
  component: Dashboard,
});

function Dashboard() {
  return (
    <>
      <SiteHeader title="Dashboard" />

      <div className="flex flex-1 flex-col bg-gray-50 p-6 gap-6">
        {/* Top Stats */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Card className="grid gap-4 p-4">
            <p className="text-sm font-medium text-gray-600">Total Requests</p>
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 bg-purple-100 rounded-full flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-purple-600" />
              </div>
              <h3 className="text-2xl font-bold">
                {/* {new Intl.NumberFormat("en-US", {
                  style: "currency",
                  currency: "NGN",
                  minimumFractionDigits: 0,
                }).format(totalAmount)} */}
              </h3>
            </div>
            <p className="text-xs text-gray-500">
              {/* {completionRate.toFixed(0)}% completion rate */}
            </p>
          </Card>

          <Card className="grid gap-4 p-4">
            <p className="text-sm font-medium text-gray-600">Pending</p>
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 bg-amber-100 rounded-full flex items-center justify-center">
                <Clock className="h-6 w-6 text-amber-600" />
              </div>
              {/* <h3 className="text-2xl font-bold">{pendingRequests}</h3> */}
            </div>
            <p className="text-xs text-gray-500">Awaiting processing</p>
          </Card>

          <Card className="grid gap-4 p-4">
            <p className="text-sm font-medium text-gray-600">Completed</p>
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              {/* <h3 className="text-2xl font-bold">{successfulRequests}</h3> */}
            </div>
            <p className="text-xs text-gray-500">Successfully delivered</p>
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

          {/* Request Timeline */}
          <Card>
            <CardHeader>
              <CardTitle>Current Request</CardTitle>
            </CardHeader>

            <CardContent className="space-y-6">
              <div className="flex gap-3">
                <div className="w-2 h-2 mt-2 rounded-full bg-green-500" />
                <div>
                  <p className="text-sm font-medium">Request Submitted</p>
                  <p className="text-xs text-muted-foreground">12 Mar 2026</p>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="w-2 h-2 mt-2 rounded-full bg-green-500" />
                <div>
                  <p className="text-sm font-medium">Payment Confirmed</p>
                  <p className="text-xs text-muted-foreground">12 Mar 2026</p>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="w-2 h-2 mt-2 rounded-full bg-yellow-500" />
                <div>
                  <p className="text-sm font-medium">Processing</p>
                  <p className="text-xs text-muted-foreground">In Progress</p>
                </div>
              </div>

              <div className="flex gap-3 opacity-50">
                <div className="w-2 h-2 mt-2 rounded-full bg-gray-400" />
                <div>
                  <p className="text-sm font-medium">Completed</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
