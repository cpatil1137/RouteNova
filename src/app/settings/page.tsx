'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { updateProfile, updatePassword, EmailAuthProvider, reauthenticateWithCredential } from 'firebase/auth';
import { ArrowLeft, User, Mail, Lock, Save, CheckCircle2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import dynamic from 'next/dynamic';

// Dynamic import for starfield background (client-side only)
const StarfieldBackground = dynamic(() => import('@/components/effects/StarfieldBackground'), {
    ssr: false,
});

export default function SettingsPage() {
    const { user, loading } = useAuth();
    const router = useRouter();
    const [displayName, setDisplayName] = useState('');
    const [email, setEmail] = useState('');
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [formLoading, setFormLoading] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

    useEffect(() => {
        // Wait for auth to finish loading before checking user
        if (loading) return;

        if (!user) {
            router.push('/login');
            return;
        }
        setDisplayName(user.displayName || '');
        setEmail(user.email || '');
    }, [user, loading, router]);

    const handleUpdateProfile = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;

        setFormLoading(true);
        setMessage(null);

        try {
            await updateProfile(user, { displayName });
            setMessage({ type: 'success', text: 'Profile updated successfully!' });
        } catch (error: any) {
            setMessage({ type: 'error', text: error.message || 'Failed to update profile' });
        } finally {
            setFormLoading(false);
        }
    };

    const handleUpdatePassword = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user || !user.email) return;

        if (newPassword !== confirmPassword) {
            setMessage({ type: 'error', text: 'New passwords do not match' });
            return;
        }

        if (newPassword.length < 6) {
            setMessage({ type: 'error', text: 'Password must be at least 6 characters' });
            return;
        }

        setFormLoading(true);
        setMessage(null);

        try {
            // Re-authenticate user before changing password
            const credential = EmailAuthProvider.credential(user.email, currentPassword);
            await reauthenticateWithCredential(user, credential);

            // Update password
            await updatePassword(user, newPassword);

            setMessage({ type: 'success', text: 'Password updated successfully!' });
            setCurrentPassword('');
            setNewPassword('');
            setConfirmPassword('');
        } catch (error: any) {
            if (error.code === 'auth/wrong-password') {
                setMessage({ type: 'error', text: 'Current password is incorrect' });
            } else {
                setMessage({ type: 'error', text: error.message || 'Failed to update password' });
            }
        } finally {
            setFormLoading(false);
        }
    };

    if (!user) return null;

    return (
        <div className="min-h-screen flex relative overflow-hidden">
            {/* Three.js Starfield Background */}
            <StarfieldBackground />

            {/* Animated Orb Overlay */}
            <div className="orb-background" />
            <div className="grid-pattern" />

            {/* Main Content - Centered */}
            <div className="flex-1 flex items-center justify-center p-6 relative z-10">
                <div className="w-full max-w-md">
                    {/* Back Button */}
                    <button
                        onClick={() => router.back()}
                        className="flex items-center gap-2 text-white/50 hover:text-white transition-all duration-300 mb-6 group"
                    >
                        <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                        <span className="font-normal text-sm">Back to Dashboard</span>
                    </button>

                    {/* Header */}
                    <div className="text-left mb-8 animate-fade-in">
                        <h1 className="text-4xl font-bold text-white mb-2 tracking-tight">
                            Profile Settings
                        </h1>
                        <p className="text-white/60 text-sm">Manage your account and preferences</p>
                    </div>

                    {/* Message Display */}
                    {message && (
                        <div
                            className={`mb-6 p-3 rounded-lg border backdrop-blur-sm animate-scale-in flex items-center gap-3 text-sm ${message.type === 'success'
                                ? 'bg-green-500/10 border-green-500/20 text-green-400'
                                : 'bg-red-500/10 border-red-500/20 text-red-400'
                                }`}
                        >
                            {message.type === 'success' ? (
                                <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                            ) : (
                                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                            )}
                            <span className="font-normal">{message.text}</span>
                        </div>
                    )}

                    {/* Profile Information Card */}
                    <div className="bg-[#1A1A1A]/80 backdrop-blur-sm rounded-xl p-6 mb-6 border border-white/10 shadow-xl animate-slide-in-left">
                        <div className="flex items-center gap-3 mb-5">
                            <div className="w-10 h-10 rounded-lg bg-[#5EEAD4]/20 flex items-center justify-center">
                                <User className="w-5 h-5 text-[#5EEAD4]" />
                            </div>
                            <h2 className="text-xl font-semibold text-white">Profile Information</h2>
                        </div>

                        <form onSubmit={handleUpdateProfile} className="space-y-4">
                            <div className="space-y-1">
                                <label className="block text-white/80 text-sm font-normal ml-1">
                                    Display Name
                                </label>
                                <input
                                    type="text"
                                    value={displayName}
                                    onChange={(e) => setDisplayName(e.target.value)}
                                    className="w-full px-4 py-3 bg-[#252525] border border-white/10 rounded-xl text-white placeholder-white/20 focus:outline-none focus:border-[#5EEAD4] focus:ring-1 focus:ring-[#5EEAD4] transition-all hover:bg-[#2a2a2a]"
                                    placeholder="Enter your display name"
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="block text-white/80 text-sm font-normal ml-1">
                                    Email Address
                                </label>
                                <div className="relative">
                                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                                    <input
                                        type="email"
                                        value={email}
                                        disabled
                                        className="w-full pl-12 pr-4 py-3 bg-[#252525] border border-white/10 rounded-xl text-white/60 cursor-not-allowed"
                                    />
                                </div>
                                <p className="text-xs text-white/40 mt-2 flex items-center gap-1 ml-1">
                                    <Lock className="w-3 h-3" />
                                    Email cannot be changed
                                </p>
                            </div>
                            <Button
                                type="submit"
                                disabled={formLoading}
                                className="w-full bg-[#5EEAD4] hover:bg-[#4dd0bc] text-black font-bold py-3 rounded-full transition-all duration-300 flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(94,234,212,0.15)] transform active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <Save className="w-4 h-4" />
                                {formLoading ? 'Saving...' : 'Save Profile'}
                            </Button>
                        </form>
                    </div>

                    {/* Change Password Card */}
                    <div className="bg-[#1A1A1A]/80 backdrop-blur-sm rounded-xl p-6 border border-white/10 shadow-xl animate-slide-in-right">
                        <div className="flex items-center gap-3 mb-5">
                            <div className="w-10 h-10 rounded-lg bg-[#5EEAD4]/20 flex items-center justify-center">
                                <Lock className="w-5 h-5 text-[#5EEAD4]" />
                            </div>
                            <h2 className="text-xl font-semibold text-white">Change Password</h2>
                        </div>

                        <form onSubmit={handleUpdatePassword} className="space-y-4">
                            <div className="space-y-1">
                                <label className="block text-white/80 text-sm font-normal ml-1">
                                    Current Password
                                </label>
                                <input
                                    type="password"
                                    value={currentPassword}
                                    onChange={(e) => setCurrentPassword(e.target.value)}
                                    className="w-full px-4 py-3 bg-[#252525] border border-white/10 rounded-xl text-white placeholder-white/20 focus:outline-none focus:border-[#5EEAD4] focus:ring-1 focus:ring-[#5EEAD4] transition-all hover:bg-[#2a2a2a]"
                                    placeholder="Enter current password"
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="block text-white/80 text-sm font-normal ml-1">
                                    New Password
                                </label>
                                <input
                                    type="password"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    className="w-full px-4 py-3 bg-[#252525] border border-white/10 rounded-xl text-white placeholder-white/20 focus:outline-none focus:border-[#5EEAD4] focus:ring-1 focus:ring-[#5EEAD4] transition-all hover:bg-[#2a2a2a]"
                                    placeholder="Enter new password (min. 6 characters)"
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="block text-white/80 text-sm font-normal ml-1">
                                    Confirm New Password
                                </label>
                                <input
                                    type="password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    className="w-full px-4 py-3 bg-[#252525] border border-white/10 rounded-xl text-white placeholder-white/20 focus:outline-none focus:border-[#5EEAD4] focus:ring-1 focus:ring-[#5EEAD4] transition-all hover:bg-[#2a2a2a]"
                                    placeholder="Confirm new password"
                                />
                            </div>
                            <Button
                                type="submit"
                                disabled={formLoading || !currentPassword || !newPassword || !confirmPassword}
                                className="w-full bg-[#5EEAD4] hover:bg-[#4dd0bc] text-black font-bold py-3 rounded-full transition-all duration-300 flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(94,234,212,0.15)] transform active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <Lock className="w-4 h-4" />
                                {formLoading ? 'Updating...' : 'Update Password'}
                            </Button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}
