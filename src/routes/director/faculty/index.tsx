import { DataTable } from '@/components/table'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { createFileRoute } from '@tanstack/react-router'
import type { ColumnDef } from '@tanstack/react-table'
import { ArrowUpDown, Copy, Edit, MoreHorizontal, Plus, Trash2 } from 'lucide-react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { useForm } from 'react-hook-form'
import { useState } from 'react'

import { createFaculty, deleteFaculty, getFaculties, updateFaculty, type Faculty } from '@/service'
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
import { useAppSelector } from '@/store/hooks'
import { Card } from '@/components/ui/card'
import IsPending from '@/components/Illustrations/isPending'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'

export const Route = createFileRoute('/director/faculty/')({
    component: RouteComponent,
})

type CreateFacultyForm = {
    name: string
    createdById: number
}

function RouteComponent() {
    const [open, setOpen] = useState(false) // controls the create/edit modal
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
    const [facultyToDelete, setFacultyToDelete] = useState<number | null>(null)
    const [selectedFaculty, setSelectedFaculty] = useState<Faculty | null>(null) // for editing

    const { user } = useAppSelector((state) => state.auth)
    const queryClient = useQueryClient()

    const searchParams = new URLSearchParams({
        page: '1',
        limit: '10',
    }).toString()

    const createForm = useForm<CreateFacultyForm>({
        defaultValues: {
            name: '',
            createdById: 0,
        },
    })

    const { data, isPending, isError, error } = useQuery({
        queryKey: ['faculties', searchParams],
        queryFn: () => getFaculties(searchParams),
        staleTime: 30_000,
    })

    const faculties = data?.data ?? []

    // Create mutation
    const createMutation = useMutation({
        mutationFn: createFaculty,
        onSuccess: () => {
            toast.success('Faculty created.', {
                style: { background: '#10b981', color: 'white', border: 'none' },
            })
            queryClient.invalidateQueries({ queryKey: ['faculties', searchParams] })
            handleCloseForm()
        },
        onError: () => toast.error('Failed to create faculty.'),
    })

    // Update mutation
    const updateMutation = useMutation({
        mutationFn: ({ id, data }: { id: number; data: CreateFacultyForm }) => updateFaculty(id, data),
        onSuccess: () => { 
            toast.success('Faculty updated.', {
                style: { background: '#10b981', color: 'white', border: 'none' },
            })
            queryClient.invalidateQueries({ queryKey: ['faculties', searchParams] })
            handleCloseForm()
        },
        onError: () => toast.error('Failed to update faculty.'),
    })

    // Delete mutation
    const deleteMutation = useMutation<unknown, Error, number>({
        mutationFn: deleteFaculty,
        onSuccess: () => {
            toast.success('Faculty deleted.')
            queryClient.invalidateQueries({ queryKey: ['faculties', searchParams] })
        },
        onError: () => toast.error('Failed to delete faculty.'),
    })

    const handleOpenCreate = () => {
        setSelectedFaculty(null)
        createForm.reset({
            name: '',
            createdById: Number(user?.id),
        })
        setOpen(true)
    }

    const handleEdit = (faculty: Faculty) => {
        setSelectedFaculty(faculty)
        createForm.reset({
            name: faculty.name,
            createdById: Number(user?.id),
        })
        setOpen(true)
    }

    const handleCloseForm = () => {
        setOpen(false)
        setSelectedFaculty(null)
        createForm.reset()
    }

    const onSubmit = (values: CreateFacultyForm) => {
        const payload = {
            name: values.name,
            createdById: Number(user?.id),
        }
        if (selectedFaculty) {
            updateMutation.mutate({ id: Number(selectedFaculty.id), data: payload })
        } else {
            createMutation.mutate(payload)
        }
    }

    const handleDelete = (id: number) => {
        setFacultyToDelete(id)
        setDeleteDialogOpen(true)
    }

    const confirmDelete = () => {
        if (facultyToDelete) {
            deleteMutation.mutate(facultyToDelete)
        }
        setDeleteDialogOpen(false)
        setFacultyToDelete(null)
    }

    if (isPending) {
        return <IsPending page="Faculties" />
    }

    if (isError) {
        toast.error(
            (error as any)?.response?.data?.message ?? 'Failed to load faculties'
        )
        return null
    }

    const columns: ColumnDef<Faculty>[] = [
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
                    Faculty
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </div>
            ),
            cell: ({ row }) => <div className="capitalize">{row.getValue('name')}</div>,
        },
        {
            id: 'departments',
            header: 'Departments',
            accessorFn: (row) => row._count?.departments ?? 0,
            cell: ({ getValue }) => <div className="text-left">{getValue<number>()}</div>,
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
                const faculty = row.original
                return (
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0 hover:bg-green-100 hover:text-green-700">
                                <MoreHorizontal className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuItem onClick={() => navigator.clipboard.writeText(faculty.id.toString())}>
                                <Copy className="mr-2 h-4 w-4" />
                                Copy ID
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onSelect={() => handleEdit(faculty)}>
                                <Edit className="mr-2 h-4 w-4" />
                                Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                className="text-red-600"
                                onSelect={() => handleDelete(Number(faculty.id))}
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
            <SiteHeader title="Faculty" />

            <main className="min-h-screen p-4 lg:p-6 bg-gray-50">
                <div className="mx-auto max-w-7xl space-y-6">
                    <Card className="border-0 shadow-sm bg-white p-6">
                        <div className="flex justify-between items-center">
                            <div>
                                <h1 className="text-3xl font-bold tracking-tight text-gray-900">
                                    Faculties
                                </h1>
                                <p className="text-gray-600">Manage faculties and their departments.</p>
                            </div>

                            <Dialog open={open} onOpenChange={setOpen}>
                                <DialogTrigger asChild>
                                    <Button
                                        variant="outline"
                                        className="gap-2 bg-green-600 hover:bg-green-700 text-white shadow-lg hover:shadow-xl transition-all duration-200"
                                        onClick={handleOpenCreate}
                                    >
                                        <Plus className="h-4 w-4" />
                                        Add Faculty
                                    </Button>
                                </DialogTrigger>
                                <DialogContent className="min-w-xl">
                                    <form
                                        onSubmit={createForm.handleSubmit(onSubmit)}
                                        className="space-y-4"
                                    >
                                        <DialogHeader>
                                            <DialogTitle>{selectedFaculty ? 'Edit Faculty' : 'Create Faculty'}</DialogTitle>
                                            <DialogDescription>
                                                {selectedFaculty ? 'Update faculty details.' : 'Create new faculties.'}
                                            </DialogDescription>
                                        </DialogHeader>
                                        <div className="grid gap-4">
                                            <div className="grid gap-3">
                                                <Label htmlFor="name">Name</Label>
                                                <Input
                                                    id="name"
                                                    placeholder="Enter Faculty Name"
                                                    {...createForm.register('name', {
                                                        required: 'Name is required',
                                                    })}
                                                />
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
                                                    : selectedFaculty
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
                            data={faculties}
                            filterColumn="name"
                            filterPlaceholder="Filter by name…"
                        />
                    </Card>
                </div>
            </main>

            {/* Delete Confirmation Dialog */}
            <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Delete Faculty</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to delete this faculty? This action cannot be undone.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="gap-2 sm:justify-end">
                        <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
                            Cancel
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={confirmDelete}
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