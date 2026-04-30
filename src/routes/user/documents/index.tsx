import { SiteHeader } from '@/components/site-header'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/user/documents/')({
    component: RouteComponent,
})

function RouteComponent() {
    return (
        <>
            <SiteHeader title="Documents" />
            <main>

            </main>
        </>
    )
}
