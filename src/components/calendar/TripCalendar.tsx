'use client';

import { useState } from 'react';
import { Calendar as CalendarIcon, Plus, MapPin, Clock, Users, DollarSign } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Trip {
    id: string;
    title: string;
    destination: string;
    startDate: string;
    endDate: string;
    budget: string;
    travelers: number;
    status: 'upcoming' | 'ongoing' | 'completed';
}

export default function TripCalendar() {
    const [trips, setTrips] = useState<Trip[]>([
        {
            id: '1',
            title: 'Weekend Getaway',
            destination: 'Lonavala',
            startDate: '2026-01-15',
            endDate: '2026-01-17',
            budget: '₹15,000',
            travelers: 2,
            status: 'upcoming',
        },
        {
            id: '2',
            title: 'Historical Tour',
            destination: 'Shaniwar Wada',
            startDate: '2026-01-10',
            endDate: '2026-01-10',
            budget: '₹2,000',
            travelers: 4,
            status: 'completed',
        },
    ]);

    const formatDate = (dateStr: string) => {
        const date = new Date(dateStr);
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'upcoming':
                return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
            case 'ongoing':
                return 'bg-green-500/10 text-green-400 border-green-500/20';
            case 'completed':
                return 'bg-gray-500/10 text-gray-400 border-gray-500/20';
            default:
                return 'bg-gray-500/10 text-gray-400 border-gray-500/20';
        }
    };

    return (
        <div className="h-full flex flex-col p-8 overflow-y-auto">
            <div className="max-w-6xl mx-auto w-full">
                {/* Header */}
                <div className="mb-8 animate-fade-in">
                    <h1 className="text-4xl font-bold bg-gradient-to-r from-white via-pink-400 to-violet-600 bg-clip-text text-transparent mb-2">
                        Trip Calendar
                    </h1>
                    <p className="text-white/60">Plan and manage your trips to Pune</p>
                </div>

                {/* Action Bar */}
                <div className="flex items-center justify-between mb-6 animate-slide-in-left">
                    <div className="flex gap-3">
                        <Button className="bg-gradient-to-r from-pink-500 to-violet-600 hover:from-pink-600 hover:to-violet-700 text-white">
                            <Plus className="w-4 h-4 mr-2" />
                            New Trip
                        </Button>
                        <Button variant="outline" className="border-white/20 text-white/80 hover:bg-white/5">
                            <CalendarIcon className="w-4 h-4 mr-2" />
                            View Calendar
                        </Button>
                    </div>
                    <div className="flex gap-2">
                        <button className="px-4 py-2 rounded-lg bg-pink-500/10 text-pink-400 border border-pink-500/20 text-sm">
                            Upcoming
                        </button>
                        <button className="px-4 py-2 rounded-lg hover:bg-white/5 text-white/60 text-sm">
                            Completed
                        </button>
                        <button className="px-4 py-2 rounded-lg hover:bg-white/5 text-white/60 text-sm">
                            All
                        </button>
                    </div>
                </div>

                {/* Trips Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {trips.map((trip, idx) => (
                        <div
                            key={trip.id}
                            className="glass-panel rounded-2xl p-6 hover:bg-white/10 transition-all duration-300 cursor-pointer group animate-scale-in border border-white/10"
                            style={{ animationDelay: `${idx * 0.1}s` }}
                        >
                            {/* Status Badge */}
                            <div className="flex items-center justify-between mb-4">
                                <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(trip.status)}`}>
                                    {trip.status.charAt(0).toUpperCase() + trip.status.slice(1)}
                                </span>
                                <button className="text-white/40 hover:text-white/80 transition-colors">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                                    </svg>
                                </button>
                            </div>

                            {/* Trip Info */}
                            <h3 className="text-xl font-semibold text-white mb-2 group-hover:text-pink-400 transition-colors">
                                {trip.title}
                            </h3>

                            <div className="space-y-3 mb-4">
                                <div className="flex items-center gap-2 text-white/60 text-sm">
                                    <MapPin className="w-4 h-4 text-pink-400" />
                                    {trip.destination}
                                </div>
                                <div className="flex items-center gap-2 text-white/60 text-sm">
                                    <Clock className="w-4 h-4 text-violet-400" />
                                    {formatDate(trip.startDate)} - {formatDate(trip.endDate)}
                                </div>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2 text-white/60 text-sm">
                                        <Users className="w-4 h-4 text-blue-400" />
                                        {trip.travelers} travelers
                                    </div>
                                    <div className="flex items-center gap-2 text-white/60 text-sm">
                                        <DollarSign className="w-4 h-4 text-green-400" />
                                        {trip.budget}
                                    </div>
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="flex gap-2 pt-4 border-t border-white/10">
                                <Button variant="outline" size="sm" className="flex-1 border-white/20 text-white/80 hover:bg-white/5 text-xs">
                                    View Details
                                </Button>
                                <Button variant="outline" size="sm" className="flex-1 border-pink-500/20 text-pink-400 hover:bg-pink-500/10 text-xs">
                                    Edit Trip
                                </Button>
                            </div>
                        </div>
                    ))}

                    {/* Add New Trip Card */}
                    <div className="glass-panel rounded-2xl p-6 border-2 border-dashed border-white/20 hover:border-pink-500/50 transition-all duration-300 cursor-pointer group flex items-center justify-center min-h-[300px]">
                        <div className="text-center">
                            <div className="w-16 h-16 rounded-full bg-gradient-to-r from-pink-500/20 to-violet-500/20 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                                <Plus className="w-8 h-8 text-pink-400" />
                            </div>
                            <h3 className="text-lg font-medium text-white/80 mb-2">Plan New Trip</h3>
                            <p className="text-sm text-white/50">Create a new trip itinerary</p>
                        </div>
                    </div>
                </div>

                {/* Empty State (if no trips) */}
                {trips.length === 0 && (
                    <div className="text-center py-16">
                        <CalendarIcon className="w-16 h-16 text-white/20 mx-auto mb-4" />
                        <h3 className="text-xl font-medium text-white/60 mb-2">No trips planned yet</h3>
                        <p className="text-white/40 mb-6">Start planning your next adventure to Pune</p>
                        <Button className="bg-gradient-to-r from-pink-500 to-violet-600 hover:from-pink-600 hover:to-violet-700 text-white">
                            <Plus className="w-4 h-4 mr-2" />
                            Create Your First Trip
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
}
