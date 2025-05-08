import { useState } from "react";
import { Hero } from "../components/main/Hero";

export const Raffles = () => {
    const [searchTerm, setSearchTerm] = useState("");
    const [filterDate, setFilterDate] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [selectedRaffle, setSelectedRaffle] = useState<{
        id: number;
        title: string;
        amount: number;
        endsIn: string;
        date: string;
        image: string;
        organization: string;
        targetAmount: number;
        hostName: string;
        startDate: string;
        endDate: string;
        description: string;
    } | null>(null);
    const itemsPerPage = 3;

    const raffles = [
        {
            id: 1,
            title: "Gaming Console",
            amount: 500,
            endsIn: "00:00:00",
            date: "2023-10-01",
            image: "./images/tb2.png",
            organization: "Tech Giveaways",
            targetAmount: 1000,
            hostName: "John Doe",
            startDate: "2023-09-01",
            endDate: "2023-10-01",
            description: "Win a brand-new gaming console by participating in this raffle!",
        },
        {
            id: 2,
            title: "Smartwatch",
            amount: 300,
            endsIn: "00:00:00",
            date: "2023-10-05",
            image: "./images/tb2.png",
            organization: "Gadget World",
            targetAmount: 500,
            hostName: "Jane Smith",
            startDate: "2023-09-10",
            endDate: "2023-10-05",
            description: "Get a chance to win the latest smartwatch!",
        },
        {
            id: 3,
            title: "Electric Scooter",
            amount: 700,
            endsIn: "00:00:00",
            date: "2023-10-10",
            image: "./images/tb2.png",
            organization: "Eco Rides",
            targetAmount: 1500,
            hostName: "Alice Johnson",
            startDate: "2023-09-15",
            endDate: "2023-10-10",
            description: "Win an eco-friendly electric scooter!",
        },
        {
            id: 4,
            title: "Vacation Package",
            amount: 1200,
            endsIn: "00:00:00",
            date: "2023-10-15",
            image: "https://via.placeholder.com/300x200?text=Vacation+Package",
            organization: "Travel Deals",
            targetAmount: 2000,
            hostName: "Bob Brown",
            startDate: "2023-09-20",
            endDate: "2023-10-15",
            description: "Win a luxurious vacation package to your dream destination!",
        },
        {
            id: 5,
            title: "Laptop",
            amount: 900,
            endsIn: "00:00:00",
            date: "2023-10-20",
            image: "https://via.placeholder.com/300x200?text=Laptop",
            organization: "Tech World",
            targetAmount: 1200,
            hostName: "Charlie Davis",
            startDate: "2023-09-25",
            endDate: "2023-10-20",
            description: "Win a high-performance laptop for work or gaming!",
        },
        {
            id: 6,
            title: "Smartphone",
            amount: 800,
            endsIn: "00:00:00",
            date: "2023-10-25",
            image: "https://via.placeholder.com/300x200?text=Smartphone",
            organization: "Mobile Mania",
            targetAmount: 1000,
            hostName: "Diana Evans",
            startDate: "2023-09-30",
            endDate: "2023-10-25",
            description: "Win the latest smartphone with cutting-edge features!",
        },
        {
            id: 7,
            title: "Gaming Chair",
            amount: 400,
            endsIn: "00:00:00",
            date: "2023-10-30",
            image: "https://via.placeholder.com/300x200?text=Gaming+Chair",
            organization: "Comfort Zone",
            targetAmount: 600,
            hostName: "Ethan Foster",
            startDate: "2023-10-01",
            endDate: "2023-10-30",
            description: "Win a premium gaming chair for ultimate comfort!",
        },
        {
            id: 8,
            title: "Headphones",
            amount: 200,
            endsIn: "00:00:00",
            date: "2023-11-05",
            image: "https://via.placeholder.com/300x200?text=Headphones",
            organization: "Audio World",
            targetAmount: 400,
            hostName: "Fiona Green",
            startDate: "2023-10-05",
            endDate: "2023-11-05",
            description: "Win high-quality headphones for an immersive audio experience!",
        },
    ];

    const filteredRaffles = raffles
        .filter((raffle) =>
            raffle.title.toLowerCase().includes(searchTerm.toLowerCase())
        )
        .filter((raffle) =>
            filterDate ? raffle.date === filterDate : true
        );

    const totalPages = Math.ceil(filteredRaffles.length / itemsPerPage);
    const paginatedRaffles = filteredRaffles.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(e.target.value);
        setCurrentPage(1); // Reset to first page on search
    };

    const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFilterDate(e.target.value);
        setCurrentPage(1); // Reset to first page on filter
    };

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
    };

    return (
        <>
            {/* Hero Section */}
            <Hero
                backgroundImage="./images/home-bg.png"
                title="Join Live Raffles"
            />

            {/* Page Header */}
            <div className="container mx-auto py-4 px-4">
                <div className="text-center md:mt-10 mt-10 mb-4 w-full md:w-70/100 mx-auto">
                    <h1 className="font-bold text-text-primary">LIVE RAFFLES</h1>
                    <h2 className="text-4xl mt-2 font-bold mb-4">
                        Join Live Raffles and Win Amazing Prizes!
                    </h2>
                </div>

                {selectedRaffle ? (
                    <div className="raffle-details p-6 border rounded shadow-md bg-white">
                        <button
                            onClick={() => setSelectedRaffle(null)}
                            className="mb-4 text-blue-500 underline"
                        >
                            Back to Raffles
                        </button>
                        <img
                            src={selectedRaffle.image}
                            alt={selectedRaffle.title}
                            className="w-full h-60 object-cover rounded mb-4"
                        />
                        <h2 className="text-2xl font-bold mb-2">{selectedRaffle.title}</h2>
                        <p><strong>Organization:</strong> {selectedRaffle.organization}</p>
                        <p><strong>Target Amount:</strong> ${selectedRaffle.targetAmount}</p>
                        <p><strong>Host Name:</strong> {selectedRaffle.hostName}</p>
                        <p><strong>Start Date:</strong> {selectedRaffle.startDate}</p>
                        <p><strong>End Date:</strong> {selectedRaffle.endDate}</p>
                        <p className="mt-4">{selectedRaffle.description}</p>
                    </div>
                ) : (
                    <>
                        {/* Search and Filter Section */}
                        <div className="bg-text-primary rounded py-4 px-4 mt-4 mb-4 flex justify-between items-center">
                            <h2 className="text-white text-lg font-bold">
                                Search Raffles
                            </h2>
                            <p className="text-white">
                                Use filters to refine your search
                            </p>
                        </div>
                        <div className="flex flex-col md:flex-row gap-4 mb-6">
                            <input
                                type="text"
                                placeholder="Search raffles..."
                                value={searchTerm}
                                onChange={handleSearchChange}
                                className="border p-2 rounded w-full md:w-1/2"
                            />
                            <input
                                type="date"
                                value={filterDate}
                                onChange={handleDateChange}
                                className="border p-2 rounded w-full md:w-1/2"
                            />
                        </div>

                        {/* Raffles List */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 justify-items-center gap-4">
                            {paginatedRaffles.map((raffle) => (
                                <div
                                    key={raffle.id}
                                    className="raffle-item border rounded shadow-md w-full cursor-pointer"
                                    onClick={() => setSelectedRaffle(raffle)}
                                >
                                    <img
                                        src={raffle.image}
                                        alt={raffle.title}
                                        className="w-full h-40 object-cover rounded mb-4"
                                    />
                                    <div className="p-4">
                                        <h3 className="font-bold text-lg">{raffle.title}</h3>
                                        <p>Amount Collected: ${raffle.amount}</p>
                                        <p>Ends In: <span>{raffle.endsIn}</span></p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Pagination */}
                        <div className="flex justify-center mt-6">
                            {Array.from({ length: totalPages }, (_, index) => (
                                <button
                                    key={index}
                                    onClick={() => handlePageChange(index + 1)}
                                    className={`px-4 py-2 mx-1 border rounded ${currentPage === index + 1
                                        ? "bg-blue-500 text-white"
                                        : "bg-white text-blue-500"
                                        }`}
                                >
                                    {index + 1}
                                </button>
                            ))}
                        </div>
                    </>
                )}
            </div>
        </>
    );
};
