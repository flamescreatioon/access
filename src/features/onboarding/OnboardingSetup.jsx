import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';
import { useOnboardingStore } from '../../stores/onboardingStore';
import {
    User, Smartphone, CheckCircle2, ArrowRight, ShieldCheck,
    GraduationCap, BookOpen, Lock, Info, Clock, XCircle,
    Building2, Layers
} from 'lucide-react';
import toast from 'react-hot-toast';

const OnboardingSetup = () => {
    const { user } = useAuthStore();
    const { status, fetchStatus, confirmDetails, selectRole, confirmPaymentContact } = useOnboardingStore();
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    // Form states
    const [name, setName] = useState('');
    const [department, setDepartment] = useState('');
    const [level, setLevel] = useState('');
    const [phone, setPhone] = useState('');

    useEffect(() => {
        const syncStatus = async () => {
            const data = await fetchStatus();
            if (data?.user) {
                const { updateUser } = useAuthStore.getState();
                updateUser(data.user);
            }
        };
        syncStatus();
    }, []);

    useEffect(() => {
        if (status) {
            setName(status.userName || user?.name || '');
            setPhone(status.userPhone || user?.phone || '');
            setDepartment(status.department || '');
            setLevel(status.level || '');
        }
    }, [status]);

    const handleConfirmDetails = async (e) => {
        e.preventDefault();
        if (!name.trim()) return toast.error('Name is required');
        if (!phone.trim()) return toast.error('Phone number is required');

        setLoading(true);
        const res = await confirmDetails({ name, department, level, phone });
        if (res.success) {
            toast.success('Details confirmed!');
        } else {
            toast.error(res.error);
        }
        setLoading(false);
    };

    const handleSelectRole = async (role) => {
        setLoading(true);
        const res = await selectRole(role);
        if (res.success) {
            toast.success(`Role set to ${role}`);
        } else {
            toast.error(res.error);
        }
        setLoading(false);
    };

    const handleConfirmContact = async () => {
        setLoading(true);
        const res = await confirmPaymentContact();
        if (res.success) {
            toast.success('Submitted! Awaiting admin confirmation.');
        } else {
            toast.error(res.error);
        }
        setLoading(false);
    };

    if (!status) return (
        <div className="flex items-center justify-center min-h-[50vh]">
            <div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
        </div>
    );

    const renderStep = () => {
        switch (status.nextStep) {
            case 'CONFIRM_DETAILS':
                return (
                    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="bg-white dark:bg-surface-800 p-8 rounded-[2.5rem] border border-surface-200 dark:border-surface-700 shadow-xl">
                            <div className="w-16 h-16 bg-primary-500/10 rounded-2xl flex items-center justify-center mb-6">
                                <User className="w-8 h-8 text-primary-500" />
                            </div>
                            <h2 className="text-3xl font-black mb-2">Confirm Your Details</h2>
                            <p className="text-surface-500 font-medium mb-8">Update your information so we can set up your account properly.</p>

                            <form onSubmit={handleConfirmDetails} className="space-y-5">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-surface-400 ml-1">Full Name</label>
                                    <div className="relative">
                                        <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-surface-400" />
                                        <input type="text" placeholder="Your full name" value={name}
                                            onChange={(e) => setName(e.target.value)}
                                            className="w-full pl-12 pr-4 py-4 bg-surface-50 dark:bg-surface-900 border border-surface-200 dark:border-surface-700 rounded-2xl font-bold focus:ring-2 focus:ring-primary-500 outline-none transition-all"
                                            required />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-surface-400 ml-1">Department</label>
                                        <div className="relative">
                                            <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-surface-400" />
                                            <input type="text" placeholder="e.g. Computer Science" value={department}
                                                onChange={(e) => setDepartment(e.target.value)}
                                                className="w-full pl-12 pr-4 py-4 bg-surface-50 dark:bg-surface-900 border border-surface-200 dark:border-surface-700 rounded-2xl font-bold focus:ring-2 focus:ring-primary-500 outline-none transition-all" />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-surface-400 ml-1">Level</label>
                                        <div className="relative">
                                            <Layers className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-surface-400" />
                                            <select value={level} onChange={(e) => setLevel(e.target.value)}
                                                className="w-full pl-12 pr-4 py-4 bg-surface-50 dark:bg-surface-900 border border-surface-200 dark:border-surface-700 rounded-2xl font-bold focus:ring-2 focus:ring-primary-500 outline-none transition-all appearance-none">
                                                <option value="">Select Level</option>
                                                <option value="100">100 Level</option>
                                                <option value="200">200 Level</option>
                                                <option value="300">300 Level</option>
                                                <option value="400">400 Level</option>
                                                <option value="500">500 Level</option>
                                                <option value="600">600 Level</option>
                                                <option value="PG">Postgraduate</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-surface-400 ml-1">Phone Number</label>
                                    <div className="relative">
                                        <Smartphone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-surface-400" />
                                        <input type="tel" placeholder="+234 ..." value={phone}
                                            onChange={(e) => setPhone(e.target.value)}
                                            className="w-full pl-12 pr-4 py-4 bg-surface-50 dark:bg-surface-900 border border-surface-200 dark:border-surface-700 rounded-2xl font-bold focus:ring-2 focus:ring-primary-500 outline-none transition-all"
                                            required />
                                    </div>
                                </div>

                                <button type="submit" disabled={loading}
                                    className="w-full py-4 bg-primary-500 text-white rounded-2xl font-black uppercase tracking-widest text-sm flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 shadow-lg shadow-primary-500/20">
                                    {loading ? 'Saving...' : 'Continue'}
                                    <ArrowRight className="w-4 h-4" />
                                </button>
                            </form>
                        </div>
                    </div>
                );

            case 'SELECT_ROLE':
                return (
                    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="bg-white dark:bg-surface-800 p-8 rounded-[2.5rem] border border-surface-200 dark:border-surface-700 shadow-xl text-center">
                            <div className="w-16 h-16 bg-primary-500/10 rounded-2xl flex items-center justify-center mb-6 mx-auto">
                                <ShieldCheck className="w-8 h-8 text-primary-500" />
                            </div>
                            <h2 className="text-3xl font-black mb-2">Select Your Role</h2>
                            <p className="text-surface-500 font-medium mb-8">Choose the role that best describes you.</p>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <button onClick={() => handleSelectRole('Student')} disabled={loading}
                                    className="group relative p-8 rounded-[2rem] border-2 border-surface-200 dark:border-surface-700 hover:border-primary-500 bg-surface-50 dark:bg-surface-900 transition-all duration-300 hover:shadow-xl hover:shadow-primary-500/10 hover:scale-[1.02] active:scale-[0.98]">
                                    <div className="w-16 h-16 bg-primary-500/10 rounded-2xl flex items-center justify-center mb-4 mx-auto group-hover:bg-primary-500/20 transition-colors">
                                        <GraduationCap className="w-8 h-8 text-primary-500" />
                                    </div>
                                    <h3 className="text-xl font-black mb-2">Student</h3>
                                    <p className="text-xs font-medium text-surface-400 leading-relaxed">
                                        Access coworking spaces, equipment, and community events.
                                    </p>
                                </button>

                                <button onClick={() => handleSelectRole('Lecturer')} disabled={loading}
                                    className="group relative p-8 rounded-[2rem] border-2 border-surface-200 dark:border-surface-700 hover:border-accent-500 bg-surface-50 dark:bg-surface-900 transition-all duration-300 hover:shadow-xl hover:shadow-accent-500/10 hover:scale-[1.02] active:scale-[0.98]">
                                    <div className="w-16 h-16 bg-accent-500/10 rounded-2xl flex items-center justify-center mb-4 mx-auto group-hover:bg-accent-500/20 transition-colors">
                                        <BookOpen className="w-8 h-8 text-accent-500" />
                                    </div>
                                    <h3 className="text-xl font-black mb-2">Lecturer / Researcher</h3>
                                    <p className="text-xs font-medium text-surface-400 leading-relaxed">
                                        Priority access to labs, studios, and research resources.
                                    </p>
                                </button>
                            </div>
                        </div>
                    </div>
                );

            case 'STUDENT_PAYMENT':
                return (
                    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="bg-white dark:bg-surface-800 p-8 rounded-[2.5rem] border border-surface-200 dark:border-surface-700 shadow-xl text-center">
                            <div className="w-16 h-16 bg-warning-500/10 rounded-2xl flex items-center justify-center mb-6 mx-auto">
                                <GraduationCap className="w-8 h-8 text-warning-500" />
                            </div>
                            <h2 className="text-3xl font-black mb-2">Student Community Plan</h2>

                            <div className="my-8 p-6 bg-surface-50 dark:bg-surface-900 rounded-3xl border border-surface-100 dark:border-surface-700 inline-block">
                                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-surface-400 mb-2">Community Due</p>
                                <p className="text-5xl font-black text-primary-500">₦1,500</p>
                            </div>

                            <div className="text-left max-w-sm mx-auto space-y-4 mb-8">
                                <p className="text-sm font-bold text-surface-600 dark:text-surface-300">To activate your student access:</p>
                                <div className="space-y-3">
                                    <div className="flex items-start gap-3">
                                        <div className="w-7 h-7 rounded-full bg-primary-500/10 flex items-center justify-center shrink-0 mt-0.5">
                                            <span className="text-xs font-black text-primary-500">1</span>
                                        </div>
                                        <p className="text-sm font-medium text-surface-500">Contact the <span className="font-bold text-surface-700 dark:text-surface-200">Hub Admin</span> for payment details</p>
                                    </div>
                                    <div className="flex items-start gap-3">
                                        <div className="w-7 h-7 rounded-full bg-primary-500/10 flex items-center justify-center shrink-0 mt-0.5">
                                            <span className="text-xs font-black text-primary-500">2</span>
                                        </div>
                                        <p className="text-sm font-medium text-surface-500">Complete your payment externally</p>
                                    </div>
                                    <div className="flex items-start gap-3">
                                        <div className="w-7 h-7 rounded-full bg-primary-500/10 flex items-center justify-center shrink-0 mt-0.5">
                                            <span className="text-xs font-black text-primary-500">3</span>
                                        </div>
                                        <p className="text-sm font-medium text-surface-500">Wait for admin confirmation</p>
                                    </div>
                                </div>
                            </div>

                            <button onClick={handleConfirmContact} disabled={loading}
                                className="w-full py-4 bg-primary-500 text-white rounded-2xl font-black uppercase tracking-widest text-sm flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 shadow-lg shadow-primary-500/20">
                                {loading ? 'Submitting...' : "I Have Contacted Admin"}
                                <ArrowRight className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                );

            case 'PAYMENT_REJECTED':
                return (
                    <div className="bg-white dark:bg-surface-800 p-10 rounded-[3rem] border border-danger-500/20 shadow-xl text-center">
                        <div className="w-20 h-20 bg-danger-500/10 rounded-3xl flex items-center justify-center mb-8 mx-auto">
                            <XCircle className="w-10 h-10 text-danger-500" />
                        </div>
                        <h2 className="text-3xl font-black mb-4 tracking-tighter text-danger-600 dark:text-danger-400">Payment Not Confirmed</h2>
                        <p className="text-surface-500 font-medium mb-6 max-w-sm mx-auto">
                            Your payment has not yet been confirmed. Please contact the Admin to resolve this.
                        </p>
                        <button onClick={handleConfirmContact} disabled={loading}
                            className="w-full py-4 bg-primary-500 text-white rounded-2xl font-black uppercase tracking-widest text-sm flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 shadow-lg shadow-primary-500/20">
                            {loading ? 'Submitting...' : "I Have Contacted Admin Again"}
                            <ArrowRight className="w-4 h-4" />
                        </button>
                    </div>
                );

            case 'LECTURER_WAITLIST':
                return (
                    <div className="bg-white dark:bg-surface-800 p-10 rounded-[3rem] border border-surface-200 dark:border-surface-700 shadow-xl text-center">
                        <div className="w-20 h-20 bg-accent-500/10 rounded-3xl flex items-center justify-center mb-8 mx-auto">
                            <BookOpen className="w-10 h-10 text-accent-500" />
                        </div>
                        <h2 className="text-3xl font-black mb-4 tracking-tighter">Lecturer Access — Coming Soon</h2>
                        <p className="text-surface-500 font-medium mb-10 max-w-sm mx-auto">
                            Lecturer access is currently being set up. You will be notified once your account is activated.
                        </p>
                        <div className="inline-flex items-center gap-2 px-6 py-3 bg-surface-50 dark:bg-surface-700 rounded-full text-xs font-black uppercase tracking-widest text-surface-400">
                            <Clock className="w-4 h-4" /> You're on the waitlist
                        </div>
                    </div>
                );

            case 'WAITING_ACTIVATION':
                return (
                    <div className="bg-white dark:bg-surface-800 p-10 rounded-[3rem] border border-surface-200 dark:border-surface-700 shadow-xl text-center">
                        <div className="w-20 h-20 bg-primary-500/10 rounded-3xl flex items-center justify-center mb-8 mx-auto">
                            <ShieldCheck className="w-10 h-10 text-primary-500 animate-pulse" />
                        </div>
                        <h2 className="text-3xl font-black mb-4 tracking-tighter">Awaiting Payment Verification</h2>
                        <p className="text-surface-500 font-medium mb-10 max-w-sm mx-auto">
                            Your account is awaiting payment verification. Access will be activated once the admin confirms your payment.
                        </p>
                        <div className="flex flex-col gap-4 items-center">
                            <button onClick={() => {
                                setLoading(true);
                                fetchStatus().then(data => {
                                    if (data?.user) {
                                        const { updateUser } = useAuthStore.getState();
                                        updateUser(data.user);
                                        toast.success('Status updated');
                                    }
                                    setLoading(false);
                                });
                            }} disabled={loading}
                                className="px-8 py-3 bg-primary-500 text-white rounded-2xl font-black uppercase tracking-widest text-sm shadow-lg shadow-primary-500/20 disabled:opacity-50">
                                {loading ? 'Checking...' : 'Check Status Now'}
                            </button>
                            <div className="inline-flex items-center gap-2 px-6 py-3 bg-surface-50 dark:bg-surface-700 rounded-full text-xs font-black uppercase tracking-widest text-surface-400">
                                <Clock className="w-4 h-4" /> Please allow the admin time to verify
                            </div>
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
                            Your account is now fully activated. You can now book spaces, access equipment, and use all hub facilities.
                        </p>
                        <button onClick={() => navigate('/dashboard')}
                            className="w-full py-4 bg-success-500 text-white rounded-2xl font-black uppercase tracking-widest text-sm shadow-lg shadow-success-500/20">
                            Enter Dashboard 🚀
                        </button>
                    </div>
                );

            default:
                return (
                    <div className="text-center py-20">
                        <div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
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
                    {status.role && <><span>Role: {status.role}</span><span className="w-1 h-1 bg-surface-300 rounded-full" /></>}
                    <span>Progress: {status.completion}%</span>
                </div>

                {/* Progress bar */}
                <div className="mt-4 w-full bg-surface-100 dark:bg-surface-700 rounded-full h-2 overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-primary-500 to-accent-500 rounded-full transition-all duration-700"
                        style={{ width: `${status.completion}%` }} />
                </div>
            </header>

            {renderStep()}
        </div>
    );
};

export default OnboardingSetup;
