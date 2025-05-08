import { Dices, LayoutDashboard, LogOut, Settings, Ticket, User, Users, Menu, X } from "lucide-react";
import { useState } from "react";

const sidebarItems = [
    { icon: LayoutDashboard, label: "Dashboard", href: "#dashboard" },
    { icon: LayoutDashboard, label: "Category", href: "#category" },
    { icon: Ticket, label: "Tickets", href: "#tickets" },
    { icon: Dices, label: "Live Raffles", href: "#liveraffles" },
    { icon: LayoutDashboard, label: "Completed Raffles", href: "#completedraffles" },
    { icon: Users, label: "Users", href: "#users" },
    { icon: Settings, label: "Settings", href: "#settings" },
    { icon: User, label: "Profile", href: "#profile" },
    { icon: LogOut, label: "Logout", href: "#logout" },
];

export const Sidebar = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    return (
        <>
            {/* Toggle Button */}
            <button
                className={`fixed top-3 left-3 z-50 p-2 rounded md:hidden transition-colors duration-300 ${isSidebarOpen ? "bg-white text-blue-900" : "bg-blue-900 text-white"}`}
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            >
                {isSidebarOpen ? <X size={24} className="text-bold"/> : <Menu size={24} />}
            </button>

            {/* Sidebar */}
            <div
                className={`fixed top-0 left-0 h-screen bg-blue-900 px-6 py-6 shadow-md transform transition-transform duration-300 ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"
                    } md:translate-x-0 md:relative w-64`}
            >
                <h2 className="text-xl font-bold mb-4 text-white">Raffleit</h2>
                <ul className="list-none">
                    {sidebarItems.map(({ icon: Icon, label, href }, index) => (
                        <li
                            key={index}
                            className="mb-2 mt-4 gap-2 flex items-center hover:scale-110 hover:text-blue-500 transition-transform duration-200 group"
                        >
                            <Icon className="text-white" size={18} />
                            <a href={href} className="flex items-center">
                                <span className="md:inline-block ml-2 text-white group-hover:text-blue-500">
                                    {label}
                                </span>
                            </a>
                        </li>
                    ))}
                </ul>
            </div>
        </>
    );
};
