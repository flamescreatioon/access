import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMembershipStore } from '../../stores/membershipStore';
import { useAuthStore } from '../../stores/authStore';
import { useBookingStore } from '../../stores/bookingStore';
import api from '../../lib/api';
import {
    Crown, Calendar, CreditCard, Star, ArrowUpRight, Check, Zap,
    RefreshCcw, AlertCircle, History, Shield, TrendingUp, Sparkles,
    CheckCircle2, XCircle
} from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';
import toast from 'react-hot-toast';

export default function MemberDashboard() {
    const navigate = useNavigate();
    const { user } = useAuthStore();
    const {
        currentMembership, history, fetchCurrentMembership,
        fetchHistory, toggleAutoRenew, requestUpgrade, isLoading
    } = useMembershipStore();
    const [tiers, setTiers] = useState([]);
    const [upgrading, setUpgrading] = useState(false);

    useEffect(() => {
        if (user) {
            fetchCurrentMembership(user.id);
            fetchHistory();
            fetchTiers();
        }
    }, [user]);

    const fetchTiers = async () => {
        try {
            const res = await api.get('/memberships/tiers');
            setTiers(res.data);
        } catch (err) {
            console.error('Failed to fetch tiers', err);
        }
    };

    const handleAutoRenew = async () => {
        const res = await toggleAutoRenew();
        if (res.success) {
            toast.success(`Auto-renew ${currentMembership.auto_renew ? 'disabled' : 'enabled'}`);
        } else {
            toast.error(res.error);
        }
    };

    const handleUpgrade = async (tierId) => {
        if (!window.confirm('Are you sure you want to change your membership tier? This will take effect immediately.')) return;

        setUpgrading(true);
        const res = await requestUpgrade(tierId);
        setUpgrading(false);

        if (res.success) {
            toast.success(res.message);
            fetchHistory();
            if (user.activation_status !== 'ACTIVE') {
                navigate('/onboarding/setup');
            }
        } else {
            toast.error(res.error);
        }
    };

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[50vh]">
                <div className="w-10 h-10 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mb-4" />
                <p className="text-sm font-black uppercase tracking-widest text-surface-400">Fetching Account Details</p>
            </div>
        );
    }

    const tier = currentMembership?.AccessTier;
    const daysLeft = currentMembership ? Math.ceil((new Date(currentMembership.expiry_date) - new Date()) / 86400000) : 0;
    const permissions = JSON.parse(tier?.permissions || '[]');

    return (
        <div className="max-w-5xl mx-auto space-y-6 page-enter page-enter-active pb-12">
            <header>
                <h1 className="text-3xl font-black tracking-tight">Passport</h1>
                <p className="text-surface-500 mt-1 font-medium">Manage your subscription, billing, and hub access level.</p>
            </header>

            <div className="grid lg:grid-cols-3 gap-6">
                {/* Current Plan Card */}
                <div className="lg:col-span-2 relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-surface-800 to-surface-950 p-8 text-white shadow-2xl min-h-[300px] flex items-center">
                    <div className="absolute -right-12 -top-12 w-64 h-64 bg-primary-500/10 rounded-full blur-3xl" />
                    <div className="absolute -left-8 -bottom-8 w-48 h-48 bg-accent-500/10 rounded-full blur-3xl" />

                    <div className="relative z-10 w-full">
                        {currentMembership ? (
                            <>
                                <div className="flex items-start justify-between flex-wrap gap-4 mb-8">
                                    <div>
                                        <div className="flex items-center gap-2 mb-3">
                                            <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center">
                                                <Crown className="w-5 h-5 text-warning-400" />
                                            </div>
                                            <span className="text-xs font-black uppercase tracking-widest opacity-60">Subscriber Tier</span>
                                        </div>
                                        <h2 className="text-4xl font-black tracking-tight">{tier.name}</h2>
                                        <p className="mt-2 text-white/50 font-bold uppercase tracking-widest text-xs">
                                            Member since {format(new Date(currentMembership.createdAt), 'MMMM yyyy')}
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-2xl text-xs font-black uppercase tracking-widest shadow-xl
                                            ${currentMembership.status === 'Active' ? 'bg-success-500 text-white' : 'bg-danger-500 text-white'}`}>
                                            <div className={`w-2 h-2 rounded-full ${currentMembership.status === 'Active' ? 'bg-white animate-pulse' : 'bg-white'}`} />
                                            {currentMembership.status}
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    <div className="bg-white/5 backdrop-blur-md rounded-2xl p-4 border border-white/5">
                                        <p className="text-[10px] font-black uppercase tracking-widest opacity-40 mb-1">Price</p>
                                        <p className="text-xl font-black">${tier.price}<span className="text-xs opacity-50">/mo</span></p>
                                    </div>
                                    <div className="bg-white/5 backdrop-blur-md rounded-2xl p-4 border border-white/5">
                                        <p className="text-[10px] font-black uppercase tracking-widest opacity-40 mb-1">Renewal</p>
                                        <p className="text-xl font-black">{daysLeft > 0 ? `${daysLeft}d` : 'EXPIRED'}</p>
                                    </div>
                                    <div className="bg-white/5 backdrop-blur-md rounded-2xl p-4 border border-white/5">
                                        <p className="text-[10px] font-black uppercase tracking-widest opacity-40 mb-1">Status</p>
                                        <p className="text-xl font-black">{currentMembership.auto_renew ? 'Auto' : 'Onetime'}</p>
                                    </div>
                                    <div className="bg-white/5 backdrop-blur-md rounded-2xl p-4 border border-white/5">
                                        <p className="text-[10px] font-black uppercase tracking-widest opacity-40 mb-1">Access</p>
                                        <p className="text-xl font-black">24/7</p>
                                    </div>
                                </div>

                                <div className="mt-8 flex flex-wrap items-center gap-4">
                                    <button
                                        onClick={handleAutoRenew}
                                        className="bg-white text-surface-900 px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center gap-2 hover:scale-105 active:scale-95 transition-all shadow-xl">
                                        <RefreshCcw className="w-4 h-4" />
                                        {currentMembership.auto_renew ? 'Disable Auto-Renew' : 'Enable Auto-Renew'}
                                    </button>
                                    <p className="text-xs font-medium text-white/50 max-w-xs">
                                        Next billing cycle starts on {format(new Date(currentMembership.expiry_date), 'MMM d, yyyy')}.
                                    </p>
                                </div>
                            </>
                        ) : (
                            <div className="text-center py-8">
                                <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-6">
                                    <Crown className="w-8 h-8 text-warning-400" />
                                </div>
                                <h2 className="text-3xl font-black tracking-tight mb-3">Choose Your Access Level</h2>
                                <p className="text-primary-100/60 font-medium max-w-md mx-auto">
                                    Select a membership tier below to unlock hub spaces, equipment bookings, and networking events.
                                </p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Privileges List */}
                <div className="bg-white dark:bg-surface-800/50 rounded-[2.5rem] p-8 border border-surface-200 dark:border-surface-700/50 shadow-sm overflow-hidden">
                    <h3 className="font-black text-sm uppercase tracking-widest text-surface-400 mb-6 flex items-center gap-2">
                        <Star className="w-5 h-5 text-warning-500" /> {tier ? 'Included Benefits' : 'Select a Plan'}
                    </h3>
                    <div className="space-y-3">
                        {tier ? (
                            <>
                                {permissions.map((priv, i) => (
                                    <div key={i} className="flex items-center gap-3 p-3 rounded-2xl bg-surface-50 dark:bg-surface-800/50 group hover:translate-x-1 transition-transform">
                                        <div className="w-8 h-8 rounded-xl bg-success-500/10 flex items-center justify-center">
                                            <Check className="w-4 h-4 text-success-500" />
                                        </div>
                                        <span className="text-sm font-bold text-surface-700 dark:text-surface-300">{priv}</span>
                                    </div>
                                ))}
                                <div className="p-3 rounded-2xl bg-primary-500/5 flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-xl bg-primary-500/10 flex items-center justify-center">
                                        <Zap className="w-4 h-4 text-primary-500" />
                                    </div>
                                    <span className="text-sm font-bold text-primary-600 dark:text-primary-400">
                                        {tier.maxBookingHours === -1 ? 'Unlimited' : `${tier.maxBookingHours}h/daily`} bookings
                                    </span>
                                </div>
                            </>
                        ) : (
                            <div className="py-12 text-center">
                                <Sparkles className="w-10 h-10 text-primary-500/20 mx-auto mb-4" />
                                <p className="text-xs font-bold text-surface-400 uppercase tracking-widest leading-relaxed">
                                    Tier perks will appear<br />once a plan is selected
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Upgrade Options */}
            <section className="pt-6">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="font-black text-xl tracking-tight uppercase">Switch Plan</h3>
                    <div className="h-px flex-1 bg-surface-100 dark:bg-surface-800 mx-6" />
                </div>

                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {tiers.map(t => {
                        const isCurrent = tier && t.id === tier.id;
                        const isHigher = tier ? t.price > tier.price : true;

                        return (
                            <div key={t.id}
                                className={`relative group rounded-[2rem] p-6 border transition-all duration-300
                                    ${isCurrent
                                        ? 'border-primary-500 bg-primary-500/5 ring-4 ring-primary-500/10'
                                        : 'border-surface-200 dark:border-surface-800 bg-white dark:bg-surface-800/50 hover:border-primary-500/30'}`}>

                                {isCurrent && (
                                    <span className="absolute -top-3 left-6 px-3 py-1 bg-primary-500 text-white text-[10px] font-black uppercase tracking-widest rounded-full shadow-lg">Current</span>
                                )}

                                <div className="w-12 h-12 rounded-2xl mb-4 flex items-center justify-center transition-transform group-hover:rotate-12" style={{ backgroundColor: `${t.color}20` }}>
                                    <Crown className="w-6 h-6" style={{ color: t.color }} />
                                </div>

                                <h4 className="font-black text-lg">{t.name}</h4>
                                <div className="mt-1 flex items-baseline gap-1">
                                    <span className="text-2xl font-black">${t.price}</span>
                                    <span className="text-xs font-bold text-surface-400">/mo</span>
                                </div>

                                <ul className="mt-6 space-y-2 text-xs font-bold text-surface-500">
                                    <li className="flex items-center gap-2">
                                        <CheckCircle2 className="w-3.5 h-3.5 text-success-500" />
                                        {t.maxBookingHours === -1 ? 'Unlimited' : `${t.maxBookingHours}h`} Booking
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <CheckCircle2 className="w-3.5 h-3.5 text-success-500" />
                                        {t.maxRooms === -1 ? 'Full' : t.maxRooms} Space Access
                                    </li>
                                </ul>

                                <button
                                    onClick={() => handleUpgrade(t.id)}
                                    disabled={isCurrent || upgrading}
                                    className={`mt-8 w-full py-3 text-xs font-black uppercase tracking-widest rounded-2xl transition-all flex items-center justify-center gap-2
                                        ${isCurrent
                                            ? 'bg-surface-100 dark:bg-surface-700 text-surface-400 cursor-not-allowed'
                                            : 'bg-primary-500 text-white hover:bg-primary-600 shadow-lg shadow-primary-500/20 active:scale-95'}`}>
                                    {upgrading ? 'Processing...' : (isHigher ? 'Select Plan' : (isCurrent ? 'Current' : 'Select Plan'))}
                                    {!isCurrent && <ArrowUpRight className="w-4 h-4" />}
                                </button>
                            </div>
                        );
                    })}
                </div>
            </section>

            {/* History Table */}
            <section className="bg-white dark:bg-surface-800/50 rounded-[2.5rem] p-8 border border-surface-200 dark:border-surface-700/50 shadow-sm">
                <div className="flex items-center justify-between mb-8">
                    <h3 className="font-black text-xl tracking-tight uppercase flex items-center gap-3 text-surface-400">
                        <History className="w-6 h-6" /> Invoice History
                    </h3>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-surface-100 dark:border-surface-700/50">
                                <th className="pb-4 text-[10px] font-black uppercase tracking-widest text-surface-400">Date</th>
                                <th className="pb-4 text-[10px] font-black uppercase tracking-widest text-surface-400">Tier</th>
                                <th className="pb-4 text-[10px] font-black uppercase tracking-widest text-surface-400">Amount</th>
                                <th className="pb-4 text-[10px] font-black uppercase tracking-widest text-surface-400">Status</th>
                                <th className="pb-4 text-[10px] font-black uppercase tracking-widest text-surface-400">Type</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-surface-100 dark:divide-surface-800">
                            {history.map((item) => (
                                <tr key={item.id} className="group hover:bg-surface-50 dark:hover:bg-surface-800/50 transition-colors">
                                    <td className="py-4 font-bold text-sm">{format(new Date(item.createdAt), 'MMM d, yyyy')}</td>
                                    <td className="py-4">
                                        <div className="flex items-center gap-2">
                                            <div className="w-2 h-2 rounded-full" style={{ background: item.AccessTier?.color }} />
                                            <span className="font-bold text-sm tracking-tight capitalize">{item.AccessTier?.name}</span>
                                        </div>
                                    </td>
                                    <td className="py-4 font-black text-sm">${item.AccessTier?.price}</td>
                                    <td className="py-4">
                                        <span className={`px-2 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest ${item.status === 'Active' ? 'bg-success-500/10 text-success-600' : 'bg-surface-100 dark:bg-surface-700 text-surface-500'}`}>
                                            {item.status}
                                        </span>
                                    </td>
                                    <td className="py-4">
                                        <div className="flex items-center gap-1.5 text-xs text-surface-400 font-bold">
                                            <CreditCard className="w-3 h-3" />
                                            Visa •••• 4242
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </section>
        </div>
    );
}
