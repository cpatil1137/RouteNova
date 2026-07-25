'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import dynamic from 'next/dynamic';
import PuneWandererLogo from '@/components/brand/PuneWandererLogo';

// Dynamic imports for client-side only components
const WaterShaderBackground = dynamic(() => import('@/components/hero/WaterShaderBackground'), {
    ssr: false,
});


const TubesBackground = dynamic(() => import('@/components/effects/TubesBackground'), {
    ssr: false,
});

export default function LandingPage() {
    return (
        <div className="min-h-screen bg-black text-white overflow-hidden">
            {/* Water Shader Section - Hero & Dashboard */}
            <div className="relative bg-black">
                {/* Water Shader Background */}
                <WaterShaderBackground />

                {/* Navigation */}
                <nav className="relative z-50 flex items-center justify-between px-8 py-6 max-w-[1400px] mx-auto">
                    <Link href="/" className="flex items-center gap-2">
                        <PuneWandererLogo className="w-10 h-10" />
                        <span className="text-xl font-bold">PuneWanderer</span>
                    </Link>

                    <div className="hidden md:flex items-center gap-1 bg-[#1a1a1a] rounded-full px-2 py-2">
                        <Link href="#home" className="px-5 py-2 text-sm text-white/90 hover:text-white transition-colors rounded-full">
                            Home
                        </Link>
                        <Link href="#features" className="px-5 py-2 text-sm text-white/60 hover:text-white transition-colors rounded-full">
                            Features
                        </Link>
                        <Link href="#how-it-works" className="px-5 py-2 text-sm text-white/60 hover:text-white transition-colors rounded-full">
                            How it works
                        </Link>
                        <Link href="#pricing" className="px-5 py-2 text-sm text-white/60 hover:text-white transition-colors rounded-full">
                            Pricing
                        </Link>
                        <Link href="#faq" className="px-5 py-2 text-sm text-white/60 hover:text-white transition-colors rounded-full">
                            FAQ
                        </Link>
                        <Link href="#testimonial" className="px-5 py-2 text-sm text-white/60 hover:text-white transition-colors rounded-full">
                            Testimonial
                        </Link>
                    </div>

                    <Link href="/signup">
                        <Button className="bg-[#2a2a2a] hover:bg-[#3a3a3a] text-white font-medium px-6 py-2 rounded-full border border-white/10">
                            Sign Up
                        </Button>
                    </Link>
                </nav>

                {/* Hero Section */}
                <div className="relative pt-32 pb-20">
                    {/* Hero Content */}
                    <div className="relative z-10 text-center px-6 max-w-5xl mx-auto">
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#1a1a1a] border border-white/10 mb-8">
                            <span className="text-sm text-white/70">Your Travel Plans, Fully Under Control</span>
                        </div>

                        <h1 className="text-6xl md:text-7xl lg:text-8xl font-bold leading-[1.1] mb-6">
                            Discover Pune With
                            <br />
                            AI-Powered Planning
                        </h1>

                        <p className="text-lg text-white/50 max-w-3xl mx-auto leading-relaxed mb-12">
                            Plan, explore, and optimize your Pune adventure with intelligent recommendations
                            <br />
                            powered by Knowledge Graphs for accuracy, speed, and personalization.
                        </p>
                    </div>
                </div>

                {/* Dashboard Preview */}
                <div className="relative z-10 px-6 max-w-[1400px] mx-auto pb-20">
                    <div className="relative rounded-3xl overflow-hidden border border-white/10 shadow-[0_0_40px_rgba(255,255,255,0.05)]">
                        {/* Dashboard Container */}
                        <div className="bg-gradient-to-br from-[#1a1a1a] to-[#0a0a0a] p-8">
                            {/* Dashboard Header */}
                            <div className="flex items-center justify-between mb-8 pb-6 border-b border-white/10">
                                <div className="flex items-center gap-4">
                                    <h1 className="text-xl font-semibold bg-gradient-to-r from-white via-pink-400 to-violet-600 bg-clip-text text-transparent">
                                        PuneWanderer
                                    </h1>
                                    <span className="px-3 py-1 text-xs font-medium bg-gradient-to-r from-pink-500/10 to-violet-500/10 text-pink-400 rounded-full border border-pink-500/20">
                                        AI-Powered
                                    </span>
                                </div>

                                <div className="flex items-center gap-4">
                                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-pink-500 to-violet-600" />
                                    <span className="text-sm font-medium text-white">Guest User</span>
                                </div>
                            </div>

                            {/* Main Chat Interface */}
                            <div className="space-y-6">
                                {/* Welcome Message */}
                                <div className="mb-8">
                                    <h2 className="text-5xl font-normal mb-1 bg-gradient-to-r from-white via-pink-400 to-violet-600 bg-clip-text text-transparent">
                                        Hello there,
                                    </h2>
                                    <h2 className="text-5xl font-normal bg-gradient-to-r from-white via-pink-400 to-violet-600 bg-clip-text text-transparent">
                                        How can I help you?
                                    </h2>
                                    <p className="text-white/50 mt-6 text-lg">
                                        Use one of the most common prompts below <br />
                                        or use one of your own prompt to begin
                                    </p>
                                </div>

                                {/* Quick Prompts */}
                                <div className="grid grid-cols-3 gap-3 mb-8">
                                    <button className="group relative border border-white/20 hover:bg-white/5 rounded-xl p-4 transition-all duration-300 text-white/80 hover:text-white text-left">
                                        Plan a 2-day itinerary in Pune
                                        <svg
                                            className="absolute right-2 bottom-2 h-4 text-white/50 opacity-0 -translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300"
                                            xmlns="http://www.w3.org/2000/svg"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                            stroke="currentColor"
                                        >
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                        </svg>
                                    </button>
                                    <button className="group relative border border-white/20 hover:bg-white/5 rounded-xl p-4 transition-all duration-300 text-white/80 hover:text-white text-left">
                                        Find top cafes for work & coffee
                                        <svg
                                            className="absolute right-2 bottom-2 h-4 text-white/50 opacity-0 -translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300"
                                            xmlns="http://www.w3.org/2000/svg"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                            stroke="currentColor"
                                        >
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                        </svg>
                                    </button>
                                    <button className="group relative border border-white/20 hover:bg-white/5 rounded-xl p-4 transition-all duration-300 text-white/80 hover:text-white text-left">
                                        Explore Pune's best restaurants
                                        <svg
                                            className="absolute right-2 bottom-2 h-4 text-white/50 opacity-0 -translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300"
                                            xmlns="http://www.w3.org/2000/svg"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                            stroke="currentColor"
                                        >
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                        </svg>
                                    </button>
                                </div>

                                {/* Sample Chat Messages */}
                                <div className="space-y-4 mb-6">
                                    {/* User Message */}
                                    <div className="flex justify-end">
                                        <div className="max-w-[70%] bg-gradient-to-r from-pink-500/20 to-violet-600/20 border border-pink-500/30 rounded-2xl px-4 py-3">
                                            <p className="text-white text-sm">
                                                Plan a weekend trip to Pune with cafes and historical places
                                            </p>
                                        </div>
                                    </div>

                                    {/* AI Response */}
                                    <div className="flex justify-start">
                                        <div className="max-w-[80%] bg-white/5 border border-white/10 rounded-2xl px-4 py-3">
                                            <p className="text-white/90 text-sm mb-3">
                                                I've created a perfect weekend itinerary for you! Here are some amazing places:
                                            </p>
                                            <div className="grid grid-cols-2 gap-2">
                                                <div className="bg-white/5 rounded-lg p-2 border border-white/10">
                                                    <p className="text-pink-400 text-xs font-medium">☕ Cafe Goodluck</p>
                                                    <p className="text-white/60 text-xs">Historic cafe since 1935</p>
                                                </div>
                                                <div className="bg-white/5 rounded-lg p-2 border border-white/10">
                                                    <p className="text-pink-400 text-xs font-medium">🏰 Shaniwar Wada</p>
                                                    <p className="text-white/60 text-xs">18th century fort</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Input Box */}
                                <div className="relative">
                                    <div className="bg-white/5 border border-white/10 rounded-2xl px-4 py-3 flex items-center gap-3">
                                        <input
                                            type="text"
                                            placeholder="Ask me anything about Pune..."
                                            className="flex-1 bg-transparent text-white placeholder:text-white/40 focus:outline-none text-sm"
                                            disabled
                                        />
                                        <button className="bg-gradient-to-r from-pink-500 to-violet-600 text-white px-4 py-2 rounded-xl text-sm font-medium hover:from-pink-600 hover:to-violet-700 transition-all">
                                            Send
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div >

            {/* Features Section - Full Black Background */}
            < div className="bg-black w-full" >
                <div className="px-6 max-w-[1400px] mx-auto py-32">
                    <div className="text-center mb-16">
                        <h2 className="text-5xl font-bold text-white mb-4">
                            Exceptional Travel Planning
                        </h2>
                        <p className="text-white/50 text-lg max-w-3xl mx-auto">
                            Experience seamless, intelligent, and personalized trip planning built to simplify your journey
                            <br />
                            and support your exploration on any platform.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {/* Feature 1: AI-Powered Planning */}
                        <div className="group relative bg-gradient-to-br from-[#1a1a1a] to-[#0a0a0a] rounded-3xl p-8 border border-white/10 transition-all duration-300">
                            <svg className="absolute inset-0 w-full h-full rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" style={{ pointerEvents: 'none' }}>
                                <defs>
                                    <linearGradient id="borderGradient" gradientUnits="userSpaceOnUse">
                                        <stop offset="0%" stopColor="#ec4899" stopOpacity="0" />
                                        <stop offset="50%" stopColor="#ec4899" stopOpacity="1" />
                                        <stop offset="100%" stopColor="#ec4899" stopOpacity="0" />
                                    </linearGradient>
                                    <filter id="glow">
                                        <feGaussianBlur stdDeviation="4" result="coloredBlur" />
                                        <feMerge>
                                            <feMergeNode in="coloredBlur" />
                                            <feMergeNode in="SourceGraphic" />
                                        </feMerge>
                                    </filter>
                                </defs>
                                <rect
                                    x="1"
                                    y="1"
                                    width="calc(100% - 2px)"
                                    height="calc(100% - 2px)"
                                    rx="23"
                                    fill="none"
                                    stroke="url(#borderGradient)"
                                    strokeWidth="3"
                                    strokeDasharray="200 1000"
                                    strokeDashoffset="0"
                                    filter="url(#glow)"
                                    className="animate-[border-trace_6s_linear_infinite]"
                                    pathLength="1200"
                                />
                            </svg>
                            <div className="relative z-10">
                                <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center mb-6">
                                    <svg className="w-6 h-6 text-pink-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                    </svg>
                                </div>
                                <h3 className="text-2xl font-semibold text-white mb-4">AI-Powered Planning</h3>
                                <p className="text-white/60 leading-relaxed">
                                    Navigate your trips effortlessly with an AI-powered interface designed for speed, clarity, and
                                    zero technical barriers. Get instant recommendations tailored to your preferences.
                                </p>
                            </div>
                        </div>

                        {/* Feature 2: Knowledge Graph Accuracy */}
                        <div className="group relative bg-gradient-to-br from-[#1a1a1a] to-[#0a0a0a] rounded-3xl p-8 border border-white/10 transition-all duration-300">
                            <svg className="absolute inset-0 w-full h-full rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" style={{ pointerEvents: 'none' }}>
                                <defs>
                                    <linearGradient id="borderGradient2" gradientUnits="userSpaceOnUse">
                                        <stop offset="0%" stopColor="#ec4899" stopOpacity="0" />
                                        <stop offset="50%" stopColor="#ec4899" stopOpacity="1" />
                                        <stop offset="100%" stopColor="#ec4899" stopOpacity="0" />
                                    </linearGradient>
                                    <filter id="glow2">
                                        <feGaussianBlur stdDeviation="4" result="coloredBlur" />
                                        <feMerge>
                                            <feMergeNode in="coloredBlur" />
                                            <feMergeNode in="SourceGraphic" />
                                        </feMerge>
                                    </filter>
                                </defs>
                                <rect
                                    x="1"
                                    y="1"
                                    width="calc(100% - 2px)"
                                    height="calc(100% - 2px)"
                                    rx="23"
                                    fill="none"
                                    stroke="url(#borderGradient2)"
                                    strokeWidth="3"
                                    strokeDasharray="200 1000"
                                    strokeDashoffset="0"
                                    filter="url(#glow2)"
                                    className="animate-[border-trace_6s_linear_infinite]"
                                    pathLength="1200"
                                />
                            </svg>
                            <div className="relative z-10">
                                <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center mb-6">
                                    <svg className="w-6 h-6 text-pink-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                                    </svg>
                                </div>
                                <h3 className="text-2xl font-semibold text-white mb-4">Knowledge Graph Accuracy</h3>
                                <p className="text-white/60 leading-relaxed">
                                    Access your trip recommendations from any device, anywhere. Enjoy smooth performance across
                                    web, desktop, and mobile platforms with real-time data synchronization.
                                </p>
                            </div>
                        </div>

                        {/* Feature 3: Personalized & Secure */}
                        <div className="group relative bg-gradient-to-br from-[#1a1a1a] to-[#0a0a0a] rounded-3xl p-8 border border-white/10 transition-all duration-300">
                            <svg className="absolute inset-0 w-full h-full rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" style={{ pointerEvents: 'none' }}>
                                <defs>
                                    <linearGradient id="borderGradient3" gradientUnits="userSpaceOnUse">
                                        <stop offset="0%" stopColor="#ec4899" stopOpacity="0" />
                                        <stop offset="50%" stopColor="#ec4899" stopOpacity="1" />
                                        <stop offset="100%" stopColor="#ec4899" stopOpacity="0" />
                                    </linearGradient>
                                    <filter id="glow3">
                                        <feGaussianBlur stdDeviation="4" result="coloredBlur" />
                                        <feMerge>
                                            <feMergeNode in="coloredBlur" />
                                            <feMergeNode in="SourceGraphic" />
                                        </feMerge>
                                    </filter>
                                </defs>
                                <rect
                                    x="1"
                                    y="1"
                                    width="calc(100% - 2px)"
                                    height="calc(100% - 2px)"
                                    rx="23"
                                    fill="none"
                                    stroke="url(#borderGradient3)"
                                    strokeWidth="3"
                                    strokeDasharray="200 1000"
                                    strokeDashoffset="0"
                                    filter="url(#glow3)"
                                    className="animate-[border-trace_6s_linear_infinite]"
                                    pathLength="1200"
                                />
                            </svg>
                            <div className="relative z-10">
                                <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center mb-6">
                                    <svg className="w-6 h-6 text-pink-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                    </svg>
                                </div>
                                <h3 className="text-2xl font-semibold text-white mb-4">Personalized & Secure</h3>
                                <p className="text-white/60 leading-relaxed">
                                    Built with privacy-first encryption and continuous monitoring, your travel data stays safe, and your service
                                    remains uninterrupted with personalized recommendations just for you.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div >

            {/* Powerful Features Section */}
            < div className="bg-black w-full" >
                <div className="px-6 max-w-[1400px] mx-auto py-32">
                    <div className="text-center mb-16">
                        <h2 className="text-5xl font-bold text-white mb-4">
                            Powerful Features Built
                            <br />
                            for Modern Travel Planning
                        </h2>
                        <p className="text-white/50 text-lg max-w-3xl mx-auto">
                            Discover powerful tools that simplify trip planning, itinerary management, recommendations, and user engagement
                            <br />
                            all in one smart platform.
                        </p>
                    </div>

                    {/* Features Grid */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
                        {/* Feature 1: Trip Analytics */}
                        <div className="group relative bg-gradient-to-br from-[#1a1a1a] to-[#0a0a0a] rounded-3xl p-8 border border-white/10 hover:border-pink-500/30 transition-all duration-500 hover:scale-[1.02] overflow-hidden">
                            {/* Shine effect */}
                            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-pink-500/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
                            </div>

                            <div className="relative z-10">
                                <h3 className="text-2xl font-semibold text-white mb-2">Manage Trips in Real-Time</h3>
                                <p className="text-white/50 text-sm mb-6">
                                    Track and manage your itineraries easily with real-time visibility and control.
                                </p>

                                {/* Chart Card */}
                                <div className="bg-[#0a0a0a] rounded-2xl p-6 border border-white/10">
                                    <div className="flex items-center justify-between mb-6">
                                        <div className="flex items-center gap-2">
                                            <svg className="w-5 h-5 text-white/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                            </svg>
                                            <span className="text-white font-medium">Trip Overview</span>
                                        </div>
                                        <button className="text-white/40 hover:text-white/60">
                                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                                <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                                            </svg>
                                        </button>
                                    </div>

                                    {/* Legend */}
                                    <div className="flex gap-4 mb-4 text-xs">
                                        <div className="flex items-center gap-2">
                                            <div className="w-3 h-3 rounded-sm bg-pink-500"></div>
                                            <span className="text-white/60">Cafes</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <div className="w-3 h-3 rounded-sm bg-white/20"></div>
                                            <span className="text-white/60">Historical</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <div className="w-3 h-3 rounded-sm bg-violet-600"></div>
                                            <span className="text-white/60">Restaurants</span>
                                        </div>
                                    </div>

                                    {/* Bar Chart */}
                                    <div className="flex items-end justify-between gap-2 h-32">
                                        {[
                                            { month: 'Jan', heights: [45, 25, 35] },
                                            { month: 'Feb', heights: [60, 30, 40] },
                                            { month: 'Mar', heights: [50, 20, 55] },
                                            { month: 'Apr', heights: [70, 35, 45] },
                                            { month: 'May', heights: [55, 28, 38] },
                                            { month: 'Jun', heights: [65, 40, 50] },
                                            { month: 'Jul', heights: [75, 32, 42] },
                                            { month: 'Aug', heights: [48, 38, 48] },
                                            { month: 'Sep', heights: [58, 22, 52] },
                                            { month: 'Oct', heights: [68, 45, 40] },
                                            { month: 'Nov', heights: [52, 30, 45] },
                                            { month: 'Dec', heights: [62, 35, 50] },
                                        ].map((data) => (
                                            <div key={data.month} className="flex-1 flex flex-col items-center gap-1">
                                                <div className="w-full flex flex-col gap-1 justify-end h-full">
                                                    <div className="w-full bg-pink-500 rounded-t" style={{ height: `${data.heights[0]}%` }}></div>
                                                    <div className="w-full bg-white/20 rounded-t" style={{ height: `${data.heights[1]}%` }}></div>
                                                    <div className="w-full bg-violet-600 rounded-t" style={{ height: `${data.heights[2]}%` }}></div>
                                                </div>
                                                <span className="text-[10px] text-white/40 mt-2">{data.month}</span>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Tooltip */}
                                    {/* <div className="absolute top-20 left-1/2 bg-[#1a1a1a] border border-white/20 rounded-lg p-3 text-xs">
                                    <div className="text-white/40 mb-1">9 Jun 2025</div>
                                    <div className="space-y-1">
                                        <div className="flex items-center justify-between gap-4">
                                            <span className="text-pink-500">● Cafes</span>
                                            <span className="text-white font-medium">4</span>
                                        </div>
                                        <div className="flex items-center justify-between gap-4">
                                            <span className="text-white/40">● Historical</span>
                                            <span className="text-white font-medium">12</span>
                                        </div>
                                        <div className="flex items-center justify-between gap-4">
                                            <span className="text-violet-600">● Restaurants</span>
                                            <span className="text-white font-medium">24</span>
                                        </div>
                                    </div>
                                </div> */}
                                </div>
                            </div>
                        </div>

                        {/* Feature 2: Analytics */}
                        <div className="group relative bg-gradient-to-br from-[#1a1a1a] to-[#0a0a0a] rounded-3xl p-8 border border-white/10 hover:border-pink-500/30 transition-all duration-500 hover:scale-[1.02] overflow-hidden">
                            {/* Shine effect */}
                            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-pink-500/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
                            </div>

                            <div className="relative z-10">
                                <h3 className="text-2xl font-semibold text-white mb-2">Simple Analytics</h3>
                                <p className="text-white/50 text-sm mb-6">
                                    Make informed decisions backed by data through our analytics tools.
                                </p>

                                {/* Donut Chart Card */}
                                <div className="bg-[#0a0a0a] rounded-2xl p-6 border border-white/10 group-hover:border-pink-500/20 transition-all duration-300">
                                    <div className="flex items-center justify-between mb-6">
                                        <div className="flex items-center gap-2">
                                            <svg className="w-5 h-5 text-white/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
                                            </svg>
                                            <span className="text-white font-medium">Place Categories</span>
                                        </div>
                                        <button className="text-white/40 hover:text-white/60">
                                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                                <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                                            </svg>
                                        </button>
                                    </div>

                                    {/* Donut Chart */}
                                    <div className="flex items-center justify-center mb-6 relative">
                                        <svg className="w-40 h-40 transform -rotate-90 group-hover:scale-110 transition-transform duration-500">
                                            <circle cx="80" cy="80" r="60" fill="none" stroke="#ec4899" strokeWidth="20" strokeDasharray="188 377" className="transition-all duration-500" />
                                            <circle cx="80" cy="80" r="60" fill="none" stroke="#a855f7" strokeWidth="20" strokeDasharray="94 377" strokeDashoffset="-188" className="transition-all duration-500" />
                                            <circle cx="80" cy="80" r="60" fill="none" stroke="#f59e0b" strokeWidth="20" strokeDasharray="47 377" strokeDashoffset="-282" className="transition-all duration-500" />
                                            <circle cx="80" cy="80" r="60" fill="none" stroke="#6b7280" strokeWidth="20" strokeDasharray="48 377" strokeDashoffset="-329" className="transition-all duration-500" />
                                        </svg>
                                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                                            <div className="text-xs text-white/40">Total</div>
                                            <div className="text-2xl font-bold text-white">$320.90</div>
                                        </div>
                                    </div>

                                    {/* Legend */}
                                    <div className="grid grid-cols-2 gap-3 text-xs">
                                        <div className="flex items-center gap-2">
                                            <div className="w-2 h-2 rounded-full bg-pink-500"></div>
                                            <span className="text-white/60">Cafes</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <div className="w-2 h-2 rounded-full bg-amber-500"></div>
                                            <span className="text-white/60">Food</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <div className="w-2 h-2 rounded-full bg-violet-600"></div>
                                            <span className="text-white/60">Historical</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <div className="w-2 h-2 rounded-full bg-gray-500"></div>
                                            <span className="text-white/60">Others</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Feature 3: Happy Users */}
                        <div className="group relative bg-gradient-to-br from-[#1a1a1a] to-[#0a0a0a] rounded-3xl p-8 border border-white/10 hover:border-pink-500/30 transition-all duration-500 hover:scale-[1.02] overflow-hidden">
                            {/* Shine effect */}
                            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-pink-500/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
                            </div>

                            <div className="relative z-10">
                                <h3 className="text-2xl font-semibold text-white mb-2">Happy Users</h3>
                                <p className="text-white/50 text-sm mb-6">
                                    Stay organized and manage your trips better with automated planning tools.
                                </p>

                                {/* Users Card */}
                                <div className="bg-[#0a0a0a] rounded-2xl p-6 border border-white/10 group-hover:border-pink-500/20 transition-all duration-300 flex items-center justify-center h-64">
                                    <div className="relative">
                                        {/* Outer ring */}
                                        <div className="w-48 h-48 rounded-full border-2 border-pink-500/30 flex items-center justify-center group-hover:border-pink-500/50 transition-all duration-500 group-hover:scale-110">
                                            {/* Inner ring */}
                                            <div className="w-32 h-32 rounded-full border-2 border-pink-500/50 flex items-center justify-center group-hover:border-pink-500/70 transition-all duration-500">
                                                {/* User avatars */}
                                                <div className="flex -space-x-3">
                                                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-pink-500 to-violet-600 border-2 border-[#0a0a0a] group-hover:scale-110 transition-transform duration-300"></div>
                                                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-600 to-pink-500 border-2 border-[#0a0a0a] group-hover:scale-110 transition-transform duration-300 delay-75"></div>
                                                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-500 to-pink-500 border-2 border-[#0a0a0a] group-hover:scale-110 transition-transform duration-300 delay-150"></div>
                                                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-pink-500 to-amber-500 border-2 border-[#0a0a0a] group-hover:scale-110 transition-transform duration-300 delay-200"></div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Bottom Row - 50/50 Split */}
                        <div className="lg:col-span-3 grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {/* Real-time Itinerary - Left Half */}
                            <div className="group relative bg-gradient-to-br from-[#1a1a1a] to-[#0a0a0a] rounded-3xl p-8 border border-white/10 hover:border-pink-500/30 transition-all duration-500 hover:scale-[1.02] overflow-hidden">
                                {/* Shine effect */}
                                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-pink-500/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
                                </div>

                                <div className="relative z-10">
                                    <h3 className="text-3xl font-semibold text-white mb-2">Real-time itinerary at your fingertips.</h3>
                                    <p className="text-white/50 mb-8">
                                        Take the pain out of trip planning! Wave goodbye to mountains of paperwork and endless email reminders. There's now a new way of planning.
                                    </p>

                                    <div className="flex items-start gap-8">
                                        <div>
                                            <div className="text-5xl font-bold text-white mb-2">$3453.00</div>
                                            <div className="text-white/40 text-sm">Total Budget</div>
                                        </div>

                                        <div className="flex-1 space-y-3">
                                            <div className="bg-[#0a0a0a] rounded-xl p-4 border border-white/10 flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-bold">F</div>
                                                <div className="flex-1">
                                                    <div className="text-white font-medium">Shaniwar Wada</div>
                                                    <div className="text-white/40 text-xs">9 Jun 2025</div>
                                                </div>
                                                <div className="text-red-400 font-medium">- $18.00</div>
                                            </div>

                                            <div className="bg-[#0a0a0a] rounded-xl p-4 border border-white/10 flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-pink-500 to-pink-600 flex items-center justify-center text-white font-bold">D</div>
                                                <div className="flex-1">
                                                    <div className="text-white font-medium">Cafe Goodluck</div>
                                                    <div className="text-white/40 text-xs">9 Jun 2025</div>
                                                </div>
                                                <div className="text-green-400 font-medium">+ $43.00</div>
                                            </div>

                                            <div className="bg-[#0a0a0a] rounded-xl p-4 border border-white/10 flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-blue-500 flex items-center justify-center text-white font-bold">A</div>
                                                <div className="flex-1">
                                                    <div className="text-white font-medium">Aga Khan Palace</div>
                                                    <div className="text-white/40 text-xs">11 Jun 2025</div>
                                                </div>
                                                <div className="text-green-400 font-medium">+ $65.00</div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Track and Manage - Right Half */}
                            <div className="group relative bg-gradient-to-br from-[#1a1a1a] to-[#0a0a0a] rounded-3xl p-8 border border-white/10 hover:border-pink-500/30 transition-all duration-500 hover:scale-[1.02] overflow-hidden">
                                {/* Shine effect */}
                                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-pink-500/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
                                </div>

                                <div className="relative z-10">
                                    <h3 className="text-3xl font-semibold text-white mb-2">Track and manage your travel plans easily</h3>
                                    <p className="text-white/50 mb-8">
                                        Real-time data. Seamless automation. Total control all with features that keep your travel planning engine running smooth.
                                    </p>

                                    <button className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white px-6 py-3 rounded-xl transition-all border border-white/20">
                                        Explore More
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                        </svg>
                                    </button>

                                    {/* Decorative gradient */}
                                    <div className="absolute -right-20 -bottom-20 w-64 h-64 bg-gradient-to-br from-pink-500/30 to-violet-600/30 rounded-full blur-3xl"></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div >

            {/* CTA Section - Ready to Plan Your Trip */}
            < div className="bg-black w-full relative overflow-hidden" >
                {/* Three.js Tubes Background */}
                < TubesBackground />

                <div className="px-6 max-w-[1400px] mx-auto py-32 relative z-10">
                    {/* Content */}
                    <div className="relative z-10 text-center max-w-3xl mx-auto">
                        <h2 className="text-5xl md:text-6xl font-bold text-white mb-6 leading-tight">
                            Ready to Plan Your
                            <br />
                            Perfect Pune Trip?
                        </h2>
                        <p className="text-white/60 text-lg mb-10 max-w-2xl mx-auto">
                            Join thousands of travelers using our AI-powered platform to discover Pune's hidden gems,
                            <br />
                            plan perfect itineraries, and explore with confidence. No credit card required.
                        </p>

                        <div className="flex items-center justify-center gap-4 flex-wrap">
                            <Link href="/signup">
                                <button className="group relative px-8 py-4 bg-pink-500 text-white font-semibold rounded-full transition-all duration-300 shadow-lg hover:shadow-pink-500/50 hover:shadow-2xl hover:scale-105 hover:bg-pink-600 active:scale-95 overflow-hidden">
                                    {/* Shine effect on hover */}
                                    <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-700"></span>
                                    <span className="relative z-10">Start Free Trial</span>
                                </button>
                            </Link>
                            <Link href="#features">
                                <button className="group relative px-8 py-4 bg-transparent text-white font-semibold rounded-full transition-all duration-300 border-2 border-pink-500 hover:bg-pink-500/10 hover:scale-105 active:scale-95 flex items-center gap-2 overflow-hidden">
                                    {/* Animated border glow */}
                                    <span className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 ring-2 ring-pink-500/50 ring-offset-2 ring-offset-black"></span>
                                    <span className="relative z-10">Explore More</span>
                                    <svg className="w-4 h-4 relative z-10 transition-transform duration-300 group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                    </svg>
                                </button>
                            </Link>
                        </div>
                    </div>
                </div>
            </div >

            {/* Footer */}
            < footer className="bg-black border-t border-white/10" >
                <div className="px-6 max-w-[1400px] mx-auto py-16">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
                        {/* Brand Column */}
                        <div>
                            <div className="flex items-center gap-2 mb-4">
                                <PuneWandererLogo className="w-10 h-10" />
                                <span className="text-xl font-bold text-white">PuneWanderer</span>
                            </div>
                            <p className="text-white/50 text-sm mb-6 leading-relaxed">
                                Your AI-powered companion for discovering and exploring Pune's best places, powered by advanced Knowledge Graphs.
                            </p>
                            {/* Social Links */}
                            <div className="flex items-center gap-3">
                                <a href="#" className="w-10 h-10 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center text-white/60 hover:text-white transition-all">
                                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                                    </svg>
                                </a>
                                <a href="#" className="w-10 h-10 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center text-white/60 hover:text-white transition-all">
                                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" />
                                    </svg>
                                </a>
                                <a href="#" className="w-10 h-10 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center text-white/60 hover:text-white transition-all">
                                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M12 0C8.74 0 8.333.015 7.053.072 5.775.132 4.905.333 4.14.63c-.789.306-1.459.717-2.126 1.384S.935 3.35.63 4.14C.333 4.905.131 5.775.072 7.053.012 8.333 0 8.74 0 12s.015 3.667.072 4.947c.06 1.277.261 2.148.558 2.913.306.788.717 1.459 1.384 2.126.667.666 1.336 1.079 2.126 1.384.766.296 1.636.499 2.913.558C8.333 23.988 8.74 24 12 24s3.667-.015 4.947-.072c1.277-.06 2.148-.262 2.913-.558.788-.306 1.459-.718 2.126-1.384.666-.667 1.079-1.335 1.384-2.126.296-.765.499-1.636.558-2.913.06-1.28.072-1.687.072-4.947s-.015-3.667-.072-4.947c-.06-1.277-.262-2.149-.558-2.913-.306-.789-.718-1.459-1.384-2.126C21.319 1.347 20.651.935 19.86.63c-.765-.297-1.636-.499-2.913-.558C15.667.012 15.26 0 12 0zm0 2.16c3.203 0 3.585.016 4.85.071 1.17.055 1.805.249 2.227.415.562.217.96.477 1.382.896.419.42.679.819.896 1.381.164.422.36 1.057.413 2.227.057 1.266.07 1.646.07 4.85s-.015 3.585-.074 4.85c-.061 1.17-.256 1.805-.421 2.227-.224.562-.479.96-.899 1.382-.419.419-.824.679-1.38.896-.42.164-1.065.36-2.235.413-1.274.057-1.649.07-4.859.07-3.211 0-3.586-.015-4.859-.074-1.171-.061-1.816-.256-2.236-.421-.569-.224-.96-.479-1.379-.899-.421-.419-.69-.824-.9-1.38-.165-.42-.359-1.065-.42-2.235-.045-1.26-.061-1.649-.061-4.844 0-3.196.016-3.586.061-4.861.061-1.17.255-1.814.42-2.234.21-.57.479-.96.9-1.381.419-.419.81-.689 1.379-.898.42-.166 1.051-.361 2.221-.421 1.275-.045 1.65-.06 4.859-.06l.045.03zm0 3.678c-3.405 0-6.162 2.76-6.162 6.162 0 3.405 2.76 6.162 6.162 6.162 3.405 0 6.162-2.76 6.162-6.162 0-3.405-2.76-6.162-6.162-6.162zM12 16c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4zm7.846-10.405c0 .795-.646 1.44-1.44 1.44-.795 0-1.44-.646-1.44-1.44 0-.794.646-1.439 1.44-1.439.793-.001 1.44.645 1.44 1.439z" />
                                    </svg>
                                </a>
                                <a href="#" className="w-10 h-10 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center text-white/60 hover:text-white transition-all">
                                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                                    </svg>
                                </a>
                            </div>
                        </div>

                        {/* Product Column */}
                        <div>
                            <h3 className="text-white font-semibold mb-4">Product</h3>
                            <ul className="space-y-3">
                                <li><Link href="#features" className="text-white/50 hover:text-white text-sm transition-colors">Features</Link></li>
                                <li><Link href="#how-it-works" className="text-white/50 hover:text-white text-sm transition-colors">How it Works</Link></li>
                                <li><Link href="#pricing" className="text-white/50 hover:text-white text-sm transition-colors">Pricing</Link></li>
                                <li><Link href="/dashboard" className="text-white/50 hover:text-white text-sm transition-colors">Dashboard</Link></li>
                                <li><Link href="#" className="text-white/50 hover:text-white text-sm transition-colors">API</Link></li>
                            </ul>
                        </div>

                        {/* Company Column */}
                        <div>
                            <h3 className="text-white font-semibold mb-4">Company</h3>
                            <ul className="space-y-3">
                                <li><Link href="#" className="text-white/50 hover:text-white text-sm transition-colors">About Us</Link></li>
                                <li><Link href="#" className="text-white/50 hover:text-white text-sm transition-colors">Blog</Link></li>
                                <li><Link href="#" className="text-white/50 hover:text-white text-sm transition-colors">Careers</Link></li>
                                <li><Link href="#" className="text-white/50 hover:text-white text-sm transition-colors">Press Kit</Link></li>
                                <li><Link href="#" className="text-white/50 hover:text-white text-sm transition-colors">Contact</Link></li>
                            </ul>
                        </div>

                        {/* Resources Column */}
                        <div>
                            <h3 className="text-white font-semibold mb-4">Resources</h3>
                            <ul className="space-y-3">
                                <li><Link href="#" className="text-white/50 hover:text-white text-sm transition-colors">Help Center</Link></li>
                                <li><Link href="#" className="text-white/50 hover:text-white text-sm transition-colors">Community</Link></li>
                                <li><Link href="#" className="text-white/50 hover:text-white text-sm transition-colors">Guides</Link></li>
                                <li><Link href="#" className="text-white/50 hover:text-white text-sm transition-colors">Privacy Policy</Link></li>
                                <li><Link href="#" className="text-white/50 hover:text-white text-sm transition-colors">Terms of Service</Link></li>
                            </ul>
                        </div>
                    </div>

                    {/* Bottom Bar */}
                    <div className="pt-8 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-4">
                        <p className="text-white/40 text-sm">
                            © 2026 PuneWanderer. All rights reserved.
                        </p>
                        <div className="flex items-center gap-6">
                            <Link href="#" className="text-white/40 hover:text-white text-sm transition-colors">Privacy</Link>
                            <Link href="#" className="text-white/40 hover:text-white text-sm transition-colors">Terms</Link>
                            <Link href="#" className="text-white/40 hover:text-white text-sm transition-colors">Cookies</Link>
                        </div>
                    </div>
                </div>
            </footer >
        </div >
    );
}
