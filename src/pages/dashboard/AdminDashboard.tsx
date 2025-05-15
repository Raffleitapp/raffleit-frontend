import { Outlet } from "react-router-dom"
import { Sidebar } from "../../components/dashboard/Sidebar"
import DashboardNavbar from "../../components/dashboard/DashboardNavbar"

export const AdminDashboard = () => {
    return (
        <>
            <div className="flex min-h-screen h-screen md:h-screen bg-gray-100">
                <Sidebar />
                {/* Main Content */}
                <div className="py-4 px-4">
                    <DashboardNavbar />
                    {<Outlet />}
                </div>
            </div>
        </>
    )
}
