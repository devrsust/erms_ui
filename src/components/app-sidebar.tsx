"use client"

import * as React from "react"
import {
  LayoutGrid,
  ClipboardList,
  WalletMinimal,
  FileCheckCorner,
  Users,
  Layers,
  MonitorCog,
  UserCog,
  FileText,
  Shield,
  Building2,
  School,
  Link2,
  CheckCircle,
  PlusCircle,
  Eye
} from 'lucide-react';

import { NavMain } from "@/components/nav-main"
import { NavUser } from "@/components/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar"
import type { AuthUser } from "@/store/slices/auth.slice"

const alumniNav = {
  user: {
    firstname: "John",
    lastname: "Doe",
    email: "john.doe@alumni.edu",
    avatar: "/avatars/user.jpg",
    role: "ALUMNI"
  },
  navMain: [
    {
      title: "Dashboard",
      url: "/user/",
      icon: LayoutGrid,
      isActive: true,
    },
    {
      title: "Requests",
      url: "/user/requests/",
      icon: ClipboardList,
      badge: 3,
    },
    {
      title: "Transactions",
      url: "/user/transactions/",
      icon: WalletMinimal,
    },
    {
      title: "Documents",
      url: "/user/documents/",
      icon: FileCheckCorner,
    },
  ],
  navSecondary: [
    {
      title: "Settings",
      url: "/user/settings",
      icon: UserCog,
    }
  ],
};

const superAdminNav = {
  user: {
    firstname: "Jane",
    lastname: "Smith",
    email: "jane.smith@system.edu",
    avatar: "/avatars/admin.jpg",
    role: "SUPER ADMIN"
  },
  navMain: [
    {
      title: "Dashboard",
      url: "/power/",
      icon: LayoutGrid,
    },
    {
      title: "User Management",
      url: "#",
      icon: Users,
      items: [
        { title: "Admins", url: "/power/admins", icon: Shield },
        { title: "Users", url: "/power/users", icon: Users },
      ],
    },
    {
      title: "Records Management",
      url: "#",
      icon: Layers,
      items: [
        { title: "Document Requests", url: "/power/requests", icon: FileText, badge: 12 },
        { title: "Vetting & Processing", url: "/power/vet", icon: CheckCircle },
        { title: "Approved Documents", url: "/power/approved", icon: FileCheckCorner },
        { title: "Bulk Combos", url: "/power/combo", icon: PlusCircle },
      ],
    },
    {
      title: "Transactions",
      url: "/power/transactions/",
      icon: WalletMinimal,
    },
    // {
    //   title: "Analysis",
    //   url: "/dashboard/analysis/",
    //   icon: Activity,
    // },
    {
      title: "Logs & Activity",
      url: "/power/activity/",
      icon: Eye,
    },
    {
      title: "Config",
      url: "#",
      icon: MonitorCog,
      items: [
        { title: "Chain", url: "/power/chain/", icon: Link2 },
        { title: "Documents", url: "/power/documents/", icon: FileText },
        { title: "Roles", url: "/power/roles/", icon: Shield },
        { title: "Faculties", url: "/power/faculty/", icon: Building2 },
        { title: "Departments", url: "/power/department/", icon: School },
      ],
    },
  ],
  navSecondary: [
    {
      title: "Settings",
      url: "/dashboard/settings",
      icon: UserCog,
    }
  ],
};

const directorNav = {
  user: {
    firstname: "Robert",
    lastname: "Johnson",
    email: "robert.johnson@university.edu",
    avatar: "/avatars/director.jpg",
    role: "DIRECTOR"
  },
  navMain: [
    {
      title: "Dashboard",
      url: "/dashboard/",
      icon: LayoutGrid,
    },
    {
      title: "Records Management",
      url: "#",
      icon: Layers,
      items: [
        { title: "Document Requests", url: "/dashboard/requests", icon: FileText, badge: 8 },
        { title: "Vetting & Processing", url: "/dashboard/vet", icon: CheckCircle },
        { title: "Approved Documents", url: "/dashboard/approved", icon: FileCheckCorner },
      ],
    },
    {
      title: "Transactions",
      url: "/dashboard/transactions/",
      icon: WalletMinimal,
    },
    {
      title: "Config",
      url: "#",
      icon: MonitorCog,
      items: [
        { title: "Chain", url: "/dashboard/chain/", icon: Link2 },
        { title: "Documents", url: "/dashboard/documents/", icon: FileText },
        { title: "Departments", url: "/dashboard/department/", icon: School },
      ],
    },
  ],
  navSecondary: [
    {
      title: "Settings",
      url: "/dashboard/settings",
      icon: UserCog,
    }
  ],
};

