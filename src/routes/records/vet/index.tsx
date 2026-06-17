import { DataTable } from '@/components/table'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { createFileRoute } from '@tanstack/react-router'
import type { ColumnDef } from '@tanstack/react-table'
import { MoreVertical, Mail, Calendar, FileText, User, FileCog } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { toast } from 'sonner'

import { getPendingRequests, type Request, } from '@/service'
import { Skeleton } from '@/components/ui/skeleton'
import { Separator } from '@/components/ui/separator'
import { SiteHeader } from '@/components/site-header'
import { Card, CardContent } from '@/components/ui/card'
import { useAppSelector } from '@/store/hooks'
import { useNavigate } from '@tanstack/react-router'

export const Route = createFileRoute('/records/vet/')({
  component: RouteComponent,
})


function RouteComponent() {
  const { user } = useAppSelector((state) => state.auth);
  const navigate = useNavigate();

  const { data, isPending, isError, error } = useQuery({
    queryKey: ['pending'],
    queryFn: () => getPendingRequests(Number(user?.id)),
    staleTime: 30_000,
  })

  if (isPending) {
    return (
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
    )
  }

  if (isError) {
    toast.error(
      (error as any)?.response?.data?.message ??
      'Failed to load admins'
    )
    return null
  }

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
      accessorFn: (row) => row.user ? `${row.user.firstname} ${row.user.lastname}` : "—",
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
                <MoreVertical className="h-4 w-4" />
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
                <FileCog className="h-4 w-4" />
                Process Request
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )
      },
    },
  ]

  const requests = data?.data ?? [];

  return (
    <>
      <SiteHeader title='Process Requests' />

      <main className="min-h-screen p-4 lg:p-6 bg-gray-50">
        <div className="mx-auto max-w-7xl space-y-6">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold tracking-tight text-gray-900">Process Request</h1>
                <p className="text-gray-600">
                  Process and manage all document requests
                </p>
              </div>
            </div>
          </div>

          <Card className="border border-gray-200 shadow-sm overflow-hidden">
            <CardContent>
              <DataTable
                columns={columns}
                data={requests}
                filterColumn="email"
                filterPlaceholder="Search by email, user, or document…"
                recordName='REQUEST'
                recordIcon={<FileText className="h-20 w-20" />}
              />
            </CardContent>
          </Card>
        </div>
      </main>
    </>
  )
}