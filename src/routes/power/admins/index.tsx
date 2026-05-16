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
import { ArrowUpDown, MoreHorizontal, UserCog, Mail, Shield, Calendar, CheckCircle, XCircle, Plus, X } from 'lucide-react'
import { useMutation, useQueries, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { Controller, useForm } from 'react-hook-form'
import { useState } from 'react'

import { createUser, updateUser, deleteUser, getAdmins, getRoles, type Admin } from '@/service'
import { SiteHeader } from '@/components/site-header'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from '@/components/ui/select'
import IsPending from '@/components/Illustrations/isPending'
import { Badge } from '@/components/ui/badge'

export const Route = createFileRoute('/power/admins/')({
  component: RouteComponent,
})

type CreateUserForm = {
  firstname: string
  lastname: string
  roleId: number
  email: string
  password: string
  isActive: boolean
}

function RouteComponent() {
  const [open, setOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [adminToDelete, setAdminToDelete] = useState<string | null>(null)
  const [selectedAdmin, setSelectedAdmin] = useState<Admin | null>(null)

  const queryClient = useQueryClient()


  const createUserForm = useForm<CreateUserForm>({
    defaultValues: {
      firstname: '',
      lastname: '',
      roleId: 0,
      email: '',
      password: '',
    },
  })

  const results = useQueries({
    queries: [
      {
        queryKey: ['admins'],
        queryFn: () => getAdmins({ page: 1, limit: 1 }),
        staleTime: 30_000,
      },
      {
        queryKey: ['roles'],
        queryFn: () => getRoles({ page: 1, limit: 10 }),
        staleTime: 30_000,
      },
    ],
  })

  const [adminQuery, roleQuery] = results
  const admins = adminQuery.data?.data ?? []
  const roles = roleQuery.data?.data ?? []

  const isPending = adminQuery.isPending || roleQuery.isPending
  const isError = adminQuery.isError || roleQuery.isError
  const error = adminQuery.error || roleQuery.error

  // Mutations
  const createMutation = useMutation({
    mutationFn: createUser,
    onSuccess: () => {
      toast.success('User created.', {
        style: { background: '#10b981', color: 'white', border: 'none' },
      })
      queryClient.invalidateQueries({ queryKey: ['admins'], exact: false })
      handleCloseForm()
    },
    onError: () => toast.error('Failed to create user.'),
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: CreateUserForm }) => updateUser(Number(id), data),
    onSuccess: () => {
      toast.success('User updated.', {
        style: { background: '#10b981', color: 'white', border: 'none' },
      })
      queryClient.invalidateQueries({ queryKey: ['admins'], exact: false })
      handleCloseForm()
    },
    onError: () => toast.error('Failed to update user.'),
  })

  const deleteMutation = useMutation<unknown, Error, number>({
    mutationFn: (id: number) => deleteUser(id),
    onSuccess: () => {
      toast.success('User deleted.')
      queryClient.invalidateQueries({ queryKey: ['admins'], exact: false })
    },
    onError: () => toast.error('Failed to delete user.'),
  })

  const handleOpenCreate = () => {
    setSelectedAdmin(null)
    createUserForm.reset({
      firstname: '',
      lastname: '',
      roleId: 0,
      email: '',
      password: '',
    })
    setOpen(true)
  }

  const handleEdit = (admin: Admin) => {
    setSelectedAdmin(admin)
    createUserForm.reset({
      firstname: admin.firstname,
      lastname: admin.lastname,
      roleId: admin.role.id,
      email: admin.email,
    })
    setOpen(true)
  }

  const handleCloseForm = () => {
    setOpen(false)
    setSelectedAdmin(null)
    createUserForm.reset()
  }

  const onSubmit = (values: CreateUserForm) => {
    if (selectedAdmin) {
      updateMutation.mutate({ id: selectedAdmin.id, data: values })
    } else {
      createMutation.mutate(values)
    }
  }

  const handleDelete = (id: string) => {
    setAdminToDelete(id)
    setDeleteDialogOpen(true)
  }

  const confirmDelete = () => {
    if (adminToDelete) {
      deleteMutation.mutate(Number(adminToDelete));
    }
    setDeleteDialogOpen(false)
    setAdminToDelete(null)
  }

  if (isPending) {
    return <IsPending page="Administrators" />
  }

  if (isError) {
    toast.error((error as any)?.response?.data?.message ?? 'Failed to load admins')
    return null
  }

  const columns: ColumnDef<Admin>[] = [
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
      accessorKey: 'firstname',
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          className="font-semibold hover:bg-gray-50"
        >
          First Name
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => <div className="font-medium">{row.getValue('firstname')}</div>,
    },
    {
      accessorKey: 'lastname',
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          className="font-semibold hover:bg-gray-50"
        >
          Last Name
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => <div className="font-medium">{row.getValue('lastname')}</div>,
    },
    {
      accessorKey: 'email',
      header: () => (
        <div className="flex items-center gap-2">
          <Mail className="h-4 w-4 text-gray-500" />
          <span>Email</span>
        </div>
      ),
      cell: ({ row }) => <div className="text-gray-700">{row.getValue('email')}</div>,
    },
    {
      id: 'role',
      header: () => (
        <div className="flex items-center gap-2">
          <Shield className="h-4 w-4 text-gray-500" />
          <span>Role</span>
        </div>
      ),
      accessorFn: (row) => row.role?.name ?? '—',
      cell: ({ getValue }) => {
        const role = getValue<string>()
        return (
          <Badge variant="outline" className="capitalize">
            {role}
          </Badge>
        )
      },
    },
    {
      accessorKey: 'isActive',
      header: 'Status',
      cell: ({ row }) => {
        const isActive = row.getValue('isActive') as boolean
        return (
          <div className="flex items-center gap-2">
            {isActive ? (
              <CheckCircle className="h-4 w-4 text-green-500" />
            ) : (
              <XCircle className="h-4 w-4 text-red-500" />
            )}
            <Badge variant={isActive ? 'default' : 'destructive'} className="gap-1.5">
              {isActive ? 'Active' : 'Inactive'}
            </Badge>
          </div>
        )
      },
    },
    {
      accessorKey: 'createdAt',
      header: () => (
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-gray-500" />
          <span>Created</span>
        </div>
      ),
      cell: ({ row }) => {
        const dateString = row.getValue('createdAt') as string
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
        return (
          <div className="space-y-0.5">
            <div className="text-sm font-medium">{formatted.split(',')[0]}</div>
            <div className="text-xs text-gray-500">{formatted.split(',')[1].trim()}</div>
          </div>
        )
      },
    },
    {
      id: 'actions',
      enableHiding: false,
      cell: ({ row }) => {
        const admin = row.original
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
                Admin Actions
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => navigator.clipboard.writeText(admin.id)}
                className="cursor-pointer gap-2"
              >
                Copy ID
              </DropdownMenuItem>
              <DropdownMenuItem className="cursor-pointer gap-2" onSelect={() => handleEdit(admin)}>
                Edit Admin
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-red-600 cursor-pointer gap-2 focus:text-red-600"
                onSelect={() => handleDelete(admin.id)}
              >
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )
      },
    },
  ]

  const totalAdmins = admins?.length || 0
  const activeAdmins = admins?.filter((admin) => admin.isActive).length || 0
  const adminRoles = [...new Set(admins?.map((admin) => admin.role?.name).filter(Boolean))]

  return (
    <>
      <SiteHeader title="Administrators" />

      <main className="min-h-screen p-4 lg:p-6 bg-gray-50">
        <div className="mx-auto max-w-7xl space-y-6">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold tracking-tight text-gray-900">Administrators</h1>
                <p className="text-gray-600">Manage system administrators and their permissions</p>
              </div>

              <Dialog open={open} onOpenChange={setOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" className="gap-2 bg-green-800 hover:bg-green-900 text-white" onClick={handleOpenCreate}>
                    <Plus className="h-4 w-4" />
                    Add Admin
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-2xl p-0 overflow-hidden">
                  <div className="flex items-center justify-between p-6 border-b">
                    <DialogHeader className="p-0">
                      <DialogTitle className="text-xl font-semibold">
                        {selectedAdmin ? 'Edit Administrator' : 'Create New Administrator'}
                      </DialogTitle>
                      <DialogDescription className="text-sm text-gray-500 mt-1">
                        {selectedAdmin
                          ? 'Update administrator details below.'
                          : 'Fill in the details to create a new administrator account.'}
                      </DialogDescription>
                    </DialogHeader>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 rounded-full"
                      onClick={handleCloseForm}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>

                  <form onSubmit={createUserForm.handleSubmit(onSubmit)} className="p-6">
                    <div className="grid grid-cols-2 gap-5">
                      <div className="grid gap-2">
                        <Label htmlFor="firstname" className="text-sm font-medium text-gray-700">
                          First Name <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          id="firstname"
                          placeholder="Enter first name"
                          className="focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          {...createUserForm.register('firstname', { required: 'Firstname is required' })}
                        />
                        {createUserForm.formState.errors.firstname && (
                          <p className="text-xs text-red-600">
                            {createUserForm.formState.errors.firstname.message}
                          </p>
                        )}
                      </div>

                      <div className="grid gap-2">
                        <Label htmlFor="lastname" className="text-sm font-medium text-gray-700">
                          Last Name <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          id="lastname"
                          placeholder="Enter last name"
                          className="focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          {...createUserForm.register('lastname', { required: 'Lastname is required' })}
                        />
                        {createUserForm.formState.errors.lastname && (
                          <p className="text-xs text-red-600">
                            {createUserForm.formState.errors.lastname.message}
                          </p>
                        )}
                      </div>

                      <div className="col-span-2 grid gap-2">
                        <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                          Email Address <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          id="email"
                          type="email"
                          placeholder="admin@example.com"
                          className="focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          {...createUserForm.register('email', { required: 'Email is required' })}
                        />
                        {createUserForm.formState.errors.email && (
                          <p className="text-xs text-red-600">
                            {createUserForm.formState.errors.email.message}
                          </p>
                        )}
                      </div>

                      <div className="col-span-2 grid grid-cols-2 gap-5">
                        <div className="grid gap-2">
                          <Label className="text-sm font-medium text-gray-700">
                            Role <span className="text-red-500">*</span>
                          </Label>
                          <Controller
                            name="roleId"
                            control={createUserForm.control}
                            rules={{ required: 'Role is required' }}
                            render={({ field }) => (
                              <Select
                                value={String(field.value ?? '')}
                                onValueChange={(value) => field.onChange(Number(value))}
                              >
                                <SelectTrigger className="w-full focus:ring-2 focus:ring-blue-500">
                                  <SelectValue placeholder="Select a role" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectGroup>
                                    <SelectLabel>Available Roles</SelectLabel>
                                    {roles.map((item) => (
                                      <SelectItem key={item.id} value={String(item.id)}>
                                        {item.name}
                                      </SelectItem>
                                    ))}
                                  </SelectGroup>
                                </SelectContent>
                              </Select>
                            )}
                          />
                          {createUserForm.formState.errors.roleId && (
                            <p className="text-xs text-red-600">
                              {createUserForm.formState.errors.roleId.message}
                            </p>
                          )}
                        </div>

                        <div className="grid gap-2">
                          <Label htmlFor="password" className="text-sm font-medium text-gray-700">
                            Password {!selectedAdmin && <span className="text-red-500">*</span>}
                          </Label>
                          <Input
                            id="password"
                            type="password"
                            placeholder={selectedAdmin ? 'Leave blank to keep unchanged' : 'Enter password'}
                            className="focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            {...createUserForm.register('password', {
                              required: !selectedAdmin && 'Password is required',
                              minLength: selectedAdmin ? undefined : {
                                value: 6,
                                message: 'Password must be at least 6 characters'
                              }
                            })}
                          />
                          {createUserForm.formState.errors.password && (
                            <p className="text-xs text-red-600">
                              {createUserForm.formState.errors.password.message}
                            </p>
                          )}
                          {selectedAdmin && (
                            <p className="text-xs text-gray-500">
                              Leave blank to keep current password
                            </p>
                          )}
                        </div>
                      </div>
                    </div>

                    <DialogFooter className="mt-6 pt-4 border-t">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={handleCloseForm}
                        className="px-6"
                      >
                        Cancel
                      </Button>
                      <Button
                        type="submit"
                        disabled={createMutation.isPending || updateMutation.isPending}
                        className="px-6 bg-green-800 hover:bg-green-900"
                      >
                        {createMutation.isPending || updateMutation.isPending
                          ? 'Saving...'
                          : selectedAdmin
                            ? 'Update Administrator'
                            : 'Create Administrator'}
                      </Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <div className="grid gap-4 p-4 shadow rounded-2xl bg-white">
              <p className="text-sm font-medium text-gray-600">Total Administrators</p>
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100">
                  <UserCog className="h-5 w-5 text-blue-600" />
                </div>
                <h3 className="text-2xl font-bold">{totalAdmins}</h3>
              </div>
            </div>

            <div className="grid gap-4 p-4 shadow rounded-2xl bg-white">
              <p className="text-sm font-medium text-gray-600">Active Administrators</p>
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                </div>
                <h3 className="text-2xl font-bold">{activeAdmins}</h3>
              </div>
            </div>

            <div className="grid gap-4 p-4 shadow rounded-2xl bg-white">
              <p className="text-sm font-medium text-gray-600">Roles</p>
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-purple-100">
                  <Shield className="h-5 w-5 text-purple-600" />
                </div>
                <h3 className="text-2xl font-bold">{adminRoles.length}</h3>
              </div>
            </div>
          </div>

          <div className="p-4 shadow rounded-2xl bg-white">
            <DataTable
              columns={columns}
              data={admins ?? []}
              filterColumn="email"
              filterPlaceholder="Search by email or name…"
            />
          </div>
        </div>
      </main>

      {/* Delete Confirmation Dialog - Improved UI */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="sm:max-w-md p-0 overflow-hidden">
          <div className="flex items-center justify-between p-6 border-b bg-red-50">
            <DialogHeader className="p-0">
              <DialogTitle className="text-xl font-semibold text-red-600">
                Delete Administrator
              </DialogTitle>
            </DialogHeader>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 rounded-full hover:bg-red-100"
              onClick={() => setDeleteDialogOpen(false)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          <div className="p-6">
            <DialogDescription className="text-gray-600 text-base">
              Are you sure you want to delete this administrator? This action cannot be undone.
            </DialogDescription>

            {adminToDelete && (
              <div className="mt-4 p-3 bg-gray-50 rounded-lg border border-gray-200">
                <p className="text-sm text-gray-600">
                  Administrator ID: <span className="font-mono font-semibold text-gray-900">{adminToDelete}</span>
                </p>
              </div>
            )}
          </div>

          <DialogFooter className="p-6 pt-0 border-t bg-gray-50">
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
              className="px-6"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={confirmDelete}
              disabled={deleteMutation.isPending}
              className="px-6 bg-red-600 hover:bg-red-700"
            >
              {deleteMutation.isPending ? 'Deleting...' : 'Yes, Delete'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}