'use client';

import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { LogOut, User as UserIcon, ChevronDown } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface UserMenuProps {
    showName?: boolean;
}

export default function UserMenu({ showName = false }: UserMenuProps) {
    const { user, logout } = useAuth();
    const router = useRouter();
    const [isOpen, setIsOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    if (!user) return null;

    const displayName = user.displayName || user.email?.split('@')[0] || 'User';
    const initials = displayName
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);

    return (
        <div className="relative" ref={menuRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`group flex items-center gap-3 transition-all duration-300 ${showName
                    ? 'pl-2 pr-4 py-1.5 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20'
                    : 'w-10 h-10 rounded-full hover:scale-105'
                    }`}
            >
                {/* Avatar Circle */}
                <div className={`
                    ${showName ? 'w-9 h-9' : 'w-10 h-10'} 
                    rounded-full bg-gradient-to-br from-pink-500 to-violet-600 flex items-center justify-center text-white font-bold text-sm shadow-lg group-hover:shadow-pink-500/50 transition-all
                    ${!showName && 'w-full h-full'}
                `}>
                    {user.photoURL ? (
                        <img src={user.photoURL} alt={displayName} className="w-full h-full rounded-full object-cover" />
                    ) : (
                        initials
                    )}
                </div>

                {/* Name & Role (Only if showName is true) */}
                {showName && (
                    <div className="text-left hidden md:block">
                        <p className="text-sm font-medium text-white group-hover:text-pink-200 transition-colors">
                            {displayName}
                        </p>
                        <p className="text-xs text-white/50 group-hover:text-white/70 transition-colors">
                            Traveler
                        </p>
                    </div>
                )}

                {showName && (
                    <ChevronDown className={`w-4 h-4 text-white/40 group-hover:text-white/80 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
                )}
            </button>

            {isOpen && (
                <div className="absolute top-full right-0 mt-2 w-72 bg-[#1A1A1A] rounded-xl shadow-2xl border border-white/10 overflow-hidden z-50 animate-scale-in">
                    {/* User Info */}
                    <div className="px-4 py-4 bg-gradient-to-br from-white/5 to-transparent border-b border-white/10">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-cyan-500 to-violet-600 flex items-center justify-center text-white font-bold shadow-lg">
                                {user.photoURL ? (
                                    <img src={user.photoURL} alt={displayName} className="w-full h-full rounded-full object-cover" />
                                ) : (
                                    <span className="text-base">{initials}</span>
                                )}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="font-semibold text-white truncate text-sm">{displayName}</p>
                                <p className="text-xs text-white/50 truncate mt-0.5">Traveler</p>
                            </div>
                        </div>
                        <div className="mt-2 px-2 py-1 bg-white/5 rounded-md border border-white/10">
                            <p className="text-xs text-white/60 truncate">{user.email}</p>
                        </div>
                    </div>

                    {/* Menu Items */}
                    <div className="py-2">
                        <button
                            type="button"
                            className="w-full px-4 py-3 text-left text-sm text-white/90 hover:bg-gradient-to-r hover:from-cyan-500/10 hover:to-violet-500/10 flex items-center gap-3 transition-all group border-l-2 border-transparent hover:border-cyan-500"
                            onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                setIsOpen(false);
                                router.push('/settings');
                            }}
                        >
                            <UserIcon className="w-4 h-4 text-cyan-400 group-hover:scale-110 transition-transform" />
                            <span className="font-medium">Profile Settings</span>
                        </button>
                        <button
                            type="button"
                            className="w-full px-4 py-3 text-left text-sm text-red-400 hover:bg-red-500/10 flex items-center gap-3 transition-all group border-l-2 border-transparent hover:border-red-500"
                            onClick={async (e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                try {
                                    await logout();
                                    setIsOpen(false);
                                    router.push('/login');
                                } catch (error) {
                                    console.error('Logout error:', error);
                                }
                            }}
                        >
                            <LogOut className="w-4 h-4 group-hover:scale-110 transition-transform" />
                            <span className="font-medium">Sign out</span>
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
