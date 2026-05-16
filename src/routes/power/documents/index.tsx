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
import { ArrowUpDown, FilePlusCorner, MoreHorizontal } from 'lucide-react'
import { useMutation, useQueries, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { useForm } from 'react-hook-form'
import { useState } from 'react'

import { createDocument, deleteDocument, getChains, getDocuments } from '@/service'
import { SiteHeader } from '@/components/site-header'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { useAppSelector } from '@/store/hooks'
import { Card } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useNavigate } from '@tanstack/react-router'
import IsPending from '@/components/Illustrations/isPending'

export const Route = createFileRoute('/power/documents/')({
  component: RouteComponent,
})

type Document = {
  id: string
  title: string
  createdBy: { email: string }
  totalAmount: number
  status: string
  createdAt: string
}

type CreateDocumentForm = {
  title: string
  description?: string
  status: string
  createdById: number
  price: number
  processingFee: number
  approvalChainId: number
}

function RouteComponent() {
  const [open, setOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [documentToDelete, setDocumentToDelete] = useState<number | null>(null)

  const navigate = useNavigate()
  const { user } = useAppSelector((state) => state.auth)
  const queryClient = useQueryClient()

  const searchParams = new URLSearchParams({
    page: '1',
    limit: '10',
  }).toString()

  const createDocumentForm = useForm<CreateDocumentForm>({
    defaultValues: {
      title: '',
      description: '',
      status: 'DRAFT',
      price: 0,
      processingFee: 0,
      approvalChainId: 0,
      createdById: user?.id,
    }
  })

  const results = useQueries({
    queries: [
      {
        queryKey: ['documents', searchParams],
        queryFn: () => getDocuments(searchParams),
        staleTime: 30_000,
      },
      {
        queryKey: ['chain', searchParams],
        queryFn: () => getChains(searchParams),
        staleTime: 30_000,
      },
    ]
  })

  const [documentsQuery, chainQuery] = results

  const documents = documentsQuery.data?.data ?? []
  const chains = chainQuery.data?.data ?? []

  const isPending = documentsQuery.isPending || chainQuery.isPending
  const isError = documentsQuery.isError || chainQuery.isError
  const error = documentsQuery.error || chainQuery.error

  // Create mutation
  const createMutation = useMutation({
    mutationFn: createDocument,
    onSuccess: () => {
      toast.success("Document created.", {
        style: { background: '#10b981', color: 'white', border: 'none' }
      })
      queryClient.invalidateQueries({ queryKey: ['documents', searchParams] })
      createDocumentForm.reset()
      setOpen(false)
    },
    onError: () => toast.error("Failed to create document"),
  })

  // Delete mutation
  const deleteMutation = useMutation<unknown, Error, number>({
    mutationFn: deleteDocument,
    onSuccess: () => {
      toast.success("Document deleted.")
      queryClient.invalidateQueries({ queryKey: ['documents', searchParams] })
    },
    onError: () => toast.error("Failed to delete document"),
  })

  const onCreateDocument = (values: CreateDocumentForm) => {
    const payload = {
      title: values.title,
      description: values.description,
      status: values.status,
      price: Number(values.price),
      processingFee: Number(values.processingFee),
      approvalChainId: Number(values.approvalChainId),
      createdById: Number(user?.id),
    }
    createMutation.mutate(payload)
  }

  const handleDelete = (id: number) => {
    setDocumentToDelete(id)
    setDeleteDialogOpen(true)
  }

  const confirmDelete = () => {
    if (documentToDelete) {
      deleteMutation.mutate(documentToDelete)
    }
    setDeleteDialogOpen(false)
    setDocumentToDelete(null)
  }

  if (isPending) {
    return <IsPending page="Document" />
  }

  if (isError) {
    toast.error(
      (error as any)?.response?.data?.message ?? 'Failed to load documents'
    )
    return null
  }

  const columns: ColumnDef<Document>[] = [
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
      accessorKey: 'title',
      header: ({ column }) => (
        <div
          className='flex items-center text-left'
          onClick={() =>
            column.toggleSorting(
              column.getIsSorted() === 'asc'
            )
          }
        >
          Title
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </div>
      ),
      cell: ({ row }) => (
        <div className="capitalize">
          {row.getValue('title')}
        </div>
      ),
    },
    {
      id: 'createdByEmail',
      accessorFn: (row) => row.createdBy?.email ?? '',
      header: ({ column }) => (
        <div
          className='flex items-center text-left'
          onClick={() =>
            column.toggleSorting(column.getIsSorted() === 'asc')
          }
        >
          Created By
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </div>
      ),
      cell: ({ getValue }) => (
        <div className="text-left lowercase">
          {getValue<string>()}
        </div>
      ),
    },
    {
      accessorKey: 'totalAmount',
      header: () => (
        <div className="text-left">Amount</div>
      ),
      cell: ({ row }) => {
        const amount = Number(row.getValue('totalAmount'))
        return (
          <div className="text-left font-medium">
            {new Intl.NumberFormat('en-US', {
              style: 'currency',
              currency: 'NGN',
            }).format(amount)}
          </div>
        )
      },
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
      enableHiding: false,
      cell: ({ row }) => {
        const document = row.original
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <MoreHorizontal />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuItem
                onClick={() => navigator.clipboard.writeText(document.id)}
              >
                Copy ID
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => navigate({ to: `/dashboard/documents/${document.id}` })}
              >
                View
              </DropdownMenuItem>
              <DropdownMenuItem>Details</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-red-600"
                onClick={() => handleDelete(Number(document.id))}
              >
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
      <SiteHeader title='Documents' />

      <main className="p-4 lg:p-6 bg-gray-50 min-h-screen">
        <div className="mx-auto max-w-7xl space-y-6">

          <Card className="border-0 shadow-sm bg-white p-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold tracking-tight text-gray-900">Documents</h1>
                <p className="text-gray-600">
                  Manage documents.
                </p>
              </div>

              <Dialog open={open} onOpenChange={setOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" className="gap-2 bg-green-600 hover:bg-green-700 text-white shadow-lg hover:shadow-xl transition-all duration-200">
                    <FilePlusCorner className="h-4 w-4" />
                    Add Document
                  </Button>
                </DialogTrigger>
                <DialogContent className="min-w-xl bg-gray-50">
                  <form onSubmit={createDocumentForm.handleSubmit(onCreateDocument)} className='space-y-4'>
                    <DialogHeader>
                      <DialogTitle>Create document.</DialogTitle>
                      <DialogDescription>
                        Create new document.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="grid grid-cols-2 gap-4 bg-white shadow p-4 rounded-2xl">
                      <div className="grid col-span-2 gap-3">
                        <Label htmlFor="title">Title</Label>
                        <Input
                          id="title"
                          placeholder='Enter title'
                          {...createDocumentForm.register('title', {
                            required: 'title is required',
                          })}
                        />
                      </div>
                      <div className="grid col-span-2 gap-3">
                        <Label>Description (Optional)</Label>
                        <Textarea {...createDocumentForm.register('description')} />
                      </div>
                      <div className="grid col-span-2 gap-3">
                        <Label htmlFor="approvalChainId" className="text-sm font-medium text-gray-700">
                          Approval Chain <span className="text-gray-400 text-xs">(optional)</span>
                        </Label>
                        <Select
                          onValueChange={(value) => createDocumentForm.setValue('approvalChainId', Number(value))}
                          value={createDocumentForm.watch('approvalChainId')?.toString()}
                        >
                          <SelectTrigger className="border-gray-300 focus:border-green-500 focus:ring-green-500 w-full">
                            <SelectValue placeholder="Select an approval chain" />
                          </SelectTrigger>
                          <SelectContent className='w-full'>
                            {chains.map((chain: any) => (
                              <SelectItem key={chain.id} value={String(chain.id)}>
                                {chain.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="grid gap-3">
                        <Label htmlFor="price">Price</Label>
                        <Input
                          id="price"
                          placeholder='Enter Document cost'
                          {...createDocumentForm.register('price', {
                            required: 'price is required',
                          })}
                        />
                      </div>
                      <div className="grid gap-3">
                        <Label htmlFor="processing">Processing Fee</Label>
                        <Input
                          id="processing"
                          placeholder='Enter Processing Fee'
                          {...createDocumentForm.register('processingFee', {
                            required: 'Processing fee is required',
                          })}
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <DialogClose asChild>
                        <Button variant="outline">Cancel</Button>
                      </DialogClose>
                      <Button type="submit" className='bg-green-600 hover:bg-green-700 text-white'>
                        {createMutation.isPending ? 'Creating...' : 'Save changes'}
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
              data={documents}
              filterColumn="title"
              filterPlaceholder="Filter by title…"
            />
          </Card>

        </div>
      </main>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Delete Document</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this document? This action cannot be undone.
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