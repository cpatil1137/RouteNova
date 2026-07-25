'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useState } from 'react';

interface Place {
    id: string;
    name: string;
    type: string;
    lat: number;
    long: number;
    tags: string[];
    description?: string;
    similarity?: number;
}

interface RecommendationPanelProps {
    onSelectPlace: (place: Place) => void;
}

const QUICK_PREFERENCES = [
    { label: '☕ Cafes & Work', tags: ['cafe', 'wifi', 'coworking', 'quiet'] },
    { label: '🍽️ Fine Dining', tags: ['restaurant', 'upscale', 'romantic', 'rooftop'] },
    { label: '🌳 Nature & Parks', tags: ['park', 'nature', 'outdoor', 'peaceful'] },
    { label: '🏛️ Culture & Heritage', tags: ['museum', 'temple', 'fort', 'heritage'] },
    { label: '🎉 Entertainment', tags: ['mall', 'cinema', 'music', 'nightlife'] },
    { label: '👨‍👩‍👧 Family Fun', tags: ['family', 'kids', 'amusement', 'educational'] },
    { label: '💪 Fitness & Sports', tags: ['fitness', 'yoga', 'sports', 'adventure'] },
    { label: '🛍️ Shopping', tags: ['mall', 'market', 'boutique', 'shopping'] },
];

export default function RecommendationPanel({ onSelectPlace }: RecommendationPanelProps) {
    const [recommendations, setRecommendations] = useState<Place[]>([]);
    const [loading, setLoading] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

    const fetchRecommendations = async (preferences: string[]) => {
        setLoading(true);
        try {
            const response = await fetch('/api/recommendations', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ preferences, limit: 8 }),
            });

            const data = await response.json();
            if (data.success) {
                setRecommendations(data.recommendations);
            }
        } catch (error) {
            console.error('Error fetching recommendations:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCategoryClick = (category: typeof QUICK_PREFERENCES[0]) => {
        setSelectedCategory(category.label);
        fetchRecommendations(category.tags);
    };

    return (
        <div className="h-full flex flex-col bg-gradient-to-br from-slate-50 to-slate-100 rounded-lg p-4 overflow-hidden">
            <div className="mb-4">
                <h2 className="text-xl font-bold text-slate-800 mb-2">✨ Discover Places</h2>
                <p className="text-sm text-slate-600">Quick recommendations based on your interests</p>
            </div>

            {/* Quick Preference Buttons */}
            <div className="grid grid-cols-2 gap-2 mb-4">
                {QUICK_PREFERENCES.map((pref) => (
                    <Button
                        key={pref.label}
                        variant={selectedCategory === pref.label ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => handleCategoryClick(pref)}
                        className="text-xs h-auto py-2 px-3 whitespace-normal text-left justify-start"
                    >
                        {pref.label}
                    </Button>
                ))}
            </div>

            {/* Recommendations List */}
            <div className="flex-1 overflow-y-auto space-y-2">
                {loading && (
                    <div className="flex items-center justify-center h-32">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    </div>
                )}

                {!loading && recommendations.length === 0 && (
                    <div className="text-center text-slate-500 text-sm mt-8">
                        <p>👆 Select a category above</p>
                        <p className="mt-2">to get personalized recommendations!</p>
                    </div>
                )}

                {!loading && recommendations.map((place) => (
                    <Card
                        key={place.id}
                        className="cursor-pointer hover:shadow-md transition-shadow duration-200 border-l-4 border-l-blue-500"
                        onClick={() => onSelectPlace(place)}
                    >
                        <CardContent className="p-3">
                            <div className="flex justify-between items-start mb-1">
                                <h3 className="font-semibold text-sm text-slate-800">{place.name}</h3>
                                {place.similarity && (
                                    <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                                        {Math.round(place.similarity * 100)}%
                                    </span>
                                )}
                            </div>
                            <p className="text-xs text-slate-600 capitalize mb-2">{place.type}</p>
                            {place.description && (
                                <p className="text-xs text-slate-500 line-clamp-2 mb-2">
                                    {place.description}
                                </p>
                            )}
                            <div className="flex flex-wrap gap-1">
                                {place.tags.slice(0, 4).map((tag) => (
                                    <span
                                        key={tag}
                                        className="text-xs bg-slate-200 text-slate-700 px-2 py-0.5 rounded"
                                    >
                                        {tag}
                                    </span>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
}
