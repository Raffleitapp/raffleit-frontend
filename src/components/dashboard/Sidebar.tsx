import { Dices, LayoutDashboard, LogOut, Settings, Ticket, User, Users, Menu, X, ChartNoAxesCombined, FileChartColumn } from "lucide-react";
import { useState } from "react";
import { useLocation, Link, useNavigate } from "react-router-dom";

// Define user roles
const USER_ROLES = {
    ADMIN: "admin",
    USER: "user",
    HOST: "host",
};

const sidebarItems = [
    { icon: LayoutDashboard, label: "Dashboard", href: "/dashboard", roles: [USER_ROLES.ADMIN, USER_ROLES.USER, USER_ROLES.HOST] },
    { icon: LayoutDashboard, label: "Category", href: "/dashboard/category", roles: [USER_ROLES.ADMIN] },
    { icon: Ticket, label: "Tickets", href: "/dashboard/tickets", roles: [USER_ROLES.ADMIN, USER_ROLES.USER, USER_ROLES.HOST] },
    { icon: Dices, label: "Live Raffles", href: "/dashboard/live-raffles", roles: [USER_ROLES.ADMIN, USER_ROLES.USER] },
    { icon: LayoutDashboard, label: "Completed Raffles", href: "/dashboard/completed-raffles", roles: [USER_ROLES.ADMIN, USER_ROLES.USER] },
    { icon: ChartNoAxesCombined, label: "Analytics", href: "/dashboard/analytics", roles: [USER_ROLES.ADMIN] },
    { icon: FileChartColumn, label: "Reports", href: "/dashboard/reports", roles: [USER_ROLES.ADMIN] },
    { icon: Users, label: "Users", href: "/dashboard/users", roles: [USER_ROLES.ADMIN] },
    { icon: Settings, label: "Settings", href: "/dashboard/settings", roles: [USER_ROLES.ADMIN, USER_ROLES.HOST, USER_ROLES.USER] },
    { icon: User, label: "Profile", href: "/dashboard/profile", roles: [USER_ROLES.ADMIN, USER_ROLES.USER, USER_ROLES.HOST] },
    { icon: LogOut, label: "Logout", href: "#logout", roles: [USER_ROLES.ADMIN, USER_ROLES.USER, USER_ROLES.HOST] },
];

export const Sidebar = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const location = useLocation();
    const navigate = useNavigate();

    const currentUserRole: string = localStorage.getItem('role') || '';

    const handleMenuClick = () => {
        if (window.innerWidth < 768) {
            setIsSidebarOpen(false);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('role');
        navigate('/'); // Redirect to home page after logout
    };

    const filteredSidebarItems = sidebarItems.filter(item =>
        item.roles.includes(currentUserRole)
    );

    return (
        <>
            {/* Toggle Button - Removed redundant h-screen */}
            <button
                className={`fixed z-1000 top-3 left-3 z-50 p-2 rounded md:hidden transition-colors duration-300 ${isSidebarOpen ? "bg-white text-blue-900" : "bg-blue-900 text-white"}`}
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            >
                {isSidebarOpen ? <X size={24} className="text-bold" /> : <Menu size={24} />}
            </button>

            {/* Sidebar */}
            <div
                // Removed redundant 'h-screen' and 'md:relative' for consistent fixed behavior
                className={`fixed z-100 top-0 left-0 h-screen bg-blue-900 px-6 py-6 shadow-md transform transition-transform duration-300 ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"
                    } md:translate-x-0 w-64`}
            >
                <h2 className="text-xl font-bold mb-4 text-white">Raffleit</h2>
                <ul className="list-none">
                    {filteredSidebarItems.map(({ icon: Icon, label, href }, index) => {
                        const isActive = location.pathname === href;
                        if (label === "Logout") {
                            return (
                                <li
                                    key={index}
                                    className="mb-2 mt-2 gap-2 flex items-center p-2 rounded-md transition-colors duration-200 group hover:bg-white hover:text-blue-900 cursor-pointer"
                                    onClick={() => {
                                        handleMenuClick();
                                        handleLogout();
                                    }}
                                >
                                    <Icon className="text-white group-hover:text-blue-900" size={18} />
                                    <span className="md:inline-block ml-2 text-white group-hover:text-blue-900">
                                        {label}
                                    </span>
                                </li>
                            );
                        }
                        return (
                            <Link
                                key={index}
                                to={href}
                                className={`mb-2 mt-2 gap-2 flex items-center p-2 rounded-md transition-colors duration-200 group ${isActive ? "bg-white text-blue-900" : "hover:bg-white hover:text-blue-900"}`}
                                onClick={handleMenuClick}
                            >
                                <Icon className={`${isActive ? "text-blue-900" : "text-white"} group-hover:text-blue-900`} size={18} />
                                <span className={`md:inline-block ml-2 ${isActive ? "text-blue-900" : "text-white"} group-hover:text-blue-900`}>
                                    {label}
                                </span>
                            </Link>
                        );
                    })}
                </ul>
            </div>
        </>
    );
};