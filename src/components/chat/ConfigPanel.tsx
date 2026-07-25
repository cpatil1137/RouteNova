'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Settings, X } from 'lucide-react';

export interface TripConfig {
    budget: 'budget' | 'moderate' | 'luxury';
    days: number;
    pace: 'relaxed' | 'moderate' | 'packed';
    interests: string[];
}

interface ConfigPanelProps {
    config: TripConfig;
    onChange: (config: TripConfig) => void;
    isOpen: boolean;
    onClose: () => void;
}

const INTEREST_OPTIONS = [
    { value: 'food', label: '🍽️ Food & Dining', emoji: '🍽️' },
    { value: 'culture', label: '🏛️ Culture & Heritage', emoji: '🏛️' },
    { value: 'nature', label: '🌳 Nature & Parks', emoji: '🌳' },
    { value: 'adventure', label: '⛰️ Adventure', emoji: '⛰️' },
    { value: 'shopping', label: '🛍️ Shopping', emoji: '🛍️' },
    { value: 'nightlife', label: '🌃 Nightlife', emoji: '🌃' },
    { value: 'family', label: '👨‍👩‍👧 Family-Friendly', emoji: '👨‍👩‍👧' },
    { value: 'work', label: '💼 Work & Cafes', emoji: '💼' },
];

