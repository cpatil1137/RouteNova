// PuneWanderer Logo Component
// Modern, wanderlust-inspired logo with compass and path elements

export default function PuneWandererLogo({ className = "w-10 h-10" }: { className?: string }) {
    return (
        <svg
            className={className}
            viewBox="0 0 100 100"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
        >
            {/* Outer compass ring */}
            <circle
                cx="50"
                cy="50"
                r="45"
                stroke="url(#gradient1)"
                strokeWidth="3"
                fill="none"
            />

            {/* Compass points */}
            <path
                d="M50 10 L50 20 M50 80 L50 90 M10 50 L20 50 M80 50 L90 50"
                stroke="url(#gradient1)"
                strokeWidth="2"
                strokeLinecap="round"
            />

            {/* Wandering path (S-curve) */}
            <path
                d="M30 70 Q35 60, 40 50 T50 30 T60 20"
                stroke="url(#gradient2)"
                strokeWidth="4"
                strokeLinecap="round"
                fill="none"
                opacity="0.8"
            />

            {/* Location pin at end of path */}
            <g transform="translate(60, 20)">
                <path
                    d="M0 -8 C-4 -8, -7 -5, -7 -1 C-7 3, 0 8, 0 8 C0 8, 7 3, 7 -1 C7 -5, 4 -8, 0 -8 Z"
                    fill="url(#gradient3)"
                />
                <circle cx="0" cy="-1" r="2" fill="white" />
            </g>

            {/* Center star/sparkle */}
            <path
                d="M50 45 L51 48 L54 48 L51.5 50 L52.5 53 L50 51 L47.5 53 L48.5 50 L46 48 L49 48 Z"
                fill="url(#gradient3)"
            />

            {/* Gradients */}
            <defs>
                <linearGradient id="gradient1" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#ec4899" />
                    <stop offset="50%" stopColor="#a855f7" />
                    <stop offset="100%" stopColor="#06b6d4" />
                </linearGradient>

                <linearGradient id="gradient2" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#06b6d4" />
                    <stop offset="100%" stopColor="#ec4899" />
                </linearGradient>

                <linearGradient id="gradient3" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#fbbf24" />
                    <stop offset="100%" stopColor="#f59e0b" />
                </linearGradient>
            </defs>
        </svg>
    );
}
