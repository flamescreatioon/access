import { useState, useEffect } from 'react';
import api from '../../lib/api';
import {
    UserPlus, Search, X, Eye, Shield, Mail, Calendar,
    Crown, Activity, ChevronRight, AlertTriangle, Check,
    Clock, CheckCircle2, XCircle, Building2, Layers,
    Users, GraduationCap, BookOpen, CreditCard
} from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';
import toast from 'react-hot-toast';

const roleStyles = {
    'Admin': 'bg-danger-500/10 text-danger-600 dark:text-danger-400',
    'Hub Manager': 'bg-warning-500/10 text-warning-600 dark:text-warning-400',
    'Security': 'bg-accent-500/10 text-accent-600 dark:text-accent-400',
    'Instructor': 'bg-primary-500/10 text-primary-600 dark:text-primary-400',
    'Student': 'bg-success-500/10 text-success-600 dark:text-success-400',
    'Lecturer': 'bg-primary-500/10 text-primary-600 dark:text-primary-400',
    'Member': 'bg-success-500/10 text-success-600 dark:text-success-400',
};

const paymentStatusStyles = {
    'PAID': 'bg-success-500/10 text-success-600 dark:text-success-400',
    'AWAITING_ADMIN_CONFIRMATION': 'bg-warning-500/10 text-warning-600 dark:text-warning-400',
    'NOT_REQUESTED': 'bg-surface-200 dark:bg-surface-700 text-surface-500',
    'REJECTED': 'bg-danger-500/10 text-danger-600 dark:text-danger-400',
    'NOT_REQUIRED': 'bg-surface-200 dark:bg-surface-700 text-surface-500',
};

