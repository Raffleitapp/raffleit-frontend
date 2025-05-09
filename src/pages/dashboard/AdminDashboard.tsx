import { Outlet } from "react-router-dom"
import { Sidebar } from "../../components/dashboard/Sidebar"

export const AdminDashboard = () => {
    return (
        <>
            <div className="flex min-h-screen h-screen md:h-screen bg-gray-100">
                <Sidebar />
                <Outlet />
            </div>
        </>
    )
}
