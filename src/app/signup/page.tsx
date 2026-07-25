'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, Mail, Lock, User as UserIcon } from 'lucide-react';

// Dynamic imports for effects (client-side only)
const TrailBackground = dynamic(() => import('@/components/background/TrailBackground'), {
    ssr: false,
})


export default function SignupPage() {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const { signUp, signInWithGoogle, signInWithGithub, user } = useAuth();
    const router = useRouter();

    // Redirect if already logged in
    useEffect(() => {
        if (user) {
            router.push('/');
        }
    }, [user, router]);

    const handleEmailSignup = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (password !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        if (password.length < 6) {
            setError('Password must be at least 6 characters');
            return;
        }

        setLoading(true);

        try {
            await signUp(email, password, name);
            router.push('/');
        } catch (err: any) {
            setError(err.message || 'Failed to create account');
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleSignup = async () => {
        setError('');
        setLoading(true);

        try {
            await signInWithGoogle();
            router.push('/');
        } catch (err: any) {
            setError(err.message || 'Failed to sign up with Google');
            setLoading(false);
        }
    };

    const handleGithubSignup = async () => {
        setError('');
        setLoading(true);

        try {
            await signInWithGithub();
            router.push('/');
        } catch (err: any) {
            setError(err.message || 'Failed to sign up with GitHub');
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex relative overflow-hidden">

            {/* Background Effect */}
            <TrailBackground />

            {/* Left Side - Overlay Content (Desktop Only) */}
            <div className="hidden lg:flex lg:w-1/2 relative z-10 flex-col justify-center px-16 pointer-events-none">
                <div className="mb-6 inline-flex h-8 items-center rounded-full p-[1px] bg-gradient-to-r from-[#02fcef70] via-[#ffb52b70] to-[#a02bfe70] w-fit">
                    <span className="flex h-full w-full items-center justify-center rounded-full bg-[#0b0e14] px-3 text-sm text-white font-medium tracking-wide">
                        AI-Powered Travel
                    </span>
                </div>


                <h1 className="text-white font-bold text-7xl leading-tight mb-6 tracking-tighter">
                    Pune Trip<br />Planner
                </h1>


                <p className="text-white/70 text-lg max-w-md leading-relaxed mb-8">
                    Smart itinerary planning powered by Knowledge Graphs and RAG.
                    <br /><br />
                    Experience the future of travel discovery.
                </p>
            </div>


            {/* Right Side - Signup Form */}
            <div className="w-full lg:w-1/2 flex items-center justify-center px-4 py-12 relative z-10">
                <div className="max-w-md w-full p-4">
                    {/* Header */}
                    <div className="mb-10 text-left animate-fade-in">
                        <Link href="/" className="mb-6 inline-block text-white/50 hover:text-white transition-colors">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6" /></svg>
                        </Link>
                        <h1 className="text-4xl font-bold text-white mb-2 tracking-tight">Create your<br />Account</h1>
                    </div>

                    {/* Signup Card Container */}
                    <div className="animate-scale-in">
                        {error && (
                            <div className="mb-6 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">
                                {error}
                            </div>
                        )}

                        {/* Signup Form */}
                        <form onSubmit={handleEmailSignup} className="space-y-6">

                            <div className="space-y-1">
                                <Label htmlFor="name" className="text-white/80 text-sm font-normal ml-1">Full Name</Label>
                                <div className="relative group">
                                    <UserIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/40 group-focus-within:text-[#5EEAD4] transition-colors" />
                                    <Input
                                        id="name"
                                        type="text"
                                        placeholder="John Doe"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        className="pl-12 bg-[#1A1A1A] border-white/10 text-white placeholder:text-white/20 h-14 rounded-xl focus:border-[#5EEAD4] focus:ring-1 focus:ring-[#5EEAD4] transition-all hover:bg-[#252525]"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="space-y-1">
                                <Label htmlFor="email" className="text-white/80 text-sm font-normal ml-1">Email address</Label>
                                <div className="relative group">
                                    <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/40 group-focus-within:text-[#5EEAD4] transition-colors" />
                                    <Input
                                        id="email"
                                        type="email"
                                        placeholder="you@example.com"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="pl-12 bg-[#1A1A1A] border-white/10 text-white placeholder:text-white/20 h-14 rounded-xl focus:border-[#5EEAD4] focus:ring-1 focus:ring-[#5EEAD4] transition-all hover:bg-[#252525]"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="space-y-1">
                                <Label htmlFor="password" className="text-white/80 text-sm font-normal ml-1">Password</Label>
                                <div className="relative group">
                                    <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/40 group-focus-within:text-[#5EEAD4] transition-colors" />
                                    <Input
                                        id="password"
                                        type="password"
                                        placeholder="••••••••••"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="pl-12 bg-[#1A1A1A] border-white/10 text-white placeholder:text-white/20 h-14 rounded-xl focus:border-[#5EEAD4] focus:ring-1 focus:ring-[#5EEAD4] transition-all hover:bg-[#252525]"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="space-y-1">
                                <Label htmlFor="confirmPassword" className="text-white/80 text-sm font-normal ml-1">Confirm Password</Label>
                                <div className="relative group">
                                    <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/40 group-focus-within:text-[#5EEAD4] transition-colors" />
                                    <Input
                                        id="confirmPassword"
                                        type="password"
                                        placeholder="••••••••••"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        className="pl-12 bg-[#1A1A1A] border-white/10 text-white placeholder:text-white/20 h-14 rounded-xl focus:border-[#5EEAD4] focus:ring-1 focus:ring-[#5EEAD4] transition-all hover:bg-[#252525]"
                                        required
                                    />
                                </div>
                            </div>

                            <Button
                                type="submit"
                                className="w-full bg-[#5EEAD4] hover:bg-[#4dd0bc] text-black font-bold h-14 rounded-full text-lg shadow-[0_0_20px_rgba(94,234,212,0.3)] transition-all transform active:scale-[0.98]"
                                disabled={loading}
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                                        Creating account...
                                    </>
                                ) : (
                                    'Create account'
                                )}
                            </Button>
                        </form>

                        <div className="mt-8 text-center text-sm text-white/60">
                            <span className="text-white/40">Already have an account? </span>
                            <Link href="/login" className="text-[#5EEAD4] hover:text-[#4dd0bc] font-medium transition-colors">
                                Sign in
                            </Link>
                        </div>

                        <div className="flex items-center my-8">
                            <div className="flex-1 border-t border-white/30"></div>
                            <span className="px-4 text-white/40 text-sm">Or</span>
                            <div className="flex-1 border-t border-white/30"></div>
                        </div>

                        {/* Social Login Buttons */}
                        <div className="flex justify-center gap-6 mb-8">
                            {/* Google */}
                            <button onClick={handleGoogleSignup} className="w-14 h-14 rounded-full bg-white flex items-center justify-center hover:bg-gray-200 transition-colors transform hover:scale-110 duration-200 shadow-lg shadow-white/10">
                                <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" /><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" /><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" /><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" /></svg>
                            </button>
                            {/* Github */}
                            <button onClick={handleGithubSignup} className="w-14 h-14 rounded-full bg-[#24292e] border border-white/20 flex items-center justify-center text-white hover:bg-[#2f363d] transition-colors transform hover:scale-110 duration-200 shadow-lg shadow-black/30">
                                <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.205 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" /></svg>
                            </button>
                        </div>

                    </div>
                </div>
            </div>
        </div>
    );
}
