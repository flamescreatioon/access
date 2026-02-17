import { useMembershipStore } from '../../stores/membershipStore';
import { Crown, Calendar, CreditCard, Star, ArrowUpRight, Check, Zap } from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';

export default function MemberDashboard() {
    const { currentMembership, tiers } = useMembershipStore();
    const tier = currentMembership.tier;
    const daysLeft = Math.ceil((new Date(currentMembership.expiryDate) - new Date()) / 86400000);

    return (
        <div className="max-w-4xl mx-auto space-y-6 page-enter page-enter-active">
            <div>
                <h1 className="text-2xl md:text-3xl font-bold">Membership</h1>
                <p className="text-surface-500 mt-1">Manage your plan and access privileges</p>
            </div>

            {/* Current Plan Card */}
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary-600 via-primary-700 to-accent-700 p-6 md:p-8 text-white">
                <div className="absolute -right-12 -top-12 w-48 h-48 bg-white/5 rounded-full blur-xl" />
                <div className="absolute -left-8 -bottom-8 w-32 h-32 bg-accent-500/20 rounded-full blur-xl" />

                <div className="relative">
                    <div className="flex items-start justify-between flex-wrap gap-4">
                        <div>
                            <div className="flex items-center gap-2 mb-2">
                                <Crown className="w-6 h-6 text-warning-400" />
                                <span className="text-sm uppercase tracking-wider opacity-80">Current Plan</span>
                            </div>
                            <h2 className="text-3xl font-bold">{tier.name}</h2>
                            <p className="mt-1 opacity-80 text-lg">${tier.price}/month</p>
                        </div>
                        <div className="text-right">
                            <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium
                ${currentMembership.status === 'active' ? 'bg-success-500/20 text-success-300' : 'bg-danger-500/20 text-danger-300'}`}>
                                <div className={`w-2 h-2 rounded-full ${currentMembership.status === 'active' ? 'bg-success-400 pulse-dot' : 'bg-danger-400'}`} />
                                {currentMembership.status === 'active' ? 'Active' : 'Expired'}
                            </div>
                        </div>
                    </div>

                    <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="bg-white/10 backdrop-blur rounded-xl p-3">
                            <Calendar className="w-4 h-4 opacity-60 mb-1" />
                            <p className="text-xs opacity-60">Expires</p>
                            <p className="font-semibold text-sm">{daysLeft > 0 ? `${daysLeft} days` : 'Expired'}</p>
                        </div>
                        <div className="bg-white/10 backdrop-blur rounded-xl p-3">
                            <CreditCard className="w-4 h-4 opacity-60 mb-1" />
                            <p className="text-xs opacity-60">Payment</p>
                            <p className="font-semibold text-sm capitalize">{currentMembership.paymentStatus}</p>
                        </div>
                        <div className="bg-white/10 backdrop-blur rounded-xl p-3">
                            <Zap className="w-4 h-4 opacity-60 mb-1" />
                            <p className="text-xs opacity-60">Accesses</p>
                            <p className="font-semibold text-sm">{currentMembership.accessCount}</p>
                        </div>
                        <div className="bg-white/10 backdrop-blur rounded-xl p-3">
                            <Star className="w-4 h-4 opacity-60 mb-1" />
                            <p className="text-xs opacity-60">Since</p>
                            <p className="font-semibold text-sm">{format(new Date(currentMembership.joinDate), 'MMM yyyy')}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Privileges */}
            <div className="bg-white dark:bg-surface-800/50 rounded-2xl p-6 border border-surface-200 dark:border-surface-700/50">
                <h3 className="font-semibold text-lg mb-4">Your Privileges</h3>
                <div className="grid sm:grid-cols-2 gap-2">
                    {currentMembership.privileges.map((priv, i) => (
                        <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-surface-50 dark:bg-surface-800">
                            <div className="w-8 h-8 rounded-lg bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
                                <Check className="w-4 h-4 text-primary-500" />
                            </div>
                            <span className="text-sm font-medium">{priv}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Upgrade Options */}
            <div>
                <h3 className="font-semibold text-lg mb-4">Available Plans</h3>
                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {tiers.map(t => {
                        const isCurrent = t.id === tier.id;
                        return (
                            <div key={t.id}
                                className={`relative rounded-2xl p-5 border transition-all hover:shadow-lg
                  ${isCurrent
                                        ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20 ring-2 ring-primary-500/20'
                                        : 'border-surface-200 dark:border-surface-700/50 bg-white dark:bg-surface-800/50'}`}>
                                {isCurrent && (
                                    <span className="absolute -top-2.5 left-4 px-2 py-0.5 bg-primary-500 text-white text-xs font-semibold rounded-full">Current</span>
                                )}
                                <div className="w-10 h-10 rounded-xl mb-3 flex items-center justify-center" style={{ background: t.color + '20' }}>
                                    <Crown className="w-5 h-5" style={{ color: t.color }} />
                                </div>
                                <h4 className="font-bold">{t.name}</h4>
                                <p className="text-2xl font-bold mt-1">${t.price}<span className="text-sm font-normal text-surface-500">/mo</span></p>
                                <ul className="mt-3 space-y-1.5 text-sm text-surface-600 dark:text-surface-400">
                                    <li className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-success-500" /> {t.maxBookingHours === -1 ? 'Unlimited' : `${t.maxBookingHours}hrs`} booking</li>
                                    <li className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-success-500" /> {t.maxRooms === -1 ? 'All rooms' : `${t.maxRooms} rooms`}</li>
                                </ul>
                                {!isCurrent && (
                                    <button className="mt-4 w-full py-2 text-sm font-semibold rounded-xl bg-surface-100 dark:bg-surface-700 hover:bg-surface-200 dark:hover:bg-surface-600 transition-colors flex items-center justify-center gap-1">
                                        {t.price > tier.price ? 'Upgrade' : 'Downgrade'} <ArrowUpRight className="w-3.5 h-3.5" />
                                    </button>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
