import { useEffect, useState } from 'react';
import { useAuthStore } from '../../stores/authStore';
import { useMembershipStore } from '../../stores/membershipStore';
import { useSecurityStore } from '../../stores/securityStore';
import api from '../../lib/api';
import {
    User, Mail, Shield, Calendar, Settings, LogOut, Bell, Lock, Smartphone,
    Award, Clock, CheckCircle2, ChevronRight, Camera, Edit3, Fingerprint,
    CreditCard, Zap, ShieldAlert, History, Activity, Monitor, Trash2
} from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';
import toast from 'react-hot-toast';

export default function ProfilePage() {
    const { user, logout } = useAuthStore();
    const { currentMembership, fetchCurrentMembership } = useMembershipStore();
    const {
        sessions, auditLogs, loading: securityLoading,
        fetchSessions, fetchAuditLogs, revokeSession, updatePassword, updateSettings
    } = useSecurityStore();

    const [certifications, setCertifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('identity'); // identity, security, activity

    // Password change state
    const [passwordData, setPasswordData] = useState({ current: '', next: '', confirm: '' });
    const [isChangingPassword, setIsChangingPassword] = useState(false);

    useEffect(() => {
        const load = async () => {
            setLoading(true);
            try {
                const [certRes] = await Promise.all([
                    api.get('/equipment/certifications'),
                    fetchCurrentMembership(user.id),
                    fetchSessions(),
                    fetchAuditLogs()
                ]);
                setCertifications(certRes.data);
            } catch (err) {
                console.error('Failed to load profile data', err);
            } finally {
                setLoading(false);
            }
        };
        if (user) load();
    }, [user]);

    const handlePasswordChange = async (e) => {
        e.preventDefault();
        if (passwordData.next !== passwordData.confirm) {
            return toast.error("New passwords don't match");
        }

        setIsChangingPassword(true);
        const res = await updatePassword(passwordData.current, passwordData.next);
        setIsChangingPassword(false);

        if (res.success) {
            toast.success("Password updated. All other sessions revoked.");
            setPasswordData({ current: '', next: '', confirm: '' });
        } else {
            toast.error(res.message);
        }
    };

    const toggleSetting = async (category, field, value) => {
        const newSettings = {
            ...user.settings,
            notifications: {
                ...user.settings?.notifications,
                [field]: value
            }
        };
        const res = await updateSettings(newSettings);
        if (res) toast.success('Preference updated');
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[50vh]">
                <div className="w-10 h-10 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mb-4" />
                <p className="text-sm font-black uppercase tracking-widest text-surface-400">Syncing Identity...</p>
            </div>
        );
    }

    return (
        <div className="max-w-5xl mx-auto space-y-8 page-enter page-enter-active pb-20">
            {/* Header / Tabs */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-surface-200 dark:border-surface-800 pb-2">
                <div>
                    <h1 className="text-4xl font-black tracking-tighter">Hub Profile</h1>
                    <p className="text-surface-500 mt-1 font-semibold">Manage your identity, security, and activity history.</p>
                </div>

                <div className="flex bg-surface-100 dark:bg-surface-800/50 p-1.5 rounded-[1.5rem] border border-surface-200 dark:border-surface-700/50">
                    {[
                        { id: 'identity', label: 'Identity', icon: User },
                        { id: 'security', label: 'Security', icon: Shield },
                        { id: 'activity', label: 'Activity', icon: Activity }
                    ].map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl text-xs font-black uppercase tracking-wider transition-all
                                ${activeTab === tab.id
                                    ? 'bg-white dark:bg-surface-700 text-primary-500 shadow-xl shadow-primary-500/10 active-tab-scale'
                                    : 'text-surface-500 hover:text-surface-900 dark:hover:text-surface-200'}`}
                        >
                            <tab.icon className="w-4 h-4" />
                            {tab.label}
                        </button>
                    ))}
                </div>
            </div>

            <div className="grid lg:grid-cols-12 gap-8">
                {/* Left Side: Static User Summary (Always Visible or mostly) */}
                <div className="lg:col-span-4 space-y-6">
                    <div className="bg-white dark:bg-surface-800/50 rounded-[3rem] border border-surface-200 dark:border-surface-700/50 overflow-hidden shadow-2xl shadow-surface-500/5">
                        <div className="h-32 bg-gradient-to-br from-primary-500 to-indigo-600 relative overflow-hidden">
                            <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]" />
                            <div className="absolute -right-8 -top-8 w-32 h-32 bg-white/10 rounded-full blur-3xl" />
                        </div>
                        <div className="px-8 pb-10 text-center">
                            <div className="relative inline-block -mt-16 mb-6">
                                <img
                                    src={`https://ui-avatars.com/api/?name=${user?.name}&background=6366f1&color=fff&size=200`}
                                    alt=""
                                    className="w-32 h-32 rounded-[2.5rem] border-[10px] border-white dark:border-surface-800 bg-surface-200 shadow-2xl object-cover"
                                />
                                <div className="absolute -bottom-1 -right-1 w-10 h-10 bg-success-500 border-[6px] border-white dark:border-surface-800 rounded-full shadow-lg" />
                            </div>
                            <h2 className="text-3xl font-black tracking-tight">{user?.name}</h2>
                            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-primary-500 mt-2 bg-primary-500/10 inline-block px-4 py-1.5 rounded-full">
                                {user?.role}
                            </p>

                            <div className="mt-8 grid grid-cols-2 gap-3">
                                <button className="py-3.5 bg-white dark:bg-surface-700 border border-surface-200 dark:border-surface-600 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-surface-50 transition-all flex items-center justify-center gap-2">
                                    <Edit3 className="w-3.5 h-3.5" /> Edit
                                </button>
                                <button
                                    onClick={logout}
                                    className="py-3.5 text-danger-500 border border-danger-500/10 font-black text-[10px] uppercase tracking-widest hover:bg-danger-500/5 rounded-2xl transition-all flex items-center justify-center gap-2">
                                    <LogOut className="w-3.5 h-3.5" /> Kill
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-surface-800/50 rounded-[2.5rem] p-8 border border-surface-200 dark:border-surface-700/50 space-y-6">
                        <div className="space-y-6">
                            <h3 className="text-[11px] font-black uppercase tracking-widest text-surface-400 flex items-center gap-2">
                                <ShieldAlert className="w-4 h-4" /> Account Metrics
                            </h3>
                            <div className="grid grid-cols-1 gap-4">
                                <div className="p-4 rounded-2xl bg-surface-50 dark:bg-surface-900/50 border border-surface-100 dark:border-surface-800">
                                    <p className="text-[10px] font-black text-surface-400 uppercase tracking-widest mb-1">Status</p>
                                    <div className="flex items-center gap-2">
                                        <div className="w-2 h-2 rounded-full bg-success-500 animate-pulse" />
                                        <span className="text-sm font-black text-success-500">Active Verified</span>
                                    </div>
                                </div>
                                <div className="p-4 rounded-2xl bg-surface-50 dark:bg-surface-900/50 border border-surface-100 dark:border-surface-800">
                                    <p className="text-[10px] font-black text-surface-400 uppercase tracking-widest mb-1">Hub Since</p>
                                    <span className="text-sm font-black">{format(new Date(user.createdAt), 'MMMM yyyy')}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Side: Tab Content */}
                <div className="lg:col-span-8">
                    {activeTab === 'identity' && (
                        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            {/* Certifications */}
                            <div className="bg-white dark:bg-surface-800/50 rounded-[3rem] p-10 border border-surface-200 dark:border-surface-700/50 shadow-sm relative overflow-hidden">
                                <div className="absolute right-0 top-0 w-64 h-64 bg-primary-500/5 rounded-full -mr-32 -mt-32 blur-3xl pointer-events-none" />

                                <div className="flex items-center justify-between mb-10 relative">
                                    <h3 className="font-black text-2xl tracking-tighter flex items-center gap-4">
                                        <Award className="w-8 h-8 text-primary-500" /> Equipment Qualifications
                                    </h3>
                                    <span className="text-xs font-black bg-primary-500 text-white px-5 py-2 rounded-full uppercase tracking-tighter shadow-lg shadow-primary-500/20">
                                        {certifications.length} Active
                                    </span>
                                </div>

                                {certifications.length > 0 ? (
                                    <div className="grid md:grid-cols-2 gap-6">
                                        {certifications.map((cert) => (
                                            <div key={cert.id} className="group relative bg-white dark:bg-surface-800 border-2 border-surface-100 dark:border-surface-700/50 p-6 rounded-[2.5rem] hover:border-primary-500/50 transition-all hover:shadow-2xl hover:shadow-primary-500/10">
                                                <div className="flex items-start justify-between mb-5">
                                                    <div className="w-14 h-14 bg-surface-50 dark:bg-surface-700 rounded-2xl flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform">
                                                        <Shield className="w-7 h-7 text-success-500" />
                                                    </div>
                                                    <div className="flex flex-col items-end">
                                                        <span className="text-[9px] font-black uppercase tracking-widest px-3 py-1 bg-success-500/10 text-success-500 rounded-full border border-success-500/20 mb-1">Valid</span>
                                                        <span className="text-[8px] font-bold text-surface-400 uppercase tracking-widest">ID: {cert.id.toString().padStart(4, '0')}</span>
                                                    </div>
                                                </div>
                                                <h4 className="font-black text-xl mb-1 tracking-tight">{cert.certification_name}</h4>
                                                <div className="flex items-center gap-2 text-xs font-bold text-surface-400">
                                                    <Clock className="w-4 h-4" />
                                                    Certified until {format(new Date(cert.expires_at), 'MMM d, yyyy')}
                                                </div>

                                                <div className="mt-6 pt-6 border-t border-surface-100 dark:border-surface-700/50 flex items-center justify-between">
                                                    <div className="flex items-center gap-2">
                                                        <Zap className="w-3.5 h-3.5 text-warning-500" />
                                                        <span className="text-[10px] font-black uppercase tracking-widest text-surface-500">High Danger Access</span>
                                                    </div>
                                                    <CheckCircle2 className="w-5 h-5 text-success-500" />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-24 bg-surface-50 dark:bg-surface-800/30 rounded-[3rem] border-4 border-dotted border-surface-200 dark:border-surface-700/50">
                                        <Award className="w-16 h-16 text-surface-300 mx-auto mb-6" />
                                        <h4 className="text-xl font-black mb-2">Technically Unqualified</h4>
                                        <p className="text-surface-500 max-w-xs mx-auto font-medium mb-8">You haven't completed any tool workshops yet. Safety first!</p>
                                        <button className="px-8 py-3.5 bg-primary-500 text-white font-black text-xs uppercase tracking-widest rounded-2xl hover:scale-105 active:scale-95 transition-all shadow-xl shadow-primary-500/20">
                                            Find Workshops
                                        </button>
                                    </div>
                                )}
                            </div>

                            {/* Notifications / Preferences */}
                            <div className="bg-white dark:bg-surface-800/50 rounded-[3rem] p-10 border border-surface-200 dark:border-surface-700/50">
                                <h3 className="font-black text-xl mb-8 flex items-center gap-3">
                                    <Bell className="w-6 h-6 text-warning-500" /> Notification Preferences
                                </h3>
                                <div className="grid md:grid-cols-2 gap-8">
                                    {[
                                        { id: 'push', icon: Smartphone, label: 'Real-time Push', desc: 'Alerts directly to your device.' },
                                        { id: 'email', icon: Mail, label: 'Digest Emails', desc: 'Summary of bookings and invoices.' },
                                        { id: 'marketing', icon: Zap, label: 'Community Hub', desc: 'Workshops, events, and news.' },
                                    ].map((pref) => {
                                        const active = user.settings?.notifications?.[pref.id] ?? false;
                                        return (
                                            <div key={pref.id} className="flex items-center justify-between p-4 rounded-3xl bg-surface-50 dark:bg-surface-900/30 border border-surface-100 dark:border-surface-800">
                                                <div className="flex items-center gap-4">
                                                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${active ? 'bg-primary-500 text-white shadow-lg shadow-primary-500/20' : 'bg-surface-200 dark:bg-surface-800 text-surface-400'}`}>
                                                        <pref.icon className="w-6 h-6" />
                                                    </div>
                                                    <div>
                                                        <h4 className="font-black text-sm tracking-tight">{pref.label}</h4>
                                                        <p className="text-[10px] font-bold text-surface-400 uppercase tracking-widest">{pref.desc}</p>
                                                    </div>
                                                </div>
                                                <button
                                                    onClick={() => toggleSetting('notifications', pref.id, !active)}
                                                    className={`w-14 h-7 rounded-full relative transition-all duration-300 ${active ? 'bg-primary-500' : 'bg-surface-200 dark:bg-surface-700'}`}
                                                >
                                                    <div className={`absolute top-1 w-5 h-5 bg-white rounded-full shadow-md transition-all duration-300 ${active ? 'right-1' : 'left-1'}`} />
                                                </button>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'security' && (
                        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            {/* Password Change */}
                            <div className="bg-white dark:bg-surface-800/50 rounded-[3rem] p-10 border border-surface-200 dark:border-surface-700/50">
                                <h3 className="font-black text-2xl mb-8 flex items-center gap-3">
                                    <Lock className="w-7 h-7 text-danger-500" /> Update Master Key
                                </h3>
                                <form onSubmit={handlePasswordChange} className="max-w-md space-y-6">
                                    <div className="space-y-4">
                                        <div className="relative">
                                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400" />
                                            <input
                                                type="password"
                                                placeholder="Current Password"
                                                required
                                                value={passwordData.current}
                                                onChange={e => setPasswordData({ ...passwordData, current: e.target.value })}
                                                className="w-full pl-12 pr-4 py-4 bg-surface-50 dark:bg-surface-900 border border-surface-200 dark:border-surface-700 rounded-2xl font-bold focus:ring-2 focus:ring-primary-500 outline-none transition-all"
                                            />
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="relative">
                                                <input
                                                    type="password"
                                                    placeholder="New Password"
                                                    required
                                                    value={passwordData.next}
                                                    onChange={e => setPasswordData({ ...passwordData, next: e.target.value })}
                                                    className="w-full px-4 py-4 bg-surface-50 dark:bg-surface-900 border border-surface-200 dark:border-surface-700 rounded-2xl font-bold focus:ring-2 focus:ring-primary-500 outline-none transition-all"
                                                />
                                            </div>
                                            <div className="relative">
                                                <input
                                                    type="password"
                                                    placeholder="Confirm"
                                                    required
                                                    value={passwordData.confirm}
                                                    onChange={e => setPasswordData({ ...passwordData, confirm: e.target.value })}
                                                    className="w-full px-4 py-4 bg-surface-50 dark:bg-surface-900 border border-surface-200 dark:border-surface-700 rounded-2xl font-bold focus:ring-2 focus:ring-primary-500 outline-none transition-all"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                    <button
                                        type="submit"
                                        disabled={isChangingPassword}
                                        className="w-full py-4 bg-black dark:bg-white dark:text-black text-white font-black text-xs uppercase tracking-widest rounded-2xl hover:bg-primary-500 dark:hover:bg-primary-500 dark:hover:text-white transition-all disabled:opacity-50"
                                    >
                                        {isChangingPassword ? 'Securing...' : 'Rotate Master Key'}
                                    </button>
                                </form>
                            </div>

                            {/* Active Sessions */}
                            <div className="bg-white dark:bg-surface-800/50 rounded-[3rem] p-10 border border-surface-200 dark:border-surface-700/50">
                                <div className="flex items-center justify-between mb-8">
                                    <h3 className="font-black text-2xl tracking-tighter flex items-center gap-3">
                                        <Smartphone className="w-7 h-7 text-primary-500" /> Logged Devices
                                    </h3>
                                    <button onClick={fetchSessions} className="p-2 hover:bg-surface-100 dark:hover:bg-surface-700 rounded-xl transition-all">
                                        <History className="w-5 h-5 text-surface-400" />
                                    </button>
                                </div>

                                <div className="space-y-4">
                                    {sessions.map((session) => (
                                        <div key={session.id} className="flex items-center justify-between p-5 rounded-3xl bg-surface-50 dark:bg-surface-900/30 border border-surface-100 dark:border-surface-800 group hover:border-primary-500/30 transition-all">
                                            <div className="flex items-center gap-5">
                                                <div className="w-14 h-14 bg-white dark:bg-surface-800 rounded-2xl flex items-center justify-center shadow-sm">
                                                    <Monitor className="w-7 h-7 text-surface-400 group-hover:text-primary-500 transition-colors" />
                                                </div>
                                                <div>
                                                    <h4 className="font-black text-base">{session.device_info === 'Unknown' ? 'Web Session' : session.device_info?.split(' ')[0]}</h4>
                                                    <div className="flex items-center gap-3 text-[10px] font-black text-surface-400 uppercase tracking-widest mt-1">
                                                        <span>{session.ip_address}</span>
                                                        <span className="w-1 h-1 rounded-full bg-surface-300" />
                                                        <span>Used {formatDistanceToNow(new Date(session.last_used_at), { addSuffix: true })}</span>
                                                    </div>
                                                </div>
                                            </div>
                                            {session.token === localStorage.getItem('token') ? (
                                                <span className="px-4 py-1.5 bg-success-500/10 text-success-500 text-[10px] font-black uppercase tracking-widest rounded-full border border-success-500/20">Current</span>
                                            ) : (
                                                <button
                                                    onClick={() => {
                                                        if (confirm('Terminate this session?')) revokeSession(session.id);
                                                    }}
                                                    className="p-3 text-surface-400 hover:text-danger-500 hover:bg-danger-500/5 rounded-2xl transition-all opacity-0 group-hover:opacity-100"
                                                >
                                                    <Trash2 className="w-5 h-5" />
                                                </button>
                                            )}
                                        </div>
                                    ))}
                                    {sessions.length === 0 && <p className="text-center text-surface-400 py-10 font-bold uppercase tracking-widest text-xs">No active sessions tracked</p>}
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'activity' && (
                        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-8">
                            <div className="bg-white dark:bg-surface-800/50 rounded-[3rem] p-10 border border-surface-200 dark:border-surface-700/50">
                                <h3 className="font-black text-2xl mb-8 flex items-center gap-3">
                                    <Activity className="w-7 h-7 text-primary-500" /> Identity Activity Stream
                                </h3>

                                <div className="space-y-1 relative before:absolute before:left-[1.75rem] before:top-4 before:bottom-4 before:w-[2px] before:bg-surface-100 dark:before:bg-surface-800">
                                    {auditLogs.map((log) => (
                                        <div key={log.id} className="relative pl-14 py-4 group">
                                            <div className={`absolute left-0 top-6 w-9 h-9 rounded-xl border-4 border-white dark:border-surface-800 flex items-center justify-center z-10 
                                                ${log.status === 'FAILURE' ? 'bg-danger-500 shadow-lg shadow-danger-500/30' : 'bg-surface-100 dark:bg-surface-700 group-hover:bg-primary-500 transition-colors'}`}>
                                                {log.action === 'LOGIN' && <Fingerprint className={`w-4 h-4 ${log.status === 'FAILURE' ? 'text-white' : 'text-surface-400 group-hover:text-white'}`} />}
                                                {log.action === 'PASSWORD_CHANGE' && <Lock className={`w-4 h-4 ${log.status === 'FAILURE' ? 'text-white' : 'text-surface-400 group-hover:text-white'}`} />}
                                                {log.action === 'REGISTER' && <User className={`w-4 h-4 text-surface-400 group-hover:text-white`} />}
                                                {(!['LOGIN', 'PASSWORD_CHANGE', 'REGISTER'].includes(log.action)) && <Zap className={`w-4 h-4 text-surface-400 group-hover:text-white`} />}
                                            </div>

                                            <div className="bg-surface-50 dark:bg-surface-900/30 border border-surface-100 dark:border-surface-800 p-5 rounded-[1.75rem] group-hover:border-primary-500/20 transition-all">
                                                <div className="flex items-center justify-between mb-1">
                                                    <h4 className="font-black text-sm tracking-tight capitalize">
                                                        {log.action.replace('_', ' ')}
                                                    </h4>
                                                    <span className="text-[10px] font-black text-surface-400 uppercase tracking-widest">
                                                        {formatDistanceToNow(new Date(log.createdAt), { addSuffix: true })}
                                                    </span>
                                                </div>
                                                <p className="text-[11px] font-bold text-surface-500 leading-relaxed">
                                                    Session established from <span className="text-surface-700 dark:text-surface-300">{log.ip_address}</span>.
                                                    {log.details?.reason && <span className="text-danger-500 ml-1">Error: {log.details.reason}</span>}
                                                </p>
                                                <div className="mt-3 text-[9px] font-black uppercase tracking-[0.2em] text-surface-400">
                                                    OS: {log.user_agent?.split('(')[1]?.split(')')[0] || 'Unknown Kernel'}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                    {auditLogs.length === 0 && (
                                        <div className="text-center py-24 pl-14 opacity-50">
                                            <p className="text-xs font-black uppercase tracking-widest">No activity recorded yet</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
