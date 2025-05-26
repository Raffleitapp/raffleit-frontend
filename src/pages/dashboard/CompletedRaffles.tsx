import { useState } from 'react';
// You might have a dedicated component for a single raffle card, e.g., RaffleCard
// import RaffleCard from './RaffleCard';

const CompletedRaffles = () => {
  // Dummy data for completed raffles (replace with actual data fetched from your API)
  // const [completedRaffles, setCompletedRaffles] = useState([
  const [completedRaffles] = useState([
    {
      id: 'raffle-001',
      title: 'Luxury Watch Giveaway',
      prize: 'Rolex Submariner',
      winner: 'Alice Smith',
      totalTickets: 500,
      ticketsSold: 480,
      drawDate: '2024-05-20',
      imageUrl: 'https://via.placeholder.com/150/0000FF/FFFFFF?text=Watch', // Placeholder image
    },
    {
      id: 'raffle-002',
      title: 'Gaming PC Bundle',
      prize: 'High-End Gaming Rig + Peripherals',
      winner: 'Bob Johnson',
      totalTickets: 300,
      ticketsSold: 300,
      drawDate: '2024-05-15',
      imageUrl: 'https://via.placeholder.com/150/FF0000/FFFFFF?text=Gaming+PC',
    },
    {
      id: 'raffle-003',
      title: 'Tropical Island Vacation',
      prize: '7-Day Trip for Two to Bali',
      winner: 'Charlie Brown',
      totalTickets: 200,
      ticketsSold: 180,
      drawDate: '2024-05-10',
      imageUrl: 'https://via.placeholder.com/150/00FF00/FFFFFF?text=Vacation',
    },
    {
        id: 'raffle-004',
        title: 'New Smartphone',
        prize: 'iPhone 15 Pro Max',
        winner: 'David Lee',
        totalTickets: 400,
        ticketsSold: 390,
        drawDate: '2024-05-05',
        imageUrl: 'https://via.placeholder.com/150/FFFF00/000000?text=Phone',
    },
  ]);

  // In a real application, you'd fetch data here:
  // useEffect(() => {
  //   const fetchCompletedRaffles = async () => {
  //     try {
  //       const response = await fetch('/api/completed-raffles'); // Your API endpoint
  //       const data = await response.json();
  //       setCompletedRaffles(data);
  //     } catch (error) {
  //       console.error("Failed to fetch completed raffles:", error);
  //     }
  //   };
  //   fetchCompletedRaffles();
  // }, []);

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <h1 className="text-4xl font-extrabold mb-8 text-gray-900">Completed Raffles</h1>
      <p className="text-lg text-gray-700 mb-8">Review all raffles that have concluded and their winners.</p>

      {completedRaffles.length === 0 ? (
        <div className="bg-white p-6 rounded-lg shadow-md text-center">
          <p className="text-gray-600">No completed raffles to display yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {completedRaffles.map((raffle) => (
            <div key={raffle.id} className="bg-white rounded-lg shadow-md overflow-hidden transition-transform duration-200 hover:scale-[1.02]">
              <img src={raffle.imageUrl} alt={raffle.title} className="w-full h-48 object-cover" />
              <div className="p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">{raffle.title}</h2>
                <p className="text-lg text-blue-700 mb-4 font-semibold">{raffle.prize}</p>
                
                <div className="mb-4">
                  <p className="text-gray-700 text-sm"><strong>Winner:</strong> <span className="font-semibold text-green-600">{raffle.winner}</span></p>
                  <p className="text-gray-700 text-sm"><strong>Draw Date:</strong> {raffle.drawDate}</p>
                </div>

                <div className="flex justify-between items-center text-sm text-gray-600">
                  <span>Tickets Sold: <span className="font-semibold">{raffle.ticketsSold}</span> / {raffle.totalTickets}</span>
                  {raffle.ticketsSold === raffle.totalTickets && (
                    <span className="px-3 py-1 bg-green-100 text-green-800 text-xs font-semibold rounded-full">SOLD OUT</span>
                  )}
                </div>
                {/* You might add a "View Details" button here */}
                {/* <button className="mt-4 w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700">
                  View Details
                </button> */}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CompletedRaffles;