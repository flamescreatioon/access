import { useState } from 'react';
import { useMembershipStore } from '../../stores/membershipStore';
import { Search, Filter, MoreVertical, UserCheck, UserX, Crown, ArrowUpDown } from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';

const statusStyles = {
    active: 'bg-success-500/10 text-success-600 dark:text-success-400',
    expired: 'bg-danger-500/10 text-danger-600 dark:text-danger-400',
    suspended: 'bg-warning-500/10 text-warning-600 dark:text-warning-400',
};

export default function AdminMemberList() {
    const { members, suspendMember, reactivateMember, tiers, updateMemberTier } = useMembershipStore();
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [openMenuId, setOpenMenuId] = useState(null);

    const filtered = members.filter(m => {
        const matchSearch = !search || `${m.firstName} ${m.lastName} ${m.email}`.toLowerCase().includes(search.toLowerCase());
        const matchStatus = statusFilter === 'all' || m.status === statusFilter;
        return matchSearch && matchStatus;
    });

    return (
        <div className="space-y-6 page-enter page-enter-active">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold">Members</h1>
                    <p className="text-surface-500 mt-1">{members.length} total members</p>
                </div>
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-3">
                <div className="flex-1 flex items-center gap-2 bg-white dark:bg-surface-800 rounded-xl px-4 py-2.5 border border-surface-200 dark:border-surface-700">
                    <Search className="w-4 h-4 text-surface-400" />
                    <input
                        type="text" placeholder="Search members..." value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="bg-transparent border-none outline-none text-sm w-full"
                    />
                </div>
                <div className="flex gap-2">
                    {['all', 'active', 'expired', 'suspended'].map(s => (
                        <button key={s} onClick={() => setStatusFilter(s)}
                            className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-all capitalize
                ${statusFilter === s ? 'bg-primary-500 text-white shadow-md shadow-primary-500/20' : 'bg-white dark:bg-surface-800 border border-surface-200 dark:border-surface-700 hover:bg-surface-50 dark:hover:bg-surface-700'}`}>
                            {s}
                        </button>
                    ))}
                </div>
            </div>

            {/* Table */}
            <div className="bg-white dark:bg-surface-800/50 rounded-2xl border border-surface-200 dark:border-surface-700/50 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-surface-200 dark:border-surface-700">
                                <th className="text-left text-xs font-semibold text-surface-500 uppercase tracking-wider px-5 py-3">Member</th>
                                <th className="text-left text-xs font-semibold text-surface-500 uppercase tracking-wider px-5 py-3 hidden md:table-cell">Tier</th>
                                <th className="text-left text-xs font-semibold text-surface-500 uppercase tracking-wider px-5 py-3">Status</th>
                                <th className="text-left text-xs font-semibold text-surface-500 uppercase tracking-wider px-5 py-3 hidden lg:table-cell">Expires</th>
                                <th className="text-left text-xs font-semibold text-surface-500 uppercase tracking-wider px-5 py-3 hidden lg:table-cell">Last Access</th>
                                <th className="text-right text-xs font-semibold text-surface-500 uppercase tracking-wider px-5 py-3">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.map(m => (
                                <tr key={m.id} className="border-b border-surface-100 dark:border-surface-700/50 hover:bg-surface-50 dark:hover:bg-surface-800/50 transition-colors">
                                    <td className="px-5 py-3">
                                        <div className="flex items-center gap-3">
                                            <img src={m.avatar} alt="" className="w-9 h-9 rounded-full bg-surface-200" />
                                            <div>
                                                <p className="font-medium text-sm">{m.firstName} {m.lastName}</p>
                                                <p className="text-xs text-surface-500">{m.email}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-5 py-3 hidden md:table-cell">
                                        <span className="inline-flex items-center gap-1.5 text-sm">
                                            <Crown className="w-3.5 h-3.5" style={{ color: m.tier.color }} />
                                            {m.tier.name}
                                        </span>
                                    </td>
                                    <td className="px-5 py-3">
                                        <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-semibold capitalize ${statusStyles[m.status]}`}>
                                            {m.status}
                                        </span>
                                    </td>
                                    <td className="px-5 py-3 hidden lg:table-cell text-sm text-surface-500">
                                        {format(new Date(m.expiryDate), 'MMM d, yyyy')}
                                    </td>
                                    <td className="px-5 py-3 hidden lg:table-cell text-sm text-surface-500">
                                        {formatDistanceToNow(new Date(m.lastAccess), { addSuffix: true })}
                                    </td>
                                    <td className="px-5 py-3 text-right relative">
                                        <button onClick={() => setOpenMenuId(openMenuId === m.id ? null : m.id)}
                                            className="p-1.5 rounded-lg hover:bg-surface-100 dark:hover:bg-surface-700 transition-colors">
                                            <MoreVertical className="w-4 h-4" />
                                        </button>
                                        {openMenuId === m.id && (
                                            <div className="absolute right-5 top-12 w-44 bg-white dark:bg-surface-800 rounded-xl shadow-2xl border border-surface-200 dark:border-surface-700 py-1 z-10">
                                                {m.status === 'suspended' ? (
                                                    <button onClick={() => { reactivateMember(m.id); setOpenMenuId(null); }}
                                                        className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-surface-50 dark:hover:bg-surface-700 text-success-500">
                                                        <UserCheck className="w-4 h-4" /> Reactivate
                                                    </button>
                                                ) : (
                                                    <button onClick={() => { suspendMember(m.id); setOpenMenuId(null); }}
                                                        className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-surface-50 dark:hover:bg-surface-700 text-danger-500">
                                                        <UserX className="w-4 h-4" /> Suspend
                                                    </button>
                                                )}
                                                {tiers.map(t => (
                                                    <button key={t.id} onClick={() => { updateMemberTier(m.id, t.id); setOpenMenuId(null); }}
                                                        className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-surface-50 dark:hover:bg-surface-700">
                                                        <Crown className="w-4 h-4" style={{ color: t.color }} /> Set {t.name}
                                                    </button>
                                                ))}
                                            </div>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                {filtered.length === 0 && (
                    <div className="text-center py-12 text-surface-500">
                        <p className="text-lg">No members found</p>
                        <p className="text-sm mt-1">Try adjusting your search or filters</p>
                    </div>
                )}
            </div>
        </div>
    );
}
