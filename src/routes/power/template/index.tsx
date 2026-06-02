import { DataTable } from '@/components/table'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { createFileRoute } from '@tanstack/react-router'
import type { ColumnDef } from '@tanstack/react-table'
import { ArrowUpDown, Eye, MoreHorizontal, Pencil, Plus, Trash2 } from 'lucide-react'
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query'
import { toast } from 'sonner'
import { useState } from 'react'

import { deleteRole, deleteTemplate, getTemplates, type Template } from '@/service'
import { SiteHeader } from '@/components/site-header'
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, } from '@/components/ui/dialog'

import IsPending from '@/components/Illustrations/isPending'
import { Card, CardContent } from '@/components/ui/card'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { useNavigate } from '@tanstack/react-router'


export const Route = createFileRoute('/power/template/')({
  component: RouteComponent,
})



function RouteComponent() {
  const [openDeleteModal, setOpenDeleteModal] = useState(false)
  const [selected, setSelected] = useState<Template | null>(null)
  const queryClient = useQueryClient()
  const navigate = useNavigate();

  const { data, isPending, isError, error } = useQuery({
    queryKey: ['templates'], // Changed from 'roles' to 'templates'
    queryFn: () => getTemplates({ page: 1, limit: 10 }),
    staleTime: 30_000,
  })

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: deleteTemplate,
    onSuccess: () => {
      toast.success('Template deleted successfully')
      queryClient.invalidateQueries({ queryKey: ['templates'] }) // Changed from 'template' to 'templates'
      setOpenDeleteModal(false)
      setSelected(null)
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to delete template')
    },
  })

  const handleDeleteClick = (template: Template) => {
    setSelected(template)
    setOpenDeleteModal(true)
  }

  const onDeleteTemplate = async () => {
    if (selected) {
      deleteMutation.mutate(Number(selected.id))
    }
  }

  if (isPending) {
    return <IsPending page='Templates' /> // Changed from 'Roles' to 'Templates'
  }

  if (isError) {
    toast.error(
      (error as any)?.response?.data?.message ??
      'Failed to load templates' // Changed from 'roles' to 'templates'
    )
    return null
  }

  const columns: ColumnDef<Template>[] = [
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
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Select row"
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: 'name',
      header: ({ column }) => (
        <div
          className='flex items-center text-left cursor-pointer'
          onClick={() =>
            column.toggleSorting(
              column.getIsSorted() === 'asc'
            )
          }
        >
          Template Name {/* Changed from 'Role Name' to 'Template Name' */}
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </div>
      ),
      cell: ({ row }) => (
        <div className="capitalize">
          {row.getValue('name')}
        </div>
      ),
    },
    {
      id: 'logo',
      header: 'Logo',
      accessorFn: (row) => row.logo ?? 0,
      cell: ({ getValue }) => (
        <div className="text-left">
          {getValue<string>()}
        </div>
      ),
    },
    {
      id: 'creator',
      header: 'Creator',
      accessorFn: (row) => row.creator?.email ?? 0,
      cell: ({ getValue }) => (
        <div className="text-left">
          {getValue<string>()}
        </div>
      ),
    },
    {
      accessorKey: 'createdAt',
      header: 'Created',
      cell: ({ row }) => {
        const dateString = row.getValue('createdAt') as string;
        const date = new Date(dateString);
        const formatted = new Intl.DateTimeFormat('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        }).format(date);

        return <div className="capitalize">{formatted}</div>;
      },
    },
    {
      id: 'actions',
      enableHiding: false,
      cell: ({ row }) => {
        const template = row.original

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="h-8 w-8 p-0 hover:bg-gray-100 transition-colors"
                size="icon"
              >
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuLabel className="text-xs font-semibold text-gray-600">
                Template Actions {/* Changed from 'Request Actions' to 'Template Actions' */}
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="cursor-pointer gap-2"
                onClick={() => navigate({ to: `/power/template/${template.id}` })}
              >
                <Eye className="h-4 w-4" />
                View Template
              </DropdownMenuItem>
              <DropdownMenuItem
                className="cursor-pointer gap-2"
                onClick={() => navigate({ to: '/power/template/form', search: { id: template.id } })} // Pass id as search param
              >
                <Pencil className="h-4 w-4" />
                Edit Template
              </DropdownMenuItem>
              <DropdownMenuItem className="cursor-pointer gap-2"
                onClick={() => handleDeleteClick(template)}
              >
                <Trash2 className="h-4 w-4" />
                Delete Template
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )
      },
    },
  ]

  return (
    <>
      <SiteHeader title='Templates' /> {/* Changed from 'Template' to 'Templates' */}

      <main className="min-h-screen p-4 lg:p-6 bg-gray-50">
        <div className="mx-auto max-w-7xl space-y-6">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold tracking-tight text-gray-900">Templates</h1> {/* Changed from 'Template' to 'Templates' */}
                <p className="text-gray-600">
                  Manage Document Templates {/* Changed from 'Manage Document Template' to 'Manage Document Templates' */}
                </p>
              </div>

              <Button
                variant="outline"
                className="gap-2 bg-green-700 hover:bg-green-800 text-white"
                onClick={() => navigate({ to: '/power/template/form' })}
              >
                <Plus className="h-4 w-4" />
                Add Template
              </Button>
            </div>
          </div>

          <Card>
            <CardContent>
              <DataTable
                columns={columns}
                data={data?.data ?? []}
                filterColumn="name"
                filterPlaceholder="Filter by name…"
              />
            </CardContent>
          </Card>
        </div>
      </main>

      {/* Delete Confirmation Modal */}
      <Dialog open={openDeleteModal} onOpenChange={(open) => {
        if (!open) {
          setOpenDeleteModal(false)
          setSelected(null)
        }
      }}>
        <DialogContent className="min-w-md">
          <DialogHeader>
            <DialogTitle>Delete Template</DialogTitle> {/* Changed from 'Delete Role' to 'Delete Template' */}
            <DialogDescription>
              Are you sure you want to delete this template? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          {selected && (
            <div className="py-4">
              <p className="text-sm text-gray-600">
                You are about to delete template: <span className="font-semibold text-gray-900">{selected.name}</span>
              </p>
              {/* Uncomment and adjust if your Template type has _count property */}
              {(selected as any)._count?.users > 0 && (
                <p className="mt-2 text-sm text-red-600">
                  Warning: This template is used by {(selected as any)._count.users} user(s) and {(selected as any)._count.requests} request(s). Deleting it may cause issues.
                </p>
              )}
            </div>
          )}
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline" type="button">Cancel</Button>
            </DialogClose>
            <Button
              variant="destructive"
              onClick={onDeleteTemplate}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? 'Deleting...' : 'Delete'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}