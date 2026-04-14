import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Activity,
  FilePlus,
  FileEdit,
  FileMinus,
  Eye,
  LogIn,
  LogOut,
  KeyRound,
  EllipsisVertical,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { Button } from "../ui/button";
import { Separator } from "../ui/separator";

interface ActivityItem {
  id: string;
  user: string;
  avatar?: string;
  action:
    | "create"
    | "update"
    | "delete"
    | "view"
    | "login"
    | "logout"
    | "password";
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
  create: {
    icon: FilePlus,
    color: "text-green-500",
    label: "created",
    type: "data",
  },
  update: {
    icon: FileEdit,
    color: "text-blue-500",
    label: "updated",
    type: "data",
  },
  delete: {
    icon: FileMinus,
    color: "text-red-500",
    label: "deleted",
    type: "data",
  },
  view: { icon: Eye, color: "text-purple-500", label: "viewed", type: "data" },
  login: {
    icon: LogIn,
    color: "text-emerald-500",
    label: "logged in",
    type: "auth",
  },
  logout: {
    icon: LogOut,
    color: "text-gray-500",
    label: "logged out",
    type: "auth",
  },
  password: {
    icon: KeyRound,
    color: "text-yellow-500",
    label: "changed password",
    type: "auth",
  },
};

type FilterType = "all" | "auth" | "data";

export function ActivityCard({
  activities = sampleActivities,
}: {
  activities?: ActivityItem[];
}) {
  const [filter, setFilter] = useState<FilterType>("all");
  const [expanded, setExpanded] = useState(false);

  const filtered = activities.filter((item) => {
    if (filter === "all") return true;
    return actionConfig[item.action].type === filter;
  });

  const visibleItems = expanded ? filtered : filtered.slice(0, 4);

  return (
    <Card className="w-full max-w-md shadow-md gap-3">
      <CardHeader className="pb-0 mb-0 flex items-center w-full">
        <CardTitle className="w-full flex justify-between items-center text-base font-semibold">
          <span>Recent Activity</span>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <EllipsisVertical className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Options</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>Refresh</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </CardTitle>
      </CardHeader>
      <Separator />
      <CardContent className="">
        {visibleItems.length === 0 ? (
          <p className="text-sm text-muted-foreground">No activity</p>
        ) : (
          <div className="relative">
            {/* Timeline */}
            <div className="absolute left-4 top-2 bottom-2 w-[2px] bg-gray-200" />

            <ul className="space-y-5">
              {visibleItems.map((item) => {
                const config = actionConfig[item.action];
                const Icon = config.icon;

                return (
                  <li key={item.id} className="relative flex gap-4">
                    {/* Icon */}
                    <div
                      className={cn(
                        "bg-white p-1 rounded-full border h-8 w-8 flex items-center justify-center",
                        config.color,
                      )}
                    >
                      <Icon className="w-3.5 h-3.5" />
                    </div>

                    {/* Content */}
                    <div className="flex-1">
                      <div className="flex justify-between items-center">
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

            {/* Show more */}
            {filtered.length > 4 && (
              <div className="mt-4 text-center">
                <button
                  onClick={() => setExpanded(!expanded)}
                  className="text-xs text-[#9c2eba] font-medium"
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
