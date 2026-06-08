import IsPending from '@/components/Illustrations/isPending'
import { SiteHeader } from '@/components/site-header'
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
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { getActivities, type Activity } from '@/service'
import { useQueries } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import type { ColumnDef } from '@tanstack/react-table'
import {
    ArrowUpDown,
    Calendar,
    MoreHorizontal,
    Search,
    Filter,
    Download,
    RefreshCw,
    Shield,
    User,
    Server,
    Activity as ActivityIcon,
    Eye,
    Edit,
    Trash2,
    LogIn,
    LogOut,
    SquareActivity,
} from 'lucide-react'
import { useState } from 'react'
import { DataTable } from '@/components/table'

export const Route = createFileRoute('/power/activity/')({
    component: RouteComponent,
})

function RouteComponent() {
    const [searchParams, setSearchParams] = useState({
        page: '1',
        limit: '10',
        action: '',
        entity: '',
        actorType: '',
        dateRange: '',
        search: '',
    })

    const queryString = new URLSearchParams({
        page: searchParams.page,
        limit: searchParams.limit,
        ...(searchParams.action && searchParams.action !== 'all' && { action: searchParams.action }),
        ...(searchParams.entity && searchParams.entity !== 'all' && { entity: searchParams.entity }),
        ...(searchParams.actorType && searchParams.actorType !== 'all' && { actorType: searchParams.actorType }),
        ...(searchParams.dateRange && { dateRange: searchParams.dateRange }),
        ...(searchParams.search && { search: searchParams.search }),
    }).toString()

    const results = useQueries({
        queries: [
            {
                queryKey: ['activities', queryString],
                queryFn: () => getActivities(queryString),
                staleTime: 30_000,
            },
        ],
    })

    const [activityQuery] = results
    const activities = activityQuery.data?.data ?? []

    if (activityQuery.isPending) {
        return <IsPending page='Logs' />
    }

    const getActionIcon = (action: string) => {
        const iconMap: Record<string, any> = {
            VIEW: Eye,
            CREATE: Edit,
            UPDATE: Edit,
            DELETE: Trash2,
            LOGIN: LogIn,
            LOGOUT: LogOut,
        }
        const Icon = iconMap[action] || ActivityIcon
        return <Icon className="h-3 w-3" />
    }

    const getActionVariant = (action: string): 'default' | 'secondary' | 'destructive' | 'outline' => {
        const variantMap: Record<string, any> = {
            VIEW: 'secondary',
            CREATE: 'default',
            UPDATE: 'default',
            DELETE: 'destructive',
            LOGIN: 'default',
            LOGOUT: 'secondary',
        }
        return variantMap[action] || 'secondary'
    }

    const getActionBadge = (action: string) => {
        return (
            <Badge variant={getActionVariant(action)} className="gap-1 px-2 py-1">
                {getActionIcon(action)}
                <span>{action}</span>
            </Badge>
        )
    }

    const getEntityIcon = (entity: string) => {
        const entityMap: Record<string, any> = {
            USER: User,
            ADMIN: Shield,
            SERVER: Server,
        }
        const Icon = entityMap[entity] || ActivityIcon
        return <Icon className="h-4 w-4" />
    }

    const getEntityColor = (entity: string) => {
        const colorMap: Record<string, string> = {
            USER: 'text-blue-600',
            ADMIN: 'text-purple-600',
            SERVER: 'text-green-600',
        }
        return colorMap[entity] || 'text-gray-600'
    }

    const getActorTypeBadge = (actorType: string) => {
        const typeMap: Record<string, { icon: any, color: string }> = {
            'Super Admin': { icon: Shield, color: 'bg-purple-100 text-purple-700 border-purple-200' },
            Admin: { icon: Shield, color: 'bg-indigo-100 text-indigo-700 border-indigo-200' },
            User: { icon: User, color: 'bg-blue-100 text-blue-700 border-blue-200' },
            System: { icon: Server, color: 'bg-gray-100 text-gray-700 border-gray-200' },
        }
        const config = typeMap[actorType] || { icon: User, color: 'bg-gray-100 text-gray-700 border-gray-200' }
        const Icon = config.icon
        return (
            <Badge variant="outline" className={"gap-1 ${config.color}"}>
                <Icon className="h-3 w-3" />
                <span>{actorType}</span>
            </Badge>
        )
    }

    const columns: ColumnDef<Activity>[] = [
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
            accessorKey: 'action',
            header: ({ column }) => (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
                    className="font-semibold hover:bg-gray-50"
                >
                    Action
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            ),
            cell: ({ row }) => getActionBadge(row.getValue('action')),
        },
        {
            accessorKey: 'entity',
            header: ({ column }) => (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
                    className="font-semibold hover:bg-gray-50"
                >
                    Entity
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            ),
            cell: ({ row }) => {
                const entity = row.getValue('entity') as string

                return (
                    <div className={`flex items-center gap-2 ${getEntityColor(entity)}`}>
                        {getEntityIcon(entity)}
                        <span className="font-medium capitalize">
                            {entity.toLowerCase()}
                        </span>
                    </div>
                )
            },
        },
        {
            accessorKey: 'actorType',
            header: 'Actor',
            cell: ({ row }) => {
                const actorType = row.getValue('actorType') as string
                const actorId = row.original.actor

                return (
                    <div className="flex flex-col gap-1">
                        {getActorTypeBadge(actorType)}

                        <span className="text-xs text-gray-500">
                            Actor ID: {actorId}
                        </span>
                    </div>
                )
            },
        },
        {
            accessorKey: 'description',
            header: 'Description',
            cell: ({ row }) => {
                const description = row.getValue('description') as string

                return (
                    <div className="max-w-[400px] whitespace-normal break-words text-sm text-gray-700">
                        {description || '—'}
                    </div>
                )
            },
        },
        {
            accessorKey: 'createdAt',
            header: () => (
                <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-gray-500" />
                    <span>Timestamp</span>
                </div>
            ),
            cell: ({ row }) => {
                const dateString = row.getValue('createdAt') as string

                if (!dateString) {
                    return <div className="text-gray-400">—</div>
                }

                const date = new Date(dateString)

                return (
                    <div className="flex flex-col">
                        <span className="text-sm font-medium">
                            {date.toLocaleDateString()}
                        </span>

                        <span className="text-xs text-gray-500">
                            {date.toLocaleTimeString()}
                        </span>
                    </div>
                )
            },
        },
        {
            id: 'actions',
            enableHiding: false,
            cell: ({ row }) => {
                const log = row.original
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
                        <DropdownMenuContent align="end" className="w-56">
                            <DropdownMenuLabel className="text-xs font-semibold text-gray-600">
                                Log Actions
                            </DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                                onClick={() => navigator.clipboard.writeText(log.id.toString())}
                                className="cursor-pointer gap-2"
                            >
                                Copy Log ID
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                onClick={() => navigator.clipboard.writeText(log.description)}
                                className="cursor-pointer gap-2"
                            >
                                Copy Description
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                onClick={() => navigator.clipboard.writeText(JSON.stringify(log, null, 2))}
                                className="cursor-pointer gap-2"
                            >
                                Copy Full Details
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                                className="text-red-600 cursor-pointer gap-2 focus:text-red-600"
                            >
                                Delete Log
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                )
            },
        },
    ]

    const handleFilterChange = (key: string, value: string) => {
        setSearchParams(prev => ({ ...prev, [key]: value, page: '1' }))
    }

    const handleRefresh = () => {
        activityQuery.refetch()
    }

    const handleExport = () => {
        const csvContent = [
            ['ID', 'Action', 'Entity', 'Description', 'Actor Type', 'Actor ID', 'Created At'],
            ...activities.map((log: any) => [
                log.id,
                log.action,
                log.entity,
                log.description,
                log.actorType,
                log.actorId,
                new Date(log.createdAt).toLocaleString(),
            ])
        ].map(row => row.join(',')).join('\n')

        const blob = new Blob([csvContent], { type: 'text/csv' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `logs-${new Date().toISOString().split(`T`)[0]}.csv`
        a.click()
        URL.revokeObjectURL(url)
    }

    const handleClearFilters = () => {
        setSearchParams({
            page: '1',
            limit: '10',
            action: '',
            entity: '',
            actorType: '',
            dateRange: '',
            search: '',
        })
    }


    return (
        <>
            <SiteHeader title='Activity Logs' />
            <main className='min-h-screen p-4 lg:p-6 bg-gradient-to-br from-gray-50 to-gray-100'>
                <div className="space-y-6">

                    {/* Filters Section */}
                    <Card className="shadow-sm">
                        <CardContent className="p-6">
                            <div className="flex flex-col gap-4">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <Filter className="h-5 w-5 text-gray-500" />
                                        <h3 className="text-lg font-semibold text-gray-900">Filters</h3>
                                    </div>
                                    <div className="flex gap-2">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={handleClearFilters}
                                            className="gap-2"
                                        >
                                            Clear All
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={handleRefresh}
                                            className="gap-2"
                                        >
                                            <RefreshCw className="h-4 w-4" />
                                            Refresh
                                        </Button>
                                        <Button
                                            variant="default"
                                            size="sm"
                                            onClick={handleExport}
                                            className="gap-2"
                                        >
                                            <Download className="h-4 w-4" />
                                            Export CSV
                                        </Button>
                                    </div>
                                </div>

                                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                                    <div className="space-y-2">
                                        <Label className="text-sm font-medium">Action Type</Label>
                                        <Select
                                            value={searchParams.action || 'all'}
                                            onValueChange={(value) => handleFilterChange('action', value === 'all' ? '' : value)}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="All actions" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="all">All actions</SelectItem>
                                                <SelectItem value="VIEW">View</SelectItem>
                                                <SelectItem value="CREATE">Create</SelectItem>
                                                <SelectItem value="UPDATE">Update</SelectItem>
                                                <SelectItem value="DELETE">Delete</SelectItem>
                                                <SelectItem value="LOGIN">Login</SelectItem>
                                                <SelectItem value="LOGOUT">Logout</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div className="space-y-2">
                                        <Label className="text-sm font-medium">Entity Type</Label>
                                        <Select
                                            value={searchParams.entity || 'all'}
                                            onValueChange={(value) => handleFilterChange('entity', value === 'all' ? '' : value)}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="All entities" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="all">All entities</SelectItem>
                                                <SelectItem value="USER">User</SelectItem>
                                                <SelectItem value="ADMIN">Admin</SelectItem>
                                                <SelectItem value="SERVER">Server</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div className="space-y-2">
                                        <Label className="text-sm font-medium">Actor Type</Label>
                                        <Select
                                            value={searchParams.actorType || 'all'}
                                            onValueChange={(value) => handleFilterChange('actorType', value === 'all' ? '' : value)}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="All actors" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="all">All actors</SelectItem>
                                                <SelectItem value="Super Admin">Super Admin</SelectItem>
                                                <SelectItem value="Admin">Admin</SelectItem>
                                                <SelectItem value="User">User</SelectItem>
                                                <SelectItem value="System">System</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div className="space-y-2">
                                        <Label className="text-sm font-medium">Date Range</Label>
                                        <Select
                                            value={searchParams.dateRange || 'all'}
                                            onValueChange={(value) =>
                                                handleFilterChange('dateRange', value === 'all' ? '' : value)
                                            }
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select range" />
                                            </SelectTrigger>

                                            <SelectContent>
                                                <SelectItem value="all">All time</SelectItem>
                                                <SelectItem value="today">Today</SelectItem>
                                                <SelectItem value="yesterday">Yesterday</SelectItem>
                                                <SelectItem value="last7">Last 7 days</SelectItem>
                                                <SelectItem value="last30">Last 30 days</SelectItem>
                                                <SelectItem value="last90">Last 90 days</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>

                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                                    <Input
                                        placeholder="Search logs by action, entity, description..."
                                        className="pl-9"
                                        value={searchParams.search}
                                        onChange={(e) => handleFilterChange('search', e.target.value)}
                                    />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Data Table */}
                    <div className="p-4 shadow rounded-2xl bg-white">
                        <DataTable
                            columns={columns}
                            data={activities ?? []}
                            filterColumn=""
                            recordName='ACTIVITY'
                            recordIcon={<SquareActivity className="h-20 w-20" />}
                        />
                    </div>
                </div>
            </main>
        </>
    )
}