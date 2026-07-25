'use client';

import { useState, useEffect } from 'react';
import { X, Calendar, MapPin, ExternalLink, Bell } from 'lucide-react';
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

interface InAppNotificationProps {
    event: Event;
    onDismiss: () => void;
    onAddToPlan?: (event: Event) => void;
}

export function InAppNotification({ event, onDismiss, onAddToPlan }: InAppNotificationProps) {
    const [isVisible, setIsVisible] = useState(true);

    const handleDismiss = () => {
        setIsVisible(false);
        setTimeout(onDismiss, 300);
    };

    if (!isVisible) return null;

    const startDate = new Date(event.startDate);
    const formattedDate = startDate.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
    });

    return (
        <div className="fixed top-20 right-6 z-50 w-96 bg-white rounded-lg shadow-2xl border-2 border-blue-500 animate-slide-in-right">
            <div className="p-4">
                {/* Header */}
                <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                            <Bell className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <p className="font-semibold text-gray-900">Event near your plan!</p>
                            <p className="text-xs text-gray-500">Happening during your trip</p>
                        </div>
                    </div>
                    <Button variant="ghost" size="icon" onClick={handleDismiss} className="h-6 w-6">
                        <X className="w-4 h-4" />
                    </Button>
                </div>

                {/* Event details */}
                <div className="space-y-2">
                    {event.imageUrl && (
                        <img
                            src={event.imageUrl}
                            alt={event.title}
                            className="w-full h-32 object-cover rounded-lg"
                        />
                    )}

                    <h3 className="font-semibold text-gray-900">{event.title}</h3>

                    <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Calendar className="w-4 h-4" />
                        <span>{formattedDate}</span>
                    </div>

                    <div className="flex items-center gap-2 text-sm text-gray-600">
                        <MapPin className="w-4 h-4" />
                        <span>{event.location.name}</span>
                    </div>

                    {event.description && (
                        <p className="text-sm text-gray-700 line-clamp-2">{event.description}</p>
                    )}

                    <div className="flex items-center gap-2 pt-2">
                        <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                            {event.category}
                        </span>
                        <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-full">
                            {event.source === 'google_calendar' ? 'Google Calendar' : 'Eventbrite'}
                        </span>
                    </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2 mt-4">
                    {onAddToPlan && (
                        <Button
                            onClick={() => {
                                onAddToPlan(event);
                                handleDismiss();
                            }}
                            className="flex-1"
                            size="sm"
                        >
                            Add to Plan
                        </Button>
                    )}
                    {event.url && (
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => window.open(event.url, '_blank')}
                            className="flex-1"
                        >
                            <ExternalLink className="w-4 h-4 mr-1" />
                            Details
                        </Button>
                    )}
                </div>
            </div>
        </div>
    );
}

interface NotificationManagerProps {
    tripDates?: { start: string; end: string };
    userLocation?: { lat: number; lon: number };
    interests?: string[];
}

export default function NotificationManager({
    tripDates,
    userLocation,
    interests = [],
}: NotificationManagerProps) {
    const [notifications, setNotifications] = useState<Event[]>([]);
    const [dismissedIds, setDismissedIds] = useState<Set<string>>(new Set());

    useEffect(() => {
        if (!tripDates) return;

        const fetchEvents = async () => {
            try {
                const response = await fetch('/api/events', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        startDate: tripDates.start,
                        endDate: tripDates.end,
                        location: userLocation,
                        interests,
                    }),
                });

                const data = await response.json();
                if (data.success && data.events.length > 0) {
                    // Show top 3 most relevant events
                    setNotifications(data.events.slice(0, 3));
                }
            } catch (error) {
                console.error('Error fetching events:', error);
            }
        };

        fetchEvents();
    }, [tripDates, userLocation, interests]);

    const handleDismiss = (eventId: string) => {
        setDismissedIds(prev => new Set([...prev, eventId]));
    };

    const visibleNotifications = notifications.filter(event => !dismissedIds.has(event.id));

    return (
        <>
            {visibleNotifications.map((event, index) => (
                <div key={event.id} style={{ top: `${80 + index * 10}px` }}>
                    <InAppNotification
                        event={event}
                        onDismiss={() => handleDismiss(event.id)}
                        onAddToPlan={(e) => console.log('Add to plan:', e)}
                    />
                </div>
            ))}
        </>
    );
}
