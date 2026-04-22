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
} from "lucide-react";

import { Separator } from "../ui/separator";

interface ActivityItem {
  id: string;
  user: string;
  avatar?: string;
  action: "create" | "update" | "delete" | "view" | "login" | "logout" | "password";
  target?: string;
  timestamp: string;
}

const sampleActivities: ActivityItem[] = [
  {
    id: "1",
    user: "John Doe",
    avatar: "https://i.pravatar.cc/40?img=1",
    action: "login",
    timestamp: "2025-03-18T09:23:00Z",
  },
  {
    id: "2",
    user: "Anna Smith",
    avatar: "https://i.pravatar.cc/40?img=2",
    action: "update",
    target: "Record #2024-015",
    timestamp: "2025-03-18T08:15:00Z",
  },
  {
    id: "3",
    user: "Ben Jones",
    avatar: "https://i.pravatar.cc/40?img=3",
    action: "create",
    target: "Record #2024-088",
    timestamp: "2025-03-18T07:45:00Z",
  },
  {
    id: "4",
    user: "Chris Taylor",
    avatar: "https://i.pravatar.cc/40?img=4",
    action: "delete",
    target: "Record #2023-112",
    timestamp: "2025-03-17T22:10:00Z",
  },
];

function formatRelativeTime(iso: string) {
  const diff = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);

  if (diff < 60) return `${diff}s`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h`;
  return `${Math.floor(diff / 86400)}d`;
}

const actionConfig = {
  create: { icon: FilePlus, color: "text-green-500", label: "created" },
  update: { icon: FileEdit, color: "text-blue-500", label: "updated" },
  delete: { icon: FileMinus, color: "text-red-500", label: "deleted" },
  view: { icon: Eye, color: "text-purple-500", label: "viewed" },
  login: { icon: LogIn, color: "text-emerald-500", label: "logged in" },
  logout: { icon: LogOut, color: "text-gray-500", label: "logged out" },
  password: { icon: KeyRound, color: "text-yellow-500", label: "changed password" },
};

export function ActivityCard({
  activities = sampleActivities,
}: {
  activities?: ActivityItem[];
}) {
  const [expanded, setExpanded] = useState(false);

  const visibleItems = expanded ? activities : activities.slice(0, 4);

  return (
    <Card className="w-full max-w-md shadow-md">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-base font-semibold">
          Recent Activity
        </CardTitle>
      </CardHeader>

      <Separator />

      <CardContent>
        {visibleItems.length === 0 ? (
          <p className="text-sm text-muted-foreground">No activity</p>
        ) : (
          <div className="relative">
            <div className="absolute left-4 top-2 bottom-2 w-px bg-gray-200" />

            <ul className="space-y-5">
              {visibleItems.map((item) => {
                const config = actionConfig[item.action];
                const Icon = config.icon;

                return (
                  <li key={item.id} className="relative flex gap-4">
                    <div
                      className={`h-8 w-8 flex items-center justify-center rounded-full border bg-white ${config.color}`}
                    >
                      <Icon className="h-3.5 w-3.5" />
                    </div>

                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <p className="text-sm">
                          <span className="font-medium">{item.user}</span>{" "}
                          <span className="text-muted-foreground">
                            {config.label}
                          </span>
                        </p>

                        <span className="text-xs text-muted-foreground">
                          {formatRelativeTime(item.timestamp)}
                        </span>
                      </div>

                      {item.target && (
                        <p className="text-xs text-muted-foreground">
                          {item.target}
                        </p>
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>

            {activities.length > 4 && (
              <div className="mt-4 text-center">
                <button
                  onClick={() => setExpanded((v) => !v)}
                  className="text-xs font-medium text-[#9c2eba]"
                >
                  {expanded ? "Show less" : "Show more"}
                </button>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}