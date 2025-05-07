import { Dices, LayoutDashboard, LogOut, Settings, Ticket, User, Users } from "lucide-react";

export const Sidebar = () => {
    return (
        <>
            <div className="w-64 h-screen bg-blue-900 p-5 shadow-md">
                <h2 className="text-xl font-bold mb-4 text-white">Sidebar</h2>
                <ul className="list-none">
                    <li className="mb-2 mt-4 gap-2 flex items-center group">
                        <LayoutDashboard className="mr-2 text-white group-hover:scale-110 group-hover:text-blue-500 transition-transform duration-200" size={18}/>
                        <a href="#dashboard" className="text-white no-underline hover:text-blue-500">Dashboard</a>
                    </li>
                    <li className="mb-2 mt-4 gap-2 flex items-center group">
                        <LayoutDashboard className="mr-2 text-white group-hover:scale-110 group-hover:text-blue-500 transition-transform duration-200" size={18}/>
                        <a href="#dashboard" className="text-white no-underline hover:text-blue-500">Category</a>
                    </li>
                    <li className="mb-2 mt-4 gap-2 flex items-center group">
                        <Ticket className="mr-2 text-white group-hover:scale-110 group-hover:text-blue-500 transition-transform duration-200" size={18}/>
                        <a href="#dashboard" className="text-white no-underline hover:text-blue-500">Tickets</a>
                    </li>
                    <li className="mb-2 mt-4 gap-2 flex items-center group">
                        <Dices className="mr-2 text-white group-hover:scale-110 group-hover:text-blue-500 transition-transform duration-200" size={18}/>
                        <a href="#dashboard" className="text-white no-underline hover:text-blue-500">Live Raffles</a>
                    </li>
                    <li className="mb-2 mt-4 gap-2 flex items-center group">
                        <LayoutDashboard className="mr-2 text-white group-hover:scale-110 group-hover:text-blue-500 transition-transform duration-200" size={18}/>
                        <a href="#dashboard" className="text-white no-underline hover:text-blue-500">Completed Raffles</a>
                    </li>
                    <li className="mb-2 mt-4 gap-2 flex items-center group">
                        <Users className="mr-2 text-white group-hover:scale-110 group-hover:text-blue-500 transition-transform duration-200" size={18}/>
                        <a href="#dashboard" className="text-white no-underline hover:text-blue-500">Users</a>
                    </li>
                    <li className="mb-2 mt-4 gap-2 flex items-center group">
                        <Settings className="mr-2 text-white group-hover:scale-110 group-hover:text-blue-500 transition-transform duration-200" size={18}/>
                        <a href="#settings" className="text-white no-underline hover:text-blue-500">Settings</a>
                    </li>
                    <li className="mb-2 mt-4 gap-2 flex items-center group">
                        <User className="mr-2 text-white group-hover:scale-110 group-hover:text-blue-500 transition-transform duration-200" size={18}/>
                        <a href="#profile" className="text-white no-underline hover:text-blue-500">Profile</a>
                    </li>
                    <li className="mb-2 mt-4 gap-2 flex items-center group">
                        <LogOut className="mr-2 text-white group-hover:scale-110 group-hover:text-blue-500 transition-transform duration-200" size={18}/>
                        <a href="#logout" className="text-white no-underline hover:text-blue-500">Logout</a>
                    </li>
                </ul>
            </div>
        </>
    )
};
