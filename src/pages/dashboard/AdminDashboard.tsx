import { Outlet } from "react-router-dom"
import { Sidebar } from "../../components/dashboard/Sidebar"
import DashboardNavbar from "../../components/dashboard/DashboardNavbar"

export const AdminDashboard = () => {
    return (
        <>
            <Sidebar />
            <DashboardNavbar />

            <main className="md:ml-64 pt-16 min-h-screen bg-gray-100 overflow-y-auto">
                <div className="py-4 px-4">
                    {<Outlet />}
                </div>
            </main>
        </>
    )
}