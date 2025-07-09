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
                <div className="text-center">
                    <p className="font-semibold text-emerald-600">Raffle Completed</p>
                    {raffle.winner && <p className="text-sm text-slate-600">Winner: {raffle.winner}</p>}
                </div>
            );
        }

        return (
            <div className="space-y-2">
                <div className="flex gap-2">
                    <button 
                        className="flex-1 px-4 py-2 border border-slate-200 text-slate-600 rounded-lg hover:bg-slate-50 transition-colors" 
                        onClick={() => onViewDetails(raffle)}
                    >
                        View Details
                    </button>
                    {onEnter && !isExpired && (
                        <button 
                            className="flex-1 px-4 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 transition-colors" 
                            onClick={() => onEnter(raffle)}
                        >
                            {raffle.type === 'raffle' ? 'Enter Now' : 'Donate'}
                        </button>
                    )}
                </div>
                {onShare && (
                    <button 
                        className="w-full px-4 py-2 bg-slate-100 text-slate-600 rounded-lg hover:bg-slate-200 transition-colors flex items-center justify-center gap-2"
                        onClick={() => onShare(raffle)}
                    >
                        <Share2 className="w-4 h-4" />
                        Share Raffle
                    </button>
                )}
            </div>
        );
    };

    return (
        <div className="w-full max-w-sm rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300 flex flex-col">
            <div className="p-0 relative">
                <img src={raffle.imageUrl} alt={raffle.title} className="w-full h-48 object-cover" onError={(e) => { e.currentTarget.src = '/images/tb2.png'; }} />
                <div className="absolute top-2 left-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${raffle.type === 'raffle' ? 'bg-slate-100 text-slate-700' : 'bg-indigo-100 text-indigo-700'}`}>{raffle.type.charAt(0).toUpperCase() + raffle.type.slice(1)}</span>
                </div>
                {raffle.approveStatus && (
                    <div className="absolute top-2 right-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                            raffle.approveStatus === 'approved' ? 'bg-emerald-100 text-emerald-700' :
                            raffle.approveStatus === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                            'bg-rose-100 text-rose-700'
                        }`}>
                            {raffle.approveStatus.charAt(0).toUpperCase() + raffle.approveStatus.slice(1)}
                        </span>
                    </div>
                )}
                {timeLeft && !isExpired && (
                    <div className="absolute bottom-2 right-2 bg-white/80 backdrop-blur-sm p-1 rounded-md text-xs font-semibold">
                        <Clock className="w-3 h-3 inline-block mr-1" />
                        {timeLeft.days}d {timeLeft.hours}h {timeLeft.minutes}m {timeLeft.seconds}s
                    </div>
                )}
            </div>
            <div className="p-4 flex-grow">
                <h2 className="text-lg font-bold mb-2 truncate">{raffle.title}</h2>
                {raffle.prize && <p className="text-indigo-600 font-semibold mb-2 truncate">{raffle.prize}</p>}
                <div className="flex items-center text-sm text-slate-500 mb-2">
                    <Users className="w-4 h-4 mr-2" />
                    <span>{raffle.hostName}</span>
                </div>
                <div className="flex items-center text-sm text-slate-500 mb-4">
                    <Tag className="w-4 h-4 mr-2" />
                    <span>{raffle.category}</span>
                </div>

                {raffle.type === 'raffle' && (
                    <>
                        <div className="flex justify-between items-center text-sm mb-1">
                            <div className="flex items-center">
                                <Ticket className="w-4 h-4 mr-1 text-emerald-600" />
                                <span>Tickets Sold</span>
                            </div>
                            <span>{raffle.currentTickets} / {raffle.totalTickets}</span>
                        </div>
                        <div className="w-full bg-slate-200 rounded-full h-2">
                            <div className="bg-emerald-500 h-2 rounded-full" style={{ width: `${progress}%` }}></div>
                        </div>
                        <div className="flex justify-between items-center text-sm mt-2">
                            <div className="flex items-center">
                                <span className="text-emerald-600 font-bold">${raffle.ticketPrice?.toFixed(2)}</span>
                            </div>
                        </div>
                    </>
                )}

                {raffle.type === 'fundraising' && (
                    <>
                        <div className="flex justify-between items-center text-sm mb-1">
                            <div className="flex items-center">
                                <Target className="w-4 h-4 mr-1 text-rose-600" />
                                <span>Raised</span>
                            </div>
                            <span>${raffle.currentAmount?.toLocaleString()} / ${raffle.target?.toLocaleString()}</span>
                        </div>
                        <div className="w-full bg-slate-200 rounded-full h-2">
                            <div className="bg-rose-500 h-2 rounded-full" style={{ width: `${progress}%` }}></div>
                        </div>
                    </>
                )}
            </div>
            <div className="p-4">
                {children || renderFooter()}
            </div>
        </div>
    );
};

export default RaffleCard;
