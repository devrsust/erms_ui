import { DataTable } from '@/components/table'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { createFileRoute } from '@tanstack/react-router'
import type { ColumnDef } from '@tanstack/react-table'
import { ArrowUpDown, Pencil, Plus, Trash2 } from 'lucide-react'
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query'
import { toast } from 'sonner'
import { useForm } from 'react-hook-form'
import { useState } from 'react'

import { createRole, getRoles, updateRole, deleteRole, type Role } from '@/service'
import { SiteHeader } from '@/components/site-header'
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import IsPending from '@/components/Illustrations/isPending'

type CreateRoleForm = {
  name: string
}

export const Route = createFileRoute('/admin/roles/')({
  component: RouteComponent,
})

function RouteComponent() {
  const [openCreateModal, setOpenCreateModal] = useState(false)
  const [openEditModal, setOpenEditModal] = useState(false)
  const [openDeleteModal, setOpenDeleteModal] = useState(false)
  const [selectedRole, setSelectedRole] = useState<Role | null>(null)
  const queryClient = useQueryClient()



  const createRoleForm = useForm<CreateRoleForm>({
    defaultValues: {
      name: '',
    },
  })

  const editRoleForm = useForm<CreateRoleForm>({
    defaultValues: {
      name: '',
    },
  })

  const { data, isPending, isError, error } = useQuery({
    queryKey: ['roles'],
    queryFn: () => getRoles({ page: 1, limit: 10 }),
    staleTime: 30_000,
  })

  // Create mutation
  const createMutation = useMutation({
    mutationFn: createRole,
    onSuccess: () => {
      toast.success('Role created successfully')
      queryClient.invalidateQueries({ queryKey: ['roles'] })
      createRoleForm.reset()
      setOpenCreateModal(false)
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to create role')
    },
  })

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: CreateRoleForm }) =>
      updateRole(id, data),
    onSuccess: () => {
      toast.success('Role updated successfully')
      queryClient.invalidateQueries({ queryKey: ['roles'] })
      editRoleForm.reset()
      setOpenEditModal(false)
      setSelectedRole(null)
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to update role')
    },
  })

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: deleteRole,
    onSuccess: () => {
      toast.success('Role deleted successfully')
      queryClient.invalidateQueries({ queryKey: ['roles'] })
      setOpenDeleteModal(false)
      setSelectedRole(null)
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to delete role')
    },
  })

  const onCreateRole = async (values: CreateRoleForm) => {
    createMutation.mutate(values)
  }

  const onEditRole = async (values: CreateRoleForm) => {
    if (selectedRole) {
      updateMutation.mutate({ id: Number(selectedRole.id), data: values })
    }
  }

  const onDeleteRole = async () => {
    if (selectedRole) {
      deleteMutation.mutate(Number(selectedRole.id))
    }
  }

  const handleEdit = (role: Role) => {
    setSelectedRole(role)
    editRoleForm.setValue('name', role.name)
    setOpenEditModal(true)
  }

  const handleDelete = (role: Role) => {
    setSelectedRole(role)
    setOpenDeleteModal(true)
  }

  if (isPending) {
    return <IsPending page='Roles' />
  }

  if (isError) {
    toast.error(
      (error as any)?.response?.data?.message ??
      'Failed to load roles'
    )
    return null
  }

  const columns: ColumnDef<Role>[] = [
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
          Role Name
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
      id: 'users',
      header: 'Users',
      accessorFn: (row) => row._count?.users ?? 0,
      cell: ({ getValue }) => (
        <div className="text-left">
          {getValue<number>()}
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
      header: 'Actions',
      enableHiding: false,
      cell: ({ row }) => {
        const role = row.original

        return (
          <div className='flex gap-4'>
            <Button
              className='bg-green-700 text-white hover:bg-green-800'
              size="sm"
              onClick={() => handleEdit(role)}
            >
              <Pencil className="h-4 w-4" />
            </Button>
            <Button
              className='bg-red-600 text-white hover:bg-red-700'
              size="sm"
              onClick={() => handleDelete(role)}
              disabled={role._count?.users > 0}
              title={role._count?.users > 0 ? "Cannot delete role with associated users" : "Delete role"}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        )
      },
    },
  ]

  return (
    <>
      <SiteHeader title='Roles' />
      <main className="p-6">
        <div className="mx-auto max-w-7xl space-y-6">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold tracking-tight text-gray-900">Roles</h1>
                <p className="text-gray-600">
                  Manage system Roles
                </p>
              </div>

              <Dialog open={openCreateModal} onOpenChange={setOpenCreateModal}>
                <DialogTrigger asChild>
                  <Button variant="outline" className="gap-2">
                    <Plus className="h-4 w-4" />
                    Add Role
                  </Button>
                </DialogTrigger>
                <DialogContent className="min-w-xl">
                  <form onSubmit={createRoleForm.handleSubmit(onCreateRole)} className="space-y-4">
                    <DialogHeader>
                      <DialogTitle>Create Role</DialogTitle>
                      <DialogDescription>
                        Create a new role for the system
                      </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4">
                      <div className="grid gap-3">
                        <Label htmlFor="name-create">Name</Label>
                        <Input
                          id="name-create"
                          placeholder='Enter Role Name'
                          {...createRoleForm.register('name', {
                            required: 'Role name is required',
                            minLength: {
                              value: 2,
                              message: 'Role name must be at least 2 characters'
                            }
                          })}
                          autoFocus
                        />
                        {createRoleForm.formState.errors.name && (
                          <p className="text-sm text-red-600">
                            {createRoleForm.formState.errors.name.message}
                          </p>
                        )}
                      </div>
                    </div>
                    <DialogFooter>
                      <DialogClose asChild>
                        <Button variant="outline" type="button">Cancel</Button>
                      </DialogClose>
                      <Button type="submit" disabled={createMutation.isPending}>
                        {createMutation.isPending ? 'Creating...' : 'Save'}
                      </Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
          </div>

          <DataTable
            columns={columns}
            data={data?.data ?? []}
            filterColumn="name"
            filterPlaceholder="Filter by name…"
          />
        </div>
      </main>

      {/* Edit Modal */}
      <Dialog open={openEditModal} onOpenChange={(open) => {
        if (!open) {
          setOpenEditModal(false)
          setSelectedRole(null)
          editRoleForm.reset()
        }
      }}>
        <DialogContent className="min-w-xl">
          <form onSubmit={editRoleForm.handleSubmit(onEditRole)} className="space-y-4">
            <DialogHeader>
              <DialogTitle>Edit Role</DialogTitle>
              <DialogDescription>
                Update the role name
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4">
              <div className="grid gap-3">
                <Label htmlFor="name-edit">Name</Label>
                <Input
                  id="name-edit"
                  placeholder='Enter Role Name'
                  {...editRoleForm.register('name', {
                    required: 'Role name is required',
                    minLength: {
                      value: 2,
                      message: 'Role name must be at least 2 characters'
                    }
                  })}
                  autoFocus
                />
                {editRoleForm.formState.errors.name && (
                  <p className="text-sm text-red-600">
                    {editRoleForm.formState.errors.name.message}
                  </p>
                )}
              </div>
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline" type="button">Cancel</Button>
              </DialogClose>
              <Button type="submit" disabled={updateMutation.isPending}>
                {updateMutation.isPending ? 'Updating...' : 'Update'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Modal */}
      <Dialog open={openDeleteModal} onOpenChange={(open) => {
        if (!open) {
          setOpenDeleteModal(false)
          setSelectedRole(null)
        }
      }}>
        <DialogContent className="min-w-md">
          <DialogHeader>
            <DialogTitle>Delete Role</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this role? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          {selectedRole && (
            <div className="py-4">
              <p className="text-sm text-gray-600">
                You are about to delete role: <span className="font-semibold text-gray-900">{selectedRole.name}</span>
              </p>
              {selectedRole._count?.users > 0 && (
                <p className="mt-2 text-sm text-red-600">
                  Warning: This role has {selectedRole._count.users} user(s) assigned. Deleting it may affect their permissions.
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
              onClick={onDeleteRole}
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