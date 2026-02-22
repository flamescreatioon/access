import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';
import { ROLES } from '../../lib/mockData';
import { Zap, Mail, Lock, Eye, EyeOff, ArrowRight } from 'lucide-react';

const roleOptions = [
    { value: ROLES.MEMBER, label: 'Member', desc: 'Access card, bookings, activity' },
    { value: ROLES.ADMIN, label: 'Admin', desc: 'Full management panel' },
    { value: ROLES.HUB_MANAGER, label: 'Hub Manager', desc: 'Branch management' },
    { value: ROLES.SECURITY, label: 'Security', desc: 'Access monitoring' },
];

export default function LoginPage() {
    const [email, setEmail] = useState(localStorage.getItem('rememberedEmail') || '');
    const [password, setPassword] = useState('');
    const [rememberMe, setRememberMe] = useState(localStorage.getItem('rememberMe') === 'true');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const { login, loginError } = useAuthStore();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        const success = await login(email, password, rememberMe);
        if (success) {
            navigate('/dashboard');
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-surface-950 relative overflow-hidden">
            {/* Animated background orbs */}
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary-500/20 rounded-full blur-3xl animate-pulse" />
                <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-accent-500/15 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary-600/5 rounded-full blur-3xl" />
            </div>

            {/* Grid pattern overlay */}
            <div className="absolute inset-0 opacity-[0.03]" style={{
                backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)',
                backgroundSize: '60px 60px'
            }} />

            <div className="relative w-full max-w-md mx-4">
                {/* Logo */}
                <div className="text-center mb-8">
                    <div className="w-16 h-16 rounded-2xl bg-primary-600 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-primary-500/30">
                        <Zap className="w-8 h-8 text-white" />
                    </div>
                    <h1 className="text-3xl font-bold text-white mb-1">Uacess</h1>
                    <p className="text-primary-100/80 text-xs font-bold uppercase tracking-wider mb-8">
                        Michael Okpara University Of Agriculture Umudike
                    </p>
                    <p className="text-surface-400 text-sm">Sign in to access your workspace</p>
                </div>

                {/* Card */}
                <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl">
                    {loginError && (
                        <div className="mb-4 p-3 bg-red-500/20 border border-red-500/50 rounded-lg text-red-200 text-sm">
                            {loginError}
                        </div>
                    )}
                    <form onSubmit={handleSubmit} className="space-y-5">
                        {/* Email */}
                        <div>
                            <label className="block text-sm font-medium text-surface-300 mb-1.5">Email</label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-surface-500" />
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full pl-11 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-surface-500 focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all"
                                    placeholder="you@example.com"
                                    required
                                />
                            </div>
                        </div>

                        {/* Password */}
                        <div>
                            <label className="block text-sm font-medium text-surface-300 mb-1.5">Password</label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-surface-500" />
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full pl-11 pr-12 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-surface-500 focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all"
                                    placeholder="••••••••"
                                    required
                                />
                                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-surface-500 hover:text-surface-300">
                                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                </button>
                            </div>
                        </div>

                        {/* Remember Me & Forgot Password */}
                        <div className="flex items-center justify-between">
                            <label className="flex items-center gap-2 cursor-pointer group">
                                <div className="relative">
                                    <input
                                        type="checkbox"
                                        checked={rememberMe}
                                        onChange={(e) => setRememberMe(e.target.checked)}
                                        className="sr-only peer"
                                    />
                                    <div className="w-5 h-5 border border-white/20 rounded-md bg-white/5 peer-checked:bg-primary-500 peer-checked:border-primary-500 transition-all flex items-center justify-center">
                                        <div className={`w-2 h-3 border-r-2 border-b-2 border-white rotate-45 mb-0.5 ${rememberMe ? 'opacity-100 scale-100' : 'opacity-0 scale-50'} transition-all`} />
                                    </div>
                                </div>
                                <span className="text-xs font-semibold text-surface-400 group-hover:text-surface-200 transition-colors">Remember me</span>
                            </label>
                            <button type="button" className="text-xs font-semibold text-primary-400 hover:text-primary-300 transition-colors">Forgot password?</button>
                        </div>

                        {/* Submit */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-3 bg-primary-600 hover:bg-primary-500 text-white font-semibold rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-primary-500/25 disabled:opacity-70">
                            {loading ? (
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                                <>Sign In <ArrowRight className="w-4 h-4" /></>
                            )}
                        </button>
                    </form>

                </div>

                <p className="mt-6 text-center text-xs text-surface-500">
                    Uacess PWA • v1.0.0
                </p>
            </div>
        </div>
    );
}
