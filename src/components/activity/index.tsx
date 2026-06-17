import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  FilePlus,
  FileEdit,
  FileMinus,
  Eye,
  LogIn,
  LogOut,
  KeyRound,
  UserPlus,
  AlertCircle,
} from "lucide-react";
import { Separator } from "../ui/separator";

// Match your actual API response structure
interface ActivityData {
  data: ActivityItem[];
  limit: number;
  page: number;
  total: number;
  totalPages: number;
}

interface ActivityItem {
  id: number;
  action: string;
  entity: string;
  description: string;
  actorType: string;
  actorId: string;
  createdAt: string;
  meta: any | null;
}

// Map API actions to UI config
const actionConfig: Record<string, { icon: any; color: string; label: string }> = {
  LOGIN: { icon: LogIn, color: "text-emerald-500", label: "logged in" },
  LOGOUT: { icon: LogOut, color: "text-gray-500", label: "logged out" },
  CREATE: { icon: FilePlus, color: "text-green-500", label: "created" },
  UPDATE: { icon: FileEdit, color: "text-blue-500", label: "updated" },
  DELETE: { icon: FileMinus, color: "text-red-500", label: "deleted" },
  VIEW: { icon: Eye, color: "text-purple-500", label: "viewed" },
  PASSWORD_CHANGE: { icon: KeyRound, color: "text-yellow-500", label: "changed password" },
  REGISTER: { icon: UserPlus, color: "text-indigo-500", label: "registered" },
};

// Entity type colors for badges
const entityColors: Record<string, string> = {
  ALUMNI: "bg-purple-100 text-purple-700",
  ADMIN: "bg-red-100 text-red-700",
  USER: "bg-blue-100 text-blue-700",
  SYSTEM: "bg-gray-100 text-gray-700",
};

function formatRelativeTime(iso: string) {
  const diff = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);

  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
  return new Date(iso).toLocaleDateString();
}

function formatFullDate(iso: string) {
  return new Date(iso).toLocaleString();
}

export function ActivityCard({
  activities,
  maxDisplay = 5
}: {
  activities?: ActivityData;
  maxDisplay?: number;
}) {
  const [expanded, setExpanded] = useState(false);

  // Handle loading/empty states
  if (!activities || !activities.data || activities.data.length === 0) {
    return (
      <Card className="w-full shadow-md">
        <CardHeader>
          <CardTitle className="text-base font-semibold">
            Recent Activity
          </CardTitle>
        </CardHeader>
        <Separator />
        <CardContent>
          <p className="text-sm text-muted-foreground text-center py-8">
            No activity to display
          </p>
        </CardContent>
      </Card>
    );
  }

  const activityList = activities.data;
  const visibleItems = expanded ? activityList : activityList.slice(0, maxDisplay);

  return (
    <div className="w-full shadow-md bg-white p-4 rounded-lg border">
      <div className="flex flex-row items-center justify-between p-2">
        <CardTitle className="text-base font-semibold">
          Recent Activity
        </CardTitle>
        <p className="text-xs text-muted-foreground mt-1">
          Total {activities.total} activities
        </p>
      </div>
      <Separator />
      <div className="pt-5">
        <div className="relative">
          {/* Timeline line */}
          <div className="absolute left-4 top-2 bottom-2 w-px bg-gradient-to-b from-gray-200 via-gray-200 to-transparent" />

          <ul className="space-y-4">
            {visibleItems.map((item) => {
              const config = actionConfig[item.action] || {
                icon: AlertCircle,
                color: "text-gray-500",
                label: item.action?.toLowerCase() || "performed action",
              };
              const Icon = config.icon;

              return (
                <li key={item.id} className="relative flex gap-3 group">
                  {/* Timeline dot */}
                  <div className="relative z-10">
                    <div
                      className={`h-8 w-8 flex items-center justify-center rounded-full border-2 border-white bg-white shadow-sm ${config.color} transition-all group-hover:scale-105`}
                    >
                      <Icon className="h-3.5 w-3.5" />
                    </div>
                  </div>

                  <div className="flex-1 min-w-0 pb-3">
                    <div className="flex items-start justify-between gap-2 flex-wrap">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm">
                          <span className="font-semibold capitalize">
                            {item.actorType?.toLowerCase()}
                          </span>
                          <span className="text-muted-foreground mx-1">
                            {config.label}
                          </span>
                        </p>

                        {/* Description */}
                        <p className="text-xs text-muted-foreground mt-0.5 break-words">
                          {item.description}
                        </p>

                        {/* Meta info if available */}
                        {item.meta && (
                          <p className="text-xs text-gray-400 mt-1 font-mono">
                            {JSON.stringify(item.meta)}
                          </p>
                        )}
                      </div>

                      <div className="flex flex-col items-end gap-1 shrink-0">
                        <span className="text-xs text-muted-foreground whitespace-nowrap" title={formatFullDate(item.createdAt)}>
                          {formatRelativeTime(item.createdAt)}
                        </span>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${entityColors[item.entity] || "bg-gray-100 text-gray-600"}`}>
                          {item.entity?.toLowerCase()}
                        </span>
                      </div>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>

          {/* Show more/less button */}
          {activityList.length > maxDisplay && (
            <div className="mt-4 pt-2 text-center">
              <button
                onClick={() => setExpanded((v) => !v)}
                className="text-xs font-medium text-purple-600 hover:text-purple-700 transition-colors"
              >
                {expanded ? "Show less" : `Show ${activityList.length - maxDisplay} more`}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}