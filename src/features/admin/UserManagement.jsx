import { useState, useEffect } from 'react';
import api from '../../lib/api';
import { ROLES } from '../../lib/mockData';
import {
    UserPlus, Search, X, Eye, Shield, Mail, Calendar,
    Crown, Activity, ChevronRight, AlertTriangle, Check
} from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';

const roleStyles = {
    'Admin': 'bg-danger-500/10 text-danger-600 dark:text-danger-400',
    'Hub Manager': 'bg-warning-500/10 text-warning-600 dark:text-warning-400',
    'Security': 'bg-accent-500/10 text-accent-600 dark:text-accent-400',
    'Instructor': 'bg-primary-500/10 text-primary-600 dark:text-primary-400',
    'Member': 'bg-success-500/10 text-success-600 dark:text-success-400',
};

/* ───── User Detail Drawer ───── */
function UserDetailDrawer({ user, onClose }) {
    const [detail, setDetail] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (user?.id) {
            setLoading(true);
            api.get(`/users/${user.id}`)
                .then(res => setDetail(res.data))
                .catch(err => console.error(err))
                .finally(() => setLoading(false));
        }
    }, [user?.id]);

    if (!user) return null;

    const membership = detail?.Memberships?.find(m => m.status === 'Active');
    const accessLogs = detail?.AccessLogs || [];

    return (
        <div className="fixed inset-0 z-50 flex justify-end">
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
            <div className="relative w-full max-w-lg bg-white dark:bg-surface-900 h-full overflow-y-auto shadow-2xl animate-in slide-in-from-right-10">
                {/* Header */}
                <div className="sticky top-0 z-10 bg-gradient-to-br from-primary-600 to-primary-700 p-6 pb-8">
                    <button onClick={onClose} className="absolute top-4 right-4 p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                    <div className="flex items-center gap-4 mt-4">
                        <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center text-white text-2xl font-bold">
                            {(user.name || '?').split(' ').map(n => n[0]).join('').toUpperCase()}
                        </div>
                        <div className="text-white">
                            <h2 className="text-xl font-bold">{user.name}</h2>
                            <p className="text-sm opacity-80 flex items-center gap-1"><Mail className="w-3.5 h-3.5" /> {user.email}</p>
                            <span className={`mt-1 inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold bg-white/20`}>
                                {user.role}
                            </span>
                        </div>
                    </div>
                </div>

                {loading ? (
                    <div className="flex items-center justify-center py-20">
                        <div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
                    </div>
                ) : (
                    <div className="p-6 space-y-6 -mt-4">
                        {/* Quick Info Cards */}
                        <div className="grid grid-cols-2 gap-3">
                            <div className="bg-surface-50 dark:bg-surface-800 rounded-xl p-4">
                                <p className="text-xs text-surface-500 uppercase tracking-wider">Role</p>
                                <p className="font-semibold mt-1 flex items-center gap-1.5">
                                    <Shield className="w-4 h-4 text-primary-500" /> {detail?.role || user.role}
                                </p>
                            </div>
                            <div className="bg-surface-50 dark:bg-surface-800 rounded-xl p-4">
                                <p className="text-xs text-surface-500 uppercase tracking-wider">Joined</p>
                                <p className="font-semibold mt-1 flex items-center gap-1.5">
                                    <Calendar className="w-4 h-4 text-accent-500" />
                                    {detail?.createdAt ? format(new Date(detail.createdAt), 'MMM d, yyyy') : 'N/A'}
                                </p>
                            </div>
                        </div>

                        {/* Membership & Status Management */}
                        <div>
                            <h3 className="font-semibold text-sm mb-3 flex items-center gap-2">
                                <Crown className="w-4 h-4 text-warning-500" /> Membership & Status
                            </h3>
                            <div className="bg-surface-50 dark:bg-surface-800 rounded-xl p-4 space-y-4">
                                {membership ? (
                                    <div className="space-y-4">
                                        <div className="flex justify-between text-sm">
                                            <span className="text-surface-500">Tier</span>
                                            <span className="font-medium">{membership.AccessTier?.name || 'N/A'}</span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-xs font-bold text-surface-400 uppercase tracking-widest">Payment Status</span>
                                            <select
                                                value={membership.payment_status}
                                                onChange={(e) => {
                                                    api.put(`/onboarding/admin/activate/${user.id}`, { paymentStatus: e.target.value })
                                                        .then(() => {
                                                            setDetail(prev => ({
                                                                ...prev,
                                                                Memberships: prev.Memberships.map(m => m.id === membership.id ? { ...m, payment_status: e.target.value } : m)
                                                            }));
                                                        });
                                                }}
                                                className="bg-white dark:bg-surface-700 border border-surface-200 dark:border-surface-600 rounded-lg px-2 py-1 text-xs font-bold"
                                            >
                                                <option value="UNPAID">UNPAID</option>
                                                <option value="PAID">PAID</option>
                                            </select>
                                        </div>
                                    </div>
                                ) : (
                                    <p className="text-sm text-surface-400 italic">No active membership</p>
                                )}

                                <div className="pt-2 border-t border-surface-100 dark:border-surface-700 mt-2 flex justify-between items-center">
                                    <span className="text-xs font-bold text-surface-400 uppercase tracking-widest">Account Activation</span>
                                    <button
                                        onClick={() => {
                                            const newStatus = detail.activation_status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
                                            api.put(`/onboarding/admin/activate/${user.id}`, { status: newStatus })
                                                .then(() => setDetail(prev => ({ ...prev, activation_status: newStatus })));
                                        }}
                                        className={`px-3 py-1.5 rounded-lg text-xs font-black uppercase tracking-widest transition-all ${detail?.activation_status === 'ACTIVE'
                                            ? 'bg-success-500 text-white'
                                            : 'bg-surface-200 dark:bg-surface-700 text-surface-500'
                                            }`}
                                    >
                                        {detail?.activation_status === 'ACTIVE' ? 'Activated' : 'Activate'}
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Recent Access Logs */}
                        <div>
                            <h3 className="font-semibold text-sm mb-3 flex items-center gap-2">
                                <Activity className="w-4 h-4 text-accent-500" /> Recent Access ({accessLogs.length})
                            </h3>
                            {accessLogs.length > 0 ? (
                                <div className="space-y-2">
                                    {accessLogs.slice(0, 10).map(log => (
                                        <div key={log.id} className="flex items-center gap-3 py-2 px-3 bg-surface-50 dark:bg-surface-800 rounded-lg text-sm">
                                            <div className={`w-2 h-2 rounded-full shrink-0 ${log.decision === 'Grant' ? 'bg-success-400' : 'bg-danger-400'}`} />
                                            <div className="flex-1 min-w-0">
                                                <p className="font-medium">{log.decision}</p>
                                                <p className="text-xs text-surface-500">
                                                    {formatDistanceToNow(new Date(log.createdAt), { addSuffix: true })}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-sm text-surface-400 italic bg-surface-50 dark:bg-surface-800 rounded-xl p-4">
                                    No access logs
                                </p>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

/* ───── Create User Modal ───── */
function CreateUserModal({ onClose, onCreated }) {
    const [form, setForm] = useState({ name: '', email: '', password: '', role: 'Member' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.name || !form.email || !form.password) {
            setError('All fields are required');
            return;
        }
        setLoading(true);
        setError('');
        try {
            const res = await api.post('/users', form);
            onCreated(res.data);
            onClose();
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to create user');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <form onSubmit={handleSubmit} className="bg-white dark:bg-surface-800 rounded-2xl p-6 w-full max-w-md shadow-2xl">
                <h3 className="text-lg font-bold mb-1">Create New User</h3>
                <p className="text-sm text-surface-500 mb-5">Add a new member or staff user to the hub</p>

                {error && (
                    <div className="mb-4 flex items-center gap-2 px-3 py-2 rounded-xl bg-danger-500/10 text-danger-500 text-sm">
                        <AlertTriangle className="w-4 h-4 shrink-0" /> {error}
                    </div>
                )}

                <div className="space-y-3">
                    <div>
                        <label className="text-xs font-medium text-surface-500 mb-1 block">Full Name</label>
                        <input type="text" placeholder="e.g. Alex Chen" value={form.name}
                            onChange={(e) => setForm({ ...form, name: e.target.value })}
                            className="w-full px-4 py-3 rounded-xl border border-surface-200 dark:border-surface-700 bg-transparent text-sm focus:outline-none focus:border-primary-500 transition-colors" />
                    </div>
                    <div>
                        <label className="text-xs font-medium text-surface-500 mb-1 block">Email Address</label>
                        <input type="email" placeholder="alex@hub.com" value={form.email}
                            onChange={(e) => setForm({ ...form, email: e.target.value })}
                            className="w-full px-4 py-3 rounded-xl border border-surface-200 dark:border-surface-700 bg-transparent text-sm focus:outline-none focus:border-primary-500 transition-colors" />
                    </div>
                    <div>
                        <label className="text-xs font-medium text-surface-500 mb-1 block">Password</label>
                        <input type="password" placeholder="Min. 6 characters" value={form.password}
                            onChange={(e) => setForm({ ...form, password: e.target.value })}
                            className="w-full px-4 py-3 rounded-xl border border-surface-200 dark:border-surface-700 bg-transparent text-sm focus:outline-none focus:border-primary-500 transition-colors" />
                    </div>
                    <div>
                        <label className="text-xs font-medium text-surface-500 mb-1 block">Role</label>
                        <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}
                            className="w-full px-4 py-3 rounded-xl border border-surface-200 dark:border-surface-700 bg-transparent text-sm focus:outline-none focus:border-primary-500 transition-colors">
                            <option value="Member">Member</option>
                            <option value="Admin">Admin</option>
                            <option value="Hub Manager">Hub Manager</option>
                            <option value="Security">Security</option>
                            <option value="Instructor">Instructor</option>
                        </select>
                    </div>
                </div>

                <div className="flex gap-3 mt-6">
                    <button type="button" onClick={onClose}
                        className="flex-1 py-2.5 rounded-xl border border-surface-200 dark:border-surface-700 text-sm font-medium hover:bg-surface-50 dark:hover:bg-surface-700 transition-colors">
                        Cancel
                    </button>
                    <button type="submit" disabled={loading}
                        className="flex-1 py-2.5 rounded-xl bg-primary-500 text-white text-sm font-medium hover:bg-primary-600 transition-colors shadow-md shadow-primary-500/20 disabled:opacity-50 flex items-center justify-center gap-2">
                        {loading ? (
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        ) : (
                            <><UserPlus className="w-4 h-4" /> Create User</>
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
}

/* ═══════════════════════════════════════ */
/* ───── USER MANAGEMENT PAGE ─────────── */
/* ═══════════════════════════════════════ */

export default function UserManagement() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [roleFilter, setRoleFilter] = useState('all');
    const [showCreate, setShowCreate] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    const [toast, setToast] = useState(null);

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const res = await api.get('/users');
            setUsers(res.data);
        } catch (err) {
            console.error('Error fetching users:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const filtered = users.filter(u => {
        const matchSearch = !search || `${u.name} ${u.email}`.toLowerCase().includes(search.toLowerCase());
        const matchRole = roleFilter === 'all' || u.role === roleFilter;
        return matchSearch && matchRole;
    });

    const roleCounts = {
        all: users.length,
        Admin: users.filter(u => u.role === 'Admin').length,
        Member: users.filter(u => u.role === 'Member').length,
        'Hub Manager': users.filter(u => u.role === 'Hub Manager').length,
        Security: users.filter(u => u.role === 'Security').length,
        Instructor: users.filter(u => u.role === 'Instructor').length,
    };

    const handleCreated = (newUser) => {
        setUsers(prev => [newUser, ...prev]);
        setToast(`${newUser.name} has been created`);
        setTimeout(() => setToast(null), 3000);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[50vh]">
                <div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="space-y-6 page-enter page-enter-active">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold">Users</h1>
                    <p className="text-surface-500 mt-1">{users.length} total users across all roles</p>
                </div>
                <button onClick={() => setShowCreate(true)}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary-500 text-white text-sm font-medium hover:bg-primary-600 transition-colors shadow-md shadow-primary-500/20">
                    <UserPlus className="w-4 h-4" /> Add User
                </button>
            </div>

            {/* Search + Role Filters */}
            <div className="flex flex-col sm:flex-row gap-3">
                <div className="flex-1 flex items-center gap-2 bg-white dark:bg-surface-800 rounded-xl px-4 py-2.5 border border-surface-200 dark:border-surface-700">
                    <Search className="w-4 h-4 text-surface-400" />
                    <input type="text" placeholder="Search by name or email..." value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="bg-transparent border-none outline-none text-sm w-full" />
                </div>
                <div className="flex gap-1.5 overflow-x-auto pb-1">
                    {['all', 'Admin', 'Hub Manager', 'Member', 'Security', 'Instructor'].map(r => (
                        <button key={r} onClick={() => setRoleFilter(r)}
                            className={`px-3 py-2 rounded-xl text-xs font-medium transition-all whitespace-nowrap
                            ${roleFilter === r
                                    ? 'bg-primary-500 text-white shadow-md shadow-primary-500/20'
                                    : 'bg-white dark:bg-surface-800 border border-surface-200 dark:border-surface-700 hover:bg-surface-50 dark:hover:bg-surface-700'}`}>
                            {r === 'all' ? 'All' : r}
                            <span className="ml-1 opacity-60">({roleCounts[r] || 0})</span>
                        </button>
                    ))}
                </div>
            </div>

            {/* User Cards */}
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {filtered.map(user => {
                    const initials = (user.name || '?').split(' ').map(n => n[0]).join('').toUpperCase();
                    const activeMembership = user.Memberships?.find(m => m.status === 'Active');

                    return (
                        <div key={user.id}
                            onClick={() => setSelectedUser(user)}
                            className="bg-white dark:bg-surface-800/50 rounded-2xl border border-surface-200 dark:border-surface-700/50 p-5 hover:shadow-lg hover:border-primary-300 dark:hover:border-primary-700 transition-all duration-300 cursor-pointer group">
                            <div className="flex items-start justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-400 to-accent-400 flex items-center justify-center text-white font-bold text-sm shadow-md">
                                        {initials}
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-sm group-hover:text-primary-500 transition-colors">{user.name}</h3>
                                        <p className="text-xs text-surface-500 flex items-center gap-1">
                                            <Mail className="w-3 h-3" /> {user.email}
                                        </p>
                                    </div>
                                </div>
                                <ChevronRight className="w-4 h-4 text-surface-300 group-hover:text-primary-500 group-hover:translate-x-1 transition-all" />
                            </div>

                            <div className="flex flex-wrap items-center gap-2 mt-4">
                                <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${roleStyles[user.role] || roleStyles.Member}`}>
                                    {user.role}
                                </span>
                                {activeMembership && (
                                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${activeMembership.payment_status === 'PAID'
                                            ? 'bg-success-500/10 text-success-600 dark:text-success-400'
                                            : 'bg-warning-500/10 text-warning-600 dark:text-warning-400 line-through opacity-50'
                                        }`}>
                                        <Crown className="w-3 h-3" />
                                        {activeMembership.AccessTier?.name || 'Active'}
                                    </span>
                                )}
                                <span className={`px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-tight ${user.activation_status === 'ACTIVE'
                                        ? 'bg-primary-500/10 text-primary-600 dark:text-primary-400'
                                        : 'bg-surface-200 dark:bg-surface-700 text-surface-500'
                                    }`}>
                                    {user.activation_status || 'INACTIVE'}
                                </span>
                            </div>

                            <div className="flex items-center gap-1 mt-3 text-[11px] text-surface-400">
                                <Calendar className="w-3 h-3" />
                                Joined {user.createdAt ? formatDistanceToNow(new Date(user.createdAt), { addSuffix: true }) : 'recently'}
                            </div>
                        </div>
                    );
                })}
            </div>

            {filtered.length === 0 && (
                <div className="text-center py-16 text-surface-500">
                    <Search className="w-12 h-12 mx-auto text-surface-300 mb-3" />
                    <p className="text-lg font-medium">No users found</p>
                    <p className="text-sm mt-1">Try adjusting your search or filters</p>
                </div>
            )}

            {/* Modals */}
            {showCreate && <CreateUserModal onClose={() => setShowCreate(false)} onCreated={handleCreated} />}
            {selectedUser && <UserDetailDrawer user={selectedUser} onClose={() => setSelectedUser(null)} />}

            {/* Toast */}
            {toast && (
                <div className="fixed bottom-24 md:bottom-8 left-1/2 -translate-x-1/2 z-50 bg-surface-900 dark:bg-surface-100 text-white dark:text-surface-900 px-6 py-3 rounded-xl shadow-2xl text-sm font-medium flex items-center gap-2">
                    <Check className="w-4 h-4 text-success-400" /> {toast}
                </div>
            )}
        </div>
    );
}
