import { useState, useEffect } from 'react';
import { API_BASE_URL } from '../../constants/constants';
import RaffleCard, { Raffle as RaffleCardData } from '../../components/shared/RaffleCard';
import RaffleDetailsModal from '../../components/shared/RaffleDetailsModal';

const CompletedRaffles = () => {
  const [completedRaffles, setCompletedRaffles] = useState<RaffleCardData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedRaffle, setSelectedRaffle] = useState<RaffleCardData | null>(null);
  const [showRaffleModal, setShowRaffleModal] = useState(false);

  useEffect(() => {
    const fetchCompletedRaffles = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`${API_BASE_URL}/raffles`);
        if (!res.ok) throw new Error('Failed to fetch raffles');
        const data = await res.json();
        const now = new Date();
        
        interface ApiRaffle {
          id: number;
          share_id?: string;
          title?: string;
          host_name?: string;
          prize?: string;
          description?: string;
          winner_name?: string;
          total_tickets?: number;
          tickets_sold?: number;
          ending_date: string;
          approve_status: string;
          type: 'raffle' | 'fundraising';
          current_amount?: number;
          ticket_price?: number | string;
          target?: number;
          image1?: string;
          image1_url?: string;
          images?: Array<{ id: number; path: string; url: string; }>;
          category?: { category_name?: string };
        }

        const completed = (data as ApiRaffle[]).filter((raffle) => {
          return new Date(raffle.ending_date) <= now && raffle.approve_status === 'approved';
        }).map((raffle) => {
          const ticketPrice = parseFloat(raffle.ticket_price?.toString() || '0') || 0;
          const ticketsSold = raffle.tickets_sold ?? 0;
          const ticketRevenue = ticketPrice * ticketsSold;
          const currentAmount = parseFloat((raffle.current_amount ?? 0).toString()) || 0;
          const donationAmount = Math.max(0, currentAmount - ticketRevenue);
          
          return {
            id: raffle.id,
            share_id: raffle.share_id || `raffle-${raffle.id}`,
            title: raffle.title || raffle.host_name || 'Untitled Raffle',
            prize: raffle.prize || raffle.description || 'No prize specified',
            description: raffle.description || '',
            hostName: raffle.host_name || 'Unknown Host',
            target: raffle.target || 0,
            currentTickets: ticketsSold,
            totalTickets: raffle.total_tickets ?? 0,
            endDate: raffle.ending_date,
            ticketPrice: ticketPrice,
            type: raffle.type,
            currentAmount: currentAmount,
            ticketRevenue: ticketRevenue,
            donationAmount: donationAmount,
            imageUrl: raffle.image1_url || 
                     (raffle.images && raffle.images.length > 0 ? raffle.images[0].url : null) ||
                     '/images/tb2.png',
            category: raffle.category?.category_name || 'N/A',
            status: 'completed',
            winner: raffle.winner_name,
          } as RaffleCardData;
        });
        setCompletedRaffles(completed);
      } catch {
        setError('Failed to load completed raffles.');
      } finally {
        setLoading(false);
      }
    };
    fetchCompletedRaffles();
  }, []);

  const openRaffleModal = (raffle: RaffleCardData) => {
    setSelectedRaffle(raffle);
    setShowRaffleModal(true);
  };

  const closeRaffleModal = () => {
    setShowRaffleModal(false);
    setSelectedRaffle(null);
  };

  const handleShare = async (raffle: RaffleCardData) => {
    const shareUrl = `${window.location.origin}/raffles/${raffle.share_id}`;
    const shareData = {
      title: raffle.title,
      text: `Check out this ${raffle.type === 'raffle' ? 'raffle' : 'fundraiser'}: ${raffle.title}`,
      url: shareUrl,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        // Fallback to copying link
        await navigator.clipboard.writeText(shareUrl);
        alert('Link copied to clipboard!');
      }
    } catch (error) {
      console.error('Error sharing:', error);
      // Fallback to copying link
      try {
        await navigator.clipboard.writeText(shareUrl);
        alert('Link copied to clipboard!');
      } catch (clipboardError) {
        console.error('Error copying to clipboard:', clipboardError);
      }
    }
  };

  if (loading) {
    return (
      <div className="p-6 bg-gray-100 min-h-screen flex items-center justify-center">
        <div className="loader"></div> Loading Completed Raffles...
        <style>{`
          .loader {
            border: 4px solid #f3f3f3;
            border-top: 4px solid #3498db;
            border-radius: 50%;
            width: 30px;
            height: 30px;
            animation: spin 1s linear infinite;
            display: inline-block;
            margin-left: 10px;
          }
          @keyframes spin {
            0% { transform: rotate(0deg);}
            100% { transform: rotate(360deg);}
          }
        `}</style>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-gray-100 min-h-screen text-red-700 text-center text-lg">
        Error: {error}
      </div>
    );
  }

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
            <RaffleCard
              key={raffle.id}
              raffle={raffle}
              onViewDetails={openRaffleModal}
              onShare={handleShare}
            />
          ))}
        </div>
      )}

      {selectedRaffle && (
        <RaffleDetailsModal
          raffle={selectedRaffle}
          isOpen={showRaffleModal}
          onClose={closeRaffleModal}
          isDashboard={true}
        />
      )}
    </div>
  );
};

export default CompletedRaffles;