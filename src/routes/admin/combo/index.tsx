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
import { FileText, Filter, Hash, BookOpen, Calendar1, Archive, MoreVertical } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { toast } from 'sonner'
import { getCombos, type Combo } from '@/service'
import { SiteHeader } from '@/components/site-header'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import DropBox from '@/components/dropbox'
import IsPending from '@/components/Illustrations/isPending'

export const Route = createFileRoute('/admin/combo/')({
  component: RouteComponent,
})

function RouteComponent() {
  const searchParams = new URLSearchParams({
    page: '1',
    limit: '10',
  }).toString()

  const { data, isPending, isError, error } = useQuery({
    queryKey: ['combos', searchParams],
    queryFn: () => getCombos(searchParams),
    staleTime: 30_000,
  })

  if (isPending) {
    return <IsPending page='Combo' />
  }

  if (isError) {
    toast.error(
      (error as any)?.response?.data?.message ?? 'Failed to load combos'
    )
    return null
  }

  const columns: ColumnDef<Combo>[] = [
    {
      id: 'select',
      header: ({ table }) => (
        <Checkbox
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && 'indeterminate')
          }
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
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
      accessorKey: 'name',
      header: () => (
        <div className="font-semibold hover:bg-gray-50">
          Full Name
        </div>
      ),
      cell: ({ getValue }) => (
        <div className="font-medium">{getValue<string>()}</div>
      ),
    },
    {
      accessorKey: 'matric_number',
      header: () => (
        <div className="font-semibold hover:bg-gray-50">
          Matric Number
        </div>
      ),
      cell: ({ getValue }) => (
        <div className="font-medium">{getValue<string>()}</div>
      ),
    },
    {
      accessorKey: 'certNo',
      header: () => (
        <div className="flex items-center font-semibold hover:bg-gray-50">
          <Hash className="mr-2 h-4 w-4" />
          Certificate No.
        </div>
      ),
      cell: ({ getValue }) => (
        <div className="font-medium">{getValue<string>()}</div>
      ),
    },
    {
      accessorKey: 'type',
      header: () => (
        <div className="font-semibold hover:bg-gray-50">
          Type
        </div>
      ),
      cell: ({ getValue }) => (
        <div className="font-medium capitalize">{getValue<string>()}</div>
      ),
    },
    {
      accessorKey: 'session',
      header: () => (
        <div className="flex items-center font-semibold hover:bg-gray-50">
          <BookOpen className="mr-2 h-4 w-4" />
          Session
        </div>
      ),
      cell: ({ getValue }) => (
        <div className="font-medium">{getValue<string>()}</div>
      ),
    },
    {
      accessorKey: 'print_date',
      header: () => (
        <div className="flex items-center font-semibold hover:bg-gray-50">
          <Calendar1 className="mr-2 h-4 w-4" />
          Print date
        </div>
      ),
      cell: ({ getValue }) => (
        <div className="font-medium">{getValue<string>()}</div>
      ),
    },
    // {
    //   accessorKey: 'createdAt',
    //   header: () => (
    //     <Button variant="ghost" className="font-semibold hover:bg-gray-50">
    //       <Calendar className="mr-2 h-4 w-4" />
    //       Created
    //     </Button>
    //   ),
    //   cell: ({ row }) => {
    //     const dateString = row.getValue('createdAt') as string
    //     const date = new Date(dateString)
    //     return (
    //       <div className="space-y-0.5">
    //         <div className="text-sm font-medium">
    //           {new Intl.DateTimeFormat('en-US', {
    //             month: 'short',
    //             day: 'numeric',
    //             year: 'numeric',
    //           }).format(date)}
    //         </div>
    //         <div className="text-xs text-gray-500">
    //           {new Intl.DateTimeFormat('en-US', {
    //             hour: '2-digit',
    //             minute: '2-digit',
    //             hour12: true,
    //           }).format(date)}
    //         </div>
    //       </div>
    //     )
    //   },
    // },
    {
      id: 'actions',
      enableHiding: false,
      cell: ({ row }) => {
        const combo = row.original
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
                Actions
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => navigator.clipboard.writeText(String(combo.id))}
                className="cursor-pointer gap-2"
              >
                Copy ID
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => navigator.clipboard.writeText(combo.matric_number)}
                className="cursor-pointer gap-2"
              >
                Copy Matric
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => window.open(`/admin/combo/${combo.id}`, '_blank')}
                className="cursor-pointer gap-2"
              >
                View Details
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )
      },
    },
  ]

  const combos = data?.data ?? []
  const total = combos.length


  return (
    <>
      <SiteHeader title="Combo Management" />

      <main className="min-h-screen p-4 lg:p-6">
        <div className="mx-auto max-w-7xl space-y-6">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold tracking-tight text-gray-900">
                  Combo Records
                </h1>
                <p className="text-gray-600">
                  Manage and monitor certificate combos
                </p>
              </div>
              <div className="flex gap-2">
                <DropBox />
                <Button variant="outline" size="sm" className="gap-2">
                  <Filter className="h-4 w-4" />
                  Filter
                </Button>
              </div>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">
                  Total Combos
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100">
                    <FileText className="h-5 w-5 text-blue-600" />
                  </div>
                  <span className="text-2xl font-bold">{total}</span>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>All Combos</CardTitle>
              <CardDescription>Complete list of combo records</CardDescription>
            </CardHeader>
            <CardContent>
              <DataTable
                columns={columns}
                data={combos}
                filterColumn="matric_number"
                filterPlaceholder="Search by matric number…"
                recordName='TEMPLATE'
                recordIcon={<Archive className="h-20 w-20" />}
              />
            </CardContent>
          </Card>
        </div>
      </main>
    </>
  )
}