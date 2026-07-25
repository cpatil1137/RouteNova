'use client';

import Link from 'next/link';

export default function HeroContent() {
    return (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
            <div className="text-center max-w-4xl px-6 pointer-events-auto">
                {/* Main heading with gradient */}
                <h1 className="text-6xl md:text-8xl font-bold mb-6 bg-gradient-to-r from-purple-400 via-pink-500 to-cyan-400 bg-clip-text text-transparent leading-tight">
                    GraphWander
                </h1>

                {/* Tagline */}
                <p className="text-2xl md:text-3xl text-white/90 mb-4 font-light">
                    AI Routes Over Real Pune
                </p>

                {/* Description */}
                <p className="text-lg text-white/60 mb-10 max-w-2xl mx-auto">
                    Explore Pune's hidden gems with AI-powered route planning.
                    <br />
                    Real 3D buildings. Smart connections. Perfect itineraries.
                </p>

                {/* CTA Button */}
                <Link href="/dashboard">
                    <button className="group relative px-10 py-5 bg-purple-600/20 backdrop-blur-xl border-2 border-purple-500/50 text-white font-semibold text-lg rounded-2xl transition-all duration-300 hover:bg-purple-600/30 hover:border-purple-400 hover:scale-105 hover:shadow-2xl hover:shadow-purple-500/50 active:scale-95 overflow-hidden">
                        {/* Glass morphism background */}
                        <span className="absolute inset-0 bg-gradient-to-r from-purple-600/10 to-pink-600/10 rounded-2xl"></span>

                        {/* Shine effect */}
                        <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-700"></span>

                        {/* Button text */}
                        <span className="relative z-10 flex items-center gap-2">
                            Start Free
                            <svg className="w-5 h-5 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                            </svg>
                        </span>
                    </button>
                </Link>

                {/* Feature badges */}
                <div className="mt-12 flex flex-wrap items-center justify-center gap-4 text-sm">
                    <div className="px-4 py-2 bg-white/5 backdrop-blur-sm border border-white/10 rounded-full text-white/70">
                        ✨ Photorealistic 3D
                    </div>
                    <div className="px-4 py-2 bg-white/5 backdrop-blur-sm border border-white/10 rounded-full text-white/70">
                        🧠 GraphRAG Powered
                    </div>
                    <div className="px-4 py-2 bg-white/5 backdrop-blur-sm border border-white/10 rounded-full text-white/70">
                        🎯 Smart Routes
                    </div>
                </div>
            </div>
        </div>
    );
}