const adminNav = {
  user: {
    firstname: "Sarah",
    lastname: "Williams",
    email: "sarah.williams@faculty.edu",
    avatar: "/avatars/admin.jpg",
    role: "ADMIN"
  },
  navMain: [
    {
      title: "Dashboard",
      url: "/dashboard/",
      icon: LayoutGrid,
    },
    {
      title: "User Management",
      url: "#",
      icon: Users,
      items: [
        { title: "Admins", url: "/dashboard/admins", icon: Shield },
        { title: "Users", url: "/dashboard/users", icon: Users },
      ],
    },
    {
      title: "Records Management",
      url: "#",
      icon: Layers,
      items: [
        { title: "Document Requests", url: "/dashboard/requests", icon: FileText, badge: 5 },
        { title: "Vetting & Processing", url: "/dashboard/vet", icon: CheckCircle },
        { title: "Approved Documents", url: "/dashboard/approved-documents", icon: FileCheckCorner },
        { title: "Bulk Combos", url: "/dashboard/combos", icon: PlusCircle },
      ],
    },
    {
      title: "Transactions",
      url: "/dashboard/transactions/",
      icon: WalletMinimal,
    },
    {
      title: "Config",
      url: "#",
      icon: MonitorCog,
      items: [
        { title: "Chain", url: "/dashboard/chain/", icon: Link2 },
        { title: "Documents", url: "/dashboard/documents/", icon: FileText },
        { title: "Roles", url: "/dashboard/roles/", icon: Shield },
        { title: "Faculties", url: "/dashboard/faculty/", icon: Building2 },
        { title: "Departments", url: "/dashboard/department/", icon: School },
      ],
    },
  ],
  navSecondary: [
    {
      title: "Settings",
      url: "/dashboard/settings",
      icon: UserCog,
    }
  ],
};

const recordOfficerNav = {
  user: {
    firstname: "Michael",
    lastname: "Brown",
    email: "michael.brown@records.edu",
    avatar: "/avatars/record.jpg",
    role: "RECORD OFFICER"
  },
  navMain: [
    {
      title: "Dashboard",
      url: "/records/",
      icon: LayoutGrid,
    },
    {
      title: "Records Management",
      url: "#",
      icon: Layers,
      items: [
        { title: "Document Requests", url: "/records/requests", icon: FileText, badge: 15 },
        { title: "Vetting & Processing", url: "/records/vet", icon: CheckCircle },
        { title: "Approved Documents", url: "/records/approved", icon: FileCheckCorner },
      ],
    },
    {
      title: "Transactions",
      url: "/records/transactions/",
      icon: WalletMinimal,
    },
  ],
  navSecondary: [
    {
      title: "Settings",
      url: "/records/settings",
      icon: UserCog,
    }
  ],
};

const defaultNav = {
  user: {
    firstname: "Guest",
    lastname: "User",
    email: "guest@system.com",
    avatar: "/avatars/user.jpg",
    role: "GUEST",
  },
  navMain: [
    {
      title: "Dashboard",
      url: "/",
      icon: LayoutGrid,
    },
  ],
  navSecondary: [],
}

interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {
  user: AuthUser | null
}

export function AppSidebar({ user, ...props }: AppSidebarProps) {
  const base = (() => {
    switch (user?.role?.name?.toUpperCase()) {
      case "SUPER ADMIN":
        return superAdminNav;

      case "DIRECTOR":
        return directorNav;

      case "ALUMNI":
        return alumniNav;

      case "ADMIN":
        return adminNav;

      case "RECORD OFFICER":
        return recordOfficerNav;

      default:
        return defaultNav;
    }
  })();

  const data = {
    ...base,
    user: {
      firstname: user?.firstname ?? base?.user.firstname,
      lastname: user?.lastname ?? base?.user.lastname,
      email: user?.email ?? base?.user.email,
      avatar: base?.user.avatar,
      role: user?.role?.name ?? base.user.role,
    },
  }

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <NavUser user={data.user} />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  )
}
