import { Sidebar } from "../../components/dashboard/Sidebar"

export const AdminDashboard = () => {
    return (
        <>
            <div className="flex min-h-screen h-screen md:h-screen bg-gray-100">
                <Sidebar />
                <div className="flex-1 p-6">
                    <h1 className="text-2xl font-bold mb-4">Admin Dashboard</h1>
                    <p>Welcome to the admin dashboard. Here you can manage your application.</p>
                    <div className="mt-4">
                        <h2 className="text-xl font-semibold">Statistics</h2>
                        <p>Here you can view the statistics of your application.</p>
                    </div>
                </div>
            </div>
        </>
    )
}
