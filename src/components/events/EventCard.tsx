'use client';

import { Calendar, MapPin, ExternalLink, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Event {
    id: string;
    title: string;
    description: string;
    startDate: string;
    endDate: string;
    location: {
        name: string;
        lat?: number;
        lon?: number;
    };
    source: 'google_calendar' | 'eventbrite';
    category: string;
    url?: string;
    imageUrl?: string;
}

interface EventCardProps {
    event: Event;
    onAddToPlan?: (event: Event) => void;
}

export default function EventCard({ event, onAddToPlan }: EventCardProps) {
    const safeFormatDate = (dateStr: string) => {
        try {
            const date = new Date(dateStr);
            if (isNaN(date.getTime())) return { date: 'TBD', time: 'TBD' };

            return {
                date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
                time: date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
            };
        } catch (e) {
            return { date: 'TBD', time: 'TBD' };
        }
    };

    const { date: formattedDate, time: formattedTime } = safeFormatDate(event.startDate);

    return (
        <div className="group relative bg-white/5 backdrop-blur-md border border-white/10 rounded-xl overflow-hidden hover:bg-white/10 transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/10">
            {event.imageUrl && (
                <div className="relative h-32 overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent z-10" />
                    <img
                        src={event.imageUrl}
                        alt={event.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute bottom-2 left-2 right-2 z-20 flex justify-between items-end">
                        <span className="text-[10px] font-medium bg-purple-500/80 backdrop-blur text-white px-2 py-0.5 rounded-full border border-purple-400/30">
                            {event.category || 'Event'}
                        </span>
                        <span className="text-[10px] font-medium bg-black/60 backdrop-blur text-white/80 px-2 py-0.5 rounded-full border border-white/10">
                            {event.source === 'google_calendar' ? 'Google' : 'Eventbrite'}
                        </span>
                    </div>
                </div>
            )}

            <div className="p-4">
                <div className="flex items-start gap-3 mb-3">
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500/20 to-blue-500/20 flex items-center justify-center flex-shrink-0 border border-white/10 group-hover:border-purple-500/30 transition-colors">
                        <Calendar className="w-5 h-5 text-purple-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-sm text-white group-hover:text-purple-300 transition-colors truncate">
                            {event.title}
                        </h4>
                        <div className="flex items-center gap-2 text-xs text-white/60 mt-1">
                            <Clock className="w-3 h-3" />
                            <span>{formattedDate} • {formattedTime}</span>
                        </div>
                    </div>
                </div>

                <div className="space-y-2 mb-4">
                    <div className="flex items-center gap-2 text-xs text-white/70">
                        <MapPin className="w-3 h-3 text-white/40" />
                        <span className="truncate">{event.location.name}</span>
                    </div>

                    {event.description && (
                        <p className="text-xs text-white/50 line-clamp-2 leading-relaxed">
                            {event.description}
                        </p>
                    )}
                </div>

                <div className="flex gap-2 pt-2 border-t border-white/5">
                    {onAddToPlan && (
                        <Button
                            onClick={() => onAddToPlan(event)}
                            size="sm"
                            className="flex-1 text-xs bg-white/10 hover:bg-purple-600 hover:text-white border-white/10 text-white/90 backdrop-blur-sm h-8"
                        >
                            Add to Plan
                        </Button>
                    )}
                    {event.url && (
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => window.open(event.url, '_blank')}
                            className="flex-1 text-xs bg-transparent border-white/10 text-white/70 hover:text-white hover:bg-white/5 h-8"
                        >
                            <ExternalLink className="w-3 h-3 mr-1" />
                            Details
                        </Button>
                    )}
                </div>
            </div>
        </div>
    );
}
