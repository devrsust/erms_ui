import { SiteHeader } from '../site-header'

interface IsPendingProps {
    page: string;
}

const IsPending = ({ page }: IsPendingProps) => {
    return (
        <>
            <SiteHeader title={page} />
            <main className="min-h-screen p-4 lg:p-6 bg-gray-50 flex items-center justify-center">
                <div className="text-center space-y-4">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto" />
                    <p className="text-gray-600">Loading {page}</p>
                </div>
            </main>
        </>
    )
}

export default IsPending