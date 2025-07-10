import { FC } from 'react';
import { Clock, Tag, Target, Ticket, Users, Share2 } from 'lucide-react';

export interface Raffle {
    id: number;
    share_id?: string;
    title: string;
    prize?: string;
    description?: string;
    hostName: string;
    currentTickets?: number;
    totalTickets?: number;
    endDate: string;
    ticketPrice?: number;
    imageUrl: string;
    images?: Array<{ id: number; path: string; url: string; }>;
    category: string;
    target?: number;
    type: 'raffle' | 'fundraising';
    currentAmount?: number;
    status?: 'active' | 'completed' | 'pending';
    winner?: string;
    drawDate?: string;
    ticketRevenue?: number;
    donationAmount?: number;
    approveStatus?: 'approved' | 'pending' | 'rejected';
}

interface RaffleCardProps {
    raffle: Raffle;
    onViewDetails: (raffle: Raffle) => void;
    onEnter?: (raffle: Raffle) => void;
    onShare?: (raffle: Raffle) => void;
    timeLeft?: {
        days: number;
        hours: number;
        minutes: number;
        seconds: number;
    };
    children?: React.ReactNode;
}

const RaffleCard: FC<RaffleCardProps> = ({ raffle, onViewDetails, onEnter, onShare, timeLeft, children }) => {
    const isExpired = timeLeft ? timeLeft.days === 0 && timeLeft.hours === 0 && timeLeft.minutes === 0 && timeLeft.seconds === 0 : new Date(raffle.endDate) < new Date();

    const getProgress = () => {
        if (raffle.type === 'raffle' && raffle.totalTickets) {
            return ((raffle.currentTickets || 0) / raffle.totalTickets) * 100;
        }
        if (raffle.type === 'fundraising' && raffle.target) {
            return ((raffle.currentAmount || 0) / raffle.target) * 100;
        }
        return 0;
    };

    const progress = getProgress();

    const renderFooter = () => {
        if (raffle.status === 'completed') {
            return (
                <div className="text-center py-2">
                    <p className="font-semibold text-emerald-600 text-sm sm:text-base">Raffle Completed</p>
                    {raffle.winner && <p className="text-xs sm:text-sm text-slate-600 mt-1">Winner: {raffle.winner}</p>}
                </div>
            );
        }

        return (
            <div className="space-y-2 sm:space-y-3">
                <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                    <button 
                        className="flex-1 px-3 sm:px-4 py-2 sm:py-2.5 border border-slate-200 text-slate-600 rounded-lg hover:bg-slate-50 transition-colors text-sm sm:text-base font-medium" 
                        onClick={() => onViewDetails(raffle)}
                    >
                        <span className="hidden sm:inline">View Details</span>
                        <span className="sm:hidden">Details</span>
                    </button>
                    {onEnter && !isExpired && (
                        <button 
                            className="flex-1 px-3 sm:px-4 py-2 sm:py-2.5 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 transition-colors text-sm sm:text-base font-medium" 
                            onClick={() => onEnter(raffle)}
                        >
                            <span className="hidden sm:inline">{raffle.type === 'raffle' ? 'Enter Now' : 'Donate Now'}</span>
                            <span className="sm:hidden">{raffle.type === 'raffle' ? 'Enter' : 'Donate'}</span>
                        </button>
                    )}
                </div>
                {onShare && (
                    <button 
                        className="w-full px-3 sm:px-4 py-2 sm:py-2.5 bg-slate-100 text-slate-600 rounded-lg hover:bg-slate-200 transition-colors flex items-center justify-center gap-2 text-sm sm:text-base font-medium"
                        onClick={() => onShare(raffle)}
                    >
                        <Share2 className="w-3 h-3 sm:w-4 sm:h-4" />
                        <span className="hidden sm:inline">Share Raffle</span>
                        <span className="sm:hidden">Share</span>
                    </button>
                )}
            </div>
        );
    };

    return (
        <div className="w-full max-w-sm mx-auto sm:max-w-none rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300 flex flex-col bg-white">
            <div className="p-0 relative">
                <img src={raffle.imageUrl} alt={raffle.title} className="w-full h-40 sm:h-48 lg:h-52 object-cover" onError={(e) => { e.currentTarget.src = '/images/tb2.png'; }} />
                <div className="absolute top-2 left-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${raffle.type === 'raffle' ? 'bg-slate-100 text-slate-700' : 'bg-indigo-100 text-indigo-700'}`}>
                        <span className="hidden sm:inline">{raffle.type.charAt(0).toUpperCase() + raffle.type.slice(1)}</span>
                        <span className="sm:hidden">{raffle.type.charAt(0).toUpperCase()}</span>
                    </span>
                </div>
                {raffle.approveStatus && (
                    <div className="absolute top-2 right-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                            raffle.approveStatus === 'approved' ? 'bg-emerald-100 text-emerald-700' :
                            raffle.approveStatus === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                            'bg-rose-100 text-rose-700'
                        }`}>
                            <span className="hidden sm:inline">{raffle.approveStatus.charAt(0).toUpperCase() + raffle.approveStatus.slice(1)}</span>
                            <span className="sm:hidden">{raffle.approveStatus.charAt(0).toUpperCase()}</span>
                        </span>
                    </div>
                )}
                {timeLeft && !isExpired && (
                    <div className="absolute bottom-2 right-2 bg-white/80 backdrop-blur-sm p-1 rounded-md text-xs font-semibold">
                        <Clock className="w-3 h-3 inline-block mr-1" />
                        <span className="hidden sm:inline">{timeLeft.days}d {timeLeft.hours}h {timeLeft.minutes}m {timeLeft.seconds}s</span>
                        <span className="sm:hidden">{timeLeft.days}d {timeLeft.hours}h</span>
                    </div>
                )}
            </div>
            <div className="p-3 sm:p-4 lg:p-5 flex-grow">
                <h2 className="text-base sm:text-lg lg:text-xl font-bold mb-2 line-clamp-2 min-h-[2.5rem] sm:min-h-[3rem]">{raffle.title}</h2>
                {raffle.prize && <p className="text-indigo-600 font-semibold mb-2 text-sm sm:text-base line-clamp-2 min-h-[2rem] sm:min-h-[2.5rem]">{raffle.prize}</p>}
                <div className="flex items-center text-xs sm:text-sm text-slate-500 mb-2">
                    <Users className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2 flex-shrink-0" />
                    <span className="truncate">{raffle.hostName}</span>
                </div>
                <div className="flex items-center text-xs sm:text-sm text-slate-500 mb-3 sm:mb-4">
                    <Tag className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2 flex-shrink-0" />
                    <span className="truncate">{raffle.category}</span>
                </div>

                {raffle.type === 'raffle' && (
                    <>
                        <div className="flex justify-between items-center text-xs sm:text-sm mb-1">
                            <div className="flex items-center">
                                <Ticket className="w-3 h-3 sm:w-4 sm:h-4 mr-1 text-emerald-600 flex-shrink-0" />
                                <span className="hidden sm:inline">Tickets Sold</span>
                                <span className="sm:hidden">Tickets</span>
                            </div>
                            <span className="font-medium">{raffle.currentTickets || 0} / {raffle.totalTickets || 0}</span>
                        </div>
                        <div className="w-full bg-slate-200 rounded-full h-1.5 sm:h-2 mb-2">
                            <div className="bg-emerald-500 h-1.5 sm:h-2 rounded-full transition-all duration-300" style={{ width: `${Math.min(progress, 100)}%` }}></div>
                        </div>
                        <div className="flex justify-between items-center text-xs sm:text-sm mb-2">
                            <span className="hidden sm:inline">Price per ticket</span>
                            <span className="sm:hidden">Price</span>
                            <span className="text-emerald-600 font-bold">${raffle.ticketPrice?.toFixed(2) || '0.00'}</span>
                        </div>
                        <div className="flex justify-between items-center text-xs sm:text-sm">
                            <span className="text-slate-600">Total Raised</span>
                            <span className="text-emerald-600 font-semibold">
                                ${((raffle.currentTickets || 0) * (raffle.ticketPrice || 0)).toFixed(2)}
                            </span>
                        </div>
                    </>
                )}

                {raffle.type === 'fundraising' && (
                    <>
                        <div className="flex justify-between items-center text-xs sm:text-sm mb-1">
                            <div className="flex items-center">
                                <Target className="w-3 h-3 sm:w-4 sm:h-4 mr-1 text-rose-600 flex-shrink-0" />
                                <span className="hidden sm:inline">Raised</span>
                                <span className="sm:hidden">Goal</span>
                            </div>
                            <span className="font-medium">
                                <span className="hidden sm:inline">${(raffle.currentAmount || 0).toLocaleString()} / ${(raffle.target || 0).toLocaleString()}</span>
                                <span className="sm:hidden">${(raffle.currentAmount || 0).toLocaleString()}</span>
                            </span>
                        </div>
                        <div className="w-full bg-slate-200 rounded-full h-1.5 sm:h-2 mb-2">
                            <div className="bg-rose-500 h-1.5 sm:h-2 rounded-full transition-all duration-300" style={{ width: `${Math.min(progress, 100)}%` }}></div>
                        </div>
                        <div className="flex justify-between items-center text-xs sm:text-sm mb-2">
                            <span className="text-slate-600">Target Goal</span>
                            <span className="text-rose-600 font-semibold">${(raffle.target || 0).toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between items-center text-xs sm:text-sm">
                            <span className="text-slate-600">Progress</span>
                            <span className="text-rose-600 font-semibold">
                                {Math.min(progress, 100).toFixed(1)}% Complete
                            </span>
                        </div>
                    </>
                )}
            </div>
            <div className="p-3 sm:p-4 lg:p-5 border-t border-slate-100">
                {children || renderFooter()}
            </div>
        </div>
    );
};

export default RaffleCard;
