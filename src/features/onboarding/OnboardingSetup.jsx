import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';
import { useOnboardingStore } from '../../stores/onboardingStore';
import {
    User, Smartphone, CheckCircle2, ArrowRight, ShieldCheck,
    CreditCard, Info, AlertTriangle, Lock
} from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../lib/api';

const OnboardingSetup = () => {
    const { user } = useAuthStore();
    const { status, fetchStatus, completeStep } = useOnboardingStore();
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    // Form states
    const [phone, setPhone] = useState(user?.phone || '');
    const [acceptedTerms, setAcceptedTerms] = useState(false);

    useEffect(() => {
        if (!status) fetchStatus();
    }, []);

    const handleProfileSubmit = async (e) => {
        e.preventDefault();
        if (!phone) return toast.error("Phone number is required");

        setLoading(true);
        try {
            await api.put('/users/profile', { phone });
            await completeStep('profile');
            toast.success("Profile updated!");
            await fetchStatus();
        } catch (error) {
            toast.error("Failed to update profile");
        } finally {
            setLoading(false);
        }
    };

    if (!status) return (
        <div className="flex items-center justify-center min-h-[50vh]">
            <div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
        </div>
    );

    const renderStep = () => {
        switch (status.nextStep) {
            case 'COMPLETE_PROFILE':
                return (
                    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="bg-white dark:bg-surface-800 p-8 rounded-[2.5rem] border border-surface-200 dark:border-surface-700 shadow-xl">
                            <div className="w-16 h-16 bg-primary-500/10 rounded-2xl flex items-center justify-center mb-6">
                                <User className="w-8 h-8 text-primary-500" />
                            </div>
                            <h2 className="text-3xl font-black mb-2">Verify Your Identity</h2>
                            <p className="text-surface-500 font-medium mb-8">We need a valid phone number to send you security alerts and hub updates.</p>

                            <form onSubmit={handleProfileSubmit} className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-surface-400 ml-1">Phone Number</label>
                                    <div className="relative">
                                        <Smartphone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-surface-400" />
                                        <input
                                            type="tel"
                                            placeholder="+234 ..."
                                            value={phone}
                                            onChange={(e) => setPhone(e.target.value)}
                                            className="w-full pl-12 pr-4 py-4 bg-surface-50 dark:bg-surface-900 border border-surface-200 dark:border-surface-700 rounded-2xl font-bold focus:ring-2 focus:ring-primary-500 outline-none transition-all"
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="flex items-center gap-4 p-4 bg-surface-50 dark:bg-surface-900 rounded-2xl border border-surface-200 dark:border-surface-700">
                                    <input
                                        type="checkbox"
                                        id="terms"
                                        checked={acceptedTerms}
                                        onChange={(e) => setAcceptedTerms(e.target.checked)}
                                        className="w-5 h-5 rounded border-surface-300 text-primary-500 focus:ring-primary-500"
                                    />
                                    <label htmlFor="terms" className="text-xs font-bold text-surface-600 dark:text-surface-300 leading-snug">
                                        I agree to the Innovation Hub <span className="text-primary-500 underline cursor-pointer">Terms of Service</span> and Safety Guidelines.
                                    </label>
                                </div>

                                <button
                                    type="submit"
                                    disabled={loading || !acceptedTerms}
                                    className="w-full py-4 bg-primary-500 text-white rounded-2xl font-black uppercase tracking-widest text-sm flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 shadow-lg shadow-primary-500/20"
                                >
                                    {loading ? 'Saving...' : 'Continue to Next Step'}
                                    <ArrowRight className="w-4 h-4" />
                                </button>
                            </form>
                        </div>
                    </div>
                );

            case 'SELECT_PLAN':
                return (
                    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="bg-white dark:bg-surface-800 p-8 rounded-[2.5rem] border border-surface-200 dark:border-surface-700 shadow-xl text-center">
                            <div className="w-16 h-16 bg-accent-500/10 rounded-2xl flex items-center justify-center mb-6 mx-auto">
                                <CreditCard className="w-8 h-8 text-accent-500" />
                            </div>
                            <h2 className="text-3xl font-black mb-2">Student Club Membership</h2>
                            <p className="text-surface-500 font-medium mb-8">Select your membership tier to activate your Innovation Hub privileges.</p>

                            <button
                                onClick={() => navigate('/membership')}
                                className="w-full py-4 bg-accent-500 text-white rounded-2xl font-black uppercase tracking-widest text-sm flex items-center justify-center gap-2"
                            >
                                View Membership Tiers
                                <ArrowRight className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                );

            case 'COMPLETE_PAYMENT':
                return (
                    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="bg-white dark:bg-surface-800 p-8 rounded-[2.5rem] border border-surface-200 dark:border-surface-700 shadow-xl">
                            <div className="flex items-center gap-4 mb-8">
                                <div className="w-12 h-12 bg-warning-500/10 rounded-xl flex items-center justify-center">
                                    <AlertTriangle className="w-6 h-6 text-warning-500" />
                                </div>
                                <div>
                                    <h3 className="font-black text-xl">Membership Activation</h3>
                                    <p className="text-xs text-surface-400 font-bold uppercase tracking-widest">Payment Required</p>
                                </div>
                            </div>

                            <div className="p-6 bg-surface-50 dark:bg-surface-900 rounded-3xl border border-surface-100 dark:border-surface-700 mb-8">
                                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-surface-400 mb-4">Transfer Details</p>
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center group">
                                        <span className="text-xs font-bold text-surface-400 uppercase tracking-widest">Bank Name</span>
                                        <span className="font-black text-sm">{status.hubAccount?.bankName || 'Zenith Bank'}</span>
                                    </div>
                                    <div className="flex justify-between items-center bg-white dark:bg-surface-800 p-3 rounded-xl border border-dashed border-primary-500/30">
                                        <span className="text-xs font-bold text-surface-400 uppercase tracking-widest">Account Number</span>
                                        <span className="font-black text-lg text-primary-500 tracking-wider">
                                            {status.hubAccount?.accountNumber || '0123456789'}
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-xs font-bold text-surface-400 uppercase tracking-widest">Account Name</span>
                                        <span className="font-black text-sm">{status.hubAccount?.accountName || 'Innovation Hub'}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-primary-500/10 p-4 rounded-2xl border border-primary-500/20 mb-6">
                                <p className="text-xs font-medium text-primary-700 dark:text-primary-300 leading-relaxed">
                                    <span className="font-black uppercase text-[10px] block mb-1">Important</span>
                                    Please use your registered email as the transfer narration. An admin will verify the payment within 1-2 hours.
                                </p>
                            </div>

                            <button className="w-full py-4 bg-primary-500 text-white rounded-2xl font-black uppercase tracking-widest text-sm shadow-lg shadow-primary-500/20 flex items-center justify-center gap-2">
                                <CheckCircle2 className="w-4 h-4" />
                                I've Made the Transfer
                            </button>
                            <p className="text-[10px] text-center text-surface-400 font-bold uppercase tracking-widest mt-4">
                                Secure encrypted checkout
                            </p>
                        </div>
                    </div>
                );

            case 'WAITING_FOR_APPROVAL':
                return (
                    <div className="bg-white dark:bg-surface-800 p-10 rounded-[3rem] border border-surface-200 dark:border-surface-700 shadow-xl text-center">
                        <div className="w-20 h-20 bg-primary-500/10 rounded-3xl flex items-center justify-center mb-8 mx-auto">
                            <ShieldCheck className="w-10 h-10 text-primary-500 animate-pulse" />
                        </div>
                        <h2 className="text-3xl font-black mb-4 tracking-tighter">Awaiting Hub Activation</h2>
                        <p className="text-surface-500 font-medium mb-10 max-w-sm mx-auto">
                            Your profile and membership are being verified by a Hub Administrator. You will receive an email once your account is fully activated.
                        </p>
                        <div className="inline-flex items-center gap-2 px-6 py-3 bg-surface-50 dark:bg-surface-700 rounded-full text-xs font-black uppercase tracking-widest text-surface-400">
                            <Info className="w-4 h-4" /> Expected review time: 1-2 hours
                        </div>
                    </div>
                );

            case 'READY':
                return (
                    <div className="bg-white dark:bg-surface-800 p-10 rounded-[3rem] border-4 border-success-500/20 shadow-xl text-center">
                        <div className="w-20 h-20 bg-success-500/10 rounded-3xl flex items-center justify-center mb-8 mx-auto">
                            <CheckCircle2 className="w-10 h-10 text-success-500" />
                        </div>
                        <h2 className="text-3xl font-black mb-4 tracking-tighter text-success-600 dark:text-success-400">All Systems Go!</h2>
                        <p className="text-surface-500 font-medium mb-10 max-w-sm mx-auto">
                            Your account is now fully activated. You can now book spaces, generate your access QR, and use all hub facilities.
                        </p>
                        <button
                            onClick={() => navigate('/dashboard')}
                            className="w-full py-4 bg-success-500 text-white rounded-2xl font-black uppercase tracking-widest text-sm shadow-lg shadow-success-500/20"
                        >
                            Enter Dashboard 🚀
                        </button>
                    </div>
                );

            default:
                return (
                    <div className="text-center py-20">
                        <p className="text-surface-400 font-bold uppercase tracking-widest">Processing...</p>
                    </div>
                );
        }
    };

    return (
        <div className="max-w-xl mx-auto py-12 px-4">
            <header className="mb-10 text-center">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-primary-500/10 text-primary-500 rounded-full text-[10px] font-black uppercase tracking-[0.2em] mb-4">
                    <Lock className="w-3 h-3" /> Secure Onboarding
                </div>
                <h1 className="text-4xl font-black tracking-tight mb-2">Initialize Account</h1>
                <div className="flex items-center justify-center gap-2 text-surface-400 text-sm font-medium">
                    <span>Role: {user.role}</span>
                    <span className="w-1 h-1 bg-surface-300 rounded-full" />
                    <span>Progress: {status.completion}%</span>
                </div>
            </header>

            {renderStep()}
        </div>
    );
};

export default OnboardingSetup;