/* ───── User Detail Drawer ───── */
function UserDetailDrawer({ user, onClose, onRefresh }) {
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

    const accessLogs = detail?.AccessLogs || [];

    const handleApprove = async () => {
        try {
            await api.put(`/onboarding/admin/approve/${user.id}`);
            toast.success(`${user.name} approved and activated!`);
            setDetail(prev => ({ ...prev, activation_status: 'ACTIVE', payment_status: 'PAID' }));
            onRefresh?.();
        } catch (err) {
            toast.error('Failed to approve user');
        }
    };

    const handleReject = async () => {
        try {
            await api.put(`/onboarding/admin/reject/${user.id}`);
            toast.success(`${user.name} payment rejected`);
            setDetail(prev => ({ ...prev, activation_status: 'INCOMPLETE', payment_status: 'REJECTED' }));
            onRefresh?.();
        } catch (err) {
            toast.error('Failed to reject');
        }
    };

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
                            <span className="mt-1 inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold bg-white/20">
                                {user.role || 'No role yet'}
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
                        {/* Quick Info */}
                        <div className="grid grid-cols-2 gap-3">
                            <div className="bg-surface-50 dark:bg-surface-800 rounded-xl p-4">
                                <p className="text-xs text-surface-500 uppercase tracking-wider">Role</p>
                                <p className="font-semibold mt-1 flex items-center gap-1.5">
                                    <Shield className="w-4 h-4 text-primary-500" /> {detail?.role || 'Unset'}
                                </p>
                            </div>
                            <div className="bg-surface-50 dark:bg-surface-800 rounded-xl p-4">
                                <p className="text-xs text-surface-500 uppercase tracking-wider">Joined</p>
                                <p className="font-semibold mt-1 flex items-center gap-1.5">
                                    <Calendar className="w-4 h-4 text-accent-500" />
                                    {detail?.createdAt ? format(new Date(detail.createdAt), 'MMM d, yyyy') : 'N/A'}
                                </p>
                            </div>
                            <div className="bg-surface-50 dark:bg-surface-800 rounded-xl p-4">
                                <p className="text-xs text-surface-500 uppercase tracking-wider">Department</p>
                                <p className="font-semibold mt-1 flex items-center gap-1.5">
                                    <Building2 className="w-4 h-4 text-warning-500" /> {detail?.department || '—'}
                                </p>
                            </div>
                            <div className="bg-surface-50 dark:bg-surface-800 rounded-xl p-4">
                                <p className="text-xs text-surface-500 uppercase tracking-wider">Level</p>
                                <p className="font-semibold mt-1 flex items-center gap-1.5">
                                    <Layers className="w-4 h-4 text-success-500" /> {detail?.level ? `${detail.level} Level` : '—'}
                                </p>
                            </div>
                        </div>

                        {/* Payment & Activation */}
                        <div>
                            <h3 className="font-semibold text-sm mb-3 flex items-center gap-2">
                                <CreditCard className="w-4 h-4 text-warning-500" /> Payment & Activation
                            </h3>
                            <div className="bg-surface-50 dark:bg-surface-800 rounded-xl p-4 space-y-4">
                                <div className="flex justify-between items-center">
                                    <span className="text-xs font-bold text-surface-400 uppercase tracking-widest">Payment Status</span>
                                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${paymentStatusStyles[detail?.payment_status] || ''}`}>
                                        {detail?.payment_status?.replace(/_/g, ' ') || 'UNKNOWN'}
                                    </span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-xs font-bold text-surface-400 uppercase tracking-widest">Activation</span>
                                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${detail?.activation_status === 'ACTIVE' ? 'bg-success-500/10 text-success-600' : 'bg-surface-200 dark:bg-surface-700 text-surface-500'}`}>
                                        {detail?.activation_status || 'UNKNOWN'}
                                    </span>
                                </div>

                                {/* Admin Action Buttons */}
                                {detail?.payment_status === 'AWAITING_ADMIN_CONFIRMATION' && (
                                    <div className="flex gap-2 pt-2 border-t border-surface-100 dark:border-surface-700">
                                        <button onClick={handleApprove}
                                            className="flex-1 py-2.5 rounded-xl bg-success-500 text-white text-sm font-bold flex items-center justify-center gap-2 hover:bg-success-600 transition-all shadow-md shadow-success-500/20">
                                            <CheckCircle2 className="w-4 h-4" /> Approve
                                        </button>
                                        <button onClick={handleReject}
                                            className="flex-1 py-2.5 rounded-xl bg-danger-500 text-white text-sm font-bold flex items-center justify-center gap-2 hover:bg-danger-600 transition-all shadow-md shadow-danger-500/20">
                                            <XCircle className="w-4 h-4" /> Reject
                                        </button>
                                    </div>
                                )}

                                {detail?.activation_status !== 'ACTIVE' && detail?.payment_status !== 'AWAITING_ADMIN_CONFIRMATION' && (
                                    <div className="pt-2 border-t border-surface-100 dark:border-surface-700">
                                        <button onClick={handleApprove}
                                            className="w-full py-2.5 rounded-xl bg-primary-500 text-white text-sm font-bold flex items-center justify-center gap-2 hover:bg-primary-600 transition-all">
                                            <CheckCircle2 className="w-4 h-4" /> Force Activate
                                        </button>
                                    </div>
                                )}
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
    const [form, setForm] = useState({ name: '', email: '', password: '', department: '', level: '' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.name || !form.email || !form.password) {
            setError('Name, email, and password are required');
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
                <h3 className="text-lg font-bold mb-1">Create New Account</h3>
                <p className="text-sm text-surface-500 mb-5">Admin creates the account — user picks role at first login</p>

                {error && (
                    <div className="mb-4 flex items-center gap-2 px-3 py-2 rounded-xl bg-danger-500/10 text-danger-500 text-sm">
                        <AlertTriangle className="w-4 h-4 shrink-0" /> {error}
                    </div>
                )}

                <div className="space-y-3">
                    <div>
                        <label className="text-xs font-medium text-surface-500 mb-1 block">Full Name *</label>
                        <input type="text" placeholder="e.g. Alex Chen" value={form.name}
                            onChange={(e) => setForm({ ...form, name: e.target.value })}
                            className="w-full px-4 py-3 rounded-xl border border-surface-200 dark:border-surface-700 bg-transparent text-sm focus:outline-none focus:border-primary-500 transition-colors" />
                    </div>
                    <div>
                        <label className="text-xs font-medium text-surface-500 mb-1 block">Email Address *</label>
                        <input type="email" placeholder="alex@hub.com" value={form.email}
                            onChange={(e) => setForm({ ...form, email: e.target.value })}
                            className="w-full px-4 py-3 rounded-xl border border-surface-200 dark:border-surface-700 bg-transparent text-sm focus:outline-none focus:border-primary-500 transition-colors" />
                    </div>
                    <div>
                        <label className="text-xs font-medium text-surface-500 mb-1 block">Temporary Password *</label>
                        <input type="password" placeholder="Min. 6 characters" value={form.password}
                            onChange={(e) => setForm({ ...form, password: e.target.value })}
                            className="w-full px-4 py-3 rounded-xl border border-surface-200 dark:border-surface-700 bg-transparent text-sm focus:outline-none focus:border-primary-500 transition-colors" />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="text-xs font-medium text-surface-500 mb-1 block">Department</label>
                            <input type="text" placeholder="e.g. CS" value={form.department}
                                onChange={(e) => setForm({ ...form, department: e.target.value })}
                                className="w-full px-4 py-3 rounded-xl border border-surface-200 dark:border-surface-700 bg-transparent text-sm focus:outline-none focus:border-primary-500 transition-colors" />
                        </div>
                        <div>
                            <label className="text-xs font-medium text-surface-500 mb-1 block">Level</label>
                            <select value={form.level} onChange={(e) => setForm({ ...form, level: e.target.value })}
                                className="w-full px-4 py-3 rounded-xl border border-surface-200 dark:border-surface-700 bg-transparent text-sm focus:outline-none focus:border-primary-500 transition-colors">
                                <option value="">—</option>
                                <option value="100">100</option>
                                <option value="200">200</option>
                                <option value="300">300</option>
                                <option value="400">400</option>
                                <option value="500">500</option>
                                <option value="600">600</option>
                                <option value="PG">PG</option>
                            </select>
                        </div>
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
                            <><UserPlus className="w-4 h-4" /> Create Account</>
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
    const [filter, setFilter] = useState('all');
    const [showCreate, setShowCreate] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);

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

    // Derived counts
    const totalStudents = users.filter(u => u.role === 'Student').length;
    const activeStudents = users.filter(u => u.role === 'Student' && u.activation_status === 'ACTIVE').length;
    const awaitingPayment = users.filter(u => u.payment_status === 'AWAITING_ADMIN_CONFIRMATION').length;
    const lecturerWaitlist = users.filter(u => u.role === 'Lecturer').length;

    const filtered = users.filter(u => {
        const matchSearch = !search || `${u.name} ${u.email} ${u.department || ''}`.toLowerCase().includes(search.toLowerCase());
        if (filter === 'all') return matchSearch;
        if (filter === 'awaiting') return matchSearch && u.payment_status === 'AWAITING_ADMIN_CONFIRMATION';
        if (filter === 'active') return matchSearch && u.activation_status === 'ACTIVE';
        if (filter === 'inactive') return matchSearch && u.activation_status !== 'ACTIVE';
        if (filter === 'lecturers') return matchSearch && u.role === 'Lecturer';
        return matchSearch && u.role === filter;
    });

    const handleCreated = (newUser) => {
        setUsers(prev => [newUser, ...prev]);
        toast.success(`${newUser.name} account created`);
    };

    const handleQuickApprove = async (userId, e) => {
        e.stopPropagation();
        try {
            await api.put(`/onboarding/admin/approve/${userId}`);
            toast.success('User approved!');
            fetchUsers();
        } catch (err) {
            toast.error('Failed to approve');
        }
    };

    const handleQuickReject = async (userId, e) => {
        e.stopPropagation();
        try {
            await api.put(`/onboarding/admin/reject/${userId}`);
            toast.success('Payment rejected');
            fetchUsers();
        } catch (err) {
            toast.error('Failed to reject');
        }
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
                    <h1 className="text-2xl md:text-3xl font-bold">User Management</h1>
                    <p className="text-surface-500 mt-1">{users.length} total users</p>
                </div>
                <button onClick={() => setShowCreate(true)}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary-500 text-white text-sm font-medium hover:bg-primary-600 transition-colors shadow-md shadow-primary-500/20">
                    <UserPlus className="w-4 h-4" /> Create Account
                </button>
            </div>

            {/* Overview Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white dark:bg-surface-800 rounded-2xl border border-surface-200 dark:border-surface-700 p-5">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 rounded-xl bg-primary-500/10 flex items-center justify-center">
                            <GraduationCap className="w-5 h-5 text-primary-500" />
                        </div>
                        <p className="text-xs font-bold text-surface-400 uppercase tracking-widest">Total Students</p>
                    </div>
                    <p className="text-3xl font-black">{totalStudents}</p>
                </div>
                <div className="bg-white dark:bg-surface-800 rounded-2xl border border-surface-200 dark:border-surface-700 p-5">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 rounded-xl bg-success-500/10 flex items-center justify-center">
                            <CheckCircle2 className="w-5 h-5 text-success-500" />
                        </div>
                        <p className="text-xs font-bold text-surface-400 uppercase tracking-widest">Active</p>
                    </div>
                    <p className="text-3xl font-black">{activeStudents}</p>
                </div>
                <button onClick={() => setFilter('awaiting')}
                    className="bg-white dark:bg-surface-800 rounded-2xl border border-surface-200 dark:border-surface-700 p-5 text-left hover:border-warning-400 transition-colors">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 rounded-xl bg-warning-500/10 flex items-center justify-center">
                            <Clock className="w-5 h-5 text-warning-500" />
                        </div>
                        <p className="text-xs font-bold text-surface-400 uppercase tracking-widest">Awaiting Payment</p>
                    </div>
                    <p className="text-3xl font-black text-warning-600">{awaitingPayment}</p>
                </button>
                <div className="bg-white dark:bg-surface-800 rounded-2xl border border-surface-200 dark:border-surface-700 p-5">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 rounded-xl bg-accent-500/10 flex items-center justify-center">
                            <BookOpen className="w-5 h-5 text-accent-500" />
                        </div>
                        <p className="text-xs font-bold text-surface-400 uppercase tracking-widest">Lecturers</p>
                    </div>
                    <p className="text-3xl font-black">{lecturerWaitlist}</p>
                </div>
            </div>

            {/* Search + Filters */}
            <div className="flex flex-col sm:flex-row gap-3">
                <div className="flex-1 flex items-center gap-2 bg-white dark:bg-surface-800 rounded-xl px-4 py-2.5 border border-surface-200 dark:border-surface-700">
                    <Search className="w-4 h-4 text-surface-400" />
                    <input type="text" placeholder="Search by name, email, or department..." value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="bg-transparent border-none outline-none text-sm w-full" />
                </div>
                <div className="flex gap-1.5 overflow-x-auto pb-1">
                    {[
                        { key: 'all', label: 'All' },
                        { key: 'awaiting', label: '⏳ Awaiting' },
                        { key: 'active', label: 'Active' },
                        { key: 'inactive', label: 'Inactive' },
                        { key: 'lecturers', label: 'Lecturers' },
                    ].map(f => (
                        <button key={f.key} onClick={() => setFilter(f.key)}
                            className={`px-3 py-2 rounded-xl text-xs font-medium transition-all whitespace-nowrap
                            ${filter === f.key
                                    ? 'bg-primary-500 text-white shadow-md shadow-primary-500/20'
                                    : 'bg-white dark:bg-surface-800 border border-surface-200 dark:border-surface-700 hover:bg-surface-50 dark:hover:bg-surface-700'}`}>
                            {f.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Payment Requests Banner (if any) */}
            {awaitingPayment > 0 && filter !== 'awaiting' && (
                <button onClick={() => setFilter('awaiting')}
                    className="w-full p-4 bg-warning-500/10 border border-warning-500/20 rounded-2xl text-left flex items-center gap-3 hover:bg-warning-500/15 transition-colors">
                    <div className="w-10 h-10 rounded-xl bg-warning-500/20 flex items-center justify-center shrink-0">
                        <Clock className="w-5 h-5 text-warning-600" />
                    </div>
                    <div className="flex-1">
                        <p className="font-bold text-warning-700 dark:text-warning-400">{awaitingPayment} payment request{awaitingPayment > 1 ? 's' : ''} awaiting confirmation</p>
                        <p className="text-xs text-warning-600/70 dark:text-warning-400/70">Click to review and approve</p>
                    </div>
                    <ChevronRight className="w-5 h-5 text-warning-500" />
                </button>
            )}

            {/* User Cards */}
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {filtered.map(user => {
                    const initials = (user.name || '?').split(' ').map(n => n[0]).join('').toUpperCase();
                    const isAwaiting = user.payment_status === 'AWAITING_ADMIN_CONFIRMATION';

                    return (
                        <div key={user.id}
                            onClick={() => setSelectedUser(user)}
                            className={`bg-white dark:bg-surface-800/50 rounded-2xl border p-5 hover:shadow-lg transition-all duration-300 cursor-pointer group ${isAwaiting
                                ? 'border-warning-400/50 dark:border-warning-500/30 ring-1 ring-warning-200 dark:ring-warning-900/30'
                                : 'border-surface-200 dark:border-surface-700/50 hover:border-primary-300 dark:hover:border-primary-700'}`}>
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

                            {/* Tags */}
                            <div className="flex flex-wrap items-center gap-2 mt-4">
                                {user.role && (
                                    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${roleStyles[user.role] || roleStyles.Member}`}>
                                        {user.role}
                                    </span>
                                )}
                                {!user.role && (
                                    <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-surface-200 dark:bg-surface-700 text-surface-500">
                                        No Role
                                    </span>
                                )}
                                <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${paymentStatusStyles[user.payment_status] || ''}`}>
                                    {user.payment_status?.replace(/_/g, ' ') || '—'}
                                </span>
                                <span className={`px-2.5 py-1 rounded-full text-xs font-bold uppercase ${user.activation_status === 'ACTIVE'
                                    ? 'bg-primary-500/10 text-primary-600 dark:text-primary-400'
                                    : 'bg-surface-200 dark:bg-surface-700 text-surface-500'
                                    }`}>
                                    {user.activation_status || 'INACTIVE'}
                                </span>
                            </div>

                            {/* Department & Level */}
                            {(user.department || user.level) && (
                                <div className="flex items-center gap-2 mt-3 text-[11px] text-surface-400">
                                    {user.department && <span className="flex items-center gap-1"><Building2 className="w-3 h-3" />{user.department}</span>}
                                    {user.level && <span className="flex items-center gap-1"><Layers className="w-3 h-3" />L{user.level}</span>}
                                </div>
                            )}

                            {/* Quick Actions for Awaiting */}
                            {isAwaiting && (
                                <div className="flex gap-2 mt-3 pt-3 border-t border-surface-100 dark:border-surface-700">
                                    <button onClick={(e) => handleQuickApprove(user.id, e)}
                                        className="flex-1 py-2 rounded-xl bg-success-500 text-white text-xs font-bold flex items-center justify-center gap-1 hover:bg-success-600 transition-all">
                                        <CheckCircle2 className="w-3.5 h-3.5" /> Approve
                                    </button>
                                    <button onClick={(e) => handleQuickReject(user.id, e)}
                                        className="flex-1 py-2 rounded-xl bg-danger-500/10 text-danger-500 text-xs font-bold flex items-center justify-center gap-1 hover:bg-danger-500/20 transition-all">
                                        <XCircle className="w-3.5 h-3.5" /> Reject
                                    </button>
                                </div>
                            )}

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
            {selectedUser && <UserDetailDrawer user={selectedUser} onClose={() => setSelectedUser(null)} onRefresh={fetchUsers} />}
        </div>
    );
}
