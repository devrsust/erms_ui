import { SiteHeader } from "@/components/site-header"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { createFileRoute } from "@tanstack/react-router"
import {
    Bell,
    Camera,
    KeyRound,
    LogOut,
    Mail,
    Shield,
    Smartphone,
    User2,
    Users,
} from "lucide-react"
import { useState } from "react"

export const Route = createFileRoute("/dashboard/account")({
    component: Account,
})

function Account() {
    const [activeTab, setActiveTab] = useState("profile")

    const navItems = [
        { id: "profile", label: "Profile", icon: User2 },
        { id: "security", label: "Security", icon: Shield },
        { id: "notifications", label: "Notifications", icon: Bell },
        { id: "password", label: "Password", icon: KeyRound },
    ]

    return (
        <>
            <SiteHeader title="Account" />

            <main className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 p-4 lg:p-6">
                <div className="mx-auto flex max-w-6xl flex-col gap-6">
                    {/* Header */}
                    <div className="flex flex-col gap-1">
                        <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
                            Account Settings
                        </h1>
                        <p className="text-muted-foreground">
                            Manage your profile, security preferences, and account settings
                        </p>
                    </div>

                    <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
                        {/* Profile Sidebar */}
                        <Card className="border-0 shadow-lg shadow-slate-200/50 rounded-2xl overflow-hidden sticky top-6 h-fit">
                            <CardContent className="p-6">
                                <div className="flex flex-col items-center text-center">
                                    <div className="relative group">
                                        <Avatar className="h-28 w-28 rounded-full ring-4 ring-white shadow-xl">
                                            <AvatarImage src="/avatars/admin.jpg" />
                                            <AvatarFallback className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white text-2xl font-bold">
                                                JD
                                            </AvatarFallback>
                                        </Avatar>
                                        <Button
                                            size="icon"
                                            variant="secondary"
                                            className="absolute -bottom-2 -right-2 h-9 w-9 rounded-full shadow-md border-2 border-white hover:scale-105 transition-transform"
                                        >
                                            <Camera className="h-4 w-4" />
                                        </Button>
                                    </div>

                                    <div className="mt-5 space-y-1">
                                        <h2 className="text-xl font-bold">John Doe</h2>
                                        <p className="text-sm text-muted-foreground">
                                            john.doe@system.com
                                        </p>
                                        <Badge className="mt-2 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 px-3 py-0.5 text-xs font-medium shadow-sm">
                                            Super Admin
                                        </Badge>
                                    </div>
                                </div>

                                <Separator className="my-6" />

                                {/* Stats */}
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-muted-foreground">Member since</span>
                                        <span className="font-medium">Jan 2024</span>
                                    </div>
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-muted-foreground">Last login</span>
                                        <span className="font-medium">2 hours ago</span>
                                    </div>
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-muted-foreground">Devices</span>
                                        <span className="font-medium">3 active</span>
                                    </div>
                                </div>

                                <Separator className="my-6" />

                                {/* Logout Button */}
                                <Button variant="ghost" className="w-full justify-start text-red-500 hover:text-red-600 hover:bg-red-50 rounded-xl">
                                    <LogOut className="mr-2 h-4 w-4" />
                                    Sign Out
                                </Button>
                            </CardContent>
                        </Card>

                        {/* Main Content with Vertical Tabs */}
                        <Card className="border-0 shadow-lg shadow-slate-200/50 rounded-2xl overflow-hidden">
                            <CardContent className="p-0">
                                <Tabs
                                    value={activeTab}
                                    onValueChange={setActiveTab}
                                    className="flex flex-col md:flex-row"
                                >
                                    {/* Vertical Tabs List */}
                                    <div className="border-b md:border-b-0 md:border-r bg-gradient-to-b from-white to-slate-50/50 md:w-56">
                                        <TabsList className="flex h-auto flex-row justify-start gap-1 bg-transparent p-4 md:flex-col">
                                            {navItems.map((item) => {
                                                const Icon = item.icon
                                                return (
                                                    <TabsTrigger
                                                        key={item.id}
                                                        value={item.id}
                                                        className="justify-start gap-3 rounded-xl px-4 py-2.5 text-sm font-medium data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:shadow-slate-200 data-[state=active]:text-slate-900 transition-all duration-200"
                                                    >
                                                        <Icon className="h-4 w-4" />
                                                        {item.label}
                                                    </TabsTrigger>
                                                )
                                            })}
                                        </TabsList>
                                    </div>

                                    {/* Tab Content */}
                                    <div className="flex-1 p-6 md:p-8">
                                        {/* Profile Tab */}
                                        <TabsContent value="profile" className="mt-0 space-y-6">
                                            <div>
                                                <h3 className="text-xl font-semibold tracking-tight">
                                                    Personal Information
                                                </h3>
                                                <p className="text-sm text-muted-foreground mt-1">
                                                    Update your profile details and public information
                                                </p>
                                            </div>

                                            <div className="grid gap-5 md:grid-cols-2">
                                                <div className="space-y-2">
                                                    <Label className="text-sm font-medium">First Name</Label>
                                                    <Input
                                                        placeholder="John"
                                                        defaultValue="John"
                                                        className="rounded-xl border-slate-200 focus:ring-2 focus:ring-blue-500/20"
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label className="text-sm font-medium">Last Name</Label>
                                                    <Input
                                                        placeholder="Doe"
                                                        defaultValue="Doe"
                                                        className="rounded-xl border-slate-200 focus:ring-2 focus:ring-blue-500/20"
                                                    />
                                                </div>
                                                <div className="space-y-2 md:col-span-2">
                                                    <Label className="text-sm font-medium">Email Address</Label>
                                                    <Input
                                                        type="email"
                                                        defaultValue="john.doe@system.com"
                                                        className="rounded-xl border-slate-200 bg-slate-50"
                                                        readOnly
                                                    />
                                                    <p className="text-xs text-muted-foreground">
                                                        Email cannot be changed. Contact support for assistance.
                                                    </p>
                                                </div>
                                                <div className="space-y-2 md:col-span-2">
                                                    <Label className="text-sm font-medium">Bio</Label>
                                                    <Textarea
                                                        placeholder="Tell us about yourself..."
                                                        className="min-h-[120px] rounded-xl border-slate-200 resize-none"
                                                    />
                                                </div>
                                            </div>

                                            <Separator />

                                            <div className="flex justify-end">
                                                <Button className="rounded-xl px-8 bg-gradient-to-r from-slate-900 to-slate-800 hover:from-slate-800 hover:to-slate-700 shadow-md transition-all duration-200">
                                                    Save Changes
                                                </Button>
                                            </div>
                                        </TabsContent>

                                        {/* Security Tab */}
                                        <TabsContent value="security" className="mt-0 space-y-6">
                                            <div>
                                                <h3 className="text-xl font-semibold tracking-tight">
                                                    Security Settings
                                                </h3>
                                                <p className="text-sm text-muted-foreground mt-1">
                                                    Manage your account security and connected devices
                                                </p>
                                            </div>

                                            <div className="space-y-4">
                                                {/* 2FA Card */}
                                                <Card className="rounded-xl border-slate-200 shadow-sm hover:shadow-md transition-all duration-200">
                                                    <CardContent className="flex items-center justify-between p-5">
                                                        <div className="flex gap-4">
                                                            <div className="h-10 w-10 rounded-xl bg-blue-50 flex items-center justify-center">
                                                                <Shield className="h-5 w-5 text-blue-600" />
                                                            </div>
                                                            <div>
                                                                <h4 className="font-semibold">Two-Factor Authentication</h4>
                                                                <p className="text-sm text-muted-foreground">
                                                                    Add an extra layer of security to your account
                                                                </p>
                                                            </div>
                                                        </div>
                                                        <Button variant="outline" className="rounded-xl border-blue-200 text-blue-600 hover:bg-blue-50">
                                                            Enable
                                                        </Button>
                                                    </CardContent>
                                                </Card>

                                                {/* Sessions Card */}
                                                <Card className="rounded-xl border-slate-200 shadow-sm hover:shadow-md transition-all duration-200">
                                                    <CardContent className="flex items-center justify-between p-5">
                                                        <div className="flex gap-4">
                                                            <div className="h-10 w-10 rounded-xl bg-purple-50 flex items-center justify-center">
                                                                <Smartphone className="h-5 w-5 text-purple-600" />
                                                            </div>
                                                            <div>
                                                                <h4 className="font-semibold">Active Sessions</h4>
                                                                <p className="text-sm text-muted-foreground">
                                                                    Manage devices currently signed into your account
                                                                </p>
                                                            </div>
                                                        </div>
                                                        <Button variant="outline" className="rounded-xl">
                                                            View All
                                                        </Button>
                                                    </CardContent>
                                                </Card>

                                                {/* Login History */}
                                                <Card className="rounded-xl border-slate-200 shadow-sm hover:shadow-md transition-all duration-200">
                                                    <CardContent className="flex items-center justify-between p-5">
                                                        <div className="flex gap-4">
                                                            <div className="h-10 w-10 rounded-xl bg-slate-100 flex items-center justify-center">
                                                                <Users className="h-5 w-5 text-slate-600" />
                                                            </div>
                                                            <div>
                                                                <h4 className="font-semibold">Login History</h4>
                                                                <p className="text-sm text-muted-foreground">
                                                                    Review recent login attempts and activities
                                                                </p>
                                                            </div>
                                                        </div>
                                                        <Button variant="outline" className="rounded-xl">
                                                            Review
                                                        </Button>
                                                    </CardContent>
                                                </Card>
                                            </div>
                                        </TabsContent>

                                        {/* Notifications Tab */}
                                        <TabsContent value="notifications" className="mt-0 space-y-6">
                                            <div>
                                                <h3 className="text-xl font-semibold tracking-tight">
                                                    Notification Preferences
                                                </h3>
                                                <p className="text-sm text-muted-foreground mt-1">
                                                    Choose how and when you receive updates
                                                </p>
                                            </div>

                                            <div className="space-y-6">
                                                {/* Email Notifications */}
                                                <div className="flex items-center justify-between p-4 rounded-xl bg-white border border-slate-200 shadow-sm">
                                                    <div className="flex gap-4">
                                                        <div className="h-10 w-10 rounded-xl bg-sky-50 flex items-center justify-center">
                                                            <Mail className="h-5 w-5 text-sky-600" />
                                                        </div>
                                                        <div>
                                                            <h4 className="font-semibold">Email Notifications</h4>
                                                            <p className="text-sm text-muted-foreground">
                                                                Receive account updates and security alerts via email
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <Switch defaultChecked className="data-[state=checked]:bg-slate-900" />
                                                </div>

                                                {/* Push Notifications */}
                                                <div className="flex items-center justify-between p-4 rounded-xl bg-white border border-slate-200 shadow-sm">
                                                    <div className="flex gap-4">
                                                        <div className="h-10 w-10 rounded-xl bg-orange-50 flex items-center justify-center">
                                                            <Bell className="h-5 w-5 text-orange-600" />
                                                        </div>
                                                        <div>
                                                            <h4 className="font-semibold">Push Notifications</h4>
                                                            <p className="text-sm text-muted-foreground">
                                                                Receive real-time alerts in your browser
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <Switch />
                                                </div>

                                                {/* Announcements */}
                                                <div className="flex items-center justify-between p-4 rounded-xl bg-white border border-slate-200 shadow-sm">
                                                    <div className="flex gap-4">
                                                        <div className="h-10 w-10 rounded-xl bg-emerald-50 flex items-center justify-center">
                                                            <Users className="h-5 w-5 text-emerald-600" />
                                                        </div>
                                                        <div>
                                                            <h4 className="font-semibold">Product Announcements</h4>
                                                            <p className="text-sm text-muted-foreground">
                                                                Get updates about new features and improvements
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <Switch defaultChecked />
                                                </div>
                                            </div>
                                        </TabsContent>

                                        {/* Password Tab */}
                                        <TabsContent value="password" className="mt-0 space-y-6">
                                            <div>
                                                <h3 className="text-xl font-semibold tracking-tight">
                                                    Change Password
                                                </h3>
                                                <p className="text-sm text-muted-foreground mt-1">
                                                    Update your password to keep your account secure
                                                </p>
                                            </div>

                                            <div className="space-y-5">
                                                <div className="space-y-2">
                                                    <Label className="text-sm font-medium">Current Password</Label>
                                                    <Input
                                                        type="password"
                                                        placeholder="Enter your current password"
                                                        className="rounded-xl border-slate-200 focus:ring-2 focus:ring-blue-500/20"
                                                    />
                                                </div>

                                                <div className="space-y-2">
                                                    <Label className="text-sm font-medium">New Password</Label>
                                                    <Input
                                                        type="password"
                                                        placeholder="Create a new password"
                                                        className="rounded-xl border-slate-200 focus:ring-2 focus:ring-blue-500/20"
                                                    />
                                                    <p className="text-xs text-muted-foreground">
                                                        Password must be at least 8 characters with 1 number and 1 symbol
                                                    </p>
                                                </div>

                                                <div className="space-y-2">
                                                    <Label className="text-sm font-medium">Confirm Password</Label>
                                                    <Input
                                                        type="password"
                                                        placeholder="Confirm your new password"
                                                        className="rounded-xl border-slate-200 focus:ring-2 focus:ring-blue-500/20"
                                                    />
                                                </div>
                                            </div>

                                            <Separator />

                                            <div className="flex justify-end">
                                                <Button className="rounded-xl px-8 bg-gradient-to-r from-slate-900 to-slate-800 hover:from-slate-800 hover:to-slate-700 shadow-md transition-all duration-200">
                                                    Update Password
                                                </Button>
                                            </div>
                                        </TabsContent>
                                    </div>
                                </Tabs>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </main>
        </>
    )
}