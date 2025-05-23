import { Dices, LayoutDashboard, LogOut, Settings, Ticket, User, Users, Menu, X } from "lucide-react";
import { useState } from "react";
import { useLocation, Link } from "react-router-dom";

const sidebarItems = [
    { icon: LayoutDashboard, label: "Dashboard", href: "/dashboard" },
    { icon: LayoutDashboard, label: "Category", href: "/dashboard/category" },
    { icon: Ticket, label: "Tickets", href: "/dashboard/tickets" },
    { icon: Dices, label: "Live Raffles", href: "/dashboard/live-raffles" },
    { icon: LayoutDashboard, label: "Completed Raffles", href: "/dashboard/completed-raffles" },
    { icon: Users, label: "Users", href: "/dashboard/users" },
    { icon: Settings, label: "Settings", href: "/dashboard/settings" },
    { icon: User, label: "Profile", href: "/dashboard/profile" },
    { icon: LogOut, label: "Logout", href: "#logout" },
];

export const Sidebar = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const location = useLocation();

    const handleMenuClick = () => {
        if (window.innerWidth < 768) {
            setIsSidebarOpen(false);
        }
    };

    return (
        <>
            {/* Toggle Button */}
            <button
                className={`fixed z-1000 top-3 left-3 z-50 p-2 rounded md:hidden transition-colors duration-300 ${isSidebarOpen ? "bg-white text-blue-900" : "bg-blue-900 text-white"}`}
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            >
                {isSidebarOpen ? <X size={24} className="text-bold" /> : <Menu size={24} />}
            </button>

            {/* Sidebar */}
            <div
                className={`fixed z-100 top-0 left-0 h-screen bg-blue-900 px-6 py-6 shadow-md transform transition-transform duration-300 ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"
                    } md:translate-x-0 md:relative w-64`}
            >
                <h2 className="text-xl font-bold mb-4 text-white">Raffleit</h2>
                <ul className="list-none">
                    {sidebarItems.map(({ icon: Icon, label, href }, index) => {
                        const isActive = location.pathname === href;
                        return (
                            <li
                                key={index}
                                className={`mb-2 mt-2 gap-2 flex items-center p-2 rounded-md transition-colors duration-200 group ${isActive ? "bg-white text-blue-900" : "hover:bg-white hover:text-blue-900"}`}
                            >
                                <Icon className={`${isActive ? "text-blue-900" : "text-white"} group-hover:text-blue-900`} size={18} />
                                <Link
                                    to={href}
                                    className="flex items-center"
                                    onClick={handleMenuClick}
                                >
                                    <span className={`md:inline-block ml-2 ${isActive ? "text-blue-900" : "text-white"} group-hover:text-blue-900`}>
                                        {label}
                                    </span>
                                </Link>
                            </li>
                        );
                    })}
                </ul>
            </div>
        </>
    );
};