export default function ConfigPanel({ config, onChange, isOpen, onClose }: ConfigPanelProps) {

    const toggleInterest = (interest: string) => {
        const newInterests = config.interests.includes(interest)
            ? config.interests.filter(i => i !== interest)
            : [...config.interests, interest];
        onChange({ ...config, interests: newInterests });
    };

    console.log('ConfigPanel Render. isOpen:', isOpen);

    return (
        <>
            {/* Config panel */}
            <div className={`fixed inset-y-0 right-0 w-80 bg-[#0A0A0F]/95 backdrop-blur-2xl border-l border-white/10 shadow-2xl z-[9999] transform transition-transform duration-500 cubic-bezier(0.22, 1, 0.36, 1) ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
                <div className="h-full overflow-y-auto scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
                    <div className="p-6">
                        {/* Header */}
                        <div className="flex items-center justify-between mb-8">
                            <h2 className="text-xl font-bold bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent">Trip Settings</h2>
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={onClose}
                                className="hover:bg-white/10 rounded-full text-white/50 hover:text-white transition-all duration-300"
                            >
                                <X className="w-5 h-5" />
                            </Button>
                        </div>

                        {/* Budget */}
                        <div className="mb-8 group">
                            <Label className="mb-3 block text-xs font-semibold text-white/40 uppercase tracking-wider group-hover:text-cyan-400 transition-colors">Budget Preference</Label>
                            <Select value={config.budget} onValueChange={(value: any) => onChange({ ...config, budget: value })}>
                                <SelectTrigger className="w-full bg-white/5 border-white/10 text-white focus:ring-cyan-500/50 focus:border-cyan-500/50 h-12 rounded-xl transition-all hover:bg-white/10">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent className="bg-[#1A1A23] border-white/10 text-white">
                                    <SelectItem value="budget" className="focus:bg-cyan-500/20 focus:text-cyan-300 cursor-pointer">💰 Budget-Friendly</SelectItem>
                                    <SelectItem value="moderate" className="focus:bg-cyan-500/20 focus:text-cyan-300 cursor-pointer">💵 Moderate</SelectItem>
                                    <SelectItem value="luxury" className="focus:bg-cyan-500/20 focus:text-cyan-300 cursor-pointer">💎 Luxury</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Days */}
                        <div className="mb-8">
                            <div className="flex justify-between items-center mb-4">
                                <Label className="text-xs font-semibold text-white/40 uppercase tracking-wider">Duration</Label>
                                <span className="text-xs font-bold bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 px-3 py-1 rounded-full shadow-[0_0_10px_rgba(6,182,212,0.1)]">
                                    {config.days} Day{config.days > 1 ? 's' : ''}
                                </span>
                            </div>
                            <Slider
                                value={[config.days]}
                                onValueChange={([value]) => onChange({ ...config, days: value })}
                                min={1}
                                max={7}
                                step={1}
                                className="mt-2 [&>.relative>.bg-primary]:bg-cyan-500 [&>.relative>.border-primary]:border-cyan-500"
                            />
                            <div className="flex justify-between text-[10px] text-white/20 mt-3 font-medium uppercase tracking-wide">
                                <span>1 Day</span>
                                <span>1 Week</span>
                            </div>
                        </div>

                        {/* Pace */}
                        <div className="mb-8 group">
                            <Label className="mb-3 block text-xs font-semibold text-white/40 uppercase tracking-wider group-hover:text-cyan-400 transition-colors">Pace</Label>
                            <Select value={config.pace} onValueChange={(value: any) => onChange({ ...config, pace: value })}>
                                <SelectTrigger className="w-full bg-white/5 border-white/10 text-white focus:ring-cyan-500/50 focus:border-cyan-500/50 h-12 rounded-xl transition-all hover:bg-white/10">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent className="bg-[#1A1A23] border-white/10 text-white">
                                    <SelectItem value="relaxed" className="focus:bg-cyan-500/20 focus:text-cyan-300 cursor-pointer">🐢 Relaxed</SelectItem>
                                    <SelectItem value="moderate" className="focus:bg-cyan-500/20 focus:text-cyan-300 cursor-pointer">🚶 Moderate</SelectItem>
                                    <SelectItem value="packed" className="focus:bg-cyan-500/20 focus:text-cyan-300 cursor-pointer">🏃 Fast-Paced</SelectItem>
                                </SelectContent>
                            </Select>
                            <p className="text-[11px] text-white/30 mt-2 pl-1 border-l-2 border-cyan-500/20">
                                {config.pace === 'relaxed' && '2-3 major spots per day.'}
                                {config.pace === 'moderate' && 'Balanced mix of sightseeing.'}
                                {config.pace === 'packed' && 'Maximizing every hour.'}
                            </p>
                        </div>

                        {/* Interests */}
                        <div className="mb-8">
                            <Label className="mb-4 block text-xs font-semibold text-white/40 uppercase tracking-wider">Interests</Label>
                            <div className="grid grid-cols-2 gap-2.5">
                                {INTEREST_OPTIONS.map((option) => (
                                    <button
                                        key={option.value}
                                        onClick={() => toggleInterest(option.value)}
                                        className={`
                                            group relative text-left p-3 rounded-xl border transition-all duration-300 overflow-hidden
                                            ${config.interests.includes(option.value)
                                                ? 'bg-cyan-500/10 border-cyan-500/50 shadow-[0_0_15px_rgba(6,182,212,0.15)]'
                                                : 'bg-white/[0.03] border-white/5 hover:border-white/10 hover:bg-white/[0.05]'
                                            }
                                        `}
                                    >
                                        <div className={`absolute inset-0 bg-gradient-to-r from-cyan-500/10 to-transparent opacity-0 transition-opacity duration-300 ${config.interests.includes(option.value) ? 'opacity-100' : 'group-hover:opacity-50'}`} />

                                        <div className="relative z-10 flex flex-col gap-1.5">
                                            <span className="text-xl filter drop-shadow-lg">{option.emoji}</span>
                                            <span className={`text-[11px] font-medium truncate transition-colors ${config.interests.includes(option.value) ? 'text-cyan-300' : 'text-white/60 group-hover:text-white/90'}`}>
                                                {option.label.split(' ').slice(1).join(' ')}
                                            </span>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Footer / Summary - Optional (can be removed for cleaner look, or styled) */}
                        <div className="p-4 rounded-xl bg-gradient-to-br from-white/5 to-transparent border border-white/5">
                            <div className="flex items-center gap-2 mb-2">
                                <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></div>
                                <span className="text-xs font-medium text-white/70">Configuration Active</span>
                            </div>
                            <p className="text-[10px] text-white/30 leading-relaxed">
                                AI will optimize your itinerary based on these {config.interests.length} preferences.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Overlay */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9990] transition-opacity duration-500"
                    onClick={onClose}
                />
            )}
        </>
    );
}
