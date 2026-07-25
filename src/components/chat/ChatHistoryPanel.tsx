'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { getUserChatSessions, ChatSession } from '@/lib/chat-history';
import { MessageSquare, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ChatHistoryPanelProps {
    currentSessionId: string | null;
    onSessionSelect: (sessionId: string) => void;
    onNewChat: () => void;
}

export default function ChatHistoryPanel({
    currentSessionId,
    onSessionSelect,
    onNewChat,
}: ChatHistoryPanelProps) {
    const { user } = useAuth();
    const [sessions, setSessions] = useState<ChatSession[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (user) {
            loadSessions();
        }
    }, [user]);

    const loadSessions = async () => {
        if (!user) return;

        setLoading(true);
        try {
            const userSessions = await getUserChatSessions(user.uid);
            setSessions(userSessions);
        } catch (error) {
            console.error('Error loading sessions:', error);
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (date: Date) => {
        const now = new Date();
        const diff = now.getTime() - date.getTime();
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));

        if (days === 0) return 'Today';
        if (days === 1) return 'Yesterday';
        if (days < 7) return `${days} days ago`;
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    };

    return (
        <div className="w-64 bg-[#0F0F0F] border-r border-white/10 flex flex-col">
            {/* Header */}
            <div className="p-3">
                <Button
                    onClick={onNewChat}
                    className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white rounded-lg"
                >
                    <Plus className="w-4 h-4 mr-2" />
                    New Chat
                </Button>
            </div>

            {/* Sessions List */}
            <div className="flex-1 overflow-y-auto">
                {loading ? (
                    <div className="p-4 text-center text-white/40 text-sm">Loading...</div>
                ) : sessions.length === 0 ? (
                    <div className="p-4 text-center text-white/40 text-sm">
                        No chat history yet
                    </div>
                ) : (
                    <div className="py-2">
                        {sessions.map((session) => (
                            <button
                                key={session.id}
                                onClick={() => onSessionSelect(session.id)}
                                className={`w-full text-left px-3 py-2.5 hover:bg-white/5 transition-colors border-l-2 ${currentSessionId === session.id
                                        ? 'border-cyan-500 bg-white/5'
                                        : 'border-transparent'
                                    }`}
                            >
                                <div className="flex items-start gap-2">
                                    <MessageSquare className="w-4 h-4 text-white/40 mt-0.5 flex-shrink-0" />
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-white truncate">
                                            {session.title}
                                        </p>
                                        {session.lastMessage && (
                                            <p className="text-xs text-white/40 truncate mt-0.5">
                                                {session.lastMessage}
                                            </p>
                                        )}
                                        <p className="text-xs text-white/30 mt-1">
                                            {formatDate(session.updatedAt)}
                                        </p>
                                    </div>
                                </div>
                            </button>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
