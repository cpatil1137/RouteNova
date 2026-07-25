'use client';

import { useState, useEffect } from 'react';
import { Loader2, Phone, Globe, MapPin, Clock, Star, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface PlaceDetails {
    name: string;
    rating: number | null;
    userRatingsTotal: number;
    phoneNumber: string | null;
    website: string | null;
    address: string | null;
    openingHours: {
        weekdayText: string[];
        openNow: boolean;
    } | null;
    priceLevel: number | null;
    googleMapsUrl: string | null;
    reviews: Array<{
        author: string;
        rating: number;
        text: string;
        time: string;
    }>;
}

interface EnhancedPlaceCardProps {
    place: any;
    onClick: () => void;
}

export default function EnhancedPlaceCard({ place, onClick }: EnhancedPlaceCardProps) {
    const [photoUrl, setPhotoUrl] = useState<string | null>(null);
    const [details, setDetails] = useState<PlaceDetails | null>(null);
    const [loading, setLoading] = useState(true);
    const [showFullDetails, setShowFullDetails] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            if (!place.id) {
                setLoading(false);
                return;
            }

            try {
                // Fetch photo and details in parallel
                const [photoRes, detailsRes] = await Promise.all([
                    fetch(`/api/place-photo?placeId=${place.id}`),
                    fetch(`/api/place-details?placeId=${place.id}`),
                ]);

                const photoData = await photoRes.json();
                const detailsData = await detailsRes.json();

                setPhotoUrl(photoData.photoUrl);
                if (detailsData.success) {
                    setDetails(detailsData.details);
                }
            } catch (error) {
                console.error('Error fetching place data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [place.id]);

    const getPriceLevelSymbol = (level: number | null) => {
        if (!level) return null;
        return '₹'.repeat(level);
    };

    return (
        <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden hover:bg-white/10 hover:border-white/20 transition-all duration-300 group">
            {/* Image and basic info */}
            <div className="flex gap-3 p-3 cursor-pointer" onClick={onClick}>
                <div className="w-24 h-24 bg-gradient-to-br from-white/5 to-white/10 rounded-lg flex-shrink-0 overflow-hidden border border-white/5">
                    {loading ? (
                        <div className="w-full h-full flex items-center justify-center">
                            <Loader2 className="w-6 h-6 text-white/20 animate-spin" />
                        </div>
                    ) : photoUrl ? (
                        <img src={photoUrl} alt={place.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center text-3xl">
                            {place.type === 'cafe' ? '☕' : place.type === 'restaurant' ? '🍽️' : place.type === 'park' ? '🌳' : '📍'}
                        </div>
                    )}
                </div>

                <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-sm text-white truncate group-hover:text-cyan-400 transition-colors">{place.name}</h4>

                    {/* Rating */}
                    {details?.rating && (
                        <div className="flex items-center gap-1 mt-1">
                            <Star className="w-3 h-3 fill-yellow-500 text-yellow-500" />
                            <span className="text-xs font-medium text-white/90">{details.rating.toFixed(1)}</span>
                            <span className="text-xs text-white/50">({details.userRatingsTotal})</span>
                            {details.priceLevel && (
                                <span className="text-xs text-white/40 ml-2">{getPriceLevelSymbol(details.priceLevel)}</span>
                            )}
                        </div>
                    )}

                    {/* Opening hours */}
                    {details?.openingHours && (
                        <div className="flex items-center gap-1 mt-1">
                            <Clock className="w-3 h-3 text-white/40" />
                            <span className={`text-xs font-medium ${details.openingHours.openNow ? 'text-green-400' : 'text-red-400'}`}>
                                {details.openingHours.openNow ? 'Open now' : 'Closed'}
                            </span>
                        </div>
                    )}

                    <p className="text-xs text-white/40 capitalize mt-1">{place.type}</p>
                </div>
            </div>

            {/* Expandable details */}
            {details && (
                <div className="border-t border-white/5 bg-black/20">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowFullDetails(!showFullDetails)}
                        className="w-full text-xs py-2 text-white/60 hover:text-white hover:bg-white/5"
                    >
                        {showFullDetails ? 'Show less' : 'Show more details'}
                    </Button>

                    {showFullDetails && (
                        <div className="px-3 pb-3 space-y-2 text-xs">
                            {/* Address */}
                            {details.address && (
                                <div className="flex items-start gap-2">
                                    <MapPin className="w-3 h-3 text-white/40 mt-0.5 flex-shrink-0" />
                                    <span className="text-white/70">{details.address}</span>
                                </div>
                            )}

                            {/* Phone */}
                            {details.phoneNumber && (
                                <div className="flex items-center gap-2">
                                    <Phone className="w-3 h-3 text-white/40 flex-shrink-0" />
                                    <a href={`tel:${details.phoneNumber}`} className="text-cyan-400 hover:text-cyan-300 hover:underline">
                                        {details.phoneNumber}
                                    </a>
                                </div>
                            )}

                            {/* Website */}
                            {details.website && (
                                <div className="flex items-center gap-2">
                                    <Globe className="w-3 h-3 text-white/40 flex-shrink-0" />
                                    <a
                                        href={details.website}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-cyan-400 hover:text-cyan-300 hover:underline truncate"
                                    >
                                        Visit website
                                    </a>
                                </div>
                            )}

                            {/* Google Maps link */}
                            {details.googleMapsUrl && (
                                <div className="flex items-center gap-2">
                                    <ExternalLink className="w-3 h-3 text-white/40 flex-shrink-0" />
                                    <a
                                        href={details.googleMapsUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-cyan-400 hover:text-cyan-300 hover:underline"
                                    >
                                        View on Google Maps
                                    </a>
                                </div>
                            )}

                            {/* Opening hours */}
                            {details.openingHours?.weekdayText && details.openingHours.weekdayText.length > 0 && (
                                <div className="mt-2">
                                    <p className="font-medium text-white/80 mb-1">Hours:</p>
                                    <div className="text-white/60 space-y-0.5">
                                        {details.openingHours.weekdayText.map((day, idx) => (
                                            <div key={idx}>{day}</div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Reviews */}
                            {details.reviews.length > 0 && (
                                <div className="mt-2">
                                    <p className="font-medium text-white/80 mb-1">Recent Reviews:</p>
                                    <div className="space-y-2">
                                        {details.reviews.map((review, idx) => (
                                            <div key={idx} className="bg-white/5 rounded p-2 border border-white/5">
                                                <div className="flex items-center gap-1 mb-1">
                                                    <Star className="w-3 h-3 fill-yellow-500 text-yellow-500" />
                                                    <span className="font-medium text-white/90">{review.rating}</span>
                                                    <span className="text-white/40">• {review.author}</span>
                                                    <span className="text-white/30">• {review.time}</span>
                                                </div>
                                                <p className="text-white/70 line-clamp-2">{review.text}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Tags */}
                            {place.tags && place.tags.length > 0 && (
                                <div className="flex flex-wrap gap-1 mt-2">
                                    {place.tags.slice(0, 5).map((tag: string) => (
                                        <span
                                            key={tag}
                                            className="text-xs bg-violet-500/10 text-violet-300 border border-violet-500/20 px-2 py-0.5 rounded-full"
                                        >
                                            {tag}
                                        </span>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
