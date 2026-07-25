'use client';

import { cn } from '@/lib/utils';
import { Bot, User, Calendar } from 'lucide-react';
import EnhancedPlaceCard from './PlaceCardWithImage';
import EventCard from '@/components/events/EventCard';
import { Button } from '@/components/ui/button';

export interface Message {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    places?: any[];
    events?: any[];
    timestamp: Date;
    followUpQuestions?: string[];
    showEventSuggestion?: boolean;
}

interface ChatMessageProps {
    message: Message;
    onPlaceClick?: (place: any) => void;
    onFollowUpClick?: (question: string) => void;
}

export default function ChatMessage({ message, onPlaceClick, onFollowUpClick }: ChatMessageProps) {
    const isUser = message.role === 'user';

    return (
        <div className={cn('flex gap-3 p-4', isUser ? 'justify-end' : 'justify-start')}>
            {!isUser && (
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-cyan-500 to-cyan-600 flex items-center justify-center">
                    <Bot className="w-5 h-5 text-white" />
                </div>
            )}

            <div className={cn('flex flex-col gap-2 max-w-[80%]', isUser && 'items-end')}>
                {/* Message bubble */}
                <div
                    className={cn(
                        'rounded-2xl px-4 py-3',
                        isUser
                            ? 'bg-violet-500/20 text-violet-100 shadow-[0_0_15px_rgba(139,92,246,0.3)] border border-violet-500/50 backdrop-blur-sm'
                            : 'bg-white/5 border border-white/10 text-white'
                    )}
                >
                    <p className={cn('text-sm whitespace-pre-wrap', isUser ? 'text-white' : 'text-white/90')}>
                        {message.content}
                    </p>
                </div>

                {/* Place cards */}
                {message.places && message.places.length > 0 && (
                    <div className="grid grid-cols-1 gap-2 w-full">
                        {message.places.map((place, idx) => (
                            <EnhancedPlaceCard
                                key={place.id || idx}
                                place={place}
                                onClick={() => onPlaceClick?.(place)}
                            />
                        ))}
                    </div>
                )}

                {/* Event cards */}
                {message.events && message.events.length > 0 && (
                    <div className="w-full">
                        <div className="flex items-center gap-2 mb-2 px-2">
                            <Calendar className="w-4 h-4 text-purple-600" />
                            <h3 className="text-sm font-semibold text-gray-900">
                                Events Happening Nearby ({message.events.length})
                            </h3>
                        </div>
                        <div className="grid grid-cols-1 gap-2">
                            {message.events.map((event: any, idx: number) => (
                                <EventCard
                                    key={event.id || idx}
                                    event={event}
                                    onAddToPlan={(e) => console.log('Add event to plan:', e)}
                                />
                            ))}
                        </div>
                    </div>
                )}

                {/* Event suggestion */}
                {message.showEventSuggestion && (
                    <div className="bg-gradient-to-r from-violet-500/10 to-cyan-500/10 border border-violet-500/20 rounded-xl p-3 w-full backdrop-blur-md">
                        <div className="flex items-start gap-2">
                            <Calendar className="w-5 h-5 text-violet-400 mt-0.5 flex-shrink-0" />
                            <div className="flex-1">
                                <p className="text-sm font-medium text-violet-100 mb-2">
                                    Want to see what's happening?
                                </p>
                                <Button
                                    size="sm"
                                    onClick={() => onFollowUpClick?.('Show me events happening in this area')}
                                    className="bg-violet-600 hover:bg-violet-500 text-white shadow-lg shadow-violet-500/25 border border-violet-500/50 transition-all duration-300"
                                >
                                    Show Events Near Here
                                </Button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Follow-up questions */}
                {message.followUpQuestions && message.followUpQuestions.length > 0 && (
                    <div className="flex flex-wrap gap-2 w-full">
                        {message.followUpQuestions.map((question, idx) => (
                            <Button
                                key={idx}
                                variant="outline"
                                size="sm"
                                onClick={() => onFollowUpClick?.(question)}
                                className="text-xs bg-white/5 hover:bg-white/10 border-white/10 text-white/70 hover:text-white transition-all duration-300"
                            >
                                {question}
                            </Button>
                        ))}
                    </div>
                )}

                {/* Timestamp */}
                <span className="text-xs text-gray-400 px-2">
                    {message.timestamp.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                </span>
            </div>

            {isUser && (
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-gray-600 to-gray-700 flex items-center justify-center">
                    <User className="w-5 h-5 text-white" />
                </div>
            )}
        </div>
    );
}
