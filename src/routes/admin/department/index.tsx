import { DataTable } from '@/components/table'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { createFileRoute } from '@tanstack/react-router'
import type { ColumnDef } from '@tanstack/react-table'
import { ArrowUpDown, Copy, Edit, MoreVertical, Plus, School, Trash2 } from 'lucide-react'
import { useMutation, useQueries, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { useForm } from 'react-hook-form'
import { useState } from 'react'

import { getDepartments, createDepartment, updateDepartment, deleteDepartment, getFaculties, type Department } from '@/service'
import { SiteHeader } from '@/components/site-header'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useAppSelector } from '@/store/hooks'
import { Card } from '@/components/ui/card'
import IsPending from '@/components/Illustrations/isPending'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

export const Route = createFileRoute('/admin/department/')({
  component: RouteComponent,
})

type CreateDepartmentForm = {
  name: string
  facultyId: number
  createdById: number
}

function RouteComponent() {
  const [open, setOpen] = useState(false) // create/edit modal
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [departmentToDelete, setDepartmentToDelete] = useState<number | null>(null)
  const [selectedDepartment, setSelectedDepartment] = useState<Department | null>(null)

  const { user } = useAppSelector((state) => state.auth)
  const queryClient = useQueryClient()

  const searchParams = new URLSearchParams({
    page: '1',
    limit: '10',
  }).toString()

  // Fetch departments and faculties in parallel
  const results = useQueries({
    queries: [
      {
        queryKey: ['departments', searchParams],
        queryFn: () => getDepartments(searchParams),
        staleTime: 30_000,
      },
      {
        queryKey: ['faculties', searchParams],
        queryFn: () => getFaculties(searchParams),
        staleTime: 30_000,
      },
    ],
  })

  const [departmentsQuery, facultiesQuery] = results
  const departments = departmentsQuery.data?.data ?? []
  const faculties = facultiesQuery.data?.data ?? []

  const isPending = departmentsQuery.isPending || facultiesQuery.isPending
  const isError = departmentsQuery.isError || facultiesQuery.isError
  const error = departmentsQuery.error || facultiesQuery.error

  const createForm = useForm<CreateDepartmentForm>({
    defaultValues: {
      name: '',
      facultyId: 0,
      createdById: Number(user?.id),
    },
  })

  // Create mutation
  const createMutation = useMutation({
    mutationFn: createDepartment,
    onSuccess: () => {
      toast.success('Department created.', {
        style: { background: '#10b981', color: 'white', border: 'none' },
      })
      queryClient.invalidateQueries({ queryKey: ['departments', searchParams] })
      handleCloseForm()
    },
    onError: () => toast.error('Failed to create department.'),
  })

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: CreateDepartmentForm }) =>
      updateDepartment(id, data),
    onSuccess: () => {
      toast.success('Department updated.', {
        style: { background: '#10b981', color: 'white', border: 'none' },
      })
      queryClient.invalidateQueries({ queryKey: ['departments', searchParams] })
      handleCloseForm()
    },
    onError: () => toast.error('Failed to update department.'),
  })

  // Delete mutation
  const deleteMutation = useMutation<unknown, Error, number>({
    mutationFn: deleteDepartment,
    onSuccess: () => {
      toast.success('Department deleted.')
      queryClient.invalidateQueries({ queryKey: ['departments', searchParams] })
    },
    onError: () => toast.error('Failed to delete department.'),
  })

  const handleOpenCreate = () => {
    setSelectedDepartment(null)
    createForm.reset({ name: '', facultyId: 0, createdById: Number(user?.id) })
    setOpen(true)
  }

  const handleEdit = (dept: Department) => {
    setSelectedDepartment(dept)
    createForm.reset({
      name: dept.name,
      facultyId: Number(dept.faculty.id),
      createdById: Number(user?.id),
    })
    setOpen(true)
  }

  const handleCloseForm = () => {
    setOpen(false)
    setSelectedDepartment(null)
    createForm.reset()
  }

  const onSubmit = (values: CreateDepartmentForm) => {
    const payload = {
      name: values.name,
      facultyId: values.facultyId,
      createdById: Number(user?.id),
    }
    if (selectedDepartment) {
      updateMutation.mutate({ id: Number(selectedDepartment.id), data: payload })
    } else {
      createMutation.mutate(payload)
    }
  }

  const handleDelete = (id: number) => {
    setDepartmentToDelete(id)
    setDeleteDialogOpen(true)
  }

  const confirmDelete = () => {
    if (departmentToDelete) {
      deleteMutation.mutate(departmentToDelete)
    }
    setDeleteDialogOpen(false)
    setDepartmentToDelete(null)
  }

  if (isPending) {
    return <IsPending page="Departments" />
  }

  if (isError) {
    toast.error((error as any)?.response?.data?.message ?? 'Failed to load data')
    return null
  }

  const columns: ColumnDef<Department>[] = [
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
          className="flex items-center text-left"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Department
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </div>
      ),
      cell: ({ row }) => <div className="capitalize">{row.getValue('name')}</div>,
    },
    {
      id: 'faculty',
      header: 'Faculty',
      accessorFn: (row) => row.faculty?.name ?? '—',
      cell: ({ getValue }) => <div className="text-left">{getValue<string>()}</div>,
    },
    {
      id: 'createdBy',
      header: 'CreatedBy',
      accessorFn: (row) => row.createdBy?.email ?? '—',
      cell: ({ getValue }) => <div className="text-left">{getValue<string>()}</div>,
    },
    {
      accessorKey: 'createdAt',
      header: 'Created',
      cell: ({ row }) => {
        const dateString = row.getValue('createdAt') as string | undefined
        if (!dateString) return <div className="text-gray-400">—</div>
        const date = new Date(dateString)
        if (isNaN(date.getTime())) return <div className="text-gray-400">Invalid date</div>
        const formatted = new Intl.DateTimeFormat('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        }).format(date)
        return <div className="capitalize">{formatted}</div>
      },
    },
    {
      id: 'actions',
      header: 'Actions',
      enableHiding: false,
      cell: ({ row }) => {
        const department = row.original
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0 hover:bg-green-100 hover:text-green-700">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuItem onClick={() => navigator.clipboard.writeText(department.id.toString())}>
                <Copy className="mr-2 h-4 w-4" />
                Copy ID
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onSelect={() => handleEdit(department)}>
                <Edit className="mr-2 h-4 w-4" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem
                className="text-red-600"
                onSelect={() => handleDelete(Number(department.id))}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )
      },
    },
  ]

  return (
    <>
      <SiteHeader title="Departments" />

      <main className="min-h-screen p-4 lg:p-6 bg-gray-50">
        <div className="mx-auto max-w-7xl space-y-6">
          <Card className="border-0 shadow-sm bg-white p-6">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-3xl font-bold tracking-tight text-gray-900">Departments</h1>
                <p className="text-gray-600">Manage departments under faculties.</p>
              </div>

              <Dialog open={open} onOpenChange={setOpen}>
                <DialogTrigger asChild>
                  <Button
                    variant="outline"
                    className="gap-2 bg-green-600 hover:bg-green-700 text-white shadow-lg hover:shadow-xl transition-all duration-200"
                    onClick={handleOpenCreate}
                  >
                    <Plus className="h-4 w-4" />
                    Add Department
                  </Button>
                </DialogTrigger>
                <DialogContent className="min-w-xl">
                  <form onSubmit={createForm.handleSubmit(onSubmit)} className="space-y-4">
                    <DialogHeader>
                      <DialogTitle>{selectedDepartment ? 'Edit Department' : 'Create Department'}</DialogTitle>
                      <DialogDescription>
                        {selectedDepartment ? 'Update department details.' : 'Create a new department.'}
                      </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4">
                      <div className="grid gap-3">
                        <Label htmlFor="name">Name</Label>
                        <Input
                          id="name"
                          placeholder="Enter department name"
                          {...createForm.register('name', { required: 'Name is required' })}
                        />
                      </div>
                      <div className="grid gap-3">
                        <Label htmlFor="faculty">Faculty</Label>
                        <Select
                          onValueChange={(value) => createForm.setValue('facultyId', Number(value))}
                          defaultValue={createForm.watch('facultyId')?.toString()}
                        >
                          <SelectTrigger className="border-gray-300 focus:border-green-500 focus:ring-green-500 w-full">
                            <SelectValue placeholder="Select faculty" />
                          </SelectTrigger>
                          <SelectContent>
                            {faculties.map((fac: any) => (
                              <SelectItem key={fac.id} value={String(fac.id)}>
                                {fac.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        {createForm.formState.errors.facultyId && (
                          <p className="text-sm text-red-500">{createForm.formState.errors.facultyId.message}</p>
                        )}
                      </div>
                    </div>
                    <DialogFooter>
                      <DialogClose asChild>
                        <Button variant="outline" onClick={handleCloseForm}>
                          Cancel
                        </Button>
                      </DialogClose>
                      <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
                        {createMutation.isPending || updateMutation.isPending
                          ? 'Saving...'
                          : selectedDepartment
                            ? 'Update'
                            : 'Save'}
                      </Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
          </Card>

          <Card className="border-0 shadow-sm bg-white p-6">
            <DataTable
              columns={columns}
              data={departments}
              filterColumn="name"
              filterPlaceholder="Filter by name…"
              recordName='DEPARTMENT'
              recordIcon={<School className="h-20 w-20" />}
            />
          </Card>
        </div>
      </main>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Delete Department</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this department? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:justify-end">
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmDelete} disabled={deleteMutation.isPending}>
              {deleteMutation.isPending ? 'Deleting...' : 'Delete'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}