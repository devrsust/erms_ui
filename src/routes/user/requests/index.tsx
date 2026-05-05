"use client"

import * as React from "react"
import { createFileRoute, useNavigate } from "@tanstack/react-router"
import { useQueries } from "@tanstack/react-query"
import type { ColumnDef } from "@tanstack/react-table"
import { ArrowUpDown, Trash2, FileText, Building2, Mail, CreditCard, CalendarDays, PlusCircle, Eye, Download, Clock, CheckCircle, XCircle, TrendingUp, AlertCircle, MoreHorizontal } from "lucide-react"
import { useForm } from "react-hook-form"

import { DataTable } from "@/components/table"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Skeleton } from "@/components/ui/skeleton"
import { Progress } from "@/components/ui/progress"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

import {
  createRequests,
  getDocuments,
  getFaculties,
  getRequestsByUser,
  initPayment,
  updatePayment,
  type Request,
} from "@/service"
import { useAppSelector } from "@/store/hooks"
import { toast } from "sonner"
import PaystackPop from "@paystack/inline-js"
import { SiteHeader } from "@/components/site-header"
import { Textarea } from "@/components/ui/textarea"

export const Route = createFileRoute("/user/requests/")({
  component: RouteComponent,
})

type RequestForm = {
  request: string
  type: "internal" | "external"
  price: number
  document: {
    id: number
    title: string
    totalAmount: number
  } | null
  facultyId: string
  email: string
  address: string
}

