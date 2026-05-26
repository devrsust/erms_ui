import { SiteHeader } from "@/components/site-header"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { createFileRoute } from "@tanstack/react-router"
import { Shield } from "lucide-react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { useForm } from "react-hook-form"
import { toast } from "sonner"

import { getProfile, updateProfile, changePassword } from "@/service"

export const Route = createFileRoute("/admin/account")({
    component: Account,
})

type ProfileForm = {
    firstname: string
    lastname: string
    email: string
    bio?: string
}

type PasswordForm = {
    currentPassword: string
    newPassword: string
    confirmPassword: string
}

function Account() {
    const queryClient = useQueryClient()

    const { data: profileData, isLoading } = useQuery({
        queryKey: ["profile"],
        queryFn: getProfile,
    })

    const profile = profileData?.data

    const profileForm = useForm<ProfileForm>({
        values: profile
            ? {
                firstname: profile.firstname || "",
                lastname: profile.lastname || "",
                email: profile.email || "",
                bio: profile.bio || "",
            }
            : {
                firstname: "",
                lastname: "",
                email: "",
                bio: "",
            },
    })

    const passwordForm = useForm<PasswordForm>({
        defaultValues: {
            currentPassword: "",
            newPassword: "",
            confirmPassword: "",
        },
    })

    const updateProfileMutation = useMutation({
        mutationFn: (data: ProfileForm) => updateProfile(data),
        onSuccess: () => {
            toast.success("Profile updated successfully")
            queryClient.invalidateQueries({ queryKey: ["profile"] })
        },
        onError: (error: any) => {
            toast.error(error?.response?.data?.message || "Failed to update profile")
        },
    })

    const changePasswordMutation = useMutation({
        mutationFn: (data: { currentPassword: string; newPassword: string }) =>
            changePassword(data),
        onSuccess: () => {
            toast.success("Password updated successfully")
            passwordForm.reset()
        },
        onError: (error: any) => {
            toast.error(error?.response?.data?.message || "Failed to update password")
        },
    })

    const onUpdateProfile = (data: ProfileForm) => {
        updateProfileMutation.mutate(data)
    }

    const onChangePassword = (data: PasswordForm) => {
        if (data.newPassword !== data.confirmPassword) {
            toast.error("Passwords do not match")
            return
        }

        if (data.newPassword.length < 6) {
            toast.error("Password must be at least 6 characters")
            return
        }

        changePasswordMutation.mutate({
            currentPassword: data.currentPassword,
            newPassword: data.newPassword,
        })
    }

    if (isLoading) {
        return (
            <>
                <SiteHeader title="Account" />
                <main className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 p-4 lg:p-6">
                    <div className="mx-auto max-w-5xl space-y-8">
                        <div className="space-y-1">
                            <h1 className="text-3xl font-bold tracking-tight text-slate-900">
                                Account Settings
                            </h1>
                            <p className="text-sm text-slate-500">
                                Loading your account information...
                            </p>
                        </div>
                    </div>
                </main>
            </>
        )
    }

    return (
        <>
            <SiteHeader title="Account" />

            <main className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 p-4 lg:p-6">
                <div className="mx-auto max-w-5xl space-y-8">

                    {/* Header */}
                    <div className="space-y-1">
                        <h1 className="text-3xl font-bold tracking-tight text-slate-900">
                            Account Settings
                        </h1>
                        <p className="text-sm text-slate-500">
                            Manage your profile, security, and preferences
                        </p>
                    </div>

                    {/* Profile Section */}
                    <section className="rounded-xl border bg-white p-6 space-y-6 shadow-sm">
                        <div className="flex items-center justify-between">
                            <h2 className="text-lg font-semibold text-slate-900">
                                Personal Information
                            </h2>

                            <Button
                                variant="default"
                                size="sm"
                                onClick={profileForm.handleSubmit(onUpdateProfile)}
                                disabled={updateProfileMutation.isPending}
                                className="bg-green-800 hover:bg-green-900"
                            >
                                {updateProfileMutation.isPending ? "Saving..." : "Save Changes"}
                            </Button>
                        </div>

                        <div className="grid gap-6 md:grid-cols-2">
                            <div className="space-y-2">
                                <Label htmlFor="firstname">First Name</Label>
                                <Input
                                    id="firstname"
                                    {...profileForm.register("firstname")}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="lastname">Last Name</Label>
                                <Input
                                    id="lastname"
                                    {...profileForm.register("lastname")}
                                />
                            </div>

                            <div className="space-y-2 md:col-span-2">
                                <Label htmlFor="email">Email Address</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    {...profileForm.register("email")}
                                />
                            </div>

                            <div className="space-y-2 md:col-span-2">
                                <Label htmlFor="bio">Bio</Label>
                                <Textarea
                                    id="bio"
                                    rows={4}
                                    placeholder="Tell us a little about yourself..."
                                    {...profileForm.register("bio")}
                                />
                            </div>
                        </div>
                    </section>

                    {/* Security Section */}
                    <section className="rounded-xl border bg-white p-6 space-y-6 shadow-sm">
                        <div className="flex items-center justify-between">
                            <h2 className="text-lg font-semibold text-slate-900">
                                Security
                            </h2>
                            <Shield className="h-5 w-5 text-slate-400" />
                        </div>

                        <form
                            onSubmit={passwordForm.handleSubmit(onChangePassword)}
                            className="grid gap-6 md:grid-cols-2"
                        >
                            <div className="space-y-2 md:col-span-2">
                                <Label htmlFor="currentPassword">Current Password</Label>
                                <Input
                                    id="currentPassword"
                                    type="password"
                                    {...passwordForm.register("currentPassword", { required: "Current password is required" })}
                                />
                                {passwordForm.formState.errors.currentPassword && (
                                    <p className="text-xs text-red-600">
                                        {passwordForm.formState.errors.currentPassword.message}
                                    </p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="newPassword">New Password</Label>
                                <Input
                                    id="newPassword"
                                    type="password"
                                    {...passwordForm.register("newPassword", {
                                        required: "New password is required",
                                        minLength: {
                                            value: 6,
                                            message: "Password must be at least 6 characters"
                                        }
                                    })}
                                />
                                {passwordForm.formState.errors.newPassword && (
                                    <p className="text-xs text-red-600">
                                        {passwordForm.formState.errors.newPassword.message}
                                    </p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="confirmPassword">Confirm Password</Label>
                                <Input
                                    id="confirmPassword"
                                    type="password"
                                    {...passwordForm.register("confirmPassword", {
                                        required: "Please confirm your password"
                                    })}
                                />
                                {passwordForm.formState.errors.confirmPassword && (
                                    <p className="text-xs text-red-600">
                                        {passwordForm.formState.errors.confirmPassword.message}
                                    </p>
                                )}
                            </div>

                            <div className="flex justify-end md:col-span-2">
                                <Button
                                    type="submit"
                                    disabled={changePasswordMutation.isPending}
                                    className="bg-green-800 hover:bg-green-900"
                                >
                                    {changePasswordMutation.isPending ? "Updating..." : "Update Password"}
                                </Button>
                            </div>
                        </form>
                    </section>

                </div>
            </main>
        </>
    )
}