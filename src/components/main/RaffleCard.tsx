import React, { useState, useEffect } from 'react';
import { Calendar, MapPin, Users, Target } from 'lucide-react';

interface RaffleCardProps {
  raffle: {
    id: number;
    title: string;
    host_name: string;
    description: string;
    target: number;
    starting_date: string;
    ending_date: string;
    approve_status: string;
    type: 'raffle' | 'fundraising';
    ticket_price?: number;
    max_tickets?: number;
    tickets_sold?: number;
    calculated_tickets_sold?: number;
    current_amount?: number;
    image1?: string;
    image1_url?: string;
    state_raffle_hosted?: string;
    category?: {
      id: number;
      category_name: string;
    };
  };
  onSelect: (raffle: RaffleCardProps['raffle']) => void;
  onPurchase?: (raffle: RaffleCardProps['raffle']) => void;
}

export const RaffleCard: React.FC<RaffleCardProps> = ({ raffle, onSelect, onPurchase }) => {
  const [timeLeft, setTimeLeft] = useState<{ days: number; hours: number; minutes: number; seconds: number }>({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  // Calculate time remaining for countdown
  const calculateTimeLeft = (endDate: string) => {
    const difference = new Date(endDate).getTime() - new Date().getTime();
    
    if (difference > 0) {
      return {
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((difference % (1000 * 60)) / 1000),
      };
    }
    
    return { days: 0, hours: 0, minutes: 0, seconds: 0 };
  };

  // Update timer every second
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft(raffle.ending_date));
    }, 1000);

    // Set initial time
    setTimeLeft(calculateTimeLeft(raffle.ending_date));

    return () => clearInterval(timer);
  }, [raffle.ending_date]);

  const getProgressPercentage = () => {
    if (raffle.type === 'fundraising') {
      return Math.min((raffle.current_amount || 0) / raffle.target * 100, 100);
    } else {
      return Math.min((raffle.tickets_sold || 0) / (raffle.max_tickets || 1) * 100, 100);
    }
  };

  const progressPercentage = getProgressPercentage();
  const isExpired = timeLeft.days === 0 && timeLeft.hours === 0 && timeLeft.minutes === 0 && timeLeft.seconds === 0;

  return (
    <div className="bg-white rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 overflow-hidden group">
      {/* Image Section */}
      <div className="relative h-48 bg-gradient-to-br from-blue-100 to-purple-100 overflow-hidden">
        {raffle.image1_url ? (
          <img 
            src={raffle.image1_url} 
            alt={raffle.title}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            onError={(e) => {
              e.currentTarget.style.display = 'none';
            }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center transition-all duration-300 group-hover:scale-105">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-gray-200 to-gray-300 rounded-full mx-auto mb-2 flex items-center justify-center">
                <span className="text-gray-400 text-2xl font-bold">?</span>
              </div>
              <span className="text-gray-500 text-sm font-medium">
                {raffle.category?.category_name || 'No Category'}
              </span>
            </div>
          </div>
        )}
        
        {/* Category Badge */}
        {raffle.category && (
          <div className="absolute top-3 left-3">
            <span className="px-3 py-1 bg-white/95 backdrop-blur-sm rounded-full text-xs font-semibold text-gray-700 shadow-lg border border-white/50">
              {raffle.category.category_name}
            </span>
          </div>
        )}
        


        {/* Time Remaining */}
        <div className="absolute bottom-3 right-3">
          <div className={`px-3 py-1 rounded-full text-xs font-semibold shadow-lg backdrop-blur-sm ${
            isExpired 
              ? 'bg-red-500/90 text-white border border-red-400/50' 
              : timeLeft.days <= 7 
                ? 'bg-orange-500/90 text-white border border-orange-400/50' 
                : 'bg-green-500/90 text-white border border-green-400/50'
          }`}>
            {isExpired ? 'Expired' : `${timeLeft.days}d ${timeLeft.hours}h ${timeLeft.minutes}m ${timeLeft.seconds}s`}
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="p-6">
        {/* Title */}
        <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-2">
          {raffle.title}
        </h3>

        {/* Host */}
        <div className="flex items-center text-gray-600 mb-3">
          <Users className="w-4 h-4 mr-2" />
          <span className="text-sm font-medium">{raffle.host_name}</span>
        </div>

        {/* Location */}
        {raffle.state_raffle_hosted && (
          <div className="flex items-center text-gray-600 mb-3">
            <MapPin className="w-4 h-4 mr-2" />
            <span className="text-sm">{raffle.state_raffle_hosted}</span>
          </div>
        )}

        {/* Brief Description */}
        <p className="text-gray-600 text-sm mb-4 line-clamp-2">
          {raffle.description.length > 100 
            ? `${raffle.description.substring(0, 100)}...`
            : raffle.description
          }
        </p>

        {/* Progress Section */}
        <div className="mb-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-700">
              {raffle.type === 'fundraising' ? 'Raised' : 'Tickets Sold'}
            </span>
            <span className="text-sm font-bold text-gray-900">
              {Math.round(progressPercentage)}%
            </span>
          </div>
          
          <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
            <div 
              className={`h-3 rounded-full transition-all duration-700 ease-out relative ${
                raffle.type === 'fundraising' 
                  ? 'bg-gradient-to-r from-red-400 via-red-500 to-red-600' 
                  : 'bg-gradient-to-r from-blue-400 via-blue-500 to-blue-600'
              }`}
              style={{ width: `${progressPercentage}%` }}
            >
              <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
            </div>
          </div>
          
          <div className="flex justify-between items-center mt-2">
            <span className="text-sm text-gray-600">
              {raffle.type === 'fundraising' 
                ? formatCurrency(raffle.current_amount || 0)
                : `${raffle.tickets_sold || 0} sold`
              }
            </span>
            <span className="text-sm font-medium text-gray-900">
              {raffle.type === 'fundraising' 
                ? formatCurrency(raffle.target)
                : `${raffle.max_tickets || 0} total`
              }
            </span>
          </div>
        </div>

        {/* Price & Date Info */}
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center text-gray-600">
            <Calendar className="w-4 h-4 mr-2" />
            <span className="text-sm">
              {formatDate(raffle.starting_date)} - {formatDate(raffle.ending_date)}
            </span>
          </div>
          
          {raffle.ticket_price && (
            <div className="flex items-center">
              <Target className="w-4 h-4 mr-1 text-green-600" />
              <span className="text-lg font-bold text-green-600">
                {formatCurrency(raffle.ticket_price)}
              </span>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <button
            onClick={() => onSelect(raffle)}
            className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-all duration-200 font-medium hover:shadow-md"
          >
            View Details
          </button>
          
          {!isExpired && onPurchase && (
            <button
              onClick={() => onPurchase(raffle)}
              className={`flex-1 px-4 py-3 text-white rounded-lg font-medium transition-all duration-200 hover:shadow-lg transform hover:scale-105 ${
                raffle.type === 'fundraising'
                  ? 'bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700'
                  : 'bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700'
              }`}
            >
              {raffle.type === 'fundraising' ? 'Donate' : 'Buy Tickets'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default RaffleCard;
