import { FC, useState } from 'react';
import { X, Share2, Copy, Users, Tag, Target } from 'lucide-react';
import { Raffle } from './RaffleCard';

interface RaffleDetailsModalProps {
    raffle: Raffle;
    isOpen: boolean;
    onClose: () => void;
    onShare?: (raffle: Raffle) => void;
    onEnter?: (raffle: Raffle) => void;
    isDashboard?: boolean; // New prop to indicate if it's in dashboard context
    timeLeft?: {
        days: number;
        hours: number;
        minutes: number;
        seconds: number;
        total: number;
    };
    children?: React.ReactNode; // For custom action buttons like payment options
}

const RaffleDetailsModal: FC<RaffleDetailsModalProps> = ({ 
    raffle, 
    isOpen, 
    onClose, 
    onShare, 
    onEnter, 
    isDashboard = false,
    timeLeft, 
    children 
}) => {
    const [copySuccess, setCopySuccess] = useState(false);

    if (!isOpen) return null;

    const handleCopyLink = async () => {
        const shareUrl = `${window.location.origin}/raffles/${raffle.share_id}`;
        try {
            await navigator.clipboard.writeText(shareUrl);
            setCopySuccess(true);
            setTimeout(() => setCopySuccess(false), 2000);
        } catch (error) {
            console.error('Failed to copy link:', error);
        }
    };

    const handleShare = () => {
        if (onShare) {
            onShare(raffle);
        } else {
            handleCopyLink();
        }
    };

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

    return (
        <div className={`fixed backdrop-blur-sm transition-opacity bg-slate-900/20 flex items-center justify-center z-50 p-4 ${
            isDashboard 
                ? 'top-16 left-0 md:left-64 right-0 bottom-0' // Dashboard: Account for navbar (top-16) and sidebar (md:left-64)
                : 'inset-0' // Public: Full screen
        }`}>
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
                {/* Modal Header */}
                <div className="relative">
                    <img 
                        src={raffle.imageUrl} 
                        alt={raffle.title}
                        className="w-full h-64 object-cover rounded-t-xl"
                        onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src = '/images/tb2.png';
                        }}
                    />
                    <div className="absolute top-4 right-4 flex gap-2">
                        <button
                            onClick={handleCopyLink}
                            className="bg-indigo-600 bg-opacity-90 text-white rounded-full p-2 hover:bg-opacity-100 transition-colors"
                            title={copySuccess ? "Link copied!" : "Copy share link"}
                        >
                            <Copy size={20} />
                        </button>
                        <button
                            onClick={handleShare}
                            className="bg-slate-800 bg-opacity-60 text-white rounded-full p-2 hover:bg-opacity-80 transition-colors"
                            title="Share Raffle"
                        >
                            <Share2 size={20} />
                        </button>
                        <button
                            onClick={onClose}
                            className="bg-slate-800 bg-opacity-60 text-white rounded-full p-2 hover:bg-opacity-80 transition-colors"
                        >
                            <X size={20} />
                        </button>
                    </div>

                    {/* Copy Success Indicator */}
                    {copySuccess && (
                        <div className="absolute top-16 right-4 bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm font-semibold shadow-lg animate-pulse">
                            ✓ Link copied to clipboard!
                        </div>
                    )}

                    {/* Type and Status Badges */}
                    <div className="absolute top-4 left-4 flex gap-2">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            raffle.type === 'raffle' ? 'bg-slate-100 text-slate-700' : 'bg-indigo-100 text-indigo-700'
                        }`}>
                            {raffle.type.charAt(0).toUpperCase() + raffle.type.slice(1)}
                        </span>
                        {raffle.approveStatus && (
                            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                raffle.approveStatus === 'approved' ? 'bg-emerald-100 text-emerald-700' :
                                raffle.approveStatus === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                                'bg-rose-100 text-rose-700'
                            }`}>
                                {raffle.approveStatus.charAt(0).toUpperCase() + raffle.approveStatus.slice(1)}
                            </span>
                        )}
                    </div>

                    {/* Additional Images Indicator */}
                    {raffle.images && raffle.images.length > 1 && (
                        <div className="absolute bottom-4 left-4">
                            <span className="bg-slate-900 bg-opacity-60 text-white px-3 py-1 rounded text-sm">
                                {raffle.images.length} photos
                            </span>
                        </div>
                    )}
                </div>

                {/* Modal Content */}
                <div className="p-8">
                    <div className="mb-6">
                        <h1 className="text-4xl font-bold text-slate-800 mb-3">{raffle.title}</h1>
                        <div className="flex items-center gap-4 text-sm text-slate-600 mb-4">
                            <div className="flex items-center gap-1">
                                <Tag className="w-4 h-4" />
                                <span className="bg-indigo-100 text-indigo-800 px-3 py-1 rounded-full font-semibold">
                                    {raffle.category}
                                </span>
                            </div>
                            <div className="flex items-center gap-1">
                                <Users className="w-4 h-4" />
                                <span>Host: {raffle.hostName}</span>
                            </div>
                        </div>
                    </div>

                    {/* Prize Information */}
                    {raffle.prize && (
                        <div className="mb-6">
                            <h2 className="text-2xl font-semibold text-slate-800 mb-3">Prize</h2>
                            <p className="text-lg text-indigo-600 font-semibold">{raffle.prize}</p>
                        </div>
                    )}

                    {/* Description */}
                    {raffle.description && (
                        <div className="mb-6">
                            <h2 className="text-2xl font-semibold text-slate-800 mb-3">Description</h2>
                            <p className="text-slate-600 leading-relaxed">{raffle.description}</p>
                        </div>
                    )}

                    {/* Statistics */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                        <div className="bg-gradient-to-r from-emerald-50 to-teal-50 p-6 rounded-lg">
                            <h3 className="text-sm font-semibold text-slate-500 mb-2">Total Collected</h3>
                            <p className="text-3xl font-bold text-emerald-600">${(raffle.currentAmount || 0).toFixed(2)}</p>
                            {raffle.type === 'raffle' && (raffle.donationAmount || 0) > 0 && (
                                <p className="text-xs text-slate-500 mt-1">
                                    ${(raffle.ticketRevenue || 0).toFixed(2)} tickets + ${(raffle.donationAmount || 0).toFixed(2)} donations
                                </p>
                            )}
                        </div>
                        <div className="bg-gradient-to-r from-indigo-50 to-purple-50 p-6 rounded-lg">
                            <h3 className="text-sm font-semibold text-slate-500 mb-2">Target Goal</h3>
                            <p className="text-3xl font-bold text-indigo-600">${(raffle.target || 0).toLocaleString()}</p>
                            <p className="text-xs text-slate-500 mt-1">
                                {raffle.target ? Math.round(((raffle.currentAmount || 0) / raffle.target) * 100) : 0}% reached
                            </p>
                        </div>
                        
                        {raffle.type === 'raffle' && (
                            <>
                                <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-6 rounded-lg">
                                    <h3 className="text-sm font-semibold text-slate-500 mb-2">Ticket Price</h3>
                                    <p className="text-3xl font-bold text-purple-600">
                                        ${typeof raffle.ticketPrice === 'number' ? raffle.ticketPrice.toFixed(2) : 'N/A'}
                                    </p>
                                </div>
                                <div className="bg-gradient-to-r from-slate-50 to-slate-100 p-6 rounded-lg">
                                    <h3 className="text-sm font-semibold text-slate-500 mb-2">Tickets Sold</h3>
                                    <p className="text-3xl font-bold text-slate-800">
                                        {raffle.currentTickets || 0} / {raffle.totalTickets}
                                    </p>
                                    <div className="w-full bg-slate-200 rounded-full h-3 mt-3">
                                        <div 
                                            className="bg-indigo-500 h-3 rounded-full transition-all duration-300" 
                                            style={{ 
                                                width: `${raffle.totalTickets ? ((raffle.currentTickets || 0) / raffle.totalTickets) * 100 : 0}%` 
                                            }}
                                        ></div>
                                    </div>
                                </div>
                            </>
                        )}

                        {raffle.type === 'fundraising' && (
                            <div className="bg-gradient-to-r from-rose-50 to-orange-50 p-6 rounded-lg md:col-span-2">
                                <h3 className="text-sm font-semibold text-slate-500 mb-2">Fundraising Progress</h3>
                                <div className="flex items-center justify-between mb-2">
                                    <div className="flex items-center gap-2">
                                        <Target className="w-5 h-5 text-rose-600" />
                                        <span className="text-lg font-semibold text-slate-700">
                                            ${(raffle.currentAmount || 0).toLocaleString()} raised
                                        </span>
                                    </div>
                                    <span className="text-sm text-slate-500">
                                        of ${(raffle.target || 0).toLocaleString()} goal
                                    </span>
                                </div>
                                <div className="w-full bg-slate-200 rounded-full h-4">
                                    <div 
                                        className="bg-rose-500 h-4 rounded-full transition-all duration-300" 
                                        style={{ width: `${progress}%` }}
                                    ></div>
                                </div>
                            </div>
                        )}

                        <div className="bg-gradient-to-r from-rose-50 to-orange-50 p-6 rounded-lg md:col-span-2">
                            <h3 className="text-sm font-semibold text-slate-500 mb-2">
                                {raffle.type === 'raffle' ? 'Draw Date' : 'End Date'}
                            </h3>
                            <div className="flex items-center justify-between">
                                <div>
                                    {timeLeft && timeLeft.total > 0 ? (
                                        <div>
                                            <div className="flex gap-4 mb-2">
                                                <div className="text-center">
                                                    <div className="text-2xl font-bold text-rose-600">{timeLeft.days}</div>
                                                    <div className="text-xs text-slate-500">Days</div>
                                                </div>
                                                <div className="text-center">
                                                    <div className="text-2xl font-bold text-rose-600">{timeLeft.hours}</div>
                                                    <div className="text-xs text-slate-500">Hours</div>
                                                </div>
                                                <div className="text-center">
                                                    <div className="text-2xl font-bold text-rose-600">{timeLeft.minutes}</div>
                                                    <div className="text-xs text-slate-500">Minutes</div>
                                                </div>
                                                <div className="text-center">
                                                    <div className="text-2xl font-bold text-rose-600">{timeLeft.seconds}</div>
                                                    <div className="text-xs text-slate-500">Seconds</div>
                                                </div>
                                            </div>
                                        </div>
                                    ) : (
                                        <p className="text-2xl font-bold text-slate-500">Campaign Ended</p>
                                    )}
                                </div>
                                <p className="text-lg text-slate-500">{new Date(raffle.endDate).toLocaleDateString()}</p>
                            </div>
                        </div>
                    </div>

                    {/* Share Section */}
                    <div className="mb-6 p-4 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg">
                        <h3 className="text-lg font-semibold text-slate-800 mb-3">Share This {raffle.type === 'raffle' ? 'Raffle' : 'Fundraiser'}</h3>
                        <div className="flex gap-3">
                            <button
                                onClick={handleShare}
                                className="flex-1 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2"
                            >
                                <Share2 size={16} />
                                Share
                            </button>
                            <button
                                onClick={handleCopyLink}
                                className={`flex-1 px-4 py-2 rounded-lg transition-colors flex items-center justify-center gap-2 ${
                                    copySuccess 
                                        ? 'bg-emerald-600 text-white' 
                                        : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                                }`}
                            >
                                <Copy size={16} />
                                {copySuccess ? 'Copied!' : 'Copy Link'}
                            </button>
                        </div>
                    </div>

                    {/* Custom Content or Default Actions */}
                    {children || (
                        <div className="border-t pt-8">
                            <div className="flex gap-4 justify-center">
                                <button
                                    onClick={onClose}
                                    className="px-6 py-3 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300 transition-colors font-semibold"
                                >
                                    Close
                                </button>
                                {onEnter && timeLeft && timeLeft.total > 0 && (
                                    <button
                                        onClick={() => onEnter(raffle)}
                                        className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-semibold"
                                    >
                                        {raffle.type === 'raffle' ? 'Enter Raffle' : 'Make Donation'}
                                    </button>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default RaffleDetailsModal;