function RouteComponent() {
  const { user } = useAppSelector((state) => state.auth)
  const [open, setOpen] = React.useState(false)
  const [paymentData, setPaymentData] = React.useState<any | null>(null)
  const [activeTab, setActiveTab] = React.useState("all")
  const navigate = useNavigate();

  const searchParams = new URLSearchParams({
    page: "1",
    limit: "10",
  }).toString()

  const results = useQueries({
    queries: [
      {
        queryKey: ["documents", searchParams],
        queryFn: () => getDocuments(searchParams),
        staleTime: 30_000,
      },
      {
        queryKey: ["faculties", searchParams],
        queryFn: () => getFaculties(searchParams),
        staleTime: 30_000,
      },
      {
        queryKey: ["requests", user?.id],
        queryFn: () => getRequestsByUser(user!.id),
        enabled: !!user?.id,
        staleTime: 30_000,
      }
    ],
  })

  const [documentQuery, facultyQuery, requestQuery] = results

  const documents = documentQuery.data?.data ?? []
  const faculties = facultyQuery.data?.data ?? []
  const requests = requestQuery.data?.data ?? []

  console.log(requests);

  const form = useForm<RequestForm>({
    defaultValues: {
      request: "",
      type: "internal",
      price: 0,
      document: null,
      facultyId: "",
      email: "",
      address: "",
    },
  })

  const selectedType = form.watch("type")

  const columns: ColumnDef<Request>[] = [
    {
      id: "select",
      header: ({ table }) => (
        <Checkbox
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && "indeterminate")
          }
          onCheckedChange={(value) =>
            table.toggleAllPageRowsSelected(!!value)
          }
          className="border-gray-300"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          className="border-gray-300"
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      id: "request",
      header: () => (
        <div className="flex items-center gap-2 font-semibold">
          <FileText className="h-4 w-4 text-blue-500" />
          <span>Request</span>
        </div>
      ),
      accessorFn: (row) => row.document?.title ?? "—",
      cell: ({ row }) => {
        const request = row.original
        return (
          <div className="space-y-1">
            <div className="font-medium text-gray-900">
              {request.document?.title}
            </div>
            <div className="text-xs text-gray-500 flex items-center gap-1">
              <FileText className="h-3 w-3" />
              {request.type}
            </div>
          </div>
        )
      },
    },
    {
      accessorKey: "status",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() =>
            column.toggleSorting(column.getIsSorted() === "asc")
          }
          className="font-semibold hover:bg-gray-50"
        >
          Status
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => {
        const status = row.getValue("status") as string
        // const request = row.original

        type Status = "PENDING" | "SUCCESSFUL" | "FAILED";

        const statusStyles: Record<Status, string> = {
          PENDING: "bg-yellow-100 text-yellow-700",
          SUCCESSFUL: "bg-green-100 text-green-700",
          FAILED: "bg-red-100 text-red-700",
        };



        return (
          <div className="space-y-1.5">
            <Badge
              className={`gap-1.5 ${statusStyles[status as Status] || "bg-gray-100 text-gray-700"
                }`}
            >
              {status === "PENDING" && <Clock className="h-3 w-3" />}
              {status === "SUCCESSFUL" && <CheckCircle className="h-3 w-3" />}
              {status === "FAILED" && <XCircle className="h-3 w-3" />}
              {status}
            </Badge>
            {status === "PENDING" && (
              <div className="flex items-center gap-2">
                <Progress value={50} className="h-1.5 w-20 [&>div]:bg-green-800" />
                <span className="text-xs text-gray-500">Processing</span>
              </div>
            )}
          </div>
        )
      },
    },
    {
      accessorKey: "reference_number",
      header: () => (
        <div className="flex items-center gap-2 font-semibold">
          <CreditCard className="h-4 w-4 text-purple-500" />
          <span>Reference</span>
        </div>
      ),
      cell: ({ getValue }) => (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="font-mono text-sm font-medium bg-gray-50 px-2 py-1 rounded-md hover:bg-gray-100 cursor-pointer">
                {getValue<string>().slice(0, 8)}...
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p className="font-mono">{getValue<string>()}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      ),
    },
    {
      id: "amount",
      header: () => (
        <div className="flex items-center gap-2 font-semibold">
          <TrendingUp className="h-4 w-4 text-green-500" />
          <span>Amount</span>
        </div>
      ),
      accessorFn: (row) => row.document?.totalAmount ?? 0,
      cell: ({ getValue }) => (
        <div className="font-semibold text-gray-900">
          {new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: "NGN",
            minimumFractionDigits: 0,
          }).format(getValue<number>())}
        </div>
      ),
    },
    {
      id: "payment",
      header: "Payment Status",
      accessorFn: (row) => row.payments?.[0]?.status ?? "—",
      cell: ({ row }) => {
        const status = row.original.payments?.[0]?.status ?? "—"
        type Status = "PENDING" | "SUCCESSFUL" | "FAILED";

        const statusStyles: Record<Status, string> = {
          PENDING: "bg-yellow-100 text-yellow-700",
          SUCCESSFUL: "bg-green-100 text-green-700",
          FAILED: "bg-red-100 text-red-700",
        };

        return (
          <Badge
            className={`gap-1.5 ${statusStyles[status as Status] || "capitalize bg-gray-100 text-gray-700"
              }`}
          >
            {status === "SUCCESSFUL" && <CheckCircle className="h-3 w-3" />}
            {status === "PENDING" && <Clock className="h-3 w-3" />}
            {status === "—" && <AlertCircle className="h-3 w-3" />}
            {status}
          </Badge>
        );
      },
    },
    {
      accessorKey: "createdAt",
      header: () => (
        <div className="flex items-center gap-2 font-semibold">
          <CalendarDays className="h-4 w-4" />
          <span>Created</span>
        </div>
      ),
      cell: ({ row }) => {
        const date = new Date(row.getValue("createdAt"));
        return (
          <div className="space-y-0.5">
            <div className="text-sm font-medium">
              {new Intl.DateTimeFormat("en-US", {
                year: "2-digit",
                month: "2-digit",
                day: "2-digit",
                hour: "2-digit",
                minute: "2-digit"
              }).format(date)}
            </div>
          </div>
        )
      },
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => {
        const request = row.original

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="h-8 w-8 p-0 hover:bg-gray-100 transition-colors"
              >
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuLabel className="text-xs font-semibold text-gray-600">
                Request Actions
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="cursor-pointer gap-2"
                onClick={() => navigate({ to: `/user/requests/${request.id}` })}
              >
                <Eye className="h-4 w-4" />
                View Details
              </DropdownMenuItem>
              {request.status === "COMPLETED" && (
                <DropdownMenuItem className="cursor-pointer gap-2 text-amber-600">
                  <Download className="h-4 w-4" />
                  Download Document
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator />
              {request.status === "PENDING" && (
                <DropdownMenuItem className="text-red-600 cursor-pointer gap-2 focus:text-red-600">
                  <Trash2 className="h-4 w-4" />
                  Cancel Request
                </DropdownMenuItem>
              )}

            </DropdownMenuContent>
          </DropdownMenu>
        )
      },
    },
  ]

  const handleSubmit = async (values: RequestForm) => {
    if (!user) {
      toast.error("User not logged in.")
      return
    }

    if (!values.facultyId) {
      toast.error("Faculty is required");
      return;
    }

    try {
      const payload = {
        user,
        request: values.request,
        type: values.type,
        destination: values.facultyId,
        email: values.email,
        address: values.address,
        price: values.price,
        processing_fee: 0,
        document: values.document,
      }

      const response = await initPayment(payload)
      setPaymentData(response)
      toast.success("Payment initialized. Click 'Proceed to Payment'.")
    } catch (error) {
      console.error("Payment init failed:", error)
      toast.error("Failed to initialize payment.")
    }
  }

  const handlePayment = () => {
    if (!paymentData) return;

    const accessCode = paymentData.access_code;
    if (!accessCode) return;

    const paystack = new PaystackPop();
    setOpen(false);

    paystack.resumeTransaction(accessCode, {
      onSuccess: async () => {
        try {
          const paymentId = paymentData.payment_id;

          if (!paymentId) return;

          const payload = {
            status: "SUCCESSFUL",
            transaction_id: paymentData.reference,
            reference: paymentData.reference,
            access_code: paymentData.access_code,
          };

          await updatePayment(paymentId, payload);
          toast.success("Payment completed successfully");

          const formValues = form.getValues()
          const requestPayload = {
            paymentId: String(paymentId),
            userId: user!.id,
            documentId: formValues.document!.id,
            type: formValues.type,
            facultyId: formValues.facultyId,
            email: formValues.email,
            address: formValues.address,
          };

          console.log("REQUEST: ", requestPayload);

          const res = await createRequests(requestPayload);
          console.log("REQUEST RES: ", res);

        } catch (error) {
          console.error(error);
        }
      },
    });
  };


  if (documentQuery.isLoading || facultyQuery.isLoading || requestQuery.isLoading) {
    return (
      <div className="min-h-screen p-4 lg:p-6">
        <div className="mx-auto max-w-7xl space-y-6">
          <div className="space-y-2">
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-4 w-96" />
          </div>
          <Separator />
          <div className="grid gap-4 md:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-32 rounded-xl" />
            ))}
          </div>
          <Skeleton className="h-64" />
        </div>
      </div>
    )
  }

  const filteredRequests = activeTab === "all"
    ? requests
    : activeTab === "pending"
      ? requests.filter(req => req.status === "PENDING")
      : activeTab === "completed"
        ? requests.filter(req => req.status === "SUCCESSFUL")
        : requests.filter(req => req.status === "FAILED")

  return (
    <>
      <SiteHeader title="Requests" />

      <main className="min-h-screen p-4 lg:p-6 bg-gray-50">
        <div className="mx-auto max-w-7xl space-y-6">

          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="space-y-1">
              <h1 className="text-3xl font-bold tracking-tight text-gray-900">My Requests</h1>
              <p className="text-gray-600">
                Track, manage, and create new document requests
              </p>
            </div>
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                <Button className="gap-2 bg-green-900 hover:bg-green-800">
                  <PlusCircle className="h-4 w-4" />
                  New Request
                </Button>
              </DialogTrigger>

              <DialogContent className="max-w-xl">
                <DialogHeader>
                  <DialogTitle className="text-xl">New Document Request</DialogTitle>
                  <DialogDescription>
                    Request a document for internal or external use
                  </DialogDescription>
                </DialogHeader>

                <form
                  onSubmit={form.handleSubmit(handleSubmit)}
                  className="space-y-4"
                >

                  <div className="grid grid-cols-2 gap-4">
                    {/* Document */}
                    <div className="space-y-2">
                      <Label htmlFor="document" className="font-medium">Select Document</Label>
                      <Select
                        value={form.watch("document")?.id?.toString() ?? ""}
                        onValueChange={(v) => {
                          const selected = documents.find(
                            (d) => String(d.id) === v
                          )
                          if (!selected) return

                          form.setValue("document", {
                            id: Number(selected.id),
                            title: selected.title,
                            totalAmount: selected.totalAmount,
                          })

                          form.setValue("price", selected.totalAmount)
                          form.setValue("request", selected.title)
                        }}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Choose document type..." />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectGroup>
                            <SelectLabel className="text-gray-600">Available Documents</SelectLabel>
                            {documents.map((d) => (
                              <SelectItem key={d.id} value={String(d.id)}>
                                <div className="flex items-center justify-between w-full">
                                  <span className="font-medium">{d.title}</span>
                                  <Badge className="ml-2">
                                    ₦{Number(d.totalAmount || 0).toLocaleString()}
                                  </Badge>
                                </div>
                              </SelectItem>
                            ))}
                          </SelectGroup>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Type */}
                    <div className="space-y-2">
                      <Label htmlFor="type" className="font-medium">Request Type</Label>
                      <Select
                        value={selectedType}
                        onValueChange={(v) => form.setValue("type", v as RequestForm["type"])}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="internal">
                            <Building2 className="h-4 w-4 mr-2 inline" />
                            Internal (University)
                          </SelectItem>
                          <SelectItem value="external">
                            <Mail className="h-4 w-4 mr-2 inline" />
                            External
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Destination */}
                    <div className="space-y-2">
                      <Label htmlFor="faculty" className="font-medium">Faculty</Label>
                      <Select
                        value={form.watch("facultyId") || ""}
                        onValueChange={(v) => form.setValue("facultyId", v)}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select faculty" />
                        </SelectTrigger>
                        <SelectContent>
                          {faculties.map((f) => (
                            <SelectItem key={f.id} value={String(f.id)}>
                              {f.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* EMail */}
                    <div className="space-y-2">
                      <Label htmlFor="email" className="font-medium">Email (official recipient)</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
                        <Input
                          type="email"
                          className="pl-10"
                          placeholder="Enter university email "
                          {...form.register("email", { required: true })}
                        />
                      </div>
                    </div>

                    {/* Optional address field (for both types) */}
                    <div className="space-y-2 col-span-2">
                      <Label htmlFor="address" className="font-medium">Address (delivery location)</Label>
                      <Textarea
                        id="address"
                        placeholder="Type the university address here."
                        {...form.register("address")}
                      />
                    </div>
                  </div>

                  {/* Price Display */}
                  {form.watch("price") > 0 && (
                    <Card className="border border-blue-100 bg-blue-50">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="space-y-1">
                            <span className="text-sm font-medium text-blue-700">Total Amount</span>
                            <p className="text-xs text-blue-600">
                              Includes processing fee and service charges
                            </p>
                          </div>
                          <div className="text-right">
                            <div className="text-2xl font-bold text-gray-900">
                              {new Intl.NumberFormat("en-US", {
                                style: "currency",
                                currency: "NGN",
                                minimumFractionDigits: 0,
                              }).format(form.watch("price"))}
                            </div>
                            <div className="text-sm text-gray-500">
                              Payable via Paystack
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  <DialogFooter className="gap-2 pt-4">
                    <DialogClose asChild>
                      <Button variant="outline" type="button" className="w-full sm:w-auto">
                        Cancel
                      </Button>
                    </DialogClose>

                    {!paymentData ? (
                      <Button
                        type="submit"
                        disabled={
                          !form.watch("document") ||
                          !form.watch("facultyId") ||
                          !form.watch("email") ||
                          !form.watch("address")
                        }
                        className="w-full sm:w-auto bg-linear-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                      >
                        <CreditCard className="mr-2 h-4 w-4" />
                        Proceed to Payment
                      </Button>
                    ) : (
                      <Button
                        type="button"
                        onClick={handlePayment}
                        className="w-full sm:w-auto bg-linear-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
                      >
                        <CheckCircle className="mr-2 h-4 w-4" />
                        Complete Payment
                      </Button>
                    )}
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          <div className="flex items-center gap-2">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full sm:w-auto ">
              <TabsList className="grid grid-cols-4 w-full sm:w-auto bg-white shadow">
                <TabsTrigger value="all" className="text-xs data-[state=active]:bg-green-800 data-[state=active]:text-white"> All</TabsTrigger>
                <TabsTrigger value="pending" className="text-xs data-[state=active]:bg-green-800 data-[state=active]:text-white">Pending</TabsTrigger>
                <TabsTrigger value="completed" className="text-xs data-[state=active]:bg-green-800 data-[state=active]:text-white">Completed</TabsTrigger>
                <TabsTrigger value="failed" className="text-xs data-[state=active]:bg-green-800 data-[state=active]:text-white">Failed</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          <Card className="border border-gray-200 shadow-sm">
            <CardContent>
              {filteredRequests.length > 0 ? (
                // DATA TABLE
                <DataTable
                  columns={columns}
                  data={filteredRequests}
                  filterColumn="reference"
                  filterPlaceholder="Search by document name or reference…"
                />
              ) : (
                <div className="p-8 text-center">
                  <FileText className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    No {activeTab !== 'all' ? activeTab : ''} requests found
                  </h3>
                  <p className="text-gray-500 mb-4">
                    {activeTab === 'all'
                      ? "You haven't made any document requests yet."
                      : `You don't have any ${activeTab} requests.`}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </>
  )
}